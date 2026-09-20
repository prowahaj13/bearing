# Technical Overview

Bearing is a static single-page application designed for Netlify hosting. It uses plain HTML, CSS, and JavaScript with no framework, package manager, or server-side runtime.

## Architecture

- index.html: app shell and UI structure
- css/style.css: all styling and theme variables
- js/script.js: app logic, localStorage state, and lead tracking
- assets/: reserved for images, icons, and screenshots

## Data model

The app stores two pieces of data in browser localStorage:

- bearing.state: user-selected goal, category, and configuration
- bearing.leads: imported lead records and statuses

This keeps the app simple but means data is local to a single browser and not synced across devices.

## Browser behavior

The app generates search links to LinkedIn using encoded query strings and opens them in a new tab. It does not authenticate, automate, or scrape LinkedIn.

## Build and deploy

The deployment is static. Netlify can host the directory directly with the included netlify.toml configuration.
