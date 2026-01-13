export function id(prefix = 'id'): string {
  const bytes = crypto.getRandomValues(new Uint8Array(10))
  const base = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${prefix}_${base}`
}

