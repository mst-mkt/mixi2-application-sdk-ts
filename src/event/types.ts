import { EventType } from '../gen/social/mixi/application/const/v1/event_type_pb'
import type { Event } from '../gen/social/mixi/application/model/v1/event_pb'

/**
 * mixi2 のイベントを処理するハンドラー
 *
 * Ping イベントは SDK 内部で処理され、handle には渡されない
 */
export type EventHandler = {
  readonly handle: (event: Event) => Promise<void>
}

/** イベント処理中にエラーが発生した際に呼び出されるコールバック */
export type OnErrorHandler = (error: unknown) => void

const defaultOnError: OnErrorHandler = (error) => {
  console.error('[mixi2-sdk] event handler error:', error)
}

export const resolveOnError = (onError: OnErrorHandler | undefined): OnErrorHandler =>
  onError ?? defaultOnError

export const isPingEvent = (event: Event): boolean => {
  return event.eventType === EventType.PING
}
