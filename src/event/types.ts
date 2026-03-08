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
