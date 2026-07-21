-- =====================================================================
-- 林昌寺 檀信徒管理システム 初期スキーマ (public スキーマ)
--
-- 参照仕様:
--   設計書/DB設計/テーブル定義書.md
--   設計書/DB設計/データモデル設計.md
--
-- 実行方式:
--   postgres:16-alpine コンテナ初回起動時に /docker-entrypoint-initdb.d 配下の
--   *.sql として自動実行される（DB 自体は POSTGRES_DB 環境変数で作成済みのため
--   本ファイルでは CREATE DATABASE を行わず、public スキーマにテーブルのみ作成する）。
--
-- 冪等性:
--   自動実行は初回のみだが、手動再適用（psql からの直接投入）に備えて
--   先頭で DROP TABLE IF EXISTS ... CASCADE を依存関係の逆順（子→親）で行う。
--
-- ON DELETE 方針（定義書に記載が無いため本実装で補った判断。理由は各 FK 定義の直前コメントを参照）:
--   households.district_id      -> districts.id       : ON DELETE SET NULL
--   households.import_record_id -> import_records.id  : ON DELETE SET NULL
--   household_members.household_id -> households.id   : ON DELETE CASCADE
--   deceased_persons.household_id  -> households.id   : ON DELETE SET NULL
--   deceased_persons.import_record_id -> import_records.id : ON DELETE SET NULL
--   cemetery_plots.household_id    -> households.id    : ON DELETE CASCADE
--   columbarium_units.household_id -> households.id    : ON DELETE CASCADE
--   districts.parent_id -> districts.id (自己参照)      : ON DELETE RESTRICT（既定）
--   party_roles.party_id                       -> parties.id            : ON DELETE CASCADE
--   party_roles.role_type_id                   -> role_types.id         : ON DELETE RESTRICT
--   household_memberships.party_id             -> parties.id            : ON DELETE CASCADE
--   household_memberships.household_id         -> households.id         : ON DELETE CASCADE
--   household_memberships.household_member_id  -> household_members.id  : ON DELETE SET NULL
--   user_accounts.party_id                     -> parties.id            : ON DELETE RESTRICT
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. 後片付け（依存関係の逆順: 子テーブル -> 親テーブル）
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS user_accounts CASCADE;
DROP TABLE IF EXISTS household_memberships CASCADE;
DROP TABLE IF EXISTS party_roles CASCADE;
DROP TABLE IF EXISTS parties CASCADE;
DROP TABLE IF EXISTS role_types CASCADE;
DROP TABLE IF EXISTS columbarium_units CASCADE;
DROP TABLE IF EXISTS cemetery_plots CASCADE;
DROP TABLE IF EXISTS deceased_persons CASCADE;
DROP TABLE IF EXISTS household_members CASCADE;
DROP TABLE IF EXISTS households CASCADE;
DROP TABLE IF EXISTS districts CASCADE;
DROP TABLE IF EXISTS import_records CASCADE;

DROP FUNCTION IF EXISTS set_updated_at();

-- ---------------------------------------------------------------------
-- 共通関数: updated_at 自動更新トリガ
--   import_records は追記専用のため対象外（テーブル定義書 冒頭の全体方針）。
-- ---------------------------------------------------------------------
CREATE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION set_updated_at() IS '行更新時に updated_at を CURRENT_TIMESTAMP へ更新する共通トリガ関数';

-- =====================================================================
-- 0. 取込レコード（import_records）
-- =====================================================================
CREATE TABLE import_records (
    id           BIGSERIAL PRIMARY KEY,
    source_file  VARCHAR(20)  NOT NULL
                 CHECK (source_file IN ('檀信徒名簿', '過去帳')),
    row_number   INTEGER      NOT NULL,
    raw_data     JSONB        NOT NULL,
    imported_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 取込元行の一意化（再取込時の重複防止）。旧家番はデータとして一意でないため
    -- 行番号ベースの一意化が唯一成立するキーである（データモデル設計.md 6.4）。
    CONSTRAINT uq_import_records_source_row UNIQUE (source_file, row_number)
);

