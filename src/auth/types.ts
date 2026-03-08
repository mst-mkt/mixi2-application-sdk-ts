import type { Interceptor } from '@connectrpc/connect'

/** Configuration for OAuth2 client credentials authentication. */
export type AuthConfig = {
  readonly clientId: string
  readonly clientSecret: string
  readonly tokenUrl?: string
}

export type TokenResponse = {
  readonly accessToken: string
  readonly expiresAt: number
}

/** Authenticator that manages access tokens and creates connect-es interceptors. */
export type Authenticator = {
  readonly getAccessToken: () => Promise<string>
  readonly createInterceptor: () => Interceptor
}
