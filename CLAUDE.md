# rinshouji-app

寺務管理システムのプロトタイプ。`app/frontend` は Vite + TypeScript(bulletproof-react 構成)の React アプリ。予定管理などはモックデータ駆動、檀家管理・過去帳はバックエンドAPI(`app/backend`: Hono + PostgreSQL)駆動で動作する。

## 開発サーバ

```
cd app/frontend && npm run dev
```

Vite の開発サーバが http://localhost:8123 で起動する(Docker を停止している場合)。ソースを編集すると自動的にホットリロードされる。

Docker で起動する場合は次のとおり。

```
docker compose up -d --build
```

http://localhost:8123 では nginx がビルド成果物を配信するため、**ソースを変更した場合は `--build` を付けて再ビルドする必要がある**(RO マウントではないため、リロードだけでは反映されない)。

## UI変更後のルール

`app/frontend` 配下の見た目に影響する変更をしたら、必ず以下を実行して視覚差分を確認すること。

```
cd scripts/vrt && npm run vrt
```

- `scripts/vrt/output/diff/` を確認し、意図した変更のみが差分として現れていることを確認する。
- 意図しない差分(デグレ)があれば、先に修正してから進める。
- 差分が意図通りであれば `npm run vrt:update` でベースラインを更新し、`scripts/vrt/baseline/` の変更もコミットに含める。

### VRTの前提条件

- Docker で `http://localhost:8123` (frontend) が起動していること。
- Google Chrome がインストール済みであること。
- Webフォント読み込みのため、初回実行時はネットワーク接続が必要。
