import { create, toBinary } from '@bufbuild/protobuf'

import type { EventHandler } from '../event/types'
import type { EventType } from '../gen/social/mixi/application/const/v1/event_type_pb'
import type { Event } from '../gen/social/mixi/application/model/v1/event_pb'
import { EventSchema } from '../gen/social/mixi/application/model/v1/event_pb'
import type { SubscribeEventsResponse } from '../gen/social/mixi/application/service/application_stream/v1/service_pb'
import { SubscribeEventsResponseSchema } from '../gen/social/mixi/application/service/application_stream/v1/service_pb'
import { SendEventRequestSchema } from '../gen/social/mixi/application/service/client_endpoint/v1/service_pb'

// crypto helpers

type KeyPair = {
  publicKeyBase64: string
  signRequest: (body: Uint8Array, timestamp: string) => Promise<string>
}

export const generateKeyPair = async (): Promise<KeyPair> => {
  const keyPair = await crypto.subtle.generateKey('Ed25519', true, ['sign', 'verify'])
  const publicKeyRaw = await crypto.subtle.exportKey('raw', keyPair.publicKey)
  const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKeyRaw)))

  const signRequest = async (body: Uint8Array, timestamp: string): Promise<string> => {
    const timestampBytes = new TextEncoder().encode(timestamp)
    const dataToSign = new Uint8Array(body.length + timestampBytes.length)
    dataToSign.set(body, 0)
    dataToSign.set(timestampBytes, body.length)
    const sig = await crypto.subtle.sign('Ed25519', keyPair.privateKey, dataToSign)
    return btoa(String.fromCharCode(...new Uint8Array(sig)))
  }

  return { publicKeyBase64, signRequest }
}

// event helpers

type MockHandler = EventHandler & { events: Event[] }

export const createMockHandler = (): MockHandler => {
  const events: Event[] = []

  return {
    events,
    handle: async (event: Event) => {
      events.push(event)
    },
  }
}

// protobuf helpers

export const createEventBody = (...eventTypes: EventType[]): Uint8Array<ArrayBuffer> => {
  return toBinary(
    SendEventRequestSchema,
    create(SendEventRequestSchema, {
      events: eventTypes.map((eventType) => create(EventSchema, { eventType })),
    }),
  )
}

export const createSignedRequest = async (
  body: Uint8Array<ArrayBuffer>,
  signRequest: (body: Uint8Array<ArrayBuffer>, timestamp: string) => Promise<string>,
): Promise<Request> => {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const signature = await signRequest(body, timestamp)

  return new Request('http://localhost/events', {
    method: 'POST',
    body,
    headers: {
      'x-mixi2-application-event-signature': signature,
      'x-mixi2-application-event-timestamp': timestamp,
    },
  })
}

// stream helpers

export const fakeStream = (...eventTypes: EventType[]): AsyncGenerator<SubscribeEventsResponse> => {
  return (async function* () {
    yield create(SubscribeEventsResponseSchema, {
      events: eventTypes.map((eventType) => create(EventSchema, { eventType })),
    })
  })()
}

export const fakeErrorStream = (message: string): AsyncGenerator<SubscribeEventsResponse> => {
  // oxlint-disable-next-line require-yield
  return (async function* () {
    throw new Error(message)
  })()
}
