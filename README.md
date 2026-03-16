# mixi2 Application SDK for TypeScript

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/mst-mkt/mixi2-application-sdk-ts) [![Actions: CI](https://github.com/mst-mkt/mixi2-application-sdk-ts/actions/workflows/ci.yaml/badge.svg)](https://github.com/mst-mkt/mixi2-application-sdk-ts/actions/workflows/ci.yaml) [![License](https://img.shields.io/npm/l/@mst-mkt/mixi2-application-sdk-ts)](https://github.com/mst-mkt/mixi2-application-sdk-ts?tab=Apache-2.0-1-ov-file) [![Stargazers](https://img.shields.io/github/stars/mst-mkt/mixi2-application-sdk-ts?style=social)](https://github.com/mst-mkt/mixi2-application-sdk-ts/stargazers)

mixi2 の Application API を利用するための TypeScript SDK です。

> [!NOTE]
> この SDK は mixi 公式ではありません。
> 以下の公式リソースをもとに開発しています。
>
> - [mixi2 Developer Platform 公式ドキュメント](https://developer.mixi.social/docs)
> - [mixigroup/mixi2-api](https://github.com/mixigroup/mixi2-api)
> - [mixigroup/mixi2-application-sdk-go](https://github.com/mixigroup/mixi2-application-sdk-go)

## インストール

### npm

[![npm version](https://npmx.dev/api/registry/badge/version/@mst-mkt/mixi2-application-sdk-ts)](https://npmx.dev/package/@mst-mkt/mixi2-application-sdk-ts) [![License](https://npmx.dev/api/registry/badge/license/@mst-mkt/mixi2-application-sdk-ts)](./LICENSE) [![Install size](https://npmx.dev/api/registry/badge/size/@mst-mkt/mixi2-application-sdk-ts)](https://npmx.dev/package/@mst-mkt/mixi2-application-sdk-ts) [![Downloads](https://npmx.dev/api/registry/badge/downloads/@mst-mkt/mixi2-application-sdk-ts)](https://npmx.dev/package/@mst-mkt/mixi2-application-sdk-ts?modal=chart)

```bash
pnpm add @mst-mkt/mixi2-application-sdk-ts
```

### JSR

[![JSR](https://jsr.io/badges/@mst-mkt/mixi2-application-sdk-ts)](https://jsr.io/@mst-mkt/mixi2-application-sdk-ts) [![JSR](https://jsr.io/badges/@mst-mkt/mixi2-application-sdk-ts/total-downloads)](https://jsr.io/@mst-mkt/mixi2-application-sdk-ts/versions) [![JSR Score](https://jsr.io/badges/@mst-mkt/mixi2-application-sdk-ts/score)](https://jsr.io/@mst-mkt/mixi2-application-sdk-ts/score)

```bash
deno add jsr:@mst-mkt/mixi2-application-sdk-ts
```

## 環境サポート

このライブラリは以下のランタイム API に依存しており、環境によって利用できる機能が異なります。

- [`node:http2`](https://nodejs.org/api/http2.html): gRPC ストリーミングに使用
- [`crypto.subtle`](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto): Webhook の署名検証に使用

| 環境               | `auth` | `client` | `event/webhook` | `event/stream` |
| ------------------ | ------ | -------- | --------------- | -------------- |
| Node.js            | ✅     | ✅       | ✅              | ✅             |
| Deno               | ✅     | ✅       | ✅              | ✅             |
| Bun                | ✅     | ✅       | ✅              | ✅             |
| Cloudflare Workers | ✅     | ⚠️       | ✅              | ❌             |

<details><summary>詳細な対応状況</summary>

- Node.js: 18.4.0 以降
  - `crypto.subtle`: 18.4.0 以降 (ref: https://nodejs.org/en/blog/release/v18.4.0#notable-changes)
  - `node:http2`: 10.10.0 以降 (ref: https://nodejs.org/en/blog/release/v10.10.0#notable-changes)
- Deno: 1.26.0 以降
  - `crypto.subtle`: 1.26.0 以降 (ref: https://deno.com/blog/v1.26#webcrypto-secure-curves)
  - `node:http2`: 1.37.0 以降 (ref: https://deno.com/blog/v1.37#nodejs-compatibility-improvements)
- Bun: 0.5.7 以降
  - `crypto.subtle`: 0.5.7 以降 (ref: https://bun.sh/blog/bun-v0.5.7#changelog)
  - `node:http2`: 1.0.13 以降 (ref: https://bun.sh/blog/bun-v1.0.13#http2-client-support)
- Cloudflare Workers: 実験的対応
  - `crypto.subtle`: 2023-04-28 以降 (ref: https://developers.cloudflare.com/workers/platform/changelog/#2023-04-28)
  - `node:http2`: 非対応 (ref: https://developers.cloudflare.com/workers/runtime-apis/nodejs/#supported-nodejs-apis)
    - `node:http2` を回避して利用する方法がある (ref: [docs/deployments/cloudflare-workers](./docs/deployments/cloudflare-workers.md#api-クライアントの利用-実験的))

</details>

> [!TIP]
> サーバーレス環境ではランタイムが対応していても gRPC ストリーミングが利用できない場合があります。環境に応じて Webhook と gRPC ストリーミングを使い分けてください。

## 使い方

詳細な使い方については [ドキュメント](./docs/getting-started.md) を参照してください。

<details><summary>For LLM, Coding Agents</summary>

This library includes documentation in the package. The best way to access it is to check the local node_modules. If that's not possible, you can refer to the documentation at [https://github.com/mst-mkt/mixi2-application-sdk-ts/tree/main/docs](https://github.com/mst-mkt/mixi2-application-sdk-ts/tree/main/docs).

</details>

### API クライアント

`createAuthenticator` で認証情報を設定し、`createMixi2Client` で API クライアントを作成します。

```typescript
import { createAuthenticator, createMixi2Client } from '@mst-mkt/mixi2-application-sdk-ts'

const authenticator = createAuthenticator({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
})

const client = createMixi2Client({ authenticator })

const { posts } = await client.getPosts({ postIdList: ['5efb4595-fe2d-4c52-b078-b85020385955'] })
```

[API クライアントの詳細 >](./docs/guides/client.md)

### イベント処理

mixi2 からのイベント (投稿作成, チャット受信) を処理するハンドラーを定義します。Webhook と gRPC ストリーミングの両方で共通のハンドラーを利用できます。

```typescript
import { createEventHandler } from '@mst-mkt/mixi2-application-sdk-ts'

const eventHandler = createEventHandler({
  chatMessageReceived: async ({ message }) => {
    // チャット受信時の処理
  },
  postCreated: async ({ post }) => {
    // 投稿 (引用, メンション, リプライ) 作成時の処理
  },
})
```

[イベント処理の詳細 >](./docs/guides/events.md)

### Webhook

イベントハンドラーと署名検証用の公開鍵から Webhook ハンドラーを作成します。返り値は `(req: Request) => Promise<Response>` 型の関数で、Web 標準の Request / Response を使う任意の環境で動作します。

```typescript
import { createWebhookHandler } from '@mst-mkt/mixi2-application-sdk-ts'

const webhookHandler = createWebhookHandler(
  { signaturePublicKey: SIGNATURE_PUBLIC_KEY },
  eventHandler,
)
```

[Webhook の詳細 >](./docs/guides/events-webhook.md)

### gRPC Stream

イベントハンドラーと認証情報から gRPC ストリーミングのウォッチャーを作成します。`watch()` は `AbortSignal` を渡すことで、任意のタイミングで監視を停止できます。

```typescript
import { createStreamWatcher } from '@mst-mkt/mixi2-application-sdk-ts'

const streamWatcher = createStreamWatcher({ authenticator }, eventHandler)
await streamWatcher.watch()
```

[gRPC Stream の詳細 >](./docs/guides/events-stream.md)

## デプロイ

- **Deno Deploy**
  - [ドキュメント: docs/deployments/deno-deploy.md](./docs/deployments/deno-deploy.md)
  - [実装例: mixi2-example-deno-deploy](./example/deno-deploy)
- **Vercel**
  - [ドキュメント: docs/deployments/vercel.md](./docs/deployments/vercel.md)
  - [実装例: mixi2-example-vercel](./example/vercel)
- **Cloudflare Workers**
  - [ドキュメント: docs/deployments/cloudflare-workers.md](./docs/deployments/cloudflare-workers.md)
  - [実装例: mixi2-example-cloudflare-workers](./example/cloudflare-workers)

## 開発

[CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

## ライセンス

[Apache License 2.0](LICENSE)
