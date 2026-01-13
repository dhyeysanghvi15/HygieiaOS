import { assert } from '../../lib/assert'

export type EncryptedPayload = {
  v: 1
  ivB64: string
  ctB64: string
}

function bytesToB64(bytes: Uint8Array) {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s)
}

function b64ToBytes(b64: string) {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

export async function sha256B64(data: Uint8Array) {
  // Ensure ArrayBuffer (not SharedArrayBuffer) for strict DOM typings.
  const copy = new Uint8Array(data.byteLength)
  copy.set(data)
  const digest = await crypto.subtle.digest('SHA-256', copy.buffer)
  return bytesToB64(new Uint8Array(digest))
}

export async function deriveKeyPBKDF2(passcode: string, saltB64: string, iterations: number) {
  assert(iterations >= 100_000, 'PBKDF2 iterations too low')
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(passcode), 'PBKDF2', false, [
    'deriveKey',
  ])
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: b64ToBytes(saltB64),
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
  return key
}

export async function importDeviceKey(deviceSecretB64: string) {
  const bytes = b64ToBytes(deviceSecretB64)
  assert(bytes.byteLength === 32, 'device key must be 32 bytes')
  return crypto.subtle.importKey('raw', bytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
}

export async function encryptJson(key: CryptoKey, value: unknown): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const enc = new TextEncoder()
  const pt = enc.encode(JSON.stringify(value))
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, pt)
  return { v: 1, ivB64: bytesToB64(iv), ctB64: bytesToB64(new Uint8Array(ct)) }
}

export async function decryptJson<T>(key: CryptoKey, payload: EncryptedPayload): Promise<T> {
  assert(payload.v === 1, 'Unsupported payload version')
  const iv = b64ToBytes(payload.ivB64)
  const ct = b64ToBytes(payload.ctB64)
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct)
  const dec = new TextDecoder()
  return JSON.parse(dec.decode(pt)) as T
}

export function randomB64(bytesLen: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(bytesLen))
  return bytesToB64(bytes)
}

export const _b64 = { bytesToB64, b64ToBytes }
