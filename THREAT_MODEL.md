# Threat Model (STRIDE)

This is a practical, developer-friendly threat model for a static, offline-first PWA with local encrypted storage.

## Assets

- Vault encryption keys (in-memory session key)
- Encrypted vault records (IndexedDB)
- Integrity ledger (hash-chain)
- Knowledge Pack index (static JSON)

## STRIDE

### Spoofing
- Risk: attacker uses device to impersonate the user.
- Mitigations:
  - Passcode mode for vault unlock
  - Auto-lock on background + timeout

### Tampering
- Risk: local IndexedDB modified or partially deleted.
- Mitigations:
  - Tamper-evident ledger (prevHash chain)
  - “Verify Integrity” UI with clear results

### Repudiation
- Risk: ambiguity about what was stored/changed.
- Mitigations:
  - Ledger provides a verifiable append sequence

### Information Disclosure
- Risk: sensitive data exposed via local storage or network.
- Mitigations:
  - Encrypted vault records (AES-GCM)
  - Avoid storing sensitive content in plain localStorage
  - Offline-first; no uploads by default
  - Optional Live Web Mode requires explicit toggle and proxy allowlist

### Denial of Service
- Risk: storage cleared or browser limits exceeded.
- Mitigations:
  - Export backups
  - Keep knowledge pack small

### Elevation of Privilege
- Risk: XSS or dependency compromise leads to data access.
- Mitigations:
  - Strict CSP possible on supported hosts (optional headers)
  - CI scanning (CodeQL, Dependabot)
  - Minimal dependencies + least privilege design

## Residual risks

- If the browser profile is compromised, in-memory keys could be extracted while unlocked.
- Device-key mode is weaker than passcode mode for threat actors with filesystem/profile access.

