import { describe, expect, it } from 'vitest'
import { decryptJson, encryptJson, importDeviceKey, randomB64 } from '../crypto'
import { appendLedgerEntry, verifyLedger } from '../ledger'

describe('vault crypto', () => {
  it('encrypts and decrypts json', async () => {
    const key = await importDeviceKey(randomB64(32))
    const payload = await encryptJson(key, { hello: 'world', n: 1 })
    const out = await decryptJson<{ hello: string; n: number }>(key, payload)
    expect(out.hello).toBe('world')
    expect(out.n).toBe(1)
  })
})

describe('ledger', () => {
  it('detects tampering', async () => {
    const e1 = await appendLedgerEntry({
      prev: null,
      recordId: 'r1',
      kind: 'chat',
      createdAt: 1,
      ciphertextB64: 'ct',
      ivB64: 'iv',
    })
    const e2 = await appendLedgerEntry({
      prev: e1,
      recordId: 'r2',
      kind: 'chat',
      createdAt: 2,
      ciphertextB64: 'ct2',
      ivB64: 'iv2',
    })
    const ok = await verifyLedger([e1, e2])
    expect(ok.ok).toBe(true)
    const bad = await verifyLedger([e1, { ...e2, prevHashB64: 'WRONG' }])
    expect(bad.ok).toBe(false)
  })
})

