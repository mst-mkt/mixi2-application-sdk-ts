# Cloudflare Workers

Cloudflare Workers へのデプロイ例です。イベントの受信には Webhook を使用します。

## プロジェクトの作成

Cloudflare Workers のプロジェクトを作成します。

```bash
pnpm create cloudflare@latest
```

質問には以下のように回答してください。

- category: `Hello World example`
- type: `Worker only`
- lang: `TypeScript`

## 環境変数

以下の環境変数を Secrets として設定してください。

| 変数名                 | 説明                                | 必須 |
| ---------------------- | ----------------------------------- | ---- |
| `SIGNATURE_PUBLIC_KEY` | Webhook 署名検証用の Ed25519 公開鍵 | ✅   |

API クライアントを利用する場合は、以下も必要です。

| 変数名          | 説明                    |
| --------------- | ----------------------- |
| `CLIENT_ID`     | OAuth 2.0 Client ID     |
| `CLIENT_SECRET` | OAuth 2.0 Client Secret |

## 実装例

fetch の引数から Request オブジェクトを受け取り、Webhook ハンドラーに渡してイベントを処理します。

```typescript
import { createEventHandler } from '@mst-mkt/mixi2-application-sdk-ts/event'
import { createWebhookHandler } from '@mst-mkt/mixi2-application-sdk-ts/event/webhook'

const eventHandler = createEventHandler({
  chatMessageReceived: async ({ message }) => {
    console.log('chatMessageReceived:', `message-id: ${message?.messageId}`)
  },
  postCreated: async ({ post }) => {
    console.log('postCreated:', `post-id: ${post?.postId}`)
  },
})

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'GET') return new Response('OK')

    const webhookHandler = createWebhookHandler(
      { signaturePublicKey: env.SIGNATURE_PUBLIC_KEY, syncHandling: true },
      eventHandler,
    )

    return webhookHandler(request)
  },
}
```

### `wrangler.jsonc`

`nodejs_compat` フラグが必要です。[`compatibility_date`](https://developers.cloudflare.com/workers/configuration/compatibility-dates/) が古い場合、署名検証などの一部機能が動作しない可能性があるため、最新の日付を指定してください。

```jsonc
{
  "compatibility_flags": ["nodejs_compat"],
  "compatibility_date": "2026-03-14",
}
```

## 注意事項

### `syncHandling: true` が必須

Cloudflare Workers はレスポンス返却後にプロセスが終了するため、Webhook ハンドラーの `syncHandling` を `true` に設定する必要があります。`false` (デフォルト) の場合、イベント処理が完了する前にプロセスが終了する可能性があります。

### API クライアントの制約

Cloudflare Workers は `node:http2` をサポートしていないため、SDK デフォルトの gRPC トランスポート (`@connectrpc/connect-node`) は使用できません。API クライアントを利用する場合は、後述の [回避策](#api-クライアントの利用-実験的) を参照してください。

### gRPC ストリーミングは使用不可

Cloudflare Workers では gRPC ストリーミングを利用できません。イベントの受信には Webhook を使用してください。

## API クライアントの利用 (実験的)

> [!WARNING]
> 以下の手法は Cloudflare の内部実装に依存しています。Cloudflare や mixi2 の仕様変更により動作しなくなる可能性があります。自己責任でご利用ください。

> [!IMPORTANT]
> この方法は十分に検証されていません。予期しない動作が発生する可能性があります。

### 背景

gRPC は HTTP/2 を必要とします。SDK デフォルトのトランスポートは `node:http2` を使用しますが、Cloudflare Workers はこのモジュールをサポートしていません。

しかし、Cloudflare Workers の `fetch` は `content-type: application/grpc` を検出すると、 [Cloudflare の gRPC プロキシ](https://blog.cloudflare.com/road-to-grpc/) を経由し、オリジンへ HTTP/2 で接続します。これにより、`node:http2` なしでも gRPC リクエストを送信できます。

`@connectrpc/connect` は HTTP 通信を抽象化しており、トランスポートとして `fetch` API を使用できます。これを利用して、Workers 上で動作する gRPC トランスポートを構築できます。

> [!NOTE]
> この手法は Cloudflare Workers のアウトバウンド `fetch` の挙動に依存しています。Node.js などの環境では動作しない可能性が高いです。

### 実装方法

`@connectrpc/connect` の gRPC トランスポートを Workers の `fetch` で動作するように構成します。

```typescript
import type { Interceptor, Transport } from '@connectrpc/connect'
import { createFetchClient } from '@connectrpc/connect/protocol'
import { createTransport } from '@connectrpc/connect/protocol-grpc'

export function createGrpcTransport(options: {
  baseUrl: string
  interceptors?: Interceptor[]
  fetch?: typeof globalThis.fetch
}): Transport {
  const baseFetch = options.fetch ?? fetch

  // grpc-status ヘッダーが存在しない場合はデフォルト値 '0' (成功) を設定する
  const wrappedFetch: typeof fetch = async (input, init) => {
    const res = await baseFetch(input, init)

    if (!res.headers.has('grpc-status')) {
      const headers = new Headers(res.headers)
      headers.set('grpc-status', '0')

      return new Response(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers,
      })
    }

    return res
  }

  return createTransport({
    httpClient: createFetchClient(wrappedFetch),
    baseUrl: options.baseUrl,
    useBinaryFormat: true,
    interceptors: options.interceptors ?? [],
    acceptCompression: [],
    sendCompression: null,
    readMaxBytes: 0xffffffff,
    writeMaxBytes: 0xffffffff,
    compressMinBytes: 1024,
  })
}
```

### 使用例

`createMixi2Client` の `createTransport` オプションに上記の `createGrpcTransport` を渡します。SDK が認証用の interceptor を自動的に注入します。

```typescript
import { createAuthenticator } from '@mst-mkt/mixi2-application-sdk-ts/auth'
import { createMixi2Client } from '@mst-mkt/mixi2-application-sdk-ts/client'
import { createGrpcTransport } from './transport'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const authenticator = createAuthenticator({
      clientId: env.CLIENT_ID,
      clientSecret: env.CLIENT_SECRET,
    })

    const client = createMixi2Client({
      authenticator,
      createTransport: createGrpcTransport,
    })

    // client を使用して API を呼び出す
  },
}
```
