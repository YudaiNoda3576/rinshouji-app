/**
 * 地区区分1 の分類。地区マスタに登録すべき実地区か、削除／施設系の非地区値かを判定。
 */
import { trimAll } from './text.js';

/** 「削除」→ households.status='deleted'。 */
const DELETED = new Set(['削除']);

/** 施設系（区画・要ヒアリング）。district_id は NULL とし警告。 */
const FACILITY = new Set([
  '墓地',
  '納骨堂',
  '永代',
  '合葬墓',
  '墓地空き',
  '納骨堂空き',
  '墓地堂空き',
  '墓地、納骨堂',
]);

/** 地区不明。マスタ登録せず district_id=NULL（警告なし）。 */
const UNKNOWN = new Set(['不明']);

export type District1Kind = 'real' | 'deleted' | 'facility' | 'none';

/** 地区区分1 の値種別を返す。 */
export function classifyDistrict1(raw: string): District1Kind {
  const value = trimAll(raw);
  if (value === '') return 'none';
  if (DELETED.has(value)) return 'deleted';
  if (FACILITY.has(value)) return 'facility';
  if (UNKNOWN.has(value)) return 'none';
  return 'real';
}
