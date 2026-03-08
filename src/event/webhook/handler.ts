import { fromBinary } from '@bufbuild/protobuf'

import { SendEventRequestSchema } from '../../gen/social/mixi/application/service/client_endpoint/v1/service_pb'
import { isPingEvent, resolveOnError } from '../types'
import type { EventHandler, OnErrorHandler } from '../types'
import { verifySignature, verifyTimestamp } from './verify'

const SIGNATURE_HEADER = 'x-mixi2-application-event-signature'
const TIMESTAMP_HEADER = 'x-mixi2-application-event-timestamp'

/** Webhook イベントハンドラーの作成設定 */
export type WebhookHandlerConfig = {
  /** 署名検証に使用する公開鍵 */
  readonly signaturePublicKey: string
  /** エラー発生時のコールバック (省略時は標準エラー出力にログを出力) */
  readonly onError?: OnErrorHandler
}

type WebhookHandler = (request: Request) => Promise<Response>

/**
 * Webhook イベント用の Request / Response ハンドラーを作成する
 *
 * 受信したリクエストの署名検証とタイムスタンプ検証を行い、
 * 検証に成功したイベントを {@link EventHandler} に渡す
 *
 * @param config - 署名検証用の公開鍵などの設定
 * @param handler - イベントを処理する {@link EventHandler}
 * @returns Web 標準の `Request` を受け取り `Response` を返すハンドラー関数
 *
 * @example
 * ```ts
 * import { createEventHandler } from '@mst-mkt/mixi2-application-sdk-ts/event'
 * import { createWebhookHandler } from '@mst-mkt/mixi2-application-sdk-ts/event/webhook'
 *
 * const eventHandler = createEventHandler({
 *   postCreated: async ({ post }) => {
 *     console.log('投稿が作成されました:', post?.text)
 *   },
 * })
 *
 * const webhookHandler = createWebhookHandler(
 *   { signaturePublicKey: 'your-public-key' },
 *   eventHandler,
 * )
 *
 * // リクエストを受け取るエンドポイントに webhookHandler を割り当てる
 * // プラットフォームやフレームワークに応じて変更する
 * export const POST = (request: Request) => webhookHandler(request)
 * ```
 */
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
