# API クライアント

mixi2 Application API の型付きクライアントを提供します。
connect-es ベースの gRPC クライアントとして動作します。

## 前提

API クライアントを使用するには以下の認証情報が必要です。

- OAuth 2.0 Client ID
- OAuth 2.0 Client Secret

これ以降はそれぞれを `CLIENT_ID` と `CLIENT_SECRET` として説明します。

## API クライアントの作成

API クライアントの作成には `authenticator` が必要です。
`createAuthenticator` 関数を使用して、認証情報をもとに `authenticator` を作成します。
それを `createMixi2Client` 関数に渡すことで、API クライアントを作成できます。

```typescript
import { createAuthenticator } from '@mst-mkt/mixi2-application-sdk-ts/auth'
import { createMixi2Client } from '@mst-mkt/mixi2-application-sdk-ts/client'

const authenticator = createAuthenticator({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
})

const client = createMixi2Client({ authenticator })
```

### `createAuthenticator` の設定項目

`createAuthenticator` は `AuthConfig` を受け取ります。

| プロパティ     | 型       | 必須 | デフォルト値        | 説明                         |
| -------------- | -------- | ---- | ------------------- | ---------------------------- |
| `clientId`     | `string` | ✅   | -                   | OAuth 2.0 Client ID          |
| `clientSecret` | `string` | ✅   | -                   | OAuth 2.0 Client Secret      |
| `tokenUrl`     | `string` | -    | `DEFAULT_TOKEN_URL` | トークンエンドポイントの URL |

### `createMixi2Client` の設定項目

`createMixi2Client` は `ClientConfig` を受け取ります。

| プロパティ        | 型                 | 必須 | デフォルト値                                       | 説明                                             |
| ----------------- | ------------------ | ---- | -------------------------------------------------- | ------------------------------------------------ |
| `authenticator`   | `Authenticator`    | ✅   | -                                                  | `createAuthenticator` で作成した認証オブジェクト |
| `baseUrl`         | `string`           | -    | `DEFAULT_BASE_URL`                                 | API のベース URL                                 |
| `interceptors`    | `Interceptor[]`    | -    | -                                                  | 追加の connect-es Interceptor                    |
| `createTransport` | `TransportFactory` | -    | `createGrpcTransport` (`@connectrpc/connect-node`) | カスタムトランスポート作成関数                   |

## API クライアントの使用

以下の操作に対応しています。

| RPC                       | 説明                                              |
| ------------------------- | ------------------------------------------------- |
| `createPost`              | ポストを作成 (返信, 引用, メディア添付)           |
| `sendChatMessage`         | チャットメッセージを送信 (テキスト, メディア添付) |
| `initiatePostMediaUpload` | メディアアップロードを開始                        |
| `getPostMediaStatus`      | メディアのアップロード / 処理状況を取得           |
| `getStamps`               | スタンプ一覧を取得                                |
| `addStampToPost`          | ポストにスタンプを付与                            |
| `getUsers`                | ユーザー情報を取得                                |
| `getPosts`                | ポスト情報を取得                                  |

### ポストの作成

#### 基本的なポスト

```typescript
const { post } = await client.createPost({
  text: 'こんにちは！',
})
```

#### リプライ

受信したポストに返信する場合は、`inReplyToPostId` を指定します。

```typescript
const inReplyToPostId = event.post.postId

const { post } = await client.createPost({
  text: '返信ありがとうございます！',
  inReplyToPostId,
})
```

#### 引用ポスト

他のポストを引用する場合は、`quotedPostId` を指定します。

```typescript
const quotedPostId = event.post.postId

const { post } = await client.createPost({
  text: 'これは面白い投稿ですね！',
  quotedPostId,
})
```

> [!WARNING]
> `inReplyToPostId` と `quotedPostId` は同時に指定できません。

#### マスク付きポスト

センシティブなコンテンツやネタバレを含むポストには、マスクを適用できます。

