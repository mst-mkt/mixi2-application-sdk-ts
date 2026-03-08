import type { Interceptor } from '@connectrpc/connect'

/** OAuth2 Client Credentials 認証の設定 */
export type AuthConfig = {
  readonly clientId: string
  readonly clientSecret: string
  readonly tokenUrl?: string
}

export type TokenResponse = {
  readonly accessToken: string
  readonly expiresAt: number
}

/** アクセストークンの管理と認証用 Interceptor の生成を行うオブジェクト */
export type Authenticator = {
  readonly getAccessToken: () => Promise<string>
  readonly createInterceptor: () => Interceptor
}
