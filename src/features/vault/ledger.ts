import { sha256B64 } from './crypto'

export type LedgerEntry = {
  seq: number
  recordId: string
  kind: string
  createdAt: number
  prevHashB64: string
  payloadHashB64: string
  entryHashB64: string
}

export async function computePayloadHashB64(ciphertextB64: string, ivB64: string) {
  const enc = new TextEncoder()
  return sha256B64(enc.encode(`${ivB64}.${ciphertextB64}`))
}

export async function computeEntryHashB64(entry: Omit<LedgerEntry, 'entryHashB64'>) {
  const enc = new TextEncoder()
  const stable = JSON.stringify({
    seq: entry.seq,
    recordId: entry.recordId,
    kind: entry.kind,
    createdAt: entry.createdAt,
    prevHashB64: entry.prevHashB64,
    payloadHashB64: entry.payloadHashB64,
  })
  return sha256B64(enc.encode(stable))
}

export async function appendLedgerEntry({
  prev,
  recordId,
  kind,
  createdAt,
  ciphertextB64,
  ivB64,
}: {
  prev: LedgerEntry | null
  recordId: string
  kind: string
  createdAt: number
  ciphertextB64: string
  ivB64: string
}): Promise<LedgerEntry> {
  const payloadHashB64 = await computePayloadHashB64(ciphertextB64, ivB64)
  const nextBase = {
    seq: prev ? prev.seq + 1 : 1,
    recordId,
    kind,
    createdAt,
    prevHashB64: prev ? prev.entryHashB64 : 'GENESIS',
    payloadHashB64,
  }
  const entryHashB64 = await computeEntryHashB64(nextBase)
  return { ...nextBase, entryHashB64 }
}

export async function verifyLedger(entries: LedgerEntry[]): Promise<
  | { ok: true }
  | { ok: false; atSeq: number; reason: string }
> {
  const sorted = [...entries].sort((a, b) => a.seq - b.seq)
  let prev: LedgerEntry | null = null
  for (const e of sorted) {
    const expectedPrev = prev ? prev.entryHashB64 : 'GENESIS'
    if (e.prevHashB64 !== expectedPrev) return { ok: false, atSeq: e.seq, reason: 'prevHash mismatch' }
    const expectedHash = await computeEntryHashB64({
      seq: e.seq,
      recordId: e.recordId,
      kind: e.kind,
      createdAt: e.createdAt,
      prevHashB64: e.prevHashB64,
      payloadHashB64: e.payloadHashB64,
    })
    if (e.entryHashB64 !== expectedHash) return { ok: false, atSeq: e.seq, reason: 'entryHash mismatch' }
    prev = e
  }
  return { ok: true }
}

