# VRT — ビジュアルリグレッションテスト

フロントエンド(`app/frontend`)のスクリーンショットをベースライン画像と比較し、意図しない見た目の変化(デグレ)を検出するハーネス。

## 使い方

```
docker compose up -d          # http://localhost:8123 を起動しておく
cd scripts/vrt
npm install                   # 初回のみ
npm run vrt                   # baseline と比較 (差分があれば exit 1)
npm run vrt:update            # 現在の見た目を baseline として登録
```

## UI変更後のルール

`app/frontend` 配下の見た目に影響する変更をしたら、必ず `npm run vrt` を実行すること。

1. `output/diff/` の差分画像を確認し、意図した変更のみが差分になっていることを確かめる。
2. 意図しない差分(デグレ)があれば、先に修正する。
3. 差分が意図どおりなら `npm run vrt:update` を実行し、`baseline/` の変更もコミットに含める。

## 対象シナリオ

SP(375×812)と PC(1440×900)の2ビューポート × ダッシュボード+予定管理4ビュー(日/週/月/スケジュール)の計10枚。モックの「今日」(2026-05-12)と現在時刻インジケータ(11:18)は固定のため撮影は決定論的。

## 前提条件

- Docker で `http://localhost:8123` (frontend) が起動していること(`BASE_URL` 環境変数で変更可)。
- Google Chrome がインストール済みであること(`CHROME_PATH` 環境変数で変更可)。
- Webフォント読み込みのため、初回実行時はネットワーク接続が必要。

## ディレクトリ構成

- `baseline/` — 正となるスクリーンショット。**コミット対象**。
- `output/current/` — 直近実行の撮影結果(gitignore)。
- `output/diff/` — 差分の可視化画像(gitignore)。
