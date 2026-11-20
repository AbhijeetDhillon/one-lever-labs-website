# Activate workbook delivery

The workout page collects the email address. Gym or Home comes from the plan selector. Google stores the request in the existing OLL form, and the script emails the same Excel workbook with all exercise options. The visitor stays on the workout page. Workbook requests record No for marketing consent. The homepage updates signup is separate.

1. Sign in to the Google account that owns the OLL workout form. Upload `oll-weekly-workout-workbook.xlsx` to that account’s Google Drive as an Excel file. Copy its Drive file ID, the segment after `/d/` in the file URL.
2. Open [Apps Script](https://script.google.com/) under that account, create a project, and paste `workbook-delivery.gs` into `Code.gs`. It expects `Email Id`, `Equipment preference`, `Source`, and `Marketing opt-in` with their existing question types and options. An optional short-answer question named `Consent version` receives `v1`.
3. In **Project Settings → Script properties**, set `WORKBOOK_FORM_ID` to the form ID between `/forms/d/` and `/edit` in the editor URL. Set `WORKBOOK_FILE_ID` to the Drive file ID. Set `WORKBOOK_ORIGINS` to the exact public website origin, without a path or a trailing slash. Separate additional approved origins with commas. For a local test, add the exact server origin, such as `http://localhost:8766`.
4. Run `checkWorkbookSetup` in the script editor and authorize the requested Forms, Drive, and email access. This check opens the form and workbook and checks the email quota without sending an email. Under **Deploy → New deployment → Web app**, choose **Execute as me** and access for **Anyone**, so visitors can use it without signing in to Google. Copy the production `/exec` URL.
5. Set `trackerRequestEndpoint` in `dist/oll-config.js` to the `/exec` URL and publish the static site. Use the workout page over HTTP or HTTPS for the test. The file preview does not have an origin for the delivery response.

Submit a test using an inbox you control. Verify the website’s confirmation, the email attachment, and the Form Responses entry for email, `workout-plan`, Gym or Home, and No. If a linked spreadsheet is needed, choose **Responses → Link to Sheets** in Google Forms. The same form request is deduplicated for ten minutes on a best-effort basis. The sender caps delivery attempts at 75 per UTC day and also checks the Google account’s remaining quota.

Use responses with a `Yes` marketing opt-in to build the marketing audience, and use a mailing platform to manage confirmation and unsubscribe requests. Workbook delivery is sent to everyone who requests it, regardless of their opt-in.

[Google Apps Script web app deployment](https://developers.google.com/apps-script/guides/web)
