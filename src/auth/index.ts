/**
 * mixi2 Application API の認証ユーティリティ
 *
 * OAuth2 Client Credentials 認証と認証用 Interceptor を提供する
 *
 * @module
 */

export { createAuthenticator } from './authenticator'
export { createAuthInterceptor } from './interceptor'
export type { AuthConfig, Authenticator } from './types'
