# WellnessOS v0.1.0 — Prototype Release Notes

Release type: student-built prototype (static PWA)  
Tag: `v0.1.0`

## What’s included

WellnessOS v0.1.0 is the first “end-to-end working” prototype: an installable, offline-capable Progressive Web App with a voice + chat companion at the center, plus privacy-first local storage.

The goal of this release is usability + safety + privacy — not medical advice.

## Core features

### Companion console

- Persistent Companion Dock (collapsed) + expanded chat drawer
- Type or speak (push-to-talk transcript preview)
- Optional text-to-speech replies (toggleable)
- Slash commands (examples: `/morning`, `/sleep`, `/focus 25`, `/hydrate`)
- Action cards to run tools (timers, snooze, mark done)

### Wellness OS (daily habits)

- Daily timeline with checkpoints (Morning/Day/Evening/Bedtime)
- Timers: brush (2 min), handwash (20 sec), breathing, focus (Pomodoro)
- Routine wizards + custom routines
- “2-minute rescue” quick routine

### Hygiene Q&A (offline)

- Curated offline knowledge pack shipped at `public/knowledge/index.json`
- Local retrieval + answers with citations and “last updated”

### Vault (privacy + security)

- Local encrypted vault (WebCrypto AES‑GCM)
- Passcode-based key derivation (PBKDF2 + salt) supported
- Tamper-evident ledger (hash chain) + “Verify integrity”
- Export encrypted backup (`.json.enc`) and wipe flow

### Safety policy

- Tiered risk behavior (Green/Yellow/Orange/Red)
- Red tier is strict: short, calm, routes to real-world help and safety checks
- Automated tests verify red-tier responses do not include disallowed content

## Known limitations (prototype realities)

- Voice support varies by browser/OS. Speech-to-text is best in Chromium-based browsers; some browsers may not support it at all.
- “Smart Mode” depends on device capability and may take time to load; the app always falls back to Core Mode.
- Hygiene knowledge pack is curated and intentionally snippet-based (≤ 25 words) to avoid copying large text blocks; answers are not exhaustive.
- Static hosts like GitHub Pages have limited security header support compared to hosts that let you configure headers.

## Next steps (short roadmap)

- Improve knowledge snippet extraction quality while keeping strict copying limits.
- Expand routines and check-ins UX polish based on real usage.
- Add more structured privacy controls and clearer per-setting explanations.
- Performance pass (code splitting + bundle size trimming).

## How to verify this release

Run these from the repo root:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run e2e
```

