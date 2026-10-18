function toHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export function newSalt() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return toHex(bytes)
}

export function normalizePin(value) {
  return String(value || '').replace(/\s+/g, '')
}

export function pinLooksValid(value) {
  const pin = normalizePin(value)
  return pin.length >= 4 && pin.length <= 12 && /^\d+$/.test(pin)
}

export async function hashPin(pin, salt) {
  const payload = new TextEncoder().encode(`${salt}:${normalizePin(pin)}`)
  const digest = await crypto.subtle.digest('SHA-256', payload)
  return toHex(digest)
}

export async function pinsMatch(pin, salt, expectedHash) {
  if (!expectedHash) return !normalizePin(pin)
  const actual = await hashPin(pin, salt)
  return actual === expectedHash
}
