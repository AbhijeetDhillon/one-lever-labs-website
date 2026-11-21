# One Lever Labs

A responsive static company website built with HTML, CSS, and a small JavaScript file. Company contact: abhijeet@oneleverlabs.com.

## Preview

Open `dist/index.html` directly in your browser. No server, installation, or build step is needed.

## Deployment

Cloudflare Pages serves the frontend in `dist/` and runs the signup endpoint in `functions/`. The website uses bundled fonts and local assets. Contact links open the visitor's email application.

## OLL Workout Plan

Open `dist/tools/workout.html` through the site or a local static HTTP server. Requests receive the matching 12-week Gym or Home workbook. Each workbook has one sheet and the same exercise options as the site. See [Workbook delivery](docs/workbook-delivery.md) for configuring `trackerRequestEndpoint` and testing the onsite email flow.

Set the public URLs in `dist/oll-config.js` to connect owner-facing services:

- `analyticsEndpoint` receives a beacon POST containing JSON with `event` and `source` only. The receiver should accept a text/plain request body and validate the event and source against the allowlist. Analytics starts after the visitor enables it.
- `signupEndpoint` points to `/api/updates`, which saves the email in the OLL Google Form. Update the field mapping and confirmation text in `functions/api/updates.js` if the form changes.

Configure and test both services on the production origin before using their dashboards or sending launch announcements.
