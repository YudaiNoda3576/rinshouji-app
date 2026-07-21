/**
 * フェーズ②（名簿側）: import_records(名簿) → households / household_members /
 * cemetery_plots / columbarium_units。家番→household_id 解決マップを返す。
 */
import type { PoolClient } from 'pg';
import type { DistrictMaps } from './districts.js';
import { level2Key } from './districts.js';
import type { Report } from './report.js';
import { classifyDistrict1 } from './converters/district.js';
import { halfToFullKana } from './converters/kana.js';
import { trimAll } from './converters/text.js';
import { cleanMobile, cleanPhone, cleanPostal } from './converters/contact.js';
import { parseCemetery, parseColumbarium } from './converters/units.js';
import {
  deriveFamilyName,
  normalizeHannya,
  normalizeIhai,
  normalizeRelationType,
  normalizeSejiki,
  splitFamilyMember,
} from './converters/household-fields.js';

export interface MeiboRecord {
  readonly id: number;
  readonly rowNumber: number;
  readonly raw: Record<string, string>;
}

const SRC = '名簿';

export async function transformHouseholds(
  client: PoolClient,
  records: readonly MeiboRecord[],
  districts: DistrictMaps,
  report: Report,
): Promise<Map<string, number[]>> {
  const houseNoMap = new Map<string, number[]>();
  for (const rec of records) {
    const householdId = await insertHousehold(client, rec, districts, report);
    await insertMembers(client, householdId, rec, report);
    await insertCemetery(client, householdId, rec, report);
    await insertColumbarium(client, householdId, rec, report);
    registerHouseNo(houseNoMap, rec.raw['家番'] ?? '', householdId);
    report.counts.households += 1;
  }
  return houseNoMap;
}

function registerHouseNo(
  map: Map<string, number[]>,
  rawNo: string,
  householdId: number,
): void {
  const key = trimAll(rawNo);
  if (key === '') return;
  const list = map.get(key) ?? [];
  list.push(householdId);
  map.set(key, list);
}

async function insertHousehold(
  client: PoolClient,
  rec: MeiboRecord,
  districts: DistrictMaps,
  report: Report,
): Promise<number> {
  const raw = rec.raw;
  const { districtId, status } = resolveDistrict(rec, districts, report);
  const relation = normalizeRelationType(raw['関係'] ?? '');
  if (relation.corrected) report.provisionalHit('関係 壇徒→檀徒');
  if (relation.unknown) {
    report.warn('関係 想定外値', SRC, rec.rowNumber, raw['関係'] ?? '');
  }
  const family = familyName(rec, report);
  const ihai = normalizeIhai(raw['位牌区分'] ?? '');
  if (ihai.corrected) report.provisionalHit('位牌区分 ゆれ補正');
  if (normalizeSejiki(raw['施食'] ?? '') === '不要') {
    report.provisionalHit('施食「不要」格納');
  }
  const phone = cleanPhone(raw['電話'] ?? '');
  if (phone.invalid) report.warn('電話 無効値', SRC, rec.rowNumber, raw['電話'] ?? '');
  if (phone.kept) report.warn('電話 部分欠損（原文保持）', SRC, rec.rowNumber, raw['電話'] ?? '');
  const mobile = cleanMobile(raw['携帯電話'] ?? '');
  if (mobile.altered) {
    report.warn('携帯 整形（prefix/複数）', SRC, rec.rowNumber, raw['携帯電話'] ?? '');
  }
  const postal = cleanPostal(raw['〒'] ?? '');
  if (postal.invalid) report.warn('郵便番号 無効値', SRC, rec.rowNumber, raw['〒'] ?? '');

  const res = await client.query<{ id: string }>(
    `INSERT INTO households
       (district_id, import_record_id, family_name, status, relation_type,
        postal_code, address_1, address_2, phone, mobile_phone,
        hannya_service, sejiki_service, tanagyo_schedule, monthly_service_day,
        jizo_flag, ihai_status, note)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     RETURNING id`,
    [
      districtId,
      rec.id,
      family,
      status,
      relation.value,
      postal.value,
      nullIfBlank(raw['住所１']),
      nullIfBlank(raw['住所２']),
      phone.value,
      mobile.value,
      normalizeHannya(raw['般若'] ?? ''),
      normalizeSejiki(raw['施食'] ?? ''),
      nullIfBlank(raw['棚経']),
      nullIfBlank(raw['月経']),
      trimAll(raw['地蔵'] ?? '') !== '',
      ihai.value,
      nullIfBlank(raw['備考']),
    ],
  );
  return Number(res.rows[0]!.id);
}

function resolveDistrict(
  rec: MeiboRecord,
  districts: DistrictMaps,
  report: Report,
): { districtId: number | null; status: string } {
  const raw = rec.raw;
  const d1 = trimAll(raw['地区区分１'] ?? '');
  const d2 = trimAll(raw['地区区分２'] ?? '');
  const kind = classifyDistrict1(d1);
  const dantan = /離檀/.test(trimAll(raw['住所２'] ?? ''));

  if (kind === 'facility') {
    report.warn('施設系地区（区画/要ヒアリング）', SRC, rec.rowNumber, `${d1}/${d2}`);
  }
  let districtId: number | null = null;
  if (kind === 'real') {
    districtId =
      (d2 !== '' ? districts.level2.get(level2Key(d1, d2)) : undefined) ??
      districts.level1.get(d1) ??
      null;
  }
  // 離檀メモは地区「削除」より優先する。離檀=記録保持のまま檀家でなくなった状態
  // （status=inactive）であり、一覧から隠す論理削除（deleted）より情報量が多い。
  if (dantan) {
    report.provisionalHit('離檀→status=inactive（地区「削除」より優先）');
    return { districtId, status: 'inactive' };
  }
  if (kind === 'deleted') {
    report.provisionalHit('地区「削除」→status=deleted');
    return { districtId: null, status: 'deleted' };
  }
  return { districtId, status: 'active' };
}

