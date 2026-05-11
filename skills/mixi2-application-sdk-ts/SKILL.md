---
name: mixi2-application-sdk-ts
description: |
  mixi2 Application API の非公式 TypeScript SDK (@mst-mkt/mixi2-application-sdk-ts)。
  認証, API クライアント, イベントハンドラ (Webhook, gRPC Stream) を提供する。
  @mst-mkt/mixi2-application-sdk-ts を使って実装する場面で使用する。
  mixi2 上で動作する Bot やコミュニティ Plugin の開発に利用できる。
---

# mixi2 Application SDK for TypeScript

`@mst-mkt/mixi2-application-sdk-ts` は mixi2 の Application API を利用するための TypeScript SDK。
このスキルは SDK の利用方法の概要と各ドキュメントへの参照を提供し、SDK を使って実装する場面で使用することを想定している。

## アプリケーション種別

mixi2 のアプリケーションには 2 種類ある。SDK はどちらにも同じ API クライアント/イベントハンドラで対応する。

| 種別   | 概要                                                 | 受信イベント                                                                         | 利用 API                        |
| ------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------- |
| Bot    | ユーザー向けの基本アプリケーション                   | リプライ, メンション, 引用, DM                                                       | 基本 API                        |
| Plugin | コミュニティ管理者がインストールする拡張型 (最大 10) | Bot のイベントに加え, コミュニティ内ポスト作成, メンバー参加退出, Plugin の導入/削除 | 基本 API + コミュニティ操作 API |

Plugin はコミュニティに要求する **パーミッション** と受信したい **イベント** を _Requirement_ として宣言する必要がある。詳細は `docs/guides/plugin.md` を参照。

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

主なメソッドは次のとおり (Bot, Plugin 共通)。

- `getUsers`: ユーザー取得
- `getPosts`: ポスト取得
- `getCommunities`: 指定したコミュニティ ID の情報を取得
- `createPost`: ポスト作成 (返信、引用、コミュニティ投稿、メディア添付に対応。テキストは 149 文字まで、メディアは最大 4 件。`communityId` を指定するとコミュニティへ投稿: Plugin の `Community.Post.Create` パーミッションが必要)
- `deletePost`: 自身が作成したポストの削除
- `sendChatMessage`: ダイレクトメッセージ送信 (ユーザーからの DM 受信後のみ返信可能。`text` または `mediaId` のいずれか必須)
- `getStamps`: スタンプ一覧取得 (`officialStampLanguage` で公式スタンプ、`communityIds` で対象コミュニティのコミュニティスタンプを取得)
- `addStampToPost`: ポストへのスタンプ付与 (対象はアプリケーションにメンションしているポストまたは Plugin がインストールされているコミュニティ内のポスト。公式スタンプは常に利用可能。コミュニティスタンプはコミュニティポストにのみ付与可能で `Community.Post.Stamp.Create` パーミッションが必要)
- `initiatePostMediaUpload`: メディアアップロード開始
- `getPostMediaStatus`: メディアアップロード状態取得

Plugin 固有のメソッド (`docs/guides/plugin.md` を参照)。

- `getCommunitiesUsingApplication`: Plugin がインストールされているコミュニティと各コミュニティが使用中のアプリケーションバージョン一覧を取得 (ページングは `nextCursor` → `cursor`)
- `getCommunityTimeline`: コミュニティのタイムライン (ポスト一覧) を取得 (`Community.Post.Read`。`untilCursor` / `sinceCursor` でページング)
- `getCommunityMemberList`: コミュニティのメンバー一覧を取得 (`Community.MemberList.Read`。ページングは `nextPaginationCursor` → `paginationCursor`)
- `restrictCommunityPost`: コミュニティのポストをタイムラインから非表示にする (ポストは削除されない。`Community.Post.Restrict`)
- `sendDirectMessageToCommunityMember`: コミュニティメンバーへ DM 送信 (`Community.Member.DirectMessage.Create`。`text` または `mediaIds` のいずれか必須)

引数や返り値などの詳細は `docs/guides/client.md` および `docs/guides/plugin.md` に記載されている。

認証トークンは `authenticator` が自動取得しキャッシュする。(有効期限の 60 秒前に再取得)

