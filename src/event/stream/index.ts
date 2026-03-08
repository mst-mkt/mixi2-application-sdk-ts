/**
 * mixi2 Application API のストリームイベントウォッチャー
 *
 * gRPC サーバーストリーミングイベントの監視と処理を行うユーティリティを提供する
 *
 * @module
 */

export { createStreamWatcher } from './watcher'
export type { StreamWatcher, StreamWatcherConfig } from './watcher'
