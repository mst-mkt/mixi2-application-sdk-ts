# Deno Deploy Example

[Deno Deploy](https://deno.com/deploy) 向けの実装例です。

- 本番 (Deno Deploy): Webhook でイベントを受信
- ローカル: gRPC Stream でイベントを受信

## セットアップ

`.env.example` を `.env` にコピーし、値を設定してください。

```bash
cp .env.example .env
```

## 開発

```bash
deno task dev
```

## デプロイ

```bash
deno task deploy
```
