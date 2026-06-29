# ER図

## 設計要点

- 現スコープは「檀信徒管理」「過去帳」「将来の人中心拡張」であるため、固定値の小マスタと本格RBACは当面持たない。YAGNIに基づき、少数で固定的な区分・状態は各参照元テーブルのコード列とCHECK制約で表現する。
- 最終テーブルは17テーブルとする。人中心モデルの骨格、世帯管理、過去帳、認証、CSV移行監査は維持し、過剰分離していた小マスタとRBAC関連テーブルを廃止する。
- 「人」は `persons`（個人マスタ）を中心に表現する。檀家世帯の代表者・家族・前戸主・連絡先人物、檀家ではない参拝者・ボランティア・寄進者・業者・僧侶・寺族などもすべて `persons` に登録できる。
- `households` は既存の檀信徒名簿ベースの世帯管理として維持する。`households.house_no` は引き続き4桁家番の主キーとし、檀家・信徒などの関係区分は `relationship_code` で持つ。
- 旧 `household_related_people` 相当の情報は、物理テーブルとしては `persons` + `household_person_relationships` に統合する。世帯内関係は `household_person_relationships.relationship_code` で表現し、必要に応じて互換ビュー `household_related_people` を提供する。
- 人が寺院との関係で果たす役割は `person_roles.stakeholder_code` で表現する。檀家、参拝者、ボランティア、寄進者、業者、僧侶、寺族などの複数付与と期間管理を可能にする。
- アプリケーション権限は `user_accounts.role` の単一ロールで管理する。将来、権限が複雑化した段階でロール・権限・付与履歴のテーブルへ展開できる。
- 認証情報では生パスワードを保持しない。メール/パスワード認証ではパスワードハッシュとハッシュ方式を保持し、OAuth等は `user_external_identities.provider_code` で認証プロバイダを識別する。
- 施設は正規化済み区画マスタを切り出さず、当面は `household_facility_usages` に施設種別コード、状態コード、区画原表記、幅、入金、代金、備考をまとめる。元データ清掃後に区画マスタが必要になった場合のみ分離する。
- `household_memorial_tablets` は位牌が墓地・納骨堂区画と性質が異なるため単独維持する。
- `deceased_memorial_anniversaries` は故人ごとの年忌対象年を表す記録で、年忌種別、対象年、原表記を保持する。年忌種別は順序・没後年数を持つため `memorial_anniversary_types` として維持する。
- CSV移行監査のため、`import_batches` と `source_csv_rows` は維持する。正規化できない値、原表記、特殊家番、家番空欄行は引き続き原行JSONまたは `raw_*` カラムへ残す。
- 個人情報・認証情報を扱うテーブルには、必要に応じて `deleted_at` を持たせ、退会・論理削除・表示抑止を可能にする。全テーブルに `created_at`、`updated_at` を持たせる。

## Mermaid ER図

### 檀信徒・過去帳・移行基盤

