import type { Client, Transport } from '@connectrpc/connect'
import { createClient } from '@connectrpc/connect'

import { ApplicationService } from '../gen/social/mixi/application/service/application_api/v1/service_pb'

export type ClientConfig = {
  readonly transport: Transport
}

export type Mixi2Client = Client<typeof ApplicationService>

/** createMixi2Client creates a typed client for the mixi2 Application API. */
export const createMixi2Client = (config: ClientConfig): Mixi2Client => {
  return createClient(ApplicationService, config.transport)
}
