/**
 * mixi2 Application API の Webhook イベントハンドラー
 *
 * 受信した Webhook リクエストの署名検証と処理を行うユーティリティを提供する
 *
 * @module
 */

export { createWebhookHandler } from './handler'
export type { WebhookHandlerConfig } from './handler'
