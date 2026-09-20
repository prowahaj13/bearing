# Deployment Guide

## Recommended hosting

This project is designed to be deployed as a static site on Netlify.

## Option 1: drag and drop

1. Visit https://app.netlify.com/drop
2. Drag this folder to the site uploader.
3. Netlify will publish it automatically.

## Option 2: CLI

```bash
npm install -g netlify-cli
cd bearing-site
netlify deploy --prod
```

## Option 3: Git-based deployment

1. Push this folder to a Git repository.
2. Import the repo into Netlify.
3. Leave the build command blank.
4. Set the publish directory to the project root for this folder.

## Configuration Notes

The included netlify.toml file ensures:

- publish directory is the project root
- browser security headers are set
- SPA fallback redirects are enabled for direct routes

## Post-deploy checklist

- confirm the homepage loads
- click through search links and verify they open LinkedIn
- verify local storage behavior in the browser
