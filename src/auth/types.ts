import type { Interceptor } from '@connectrpc/connect'

export type AuthConfig = {
  readonly clientId: string
  readonly clientSecret: string
  readonly tokenUrl: string
}

export type TokenResponse = {
  readonly accessToken: string
  readonly expiresAt: number
}

export type Authenticator = {
  readonly getAccessToken: () => Promise<string>
  readonly createInterceptor: () => Interceptor
}
