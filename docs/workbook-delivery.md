# Activate workbook delivery

The workout page saves the request in the existing OLL form and presents the matching 12-week Gym or Home workbook on the same page. It also requests an email copy in the background. Both editions have one sheet with twelve weeks, a frozen exercise column, and weekly exercise alternatives. Workbook requests record No for marketing consent.

1. Sign in to the Google account that owns the OLL workout form. Upload `oll-12-week-workout-gym.xlsx` and `oll-12-week-workout-home.xlsx` to Drive as Excel files, preserving both filenames. Copy each Drive file ID, the segment after `/d/` in its file URL.
2. Open [Apps Script](https://script.google.com/) under that account, create a project, and paste `workbook-delivery.gs` into `Code.gs`. It expects `Email Id`, `Equipment preference`, `Source`, and `Marketing opt-in` with their existing question types and options. An optional short-answer question named `Consent version` receives `v1`.
3. In **Project Settings → Script properties**, set `WORKBOOK_FORM_ID` to the form ID between `/forms/d/` and `/edit` in the editor URL. Set `WORKBOOK_GYM_FILE_ID` and `WORKBOOK_HOME_FILE_ID` to the matching Drive file IDs. These replace `WORKBOOK_FILE_ID`. Set `WORKBOOK_ORIGINS` to the exact public website origin, without a path or a trailing slash. Separate additional approved origins with commas. For a local test, add the exact server origin, such as `http://localhost:8766`.
4. Run `checkWorkbookSetup` in the script editor and authorize the requested Forms, Drive, and email access. The check opens both workbooks and checks the email quota without sending an email. For a first deployment, go to **Deploy → New deployment → Web app**, select **Execute as me** and access for **Anyone**, and copy the `/exec` URL. If the web app already exists, go to **Deploy → Manage deployments**, edit the existing deployment, and deploy a **New version** to keep the same `/exec` URL.
5. Set `trackerRequestEndpoint` in `dist/oll-config.js` to the `/exec` URL and publish the static site. Use the workout page over HTTP or HTTPS for the test. The file preview does not have an origin for the delivery response.

Submit a Gym request and a Home request using an inbox you control. Open each downloaded workbook and check that the Form Responses entries record the selected plan, `workout-plan`, and No. If email copies arrive, verify that each contains the matching attachment. If the website only asks you to check your inbox, deploy the current Apps Script code to enable on-page downloads. If a linked spreadsheet is needed, choose **Responses → Link to Sheets** in Google Forms. The script deduplicates matching requests for ten minutes on a best-effort basis. It caps new download requests and email attempts separately at 75 per UTC day and checks the Google account’s remaining email quota before sending.

If a response appears in Forms without an email, open **Executions** in Apps Script and expand the matching `doPost` run. The logs distinguish a send accepted by MailApp, a repeat request, a sending limit, and the step where a request failed. An accepted send can still be filtered or rejected by the recipient's mail provider. Check the recipient's Spam folder and the sender's mailbox for a delivery failure notice.

The editor runs the saved source. The public `/exec` URL runs the version selected in **Manage deployments**. After updating `Code.gs`, edit the existing web app deployment and select **New version** to make the latest logs available to website requests. Submit one request with an address and plan combination you have not tested in the past ten minutes.

If Cloud logs are disabled, open **Project Settings → Script properties** after the fresh request and look for `WORKBOOK_LAST_DELIVERY`. The current script creates this property after a website send attempt and overwrites it on the next attempt. It stores the timestamp, plan and outcome. `accepted` means MailApp returned successfully, while `failed` means MailApp raised an error. Compare the timestamp with your test. Receiving the email is the inbox delivery check.

If MailApp accepts the website request and the email remains missing, compare it with the exact same email sent from the editor. Temporarily add the function below after deploying the current version. Replace the placeholder with an inbox you control, run the function from the editor, and remove it from the editor afterward.

```javascript
function testProductionWorkbookEmail() {
  const to = 'YOUR_EMAIL_HERE';
  const attachment = workbookAttachment_(workbookSettings_().fileIds.gym, 'gym');
  sendWorkbookEmail_(to, 'Gym', attachment);
}
```

Use responses with a `Yes` marketing opt-in to build the marketing audience, and use a mailing platform to manage confirmation and unsubscribe requests. Workbook access is independent of marketing consent.

[Google Apps Script web app deployment](https://developers.google.com/apps-script/guides/web)
