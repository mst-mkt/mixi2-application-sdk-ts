import type { Interceptor } from '@connectrpc/connect'

// oxlint-disable-next-line no-unused-vars: Used in JSDoc @link only.
import type { DEFAULT_TOKEN_URL } from '../constants'

/** OAuth2 Client Credentials 認証の設定 */
export type AuthConfig = {
  /** OAuth2 クライアント ID */
  readonly clientId: string
  /** OAuth2 クライアントシークレット */
  readonly clientSecret: string
  /** トークンエンドポイントの URL (省略時は {@link DEFAULT_TOKEN_URL} を使用) */
  readonly tokenUrl?: string
}

export type TokenResponse = {
  readonly accessToken: string
  readonly expiresAt: number
}

/** アクセストークンの管理と認証用 Interceptor の生成を行うオブジェクト */
export type Authenticator = {
  /** キャッシュ済みのアクセストークンを返す (期限切れ時は自動で再取得) */
  readonly getAccessToken: () => Promise<string>
  /** 認証用の connect-es Interceptor を生成する */
  readonly createInterceptor: () => Interceptor
}
