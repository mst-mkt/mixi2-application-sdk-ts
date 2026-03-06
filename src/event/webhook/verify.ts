/** verifySignature verifies an Ed25519 signature using the Web Crypto API. */
export const verifySignature = async (
  body: Uint8Array,
  signature: string,
  timestamp: string,
  publicKey: string,
): Promise<boolean> => {
  const signatureBytes = base64ToUint8Array(signature)
  const publicKeyBytes = base64ToUint8Array(publicKey)

  const timestampBytes = new TextEncoder().encode(timestamp)
  const message = concat(body, timestampBytes)

  const key = await crypto.subtle.importKey('raw', publicKeyBytes, { name: 'Ed25519' }, false, [
    'verify',
  ])

  return crypto.subtle.verify('Ed25519', key, signatureBytes, message)
}

/** verifyTimestamp checks that the timestamp is within ±5 minutes. */
export const verifyTimestamp = (timestamp: string, nowSeconds?: number): boolean => {
  const ts = Number.parseInt(timestamp, 10)
  if (Number.isNaN(ts)) return false
  const currentTime = Math.floor(Date.now() / 1000)
  const now = nowSeconds ?? currentTime
  return Math.abs(now - ts) <= 300
}

const base64ToUint8Array = (base64: string): Uint8Array<ArrayBuffer> => {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
}

const concat = (a: Uint8Array, b: Uint8Array): Uint8Array<ArrayBuffer> => {
  const result = new Uint8Array(a.length + b.length)
  result.set(a, 0)
  result.set(b, a.length)
  return result
}
