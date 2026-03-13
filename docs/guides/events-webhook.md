# Webhook

`createWebhookHandler` に署名検証用の公開鍵と[イベントハンドラー](./events.md)を渡すことで、Webhook ハンドラーを作成できます。サーバーレス環境 (Cloudflare Workers, Vercel, Deno Deploy など) に適しています。

## 前提

Webhook を利用するには以下の情報が必要です。

- 署名検証用の公開鍵

これ以降は `SIGNATURE_PUBLIC_KEY` として説明します。公開鍵の取得方法については [Getting Started](../getting-started.md) を参照してください。

## Webhook ハンドラーの作成

```typescript
import { createEventHandler, createWebhookHandler } from '@mst-mkt/mixi2-application-sdk-ts'

const eventHandler = createEventHandler({
  postCreated: async ({ post, issuer }) => {
    console.log('ポストが作成されました:', post?.text)
  },
  chatMessageReceived: async ({ message, issuer }) => {
    console.log('メッセージを受信しました:', message?.text)
  },
})

const webhookHandler = createWebhookHandler(
  { signaturePublicKey: SIGNATURE_PUBLIC_KEY },
  eventHandler,
)
```

返り値は `(request: Request) => Promise<Response>` 型の関数です。Web 標準の `Request` / `Response` を使用するため、これらをサポートする任意の環境で動作します。

## エンドポイントへの割り当て

プラットフォームやフレームワークに応じて、Webhook ハンドラーをエンドポイントに割り当てます。

```typescript
// Deno
Deno.serve(webhookHandler)

// Vercel
export const POST = (request: Request) => webhookHandler(request)

// Cloudflare Workers
export default {
  async fetch(request: Request, env: Env) {
    return webhookHandler(request)
  },
}

// hono
const app = new Hono()
app.mount('/webhook', webhookHandler)
```

## 設定項目

`createWebhookHandler` の第 1 引数は `WebhookHandlerConfig` を受け取ります。

| プロパティ           | 型               | 必須 | デフォルト値    | 説明                                      |
| -------------------- | ---------------- | ---- | --------------- | ----------------------------------------- |
| `signaturePublicKey` | `string`         | ✅   | -               | 署名検証に使用する公開鍵                  |
| `syncHandling`       | `boolean`        | -    | `false`         | `true` の場合、イベントを同期的に処理する |
| `onError`            | `OnErrorHandler` | -    | `console.error` | エラー発生時のコールバック                |

## 同期 / 非同期ハンドリング

mixi2 の Webhook には 3 秒のタイムアウトが設定されています。タイムアウト後、最大 3 回 (30 秒間隔) のリトライが行われます。

### 非同期 (デフォルト)

レスポンス (204) を即座に返し、イベント処理はバックグラウンドで実行します。常駐型サーバー環境に適しています。

### 同期 (`syncHandling: true`)

イベント処理が完了してからレスポンスを返します。サーバーレス環境ではレスポンス後にプロセスが終了する場合があるため、`syncHandling: true` を指定してください。

> [!WARNING]
> 同期モードでは 3 秒のタイムアウト以内に処理を完了する必要があります。

```typescript
const webhookHandler = createWebhookHandler(
  { signaturePublicKey: SIGNATURE_PUBLIC_KEY, syncHandling: true },
  eventHandler,
)
```

## 署名検証

SDK は Webhook リクエストの署名検証を自動で行います。Webhook URL の有効化時に送信される検証リクエストへの応答も SDK が自動で処理するため、開発者が署名検証を実装する必要はありません。

内部では以下の流れで検証が行われています。

1. リクエストヘッダーから署名とタイムスタンプを取得
   - `x-mixi2-application-event-signature`: Ed25519 署名 (Base64)
   - `x-mixi2-application-event-timestamp`: Unix タイムスタンプ (秒)
2. タイムスタンプが現在時刻から ±5 分以内であることを確認
3. Ed25519 署名をリクエストボディとタイムスタンプから検証

## レスポンスステータス

Webhook ハンドラーは以下のレスポンスステータスを返します。

| ステータス | 条件                                         |
| ---------- | -------------------------------------------- |
| 204        | 正常処理                                     |
| 400        | リクエストボディのパースに失敗               |
| 401        | 署名・タイムスタンプ検証に失敗、ヘッダー不足 |
| 405        | POST 以外のメソッド                          |
| 500        | リクエストボディの読み取りに失敗             |

## エラーハンドリング

イベント処理中にエラーが発生した場合、`onError` コールバックに委譲されます。デフォルトでは `console.error` にログが出力されます。

```typescript
const webhookHandler = createWebhookHandler(
  {
    signaturePublicKey: SIGNATURE_PUBLIC_KEY,
    onError: (error) => {
      myLogger.error('Webhook event error:', error)
    },
  },
  eventHandler,
)
```

個別のイベント処理エラーは他のイベントの処理に影響しません。1 つのリクエストに含まれる複数のイベントは順次処理され、エラーが発生しても残りのイベントは引き続き処理されます。
