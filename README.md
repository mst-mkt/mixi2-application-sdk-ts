# mixi2 Application SDK for TypeScript

mixi2 の Application API を利用するための TypeScript SDK です。

> [!NOTE]
> これは非公式の SDK です。
> 以下を参考に作成されています。
>
> - [mixi2 Developer Platform 公式ドキュメント](https://developer.mixi.social/docs)
> - [mixigroup/mixi2-api](https://github.com/mixigroup/mixi2-api)
> - [mixigroup/mixi2-application-sdk-go](https://github.com/mixigroup/mixi2-application-sdk-go)

## インストール

### npm

[![npm version](https://npmx.dev/api/registry/badge/version/@mst-mkt/mixi2-application-sdk-ts)](https://www.npmjs.com/package/@mst-mkt/mixi2-application-sdk-ts) [![License](https://npmx.dev/api/registry/badge/license/@mst-mkt/mixi2-application-sdk-ts)](./LICENSE) ![Install size](https://npmx.dev/api/registry/badge/size/@mst-mkt/mixi2-application-sdk-ts) ![Downloads](https://npmx.dev/api/registry/badge/downloads/@mst-mkt/mixi2-application-sdk-ts)

```bash
pnpm add @mst-mkt/mixi2-application-sdk-ts
```

### JSR

[![JSR](https://jsr.io/badges/@mst-mkt/mixi2-application-sdk-ts)](https://jsr.io/@mst-mkt/mixi2-application-sdk-ts) [![JSR](https://jsr.io/badges/@mst-mkt/mixi2-application-sdk-ts/total-downloads)](https://jsr.io/@mst-mkt/mixi2-application-sdk-ts) [![JSR Score](https://jsr.io/badges/@mst-mkt/mixi2-application-sdk-ts/score)](https://jsr.io/@mst-mkt/mixi2-application-sdk-ts)

```bash
pnpm add jsr:@mst-mkt/mixi2-application-sdk-ts
```

## 機能

### モジュール

| モジュール                                        | 機能                                                              |
| ------------------------------------------------- | ----------------------------------------------------------------- |
| `@mst-mkt/mixi2-application-sdk-ts/auth`          | OAuth2 Client Credentials 認証                                    |
| `@mst-mkt/mixi2-application-sdk-ts/client`        | mixi2 Application API クライアント (`@connectrpc/connect` を使用) |
| `@mst-mkt/mixi2-application-sdk-ts/event/webhook` | Webhook によるイベント受信                                        |
| `@mst-mkt/mixi2-application-sdk-ts/event/stream`  | gRPC ストリーミングによるイベント受信                             |

### API メソッド

`createMixi2Client()` で作成したクライアントから利用できます。

| メソッド                  | 説明                                        |
| ------------------------- | ------------------------------------------- |
| `getUsers`                | ユーザー情報の取得                          |
| `getPosts`                | ポスト情報の取得                            |
| `createPost`              | ポストの作成 (リプライ, 引用, メディア添付) |
| `initiatePostMediaUpload` | メディアアップロードの開始                  |
| `getPostMediaStatus`      | メディアのアップロード状態の確認            |
| `sendChatMessage`         | チャットメッセージの送信                    |
| `getStamps`               | スタンプセットの取得                        |
| `addStampToPost`          | ポストへのスタンプの追加                    |

## 環境サポート

このライブラリは以下の API を使用しているため、環境により一部機能が利用できない場合があります。

- [`node:http2`](https://nodejs.org/api/http2.html): gRPC のストリーミングに使用 (`@connectrpc/connect-node`)
- [`crypto.subtle`](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto): Webhook の署名検証に使用

| 環境               | `auth` | `client` | `event/webhook` | `event/stream` |
| ------------------ | ------ | -------- | --------------- | -------------- |
| Node.js            | ✅     | ✅       | ✅              | ✅             |
| Deno               | ✅     | ✅       | ✅              | ✅             |
| Bun                | ✅     | ✅       | ✅              | ✅             |
| Cloudflare Workers | ✅     | ❌       | ✅              | ❌             |

### 詳細な対応状況

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

また、ランタイムが対応している場合でも、サーバーレス環境などでストリーム接続が制限されている場合があります。
使用する環境に応じて、Webhook と gRPC ストリーミングのどちらかを選択してください。

## セットアップ

認証とクライアントの作成は、Webhook・gRPC どちらの方式でも共通です。

```typescript
import { createAuthenticator, createMixi2Client } from '@mst-mkt/mixi2-application-sdk-ts'

const authenticator = createAuthenticator({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
})

const client = createMixi2Client({ authenticator })
```

## イベント受信

イベントの受信方法として Webhook と gRPC ストリーミングの2つをサポートしています。

- [Webhook の実装例](./example/webhook)
- TODO: [gRPC ストリーミングの実装例](./example/stream)

## 開発

### ツール

- [mise](https://mise.jdx.dev)
  - Node.js
  - pnpm
  - pinact

### スクリプト

```bash
pnpm generate  # proto から TypeScript コードを生成
pnpm build     # ビルド
pnpm test      # テスト
```

</details>

## ライセンス

[Apache License 2.0](LICENSE)
