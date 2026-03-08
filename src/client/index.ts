/**
 * mixi2 Application API の型付きクライアント
 *
 * connect-es ベースのクライアントを提供する
 *
 * @module
 */

import type { Client } from '@connectrpc/connect'
import { createClient } from '@connectrpc/connect'

import { DEFAULT_BASE_URL } from '../constants'
import { ApplicationService } from '../gen/social/mixi/application/service/application_api/v1/service_pb'
import type { TransportConfig } from '../transport'
import { createTransport } from '../transport'

/** mixi2 API クライアントの作成設定 */
export type ClientConfig = Omit<TransportConfig, 'baseUrl'> & {
  readonly baseUrl?: string
}

/** mixi2 Application Service の型付き connect-es クライアント */
export type Mixi2Client = Client<typeof ApplicationService>

/** mixi2 Application API の型付きクライアントを作成する */
export const createMixi2Client = (config: ClientConfig): Mixi2Client => {
  return createClient(
    ApplicationService,
    createTransport({ ...config, baseUrl: config.baseUrl ?? DEFAULT_BASE_URL }),
  )
}
