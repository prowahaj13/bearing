# Bearing — static LinkedIn workflow app with a Pro tier

A lightweight, mostly client-side web app for LinkedIn outreach: it builds
targeted search links, drafts messages, and tracks leads locally in the
browser. A one-time-purchase Pro tier unlocks extra message templates and
a detailed CSV export, gated by a Lemon Squeezy license key verified
through a small Netlify serverless function.

**Live site:** https://bearing-ok.netlify.app/

## Architecture

```
index.html            → page structure, references css/style.css and js/script.js
css/style.css          → all styling (forced light/dark contrast — no OS-dependent invisible text)
js/script.js           → search builder, lead parser/scoring, Pro/license logic
netlify/functions/
  verify-license.js    → proxies Lemon Squeezy's license validation API server-side
netlify.toml           → Netlify build + functions config
docs/
  MONETIZATION.md      → step-by-step Lemon Squeezy + GA4 setup (requires your own accounts)
  LISTING-DRAFT.md      → marketplace listing template with explicit placeholders, not fake numbers
  VIDEO-SCRIPT.md       → beats for a Loom walkthrough you record yourself
```

Everything except the license check runs entirely in the browser — no
database, no user accounts, no backend beyond the one serverless function.
This keeps hosting free-tier-friendly and the codebase small enough for a
new owner to understand quickly.

## Features

- **Targeted search builder** — generates LinkedIn people/jobs/companies/posts/groups search links for a chosen goal, category, role, and location.
- **Outreach message templates** — 1 free template, 4 more unlocked by Pro.
- **In-browser lead tracker** — paste or type leads (`Name - Title at Company, City` or pipe/comma-delimited), auto-parses name/title/company/location, scores by seniority, tracks status through a simple pipeline.
- **CSV export** — free basic export; detailed export (adds score, seniority, timestamps) is a Pro feature.
- **Pro tier** — one-time license purchase via Lemon Squeezy, verified server-side via a Netlify Function so no API key is ever exposed in the browser.
- **Customization & backup** — accent color, light/dark theme, full local JSON backup/restore.

## Tech stack

- HTML5 / CSS3 / vanilla JavaScript (ES6+) — no build step, no framework
- `localStorage` for all user data (private per browser, does not sync)
- Netlify Functions (Node) for the one server-side call this app makes

## Quick deploy

1. Push this repo to GitHub (or use it as-is).
2. In Netlify: "Add new site" → "Import an existing project" → select the repo.
   Build command: none. Publish directory: `.` (repo root).
   Netlify auto-detects `netlify/functions/` from `netlify.toml`.
3. To enable Pro, follow `docs/MONETIZATION.md` — it requires your own free
   Lemon Squeezy and Google Analytics accounts; nothing in this repo can
   fake that setup for you.

## Notes

- **Privacy first:** all stored data lives in the visitor's browser only.
- **No automation:** the app opens LinkedIn's native search pages; it never logs in, scrapes, or automates a LinkedIn account.
- **Styling:** theme/accent variables live at the top of `css/style.css`.
- **License:** MIT (see `LICENSE`) — note that MIT allows reuse by others regardless of any future sale, so if you plan to sell exclusive rights, decide on relicensing terms before listing it.

## Selling this project

`docs/LISTING-DRAFT.md` has a marketplace listing template and a
pre-listing checklist. It deliberately leaves traffic and revenue numbers
as placeholders — those have to come from your real GA4 and Lemon Squeezy
dashboards, since Acquire.com and Flippa both check these against the
actual accounts.
