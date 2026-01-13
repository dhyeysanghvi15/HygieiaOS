# WellnessOS (HygieiaOS)

Designer-level, installable, offline-capable PWA with a **voice + chat companion** at the center, plus a **local encrypted vault** and a **curated Hygiene Knowledge Pack** with citations.

- Static-only deploy (GitHub Pages friendly)
- No paid APIs / no AWS content
- Works offline (PWA + offline knowledge index)

## Quickstart

```bash
npm ci
npm run dev
```

## Commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run preview
npm run e2e
```

## PWA install

Run `npm run dev`, then use your browser’s “Install app” option. The service worker is enabled in dev for easy testing.

## Knowledge Pack

Offline knowledge lives at `public/knowledge/index.json` and is used at runtime for hygiene Q&A with citations.

- Sources list: `data/sources.yml`
- Builder: `scripts/knowledge/build.ts`
- Extraction utilities: `scripts/knowledge/extract.ts`
- Guardrails: `scripts/knowledge/README.md`

Build locally (network required):

```bash
npm run knowledge:build
```

### Optional Live Web Mode

Live Web Mode is **OFF by default** and requires an optional proxy (Cloudflare Worker) to keep the static app safe.

- Worker: `services/worker/worker.ts`
- Instructions: `services/worker/README.md`

To enable in your build:

```bash
VITE_WEB_PROXY_URL="https://your-worker.example.workers.dev" npm run build
```

## Vault (Privacy Cockpit)

The Vault is a local encrypted store using WebCrypto (AES-GCM) + IndexedDB (Dexie).

Features:

- Passcode mode: PBKDF2 + salt + high iteration count
- Device-key mode (encrypted, but passcode is recommended)
- Tamper-evident ledger: hash-chain entries with “Verify Integrity”
- Export encrypted backup: `.json.enc` (download-only)
- Delete everything with `type DELETE` confirmation
- Optional Trusted Contact record (encrypted) for crisis templates (copy-only)

Entry points:

- Crypto: `src/features/vault/crypto.ts`
- Storage + session: `src/features/vault/storage.ts`
- Ledger: `src/features/vault/ledger.ts`
- Export helper: `src/features/vault/export.ts`
- UI: `src/components/vault/PrivacyCockpit.tsx`

## Safety Policy

The companion uses a tiered policy (**Green/Yellow/Orange/Red**) and **always scores risk before responding**.

- Policy: `src/features/companion/safety/policy.ts`
- Scoring: `src/features/companion/safety/riskScoring.ts`
- Templates: `src/features/companion/safety/templates.ts`
- Tests: `src/features/companion/safety/__tests__/safety.test.ts`

Docs: `SAFETY_POLICY.md`

## Deploy (GitHub Pages)

The included workflow builds and deploys as a static site. The router uses `HashRouter`, so it works without server rewrites.

## Repo structure

This repo follows the structure documented in the prompt, with app code under `src/`, scripts under `scripts/`, and workflows under `.github/workflows/`.

## Docs

- Privacy: `PRIVACY.md`
- Security: `SECURITY.md`
- Threat model: `THREAT_MODEL.md`
- Safety policy: `SAFETY_POLICY.md`

