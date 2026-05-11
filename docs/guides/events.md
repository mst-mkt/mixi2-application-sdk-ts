# イベント

`createEventHandler` にイベント種別ごとの処理関数を渡すことで、イベントハンドラーを定義できます。定義したハンドラーは [Webhook](./events-webhook.md) と [gRPC Stream](./events-stream.md) の両方で共通して利用できます。

## イベントハンドラーの定義

```typescript
import { createEventHandler } from '@mst-mkt/mixi2-application-sdk-ts'

const eventHandler = createEventHandler({
  postCreated: async (event, rawEvent) => {
    console.log('ポストが作成されました:', event.post?.text)
  },
  chatMessageReceived: async (event, rawEvent) => {
    console.log('メッセージを受信しました:', event.message?.text)
  },
  communityMemberChanged: async (event, rawEvent) => {
    console.log('コミュニティメンバーが変更されました:', event.community?.name)
  },
  communityPluginManaged: async (event, rawEvent) => {
    console.log('コミュニティプラグインが変更されました:', event.community?.name)
  },
})
```

各ハンドラーは省略可能です。必要なイベントのみ定義できます。

> [!NOTE]
> `communityMemberChanged` と `communityPluginManaged` は Plugin (コミュニティプラグイン) アプリケーション専用のイベントです。Plugin の概要と Requirement の宣言については [Plugin](./plugin.md) を参照してください。

ハンドラーの第 1 引数にはイベント固有のデータ、第 2 引数には生の `Event` オブジェクトが渡されます。

> [!NOTE]
> Ping イベント (`EVENT_TYPE_PING`) は SDK 内部で自動的に処理されるため、ハンドラーには渡されません。

## ポスト作成イベント (`postCreated`)

ユーザーがアプリケーションにメンション、リプライ、または引用を行った場合に呼び出されます。Plugin の場合はこれらに加えて、Plugin がインストールされているコミュニティで新しくポストが作成された場合にも呼び出されます (`EVENT_REASON_POST_COMMUNITY`)。

```typescript
const eventHandler = createEventHandler({
  postCreated: async ({ eventReasonList, post, issuer, postedCommunity }) => {
    console.log('理由:', eventReasonList)
    console.log('ユーザー:', issuer?.displayName)
    console.log('本文:', post?.text)
    console.log('コミュニティ:', postedCommunity?.name)
  },
})
```

| フィールド        | 型                     | 説明                                                               |
| ----------------- | ---------------------- | ------------------------------------------------------------------ |
| `eventReasonList` | `EventReason[]`        | イベントが発生した理由のリスト                                     |
| `post`            | `Post`                 | 作成されたポストの情報                                             |
| `issuer`          | `User`                 | ポストを作成したユーザーの情報                                     |
| `postedCommunity` | `Community` (Optional) | コミュニティへのポストの場合に投稿先コミュニティ情報 (Plugin のみ) |

`eventReasonList` から、ハンドラーが呼び出された理由を判別できます。

| EventReason                   | 値  | 説明                                                           |
| ----------------------------- | --- | -------------------------------------------------------------- |
| `EVENT_REASON_POST_REPLY`     | `2` | アプリケーションのポストに返信された                           |
| `EVENT_REASON_POST_MENTIONED` | `3` | ポスト内でメンションされた                                     |
| `EVENT_REASON_POST_QUOTED`    | `4` | アプリケーションのポストが引用された                           |
| `EVENT_REASON_POST_COMMUNITY` | `5` | インストール済みコミュニティにポストが作成された (Plugin のみ) |

## チャットメッセージ受信イベント (`chatMessageReceived`)

ユーザーがアプリケーションに DM を送信した場合に呼び出されます。

```typescript
const eventHandler = createEventHandler({
  chatMessageReceived: async ({ eventReasonList, message, issuer }) => {
    console.log('送信者:', issuer?.displayName)
    console.log('ルーム:', message?.roomId)
    console.log('本文:', message?.text)
  },
})
```

