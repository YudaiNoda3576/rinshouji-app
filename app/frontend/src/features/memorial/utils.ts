// 過去帳（memorial register）の純関数ユーティリティ。
// 画面項目定義書 §4.2（不完全日付の表示規則）・§4.3（次の年忌の導出式）に準拠する。

import type {
  AnniversaryMilestone,
  DeathDateDisplay,
  DeceasedDetail,
  DeceasedForm,
  DeceasedListItem,
  DeceasedPayload,
  NextAnniversary,
  ServiceHistoryItem,
} from './types';

const pad2 = (n: number): string => String(n).padStart(2, '0');

// ============================================================
// §4.3 年忌マイルストーン（実データの年忌グループに合わせた12種）
// ラベルは「回忌名」、n は没年からの経過年数（実施年 = death_year + n）。
// ============================================================
export const ANNIVERSARY_MILESTONES: AnniversaryMilestone[] = [
  { label: '一周忌', n: 1 },
  { label: '三回忌', n: 2 },
  { label: '七回忌', n: 6 },
  { label: '十三回忌', n: 12 },
  { label: '十七回忌', n: 16 },
  { label: '二十三回忌', n: 22 },
  { label: '二十七回忌', n: 26 },
  { label: '三十三回忌', n: 32 },
  { label: '三十七回忌', n: 36 },
  { label: '四十三回忌', n: 42 },
  { label: '四十七回忌', n: 46 },
  { label: '五十回忌', n: 49 },
];

// ============================================================
// 和暦（元号）変換
// ============================================================
const ERA_TABLE: { name: string; start: number }[] = [
  { name: '令和', start: 2019 },
  { name: '平成', start: 1989 },
  { name: '昭和', start: 1926 },
  { name: '大正', start: 1912 },
  { name: '明治', start: 1868 },
];

function eraForYear(year: number): { name: string; n: number } {
  const era = ERA_TABLE.find((e) => year >= e.start) ?? ERA_TABLE[ERA_TABLE.length - 1];
  return { name: era.name, n: year - era.start + 1 };
}

// 西暦(+任意で月日)から和暦文字列を機械算出する（例: 1998, 5, 16 -> "平成10年5月16日"）。
function formatEra(year: number, month?: number | null, day?: number | null): string {
  const { name, n } = eraForYear(year);
  const nLabel = n === 1 ? '元' : String(n);
  let s = `${name}${nLabel}年`;
  if (month != null) s += `${month}月`;
  if (month != null && day != null) s += `${day}日`;
  return s;
}

const GENGOU_CHARS = ['明治', '大正', '昭和', '平成', '令和'];

// `deathWarekiRaw` が元号を含まない原文（例「十年」）かどうかを判定する。
function hasGengou(raw: string): boolean {
  return GENGOU_CHARS.some((g) => raw.includes(g));
}

type DeathDateSource = Pick<DeceasedListItem, 'deathYear' | 'deathMonth' | 'deathDay' | 'deathWarekiRaw'>;

// ============================================================
// §4.2 不完全日付の表示規則
// 完全: 1998年5月16日（平成10年5月16日）
// 年月のみ: 1998年5月（日不詳）（平成10年5月）
// 年のみ: 1998年（月日不詳）※和暦は付与しない（設問の表記例に準拠）
// 全欠: 不詳
// 和暦欠落: 括弧部を省略し西暦のみ表示
// 和暦が元号省略表記: 西暦から機械算出した元号を優先表示し、原文は warekiOriginalNote として返す
//   （一覧では算出済み表示のみとし、原文注記は詳細画面でのみ利用する）
// ============================================================
export function fmtDeathDate(person: DeathDateSource): DeathDateDisplay {
  const { deathYear, deathMonth, deathDay, deathWarekiRaw } = person;

  if (deathYear == null) {
    return { text: '不詳' };
  }

  if (deathMonth == null) {
    // 年のみ: 和暦欄自体を出さない仕様（画面項目定義書 §4.2 表の表示例に準拠）。
    return { text: `${deathYear}年（月日不詳）` };
  }

  const raw = deathWarekiRaw?.trim();

  if (deathDay == null) {
    // 年月のみ（日不詳）
    const base = `${deathYear}年${deathMonth}月（日不詳）`;
    if (!raw) return { text: base };
    if (hasGengou(raw)) return { text: `${base}（${raw}）` };
    const computed = formatEra(deathYear, deathMonth, null);
    return { text: `${base}（${computed}）`, warekiOriginalNote: `※原表記: ${raw}` };
  }

  // 完全
  const base = `${deathYear}年${deathMonth}月${deathDay}日`;
  if (!raw) return { text: base };
  if (hasGengou(raw)) return { text: `${base}（${raw}）` };
  const computed = formatEra(deathYear, deathMonth, deathDay);
  return { text: `${base}（${computed}）`, warekiOriginalNote: `※原表記: ${raw}` };
}