レート制限は全 RPC 共通で 1 分あたり 20 回 (`initiatePostMediaUpload` のみ 1 時間あたり 200 回も追加で適用)。メディアアップロード総量は 1 GB / 日。`subscribeEvents` (gRPC ストリーム) には回数制限なし。

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
    // event.post, event.issuer, event.postedCommunity, event.eventReasonList: EventReason[]
    if (event.eventReasonList.includes(EventReason.POST_REPLY)) {
      /* ... */
    }
  },
  chatMessageReceived: async (event) => {
    // event.message, event.issuer, event.eventReasonList
  },
  communityMemberChanged: async (event) => {
    // event.community, event.member, event.eventReasonList (Plugin のみ)
  },
  communityPluginManaged: async (event) => {
    // event.community, event.eventReasonList (Plugin のみ)
  },
})
```

| `EventType`                | `eventReasonList` の値                                          | ハンドラ                 | 対象       |
| -------------------------- | --------------------------------------------------------------- | ------------------------ | ---------- |
| `POST_CREATED`             | `POST_REPLY`, `POST_MENTIONED`, `POST_QUOTED`, `POST_COMMUNITY` | `postCreated`            | Bot/Plugin |
| `CHAT_MESSAGE_RECEIVED`    | `DIRECT_MESSAGE_RECEIVED`                                       | `chatMessageReceived`    | Bot/Plugin |
| `COMMUNITY_MEMBER_CHANGED` | `COMMUNITY_MEMBER_JOINED`, `COMMUNITY_MEMBER_LEFT`              | `communityMemberChanged` | Plugin     |
| `COMMUNITY_PLUGIN_MANAGED` | `COMMUNITY_PLUGIN_INSTALLED`, `COMMUNITY_PLUGIN_UNINSTALLED`    | `communityPluginManaged` | Plugin     |

- 各ハンドラは省略可能。第 2 引数で生の `Event` も受け取れる
- `eventReasonList` は配列で、複数理由が同時に立ちうる
- `PING` イベントは SDK が自動スキップするためハンドラには届かない
- ハンドラ内のエラーは `onError` (デフォルト `console.error`) に委譲され、他イベントの処理には影響しない
- `POST_COMMUNITY` は Plugin のみ。`postCreated` ハンドラの `event.postedCommunity` (任意) に投稿先コミュニティが含まれる
- `communityMemberChanged` は Requirement に `Community.Member.Joined` を宣言した Plugin のみが受信する
- `communityPluginManaged` は Requirement への宣言なしに、すべての Plugin に自動配信される (初期処理やクリーンアップに利用)

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
import { MediaType } from '@mst-mkt/mixi2-application-sdk-ts'

const { mediaId, uploadUrl } = await client.initiatePostMediaUpload({
  mediaType: MediaType.IMAGE, // or MediaType.VIDEO
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

## Plugin の Requirement

Plugin がコミュニティに対して要求するパーミッションと受信したいイベントのセット。mixi2 Developer Platform の「Requirement」設定画面で宣言する。SDK 側の設定ではない。

パーミッションと対応 API:

| パーミッション                          | 対応 API                                  |
| --------------------------------------- | ----------------------------------------- |
| `Community.Post.Read`                   | `getCommunityTimeline`                    |
| `Community.Post.Create`                 | `createPost` (`communityId` 指定時)       |
| `Community.Post.Restrict`               | `restrictCommunityPost`                   |
| `Community.MemberList.Read`             | `getCommunityMemberList`                  |
| `Community.Post.Stamp.Create`           | `addStampToPost` (コミュニティポスト対象) |
| `Community.Member.DirectMessage.Create` | `sendDirectMessageToCommunityMember`      |

宣言する Requirement イベント:

| イベント名 (Developer Platform)   | SDK ハンドラ                                      | 備考                                |
| --------------------------------- | ------------------------------------------------- | ----------------------------------- |
| `Reaction.Post.Replied`           | `postCreated` (`POST_REPLY`)                      | Bot/Plugin                          |
| `Reaction.Post.Mentioned`         | `postCreated` (`POST_MENTIONED`)                  | Bot/Plugin                          |
| `Reaction.DirectMessage.Received` | `chatMessageReceived` (`DIRECT_MESSAGE_RECEIVED`) | Bot/Plugin                          |
| `Community.Post.Created`          | `postCreated` (`POST_COMMUNITY`)                  | Plugin のみ                         |
| `Community.Member.Joined`         | `communityMemberChanged`                          | Plugin のみ。退出も同イベントで通知 |

Requirement を保存するたびに新しいバージョンが作成される。既にインストール済みのコミュニティは管理者がアップデートするまで古いバージョンで動作するため、変更時は後方互換性を維持する。インストール済みのコミュニティと利用バージョンは `getCommunitiesUsingApplication` で確認できる。

## 詳細情報

- 利用者ガイド
  - 参照
    - npm package: `node_modules/@mst-mkt/mixi2-application-sdk-ts/docs/`
    - GitHub: https://github.com/mst-mkt/mixi2-application-sdk-ts/blob/main/docs/
  - 構成
    - `getting-started.md`
    - `guides/`
      - `guides/client.md`
      - `guides/plugin.md`
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
