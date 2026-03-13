# Vercel

Vercel へのデプロイ例です。本番環境では Webhook、ローカル開発では gRPC Stream でイベントを受信します。

## 環境変数

| 変数名                 | 説明                                | 必須 |
| ---------------------- | ----------------------------------- | ---- |
| `CLIENT_ID`            | OAuth 2.0 Client ID                 | ✅   |
| `CLIENT_SECRET`        | OAuth 2.0 Client Secret             | ✅   |
| `SIGNATURE_PUBLIC_KEY` | Webhook 署名検証用の Ed25519 公開鍵 | ✅   |

## 実装例

環境変数 `VERCEL` の有無で、Vercel 上とローカル環境を自動的に切り替えます。

### `api/index.ts`

```typescript
import {
  createAuthenticator,
  createMixi2Client,
  createEventHandler,
  createStreamWatcher,
  createWebhookHandler,
} from '@mst-mkt/mixi2-application-sdk-ts'

const authenticator = createAuthenticator({
  clientId: process.env.CLIENT_ID!,
  clientSecret: process.env.CLIENT_SECRET!,
})

const client = createMixi2Client({ authenticator })

const eventHandler = createEventHandler({
  chatMessageReceived: async ({ message }) => {
    if (message === undefined) return

    await client.sendChatMessage({
      roomId: message.roomId,
      text: 'Hello from Vercel',
    })
  },
  postCreated: async ({ post }) => {
    if (post === undefined) return

    await client.createPost({
      text: 'Hello from Vercel',
      inReplyToPostId: post.postId,
    })
  },
})

// ローカル: gRPC Stream
if (!process.env.VERCEL) {
  const streamWatcher = createStreamWatcher({ authenticator }, eventHandler)
  await streamWatcher.watch()
}

// Vercel: Webhook
const webhookHandler = createWebhookHandler(
  { signaturePublicKey: process.env.SIGNATURE_PUBLIC_KEY!, syncHandling: true },
  eventHandler,
)

export const GET = () => new Response('OK')
export const POST = (request: Request) => webhookHandler(request)
```

### `vercel.json`

全リクエストを API ハンドラーにルーティングします。

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/api" }]
}
```

## 注意事項

### `syncHandling: true` が必須

Vercel はレスポンス返却後にプロセスが終了するため、Webhook ハンドラーの `syncHandling` を `true` に設定する必要があります。`false` (デフォルト) の場合、イベント処理が完了する前にプロセスが終了する可能性があります。

### ローカル開発

ローカルでは gRPC Stream でイベントを受信するため、Webhook URL の設定なしでテストできます。
