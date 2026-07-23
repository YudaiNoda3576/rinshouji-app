# 個人情報マスク（クラウド投入用）

実データ（檀信徒名簿・過去帳の CSV）は git 管理外・ローカル限定で扱う。
クラウド（Neon）の dev/本番 DB には **ローカルでマスク処理したデータだけ** を置く。

このディレクトリは、ローカルの使い捨て DB `rinshouji_masked` を作り、通常の migrate で
実データを投入したうえで氏名・住所・電話・戒名・原文（`import_records`）などの個人情報を
架空値へ置換し、検査してから `pg_dump | psql` で Neon へ流し込むための一式。

```
scripts/mask/
  mask.sql     マスク本体（BEGIN/COMMIT で囲んだ決定的マスク）
  verify.sql   マスク漏れ検査（違反があれば非ゼロ終了）
  README.md    この手順書
```

## 全体フロー

```
ローカル使い捨てDB rinshouji_masked 作成 + スキーマ適用
  → migrate（実データ投入）
  → mask.sql 適用
  → migrate:parties 再実行（マスク済み household_members から parties 再生成）
  → verify.sql 検査
  → 追加の手動全文検索
  → pg_dump | psql で Neon へ投入
```

> **重要**: 実データ（CSV・マスク前の DB）は絶対にクラウドへ向けないこと。詳細は末尾「注意」参照。

---

## 0. 前提

- ローカルの `db` コンテナが起動していること。

  ```bash
  docker compose up -d db
  ```

  - コンテナ名: `rinshouji-db` / DB ユーザ: `rinshouji` / パスワード: `rinshouji`（`compose.yaml` 既定値）
  - ポート: `localhost:5432`

- 移行元 CSV 2 ファイル（git 管理外。`.claude/` 等に配置）。
  - 檀信徒名簿 CSV / 過去帳 CSV。実際のファイル名は `scripts/migrate/README.md` の例を参照。

- 移行スクリプトの依存インストール。

  ```bash
  cd scripts/migrate && npm install
  ```

- Neon への投入時は、対象ブランチの **直結（pooler ではない）接続文字列** を環境変数に入れておく。

  ```bash
  export NEON_DIRECT_URL='postgresql://<user>:<password>@<host>/<db>?sslmode=require'
  ```

---

## 1. 使い捨て DB `rinshouji_masked` の作成 + スキーマ適用

`rinshouji_masked` は「マスク専用の使い捨て DB」。既にあれば作り直す。

```bash
# 既存を破棄して作り直す（接続が残っていると DROP が失敗するので注意）
docker exec -i rinshouji-db psql -U rinshouji -d postgres \
  -c "DROP DATABASE IF EXISTS rinshouji_masked;" \
  -c "CREATE DATABASE rinshouji_masked;"

# スキーマ適用（01_schema.sql は先頭で DROP TABLE ... CASCADE するため再適用可）
docker exec -i rinshouji-db psql -v ON_ERROR_STOP=1 -U rinshouji -d rinshouji_masked \
  < db/init/01_schema.sql
```

---

## 2. migrate 実行（実データ投入。接続先は rinshouji_masked）

`DATABASE_URL` を `rinshouji_masked` に向けて migrate を流す。CSV 引数の書式は
`scripts/migrate/README.md` に合わせる（`--meibo` / `--kakocho`）。

```bash
cd scripts/migrate
DATABASE_URL='postgres://rinshouji:rinshouji@localhost:5432/rinshouji_masked' \
npm run migrate -- \
  --meibo   "../../.claude/林昌寺 檀信徒名簿（2026.5.8更新） - コピー.xlsx - 檀信徒名簿.csv" \
  --kakocho "../../.claude/林昌寺過去帳令和8年 - コピー.xls - 【いじるな！！】元データ.csv"
```

- CSV のパスは各自の配置に合わせて置き換えること。
- この時点では **実データがそのまま** 入っている（`rinshouji_masked` はローカル限定なので問題ない）。

---

## 3. mask.sql 適用 → migrate:parties 再実行 → verify.sql 検査

```bash
# 3-1. マスク適用（ON_ERROR_STOP=1 必須。1 文でも失敗したら全体ロールバック）
docker exec -i rinshouji-db psql -v ON_ERROR_STOP=1 -U rinshouji -d rinshouji_masked \
  < scripts/mask/mask.sql

# 3-2. parties 再生成（マスク済み household_members から origin='import' を作り直す）
cd scripts/migrate
DATABASE_URL='postgres://rinshouji:rinshouji@localhost:5432/rinshouji_masked' \
  npm run migrate:parties
cd ../..

# 3-3. マスク漏れ検査（違反があれば非ゼロ終了して投入を止める）
docker exec -i rinshouji-db psql -v ON_ERROR_STOP=1 -U rinshouji -d rinshouji_masked \
  < scripts/mask/verify.sql
```

`mask.sql` が置換する主な内容:

- **世帯単位で姓を統一**（`households.family_name` / その世帯の `household_members.name` の姓 /
  紐づく `deceased_persons.secular_name`・`sponsor_name` の姓 / `columbarium_units.ihai_name` の
  「○○家」部分がすべて同じ架空姓）。孤立故人（`household_id` NULL）は独自姓。
- 住所・郵便番号・電話・携帯を id ベースの架空値へ（元が NULL の列は NULL のまま）。
- 戒名を院号＋道号＋戒名＋位号で架空合成（元が NULL は NULL のまま）。
- `note` / `kaimyo_note` / `notice_note` などの自由記述を NULL。
- `import_records.raw_data` を空 JSONB `{}` に。
- `user_accounts` を全削除、`parties(origin='manual')` を削除（`origin='import'` は 3-2 で再生成）。