COMMENT ON TABLE import_records IS '取込レコード: 移行元CSVの原文ステージング（1CSV行=1レコード、全列をraw_dataに保持）';
COMMENT ON COLUMN import_records.source_file IS '取込元ファイル（檀信徒名簿/過去帳）';
COMMENT ON COLUMN import_records.row_number IS 'CSVのデータ行番号（ヘッダ除く1始まり）';
COMMENT ON COLUMN import_records.raw_data IS '原文データ。全列を列名キーで丸ごと保持（無名列は「無名列」等のキーで格納）';
COMMENT ON COLUMN import_records.imported_at IS '取込日時。追記専用のためcreated_at/updated_atは持たない';

-- =====================================================================
-- 1. 地区（districts）
-- =====================================================================
CREATE TABLE districts (
    id         BIGSERIAL PRIMARY KEY,
    parent_id  BIGINT,
    name       VARCHAR(50)  NOT NULL,
    level      SMALLINT     NOT NULL
               CHECK (level IN (1, 2)),
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 自己参照: 区分2 が区分1 を指す。子（区分2）が存在する区分1 の削除は
    -- 想定業務フローに無いため、既定の ON DELETE RESTRICT のまま（削除時はエラーで気付ける）。
    CONSTRAINT fk_districts_parent
        FOREIGN KEY (parent_id) REFERENCES districts (id),

    -- level=2 のとき parent_id が必須、level=1 のとき parent_id は NULL 必須（定義書 制約節）。
    CONSTRAINT chk_districts_level_parent
        CHECK (
            (level = 1 AND parent_id IS NULL)
            OR (level = 2 AND parent_id IS NOT NULL)
        )
);

COMMENT ON TABLE districts IS '地区: 名簿の地区区分1・区分2を自己参照階層で正規化するマスタ';
COMMENT ON COLUMN districts.parent_id IS '親地区ID。区分2の場合に区分1を指す。区分1はNULL';
COMMENT ON COLUMN districts.name IS '地区名（正規化後）';
COMMENT ON COLUMN districts.level IS '階層。1=区分1 / 2=区分2';

CREATE INDEX idx_districts_parent_id ON districts (parent_id);
CREATE INDEX idx_districts_name ON districts (name);
-- 同一親配下での地区名重複防止（テーブル定義書「制約・インデックス」節 推奨事項）。
-- NULLS NOT DISTINCT: 既定では UNIQUE インデックスは NULL を別値扱いするため、
-- level=1（parent_id IS NULL）の地区が同名で何件でも登録できてしまう。
-- PostgreSQL 15+ の NULLS NOT DISTINCT で区分1 同士の同名も一意化する。
CREATE UNIQUE INDEX uq_districts_parent_name
    ON districts (parent_id, name) NULLS NOT DISTINCT;

CREATE TRIGGER trg_districts_set_updated_at
    BEFORE UPDATE ON districts
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- =====================================================================
-- 2. 世帯（households）
-- =====================================================================
CREATE TABLE households (
    id                   BIGSERIAL PRIMARY KEY,
    district_id          BIGINT,
    import_record_id     BIGINT,
    family_name          VARCHAR(50),
    status               VARCHAR(20)  NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active', 'inactive', 'deleted')),
    relation_type        VARCHAR(10)
                         CHECK (relation_type IN ('檀家', '信徒', '檀徒', '他寺', 'その他')),
    postal_code          VARCHAR(8),
    address_1            VARCHAR(255),
    address_2            VARCHAR(255),
    phone                VARCHAR(20),
    mobile_phone         VARCHAR(50),
    hannya_service       VARCHAR(10)
                         CHECK (hannya_service IN ('組', '郵送', 'なし')),
    sejiki_service       VARCHAR(10)
                         CHECK (sejiki_service IN ('組', '郵送', 'なし', '不要')),
    tanagyo_schedule     VARCHAR(50),
    monthly_service_day  VARCHAR(20),
    jizo_flag            BOOLEAN      NOT NULL DEFAULT false,
    ihai_status          VARCHAR(10)
                         CHECK (ihai_status IN ('あり', 'なし')),
    note                 TEXT,
    created_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 地区マスタ削除時: 世帯を消さず「地区未設定」に落とす（名簿の地区区分1に
    -- 非地区値混入があり district_id は元々NULL許容のため、削除の連鎖よりSET NULLが安全）。
    CONSTRAINT fk_households_district
        FOREIGN KEY (district_id) REFERENCES districts (id)
        ON DELETE SET NULL,

    -- ステージング(import_records)はあくまで参照用の原文保管であり、本番データの
    -- 存続に影響させるべきではないためSET NULL（CASCADEにすると原文再取込整理で
    -- 本番世帯が消えてしまう）。
    CONSTRAINT fk_households_import_record
        FOREIGN KEY (import_record_id) REFERENCES import_records (id)
        ON DELETE SET NULL
);

