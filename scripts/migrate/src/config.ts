/**
 * 移行スクリプトの定数・既定値。個人データはここに一切ハードコードしない。
 */

export const DEFAULT_DATABASE_URL =
  'postgres://rinshouji:rinshouji@localhost:5432/rinshouji';

export const SOURCE_MEIBO = '檀信徒名簿' as const;
export const SOURCE_KAKOCHO = '過去帳' as const;

/** 無名（ヘッダ空）列に割り当てるキー名。2 個目以降は 無名列2, 無名列3…。 */
export const UNNAMED_KEY_BASE = '無名列';

/**
 * 本番テーブル（フェーズ②で洗い替える順序＝子→親ではなく TRUNCATE 一括）。
 * household_memberships はフェーズ③（build-parties.ts）が household_members
 * から再生成する派生データのため、ここでの TRUNCATE 対象に含める（先頭＝最も子側）。
 * 一方、parties / party_roles / user_accounts / role_types は絶対に追加しない。
 * parties は寺務員アカウント等の手入力データ（origin='manual'）を含み得るため
 * 一括 TRUNCATE してよい対象ではなく、洗い替えは build-parties.ts が
 * origin='import' 限定の DELETE で個別に行う。
 */
export const PRODUCTION_TABLES = [
  'household_memberships',
  'columbarium_units',
  'cemetery_plots',
  'deceased_persons',
  'household_members',
  'households',
  'districts',
] as const;

export const REPORT_DIR = 'report';
