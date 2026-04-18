---
name: mixi2-application-sdk-ts
description: |
  mixi2 Application API の非公式 TypeScript SDK (@mst-mkt/mixi2-application-sdk-ts)。
  認証, API クライアント, イベントハンドラ (Webhook, gRPC Stream) を提供する。
  @mst-mkt/mixi2-application-sdk-ts を使って実装する場面で使用する。
---

# mixi2 Application SDK for TypeScript

`@mst-mkt/mixi2-application-sdk-ts` は mixi2 の Application API を利用するための TypeScript SDK。
このスキルは SDK の利用方法の概要と各ドキュメントへの参照を提供し、SDK を使って実装する場面で使用することを想定している。

## API クライアント

mixi2 Application API を呼び出すためのクライアント。
内部では gRPC を用いて API サーバーと通信する。デフォルトの transport は `@connectrpc/connect-node` の `createGrpcTransport` が使われるが、必要に応じてカスタム transport を渡すこともできる。

```ts
import { createAuthenticator, createMixi2Client } from '@mst-mkt/mixi2-application-sdk-ts'

const authenticator = createAuthenticator({
  clientId: process.env.CLIENT_ID!,
  clientSecret: process.env.CLIENT_SECRET!,
})
const client = createMixi2Client({ authenticator })

const { posts } = await client.getPosts({ postIdList: ['...'] })
```

主なメソッドは次のとおり。

- `getUsers`: ユーザー取得
- `getPosts`: ポスト取得
- `createPost`: ポスト作成 (返信、引用、メディア添付に対応。テキストは 149 文字まで、メディアは最大 4 件)
- `deletePost`: 自身が作成したポストの削除
- `sendChatMessage`: ダイレクトメッセージ送信 (ユーザーからの DM 受信後のみ返信可能。`text` または `mediaId` のいずれか必須)
- `getStamps`: スタンプ一覧取得
- `addStampToPost`: ポストへのスタンプ付与 (アプリケーションにメンションしているポストのみ対象, 公式スタンプのみ付与可能)
- `initiatePostMediaUpload`: メディアアップロード開始
- `getPostMediaStatus`: メディアアップロード状態取得

引数や返り値などの詳細は `docs/guides/client.md` に記載されている。

認証トークンは `authenticator` が自動取得しキャッシュする。(有効期限の 60 秒前に再取得)

## イベントを受ける

Webhook と gRPC Stream の 2 方式がある。
イベントは順序保証なし、Best-effort 配信。

| 条件                      | Webhook                        | gRPC Stream                    |
| ------------------------- | ------------------------------ | ------------------------------ |
| 用途                      | HTTPS に対応したサーバー環境   | ローカル開発やプロトタイピング |
| 公開 HTTPS エンドポイント | 必要                           | 不要                           |
| 常駐プロセス              | 不要                           | 必要                           |
| 配信失敗時                | 最大 3 回リトライ (重複可能性) | 切断中のイベントは失われる     |
| 認証                      | SDK が Ed25519 署名を検証      | SDK がアクセストークンを付与   |

### イベントハンドラ (Webhook, gRPC Stream 共通)

```ts
import { createEventHandler, EventReason } from '@mst-mkt/mixi2-application-sdk-ts'

const eventHandler = createEventHandler({
  postCreated: async (event) => {
    // event.post, event.issuer, event.eventReasonList: EventReason[]
    if (event.eventReasonList.includes(EventReason.POST_REPLY)) {
      /* ... */
    }
  },
  chatMessageReceived: async (event) => {
    // event.message, event.eventReasonList
  },
})
```

| `EventType`             | `eventReasonList` の値                        | ハンドラ              |
| ----------------------- | --------------------------------------------- | --------------------- |
| `POST_CREATED`          | `POST_REPLY`, `POST_MENTIONED`, `POST_QUOTED` | `postCreated`         |
| `CHAT_MESSAGE_RECEIVED` | `DIRECT_MESSAGE_RECEIVED`                     | `chatMessageReceived` |

- 各ハンドラは省略可能。第 2 引数で生の `Event` も受け取れる
- `eventReasonList` は配列で、複数理由が同時に立ちうる
- `PING` イベントは SDK が自動スキップするためハンドラには届かない
- ハンドラ内のエラーは `onError` (デフォルト `console.error`) に委譲され、他イベントの処理には影響しない

