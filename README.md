# Bearing — deploy to Netlify

This folder is a complete static site: one `index.html`, no build step, no dependencies.

## Deploy in under a minute

**Option A — drag and drop (no account setup needed beyond signing in)**
1. Go to https://app.netlify.com/drop
2. Drag this whole folder onto the page.
3. Netlify gives you a live URL immediately (e.g. `random-name-123.netlify.app`).

**Option B — Netlify CLI**
```
npm install -g netlify-cli
cd bearing-site
netlify deploy --prod
```

**Option C — Git-based deploy**
1. Push this folder to a GitHub/GitLab repo.
2. In Netlify: "Add new site" → "Import an existing project" → pick the repo.
3. Build command: leave blank. Publish directory: `.` (this folder's root).

## After deploying
- You can rename the site and add a custom domain from the Netlify site settings.
- Everything the tool stores (searches, leads, settings) lives in each visitor's own browser (localStorage) — there is no backend and no shared database. Data does not sync between devices or visitors.
- To reset the look, edit the CSS variables near the top of `index.html` (`--accent`, `--bg`, etc.).

## Files
- `index.html` — the entire app
- `netlify.toml` — deploy config (publish directory, basic security headers, SPA redirect)