COMMENT ON TABLE households IS '世帯: 家（戸）単位の中核台帳。連絡先・行事設定・関係区分を内包しstatusでsoft deleteを行う';
COMMENT ON COLUMN households.district_id IS '地区ID。区分2の地区を指す想定。非地区値混入のためNULL可';
COMMENT ON COLUMN households.import_record_id IS '取込レコードID。取込元CSV行への参照。旧家番・旧整理番号・無名列はraw_dataから取得';
COMMENT ON COLUMN households.family_name IS '家名。檀家一覧の主表示・検索キー';
COMMENT ON COLUMN households.status IS '状態。active/inactive/deleted（inactive=離檀等、deleted=soft delete）';
COMMENT ON COLUMN households.relation_type IS '関係区分。檀家/信徒/檀徒/他寺/その他';
COMMENT ON COLUMN households.postal_code IS '郵便番号。ハイフンあり形式（例 486-0854）';
COMMENT ON COLUMN households.address_1 IS '住所1。市区町村・番地';
COMMENT ON COLUMN households.address_2 IS '住所2。建物名等。移行元でメモ流用あり（原文保持）';
COMMENT ON COLUMN households.phone IS '電話（固定電話）';
COMMENT ON COLUMN households.mobile_phone IS '携帯電話';
COMMENT ON COLUMN households.hannya_service IS '般若。組/郵送/なし';
COMMENT ON COLUMN households.sejiki_service IS '施食。組/郵送/なし/不要';
COMMENT ON COLUMN households.tanagyo_schedule IS '棚経予定。月日文字列を原文保持（例「８月１４」）';
COMMENT ON COLUMN households.monthly_service_day IS '月参り日。数値/複雑値を原文保持';
COMMENT ON COLUMN households.jizo_flag IS '地蔵。名簿「地蔵」=true';
COMMENT ON COLUMN households.ihai_status IS '位牌区分。あり/なし';
COMMENT ON COLUMN households.note IS '世帯全体の備考';

CREATE INDEX idx_households_family_name ON households (family_name);
CREATE INDEX idx_households_district_id ON households (district_id);
CREATE INDEX idx_households_status ON households (status);

CREATE TRIGGER trg_households_set_updated_at
    BEFORE UPDATE ON households
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- =====================================================================
-- 3. 世帯構成員（household_members）
-- =====================================================================
CREATE TABLE household_members (
    id                BIGSERIAL PRIMARY KEY,
    household_id      BIGINT       NOT NULL,
    member_role       VARCHAR(20)  NOT NULL
                      CHECK (member_role IN ('head', 'former_head', 'family')),
    name              VARCHAR(100) NOT NULL,
    name_kana         VARCHAR(100),
    succession_order  SMALLINT,
    note              VARCHAR(255),
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 世帯構成員は世帯に完全従属するライフサイクル（世帯が消えれば人物データとしての
    -- 意味も失う）のためCASCADE。
    CONSTRAINT fk_household_members_household
        FOREIGN KEY (household_id) REFERENCES households (id)
        ON DELETE CASCADE
);

COMMENT ON TABLE household_members IS '世帯構成員: 世帯に属する存命人物（現戸主・前戸主・家族）';
COMMENT ON COLUMN household_members.household_id IS '世帯ID';
COMMENT ON COLUMN household_members.member_role IS '役割。head/former_head/family';
COMMENT ON COLUMN household_members.name IS '氏名。姓・名に分割せず原文保持（全角スペース含む。名のみレコードあり）';
COMMENT ON COLUMN household_members.name_kana IS 'フリガナ。現戸主のみ。半角カナ→全角カナへ正規化';
COMMENT ON COLUMN household_members.succession_order IS '継承順。前戸主の順序（1〜4）。他役割はNULL';
COMMENT ON COLUMN household_members.note IS '備考';

-- 世帯あたり現戸主1件を担保する部分UNIQUEインデックス（テーブル定義書 制約・インデックス節）。
CREATE UNIQUE INDEX uq_household_members_head_per_household
    ON household_members (household_id)
    WHERE member_role = 'head';

CREATE INDEX idx_household_members_household_id ON household_members (household_id);
CREATE INDEX idx_household_members_name ON household_members (name);
CREATE INDEX idx_household_members_name_kana ON household_members (name_kana);

