/**
 * 移行スクリプトの定数・既定値。個人データはここに一切ハードコードしない。
 */

export const DEFAULT_DATABASE_URL =
  'postgres://rinshouji:rinshouji@localhost:5432/rinshouji';

export const SOURCE_MEIBO = '檀信徒名簿' as const;
export const SOURCE_KAKOCHO = '過去帳' as const;

/** 無名（ヘッダ空）列に割り当てるキー名。2 個目以降は 無名列2, 無名列3…。 */
export const UNNAMED_KEY_BASE = '無名列';

/** 本番テーブル（フェーズ②で洗い替える順序＝子→親ではなく TRUNCATE 一括）。 */
export const PRODUCTION_TABLES = [
  'columbarium_units',
  'cemetery_plots',
  'deceased_persons',
  'household_members',
  'households',
  'districts',
] as const;

export const REPORT_DIR = 'report';
