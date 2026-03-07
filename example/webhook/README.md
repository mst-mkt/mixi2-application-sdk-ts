# Webhook Example

Webhook でイベントを受信し、以下の応答を行うボットの実装例です。

- `chatMessageReceivedEvent` (DM の受信)
  - 受信したメッセージを返信
- `postCreatedEvent` (ポストの作成)
  - メンションの場合にリプライを作成

[Vercel](https://vercel.com) へのデプロイを想定しています。

## セットアップ

### 環境変数

`.env.example` を `.env` にコピーし、値を設定してください。

```bash
cp .env.example .env
```

| 変数名                 | 説明                                       |
| ---------------------- | ------------------------------------------ |
| `CLIENT_ID`            | アプリケーションのクライアント ID          |
| `CLIENT_SECRET`        | アプリケーションのクライアントシークレット |
| `SIGNATURE_PUBLIC_KEY` | Webhook 署名検証用の Ed25519 公開鍵        |
