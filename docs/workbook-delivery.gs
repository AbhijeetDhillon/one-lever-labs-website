const workbookConsentVersion = 'v1';
const workbookDailyLimit = 75;

function checkWorkbookSetup() {
  const settings = workbookSettings_();
  workbookFields_(settings.formId);
  workbookAttachment_(settings.fileIds.gym, 'gym');
  workbookAttachment_(settings.fileIds.home, 'home');
  return { allowedOrigins: settings.origins, dailyEmailLimit: workbookDailyLimit };
}

function doPost(event) {
  const input = event && event.parameter || {};
  const origin = String(input.parentOrigin || '');
  const nonce = String(input.nonce || '');
  let settings;
  try {
    settings = workbookSettings_();
  } catch (error) {
    console.error('Workbook delivery settings are incomplete.');
    return HtmlService.createHtmlOutput('Workbook delivery is unavailable.');
  }
  if (!settings.origins.includes(origin) || !/^[a-f0-9]{32}$/.test(nonce)) {
    return HtmlService.createHtmlOutput('Invalid workbook request.');
  }

  const email = String(input.email || '').trim();
  const equipment = input.equipment;
  const optIn = input.marketingOptIn;
  const download = input.delivery === 'download';
  const emailCopy = input.delivery === 'email-copy';
  if (email.length > 254 || !/^[a-z0-9][a-z0-9.!#$%&'*+/=?^_\x60{|}~-]*@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(email)
      || !['gym', 'home'].includes(equipment) || !['yes', 'no'].includes(optIn)) {
    return workbookReply_(origin, nonce, 'invalid');
  }

  const fingerprint = Utilities.base64EncodeWebSafe(Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256, [email.toLowerCase(), equipment, optIn].join('|')
  ));
  const key = 'workbook:' + fingerprint;
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    console.warn('Workbook delivery was busy waiting for the request lock.');
    return workbookReply_(origin, nonce, 'busy');
  }
  let stage = 'check delivery limits';
  let deliveryAttempt;
  try {
    const cache = CacheService.getScriptCache();
    const previous = cache.get(key);
    if (!download && previous === 'sent') {
      console.info('Workbook email was already accepted for this request.');
      return workbookReply_(origin, nonce, 'sent');
    }
    if (emailCopy && previous !== 'recorded') return workbookReply_(origin, nonce, 'unavailable');

    const properties = PropertiesService.getScriptProperties();
    const today = new Date().toISOString().slice(0, 10);
    const usageKey = download ? 'WORKBOOK_DAILY_DOWNLOAD_USAGE' : 'WORKBOOK_DAILY_USAGE';
    const dayUsage = JSON.parse(properties.getProperty(usageKey) || '{}');
    const used = dayUsage.date === today ? dayUsage.count : 0;
    if (used >= workbookDailyLimit && (!download || !previous)) {
      console.warn('Workbook delivery reached its daily limit.');
      return workbookReply_(origin, nonce, 'busy');
    }

    const planName = equipment === 'gym' ? 'Gym' : 'Home';
    stage = 'read the workbook from Drive';
    const attachment = workbookAttachment_(settings.fileIds[equipment], equipment);
    if (!previous) {
      if (download) {
        stage = 'update the download count';
        properties.setProperty(usageKey, JSON.stringify({ date: today, count: used + 1 }));
      }
      stage = 'save the Google Forms response';
      const { form, fields } = workbookFields_(settings.formId);
      const response = form.createResponse()
        .withItemResponse(fields.email.createResponse(email))
        .withItemResponse(fields.equipment.createResponse(planName))
        .withItemResponse(fields.source.createResponse('workout-plan'))
        .withItemResponse(fields.optIn.createResponse(optIn === 'yes' ? 'Yes' : 'No'));
      if (fields.consentVersion) response.withItemResponse(fields.consentVersion.createResponse(workbookConsentVersion));
      response.submit();
      cache.put(key, 'recorded', 600);
    }

    if (download) {
      stage = 'prepare the workbook download';
      return workbookReply_(origin, nonce, 'ready', Utilities.base64Encode(attachment.getBytes()));
    }

    stage = 'update the daily send count';
    properties.setProperty(usageKey, JSON.stringify({ date: today, count: used + 1 }));
    stage = 'send the email through Gmail';
    deliveryAttempt = { at: new Date().toISOString(), plan: planName, outcome: 'failed' };
    sendWorkbookEmail_(email, planName, attachment);
    deliveryAttempt.outcome = 'accepted';
    stage = 'cache the successful send';
    cache.put(key, 'sent', 600);
    return workbookReply_(origin, nonce, 'sent');
  } catch (error) {
    const message = String(error.message || error);
    let detail = '';
    if (/authoriz|permission|scope/i.test(message)) detail = ' Google reported a permissions error.';
    else if (/quota|limit|too many times/i.test(message)) detail = ' Google reported a service limit.';
    else if (/attachment|blob/i.test(message)) detail = ' Google reported an attachment error.';
    if (deliveryAttempt?.outcome === 'failed' && detail) deliveryAttempt.detail = detail.trim();
    console.error(`Workbook request failed at the step to ${stage}.${detail}`);
    return workbookReply_(origin, nonce, 'unavailable');
  } finally {
    if (deliveryAttempt) recordWorkbookDelivery_(deliveryAttempt);
    lock.releaseLock();
  }
}

