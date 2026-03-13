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
})
```

各ハンドラーは省略可能です。必要なイベントのみ定義できます。

ハンドラーの第 1 引数にはイベント固有のデータ、第 2 引数には生の `Event` オブジェクトが渡されます。

> [!NOTE]
> Ping イベント (`EVENT_TYPE_PING`) は SDK 内部で自動的に処理されるため、ハンドラーには渡されません。

## ポスト作成イベント (`postCreated`)

ユーザーがアプリケーションにメンション、リプライ、または引用を行った場合に呼び出されます。

```typescript
const eventHandler = createEventHandler({
  postCreated: async ({ eventReasonList, post, issuer }) => {
    console.log('理由:', eventReasonList)
    console.log('ユーザー:', issuer?.displayName)
    console.log('本文:', post?.text)
  },
})
```

| フィールド        | 型              | 説明                           |
| ----------------- | --------------- | ------------------------------ |
| `eventReasonList` | `EventReason[]` | イベントが発生した理由のリスト |
| `post`            | `Post`          | 作成されたポストの情報         |
| `issuer`          | `User`          | ポストを作成したユーザーの情報 |

`eventReasonList` から、ハンドラーが呼び出された理由を判別できます。

| EventReason                   | 値  | 説明                                 |
| ----------------------------- | --- | ------------------------------------ |
| `EVENT_REASON_POST_REPLY`     | `2` | アプリケーションのポストに返信された |
| `EVENT_REASON_POST_MENTIONED` | `3` | ポスト内でメンションされた           |
| `EVENT_REASON_POST_QUOTED`    | `4` | アプリケーションのポストが引用された |

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
