/**
 * mixi2 Application API の型付きクライアント
 *
 * connect-es ベースのクライアントを提供する
 *
 * @module
 */

import type { Client } from '@connectrpc/connect'
import { createClient } from '@connectrpc/connect'

// oxlint-disable-next-line no-unused-vars: Used in JSDoc @link only.
import type { createAuthenticator } from '../auth/authenticator'
import { DEFAULT_BASE_URL } from '../constants'
import { ApplicationService } from '../gen/social/mixi/application/service/application_api/v1/service_pb'
import type { TransportConfig } from '../transport'
import { createTransport } from '../transport'

/** mixi2 API クライアントの作成設定 */
export type ClientConfig = Omit<TransportConfig, 'baseUrl'> & {
  /** API のベース URL (省略時は {@link DEFAULT_BASE_URL} を使用) */
  readonly baseUrl?: string
}

/** mixi2 Application Service の型付き connect-es クライアント */
export type Mixi2Client = Client<typeof ApplicationService>

/**
 * mixi2 Application API の型付きクライアントを作成する
 *
 * @param config - クライアント設定
 * @param config.baseUrl - API のベース URL (省略時は {@link DEFAULT_BASE_URL} を使用)
 * @param config.authenticator - {@link createAuthenticator} で作成した authenticator
 * @param config.interceptors - 必要に応じて追加の Interceptor を指定可能
 * @returns mixi2 Application API を呼び出すための型付きクライアント
 *
 * @example
 * ```ts
 * import { createAuthenticator } from '@mst-mkt/mixi2-application-sdk-ts/auth'
 * import { createMixi2Client } from '@mst-mkt/mixi2-application-sdk-ts/client'
 *
 * const authenticator = createAuthenticator({
 *   clientId: 'your-client-id',
 *   clientSecret: 'your-client-secret',
 * })
 *
 * const client = createMixi2Client({ authenticator })
 * const { posts } = await client.getPosts({ postIdList: ['5efb4595-fe2d-4c52-b078-b85020385955'] })
 * ```
 */
export const createMixi2Client = (config: ClientConfig): Mixi2Client => {
  return createClient(
    ApplicationService,
    createTransport({ ...config, baseUrl: config.baseUrl ?? DEFAULT_BASE_URL }),
  )
}