### Webhook で受信する

```ts
import { createWebhookHandler } from '@mst-mkt/mixi2-application-sdk-ts'

const webhookHandler = createWebhookHandler(
  {
    signaturePublicKey: process.env.SIGNATURE_PUBLIC_KEY!,
    syncHandling: true, // サーバーレスでは必須
  },
  eventHandler,
)
```

webhookHandler は Web 標準 Request, Response を受ける任意のプラットフォームやフレームワークで使える

```ts
// 例: Vercel
export const POST = (req: Request) => webhookHandler(req)
```

```ts
// 例: Hono
import { Hono } from 'hono'

const app = new Hono()
app.mount('/events', webhookHandler)

export default app
```

- `signaturePublicKey` は mixi2 Developer Platform で発行された公開鍵を指定する
- mixi2 側のタイムアウトは 3 秒。失敗時は 30 秒間隔で最大 3 回リトライされる
- リトライで同じイベントが重複して届きうるため、アプリケーション側で冪等性を確保する
- サーバーレス環境 (Vercel, Deno Deploy, Cloudflare Workers など) では `syncHandling: true` が必須
  - 省略するとレスポンス後にプロセスが終了しハンドラが中断する
  - 同期モードでは 3 秒以内に処理を完了する必要がある
- POST 以外のリクエストには 405 を返す

### gRPC Stream で受信する

```ts
import { createStreamWatcher } from '@mst-mkt/mixi2-application-sdk-ts'

const watcher = createStreamWatcher({ authenticator }, eventHandler)

const controller = new AbortController()
await watcher.watch(controller.signal)
```

- 接続エラー時は指数バックオフ (1s -> 2s -> 4s) で最大 3 回再接続する。接続成功でカウンターはリセット
- `maxRetries` (デフォルト 3) を超えたら元のエラーが throw される
- 再接続中に発生したイベントは失われる。厳密な到達保証が必要なら Webhook を使う

## メディア付き投稿

4 段階で実行する。詳細は `docs/guides/client.md` の「メディアのアップロード」を参照。

1. `client.initiatePostMediaUpload({ mediaType, contentType, dataSize })` で `uploadUrl` と `mediaId` を取得する
2. `uploadUrl` に SDK の外で POST でバイナリをアップロードする。`Content-Type` と `Authorization: Bearer <accessToken>` ヘッダが必要
3. `client.getPostMediaStatus({ mediaId })` の `status` が `3` (`STATUS_COMPLETED`) になるまでポーリングする
4. `client.createPost({ text, mediaIdList: [mediaId] })` でポストに添付する (最大 4 件)

制約: 最大サイズは画像 15 MB, 動画 50 MB。アップロード有効期限は画像 200 秒, 動画 600 秒。

```ts
const { mediaId, uploadUrl } = await client.initiatePostMediaUpload({
  mediaType: 1, // 1: IMAGE, 2: VIDEO
  contentType: 'image/jpeg',
  dataSize: BigInt(imageData.byteLength),
})

const accessToken = await authenticator.getAccessToken()

await fetch(uploadUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'image/jpeg',
    Authorization: `Bearer ${accessToken}`,
  },
  body: imageData,
})
```

## 詳細情報

- 利用者ガイド
  - 参照
    - npm package: `node_modules/@mst-mkt/mixi2-application-sdk-ts/docs/`
    - GitHub: https://github.com/mst-mkt/mixi2-application-sdk-ts/blob/main/docs/
  - 構成
    - `getting-started.md`
    - `guides/`
      - `guides/client.md`
      - `guides/events.md`
      - `guides/events-webhook.md`
      - `guides/events-stream.md`
    - `deployments/`
      - `deployments/vercel.md`
      - `deployments/deno-deploy.md`
      - `deployments/cloudflare-workers.md`
- 実装サンプル: https://github.com/mst-mkt/mixi2-application-sdk-ts/tree/main/example
- mixi2 Developer Platform 公式ドキュメント: https://developer.mixi.social/docs/llms-full.txt
- Protobuf 定義: https://github.com/mixigroup/mixi2-api
- 公式 SDK (Go): https://github.com/mixigroup/mixi2-application-sdk-go
