# Crossroads Recovery Community App

A simple mobile-friendly recovery support app for Crossroads Recovery Community. It is built as a static website so it can be hosted on Render the same way as the virtual meeting finder.

## What is included

- Mobile homepage with Crossroads branding
- C app icon and favicon
- I Relapsed / I Need Help Now page
- Anonymous concern form
- Meeting finder section
- Daily readings section
- Recovery library section
- Leadership contacts section
- JSON-based settings file
- PWA manifest so residents can save it to their phone home screen
- Basic service worker for app-shell caching
- Render config file

## Folder structure

- `public/index.html` is the main app page
- `public/style.css` controls the design
- `public/app.js` controls the app behavior
- `public/data/settings.json` controls phone numbers, forms, meeting links, reading links, and literature links
- `public/assets/` contains the logo and icons
- `render.yaml` is included for Render static hosting

## Render setup

Create a new Static Site on Render and connect this GitHub repo.

Use these settings:

- Build Command: leave blank
- Publish Directory: `public`

The included `render.yaml` can also be used by Render as the service configuration.

## Anonymous tips

The anonymous concern form is already built into the app. To make it send to leadership without a backend, create a Formspree form and paste the endpoint into:

`public/data/settings.json`

Replace:

`https://formspree.io/f/REPLACE_WITH_YOUR_FORM_ID`

with your real Formspree endpoint.

Make sure the app wording does not promise perfect anonymity. The current wording says the person does not have to enter their name, which is safer and more accurate.

## Relapse help requests

The relapse support form uses the same setup as the concern form. It can use the same Formspree endpoint or a separate one.

The direct call buttons are already set for:

- ACCESS: 888-225-4447
- FAN / Hope Not Handcuffs: 833-202-HOPE
- Emergency: 911

## Editing leadership contacts

Open:

`public/data/settings.json`

Add phone numbers for Jacob, Angela, Richard, Norma, or other approved leadership contacts.

Use digits only when possible, for example:

`"phone": "18105551212"`

## Recovery literature links

The library currently uses Drive links that were found in Jacob's recovery literature files. Before making the app public, only keep links Crossroads has permission to share publicly or internally.

## Local preview

Open `public/index.html` in a browser, or run a local static server from the project folder.

Example:

`python -m http.server 8000 --directory public`

Then open:

`http://localhost:8000`
