import { DEFAULT_TOKEN_URL } from '../constants'
import { createAuthInterceptor } from './interceptor'
import type { AuthConfig, Authenticator, TokenResponse } from './types'

const TOKEN_EXPIRY_BUFFER_MS = 60_000

/** createAuthenticator creates an Authenticator that manages OAuth2 Client Credentials tokens. */
export const createAuthenticator = (config: AuthConfig): Authenticator => {
  let cached: TokenResponse | undefined

  const fetchToken = async (): Promise<TokenResponse> => {
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: config.clientId,
      client_secret: config.clientSecret,
    })

    const response = await fetch(config.tokenUrl ?? DEFAULT_TOKEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch access token: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid token response: expected an object')
    }

    const { access_token, expires_in } = data

    if (typeof access_token !== 'string') {
      throw new Error('Invalid token response: access_token must be a string')
    }

    if (typeof expires_in !== 'number') {
      throw new Error('Invalid token response: expires_in must be a number')
    }

    return {
      accessToken: access_token,
      expiresAt: Date.now() + expires_in * 1000,
    }
  }

  const isExpired = (token: TokenResponse): boolean => {
    return Date.now() >= token.expiresAt - TOKEN_EXPIRY_BUFFER_MS
  }

  const getAccessToken = async (): Promise<string> => {
    if (cached === undefined || isExpired(cached)) {
      cached = await fetchToken()
    }
    return cached.accessToken
  }

  return {
    getAccessToken,
    createInterceptor: () => createAuthInterceptor(getAccessToken),
  }
}