CREATE TRIGGER trg_household_members_set_updated_at
    BEFORE UPDATE ON household_members
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- =====================================================================
-- 4. 故人（deceased_persons）
-- =====================================================================
CREATE TABLE deceased_persons (
    id                 BIGSERIAL PRIMARY KEY,
    household_id       BIGINT,
    import_record_id   BIGINT,
    legacy_house_no    VARCHAR(10),
    legacy_district_1  VARCHAR(50),
    legacy_district_2  VARCHAR(50),
    death_year         SMALLINT,
    death_month        SMALLINT
                       CHECK (death_month BETWEEN 1 AND 12),
    death_day          SMALLINT
                       CHECK (death_day BETWEEN 1 AND 31),
    death_date         DATE,
    death_wareki_raw   VARCHAR(20),
    kaimyo             VARCHAR(255),
    kaimyo_note        VARCHAR(255),
    secular_name       VARCHAR(100),
    secular_name_kana  VARCHAR(100),
    age_at_death       SMALLINT,
    sponsor_name       VARCHAR(50),
    relation_to_head   VARCHAR(20),
    notice_note        VARCHAR(255),
    note               TEXT,
    created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 故人は世帯不明（家番8888/削除/抹消/空）で発生しうる「孤立故人」の存在が仕様上
    -- 前提（データモデル設計.md 4.4）。世帯が削除されても故人記録自体は過去帳として
    -- 残すべきレコードのためCASCADEにせずSET NULL（孤立故人化）とする。
    CONSTRAINT fk_deceased_persons_household
        FOREIGN KEY (household_id) REFERENCES households (id)
        ON DELETE SET NULL,

    -- households と同様、ステージングは参照用でありその生死が本番データの削除を
    -- 引き起こすべきではないためSET NULL。
    CONSTRAINT fk_deceased_persons_import_record
        FOREIGN KEY (import_record_id) REFERENCES import_records (id)
        ON DELETE SET NULL
);

COMMENT ON TABLE deceased_persons IS '故人: 過去帳の故人1名を1行で表す。年忌は保持せず没年月日から導出する';
COMMENT ON COLUMN deceased_persons.household_id IS '世帯ID。8888/削除/空はNULL';
COMMENT ON COLUMN deceased_persons.import_record_id IS '取込レコードID。取込元CSV行への参照。施主原文等はraw_dataから取得';
COMMENT ON COLUMN deceased_persons.legacy_house_no IS '旧家番。過去帳「家番」。孤立故人（FK NULL）の画面表示に業務利用。非UNIQUE';
COMMENT ON COLUMN deceased_persons.legacy_district_1 IS '旧地区1。過去帳「地区１」。孤立故人の画面表示に業務利用。表示は世帯経由導出を優先';
COMMENT ON COLUMN deceased_persons.legacy_district_2 IS '旧地区2。過去帳「地区２」。同上';
COMMENT ON COLUMN deceased_persons.death_year IS '没年（西暦）。過去帳「西暦」';
COMMENT ON COLUMN deceased_persons.death_month IS '没月。漢数字→数値変換';
COMMENT ON COLUMN deceased_persons.death_day IS '没日。漢数字→数値変換';
COMMENT ON COLUMN deceased_persons.death_date IS '没年月日。年月日が完全な場合のみ導出格納';
COMMENT ON COLUMN deceased_persons.death_wareki_raw IS '和暦原表記。過去帳「邦暦」原文（元号省略あり）。和暦併記表示に業務利用';
COMMENT ON COLUMN deceased_persons.kaimyo IS '戒名・法名';
COMMENT ON COLUMN deceased_persons.kaimyo_note IS '戒名注意。外字・変体仮名等の注意（例「禅は口二つ」）';
COMMENT ON COLUMN deceased_persons.secular_name IS '俗名。生前の名前。結合カナは分離';
COMMENT ON COLUMN deceased_persons.secular_name_kana IS '俗名フリガナ。俗名に結合された半角カナを分離・正規化';
COMMENT ON COLUMN deceased_persons.age_at_death IS '享年。？等を除去した数値。原文注記はnoteへ';
COMMENT ON COLUMN deceased_persons.sponsor_name IS '施主名。施主欄から続柄を除いた氏名（姓名分割はしない）。原文はimport_records';
COMMENT ON COLUMN deceased_persons.relation_to_head IS '続柄。施主から見た故人続柄（妻/父/母 等）';
COMMENT ON COLUMN deceased_persons.notice_note IS '案内注意。法要案内上の注意（案内先・喪主等）';
COMMENT ON COLUMN deceased_persons.note IS '備考。葬儀メモ・死因等';

