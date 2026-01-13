import Dexie, { type Table } from 'dexie'
import { create } from 'zustand'
import { decryptJson, encryptJson, importDeviceKey, randomB64, type EncryptedPayload, deriveKeyPBKDF2 } from './crypto'
import { appendLedgerEntry, type LedgerEntry, verifyLedger } from './ledger'
import { id } from '../../lib/id'

type VaultMeta = {
  id: 'vault'
  mode: 'device' | 'passcode'
  createdAt: number
  saltB64?: string
  iterations?: number
  deviceSecretB64?: string
  check: EncryptedPayload
}

export type VaultRecord = {
  id: string
  kind: 'chat' | 'voice' | 'journal' | 'checkin' | 'contact'
  createdAt: number
  payload: EncryptedPayload
}

class VaultDB extends Dexie {
  meta!: Table<VaultMeta, string>
  records!: Table<VaultRecord, string>
  ledger!: Table<LedgerEntry, number>

  constructor() {
    super('wellnessos_vault_v1')
    this.version(1).stores({
      meta: 'id',
      records: 'id, kind, createdAt',
      ledger: 'seq, recordId, kind, createdAt',
    })
  }
}

export const vaultDb = new VaultDB()

async function ensureMeta(): Promise<VaultMeta> {
  const existing = await vaultDb.meta.get('vault')
  if (existing) return existing
  const deviceSecretB64 = randomB64(32)
  const key = await importDeviceKey(deviceSecretB64)
  const check = await encryptJson(key, { ok: true, createdAt: Date.now() })
  const meta: VaultMeta = { id: 'vault', mode: 'device', createdAt: Date.now(), deviceSecretB64, check }
  await vaultDb.meta.put(meta)
  return meta
}

type VaultSessionState = {
  status: 'locked' | 'unlocked'
  mode: 'device' | 'passcode'
  key: CryptoKey | null
  lastActiveAt: number
  init: () => Promise<void>
  lock: () => void
  touch: () => void
  unlockWithPasscode: (passcode: string) => Promise<{ ok: true } | { ok: false; error: string }>
  unlockDevice: () => Promise<void>
  setPasscode: (passcode: string) => Promise<{ ok: true } | { ok: false; error: string }>
  verifyIntegrity: () => Promise<{ ok: true } | { ok: false; atSeq: number; reason: string }>
  exportEncryptedBackup: () => Promise<Uint8Array>
  deleteEverything: () => Promise<void>
  upsertContact: (contact: { name: string; handle: string }) => Promise<void>
  getContact: () => Promise<{ name: string; handle: string } | null>
}

export const useVaultStore = create<VaultSessionState>((set, get) => ({
  status: 'locked',
  mode: 'device',
  key: null,
  lastActiveAt: Date.now(),
  init: async () => {
    const meta = await ensureMeta()
    set({ mode: meta.mode })
    await get().unlockDevice()
  },
  lock: () => set({ status: 'locked', key: null }),
  touch: () => set({ lastActiveAt: Date.now() }),
  unlockWithPasscode: async (passcode) => {
    const meta = await ensureMeta()
    if (meta.mode !== 'passcode' || !meta.saltB64 || !meta.iterations) {
      return { ok: false, error: 'Vault is not in passcode mode.' }
    }
    try {
      const key = await deriveKeyPBKDF2(passcode, meta.saltB64, meta.iterations)
      const check = await decryptJson<{ ok: boolean }>(key, meta.check)
      if (!check.ok) return { ok: false, error: 'Incorrect passcode.' }
      set({ status: 'unlocked', key, mode: 'passcode' })
      return { ok: true }
    } catch {
      return { ok: false, error: 'Incorrect passcode.' }
    }
  },
  unlockDevice: async () => {
    const meta = await ensureMeta()
    if (meta.mode === 'passcode') return
    const key = await importDeviceKey(meta.deviceSecretB64!)
    const check = await decryptJson<{ ok: boolean }>(key, meta.check)
    if (!check.ok) throw new Error('Vault check failed.')
    set({ status: 'unlocked', key, mode: 'device' })
  },
  setPasscode: async (passcode) => {
    const meta = await ensureMeta()
    const currentKey = get().key
    if (!currentKey) return { ok: false, error: 'Unlock the vault first.' }
    const saltB64 = randomB64(16)
    const iterations = 210_000
    const nextKey = await deriveKeyPBKDF2(passcode, saltB64, iterations)

    // Re-encrypt everything to the new key.
    const records = await vaultDb.records.toArray()
    for (const r of records) {
      const plain = await decryptJson<unknown>(currentKey, r.payload)
      const payload = await encryptJson(nextKey, plain)
      await vaultDb.records.put({ ...r, payload })
    }
    const check = await encryptJson(nextKey, { ok: true, createdAt: Date.now() })
    await vaultDb.meta.put({
      ...meta,
      mode: 'passcode',
      saltB64,
      iterations,
      deviceSecretB64: undefined,
      check,
    })
    set({ mode: 'passcode', key: nextKey, status: 'unlocked' })
    return { ok: true }
  },
  verifyIntegrity: async () => {
    const entries = await vaultDb.ledger.toArray()
    return verifyLedger(entries)
  },
  exportEncryptedBackup: async () => {
    const key = get().key
    if (!key) throw new Error('Vault locked')
    const meta = await ensureMeta()
    const backup = {
      v: 1,
      exportedAt: new Date().toISOString(),
      meta: { ...meta, deviceSecretB64: meta.mode === 'device' ? meta.deviceSecretB64 : undefined },
      records: await vaultDb.records.toArray(),
      ledger: await vaultDb.ledger.toArray(),
    }
    const payload = await encryptJson(key, backup)
    const enc = new TextEncoder()
    return enc.encode(JSON.stringify(payload))
  },
  deleteEverything: async () => {
    await vaultDb.delete()
    await vaultDb.open()
    set({ status: 'locked', key: null })
    await get().init()
  },
  upsertContact: async (contact) => {
    const key = get().key
    if (!key) throw new Error('Vault locked')
    const recordId = 'contact_default'
    const payload = await encryptJson(key, contact)
    await vaultDb.records.put({ id: recordId, kind: 'contact', createdAt: Date.now(), payload })
    const prev = await vaultDb.ledger.orderBy('seq').last()
    const entry = await appendLedgerEntry({
      prev: prev ?? null,
      recordId,
      kind: 'contact',
      createdAt: Date.now(),
      ciphertextB64: payload.ctB64,
      ivB64: payload.ivB64,
    })
    await vaultDb.ledger.put(entry)
  },
  getContact: async () => {
    const key = get().key
    if (!key) return null
    const r = await vaultDb.records.get('contact_default')
    if (!r) return null
    return decryptJson<{ name: string; handle: string }>(key, r.payload)
  },
}))

export async function vaultPut(kind: VaultRecord['kind'], value: unknown) {
  const key = useVaultStore.getState().key
  if (!key) return
  const recordId = id(kind)
  const payload = await encryptJson(key, value)
  const createdAt = Date.now()
  await vaultDb.records.put({ id: recordId, kind, createdAt, payload })
  const prev = await vaultDb.ledger.orderBy('seq').last()
  const entry = await appendLedgerEntry({
    prev: prev ?? null,
    recordId,
    kind,
    createdAt,
    ciphertextB64: payload.ctB64,
    ivB64: payload.ivB64,
  })
  await vaultDb.ledger.put(entry)
}