function recordWorkbookDelivery_(attempt) {
  try {
    PropertiesService.getScriptProperties().setProperty('WORKBOOK_LAST_DELIVERY', JSON.stringify(attempt));
  } catch {
    console.warn('The last workbook delivery result could not be saved.');
  }
}

function sendWorkbookEmail_(email, planName, attachment) {
  const intro = `Your 12-week ${planName} workout workbook is attached.`;
  const credit = 'Adapted from Andrew Huberman’s';
  const book = 'Protocols';
  const company = 'One Lever Labs';
  const body = `${intro}\n\n${credit} ${book}.\n\n${company}`;
  const html = `<p>${intro}</p><p>${credit} <a href="https://www.hubermanlab.com/protocols-book">${book}</a>.</p><p>${company}</p>`;
  const mixed = 'workbook-' + Utilities.getUuid();
  const alternative = 'body-' + Utilities.getUuid();
  const message = [
    `From: Abhijeet from ${company} <abhijeet@oneleverlabs.com>`,
    `To: ${email}`,
    `Subject: Your free 12-week ${planName} workout workbook`,
    'Date: ' + new Date().toUTCString().replace('GMT', '+0000'),
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${mixed}"`,
    '',
    `--${mixed}`,
    `Content-Type: multipart/alternative; boundary="${alternative}"`,
    '',
    `--${alternative}`,
    workbookMailPart_('text/plain; charset=UTF-8', Utilities.newBlob(body).getBytes()),
    `--${alternative}`,
    workbookMailPart_('text/html; charset=UTF-8', Utilities.newBlob(html).getBytes()),
    `--${alternative}--`,
    `--${mixed}`,
    workbookMailPart_('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', attachment.getBytes(), [
      `Content-Disposition: attachment; filename="${attachment.getName()}"`
    ]),
    `--${mixed}--`,
    ''
  ].join('\r\n');
  Gmail.Users.Messages.send({ raw: Utilities.base64EncodeWebSafe(message) }, 'me');
  console.info(`Gmail accepted the ${planName} workbook email for sending.`);
}

function workbookMailPart_(contentType, bytes, headers = []) {
  const encoded = Utilities.base64Encode(bytes);
  return [
    `Content-Type: ${contentType}`,
    'Content-Transfer-Encoding: base64',
    ...headers,
    '',
    ...(encoded.match(/.{1,76}/g) || [])
  ].join('\r\n');
}

function workbookSettings_() {
  const properties = PropertiesService.getScriptProperties();
  const formId = properties.getProperty('WORKBOOK_FORM_ID');
  const fileIds = {
    gym: properties.getProperty('WORKBOOK_GYM_FILE_ID'),
    home: properties.getProperty('WORKBOOK_HOME_FILE_ID')
  };
  const origins = (properties.getProperty('WORKBOOK_ORIGINS') || '').split(',').map(value => value.trim()).filter(Boolean);
  if (!formId || !fileIds.gym || !fileIds.home || fileIds.gym === fileIds.home
      || !origins.length || origins.some(value => !/^https?:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(value))) {
    throw new Error('Set WORKBOOK_FORM_ID, distinct WORKBOOK_GYM_FILE_ID and WORKBOOK_HOME_FILE_ID values, and WORKBOOK_ORIGINS.');
  }
  return { formId, fileIds, origins };
}

function workbookFields_(formId) {
  const form = FormApp.openById(formId);
  const items = new Map(form.getItems().map(item => [item.getTitle(), item]));
  const fields = {
    email: items.get('Email Id').asTextItem(),
    equipment: items.get('Equipment preference').asMultipleChoiceItem(),
    source: items.get('Source').asTextItem(),
    optIn: items.get('Marketing opt-in').asMultipleChoiceItem(),
    consentVersion: items.get('Consent version')?.asTextItem()
  };
  if (!form.isAcceptingResponses()) throw new Error('The Google Form is not accepting responses.');
  for (const [field, expected] of [[fields.equipment, ['Gym', 'Home']], [fields.optIn, ['Yes', 'No']]]) {
    if (!expected.every(value => field.getChoices().some(choice => choice.getValue() === value))) {
      throw new Error('The Google Form choices do not match the website.');
    }
  }
  return { form, fields };
}

function workbookAttachment_(fileId, equipment) {
  const file = DriveApp.getFileById(fileId);
  const filename = `oll-12-week-workout-${equipment}.xlsx`;
  if (file.getName() !== filename) throw new Error(`Expected the Drive file named ${filename}.`);
  return file.getBlob().setName(filename);
}

function workbookReply_(origin, nonce, status, workbook) {
  const result = { channel: 'oll-workbook', nonce, status };
  if (workbook) result.workbook = workbook;
  return HtmlService.createHtmlOutput('<script>window.top.postMessage(' + JSON.stringify(result) + ',' + JSON.stringify(origin) + ');</script>')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