CREATE INDEX idx_deceased_persons_household_id ON deceased_persons (household_id);
CREATE INDEX idx_deceased_persons_legacy_house_no ON deceased_persons (legacy_house_no);
CREATE INDEX idx_deceased_persons_kaimyo ON deceased_persons (kaimyo);
CREATE INDEX idx_deceased_persons_secular_name ON deceased_persons (secular_name);
CREATE INDEX idx_deceased_persons_death_date ON deceased_persons (death_date);
CREATE INDEX idx_deceased_persons_death_ymd ON deceased_persons (death_year, death_month, death_day);

CREATE TRIGGER trg_deceased_persons_set_updated_at
    BEFORE UPDATE ON deceased_persons
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- =====================================================================
-- 5. 墓地区画（cemetery_plots）
-- =====================================================================
CREATE TABLE cemetery_plots (
    id           BIGSERIAL PRIMARY KEY,
    household_id BIGINT       NOT NULL,
    plot_code    VARCHAR(20),
    width_cm     INTEGER,
    fee          INTEGER,
    paid_on      DATE,
    paid_on_raw  VARCHAR(20),
    note         VARCHAR(255),
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 区画は世帯に完全従属（1世帯:多区画）。世帯削除時に区画のみ孤立して残す
    -- 業務上の意味が無いためCASCADE。
    CONSTRAINT fk_cemetery_plots_household
        FOREIGN KEY (household_id) REFERENCES households (id)
        ON DELETE CASCADE
);

COMMENT ON TABLE cemetery_plots IS '墓地区画: 世帯が保有する墓地区画（1世帯:多区画）。「なし」「空」は行を作らない';
COMMENT ON COLUMN cemetery_plots.household_id IS '世帯ID';
COMMENT ON COLUMN cemetery_plots.plot_code IS '区画コード。名簿「墓地区分」（例 東北２２Ｂ）';
COMMENT ON COLUMN cemetery_plots.width_cm IS '幅(cm)。名簿「墓地幅」';
COMMENT ON COLUMN cemetery_plots.fee IS '墓地代。名簿「墓地代」（円）';
COMMENT ON COLUMN cemetery_plots.paid_on IS '入金日。名簿「墓地入金」の和暦を変換（完全時のみ）';
COMMENT ON COLUMN cemetery_plots.paid_on_raw IS '入金原文。「42, 6,13」「H3, 5,」等。paid_onがNULLの区画のUIフォールバック表示に業務利用';
COMMENT ON COLUMN cemetery_plots.note IS '備考。本数等（例「２本」）';

CREATE INDEX idx_cemetery_plots_household_id ON cemetery_plots (household_id);
CREATE INDEX idx_cemetery_plots_plot_code ON cemetery_plots (plot_code);

CREATE TRIGGER trg_cemetery_plots_set_updated_at
    BEFORE UPDATE ON cemetery_plots
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- =====================================================================
-- 6. 納骨堂区画（columbarium_units）
-- =====================================================================
CREATE TABLE columbarium_units (
    id           BIGSERIAL PRIMARY KEY,
    household_id BIGINT       NOT NULL,
    unit_code    VARCHAR(30),
    unit_type    VARCHAR(10)
                 CHECK (unit_type IN ('区画', '一時', '合葬')),
    ihai_name    VARCHAR(100),
    note         VARCHAR(255),
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- cemetery_plots と同じ理由（世帯に完全従属）でCASCADE。
    CONSTRAINT fk_columbarium_units_household
        FOREIGN KEY (household_id) REFERENCES households (id)
        ON DELETE CASCADE
);

COMMENT ON TABLE columbarium_units IS '納骨堂区画: 世帯が利用する納骨堂の区画・一時預かり。「なし」「空」は行を作らない';
COMMENT ON COLUMN columbarium_units.household_id IS '世帯ID';
COMMENT ON COLUMN columbarium_units.unit_code IS '区画コード。名簿「納骨堂区分」（例 北い１３ー４）';
COMMENT ON COLUMN columbarium_units.unit_type IS '種別。区画/一時/合葬';
COMMENT ON COLUMN columbarium_units.ihai_name IS '位牌名。名簿「納骨堂位牌名」';
COMMENT ON COLUMN columbarium_units.note IS '備考。名簿「納骨堂備考」';

