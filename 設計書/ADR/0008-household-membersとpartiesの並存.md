# 0008: household_members を正として維持し parties と並存させる（派生生成方式）

- ステータス: 承認
- 決定日: 2026-07-19
- 決定者: DB設計担当

## コンテキスト

パーティモデル（[0006](./0006-パーティモデルの採用.md)）導入にあたり、檀信徒人物の既存の正である `household_members` と、新設の `parties` をどう関係づけるかを決める必要があった。檀家一覧・過去帳・年忌案内等の既存画面は `household_members` を前提に実装済みであり、これらへの影響を最小化しつつ新ステークホルダー（寺務員アカウント・出店者・借主等）を扱えるようにすることが求められた。

## 検討した選択肢

| 案 | 内容 | 評価 |
| --- | --- | --- |
| 案A: 即統合 | `household_members` を廃止し、`parties` + `household_memberships` に完全移行する | 既存の全画面ロジック（檀家一覧・過去帳・年忌案内等）を同時に書き換える必要があり、移行リスクが大きい。ステークホルダー拡張という当面のスコープに対して過剰 |
| **案B: 並存 + 派生生成（採用）** | `household_members` を正として維持したまま `parties` を並存させる。`origin='import'` の parties は `household_members` から機械生成する読み取り専用の派生データとする | 既存機能・UI への影響を最小化しつつ、`origin='manual'` のパーティ（寺務員アカウント・将来ステークホルダー）を先行導入できる。統合は将来フェーズへ先送りできる |
| 案C: トリガ同期 | `household_members` の INSERT/UPDATE/DELETE を DB トリガで検知し、`parties`/`household_memberships` へリアルタイム同期する | 常時同期の実装・保守コストが高く、トリガの障害時に静かにデータがずれるリスクがある。今フェーズで即時同期が必要な要件（例: 檀信徒ログイン即時反映）はまだ無い |

詳細な比較は [パーティモデル設計.md「4.5 household_members との関係」](../DB設計/パーティモデル設計.md) を参照。

## 決定

案Bを採用する。`household_members` を檀信徒人物の正として維持したまま、`parties`（`origin='import'`）を `household_members` から機械生成する読み取り専用の派生データとして並存させる。

- **origin による洗い替え可否の分離**: `parties.origin='import'` は移行フェーズ③で「全削除 → 全再生成」（冪等）する。`origin='manual'`（寺務員本人・出店者・借主等の手入力）は洗い替え不可侵とし、フェーズ③の削除処理から除外する。`user_accounts` は `origin='manual'` のパーティにのみ付与する運用ルールとし、削除前に存在チェックして事故を防ぐガードを設ける。
- **二重管理リスクの封じ込めルール**:
  - import 由来 parties は読み取り専用。アプリ・移行スクリプトのいずれも `origin='import'` の `parties`/`party_roles`/`household_memberships` を直接更新しない。更新が必要な場合は `household_members` 側を更新しフェーズ③の再生成で反映する。
  - 檀信徒参照機能（檀家一覧・過去帳・年忌案内等）は当面 `household_members` 起点のまま実装する。`parties` 経由への切り替えは行わない。
  - `origin='import'` の parties は「全削除 → 全再生成」でのみ更新し、差分更新はしない。
- **将来統合パス**: フェーズ2で檀信徒参照系の「読み取り」を `parties` 経由に切り替え、フェーズ3で「書き込み」も `parties`/`household_memberships` に一本化し `household_members` を廃止する。`member_role`/`succession_order` の値・意味は `household_memberships` と最初から揃えてあるため、統合時に変換ロジックは不要。

## 理由

- 既存の檀信徒管理機能を一切変更せずに新ステークホルダーを扱えるようにすることが今回のスコープであり、案A・案Cのコスト・リスクに見合う要件がまだない。
- 移行フェーズ③で `household_members` 全行から派生データを機械生成することで、将来統合に必要なデータ形だけを先行して用意できる。
- origin による洗い替え可否の分離と読み取り専用ルールにより、正が二重化する期間中の不整合リスクを構造的に抑え込める。

## 結果・トレードオフ

- 並存期間中は「檀信徒人物の正は `household_members`、`parties`（import）はその派生」という関係を開発者が常に意識する必要があり、誤って `origin='import'` の parties を直接更新すると次回フェーズ③実行時に上書き・消失する。
- `household_memberships` は `PRODUCTION_TABLES`（フェーズ②の TRUNCATE 対象）に明示的に含める一方、`parties`/`party_roles`/`user_accounts`/`role_types` は含めない、という非対称な洗い替え範囲になっており、移行スクリプト保守者はこの非対称性を理解しておく必要がある。
- フェーズ2・3（読み取り切替・書き込み一本化）は本 ADR の対象外であり、実行時期・詳細手順は未定。

## 関連

- [0001-csv原文のimport-recordsステージング.md](./0001-csv原文のimport-recordsステージング.md)（洗い替え可否を境界線で分離するという同種の考え方）
- [0006-パーティモデルの採用.md](./0006-パーティモデルの採用.md)
- [パーティモデル設計.md「4.4 origin による洗い替え共存の仕組み」「4.5 household_members との関係」「4.6 二重管理リスクと封じ込めルール」](../DB設計/パーティモデル設計.md)
- [データ移行設計.md「7. フェーズ③: パーティ生成」](../DB設計/データ移行設計.md)
- [db/init/01_schema.sql](../../db/init/01_schema.sql)
