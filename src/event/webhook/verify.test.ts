import { describe, expect, it } from 'vitest'

import { generateKeyPair } from '../../test/utils'
import { verifySignature, verifyTimestamp } from './verify'

describe('verifyTimestamp', () => {
  const now = 1700000000

  it('valid_same', () => {
    expect(verifyTimestamp(String(now), now)).toBe(true)
  })

  it('valid_within_5min', () => {
    expect(verifyTimestamp(String(now - 299), now)).toBe(true)
    expect(verifyTimestamp(String(now + 299), now)).toBe(true)
  })

  it('valid_exact_5min', () => {
    expect(verifyTimestamp(String(now - 300), now)).toBe(true)
    expect(verifyTimestamp(String(now + 300), now)).toBe(true)
  })

  it('invalid_too_old', () => {
    expect(verifyTimestamp(String(now - 301), now)).toBe(false)
    expect(verifyTimestamp(String(now + 301), now)).toBe(false)
    expect(verifyTimestamp(String(now - 400), now)).toBe(false)
  })

  it('invalid_malformed', () => {
    expect(verifyTimestamp('invalid', now)).toBe(false)
    expect(verifyTimestamp('', now)).toBe(false)
  })
})

describe('verifySignature', () => {
  it('valid_signature', async () => {
    const keys = await generateKeyPair()
    const body = new TextEncoder().encode('test body')
    const signature = await keys.signRequest(body, '1700000000')

    const result = await verifySignature(body, signature, '1700000000', keys.publicKeyBase64)

    expect(result).toBe(true)
  })

  it('invalid_wrong_key', async () => {
    const correctKeys = await generateKeyPair()
    const wrongKeys = await generateKeyPair()
    const body = new TextEncoder().encode('test body')
    const signature = await wrongKeys.signRequest(body, '1700000000')

    const result = await verifySignature(body, signature, '1700000000', correctKeys.publicKeyBase64)

    expect(result).toBe(false)
  })

  it('invalid_tampered_body', async () => {
    const keys = await generateKeyPair()
    const body = new TextEncoder().encode('test body')
    const signature = await keys.signRequest(body, '1700000000')
    const tamperedBody = new TextEncoder().encode('tampered body')

    const result = await verifySignature(
      tamperedBody,
      signature,
      '1700000000',
      keys.publicKeyBase64,
    )

    expect(result).toBe(false)
  })
})
