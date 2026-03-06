import { EventType } from '../gen/social/mixi/application/const/v1/event_type_pb'
import type { Event } from '../gen/social/mixi/application/model/v1/event_pb'

/**
 * EventHandler processes events from mixi2.
 * Ping events are handled internally by the SDK and not passed to handle.
 */
export type EventHandler = {
  readonly handle: (event: Event) => Promise<void>
}

export type OnErrorHandler = (error: unknown) => void

const defaultOnError: OnErrorHandler = (error) => {
  console.error('[mixi2-sdk] event handler error:', error)
}

export const resolveOnError = (onError: OnErrorHandler | undefined): OnErrorHandler =>
  onError ?? defaultOnError

export const isPingEvent = (event: Event): boolean => {
  return event.eventType === EventType.PING
}
