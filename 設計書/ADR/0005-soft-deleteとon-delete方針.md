# 0005: status カラムによる soft delete と、FK ごとの CASCADE/SET NULL/RESTRICT 使い分け

- ステータス: 承認
- 決定日: 2026-07-17
- 決定者: DB設計担当

## コンテキスト

檀家名簿には「地区区分1＝削除」（172件）や住所2への「離檀」メモ（8件）など、世帯が実質的に無効化された状態を表す実データが存在する。これらの世帯を物理削除すると、紐づく過去帳・区画データとの整合性が壊れ、記録として保持すべき情報が失われる。

また、`households`/`deceased_persons`/`parties` 等の間には多数の外部キーがあり、親レコード削除時の子レコードの扱い（`ON DELETE` 方針）をテーブル定義書には明記がなかったため、実装（`db/init/01_schema.sql`）側で判断を補う必要があった。

## 検討した選択肢

### soft delete の要否

| 観点 | 物理削除のみ | status カラムによる soft delete（採用） |
| --- | --- | --- |
| 実データ適合 | 「削除」「離檀」を行の消失としてしか表現できず、削除理由・記録が失われる | `active`/`inactive`/`deleted` で「削除」（地区区分1=削除 172件）と「離檀」（住所2メモ 8件）を区別して保持できる |
| 復元・監査 | 不可 | status を戻すだけで容易。過去帳・区画等の関連データも保持されたまま |
| 一覧表示 | 削除行は自動的に見えなくなる | `status` によるフィルタが必要（アプリ側の対応が前提） |

### ON DELETE 方針（FK ごとの分類基準）

| 分類 | 適用基準 | 適用例 |
| --- | --- | --- |
| CASCADE | 親に完全従属し、親が消えれば独立した業務的意味を持たないレコード | `household_members`/`cemetery_plots`/`columbarium_units` → households、`party_roles`/`household_memberships` → parties |
| SET NULL | 親が消えても子レコード自体は記録として残す意味がある、または参照が分類目的で NULL 許容が前提 | `deceased_persons.household_id`（孤立故人化）、`households.district_id`/`import_record_id`、`deceased_persons.import_record_id`、`household_memberships.household_member_id`（生成元トレース） |
| RESTRICT（既定含む） | マスタ的存在で、使用中の値が消えるのは事故（誤削除防止のため止める） | `districts.parent_id`（自己参照）、`party_roles.role_type_id`、`user_accounts.party_id` |

## 決定

- `households`（および将来的に他テーブルでも）は `status` カラム（`active`/`inactive`/`deleted`）による soft delete を採用する。物理削除は行わない。
- FK ごとの `ON DELETE` は上記3分類の基準で使い分ける。分類の根拠は `db/init/01_schema.sql` のファイルヘッダおよび各 FK 直前のコメントに明記する。

## 理由

- 名簿の「削除」「離檀」は業務上意味の異なる2状態であり、物理削除では区別できない。soft delete であれば `active`/`inactive`/`deleted` として実データにそのまま対応させられる。
- ON DELETE の使い分けを「完全従属（CASCADE）」「記録として独立に残す（SET NULL）」「マスタ保護（RESTRICT）」の3分類で統一することで、FK ごとに場当たり的な判断をせず、後から見た人が分類基準から挙動を予測できる。

## 結果・トレードオフ

- soft delete のため、一覧表示・検索クエリは常に `status` によるフィルタを意識する必要があり、フィルタ漏れは削除済みデータの意図しない表示につながる。
- ON DELETE の分類は定義書に明記が無く実装時の判断で補ったものであり、将来のスキーマ理解者が根拠を追えるよう、判断はコード（DDLコメント）に残すことを必須とする（本 ADR とコードコメントの二重管理ではなく、コメント側は実装の正、本 ADR は分類基準の記録という役割分担）。
- RESTRICT を選んだ FK（`districts.parent_id` 等）は、業務フロー上想定していない削除操作を行うとエラーになる。これは意図的な安全策である。

## 関連

- [0001-csv原文のimport-recordsステージング.md](./0001-csv原文のimport-recordsステージング.md)
- [0003-生sqlとスキーマ一本管理.md](./0003-生sqlとスキーマ一本管理.md)
- [データモデル設計.md「5.1 households.status」](../DB設計/データモデル設計.md)
- [db/init/01_schema.sql](../../db/init/01_schema.sql)（ファイルヘッダの ON DELETE 方針コメント、各 FK 直前の理由コメント）
