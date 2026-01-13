# Optional Live Web Mode (Cloudflare Worker)

This app is static-first and ships with an offline knowledge pack. **Live Web Mode is optional and OFF by default.**

If you want Live Web Mode on a production host, you can deploy this Cloudflare Worker as a simple proxy that:

- Fetches only from a small allowlist of trusted hygiene sources
- Extracts short snippets (no full text storage)
- Returns an answer with citations

## Deploy

1. Create a Cloudflare Worker project.
2. Copy `services/worker/worker.ts` as the Worker entrypoint.
3. Deploy and note the Worker URL.
4. Set `VITE_WEB_PROXY_URL` to that URL when building the static site.

Example:

`VITE_WEB_PROXY_URL=https://your-worker.your-account.workers.dev npm run build`

## Static-safe

If `VITE_WEB_PROXY_URL` is not set, the app always stays offline-only.

