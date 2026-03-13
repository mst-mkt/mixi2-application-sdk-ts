# gRPC Stream

`createStreamWatcher` に `authenticator` と[イベントハンドラー](./events.md)を渡すことで、gRPC ストリーミングによるイベント監視を開始できます。常駐型のサーバー環境やローカル開発に適しています。

> [!NOTE]
> gRPC Stream は `node:http2` モジュールに依存するため、Cloudflare Workers など一部の環境では利用できません。

## 前提

gRPC Stream を利用するには以下の認証情報が必要です。

- OAuth 2.0 Client ID
- OAuth 2.0 Client Secret

これ以降はそれぞれを `CLIENT_ID` と `CLIENT_SECRET` として説明します。

## Stream ウォッチャーの作成と開始

```typescript
import {
  createAuthenticator,
  createEventHandler,
  createStreamWatcher,
} from '@mst-mkt/mixi2-application-sdk-ts'

const authenticator = createAuthenticator({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
})

const eventHandler = createEventHandler({
  postCreated: async ({ post }) => {
    console.log('ポストが作成されました:', post?.text)
  },
  chatMessageReceived: async ({ message }) => {
    console.log('メッセージを受信しました:', message?.text)
  },
})

const watcher = createStreamWatcher({ authenticator }, eventHandler)
await watcher.watch()
```

`watch()` はストリーム接続が維持されている間ブロックし続けます。

## 設定項目

`createStreamWatcher` の第 1 引数は `StreamWatcherConfig` を受け取ります。

| プロパティ        | 型                 | 必須 | デフォルト値                                       | 説明                                             |
| ----------------- | ------------------ | ---- | -------------------------------------------------- | ------------------------------------------------ |
| `authenticator`   | `Authenticator`    | ✅   | -                                                  | `createAuthenticator` で作成した認証オブジェクト |
| `baseUrl`         | `string`           | -    | `DEFAULT_STREAM_BASE_URL`                          | ストリーミング API のベース URL                  |
| `maxRetries`      | `number`           | -    | `3`                                                | 接続エラー時の最大リトライ回数                   |
| `onError`         | `OnErrorHandler`   | -    | `console.error`                                    | エラー発生時のコールバック                       |
| `interceptors`    | `Interceptor[]`    | -    | -                                                  | 追加の connect-es Interceptor                    |
| `createTransport` | `TransportFactory` | -    | `createGrpcTransport` (`@connectrpc/connect-node`) | カスタムトランスポート作成関数                   |

## AbortSignal による停止

`watch()` に `AbortSignal` を渡すことで、任意のタイミングでストリーム監視を停止できます。

```typescript
const controller = new AbortController()

// 30 秒後に停止
setTimeout(() => controller.abort(), 30_000)

await watcher.watch(controller.signal)
```

プロセスのシグナルハンドリングと組み合わせることもできます。

```typescript
const controller = new AbortController()

process.on('SIGINT', () => controller.abort())
process.on('SIGTERM', () => controller.abort())

await watcher.watch(controller.signal)
```

## 自動再接続

ストリーム接続が切断された場合、指数バックオフで自動的に再接続を試みます。

| リトライ回数 | 待機時間 |
| ------------ | -------- |
| 1 回目       | 1 秒     |
| 2 回目       | 2 秒     |
| 3 回目       | 4 秒     |

接続が成功するとリトライカウンターはリセットされます。`maxRetries` (デフォルト: `3`) を超えてリトライに失敗した場合、元のエラーが throw されます。

> [!WARNING]
> 再接続中に発生したイベントは失われます。イベントの厳密な到達保証が必要な場合は、[Webhook](./events-webhook.md) の使用を検討してください。

## エラーハンドリング

接続エラーとイベント処理エラーは区別されます。

- **接続エラー**: 自動再接続の対象です。`maxRetries` を超えた場合は throw されます
- **イベント処理エラー**: `onError` に委譲され、ストリーム接続は維持されます

```typescript
const watcher = createStreamWatcher(
  {
    authenticator,
    maxRetries: 5,
    onError: (error) => {
      myLogger.error('Stream event error:', error)
    },
  },
  eventHandler,
)
```
