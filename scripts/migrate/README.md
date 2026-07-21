# データ移行スクリプト

檀信徒名簿・過去帳の Excel 由来 CSV を PostgreSQL の正規化スキーマへ移行する。
変換規則の正は `設計書/DB設計/データ移行設計.md`(全列マッピング・クレンジング課題)。

## 前提

- DB が起動しスキーマ適用済みであること:

```bash
docker compose up -d db
docker exec -i rinshouji-db psql -U rinshouji -d rinshouji < db/init/01_schema.sql
```

- 依存インストール: `cd scripts/migrate && npm install`
- 移行元 CSV は git 管理外(`.claude/` 等)に置き、リポジトリへコミットしないこと

## 実行

```bash
cd scripts/migrate
npm run migrate -- \
  --meibo   "../../.claude/林昌寺 檀信徒名簿（2026.5.8更新） - コピー.xlsx - 檀信徒名簿.csv" \
  --kakocho "../../.claude/林昌寺過去帳令和8年 - コピー.xls - 【いじるな！！】元データ.csv"
```

- `npm run migrate:import` … フェーズ①のみ(CSV → import_records)。`--meibo`/`--kakocho` 必須
- `npm run migrate:transform` … フェーズ②③(import_records → 本番テーブル → parties 再生成)
- `npm run migrate:parties` … フェーズ③のみ(household_members → parties 再生成)。
  CSV 引数不要。既存 DB の household_members から parties/household_memberships/
  party_roles を単独トランザクションで再生成したいとき用
- 接続先の変更: `DATABASE_URL=postgres://user:pass@host:5432/dbname npm run migrate -- ...`

## 冪等性

再実行のたびに import_records(①)と本番 7 テーブル(②。household_memberships 含む)を
TRUNCATE してから入れ直す洗い替え方式。何度実行しても結果は同一になる。

parties(③)は household_members から機械生成される `origin='import'` の行のみを
洗い替え対象とする(TRUNCATE ではなく `DELETE FROM parties WHERE origin='import'`)。
寺務員アカウント等の手入力データ(`origin='manual'`)は削除しない。import 由来の
party に user_accounts が付与されている場合は削除対象から除外し、警告に記録する。

## レポートの読み方

実行ごとに `report/migration-report.md`(git 管理外)を出力する。

| セクション | 内容 |
| --- | --- |
| 件数サマリ | CSV 行数 → import_records → 各本番テーブルの件数とスキップ数 |
| 暫定処理適用件数 | 要ヒアリング関連の仮ルール適用数(例: 家番 8888 → 世帯なし)。`設計書/クライアント確認事項.md` の回答が得られたら規則を見直す |
| 警告リスト | 目視補正の候補(FK 不突合・分割不能・日付変換不能 等)。source と row(CSV のデータ行番号)で原文まで遡れる |

## 構成

```
src/cli.ts               エントリポイント(引数解釈・実行順)
src/import-phase.ts      フェーズ①: CSV → import_records
src/transform-phase.ts   フェーズ②③: オーケストレーション(洗い替え。②の後に③を同一トランザクションで実行)
src/districts.ts         地区マスタ構築(区分1→区分2 の階層)
src/transform-households.ts  名簿 → households/members/plots/units
src/transform-deceased.ts    過去帳 → deceased_persons(家番で FK 解決)
src/build-parties.ts     フェーズ③: household_members → parties/household_memberships/party_roles
src/converters/          変換規則(漢数字・和暦・カナ・施主分割・区画判定 等)
src/report.ts            件数・警告・暫定処理のレポート生成
```