| フィールド        | 型              | 説明                               |
| ----------------- | --------------- | ---------------------------------- |
| `eventReasonList` | `EventReason[]` | イベントが発生した理由のリスト     |
| `message`         | `ChatMessage`   | 受信したメッセージの情報           |
| `issuer`          | `User`          | メッセージを送信したユーザーの情報 |

| EventReason                            | 値  | 説明                                      |
| -------------------------------------- | --- | ----------------------------------------- |
| `EVENT_REASON_DIRECT_MESSAGE_RECEIVED` | `8` | チャット / ダイレクトメッセージを受信した |

## コミュニティメンバー変更イベント (`communityMemberChanged`)

Plugin がインストールされたコミュニティでメンバーが参加・退出した場合に呼び出されます。Requirement に `Community.Member.Joined` を宣言した Plugin のみが受信します。

```typescript
const eventHandler = createEventHandler({
  communityMemberChanged: async ({ eventReasonList, community, member }) => {
    console.log('コミュニティ:', community?.name)
    console.log('対象メンバー:', member?.displayName)
  },
})
```

| フィールド        | 型              | 説明                                 |
| ----------------- | --------------- | ------------------------------------ |
| `eventReasonList` | `EventReason[]` | イベントが発生した理由のリスト       |
| `member`          | `User`          | コミュニティに参加・退出したメンバー |
| `community`       | `Community`     | 対象コミュニティの情報               |

| EventReason                            | 値  | 説明                     |
| -------------------------------------- | --- | ------------------------ |
| `EVENT_REASON_COMMUNITY_MEMBER_JOINED` | `6` | コミュニティに参加した   |
| `EVENT_REASON_COMMUNITY_MEMBER_LEFT`   | `7` | コミュニティから退出した |

## コミュニティプラグイン管理イベント (`communityPluginManaged`)

Plugin がコミュニティにインストール、もしくはアンインストールされたときに呼び出されます。すべての Plugin アプリケーションに自動で配信され、Requirement への宣言は不要です。

```typescript
const eventHandler = createEventHandler({
  communityPluginManaged: async ({ eventReasonList, community }) => {
    console.log('対象コミュニティ:', community?.name)
  },
})
```

| フィールド        | 型              | 説明                           |
| ----------------- | --------------- | ------------------------------ |
| `eventReasonList` | `EventReason[]` | イベントが発生した理由のリスト |
| `community`       | `Community`     | 対象コミュニティの情報         |

| EventReason                                 | 値   | 説明                                            |
| ------------------------------------------- | ---- | ----------------------------------------------- |
| `EVENT_REASON_COMMUNITY_PLUGIN_INSTALLED`   | `9`  | Plugin がコミュニティにインストールされた       |
| `EVENT_REASON_COMMUNITY_PLUGIN_UNINSTALLED` | `10` | Plugin がコミュニティからアンインストールされた |

このイベントを使って、初期処理 (初回挨拶など) やクリーンアップ処理 (内部状態の破棄など) を行えます。

## イベントの受信方式

定義したイベントハンドラーは、以下の 2 つの方式で利用できます。

| 方式            | 用途                                         | ガイド                            |
| --------------- | -------------------------------------------- | --------------------------------- |
| HTTP Webhook    | HTTPS に対応したサーバー環境                 | [Webhook](./events-webhook.md)    |
| gRPC ストリーム | リアルタイム監視。ローカル開発に適しています | [gRPC Stream](./events-stream.md) |

## イベント配信の注意点

### 順序保証

イベントは発生順とは異なる順番で届く可能性があります。特定の順序に依存しない設計にしてください。

### 配信保証

イベントは Best-effort で配信されます。

- gRPC ストリーム方式では、接続が切れている間のイベントは失われます
- Webhook 方式では、配信失敗時に最大 3 回までリトライされます

> [!WARNING]
> Webhook 方式ではリトライによりイベントが重複して届く場合があるため、アプリケーション側で冪等性を考慮した設計を行ってください。
