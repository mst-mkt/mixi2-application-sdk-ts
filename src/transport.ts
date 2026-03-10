import type { Interceptor, Transport } from '@connectrpc/connect'
import { createGrpcTransport } from '@connectrpc/connect-node'

import type { Authenticator } from './auth/types'

/** トランスポート作成関数の型 */
export type TransportFactory = (options: {
  baseUrl: string
  interceptors: Interceptor[]
}) => Transport

export type TransportConfig = {
  readonly authenticator: Authenticator
  readonly interceptors?: Interceptor[]
  readonly baseUrl: string
  /** カスタムトランスポート作成関数 (省略時は gRPC transport を使用) */
  readonly createTransport?: TransportFactory
}

/** createTransport creates a gRPC transport for the mixi2 Application API. */
export const createTransport = ({
  authenticator,
  interceptors = [],
  baseUrl,
  createTransport: customCreateTransport,
}: TransportConfig): Transport => {
  const factory = customCreateTransport ?? createGrpcTransport
  return factory({
    baseUrl,
    interceptors: [authenticator.createInterceptor(), ...interceptors],
  })
}
