/**
 * Authentication utilities for the mixi2 Application API.
 *
 * Provides OAuth2 client credentials authentication and connect-es interceptors.
 *
 * @module
 */

export { createAuthenticator } from './authenticator'
export { createAuthInterceptor } from './interceptor'
export type { AuthConfig, Authenticator } from './types'
