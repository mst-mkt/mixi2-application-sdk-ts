/**
 * mixi2 Application API のイベントハンドリング
 *
 * Webhook およびストリームイベントを処理するための型とユーティリティを提供する
 *
 * @module
 */

export type { EventHandler, OnErrorHandler } from './types'
export { createEventHandler } from './handler'
export type { EventHandlers } from './handler'
