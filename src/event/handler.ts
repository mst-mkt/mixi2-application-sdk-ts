import type {
  ChatMessageReceivedEvent,
  Event,
  PostCreatedEvent,
} from '../gen/social/mixi/application/model/v1/event_pb'
import type { EventHandler } from './types'

/** イベント種別ごとのハンドラー関数のマップ */
export type EventHandlers = {
  readonly postCreated?: (event: PostCreatedEvent, rawEvent: Event) => Promise<void> | void
  readonly chatMessageReceived?: (
    event: ChatMessageReceivedEvent,
    rawEvent: Event,
  ) => Promise<void> | void
}

/** イベント種別ごとのハンドラー関数から {@link EventHandler} を作成する */
export const createEventHandler = (handlers: EventHandlers): EventHandler => ({
  handle: async (event) => {
    if (event.body.case === 'postCreatedEvent') {
      await handlers.postCreated?.(event.body.value, event)
    }
    if (event.body.case === 'chatMessageReceivedEvent') {
      await handlers.chatMessageReceived?.(event.body.value, event)
    }
  },
})
