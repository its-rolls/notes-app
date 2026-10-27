# Simple Notes App

A small React note-taking app with browser notifications. Notes are saved in `localStorage`, and you can set an optional reminder time for each note.

## Features

- Add and delete notes
- Notes persist in the browser (`localStorage`)
- Browser notifications: confirmation on save and timed reminders
- Works on desktop and mobile browsers that support the Notification API

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

Open the `localhost` URL printed in the terminal.

## Environment variables

Vite only exposes variables prefixed with `VITE_`.

| Variable         | Required | Description                          |
| ---------------- | -------- | ------------------------------------ |
| `VITE_APP_NAME`  | No       | Title shown at the top of the app    |

## Deploy to Vercel

### Option 1: Vercel dashboard

1. Push this project to GitHub.
2. Go to https://vercel.com/new and import the repository.
3. Framework preset: **Vite** (auto-detected). Build command `npm run build`, output directory `dist`.
4. Under **Environment Variables**, add `VITE_APP_NAME` (optional).
5. Click **Deploy**.

### Option 2: Vercel CLI

```bash
npm i -g vercel
vercel          # preview deploy
vercel --prod   # production deploy
```

To add env vars from the CLI:

```bash
vercel env add VITE_APP_NAME
```

Vercel serves over HTTPS, which browsers require for notifications.

## Notes and limitations

- Reminders use `setTimeout`, so they only fire while the app is open in a tab.
- For reminders when the app is closed, add a service worker with the Push API and a backend.
- Users must click "Enable notifications" and allow the browser prompt.
