# askimate.com — coming soon

The countdown page served at https://askimate.com until AskiMate launches (1 March 2027).

- Plain HTML, CSS and JavaScript; no build step. Hosted on GitHub Pages (`CNAME` holds the domain).
- The waitlist form posts to a Google Apps Script web app that saves each email in the
  "AskiMate waitlist" Google Sheet. `waitlist-apps-script.gs` is a copy of that script, kept here
  for reference; the live copy is the one bound to the sheet.

Moved off Replit on 25 November 2026. The Replit version (React + Express + Postgres) is kept as a
backup outside this repository.
