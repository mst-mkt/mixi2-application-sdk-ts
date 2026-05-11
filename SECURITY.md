# `SECURITY.md`

## 対象範囲

このセキュリティポリシーは、本リポジトリで配布する SDK のクライアントコード (npm, JSR で公開されるパッケージ) のみを対象とします。

mixi2 本体や mixi2 Developer Platform (API サーバー、認証基盤、Webhook 配信基盤など) は対象外です。これらに関する脆弱性は [mixi2 Developer Platform 公式ドキュメント](https://developer.mixi.social/docs) の窓口へ報告してください。

## サポート対象バージョン

セキュリティ修正は SemVer に従い、最新のメジャーバージョンの最新マイナーリリースに対してのみ提供します。

## 脆弱性の報告

セキュリティ上の問題を発見した場合は、**公開の GitHub Issue や Pull Request では報告しないでください**。

代わりに、GitHub の [Private Vulnerability Reporting](https://github.com/mst-mkt/mixi2-application-sdk-ts/security/advisories/new) からプライベートに報告してください。

報告には可能な範囲で以下を含めてください。

- 影響を受けるバージョン
- 脆弱性の概要と想定される影響
- 再現手順 (Proof of Concept があれば添付)
- 既知の回避策があれば記載

## 対応プロセス

本プロジェクトは個人メンテナーによる OSS のため、対応は best-effort で行います。

1. 受領から 7 日以内を目安に一次返信を行います (メンテナーの状況により遅延する場合があります)
2. 内容を確認し、影響範囲と修正方針を共有します
3. 修正版をリリースし、必要に応じて [GitHub Security Advisory](https://github.com/mst-mkt/mixi2-application-sdk-ts/security/advisories) を公開します

## 関連

- 本 SDK は mixi2 Application API の **非公式** クライアントです (詳細は [README](./README.md) を参照)
- Webhook の署名検証ロジックなど、認証・署名に関わるコードは特に慎重なレビュー対象です
