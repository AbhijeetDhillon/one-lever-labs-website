const workbookConsentVersion = 'v1';

function checkWorkbookSetup() {
  const settings = workbookSettings_();
  workbookFields_(settings.formId);
  workbookAttachment_(settings.fileId);
  return { allowedOrigins: settings.origins, dailyEmailRemaining: MailApp.getRemainingDailyQuota() };
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
  if (email.length > 254 || !/^[a-z0-9][a-z0-9.!#$%&'*+/=?^_\x60{|}~-]*@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(email)
      || !['gym', 'home'].includes(equipment) || !['yes', 'no'].includes(optIn)) {
    return workbookReply_(origin, nonce, 'invalid');
  }

  const fingerprint = Utilities.base64EncodeWebSafe(Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256, [email.toLowerCase(), equipment, optIn].join('|')
  ));
  const key = 'workbook:' + fingerprint;
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return workbookReply_(origin, nonce, 'busy');
  try {
    const cache = CacheService.getScriptCache();
    const previous = cache.get(key);
    if (previous === 'sent') return workbookReply_(origin, nonce, 'sent');

    const properties = PropertiesService.getScriptProperties();
    const today = new Date().toISOString().slice(0, 10);
    const dayUsage = JSON.parse(properties.getProperty('WORKBOOK_DAILY_USAGE') || '{}');
    const used = dayUsage.date === today ? dayUsage.count : 0;
    if (used >= 75 || MailApp.getRemainingDailyQuota() < 1) return workbookReply_(origin, nonce, 'busy');

    const attachment = workbookAttachment_(settings.fileId);
    if (previous !== 'recorded') {
      const { form, fields } = workbookFields_(settings.formId);
      const response = form.createResponse()
        .withItemResponse(fields.email.createResponse(email))
        .withItemResponse(fields.equipment.createResponse(equipment === 'gym' ? 'Gym' : 'Home'))
        .withItemResponse(fields.source.createResponse('workout-plan'))
        .withItemResponse(fields.optIn.createResponse(optIn === 'yes' ? 'Yes' : 'No'));
      if (fields.consentVersion) response.withItemResponse(fields.consentVersion.createResponse(workbookConsentVersion));
      response.submit();
      cache.put(key, 'recorded', 600);
    }

    properties.setProperty('WORKBOOK_DAILY_USAGE', JSON.stringify({ date: today, count: used + 1 }));
    MailApp.sendEmail({
      to: email,
      subject: 'Your free workout workbook',
      body: [
        'Here is the workout workbook you requested. It includes Gym and Home plans, exercise alternatives, and space to track your training.',
        'The workout plan is adapted from the exercise protocol in Andrew Huberman’s book, Protocols: An Operating Manual for the Human Body. I highly recommend the book for a deeper look at the exercises and the reasoning behind the program.',
        'Read more about Protocols: https://www.hubermanlab.com/protocols-book',
        'One Lever Labs'
      ].join('\n\n'),
      name: 'One Lever Labs',
      attachments: [attachment]
    });
    cache.put(key, 'sent', 600);
    return workbookReply_(origin, nonce, 'sent');
  } catch (error) {
    console.error('Workbook request could not be fulfilled.');
    return workbookReply_(origin, nonce, 'unavailable');
  } finally {
    lock.releaseLock();
  }
}

function workbookSettings_() {
  const properties = PropertiesService.getScriptProperties();
  const formId = properties.getProperty('WORKBOOK_FORM_ID');
  const fileId = properties.getProperty('WORKBOOK_FILE_ID');
  const origins = (properties.getProperty('WORKBOOK_ORIGINS') || '').split(',').map(value => value.trim()).filter(Boolean);
  if (!formId || !fileId || !origins.length || origins.some(value => !/^https?:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(value))) {
    throw new Error('Set WORKBOOK_FORM_ID, WORKBOOK_FILE_ID, and WORKBOOK_ORIGINS in Script Properties.');
  }
  return { formId, fileId, origins };
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

function workbookAttachment_(fileId) {
  const file = DriveApp.getFileById(fileId);
  if (!/\.xlsx$/i.test(file.getName())) throw new Error('Upload the Excel workbook as an .xlsx file.');
  return file.getBlob().setName('oll-weekly-workout-workbook.xlsx');
}

function workbookReply_(origin, nonce, status) {
  const result = { channel: 'oll-workbook', nonce, status };
  return HtmlService.createHtmlOutput('<script>window.top.postMessage(' + JSON.stringify(result) + ',' + JSON.stringify(origin) + ');</script>')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