CREATE INDEX idx_columbarium_units_household_id ON columbarium_units (household_id);
CREATE INDEX idx_columbarium_units_unit_code ON columbarium_units (unit_code);

CREATE TRIGGER trg_columbarium_units_set_updated_at
    BEFORE UPDATE ON columbarium_units
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- =====================================================================
-- 7. ロール種別（role_types）
--    業務ロールはテンプレ展開時に寺院ごとに差し替えられる「データ」として
--    マスタ化する（CHECK 制約にしない）。コードが分岐に使うシステム enum
--    （party_type / status / permission）は従来どおり VARCHAR + CHECK。
-- =====================================================================
CREATE TABLE role_types (
    id          BIGSERIAL PRIMARY KEY,
    code        VARCHAR(30)  NOT NULL,
    label       VARCHAR(50)  NOT NULL,
    description VARCHAR(255),
    sort_order  SMALLINT     NOT NULL DEFAULT 0,
    is_active   BOOLEAN      NOT NULL DEFAULT true,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_role_types_code UNIQUE (code)
);

-- シード（テンプレ既定値。他寺院展開時はここを差し替え/追記する）
INSERT INTO role_types (code, label, description, sort_order) VALUES
    ('staff',       '寺務員', '寺院の職員・住職等。user_accounts 保有の主対象',              10),
    ('parishioner', '檀信徒', '檀家・信徒等。household_memberships 経由で世帯に所属',        20),
    ('vendor',      '出店者', 'マルシェ等イベントの出店者（将来利用）',                        30),
    ('tenant',      '利用者', '間貸し（スペース貸出）の借主（将来利用）',                      40);

COMMENT ON TABLE role_types IS 'ロール種別: 業務ロールをテンプレ展開時に寺院ごとに差し替え可能なマスタとして保持する（party_type/status/permission等のシステムenumはCHECK制約のまま）';
COMMENT ON COLUMN role_types.code IS 'ロールコード。party_roles からの参照キー（例 staff/parishioner/vendor/tenant）';
COMMENT ON COLUMN role_types.label IS 'ロール表示名（日本語）';
COMMENT ON COLUMN role_types.description IS 'ロールの説明';
COMMENT ON COLUMN role_types.sort_order IS '表示順';
COMMENT ON COLUMN role_types.is_active IS '有効フラグ。false は非表示（削除ではなく無効化）';

