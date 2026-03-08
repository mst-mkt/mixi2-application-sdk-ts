# @mst-mkt/mixi2-application-sdk-ts

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
