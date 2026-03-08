import { EventType } from '../gen/social/mixi/application/const/v1/event_type_pb'
import type { Event } from '../gen/social/mixi/application/model/v1/event_pb'
import type { EventHandler, OnErrorHandler } from './types'

const defaultOnError: OnErrorHandler = (error) => {
  console.error('[mixi2-sdk] event handler error:', error)
}

/** onError が未指定の場合にデフォルトのエラーハンドラーを返す */
export const resolveOnError = (onError: OnErrorHandler | undefined): OnErrorHandler =>
  onError ?? defaultOnError

/** Ping イベントかどうかを判定する */
export const isPingEvent = (event: Event): boolean => {
  return event.eventType === EventType.PING
}

/**
 * イベントの配列を順次処理する
 *
 * Ping イベントは自動でスキップされ、
 * 各イベントの処理中に発生したエラーは onError に委譲される
 */
export const processEvents = async (
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
