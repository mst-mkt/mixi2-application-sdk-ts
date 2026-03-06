import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createAuthenticator } from './authenticator'

const mockConfig = {
  clientId: 'client-id',
  clientSecret: 'client-secret',
  tokenUrl: 'https://auth.example.com/token',
}

const mockTokenResponse = (accessToken = 'test-access-token', expiresIn = 3600) => {
  return new Response(
    JSON.stringify({ access_token: accessToken, token_type: 'Bearer', expires_in: expiresIn }),
  )
}

describe('createAuthenticator', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('get_access_token', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(mockTokenResponse())),
    )
    const auth = createAuthenticator(mockConfig)

    const token = await auth.getAccessToken()

    expect(token).toBe('test-access-token')
  })

  it('get_access_token_cached', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(mockTokenResponse()))
    vi.stubGlobal('fetch', fetchMock)
    const auth = createAuthenticator(mockConfig)

    await auth.getAccessToken()
    await auth.getAccessToken()

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('get_access_token_error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(new Response(JSON.stringify({ error: 'invalid_client' }), { status: 401 })),
      ),
    )
    const auth = createAuthenticator(mockConfig)

    await expect(auth.getAccessToken()).rejects.toThrow('Failed to fetch access token: 401')
  })

  it('token_refresh', async () => {
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'))
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockTokenResponse('token-1', 120))
      .mockResolvedValueOnce(mockTokenResponse('token-2', 3600))
    vi.stubGlobal('fetch', fetchMock)
    const auth = createAuthenticator(mockConfig)

    const first = await auth.getAccessToken()
    vi.advanceTimersByTime(61_000)
    const second = await auth.getAccessToken()

    expect(first).toBe('token-1')
    expect(second).toBe('token-2')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('request_parameters', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(mockTokenResponse()))
    vi.stubGlobal('fetch', fetchMock)
    const auth = createAuthenticator(mockConfig)

    await auth.getAccessToken()

    expect(fetchMock).toHaveBeenCalledWith('https://auth.example.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials&client_id=client-id&client_secret=client-secret',
    })
  })
})
