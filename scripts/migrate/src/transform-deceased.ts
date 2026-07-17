/**
 * フェーズ②（過去帳側）: import_records(過去帳) → deceased_persons。
 * 家番→household_id を名簿側マップで解決する。
 */
import type { PoolClient } from 'pg';
import type { Report } from './report.js';
import { trimAll } from './converters/text.js';
import { parseMonthOrDay } from './converters/kanji-num.js';
import { buildDate } from './converters/wareki.js';
import { splitSecularName } from './converters/kana.js';
import { splitSponsor } from './converters/sponsor.js';
import {
  parseAge,
  parseHouseNo,
  routeBiko,
} from './converters/deceased-fields.js';

export interface KakochoRecord {
  readonly id: number;
  readonly rowNumber: number;
  readonly raw: Record<string, string>;
}

const SRC = '過去帳';

interface DeceasedRow {
  householdId: number | null;
  legacyHouseNo: string | null;
  legacyDistrict1: string | null;
  legacyDistrict2: string | null;
  deathYear: number | null;
  deathMonth: number | null;
  deathDay: number | null;
  deathDate: string | null;
  waWkiRaw: string | null;
  kaimyo: string | null;
  kaimyoNote: string | null;
  secularName: string | null;
  secularNameKana: string | null;
  age: number | null;
  sponsorName: string | null;
  relation: string | null;
  noticeNote: string | null;
  note: string | null;
}

export async function transformDeceased(
  client: PoolClient,
  records: readonly KakochoRecord[],
  houseNoMap: ReadonlyMap<string, number[]>,
  report: Report,
): Promise<void> {
  for (const rec of records) {
    const row = buildDeceased(rec, houseNoMap, report);
    await insertDeceased(client, rec.id, row);
    report.counts.deceased += 1;
  }
}

function buildDeceased(
  rec: KakochoRecord,
  houseNoMap: ReadonlyMap<string, number[]>,
  report: Report,
): DeceasedRow {
  const raw = rec.raw;
  const householdId = resolveHousehold(rec, houseNoMap, report);
  const { year, month, day, date } = resolveDeath(rec, report);
  const secular = splitSecularName(raw['俗名'] ?? '');
  const sponsor = resolveSponsor(rec, report);
  const age = parseAge(raw['享年'] ?? '');
  const notes = resolveNotes(rec, age.noteText, report);

  return {
    householdId: householdId.id,
    legacyHouseNo: householdId.legacy,
    legacyDistrict1: nullIfBlank(raw['地区１']),
    legacyDistrict2: nullIfBlank(raw['地区２']),
    deathYear: year,
    deathMonth: month,
    deathDay: day,
    deathDate: date,
    waWkiRaw: nullIfBlank(raw['邦暦'])?.slice(0, 20) ?? null,
    kaimyo: nullIfBlank(raw['戒名'])?.slice(0, 255) ?? null,
    kaimyoNote: notes.kaimyoNote,
    secularName: secular.name?.slice(0, 100) ?? null,
    secularNameKana: secular.kana?.slice(0, 100) ?? null,
    age: age.value,
    sponsorName: sponsor.name?.slice(0, 50) ?? null,
    relation: sponsor.relation?.slice(0, 20) ?? null,
    noticeNote: notes.noticeNote,
    note: notes.note,
  };
}

function resolveHousehold(
  rec: KakochoRecord,
  houseNoMap: ReadonlyMap<string, number[]>,
  report: Report,
): { id: number | null; legacy: string | null } {
  const parsed = parseHouseNo(rec.raw['家番'] ?? '');
  if (parsed.is8888) {
    report.provisionalHit('家番 8888 → household_id NULL');
    return { id: null, legacy: parsed.legacy };
  }
  if (parsed.matchKey === null) {
    return { id: null, legacy: parsed.legacy };
  }
  const matches = houseNoMap.get(parsed.matchKey);
  if (matches === undefined || matches.length === 0) {
    report.warn('FK 不突合（名簿に該当家番なし）', SRC, rec.rowNumber, parsed.matchKey);
    return { id: null, legacy: parsed.legacy };
  }
  if (matches.length > 1) {
    report.warn('FK 曖昧（重複家番・要目視）', SRC, rec.rowNumber,
      `${parsed.matchKey}: ${matches.length}件`);
    return { id: null, legacy: parsed.legacy };
  }
  return { id: matches[0]!, legacy: parsed.legacy };
}

