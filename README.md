# One Lever Labs

A responsive static company website built with HTML, CSS, and a small JavaScript file. Company contact: abhijeet@oneleverlabs.com.

## Preview

Open `dist/index.html` directly in your browser. No server, installation, or build step is needed.

## Deployment

The complete frontend is in `dist/`: HTML, CSS, JavaScript, and an SVG favicon. It uses system fonts and local assets with no external requests, backend, or dependencies. Contact links open the visitor's email application.

## OLL Workout Plan

Open `dist/tools/workout.html` through the site or a local static HTTP server. Requests receive the matching 30-day Gym or Home workbook. Each workbook has five week tabs and the same exercise options as the site. See [Workbook delivery](docs/workbook-delivery.md) for configuring `trackerRequestEndpoint` and testing the onsite email flow.

Set the public URLs in `dist/oll-config.js` to connect owner-facing services:

- `analyticsEndpoint` receives a beacon POST containing JSON with `event` and `source` only. The receiver should accept a text/plain request body and validate the event and source against the allowlist. Analytics starts after the visitor enables it.
- `signupEndpoint` receives a JSON POST with `email`, `source` and `consent`. Return a 2xx response only after accepting the request and initiating double opt-in. Keep the email provider credential server-side, enable duplicate handling and rate limiting, and allow the OLL website origin if hosted separately. With no endpoint, the form opens a draft addressed to OLL for manual handling.

Configure and test both services on the production origin before using their dashboards or sending launch announcements.
