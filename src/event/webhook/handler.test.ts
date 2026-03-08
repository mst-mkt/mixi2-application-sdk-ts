import { describe, expect, it, vi } from 'vitest'

import { EventType } from '../../gen/social/mixi/application/const/v1/event_type_pb'
import {
  createEventBody,
  createMockHandler,
  createSignedRequest,
  generateKeyPair,
} from '../../test/utils'
import { createWebhookHandler } from './handler'

describe('webhookHandler', () => {
  it('missing_signature', async () => {
    const { publicKeyBase64 } = await generateKeyPair()
    const webhookHandler = createWebhookHandler(
      { signaturePublicKey: publicKeyBase64 },
      createMockHandler(),
    )

    const response = await webhookHandler(
      new Request('http://localhost/events', { method: 'POST' }),
    )

    expect(response.status).toBe(401)
  })

  it('missing_timestamp', async () => {
    const { publicKeyBase64, signRequest } = await generateKeyPair()
    const webhookHandler = createWebhookHandler(
      { signaturePublicKey: publicKeyBase64 },
      createMockHandler(),
    )
    const body = new TextEncoder().encode('test body')
    const signature = await signRequest(body, String(Math.floor(Date.now() / 1000)))

    const response = await webhookHandler(
      new Request('http://localhost/events', {
        method: 'POST',
        body,
        headers: { 'x-mixi2-application-event-signature': signature },
      }),
    )

    expect(response.status).toBe(401)
  })

  it('timestamp_too_old', async () => {
    const { publicKeyBase64, signRequest } = await generateKeyPair()
    const webhookHandler = createWebhookHandler(
      { signaturePublicKey: publicKeyBase64 },
      createMockHandler(),
    )
    const body = new TextEncoder().encode('test body')
    const oldTimestamp = String(Math.floor(Date.now() / 1000) - 400)
    const signature = await signRequest(body, oldTimestamp)

    const response = await webhookHandler(
      new Request('http://localhost/events', {
        method: 'POST',
        body,
        headers: {
          'x-mixi2-application-event-signature': signature,
          'x-mixi2-application-event-timestamp': oldTimestamp,
        },
      }),
    )

    expect(response.status).toBe(401)
  })

  it('invalid_signature', async () => {
    const { publicKeyBase64 } = await generateKeyPair()
    const { signRequest: wrongSignRequest } = await generateKeyPair()
    const webhookHandler = createWebhookHandler(
      { signaturePublicKey: publicKeyBase64 },
      createMockHandler(),
    )
    const body = createEventBody(EventType.UNSPECIFIED)
    const timestamp = String(Math.floor(Date.now() / 1000))
    const invalidSignature = await wrongSignRequest(body, timestamp)

    const response = await webhookHandler(
      new Request('http://localhost/events', {
        method: 'POST',
        body,
        headers: {
          'x-mixi2-application-event-signature': invalidSignature,
          'x-mixi2-application-event-timestamp': timestamp,
        },
      }),
    )

    expect(response.status).toBe(401)
  })

  it('valid_request', async () => {
    const { publicKeyBase64, signRequest } = await generateKeyPair()
    const handler = createMockHandler()
    const webhookHandler = createWebhookHandler({ signaturePublicKey: publicKeyBase64 }, handler)
    const body = createEventBody(EventType.UNSPECIFIED)

    const response = await webhookHandler(await createSignedRequest(body, signRequest))

    expect(response.status).toBe(204)
    expect(handler.events).toHaveLength(1)
  })

  it('ping_event_ignored', async () => {
    const { publicKeyBase64, signRequest } = await generateKeyPair()
    const handler = createMockHandler()
    const webhookHandler = createWebhookHandler({ signaturePublicKey: publicKeyBase64 }, handler)
    const body = createEventBody(EventType.PING)

    const response = await webhookHandler(await createSignedRequest(body, signRequest))

    expect(response.status).toBe(204)
    expect(handler.events).toHaveLength(0)
  })

  it('method_not_allowed', async () => {
    const { publicKeyBase64 } = await generateKeyPair()
    const webhookHandler = createWebhookHandler(
      { signaturePublicKey: publicKeyBase64 },
      createMockHandler(),
    )

    const response = await webhookHandler(new Request('http://localhost/events', { method: 'GET' }))

    expect(response.status).toBe(405)
  })

  it('body_read_failure_returns_500', async () => {
    const { publicKeyBase64 } = await generateKeyPair()
    const webhookHandler = createWebhookHandler(
      { signaturePublicKey: publicKeyBase64 },
      createMockHandler(),
    )
    const timestamp = String(Math.floor(Date.now() / 1000))
    const request = new Request('http://localhost/events', {
      method: 'POST',
      body: 'dummy',
      headers: {
        'x-mixi2-application-event-signature': 'dummy',
        'x-mixi2-application-event-timestamp': timestamp,
      },
    })
    vi.spyOn(request, 'arrayBuffer').mockRejectedValue(new Error('read failure'))

    const response = await webhookHandler(request)

    expect(response.status).toBe(500)
  })

  it('invalid_protobuf_returns_400', async () => {
    const { publicKeyBase64, signRequest } = await generateKeyPair()
    const webhookHandler = createWebhookHandler(
      { signaturePublicKey: publicKeyBase64 },
      createMockHandler(),
    )
    const invalidBody = new TextEncoder().encode('not a valid protobuf')

    const response = await webhookHandler(await createSignedRequest(invalidBody, signRequest))

    expect(response.status).toBe(400)
  })

  it('handler_error_calls_on_error_and_returns_204', async () => {
    const { publicKeyBase64, signRequest } = await generateKeyPair()
    const onError = vi.fn()
    const handlerError = new Error('handler failed')
    const handler = {
      handle: async () => {
        throw handlerError
      },
    }
    const webhookHandler = createWebhookHandler(
      { signaturePublicKey: publicKeyBase64, onError },
      handler,
    )
    const body = createEventBody(EventType.UNSPECIFIED)

    const response = await webhookHandler(await createSignedRequest(body, signRequest))

    expect(response.status).toBe(204)
    expect(onError).toHaveBeenCalledWith(handlerError)
  })
})
