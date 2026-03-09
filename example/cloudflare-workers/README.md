# Cloudflare Workers Example

[Cloudflare Workers](https://workers.cloudflare.com) 向けの実装例です。

Webhook でイベントを受信し、ログを出力します。

> [!NOTE]
> `createMixi2Client` は `node:http2` に依存しているため、Cloudflare Workers では使用できません。

## セットアップ

`.dev.vars.example` を `.dev.vars` にコピーし、値を設定してください。

```bash
cp .dev.vars.example .dev.vars
```

## デプロイ

```bash
pnpm deploy
```
