# Privacy (Plain Language)

WellnessOS is designed to work offline and keep your data on your device.

## What we store

Depending on your settings, WellnessOS can store:

- Chat history (user + assistant messages)
- Voice transcripts (speech-to-text results)
- Journals (if you use them)
- Check-ins (mood/stress/energy + tags)
- Trusted contact (name + phone/email for message templates)

## Where it’s stored

Data is stored locally in your browser using IndexedDB.

## Encryption

Sensitive records can be stored in the Vault, which encrypts records locally using:

- AES-GCM (encryption)
- PBKDF2 (passcode-derived keys) when you enable passcode mode

If you don’t set a passcode, the Vault uses a device key (still encrypted, but a passcode is stronger).

## What we do NOT do

- No paid AI APIs
- No sending your vault content to third parties
- No background uploads

## Export and delete

You can:

- Export an encrypted backup (`.json.enc`)
- Delete everything (with an explicit confirmation)

## Live Web Mode

Live Web Mode is optional and OFF by default.

If enabled, it requires a separately deployed proxy (Cloudflare Worker) and will clearly label web-sourced answers with citations.

