# Vercel Example

[Vercel](https://vercel.com) 向けの実装例です。

- 本番 (Vercel): Webhook でイベントを受信
- ローカル: gRPC Stream でイベントを受信

## セットアップ

`.env.example` を `.env` にコピーし、値を設定してください。

```bash
cp .env.example .env
```

## 開発

```bash
pnpm dev
```

## デプロイ

Workspace のルートディレクトリで実行する。
Vercel CLI は実行ディレクトリのファイルのみをアップロードするため、サブディレクトリから実行すると SDK のビルドに失敗する。

```bash
# workspace root で実行
vercel deploy --prod
```
