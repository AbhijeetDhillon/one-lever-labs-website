# Activate workbook delivery

The workout page collects the email address and uses the Gym or Home plan selection to choose the matching 30-day Excel workbook. Both editions contain Week 1–5 tabs and exercise alternatives. Google stores the request in the existing OLL form. The visitor stays on the workout page, and workbook requests record No for marketing consent.

1. Sign in to the Google account that owns the OLL workout form. Upload `oll-30-day-workout-gym.xlsx` and `oll-30-day-workout-home.xlsx` to Drive as Excel files, preserving both filenames. Copy each Drive file ID, the segment after `/d/` in its file URL.
2. Open [Apps Script](https://script.google.com/) under that account, create a project, and paste `workbook-delivery.gs` into `Code.gs`. It expects `Email Id`, `Equipment preference`, `Source`, and `Marketing opt-in` with their existing question types and options. An optional short-answer question named `Consent version` receives `v1`.
3. In **Project Settings → Script properties**, set `WORKBOOK_FORM_ID` to the form ID between `/forms/d/` and `/edit` in the editor URL. Set `WORKBOOK_GYM_FILE_ID` and `WORKBOOK_HOME_FILE_ID` to the matching Drive file IDs. These replace `WORKBOOK_FILE_ID`. Set `WORKBOOK_ORIGINS` to the exact public website origin, without a path or a trailing slash. Separate additional approved origins with commas. For a local test, add the exact server origin, such as `http://localhost:8766`.
4. Run `checkWorkbookSetup` in the script editor and authorize the requested Forms, Drive, and email access. The check opens both workbooks and checks the email quota without sending an email. For a first deployment, go to **Deploy → New deployment → Web app**, select **Execute as me** and access for **Anyone**, and copy the `/exec` URL. If the web app already exists, go to **Deploy → Manage deployments**, edit the existing deployment, and deploy a **New version** to keep the same `/exec` URL.
5. Set `trackerRequestEndpoint` in `dist/oll-config.js` to the `/exec` URL and publish the static site. Use the workout page over HTTP or HTTPS for the test. The file preview does not have an origin for the delivery response.

Submit a Gym request and a Home request using an inbox you control. Verify that each email contains the matching attachment, and check that the Form Responses entries record the selected plan, `workout-plan`, and No. If a linked spreadsheet is needed, choose **Responses → Link to Sheets** in Google Forms. The same form request is deduplicated for ten minutes on a best-effort basis. The sender caps delivery attempts at 75 per UTC day and also checks the Google account’s remaining quota.

Use responses with a `Yes` marketing opt-in to build the marketing audience, and use a mailing platform to manage confirmation and unsubscribe requests. Workbook delivery is sent to everyone who requests it, regardless of their opt-in.

[Google Apps Script web app deployment](https://developers.google.com/apps-script/guides/web)