CREATE TRIGGER trg_role_types_set_updated_at
    BEFORE UPDATE ON role_types
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- =====================================================================
-- 8. パーティ（parties）
--    人/組織の統一台帳。origin='import' は household_members から機械生成
--    される再生成可能な派生データ（読み取り専用）。origin='manual' は手入力
--    （寺務員・出店者・借主等）で、洗い替え（migrate）で削除してはならない。
--    檀信徒の連絡先の正は従来どおり households。import 由来 parties の
--    連絡先カラムはすべて NULL で生成し、parties の連絡先は世帯に属さない
--    パーティ専用とする。
-- =====================================================================
CREATE TABLE parties (
    id                BIGSERIAL PRIMARY KEY,
    party_type        VARCHAR(20)  NOT NULL
                      CHECK (party_type IN ('person', 'organization')),
    display_name      VARCHAR(100) NOT NULL,
    display_name_kana VARCHAR(100),
    email             VARCHAR(254),
    phone             VARCHAR(20),
    postal_code       VARCHAR(8),
    address_1         VARCHAR(255),
    address_2         VARCHAR(255),
    origin            VARCHAR(20)  NOT NULL DEFAULT 'manual'
                      CHECK (origin IN ('manual', 'import')),
    status            VARCHAR(20)  NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active', 'inactive', 'deleted')),
    note              TEXT,
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE parties IS 'パーティ: 人・組織の統一台帳。origin=import は household_members から機械生成される再生成可能な派生データ（読み取り専用）、origin=manual は手入力（寺務員・出店者・借主等）で洗い替えの対象外';
COMMENT ON COLUMN parties.party_type IS '種別。person/organization';
COMMENT ON COLUMN parties.display_name IS '表示名';
COMMENT ON COLUMN parties.display_name_kana IS '表示名フリガナ';
COMMENT ON COLUMN parties.email IS 'メールアドレス';
COMMENT ON COLUMN parties.phone IS '電話番号';
COMMENT ON COLUMN parties.postal_code IS '郵便番号';
COMMENT ON COLUMN parties.address_1 IS '住所1';
COMMENT ON COLUMN parties.address_2 IS '住所2';
COMMENT ON COLUMN parties.origin IS '生成元。manual=手入力/import=household_membersからの機械生成（再生成可能・読み取り専用）';
COMMENT ON COLUMN parties.status IS '状態。active/inactive/deleted';
COMMENT ON COLUMN parties.note IS '備考';

CREATE INDEX idx_parties_display_name ON parties (display_name);
CREATE INDEX idx_parties_display_name_kana ON parties (display_name_kana);
CREATE INDEX idx_parties_origin ON parties (origin);

CREATE TRIGGER trg_parties_set_updated_at
    BEFORE UPDATE ON parties
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- =====================================================================
-- 9. パーティロール（party_roles）
--    パーティ⇔ロール種別の多対多+有効期間。valid_to IS NULL が「現在有効」。
--    履歴は valid_to を埋め status='ended' にして行を残す。
-- =====================================================================
CREATE TABLE party_roles (
    id           BIGSERIAL PRIMARY KEY,
    party_id     BIGINT       NOT NULL,
    role_type_id BIGINT       NOT NULL,
    valid_from   DATE,
    valid_to     DATE,
    status       VARCHAR(20)  NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active', 'ended')),
    note         VARCHAR(255),
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- パーティ削除時にロール付与だけ残る意味はないため CASCADE。
    CONSTRAINT fk_party_roles_party
        FOREIGN KEY (party_id) REFERENCES parties (id)
        ON DELETE CASCADE,
    -- 使用中ロール種別の削除はエラーで気付かせる（districts.parent_id と同じ思想）。
    CONSTRAINT fk_party_roles_role_type
        FOREIGN KEY (role_type_id) REFERENCES role_types (id)
        ON DELETE RESTRICT,
    CONSTRAINT chk_party_roles_period
        CHECK (valid_from IS NULL OR valid_to IS NULL OR valid_from <= valid_to)
);

COMMENT ON TABLE party_roles IS 'パーティロール: パーティとロール種別の多対多に有効期間を持たせた関連。valid_to IS NULL が現在有効、履歴は valid_to を埋め status=ended として行を残す';
COMMENT ON COLUMN party_roles.party_id IS 'パーティID';
COMMENT ON COLUMN party_roles.role_type_id IS 'ロール種別ID';
COMMENT ON COLUMN party_roles.valid_from IS '有効開始日';
COMMENT ON COLUMN party_roles.valid_to IS '有効終了日。NULL は現在有効を意味する';
COMMENT ON COLUMN party_roles.status IS '状態。active/ended';
COMMENT ON COLUMN party_roles.note IS '備考';

-- 同一パーティ×同一ロールの「現在有効」行は1件のみ（履歴行は対象外）。
CREATE UNIQUE INDEX uq_party_roles_active
    ON party_roles (party_id, role_type_id)
    WHERE valid_to IS NULL AND status = 'active';
CREATE INDEX idx_party_roles_party_id ON party_roles (party_id);
CREATE INDEX idx_party_roles_role_type_id ON party_roles (role_type_id);

CREATE TRIGGER trg_party_roles_set_updated_at
    BEFORE UPDATE ON party_roles
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- =====================================================================
-- 10. 世帯所属（household_memberships）
--     パーティ⇔世帯の接続。member_role / succession_order は
--     household_members と同値・同意味（将来統合時に変換不要とするため）。
--     household_member_id は並存期の生成元トレース・突合検証用。
-- =====================================================================
CREATE TABLE household_memberships (
    id                  BIGSERIAL PRIMARY KEY,
    party_id            BIGINT       NOT NULL,
    household_id        BIGINT       NOT NULL,
    member_role         VARCHAR(20)  NOT NULL
                        CHECK (member_role IN ('head', 'former_head', 'family')),
    succession_order    SMALLINT,
    household_member_id BIGINT,
    note                VARCHAR(255),
    created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- パーティ削除時に所属関係だけ残る意味はないため CASCADE。
    CONSTRAINT fk_household_memberships_party
        FOREIGN KEY (party_id) REFERENCES parties (id)
        ON DELETE CASCADE,
    -- 世帯消滅時に所属関係だけ残る意味はないため CASCADE（household_members と同思想）。
    CONSTRAINT fk_household_memberships_household
        FOREIGN KEY (household_id) REFERENCES households (id)
        ON DELETE CASCADE,
    -- 並存期の由来トレース。生成元 household_members 行が消えても所属自体は残す。
    CONSTRAINT fk_household_memberships_member
        FOREIGN KEY (household_member_id) REFERENCES household_members (id)
        ON DELETE SET NULL,
    CONSTRAINT uq_household_memberships_party_household
        UNIQUE (party_id, household_id)
);

COMMENT ON TABLE household_memberships IS '世帯所属: パーティと世帯の接続。member_role/succession_order は household_members と同値・同意味（将来統合時に変換不要とするための設計）';
COMMENT ON COLUMN household_memberships.party_id IS 'パーティID';
COMMENT ON COLUMN household_memberships.household_id IS '世帯ID';
COMMENT ON COLUMN household_memberships.member_role IS '役割。head/former_head/family';
COMMENT ON COLUMN household_memberships.succession_order IS '継承順。前戸主の順序';
COMMENT ON COLUMN household_memberships.household_member_id IS '生成元 household_members ID。並存期の由来トレース・突合検証用';
COMMENT ON COLUMN household_memberships.note IS '備考';

-- 現戸主1件/世帯。並存期は household_members 側の同制約と「併存」させる
-- （正は household_members 側。移設ではない）。
CREATE UNIQUE INDEX uq_household_memberships_head
    ON household_memberships (household_id)
    WHERE member_role = 'head';
CREATE INDEX idx_household_memberships_household_id ON household_memberships (household_id);
CREATE INDEX idx_household_memberships_party_id ON household_memberships (party_id);

CREATE TRIGGER trg_household_memberships_set_updated_at
    BEFORE UPDATE ON household_memberships
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- =====================================================================
-- 11. 認証アカウント（user_accounts）
--     1 party = 0..1 account。認証処理の実装は別スコープ（器のみ用意）。
--     permission はコードが認可分岐に使うシステム enum のため CHECK
--     （フロント SectionStaff.tsx の admin/staff/readonly と整合）。
--     業務ロール（role_types）と認可権限（permission）は直交概念として分離。
--     アカウントは origin='manual' のパーティにのみ付与する（運用ルール）。
-- =====================================================================
CREATE TABLE user_accounts (
    id                 BIGSERIAL PRIMARY KEY,
    party_id           BIGINT       NOT NULL,
    login_id           VARCHAR(50)  NOT NULL,
    password_hash      VARCHAR(255) NOT NULL,
    permission         VARCHAR(20)  NOT NULL DEFAULT 'staff'
                       CHECK (permission IN ('admin', 'staff', 'readonly')),
    status             VARCHAR(20)  NOT NULL DEFAULT 'active'
                       CHECK (status IN ('active', 'locked', 'disabled')),
    last_login_at      TIMESTAMP,
    failed_login_count SMALLINT     NOT NULL DEFAULT 0,
    created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- アカウントが親削除で意図せず消えるのは事故のため RESTRICT
    -- （parties は soft delete が原則）。
    CONSTRAINT fk_user_accounts_party
        FOREIGN KEY (party_id) REFERENCES parties (id)
        ON DELETE RESTRICT,
    CONSTRAINT uq_user_accounts_party UNIQUE (party_id),
    CONSTRAINT uq_user_accounts_login_id UNIQUE (login_id)
);

COMMENT ON TABLE user_accounts IS '認証アカウント: 1パーティにつき0〜1件のログインアカウント。認証処理自体の実装は別スコープで、本テーブルは器のみを用意する';
COMMENT ON COLUMN user_accounts.party_id IS 'パーティID';
COMMENT ON COLUMN user_accounts.login_id IS 'ログインID';
COMMENT ON COLUMN user_accounts.password_hash IS 'パスワードハッシュ';
COMMENT ON COLUMN user_accounts.permission IS '権限。admin/staff/readonly（フロント SectionStaff.tsx の権限区分と整合）';
COMMENT ON COLUMN user_accounts.status IS '状態。active/locked/disabled';
COMMENT ON COLUMN user_accounts.last_login_at IS '最終ログイン日時';
COMMENT ON COLUMN user_accounts.failed_login_count IS 'ログイン失敗回数';

CREATE TRIGGER trg_user_accounts_set_updated_at
    BEFORE UPDATE ON user_accounts
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
