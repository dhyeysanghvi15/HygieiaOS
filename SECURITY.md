# Security

## Local security model

WellnessOS is a static PWA that stores data locally. Security goals:

- Encrypt sensitive data at rest in the browser (WebCrypto AES-GCM)
- Reduce silent leakage (no background uploads)
- Provide user-controlled export and deletion
- Detect tampering of stored records via a hash-chain ledger

## Vault

- Passcode mode: PBKDF2 + per-vault salt + high iterations
- Device-key mode: encrypted, but passcode recommended for higher assurance
- Integrity: each record append updates a ledger entry (prevHash + entryHash)

## Reporting

If you find a security issue, please open a GitHub Security Advisory or file a private report to the repo owner.

## Automated checks

GitHub Actions runs:

- Lint / typecheck / tests / build
- CodeQL analysis