```typescript
const { post } = await client.createPost({
  text: 'ネタバレを含む内容です...',
  postMask: {
    maskType: 2, // POST_MASK_TYPE_SPOILER
    caption: '映画のネタバレ注意',
  },
})
```

| マスク種別                 | 値  | 説明                               |
| -------------------------- | --- | ---------------------------------- |
| `POST_MASK_TYPE_SENSITIVE` | `1` | 刺激的なコンテンツに対する注意喚起 |
| `POST_MASK_TYPE_SPOILER`   | `2` | ネタバレ防止のための注意喚起       |

**ユースケース**

- センシティブな可能性があるコンテンツに予防的にマスクを適用
- ゲーム攻略・レビューボットでネタバレを含む返信にスポイラーマスクを適用
- ユーザーが「ネタバレあり」などのキーワードを含めた場合に自動でマスクを適用

#### 配信設定

ポストの配信範囲を制御できます。

```typescript
const { post } = await client.createPost({
  text: 'このポストはプロフィールにのみ表示されます',
  publishingType: 1, // POST_PUBLISHING_TYPE_NOT_PUBLISHING
})
```

| 配信設定                              | 値  | 説明                                        |
| ------------------------------------- | --- | ------------------------------------------- |
| `POST_PUBLISHING_TYPE_UNSPECIFIED`    | `0` | フォロワーのタイムラインに公開 (デフォルト) |
| `POST_PUBLISHING_TYPE_NOT_PUBLISHING` | `1` | プロフィールにのみ公開                      |

> [!TIP]
> `NOT_PUBLISHING` は、特定ユーザーへの返信時にフォロワー全体のタイムラインに流さない場合や、テスト投稿に便利です。

#### ポスト作成の制限

| 項目               | 制限                       |
| ------------------ | -------------------------- |
| テキスト最大文字数 | 149 文字                   |
| メディア添付       | 最大 4 件                  |
| メンション数       | 文字数に収まる限り制限なし |

### DM の送信

`sendChatMessage` を使用して DM を送信します。

```typescript
const { message } = await client.sendChatMessage({
  roomId: event.message.roomId,
  text: 'メッセージを受け取りました！',
})
```

> [!NOTE]
> アプリケーションから先に DM を送ることはできません。ユーザーから DM を受信した際に、イベントに含まれる `roomId` を使用して返信できます。

#### DM 送信の制限

| 項目           | 制限                                        |
| -------------- | ------------------------------------------- |
| 先送り可否     | 不可 (ユーザーからの DM 受信後のみ返信可能) |
| 必須フィールド | `text` または `mediaId` のいずれか          |

### メディアのアップロード

ポストや DM にメディア (画像・動画) を添付するには、以下のフローで処理します。

#### Step 1: アップロードの開始

`initiatePostMediaUpload` を呼び出して、`mediaId` と `uploadUrl` を取得します。

```typescript
const { mediaId, uploadUrl } = await client.initiatePostMediaUpload({
  mediaType: 1, // 1: IMAGE, 2: VIDEO
  contentType: 'image/jpeg',
  dataSize: BigInt(imageData.byteLength),
  description: '画像の説明 (任意)',
})
```

#### Step 2: メディアのアップロード

取得した `uploadUrl` にメディアデータを POST で送信します。

```typescript
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

#### Step 3: 処理状況の確認

`getPostMediaStatus` でメディアの処理状況を確認します。`COMPLETED` になるまでポーリングしてください。

```typescript
const poll = async (mediaId: string): Promise<void> => {
  const { status } = await client.getPostMediaStatus({ mediaId })

  if (status === 4) {
    // STATUS_FAILED
    throw new Error('media processing failed')
  }

  if (status !== 3) {
    // STATUS_COMPLETED 以外
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return poll(mediaId)
  }
}

