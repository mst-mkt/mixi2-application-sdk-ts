import { fromBinary } from '@bufbuild/protobuf'

import { SendEventRequestSchema } from '../../gen/social/mixi/application/service/client_endpoint/v1/service_pb'
import { isPingEvent, resolveOnError } from '../types'
import type { EventHandler, OnErrorHandler } from '../types'
import { verifySignature, verifyTimestamp } from './verify'

const SIGNATURE_HEADER = 'x-mixi2-application-event-signature'
const TIMESTAMP_HEADER = 'x-mixi2-application-event-timestamp'

/** Webhook イベントハンドラーの作成設定 */
export type WebhookHandlerConfig = {
  readonly signaturePublicKey: string
  readonly onError?: OnErrorHandler
}

type WebhookHandler = (request: Request) => Promise<Response>

/** Webhook イベント用の Request / Response ハンドラーを作成する */
export const createWebhookHandler = (
  config: WebhookHandlerConfig,
  handler: EventHandler,
): WebhookHandler => {
  const onError = resolveOnError(config.onError)

  return async (request: Request): Promise<Response> => {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 })
    }

    const signature = request.headers.get(SIGNATURE_HEADER)
    const timestamp = request.headers.get(TIMESTAMP_HEADER)

    if (signature === null || timestamp === null) {
      return new Response('Unauthorized', { status: 401 })
    }

    if (!verifyTimestamp(timestamp)) {
      return new Response('Unauthorized', { status: 401 })
    }

    const buffer = await request.arrayBuffer()
    const body = new Uint8Array(buffer)

    const valid = await verifySignature(body, signature, timestamp, config.signaturePublicKey)

    if (!valid) {
      return new Response('Unauthorized', { status: 401 })
    }

    const sendEventRequest = fromBinary(SendEventRequestSchema, body)

    for (const event of sendEventRequest.events) {
      if (isPingEvent(event)) continue
      try {
        await handler.handle(event)
      } catch (error) {
        onError(error)
      }
    }

    return new Response(null, { status: 204 })
  }
}
