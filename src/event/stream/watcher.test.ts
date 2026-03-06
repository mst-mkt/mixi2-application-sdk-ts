import type { Transport } from '@connectrpc/connect'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { EventType } from '../../gen/social/mixi/application/const/v1/event_type_pb'
import { createMockHandler, fakeErrorStream, fakeStream } from '../../test/utils'

vi.mock('./backoff', async (importOriginal) => {
  const original = await importOriginal<typeof import('./backoff')>()
  return { ...original, sleep: vi.fn(() => Promise.resolve()) }
})

const subscribeEventsMock = vi.fn()
vi.mock('@connectrpc/connect', () => ({
  createClient: () => ({ subscribeEvents: subscribeEventsMock }),
}))

const { createStreamWatcher } = await import('./watcher')

const dummyTransport: Transport = {
  unary: () => {
    throw new Error('not implemented')
  },
  stream: () => {
    throw new Error('not implemented')
  },
}

beforeEach(() => {
  subscribeEventsMock.mockReset()
})

describe('streamWatcher', () => {
  it('handles_events_and_ignores_ping', async () => {
    subscribeEventsMock.mockReturnValueOnce(fakeStream(EventType.PING, EventType.UNSPECIFIED))
    const handler = createMockHandler()
    const watcher = createStreamWatcher({ transport: dummyTransport }, handler)

    await watcher.watch()

    expect(handler.events).toHaveLength(1)
    expect(handler.events[0]?.eventType).toBe(EventType.UNSPECIFIED)
  })

  it('reconnects_on_error', async () => {
    subscribeEventsMock.mockReturnValueOnce(fakeErrorStream('stream error'))
    subscribeEventsMock.mockReturnValueOnce(fakeStream(EventType.UNSPECIFIED))
    const handler = createMockHandler()
    const watcher = createStreamWatcher({ transport: dummyTransport }, handler)

    await watcher.watch()

    expect(handler.events).toHaveLength(1)
    expect(subscribeEventsMock).toHaveBeenCalledTimes(2)
  })

  it('max_retries_exceeded', async () => {
    subscribeEventsMock.mockImplementation(() => fakeErrorStream('persistent error'))
    const handler = createMockHandler()
    const watcher = createStreamWatcher({ transport: dummyTransport, maxRetries: 3 }, handler)

    await expect(watcher.watch()).rejects.toThrow('persistent error')
    expect(subscribeEventsMock).toHaveBeenCalledTimes(4)
  })
})
