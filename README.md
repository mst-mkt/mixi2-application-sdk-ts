# mixi2 Application SDK for TypeScript

mixi2 の Application API を利用するための TypeScript SDK です。

> [!NOTE]
> これは非公式の SDK です。公式の Go SDK は [mixigroup/mixi2-application-sdk-go](https://github.com/mixigroup/mixi2-application-sdk-go) を参照してください。

## インストール

TODO: npm, jsr へ publish

## 機能

| モジュール                               | 機能                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| `mixi2-application-sdk-ts/auth`          | OAuth2 Client Credentials 認証（アクセストークンの取得・キャッシュ・自動更新） |
| `mixi2-application-sdk-ts/client`        | mixi2 Application API クライアント                                             |
| `mixi2-application-sdk-ts/event`         | イベントハンドリングのインターフェース定義                                     |
| `mixi2-application-sdk-ts/event/webhook` | HTTP Webhook によるイベント受信                                                |
| `mixi2-application-sdk-ts/event/stream`  | gRPC ストリーミングによるイベント受信                                          |

## クイックスタート

### 認証

```typescript
import { createAuthenticator } from 'mixi2-application-sdk-ts/auth'

const authenticator = createAuthenticator({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  tokenUrl: TOKEN_URL,
})

// アクセストークンを取得
const token = await authenticator.getAccessToken()
```

### Webhook サーバー

[Example](./example/webhook)

```typescript
import { createGrpcTransport } from '@connectrpc/connect-node'
import { createAuthenticator } from 'mixi2-application-sdk-ts/auth'
import { createMixi2Client } from 'mixi2-application-sdk-ts/client'
import type { EventHandler } from 'mixi2-application-sdk-ts/event'
import { createWebhookHandler } from 'mixi2-application-sdk-ts/event/webhook'

const authenticator = createAuthenticator({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  tokenUrl: TOKEN_URL,
})

const client = createMixi2Client({
  transport: createGrpcTransport({
    baseUrl: API_ADDRESS,
    interceptors: [authenticator.createInterceptor()],
  }),
})

const eventHandler: EventHandler = {
  handle: async (event) => {
    console.log('Received event:', event)
  },
}

const webhookHandler = createWebhookHandler(
  { signaturePublicKey: SIGNATURE_PUBLIC_KEY },
  eventHandler,
)

export const POST = (request: Request) => webhookHandler(request)
```

### gRPC ストリーミング

TODO: gRPC の Example を作成

```typescript
import { createGrpcTransport } from '@connectrpc/connect-node'
import { createAuthenticator } from 'mixi2-application-sdk-ts/auth'
import type { EventHandler } from 'mixi2-application-sdk-ts/event'
import { createStreamWatcher } from 'mixi2-application-sdk-ts/event/stream'

const authenticator = createAuthenticator({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  tokenUrl: TOKEN_URL,
})

const transport = createGrpcTransport({
  baseUrl: API_ADDRESS,
  interceptors: [authenticator.createInterceptor()],
})

const eventHandler: EventHandler = {
  handle: async (event) => {
    console.log('Received event:', event)
  },
}

const watcher = createStreamWatcher({ transport }, eventHandler)

const controller = new AbortController()
await watcher.watch(controller.signal)
```

## 開発

### 必要なツール

- [mise](https://mise.jdx.dev): 以下のツールを管理
  - Node.js
  - pnpm

### スクリプト

- `pnpm generate` (proto から TypeScript コードを生成)
- `pnpm build`
- `pnpm test`
- `pnpm check:lint`
- `pnpm check:fmt`
- `pnpm check:types`
- `pnpm fix:lint`
- `pnpm fix:fmt`

## ライセンス

TODO: ライセンスの追加
