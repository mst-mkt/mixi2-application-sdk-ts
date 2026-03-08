# コントリビューションガイド

## 開発環境のセットアップ

### セットアップ

#### リポジトリのクローン

```bash
git clone https://github.com/mst-mkt/mixi2-application-sdk-ts.git
cd mixi2-application-sdk-ts
```

#### ツール類のインストール

```bash
mise install
```

#### 依存関係のインストール

```bash
pnpm install
```

## 開発

### npm scripts

```bash
# Proto から TypeScript コードを生成
pnpm generate

# ビルド
pnpm build

# テスト
pnpm test
pnpm test:watch

# コードチェック
pnpm check:lint   # lint (oxlint)
pnpm check:fmt    # format (oxfmt)
pnpm check:types  # type check (tsc)

# 自動修正
pnpm fix:lint     # lint
pnpm fix:fmt      # format
```

### CI で実行されるチェック

Pull Request では以下のチェックが自動的に実行されます。すべてのチェックを通過する必要があります。

1. `pnpm check:fmt` — コードフォーマット
2. `pnpm check:lint` — リント
3. `pnpm check:types` — 型チェック
4. `pnpm test` — テスト

### コーディング規約

- フォーマッターとリンターの設定に従ってください (oxfmt, oxlint)
- `src/gen/` 以下のファイルは自動生成されるため、手動で編集しないでください

## Pull Request の作成

1. `main` ブランチから新しいブランチを作成してください
2. 変更を加え、テストが通ることを確認してください
3. [Changeset](#changeset) を追加してください (必要な場合)
4. Pull Request を作成してください

### Changeset

ユーザーに影響のある変更 (機能追加、バグ修正、破壊的変更など) を行った場合は、Changeset を追加してください。

```bash
pnpm changeset
```

ドキュメントの修正やテストの追加など、公開されるパッケージに影響しない変更では Changeset は不要です。

## Issue の報告

バグ報告や機能要望は [Issue](https://github.com/mst-mkt/mixi2-application-sdk-ts/issues/new/choose) から報告してください。

## ライセンス

このプロジェクトは [本家 SDK](https://github.com/mixigroup/mixi2-application-sdk-go) と同様、 Apache License 2.0 の下でライセンスされています。
詳細は [LICENSE](./LICENSE) ファイルを参照してください。
