import type { Transport } from '@connectrpc/connect'
import { createClient } from '@connectrpc/connect'

import { DEFAULT_STREAM_BASE_URL } from '../../constants'
import type { Event } from '../../gen/social/mixi/application/model/v1/event_pb'
import { ApplicationService } from '../../gen/social/mixi/application/service/application_stream/v1/service_pb'
import type { TransportConfig } from '../../transport'
import { createTransport } from '../../transport'
import { isPingEvent, resolveOnError } from '../types'
import type { EventHandler, OnErrorHandler } from '../types'
import { calculateBackoff, sleep } from './backoff'

const DEFAULT_MAX_RETRIES = 3

/** ストリームイベントウォッチャーの作成設定 */
export type StreamWatcherConfig = Omit<TransportConfig, 'baseUrl'> & {
  readonly baseUrl?: string
  readonly maxRetries?: number
  readonly onError?: OnErrorHandler
}

/** 自動再接続機能付きのストリームイベントウォッチャー */
export type StreamWatcher = {
  readonly watch: (signal?: AbortSignal) => Promise<void>
}

const handleEvents = async (
  events: readonly Event[],
  handler: EventHandler,
  onError: OnErrorHandler,
): Promise<void> => {
  for (const event of events) {
    if (isPingEvent(event)) continue

    try {
      await handler.handle(event)
    } catch (error) {
      onError(error)
    }
  }
}

const consumeStream = async (
  transport: Transport,
  handler: EventHandler,
  onError: OnErrorHandler,
  signal?: AbortSignal,
): Promise<void> => {
  const client = createClient(ApplicationService, transport)
  const stream = client.subscribeEvents({}, signal ? { signal } : {})

  for await (const response of stream) {
    await handleEvents(response.events, handler, onError)
  }
}

/** 自動再接続機能付きのストリームイベントウォッチャーを作成する */
export const createStreamWatcher = (
  config: StreamWatcherConfig,
  handler: EventHandler,
): StreamWatcher => {
  const transport = createTransport({
    ...config,
    baseUrl: config.baseUrl ?? DEFAULT_STREAM_BASE_URL,
  })
  const maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES
  const onError = resolveOnError(config.onError)

  const watch = async (signal?: AbortSignal): Promise<void> => {
    for (let retries = 0; !signal?.aborted; retries++) {
      try {
        await consumeStream(transport, handler, onError, signal)
        return
      } catch (error) {
        if (signal?.aborted) return
        if (retries >= maxRetries) throw error
        await sleep(calculateBackoff(retries))
      }
    }
  }

  return { watch }
}
