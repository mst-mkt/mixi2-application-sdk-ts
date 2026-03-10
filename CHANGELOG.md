# @mst-mkt/mixi2-application-sdk-ts

## 0.3.0

### Minor Changes

- [`63f599b`](https://github.com/mst-mkt/mixi2-application-sdk-ts/commit/63f599b9466f56332cf6aabed0d00489fc48a9f1) Thanks [@mst-mkt](https://github.com/mst-mkt)! - feat: カスタム Transport を指定できるように

## 0.2.3

### Patch Changes

- [`7320fb6`](https://github.com/mst-mkt/mixi2-application-sdk-ts/commit/7320fb6694f425d181ca0d91ad25e5f53e1c4cb0) Thanks [@mst-mkt](https://github.com/mst-mkt)! - internal refactoring: イベント処理ロジックの共通化と型定義の整理

## 0.2.2

### Patch Changes

- [#7](https://github.com/mst-mkt/mixi2-application-sdk-ts/pull/7) [`c273675`](https://github.com/mst-mkt/mixi2-application-sdk-ts/commit/c27367506dd24790ce3f2a42fe184670296bdbad) Thanks [@mst-mkt](https://github.com/mst-mkt)! - feat: Webhook ハンドラーに `syncHandling` オプションを追加し、デフォルトでイベントを非同期処理するように変更

- [#7](https://github.com/mst-mkt/mixi2-application-sdk-ts/pull/7) [`851a4a9`](https://github.com/mst-mkt/mixi2-application-sdk-ts/commit/851a4a9e3825f1e89ddb84e5016d4d60e92ad43b) Thanks [@mst-mkt](https://github.com/mst-mkt)! - fix: ストリームウォッチャーの再接続ロジックを公式仕様に準拠させる

  - ストリームが正常終了した場合に再接続するよう修正
  - 成功した接続の後にリトライカウンターをリセットするよう修正

- [#7](https://github.com/mst-mkt/mixi2-application-sdk-ts/pull/7) [`c92aa1b`](https://github.com/mst-mkt/mixi2-application-sdk-ts/commit/c92aa1b4e8fa12b98d3aaac1235aa246228b9172) Thanks [@mst-mkt](https://github.com/mst-mkt)! - fix: Webhook ハンドラーにリクエストボディ読み取りエラー (500) と protobuf パースエラー (400) のレスポンスを追加

## 0.2.1

### Patch Changes

- [#5](https://github.com/mst-mkt/mixi2-application-sdk-ts/pull/5) [`8b82e63`](https://github.com/mst-mkt/mixi2-application-sdk-ts/commit/8b82e63c78705acbba5477c5d3739d525e088960) Thanks [@mst-mkt](https://github.com/mst-mkt)! - 公開関数・型に `@param` / `@returns` / `@example` などの詳細な JSDoc を追加

- [#5](https://github.com/mst-mkt/mixi2-application-sdk-ts/pull/5) [`529b561`](https://github.com/mst-mkt/mixi2-application-sdk-ts/commit/529b5610f2dc463c166817d736d1068ebf1fbd51) Thanks [@mst-mkt](https://github.com/mst-mkt)! - JSR ドキュメントスコア改善のため、エクスポートされた型・定数・関数に JSDoc コメントを追加

- [#5](https://github.com/mst-mkt/mixi2-application-sdk-ts/pull/5) [`b830659`](https://github.com/mst-mkt/mixi2-application-sdk-ts/commit/b8306590e068a5b5423f998b2b06046d7b76ca24) Thanks [@mst-mkt](https://github.com/mst-mkt)! - JSDoc コメントを日本語化

- [#5](https://github.com/mst-mkt/mixi2-application-sdk-ts/pull/5) [`366f6f3`](https://github.com/mst-mkt/mixi2-application-sdk-ts/commit/366f6f38801c03ae12cffe3725bbfaaa812ac590) Thanks [@mst-mkt](https://github.com/mst-mkt)! - JSR ドキュメントスコア改善のため、各モジュールエントリポイントに `@module` JSDoc コメントを追加

## 0.2.0

### Minor Changes

- [#4](https://github.com/mst-mkt/mixi2-application-sdk-ts/pull/4) [`65edb71`](https://github.com/mst-mkt/mixi2-application-sdk-ts/commit/65edb715c67fccc55a8b79dfada4d72cc34459a5) Thanks [@mst-mkt](https://github.com/mst-mkt)! - イベントハンドラーを宣言的に定義できる `createEventHandler` を追加しました。イベントタイプごとにハンドラーを指定でき、型安全にイベントを処理できます。

- [#2](https://github.com/mst-mkt/mixi2-application-sdk-ts/pull/2) [`dbe6789`](https://github.com/mst-mkt/mixi2-application-sdk-ts/commit/dbe6789940cb6a50480ace3111e4dfd97d6ba20e) Thanks [@mst-mkt](https://github.com/mst-mkt)! - gRPC transport の生成を SDK 内部に移動し、`createMixi2Client` / `createStreamWatcher` に `authenticator` を渡すだけで利用できるようにしました。`@connectrpc/connect-node` への直接依存は不要になります。

- [#2](https://github.com/mst-mkt/mixi2-application-sdk-ts/pull/2) [`70e1105`](https://github.com/mst-mkt/mixi2-application-sdk-ts/commit/70e11054819bb7b45a11fd4d7f4b52e746599e3f) Thanks [@mst-mkt](https://github.com/mst-mkt)! - `@bufbuild/protobuf` と `@connectrpc/connect` を peerDependencies から dependencies に移動し、SDK のインストールだけで利用可能にしました。

### Patch Changes

- [#2](https://github.com/mst-mkt/mixi2-application-sdk-ts/pull/2) [`ea2b27f`](https://github.com/mst-mkt/mixi2-application-sdk-ts/commit/ea2b27f91c4d45e02d2750be2074e6ad8b7ed198) Thanks [@mst-mkt](https://github.com/mst-mkt)! - ストリーム接続のベース URL を 正しいストリーム用 (`application-stream.mixi.social`) に修正しました。

## 0.1.1

### Patch Changes

- [`1dbb797`](https://github.com/mst-mkt/mixi2-application-sdk-ts/commit/1dbb7977109d2366e1b279b7f0de15026ec99604) Thanks [@mst-mkt](https://github.com/mst-mkt)! - トークンエンドポイントと API エンドポイントにデフォルト URL を追加
