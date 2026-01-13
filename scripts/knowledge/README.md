# Hygiene Knowledge Pack

This repo ships an offline, searchable Hygiene Knowledge Pack at `public/knowledge/index.json`.

## Guardrails (copy-safe)

- We only store **short snippets** (≤ 25 words) plus metadata (title/url/last_updated/keywords/headings).
- We do **not** store full articles or large copied text.
- The build script extracts a few relevant text fragments, then **truncates** to a short, citation-friendly snippet.

## Build locally

1. Install dependencies: `npm ci`
2. Run: `npm run knowledge:build`

The output is written to `public/knowledge/index.json`.

## CI refresh

GitHub Actions runs `scripts/knowledge/build.ts` on a schedule and opens a PR updating the committed `public/knowledge/index.json`.