type AnniversarySource = Pick<DeceasedListItem, 'deathYear' | 'deathMonth' | 'deathDay'>;

// ============================================================
// §4.3 「次の年忌」の導出
// - 月日が完全な場合: 基準日以降で最も近いマイルストーン。すべて経過済みなら
//   最終マイルストーン（五十回忌）に「済」。
// - 月日が欠損している場合: 実施年（death_year + n）が基準年以降で最も近い
//   マイルストーンを「実施年度のみ・月日未定」として返す。すべて経過済みなら
//   最終マイルストーンを「済」。
// ============================================================
export function nextAnniversary(person: AnniversarySource, today: Date = new Date()): NextAnniversary | null {
  const { deathYear, deathMonth, deathDay } = person;
  if (deathYear == null) return null;

  const hasFullMonthDay = deathMonth != null && deathDay != null;
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  if (!hasFullMonthDay) {
    const currentYear = today.getFullYear();
    const withYears = ANNIVERSARY_MILESTONES.map((m) => ({ ...m, year: deathYear + m.n }));
    const upcoming = withYears.find((m) => m.year >= currentYear);
    const chosen = upcoming ?? withYears[withYears.length - 1];
    return {
      label: chosen.label,
      n: chosen.n,
      year: chosen.year,
      date: null,
      daysUntil: null,
      status: upcoming ? 'monthDayUnknown' : 'done',
    };
  }

  const withDates = ANNIVERSARY_MILESTONES.map((m) => {
    const year = deathYear + m.n;
    const d = new Date(year, (deathMonth as number) - 1, deathDay as number);
    const daysUntil = Math.round((d.getTime() - todayMidnight) / 86_400_000);
    const date = `${year}-${pad2(deathMonth as number)}-${pad2(deathDay as number)}`;
    return { ...m, year, date, daysUntil };
  });

  const upcoming = withDates.find((m) => m.daysUntil >= 0);
  if (upcoming) {
    return { ...upcoming, status: 'upcoming' };
  }
  const last = withDates[withDates.length - 1];
  return { ...last, status: 'done' };
}

// 一覧の既定ソート「年忌が近い順」用のスコア（昇順ソートで使用）。
// 月日確定の直近予定を最優先、月日未定の予定はその次（年の近さで比較）、
// 済・データなしは末尾に回す簡略化されたランキング。
export function anniversarySortKey(next: NextAnniversary | null, today: Date = new Date()): number {
  if (!next) return Number.POSITIVE_INFINITY;
  if (next.status === 'upcoming' && next.daysUntil != null) return next.daysUntil;
  if (next.status === 'monthDayUnknown') return 100_000 + (next.year - today.getFullYear());
  return 10_000_000 + next.n; // done
}

