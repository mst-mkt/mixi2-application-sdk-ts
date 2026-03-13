# Getting Started

## 前提

- [mixi2](https://mixi.social) のアカウントを持っていること
- [mixi2 Developer Platform](https://developer.mixi.social/) の利用申請が承認されていること
- [mixi2 Developer Platform](https://developer.mixi.social/applications) でアプリケーションが作成されていること

## 準備

### アプリケーション設定「認証情報」より

「OAuth 2.0 クライアント認証用」から「Client Secret を生成する」をクリックし、以下の認証情報を取得する。

- Client ID
- Client Secret

### アプリケーション設定「Webhook」より

[Webhook 方式](./guides/events-webhook.md)でイベントを受信する場合は、「署名検証用の公開鍵」から「公開鍵を生成する」をクリックし、公開鍵を取得する。

## インストール

任意のレジストリ、パッケージマネージャーを使用してインストールしてください。

### npm

```bash
# npm
npm install @mst-mkt/mixi2-application-sdk-ts
# yarn
yarn add @mst-mkt/mixi2-application-sdk-ts
# pnpm
pnpm add @mst-mkt/mixi2-application-sdk-ts
# deno
deno add npm:@mst-mkt/mixi2-application-sdk-ts
# bun
bun add @mst-mkt/mixi2-application-sdk-ts
```

### JSR

```bash
# npm
npx jsr add @mst-mkt/mixi2-application-sdk-ts
# yarn
yarn add jsr:@mst-mkt/mixi2-application-sdk-ts
# pnpm
pnpm add jsr:@mst-mkt/mixi2-application-sdk-ts
# deno
deno add jsr:@mst-mkt/mixi2-application-sdk-ts
# bun
bunx jsr add @mst-mkt/mixi2-application-sdk-ts
```

## 使い方

SDK の使用方法については、以下を確認してください。

- mixi2 の API を使用する
  - [guides/client](./guides/client.md)
- mixi2 のイベントを受けとる
  - [guides/events](./guides/events.md)
  - [guides/events-webhook](./guides/events-webhook.md)
  - [guides/events-stream](./guides/events-stream.md)
- デプロイ
  - [deployments/deno-deploy](./deployments/deno-deploy.md)
  - [deployments/vercel](./deployments/vercel.md)
  - [deployments/cloudflare-workers](./deployments/cloudflare-workers.md)
