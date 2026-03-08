/**
 * Typed client for the mixi2 Application API.
 *
 * Provides a connect-es based client to interact with the mixi2 Application Service.
 *
 * @module
 */

import type { Client } from '@connectrpc/connect'
import { createClient } from '@connectrpc/connect'

import { DEFAULT_BASE_URL } from '../constants'
import { ApplicationService } from '../gen/social/mixi/application/service/application_api/v1/service_pb'
import type { TransportConfig } from '../transport'
import { createTransport } from '../transport'

/** Configuration for creating a mixi2 API client. */
export type ClientConfig = Omit<TransportConfig, 'baseUrl'> & {
  readonly baseUrl?: string
}

/** A typed connect-es client for the mixi2 Application Service. */
export type Mixi2Client = Client<typeof ApplicationService>

/** createMixi2Client creates a typed client for the mixi2 Application API. */
export const createMixi2Client = (config: ClientConfig): Mixi2Client => {
  return createClient(
    ApplicationService,
    createTransport({ ...config, baseUrl: config.baseUrl ?? DEFAULT_BASE_URL }),
  )
}
