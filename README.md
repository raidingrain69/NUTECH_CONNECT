# NUTECH Connect

This is a web app built with Vite and React.

## Run Locally

1. Install dependencies with `npm install`.
2. Start the dev server with `npm run dev`.
3. Open the local URL printed by Vite.

## Build

Run `npm run build` to generate a production build in `dist/`.

## Notes

The app works fully offline with the built-in Gemma 4 simulator.

If you want live AI on Vercel, add `VITE_GEMINI_API_KEY` in your Vercel project environment variables and redeploy. The app will still fall back to offline mode if the key is missing.