// ============================================================
// 法要記録タイムライン（モック）
// 正式な法要実施記録テーブルは未整備のため、没年月日から12種の年忌を機械算出して
// 表示する暫定実装（画面項目定義書 §6.1「法要記録タイムライン」参照）。
// ============================================================
export function getServiceHistory(
  person: AnniversarySource,
  today: Date = new Date(),
): ServiceHistoryItem[] {
  const { deathYear, deathMonth, deathDay } = person;
  if (deathYear == null) return [];

  const hasFullDate = deathMonth != null && deathDay != null;
  const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  const items: ServiceHistoryItem[] = [];

  if (hasFullDate) {
    const eraLabel = formatEra(deathYear, deathMonth, deathDay);
    items.push({ label: '葬儀', dateLabel: eraLabel, kind: 'funeral', done: true });
  } else {
    items.push({ label: '葬儀', dateLabel: `${deathYear}年（月日不詳）`, kind: 'funeral', done: true });
  }

  for (const m of ANNIVERSARY_MILESTONES) {
    const year = deathYear + m.n;
    if (hasFullDate) {
      const done = new Date(year, (deathMonth as number) - 1, deathDay as number).getTime() < todayTime;
      items.push({ label: m.label, dateLabel: formatEra(year, deathMonth, deathDay), kind: 'memorial', done });
    } else {
      const done = year < today.getFullYear();
      items.push({ label: m.label, dateLabel: `${year}年度（月日未定）`, kind: 'memorial', done });
    }
  }
  return items;
}

// ============================================================
// フォーム ⇔ API 変換
// ============================================================
export function toDeceasedForm(detail: DeceasedDetail): DeceasedForm {
  return {
    householdId: detail.householdId,
    householdFamilyName: detail.familyName,
    kaimyo: detail.kaimyo,
    kaimyoNote: detail.kaimyoNote ?? '',
    secularName: detail.secularName,
    secularNameKana: detail.secularNameKana ?? '',
    deathYear: detail.deathYear != null ? String(detail.deathYear) : '',
    deathMonth: detail.deathMonth != null ? String(detail.deathMonth) : '',
    deathDay: detail.deathDay != null ? String(detail.deathDay) : '',
    deathWarekiRaw: detail.deathWarekiRaw ?? '',
    ageAtDeath: detail.ageAtDeath != null ? String(detail.ageAtDeath) : '',
    sponsorName: detail.sponsorName ?? '',
    relationToHead: detail.relationToHead ?? '',
    noticeNote: detail.noticeNote ?? '',
    note: detail.note ?? '',
    legacyDistrict1: detail.legacyDistrict1 ?? '',
    legacyDistrict2: detail.legacyDistrict2 ?? '',
  };
}

const toIntOrNull = (s: string): number | null => {
  const t = s.trim();
  if (t === '') return null;
  const n = Number.parseInt(t, 10);
  return Number.isNaN(n) ? null : n;
};

const toTextOrNull = (s: string): string | null => {
  const t = s.trim();
  return t === '' ? null : t;
};

export function toDeceasedPayload(form: DeceasedForm): DeceasedPayload {
  const hasHousehold = form.householdId != null;
  return {
    householdId: hasHousehold ? form.householdId : null,
    kaimyo: form.kaimyo.trim(),
    kaimyoNote: toTextOrNull(form.kaimyoNote),
    secularName: form.secularName.trim(),
    secularNameKana: toTextOrNull(form.secularNameKana),
    deathYear: toIntOrNull(form.deathYear),
    deathMonth: toIntOrNull(form.deathMonth),
    deathDay: toIntOrNull(form.deathDay),
    deathWarekiRaw: toTextOrNull(form.deathWarekiRaw),
    ageAtDeath: toIntOrNull(form.ageAtDeath),
    sponsorName: toTextOrNull(form.sponsorName),
    relationToHead: toTextOrNull(form.relationToHead),
    noticeNote: toTextOrNull(form.noticeNote),
    note: toTextOrNull(form.note),
    // 関連檀家ありの場合は旧地区情報を送らない（世帯経由の districts 表示を優先する運用のため）。
    legacyDistrict1: hasHousehold ? null : toTextOrNull(form.legacyDistrict1),
    legacyDistrict2: hasHousehold ? null : toTextOrNull(form.legacyDistrict2),
  };
}