function familyName(rec: MeiboRecord, report: Report): string | null {
  const raw = rec.raw;
  const formers = ['前戸主１', '前戸主２', '前戸主３', '前戸主４'].map(
    (k) => raw[k] ?? '',
  );
  const result = deriveFamilyName(raw['氏名'] ?? '', formers);
  if (result.fromFormer) report.provisionalHit('family_name 前戸主から補完');
  if (result.needsReview) {
    report.warn('family_name 導出不能', SRC, rec.rowNumber, raw['氏名'] ?? '(空)');
  }
  return result.value;
}

async function insertMembers(
  client: PoolClient,
  householdId: number,
  rec: MeiboRecord,
  report: Report,
): Promise<void> {
  const raw = rec.raw;
  const headName = trimAll(raw['氏名'] ?? '');
  if (headName !== '') {
    const kana = trimAll(raw['ﾌﾘｶﾞﾅ'] ?? '');
    await insertMember(client, householdId, 'head', headName,
      kana === '' ? null : halfToFullKana(kana), null, null);
    report.counts.membersHead += 1;
  }

  const formerCols = ['前戸主１', '前戸主２', '前戸主３', '前戸主４'];
  for (let i = 0; i < formerCols.length; i += 1) {
    const name = trimAll(raw[formerCols[i]!] ?? '');
    if (name === '') continue;
    await insertMember(client, householdId, 'former_head', name, null, i + 1, null);
    report.counts.membersFormer += 1;
  }

  const family = splitFamilyMember(raw['家族１'] ?? '');
  if (family !== null) {
    await insertMember(client, householdId, 'family', family.name, null, null, family.note);
    report.counts.membersFamily += 1;
  }
}

async function insertMember(
  client: PoolClient,
  householdId: number,
  role: string,
  name: string,
  kana: string | null,
  order: number | null,
  note: string | null,
): Promise<void> {
  await client.query(
    `INSERT INTO household_members
       (household_id, member_role, name, name_kana, succession_order, note)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [householdId, role, name.slice(0, 100), kana?.slice(0, 100) ?? null, order, note],
  );
}

async function insertCemetery(
  client: PoolClient,
  householdId: number,
  rec: MeiboRecord,
  report: Report,
): Promise<void> {
  const raw = rec.raw;
  const p = parseCemetery(
    raw['墓地区分'] ?? '', raw['墓地幅'] ?? '', raw['墓地代'] ?? '',
    raw['墓地入金'] ?? '', raw['墓地備考'] ?? '',
  );
  if (!p.create) return;
  if (p.needsReview) {
    report.warn('墓地区分 要目視', SRC, rec.rowNumber, raw['墓地区分'] ?? '');
  }
  if (p.paidOnRaw !== null && p.paidOn.date === null) {
    report.warn('墓地入金 日付変換不能（原文保持）', SRC, rec.rowNumber, p.paidOnRaw);
  }
  if (p.paidOn.ambiguous) {
    report.warn('墓地入金 元号曖昧（未変換）', SRC, rec.rowNumber, p.paidOnRaw ?? '');
  }
  if (p.paidOn.assumedShowa) report.provisionalHit('墓地入金 元号省略→昭和補完');
  await client.query(
    `INSERT INTO cemetery_plots
       (household_id, plot_code, width_cm, fee, paid_on, paid_on_raw, note)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [householdId, p.plotCode, p.widthCm, p.fee, p.paidOn.date, p.paidOnRaw, p.note],
  );
  report.counts.cemeteryPlots += 1;
}

async function insertColumbarium(
  client: PoolClient,
  householdId: number,
  rec: MeiboRecord,
  report: Report,
): Promise<void> {
  const raw = rec.raw;
  const u = parseColumbarium(raw['納骨堂区分'] ?? '');
  const ihaiName = nullIfBlank(raw['納骨堂位牌名']);
  const unitNote = mergeNote(u.note, nullIfBlank(raw['納骨堂備考']));
  if (!u.create) {
    if (ihaiName !== null || unitNote !== null) {
      report.warn('納骨堂 区分なしだが位牌名/備考あり', SRC, rec.rowNumber,
        `${raw['納骨堂区分'] ?? ''}|${raw['納骨堂位牌名'] ?? ''}|${raw['納骨堂備考'] ?? ''}`);
    }
    return;
  }
  if (u.ambiguous) {
    report.warn('納骨堂区分 種別不明（要目視）', SRC, rec.rowNumber, raw['納骨堂区分'] ?? '');
  }
  await client.query(
    `INSERT INTO columbarium_units
       (household_id, unit_code, unit_type, ihai_name, note)
     VALUES ($1,$2,$3,$4,$5)`,
    [householdId, u.unitCode, u.unitType, ihaiName, unitNote],
  );
  report.counts.columbariumUnits += 1;
}

function mergeNote(a: string | null, b: string | null): string | null {
  const parts = [a, b].filter((x): x is string => x !== null);
  if (parts.length === 0) return null;
  return parts.join(' / ').slice(0, 255);
}

function nullIfBlank(value: string | undefined): string | null {
  const v = trimAll(value ?? '');
  return v === '' ? null : v;
}
