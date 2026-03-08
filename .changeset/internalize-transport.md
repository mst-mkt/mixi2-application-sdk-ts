---
"@mst-mkt/mixi2-application-sdk-ts": minor
---

gRPC transport の生成を SDK 内部に移動し、`createMixi2Client` / `createStreamWatcher` に `authenticator` を渡すだけで利用できるようにしました。`@connectrpc/connect-node` への直接依存は不要になります。