function resolveDeath(
  rec: KakochoRecord,
  report: Report,
): { year: number | null; month: number | null; day: number | null; date: string | null } {
  const raw = rec.raw;
  const year = parseYear(raw['西暦'] ?? '');
  const m = parseMonthOrDay(raw['月'] ?? '');
  const d = parseMonthOrDay(raw['日'] ?? '');
  if (m.multiple) {
    report.warn('月 複数値（先頭採用・要目視）', SRC, rec.rowNumber, raw['月'] ?? '');
  }
  if (d.multiple) {
    report.warn('日 複数値（先頭採用・要目視）', SRC, rec.rowNumber, raw['日'] ?? '');
  }
  const month = validRange(m.value, 1, 12);
  const day = validRange(d.value, 1, 31);
  if (m.value !== null && month === null) {
    report.warn('月 範囲外（NULL化）', SRC, rec.rowNumber, raw['月'] ?? '');
  }
  if (d.unparsable && trimAll(raw['日'] ?? '') !== '') {
    report.warn('日 変換不能（干支等・NULL化）', SRC, rec.rowNumber, raw['日'] ?? '');
  }
  const date =
    year !== null && month !== null && day !== null
      ? buildDate(year, month, day)
      : null;
  return { year, month, day, date };
}

function resolveSponsor(
  rec: KakochoRecord,
  report: Report,
): { name: string | null; relation: string | null } {
  const sponsor = splitSponsor(rec.raw['施主'] ?? '');
  if (sponsor.status === 'unsplittable') {
    report.warn('施主 分割不能（全文格納）', SRC, rec.rowNumber, rec.raw['施主'] ?? '');
  } else if (sponsor.status === 'uncertain') {
    report.warn('施主 続柄要確認', SRC, rec.rowNumber, rec.raw['施主'] ?? '');
  }
  return { name: sponsor.name, relation: sponsor.relation };
}

interface ResolvedNotes {
  readonly note: string | null;
  readonly noticeNote: string | null;
  readonly kaimyoNote: string | null;
}

function resolveNotes(
  rec: KakochoRecord,
  ageNote: string | null,
  report: Report,
): ResolvedNotes {
  const raw = rec.raw;
  const routed = routeBiko(raw['備考'] ?? '');
  if (routed.multiCategory) {
    report.warn('備考 複数カテゴリ（note集約・要目視）', SRC, rec.rowNumber, raw['備考'] ?? '');
  }
  const noteParts: string[] = [];
  if (routed.note !== null) noteParts.push(routed.note);
  if (ageNote !== null) noteParts.push(`享年原文: ${ageNote}`);

  let kaimyoNote = routed.kaimyoNote;
  // 末尾無名列（唯一値「禅は口二つ」）は kaimyo_note へ移設。
  const tail = nullIfBlank(raw['無名列']);
  if (tail !== null) {
    kaimyoNote = kaimyoNote === null ? tail : `${kaimyoNote} / ${tail}`;
    report.provisionalHit('末尾無名列→kaimyo_note 移設');
  }
  applyNenkiCorrection(rec, noteParts, report);

  return {
    note: noteParts.length === 0 ? null : noteParts.join(' / '),
    noticeNote: routed.noticeNote?.slice(0, 255) ?? null,
    kaimyoNote: kaimyoNote?.slice(0, 255) ?? null,
  };
}

/** 年忌列の混入値（「安藤信実」「…27回忌済」）を備考へ補正。 */
function applyNenkiCorrection(
  rec: KakochoRecord,
  noteParts: string[],
  report: Report,
): void {
  const nenki = trimAll(rec.raw['年忌'] ?? '');
  if (nenki === '' || /(回忌|周忌)$/.test(nenki)) return;
  noteParts.push(`年忌欄混入: ${nenki}`);
  report.warn('年忌列 混入値（備考へ補正）', SRC, rec.rowNumber, nenki);
}

async function insertDeceased(
  client: PoolClient,
  importRecordId: number,
  r: DeceasedRow,
): Promise<void> {
  await client.query(
    `INSERT INTO deceased_persons
       (household_id, import_record_id, legacy_house_no, legacy_district_1,
        legacy_district_2, death_year, death_month, death_day, death_date,
        death_wareki_raw, kaimyo, kaimyo_note, secular_name, secular_name_kana,
        age_at_death, sponsor_name, relation_to_head, notice_note, note)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
    [
      r.householdId, importRecordId, r.legacyHouseNo, r.legacyDistrict1,
      r.legacyDistrict2, r.deathYear, r.deathMonth, r.deathDay, r.deathDate,
      r.waWkiRaw, r.kaimyo, r.kaimyoNote, r.secularName, r.secularNameKana,
      r.age, r.sponsorName, r.relation, r.noticeNote, r.note,
    ],
  );
}

function parseYear(raw: string): number | null {
  const v = trimAll(raw);
  if (!/^\d{3,4}$/.test(v)) return null;
  return Number.parseInt(v, 10);
}

function validRange(value: number | null, min: number, max: number): number | null {
  if (value === null) return null;
  return value >= min && value <= max ? value : null;
}

function nullIfBlank(value: string | undefined): string | null {
  const v = trimAll(value ?? '');
  return v === '' ? null : v;
}
