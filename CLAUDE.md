# rinshouji-app

寺務管理システムのプロトタイプ。`app/frontend` はビルドレスReact(React 18 UMD + Babel standalone)構成で、モックデータ駆動で動作する。

## 開発サーバ

```
docker compose up -d
```

起動後 http://localhost:8123 でフロントエンドを確認できる。ソースはRO(read-only)マウントされており、`app/frontend` 配下のファイルを編集してブラウザをリロードすれば変更が反映される。

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
