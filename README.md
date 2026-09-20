# Bearing — static LinkedIn workflow app

This project is a lightweight static site for generating LinkedIn search links, drafting outreach messages, and tracking leads in-browser.

## Project structure

- `index.html` — app shell
- `css/style.css` — visual design and responsive layout
- `js/script.js` — app logic and local lead tracking
- `assets/` — images, icons, and screenshots
- `docs/` — product, technical, deployment, roadmap, and acquisition notes
- `demo/` — demo walkthrough materials
- `netlify.toml` — Netlify deploy configuration
- `LICENSE` — MIT license

## Deploy in under a minute

**Option A — drag and drop**
1. Go to https://app.netlify.com/drop
2. Drag this whole folder onto the page.
3. Netlify gives you a live URL immediately.

**Option B — Netlify CLI**
```bash
npm install -g netlify-cli
cd bearing-site
netlify deploy --prod
```

**Option C — Git-based deploy**
1. Push this folder to a GitHub/GitLab repo.
2. In Netlify: "Add new site" → "Import an existing project".
3. Leave the build command blank and set publish directory to `.`.

## Notes
- All stored data lives in the visitor's browser (`localStorage`) and does not sync between devices.
- The app opens LinkedIn's native search pages; it does not log in or automate accounts.
- To adjust theme or accent styling, edit the CSS variables in `css/style.css`.
