# Plugin (コミュニティプラグイン)

Plugin (コミュニティプラグイン) は、mixi2 のコミュニティにインストールして動作する拡張型アプリケーションです。Bot の機能に加えて、コミュニティ固有のイベント受信やコミュニティ操作 API を利用できます。

## Bot と Plugin の違い

| 項目               | Bot                      | Plugin                                                                                  |
| ------------------ | ------------------------ | --------------------------------------------------------------------------------------- |
| 提供対象           | ユーザー                 | ユーザー, コミュニティ                                                                  |
| 受信できるイベント | リプライ, メンション, DM | リプライ, メンション, DM, コミュニティ内のポスト, メンバー参加退出, Plugin の導入と削除 |
| 利用できる API     | 基本 API                 | 基本 API, コミュニティ操作 API                                                          |
| インストール       | 不要                     | コミュニティ管理者がインストール (最大 10 コミュニティ)                                 |

Plugin は Bot のすべての機能を持ちつつ、コミュニティ固有の機能も利用できます。「コミュニティにポストしたい」「コミュニティメンバーに DM を送りたい」「コミュニティのタイムラインを取得したい」といった用途には Plugin を選択してください。

詳しいアプリケーション種別の概念は [mixi2 Developer Platform 公式ドキュメント](https://developer.mixi.social/docs/guides/plugin) を参照してください。

## Requirement

Requirement は Plugin がコミュニティに要求する**パーミッション**と受信したい**イベント**のセットです。Requirement の設定は mixi2 Developer Platform の「Requirement」設定画面から行います。

### パーミッション

| パーミッション                          | 説明                                       | 対応 API                                |
| --------------------------------------- | ------------------------------------------ | --------------------------------------- |
| `Community.Post.Read`                   | コミュニティのタイムラインを閲覧できる     | `getCommunityTimeline`                  |
| `Community.Post.Create`                 | コミュニティへポストを投稿できる           | `createPost` (`communityId` 指定時)     |
| `Community.Post.Restrict`               | コミュニティのポストを非表示にできる       | `restrictCommunityPost`                 |
| `Community.MemberList.Read`             | コミュニティのメンバー一覧を取得できる     | `getCommunityMemberList`                |
| `Community.Post.Stamp.Create`           | コミュニティのポストにスタンプを付与できる | `addStampToPost` (コミュニティポスト時) |
| `Community.Member.DirectMessage.Create` | コミュニティメンバーに DM を送信できる     | `sendDirectMessageToCommunityMember`    |

### イベント

| イベント                          | 説明                                                       |
| --------------------------------- | ---------------------------------------------------------- |
| `Reaction.Post.Replied`           | 作成したポストにリプライが付いたとき                       |
| `Reaction.Post.Mentioned`         | メンション付きのポストが作成されたとき                     |
| `Reaction.DirectMessage.Received` | DM を受け取ったとき                                        |
| `Community.Post.Created`          | インストール済みコミュニティにポストが作成されたとき       |
| `Community.Member.Joined`         | インストール済みコミュニティにメンバーが参加・退出したとき |

> [!NOTE]
> Plugin のインストール / アンインストールイベント (`communityPluginManaged`) は Requirement への宣言なしに、すべての Plugin に自動配信されます。詳細は [イベント](./events.md#コミュニティプラグイン管理イベント-communitypluginmanaged) を参照してください。

### バージョンと後方互換性

Requirement を保存するたびに新しいバージョンが作成されます。すでに Plugin をインストール済みのコミュニティは、コミュニティ管理者が更新を行うまで古いバージョンの権限で動作します。Requirement を変更する際は後方互換性を維持してください。

インストール済みコミュニティと利用バージョンは [`getCommunitiesUsingApplication`](#インストール済みコミュニティの一覧を取得-getcommunitiesusingapplication) で確認できます。

## Plugin 固有の API

以下のサンプルは、[API クライアント](./client.md#api-クライアントの作成) と同じ初期化が完了している前提です。

### インストール済みコミュニティの一覧を取得 (`getCommunitiesUsingApplication`)

Plugin がインストールされているコミュニティと、各コミュニティが利用しているアプリケーションのバージョンを取得します。

```typescript
const { communitiesUsingApplication, applicationVersions, nextCursor } =
  await client.getCommunitiesUsingApplication({})
```

ページング時は、レスポンスの `nextCursor` を次のリクエストの `cursor` に指定してください。

### コミュニティのタイムラインを取得 (`getCommunityTimeline`)

インストール済みコミュニティのタイムライン (ポスト一覧) を取得します。Requirement に `Community.Post.Read` パーミッションの宣言が必要です。

```typescript
const { posts } = await client.getCommunityTimeline({
  communityId: 'YOUR_COMMUNITY_ID',
  // untilCursor: previousPostId, // より古いポストを取得する場合
  // sinceCursor: latestPostId,   // より新しいポストを取得する場合
})
```

| フィールド    | 型       | 説明                                        |
| ------------- | -------- | ------------------------------------------- |
| `communityId` | `string` | 対象のコミュニティ ID                       |
| `untilCursor` | `string` | 指定したポストより古いポストを返す (任意)   |
| `sinceCursor` | `string` | 指定したポストより新しいポストを返す (任意) |

### コミュニティメンバー一覧を取得 (`getCommunityMemberList`)

インストール済みコミュニティのメンバー一覧をページング付きで取得します。Requirement に `Community.MemberList.Read` パーミッションの宣言が必要です。

```typescript
const { members, nextPaginationCursor } = await client.getCommunityMemberList({
  communityId: 'YOUR_COMMUNITY_ID',
})
```

次ページを取得する場合は、レスポンスの `nextPaginationCursor` を `paginationCursor` に指定してください。

### コミュニティのポストを非表示にする (`restrictCommunityPost`)

指定したポストをコミュニティのタイムラインから非表示にします。ポスト自体は削除されません。Requirement に `Community.Post.Restrict` パーミッションの宣言が必要です。

```typescript
await client.restrictCommunityPost({
  postId: 'YOUR_POST_ID',
})
```

### コミュニティメンバーに DM を送信 (`sendDirectMessageToCommunityMember`)

インストール済みコミュニティのメンバーにダイレクトメッセージを送信します。Requirement に `Community.Member.DirectMessage.Create` パーミッションの宣言が必要です。`text` または `mediaIds` のいずれかは必須です。

```typescript
const { message } = await client.sendDirectMessageToCommunityMember({
  receiverId: 'YOUR_USER_ID',
  communityId: 'YOUR_COMMUNITY_ID',
  text: 'メッセージ本文',
})
```

| フィールド    | 型         | 説明                                                 |
| ------------- | ---------- | ---------------------------------------------------- |
| `receiverId`  | `string`   | 受信者ユーザー ID                                    |
| `communityId` | `string`   | 受信者が所属するコミュニティ ID                      |
| `text`        | `string`   | 本文テキスト (任意)                                  |
| `mediaIds`    | `string[]` | 添付するメディア ID 一覧 (最大 4 件)                 |
| `postId`      | `string`   | ポストを引用して DM を送信する場合のポスト ID (任意) |

### コミュニティ固有スタンプを取得 (`getStamps`)

Plugin がインストールされているコミュニティのスタンプを取得するには、`getStamps` の `communityIds` に対象コミュニティ ID を指定します。

```typescript
const { communityStampSets } = await client.getStamps({
  communityIds: ['YOUR_COMMUNITY_ID'],
})
```

取得したコミュニティスタンプは `addStampToPost` でコミュニティポストに付与できます (Requirement に `Community.Post.Stamp.Create` パーミッションが必要)。詳しくは [API クライアント - スタンプの付与](./client.md#スタンプの付与) を参照してください。

## レート制限

Plugin 固有の API もすべて 20 回 / 分のレート制限が適用されます。レート制限の詳細は [API クライアント - レート制限](./client.md#レート制限) を参照してください。

## 関連

- [イベント](./events.md) — Plugin で受信できるイベントの詳細
- [API クライアント](./client.md) — Bot, Plugin 共通の API
- [mixi2 Developer Platform 公式ドキュメント](https://developer.mixi.social/docs/guides/plugin) — Plugin 概念の詳細
