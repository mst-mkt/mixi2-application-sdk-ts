/**
 * mixi2 Application SDK for TypeScript.
 *
 * Provides authentication, API client, and event handling for the mixi2 Application API.
 *
 * @module
 */

export { createAuthenticator, createAuthInterceptor } from './auth'
export type { AuthConfig, Authenticator } from './auth'

export { createMixi2Client } from './client'
export type { ClientConfig, Mixi2Client } from './client'

export { DEFAULT_BASE_URL, DEFAULT_TOKEN_URL, DEFAULT_STREAM_BASE_URL } from './constants'

export type { EventHandler } from './event'
