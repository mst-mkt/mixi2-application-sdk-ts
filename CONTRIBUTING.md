# `CONTRIBUTING.md`

## 開発環境の構築

### 必要なツール

- [Vite+](https://viteplus.dev/guide/)
- [mise](https://mise.jdx.dev/getting-started.html)

### 準備

```bash
git clone https://github.com/mst-mkt/mixi2-application-sdk-ts.git
cd mixi2-application-sdk-ts
```

#### 依存、ツールのインストール

```bash
mise install
```

```bash
vp install
```

## 開発

```bash
vp run generate    # buf generate
vp run build       # vp pack
vp run dev         # vp pack --watch
vp run test        # vp test run
vp run test:watch  # vp test
vp check           # (lint, format, typecheck)
vp run fix         # vp check --fix
```

- format, lint の設定は `vite.config.ts` の `fmt`, `lint` を参照
- `src/gen/` は自動生成コードのため手動で編集しない

## Pull Request

1. `main` ブランチから新しいブランチを作成する
2. `vp check` と `vp run test` が通ることを確認する
3. 必要に応じて Changeset を追加する
4. Pull Request を作成する

### CI

Pull Request では以下が自動実行されます。すべて通過する必要があります。

- `vp check`: lint, format, typecheck
- `vp run test`: test

### Changeset

ユーザーに影響のある変更 (機能追加、バグ修正、破壊的変更など) には Changeset を追加してください。
ユーザーに影響しない変更では不要です。

```bash
vp exec changeset
```

## Issue

バグの報告や機能要望は [GitHub Issues](https://github.com/mst-mkt/mixi2-application-sdk-ts/issues/new/choose) からお願いします。

## License

[Apache License 2.0](./LICENSE)