`verify.sql` は上記の漏れを検査し、問題なければ各テーブルの件数を出力する。

> なぜ順序が重要か:
> `mask.sql` の `parties` は手入力（`origin='manual'`）を消すだけで、機械生成（`origin='import'`）は
> 触らない。`origin='import'` の `display_name` は実名のままなので、**必ず 3-2 の migrate:parties で
> マスク済み household_members から再生成してから** 3-3 の検査・投入を行うこと。

---

## 4. 追加の手動確認（既知の実在値での全文検索）

`verify.sql` はパターン検査までしか行わない。念のため、**実在する姓・電話番号を数件** 手元で選び、
マスク後 DB に残っていないことを全文検索で確認する（`<実在姓>` 等は実データを見て置き換える）。

```bash
# 例: 実在姓が氏名系カラムに残っていないか（0 件であること）
docker exec -i rinshouji-db psql -U rinshouji -d rinshouji_masked -c "
  SELECT 'household_members' AS t, count(*) FROM household_members WHERE name LIKE '%<実在姓>%'
  UNION ALL SELECT 'deceased.secular', count(*) FROM deceased_persons WHERE secular_name LIKE '%<実在姓>%'
  UNION ALL SELECT 'deceased.sponsor', count(*) FROM deceased_persons WHERE sponsor_name LIKE '%<実在姓>%'
  UNION ALL SELECT 'households.family',count(*) FROM households        WHERE family_name  LIKE '%<実在姓>%'
  UNION ALL SELECT 'columbarium.ihai', count(*) FROM columbarium_units WHERE ihai_name    LIKE '%<実在姓>%'
  UNION ALL SELECT 'parties.name',     count(*) FROM parties           WHERE display_name LIKE '%<実在姓>%';
"

# 例: 実在の電話番号の下 4 桁などが残っていないか（0 件であること）
docker exec -i rinshouji-db psql -U rinshouji -d rinshouji_masked -c "
  SELECT count(*) FROM households WHERE phone LIKE '%<実在下4桁>%' OR mobile_phone LIKE '%<実在下4桁>%';
"

# 例: import_records の原文が完全に空になっているか（'{}' 以外が 0 件であること）
docker exec -i rinshouji-db psql -U rinshouji -d rinshouji_masked -c "
  SELECT count(*) FROM import_records WHERE raw_data <> '{}'::jsonb;
"
```

いずれも 0 件であることを確認する。1 件でも残る場合は `mask.sql` を見直し、`rinshouji_masked` を
作り直して手順 1 からやり直す。

---

## 5. Neon への投入（pg_dump | psql）

検査を通過したら、`rinshouji_masked` をダンプして Neon の対象ブランチへ流し込む。

```bash
docker exec rinshouji-db \
  pg_dump -U rinshouji -d rinshouji_masked \
    --clean --if-exists --no-owner --no-privileges \
| psql "$NEON_DIRECT_URL"
```

- `--clean --if-exists`: 投入先の既存オブジェクトを `DROP ... IF EXISTS` してから作り直す（洗い替え）。
- `--no-owner --no-privileges`: ローカルのロール（`rinshouji`）や権限設定を持ち込まない。
- 投入後、Neon 側でも件数を突合しておくとよい。

  ```bash
  psql "$NEON_DIRECT_URL" -c "
    SELECT 'households' AS t, count(*) FROM households
    UNION ALL SELECT 'deceased_persons', count(*) FROM deceased_persons
    UNION ALL SELECT 'parties', count(*) FROM parties
    UNION ALL SELECT 'user_accounts', count(*) FROM user_accounts;"
  ```

  `verify.sql` 末尾に出た件数サマリと一致していること（`user_accounts` は 0 件）。

---

## 6. Neon のブランチ運用（main → dev 分岐 / 再投入）

- **初回**: Neon の `main` ブランチへ上記 5 で投入したら、`main` から `dev` ブランチを分岐する。
  - Neon コンソール or CLI（`neonctl branches create --parent main --name dev`）で分岐。
  - 分岐直後は `dev` が `main` のコピーになる。開発用の接続先には `dev` の接続文字列を使う。

- **データ更新時（実データが更新されたとき）の再投入**:
  1. 手順 1〜4 をやり直してマスク済み `rinshouji_masked` を作り直す。
  2. `NEON_DIRECT_URL` を **`main` ブランチ** の直結接続に設定して手順 5 を再実行（`main` を洗い替え）。
  3. `dev` は必要に応じて `main` から再分岐（`reset`）して最新化する。
     - 検証中の `dev` を壊したくない場合は分岐タイミングを調整すること。

> `main`/`dev` どちらに向けているかは投入前に必ず確認する。**本番相当の `main` を意図せず洗い替えないこと。**

---

## 7. 注意（絶対に守ること）

- **実データ（CSV・マスク前の DB）は絶対にクラウドへ向けない。**
  - `pg_dump` の対象は必ず `rinshouji_masked`。通常開発 DB の `rinshouji` を Neon へ流さないこと。
  - `NEON_DIRECT_URL` を設定したまま誤って migrate を叩かない（migrate の接続先は常に localhost）。
- CSV とマスク前 DB のダンプはリポジトリにコミットしない（`.claude/` 等の git 管理外に置く）。
- 投入は必ず `verify.sql` 通過後に行う。検査で 1 件でも違反が出たら投入しない。
- マスクは決定的（同じ入力からは同じ架空値）だが、**実在の姓名・住所とは無関係な架空値** である。
  復元はできない設計。マスク後の値から実データを推測しないこと。
