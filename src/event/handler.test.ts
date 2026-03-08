import { create } from '@bufbuild/protobuf'
import { describe, expect, it, vi } from 'vitest'

import { EventType } from '../gen/social/mixi/application/const/v1/event_type_pb'
import {
  ChatMessageReceivedEventSchema,
  EventSchema,
  PostCreatedEventSchema,
} from '../gen/social/mixi/application/model/v1/event_pb'
import { createEventHandler } from './handler'

const createPostCreatedEvent = () => {
  const body = create(PostCreatedEventSchema, {})
  return {
    body,
    event: create(EventSchema, {
      eventId: 'test-event-id',
      eventType: EventType.POST_CREATED,
      body: { case: 'postCreatedEvent' as const, value: body },
    }),
  }
}

const createChatMessageReceivedEvent = () => {
  const body = create(ChatMessageReceivedEventSchema, {})
  return {
    body,
    event: create(EventSchema, {
      eventId: 'test-event-id',
      eventType: EventType.CHAT_MESSAGE_RECEIVED,
      body: { case: 'chatMessageReceivedEvent' as const, value: body },
    }),
  }
}

describe('createEventHandler', () => {
  it('calls postCreated handler for postCreatedEvent', async () => {
    const postCreatedHandler = vi.fn()
    const handler = createEventHandler({ postCreated: postCreatedHandler })
    const { body, event } = createPostCreatedEvent()

    await handler.handle(event)

    expect(postCreatedHandler).toHaveBeenCalledOnce()
    expect(postCreatedHandler).toHaveBeenCalledWith(body, event)
  })

  it('calls chatMessageReceived handler for chatMessageReceivedEvent', async () => {
    const chatMessageReceivedHandler = vi.fn()
    const handler = createEventHandler({ chatMessageReceived: chatMessageReceivedHandler })
    const { body, event } = createChatMessageReceivedEvent()

    await handler.handle(event)

    expect(chatMessageReceivedHandler).toHaveBeenCalledOnce()
    expect(chatMessageReceivedHandler).toHaveBeenCalledWith(body, event)
  })

  it('does not throw when handler is not defined', async () => {
    const handler = createEventHandler({})
    const { event } = createPostCreatedEvent()

    await expect(handler.handle(event)).resolves.toBeUndefined()
  })

  it('handles async handlers', async () => {
    const results: string[] = []
    const handler = createEventHandler({
      postCreated: async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        results.push('done')
      },
    })
    const { event } = createPostCreatedEvent()

    await handler.handle(event)

    expect(results).toEqual(['done'])
  })
})
