import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Authenticator } from '../../auth/types'
import { DEFAULT_STREAM_BASE_URL } from '../../constants'
import { EventType } from '../../gen/social/mixi/application/const/v1/event_type_pb'
import { createMockHandler, fakeErrorStream, fakeStream } from '../../test/utils'

vi.mock('./backoff', async (importOriginal) => {
  const original = await importOriginal<typeof import('./backoff')>()
  return { ...original, sleep: vi.fn(() => Promise.resolve()) }
})

const createTransportMock = vi.fn(() => ({}))
vi.mock('../../transport', () => ({
  createTransport: createTransportMock,
}))

const subscribeEventsMock = vi.fn()
vi.mock('@connectrpc/connect', () => ({
  createClient: () => ({ subscribeEvents: subscribeEventsMock }),
}))

const { createStreamWatcher } = await import('./watcher')

const dummyAuthenticator: Authenticator = {
  getAccessToken: () => Promise.resolve('dummy'),
  createInterceptor: () => (next) => (req) => next(req),
}

beforeEach(() => {
  subscribeEventsMock.mockReset()
  createTransportMock.mockClear()
})

describe('streamWatcher', () => {
  it('handles_events_and_ignores_ping', async () => {
    const controller = new AbortController()
    subscribeEventsMock
      .mockReturnValueOnce(fakeStream(EventType.PING, EventType.UNSPECIFIED))
      .mockImplementation(() => {
        controller.abort()
        return fakeStream()
      })
    const handler = createMockHandler()
    const watcher = createStreamWatcher({ authenticator: dummyAuthenticator }, handler)

    await watcher.watch(controller.signal)

    expect(handler.events).toHaveLength(1)
    expect(handler.events[0]?.eventType).toBe(EventType.UNSPECIFIED)
  })

  it('reconnects_on_error', async () => {
    const controller = new AbortController()
    subscribeEventsMock
      .mockReturnValueOnce(fakeErrorStream('stream error'))
      .mockReturnValueOnce(fakeStream(EventType.UNSPECIFIED))
      .mockImplementation(() => {
        controller.abort()
        return fakeStream()
      })
    const handler = createMockHandler()
    const watcher = createStreamWatcher({ authenticator: dummyAuthenticator }, handler)

    await watcher.watch(controller.signal)

    expect(handler.events).toHaveLength(1)
    expect(subscribeEventsMock).toHaveBeenCalledTimes(3)
  })

  it('reconnects_on_normal_stream_end', async () => {
    const controller = new AbortController()
    subscribeEventsMock
      .mockReturnValueOnce(fakeStream(EventType.UNSPECIFIED))
      .mockImplementation(() => {
        controller.abort()
        return fakeStream()
      })
    const handler = createMockHandler()
    const watcher = createStreamWatcher({ authenticator: dummyAuthenticator }, handler)

    await watcher.watch(controller.signal)

    expect(handler.events).toHaveLength(1)
    expect(subscribeEventsMock).toHaveBeenCalledTimes(2)
  })

  it('resets_retries_after_successful_connection', async () => {
    subscribeEventsMock
      .mockReturnValueOnce(fakeErrorStream('error 1'))
      .mockReturnValueOnce(fakeStream(EventType.UNSPECIFIED))
      .mockReturnValueOnce(fakeErrorStream('error 2'))
      .mockReturnValueOnce(fakeErrorStream('error 3'))
      .mockReturnValueOnce(fakeErrorStream('error 4'))
      .mockReturnValueOnce(fakeErrorStream('error 5'))
    const handler = createMockHandler()
    const watcher = createStreamWatcher(
      { authenticator: dummyAuthenticator, maxRetries: 3 },
      handler,
    )

    await expect(watcher.watch()).rejects.toThrow('error 5')

    expect(handler.events).toHaveLength(1)
    expect(subscribeEventsMock).toHaveBeenCalledTimes(6)
  })

  it('max_retries_exceeded', async () => {
    subscribeEventsMock.mockImplementation(() => fakeErrorStream('persistent error'))
    const handler = createMockHandler()
    const watcher = createStreamWatcher(
      { authenticator: dummyAuthenticator, maxRetries: 3 },
      handler,
    )

    await expect(watcher.watch()).rejects.toThrow('persistent error')

    expect(subscribeEventsMock).toHaveBeenCalledTimes(4)
  })

  it('uses DEFAULT_STREAM_BASE_URL when baseUrl is not specified', () => {
    createStreamWatcher({ authenticator: dummyAuthenticator }, createMockHandler())

    expect(createTransportMock).toHaveBeenCalledWith(
      expect.objectContaining({ baseUrl: DEFAULT_STREAM_BASE_URL }),
    )
  })

  it('uses custom baseUrl when specified', () => {
    const customUrl = 'https://custom-stream.example.com'

    createStreamWatcher(
      { authenticator: dummyAuthenticator, baseUrl: customUrl },
      createMockHandler(),
    )

    expect(createTransportMock).toHaveBeenCalledWith(
      expect.objectContaining({ baseUrl: customUrl }),
    )
  })
})