await poll(mediaId)
```

| ステータス              | 値  | 説明               |
| ----------------------- | --- | ------------------ |
| `STATUS_UPLOAD_PENDING` | `1` | アップロード待機中 |
| `STATUS_PROCESSING`     | `2` | 処理中             |
| `STATUS_COMPLETED`      | `3` | 完了               |
| `STATUS_FAILED`         | `4` | 失敗               |

#### Step 4: ポストへの添付

処理が完了したら、`createPost` で `mediaIdList` を指定してポストを作成します。

```typescript
const { post } = await client.createPost({
  text: '画像を添付しました！',
  mediaIdList: [mediaId],
})
```

#### メディアアップロードの制限

| 項目                        | 制限                     |
| --------------------------- | ------------------------ |
| 画像最大サイズ              | 15 MB                    |
| 動画最大サイズ              | 50 MB                    |
| 対応フォーマット            | JPEG, PNG, GIF, MP4 など |
| アップロード有効期限 (画像) | 200 秒                   |
| アップロード有効期限 (動画) | 600 秒                   |

> [!WARNING]
> `STATUS_FAILED` になったメディアは再利用できません。`initiatePostMediaUpload` からやり直してください。

### スタンプの付与

`addStampToPost` を使用して、ポストにスタンプを付与できます。

```typescript
// 利用可能なスタンプ一覧を取得
const { officialStampSets } = await client.getStamps({
  officialStampLanguage: 1, // LANGUAGE_CODE_JP
})

// スタンプを付与
const { post } = await client.addStampToPost({
  postId: event.post.postId,
  stampId: 'o_cracker',
})
```

#### スタンプ付与の制限

| 項目               | 制限                                           |
| ------------------ | ---------------------------------------------- |
| 対象ポスト         | アプリケーションにメンションしているポストのみ |
| 使用可能なスタンプ | 公式スタンプのみ                               |
| 付与回数           | 同じポストに複数回付与不可                     |

> [!NOTE]
> アプリケーションが付与したスタンプを取り消す機能は現在提供されていません。

**ユースケース**

- ユーザーからのメンションに対して「確認しました」の意味でスタンプを付与
- 特定のキーワードを含むメンションにリアクションスタンプを付与
- 返信の代わりに軽量なリアクションとして使用

### ユーザー情報の取得

`getUsers` を使用して、ユーザー情報を取得できます。

```typescript
const { users } = await client.getUsers({
  userIdList: [event.post.creatorId],
})

for (const user of users) {
  console.log('ユーザー名:', user.displayName)
}
```

> [!NOTE]
> アプリケーションがアクセス可能なユーザー情報のみ取得できます。

**ユースケース**

- イベントで受信したユーザーの詳細情報 (表示名, アイコン URL) を取得
- ポスト作成者の情報を取得してログ出力や管理画面に表示

### レート制限

各 API にはアプリケーション単位でレート制限が設けられています。

| RPC                       |   制限 | ウィンドウ |
| ------------------------- | -----: | ---------- |
| `createPost`              |  10 回 | 1 分       |
| `sendChatMessage`         |  10 回 | 1 分       |
| `initiatePostMediaUpload` |  10 回 | 1 分       |
| `initiatePostMediaUpload` | 100 回 | 1 時間     |
| `addStampToPost`          |  10 回 | 1 分       |
| `getUsers`                |  10 回 | 1 分       |
| `getPosts`                |  10 回 | 1 分       |

`getStamps`、`getPostMediaStatus` にはレート制限はありません。

### ポスト情報の取得

`getPosts` を使用して、ポスト情報を取得できます。

```typescript
const { posts } = await client.getPosts({
  postIdList: [event.post.inReplyToPostId],
})

for (const post of posts) {
  console.log('ポスト本文:', post.text)
}
```

> [!NOTE]
> アプリケーションがアクセス可能なポストのみ取得できます。

**ユースケース**

- リプライや引用ポストを受信した際に、元のポスト情報 (本文、メディア、スタンプ等) を取得
- メンションされたポストの添付メディアやスタンプ情報を確認
