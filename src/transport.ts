import type { Interceptor, Transport } from '@connectrpc/connect'
import { createGrpcTransport } from '@connectrpc/connect-node'

import type { Authenticator } from './auth/types'
import { DEFAULT_BASE_URL } from './constants'

export type TransportConfig = {
  readonly authenticator: Authenticator
  readonly interceptors?: Interceptor[]
  readonly baseUrl?: string
}

/** createTransport creates a gRPC transport for the mixi2 Application API. */
export const createTransport = ({
  authenticator,
  interceptors = [],
  baseUrl = DEFAULT_BASE_URL,
}: TransportConfig): Transport => {
  return createGrpcTransport({
    baseUrl,
    interceptors: [authenticator.createInterceptor(), ...interceptors],
  })
}
