# mixi2 Application SDK for TypeScript

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
| Cloudflare Workers | ✅     | ❌       | ✅              | ❌             |

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
- Cloudflare Workers: 非対応
  - `crypto.subtle`: 2023-04-28 以降 (ref: https://developers.cloudflare.com/workers/platform/changelog/#2023-04-28)
  - `node:http2`: 非対応 (ref: https://developers.cloudflare.com/workers/runtime-apis/nodejs/#supported-nodejs-apis)

</details>

> [!TIP]
> サーバーレス環境ではランタイムが対応していても gRPC ストリーミングが利用できない場合があります。環境に応じて Webhook と gRPC ストリーミングを使い分けてください。

## 機能

| モジュール                                        | 説明                                  |
| ------------------------------------------------- | ------------------------------------- |
| `@mst-mkt/mixi2-application-sdk-ts/auth`          | OAuth2 Client Credentials 認証        |
| `@mst-mkt/mixi2-application-sdk-ts/client`        | mixi2 Application API クライアント    |
| `@mst-mkt/mixi2-application-sdk-ts/event`         | イベントハンドラーの定義              |
| `@mst-mkt/mixi2-application-sdk-ts/event/webhook` | Webhook によるイベント受信            |
| `@mst-mkt/mixi2-application-sdk-ts/event/stream`  | gRPC ストリーミングによるイベント受信 |

## 使い方

### API

`createAuthenticator` で認証情報を設定し、`createMixi2Client` で API クライアントを作成します。

```typescript
import { createAuthenticator } from '@mst-mkt/mixi2-application-sdk-ts/auth'
import { createMixi2Client } from '@mst-mkt/mixi2-application-sdk-ts/client'

const authenticator = createAuthenticator({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
})

const client = createMixi2Client({ authenticator })

const { posts } = await client.getPosts({ postIdList: ['5efb4595-fe2d-4c52-b078-b85020385955'] })
```

### Event Handling

mixi2 からのイベント (投稿作成, チャット受信) を処理するハンドラーを定義します。
Webhook と gRPC ストリーミングの両方で共通のハンドラーを利用できます。

```typescript
import { createEventHandler } from '@mst-mkt/mixi2-application-sdk-ts/event'

const eventHandler = createEventHandler({
  chatMessageReceived: async ({ message }) => {
    // チャット受信時の処理
  },
  postCreated: async ({ post }) => {
    // 投稿 (引用, メンション, リプライ) 作成時の処理
  },
})
```

#### Webhook

イベントハンドラーと署名検証用の公開鍵から Webhook ハンドラーを作成します。

```typescript
import { createWebhookHandler } from '@mst-mkt/mixi2-application-sdk-ts/event/webhook'

const webhookHandler = createWebhookHandler(
  { signaturePublicKey: SIGNATURE_PUBLIC_KEY },
  eventHandler,
)
```

返り値は `(req: Request) => Promise<Response>` 型の関数で、Web 標準の Request / Response を使う任意の環境で動作します。

#### gRPC Stream

イベントハンドラーと認証情報から gRPC ストリーミングのウォッチャーを作成します。

```typescript
import { createStreamWatcher } from '@mst-mkt/mixi2-application-sdk-ts/event/stream'

const streamWatcher = createStreamWatcher({ authenticator }, eventHandler)
await streamWatcher.watch()
```

`watch()` は `AbortSignal` を渡すことで、任意のタイミングで監視を停止できます。

### 環境変数

| 変数名                 | 使用先                 | 取得元                                                                                 |
| ---------------------- | ---------------------- | -------------------------------------------------------------------------------------- |
| `CLIENT_ID`            | `createAuthenticator`  | [Developer Platform](https://developer.mixi.social/docs) > アプリケーション > 認証情報 |
| `CLIENT_SECRET`        | `createAuthenticator`  | [Developer Platform](https://developer.mixi.social/docs) > アプリケーション > 認証情報 |
| `SIGNATURE_PUBLIC_KEY` | `createWebhookHandler` | [Developer Platform](https://developer.mixi.social/docs) > アプリケーション > Webhook  |

## 実装例

- [Deno Deploy](./example/deno-deploy) - Webhook (デプロイ) / gRPC Stream (ローカル開発)
- [Vercel](./example/vercel) - Webhook (デプロイ) / gRPC Stream (ローカル開発)
- [Cloudflare Workers](./example/cloudflare-workers) - Webhook のみ

## 開発

[CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

## ライセンス

[Apache License 2.0](LICENSE)
