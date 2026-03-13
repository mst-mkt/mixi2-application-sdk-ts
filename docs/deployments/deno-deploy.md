# Deno Deploy

Deno Deploy へのデプロイ例です。本番環境では Webhook、ローカル開発では gRPC Stream でイベントを受信します。

## 環境変数

| 変数名                 | 説明                                | 必須 |
| ---------------------- | ----------------------------------- | ---- |
| `CLIENT_ID`            | OAuth 2.0 Client ID                 | ✅   |
| `CLIENT_SECRET`        | OAuth 2.0 Client Secret             | ✅   |
| `SIGNATURE_PUBLIC_KEY` | Webhook 署名検証用の Ed25519 公開鍵 | ✅   |

## 実装例

環境変数 `DENO_DEPLOYMENT_ID` の有無で、Deno Deploy 上とローカル環境を自動的に切り替えます。

```typescript
import {
  createAuthenticator,
  createMixi2Client,
  createEventHandler,
  createStreamWatcher,
  createWebhookHandler,
} from '@mst-mkt/mixi2-application-sdk-ts'

const authenticator = createAuthenticator({
  clientId: Deno.env.get('CLIENT_ID')!,
  clientSecret: Deno.env.get('CLIENT_SECRET')!,
})

const client = createMixi2Client({ authenticator })

const eventHandler = createEventHandler({
  chatMessageReceived: async ({ message }) => {
    if (message === undefined) return

    await client.sendChatMessage({
      roomId: message.roomId,
      text: 'Hello from Deno Deploy',
    })
  },
  postCreated: async ({ post }) => {
    if (post === undefined) return

    await client.createPost({
      text: 'Hello from Deno Deploy',
      inReplyToPostId: post.postId,
    })
  },
})

if (Deno.env.has('DENO_DEPLOYMENT_ID')) {
  // Deno Deploy: Webhook
  const webhookHandler = createWebhookHandler(
    { signaturePublicKey: Deno.env.get('SIGNATURE_PUBLIC_KEY')!, syncHandling: true },
    eventHandler,
  )
  Deno.serve(webhookHandler)
} else {
  // ローカル: gRPC Stream
  const streamWatcher = createStreamWatcher({ authenticator }, eventHandler)
  await streamWatcher.watch()
}
```

## 注意事項

### `syncHandling: true` が必須

Deno Deploy はレスポンス返却後にプロセスが終了するため、Webhook ハンドラーの `syncHandling` を `true` に設定する必要があります。`false` (デフォルト) の場合、イベント処理が完了する前にプロセスが終了する可能性があります。

### ローカル開発

ローカルでは gRPC Stream でイベントを受信するため、Webhook URL の設定なしでテストできます。

```bash
deno run --env-file --watch --allow-env --allow-net main.ts
```