```mermaid
erDiagram
    import_batches ||--o{ source_csv_rows : "取り込み原行"

    source_csv_rows ||--o{ persons : "移行元"
    source_csv_rows ||--o{ households : "移行元"
    source_csv_rows ||--o{ household_phone_numbers : "移行元"
    source_csv_rows ||--o{ household_person_relationships : "移行元"
    source_csv_rows ||--o{ household_service_preferences : "移行元"
    source_csv_rows ||--o{ household_facility_usages : "移行元"
    source_csv_rows ||--o{ household_memorial_tablets : "移行元"
    source_csv_rows ||--o{ deceased_persons : "移行元"
    source_csv_rows ||--o{ deceased_memorial_anniversaries : "移行元"

    districts ||--o{ districts : "親子地区"
    districts ||--o{ households : "現所属地区"
    districts ||--o{ deceased_persons : "過去帳地区"

    persons ||--o{ households : "世帯代表者"
    households ||--o{ household_phone_numbers : "世帯連絡先"
    households ||--o{ household_person_relationships : "世帯と人"
    persons ||--o{ household_person_relationships : "所属・関係"

    households ||--o{ household_service_preferences : "法要・案内設定"
    households ||--o{ household_facility_usages : "施設利用"
    households ||--o{ household_memorial_tablets : "位牌"

    households ||--o{ deceased_persons : "故人"
    persons ||--o{ deceased_persons : "個人リンク・施主"
    memorial_anniversary_types ||--o{ deceased_memorial_anniversaries : "年忌種別"
    deceased_persons ||--o{ deceased_memorial_anniversaries : "年忌記録"

    import_batches {
        bigint import_batch_id PK
        varchar source_kind
        text source_file_path
        text source_file_name
        char checksum_sha256
        integer row_count
        text notes
        timestamptz imported_at
        timestamptz created_at
        timestamptz updated_at
    }

    source_csv_rows {
        bigint source_csv_row_id PK
        bigint import_batch_id FK
        integer source_row_no
        varchar row_kind
        jsonb raw_record
        text parse_notes
        timestamptz created_at
        timestamptz updated_at
    }

    districts {
        bigint district_id PK
        bigint parent_district_id FK
        smallint district_level
        varchar district_name
        varchar normalized_name
        varchar source_name
        integer sort_order
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    households {
        char house_no PK
        bigint source_csv_row_id FK
        bigint district_id FK
        varchar relationship_code
        text relationship_raw
        bigint representative_person_id FK
        varchar reference_no
        text representative_name
        text representative_name_kana
        varchar postal_code
        text address_line1
        text address_line2
        text notes
        smallint source_sort_rank
        boolean is_placeholder
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    persons {
        bigint person_id PK
        bigint source_csv_row_id FK
        text display_name
        text name_kana
        text family_name
        text given_name
        date birth_date
        varchar birth_date_precision
        varchar gender_code
        text notes
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    household_person_relationships {
        bigint household_person_relationship_id PK
        char house_no FK
        bigint person_id FK
        bigint source_csv_row_id FK
        varchar relationship_code
        text relationship_raw
        varchar source_column_name
        smallint display_order
        boolean is_representative
        boolean is_primary_contact
        date start_date
        date end_date
        text notes
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    household_phone_numbers {
        bigint phone_number_id PK
        char house_no FK
        bigint source_csv_row_id FK
        varchar phone_type
        text phone_number_raw
        varchar phone_number_normalized
        text contact_person_name
        varchar source_column_name
        smallint display_order
        timestamptz created_at
        timestamptz updated_at
    }

    household_service_preferences {
        bigint service_preference_id PK
        char house_no FK
        bigint source_csv_row_id FK
        varchar service_code
        varchar service_status_code
        text raw_value
        smallint scheduled_month
        smallint scheduled_day
        smallint day_of_month
        text schedule_note
        varchar source_column_name
        timestamptz created_at
        timestamptz updated_at
    }

    household_facility_usages {
        bigint facility_usage_id PK
        char house_no FK
        bigint source_csv_row_id FK
        varchar facility_code
        varchar facility_status_code
        text location_raw
        text raw_section_value
        numeric width_cm
        text width_raw
        date payment_date
        text payment_date_raw
        integer fee_amount
        text notes
        smallint display_order
        timestamptz created_at
        timestamptz updated_at
    }

    household_memorial_tablets {
        bigint memorial_tablet_id PK
        char house_no FK
        bigint source_csv_row_id FK
        varchar tablet_status_code
        text raw_status
        text tablet_name
        text notes
        timestamptz created_at
        timestamptz updated_at
    }

    deceased_persons {
        bigint deceased_id PK
        bigint person_id FK
        char house_no FK
        bigint source_csv_row_id FK
        text raw_house_no
        text posthumous_name
        text secular_name
        date death_date
        varchar death_date_precision
        smallint death_year
        smallint death_month
        smallint death_day
        bigint district_id FK
        text sponsor_text
        bigint sponsor_person_id FK
        text sponsor_name
        text sponsor_relationship_text
        integer age_at_death
        text age_at_death_raw
        text remarks
        timestamptz created_at
        timestamptz updated_at
    }

    memorial_anniversary_types {
        smallint memorial_anniversary_type_id PK
        varchar anniversary_code
        varchar anniversary_name
        smallint years_after_death
        integer sort_order
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    deceased_memorial_anniversaries {
        bigint deceased_memorial_anniversary_id PK
        bigint deceased_id FK
        bigint source_csv_row_id FK
        smallint memorial_anniversary_type_id FK
        smallint target_year
        text target_year_japanese
        text source_value
        boolean is_from_source
        text notes
        timestamptz created_at
        timestamptz updated_at
    }
```

### 人・連絡先・ステークホルダー役割

```mermaid
erDiagram
    persons ||--o{ person_contact_points : "個人連絡先"
    persons ||--o{ person_roles : "寺院との役割"

    persons {
        bigint person_id PK
        bigint source_csv_row_id FK
        text display_name
        text name_kana
        text family_name
        text given_name
        date birth_date
        varchar birth_date_precision
        varchar gender_code
        text notes
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    person_contact_points {
        bigint person_contact_point_id PK
        bigint person_id FK
        varchar contact_point_code
        bigint source_csv_row_id FK
        text contact_value_raw
        text contact_value_normalized
        boolean is_primary
        timestamptz verified_at
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    person_roles {
        bigint person_role_id PK
        bigint person_id FK
        varchar stakeholder_code
        date valid_from
        date valid_to
        text role_note
        timestamptz created_at
        timestamptz updated_at
    }
```

### 認証・アカウント

```mermaid
erDiagram
    persons ||--o{ user_accounts : "ログイン主体"
    user_accounts ||--o{ user_external_identities : "認証連携"

    user_accounts {
        bigint user_account_id PK
        bigint person_id FK
        varchar role
        varchar account_status
        citext primary_email
        text password_hash
        varchar password_hash_algorithm
        timestamptz password_updated_at
        timestamptz email_verified_at
        timestamptz last_login_at
        timestamptz disabled_at
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    user_external_identities {
        bigint user_external_identity_id PK
        bigint user_account_id FK
        varchar provider_code
        text provider_subject
        citext provider_email
        timestamptz linked_at
        timestamptz created_at
        timestamptz updated_at
    }
```
