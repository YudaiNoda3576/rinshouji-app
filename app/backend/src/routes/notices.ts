import { Hono } from "hono";
import { pool, toNum } from "../db.js";

// 年忌案内（notices）— 過去帳（deceased_persons）から年忌マイルストーンを機械導出する参照系ルート。
//
// 【重要】送付状態（送付済/出席確認 等）を永続化するテーブルは未設計のため、
// 本エンドポイントは全件 status='pending'（未送付）を返す。画面上の状態変更・一斉送付は
// フロント側のローカル state で暫定表現するのみで、リロードすると消える（未永続化）。
export const noticesRoute = new Hono();

// §4.3 年忌マイルストーン12種。n は没年からの経過年数（実施年 = death_year + n）。
// frontend の memorial/utils.ts の ANNIVERSARY_MILESTONES と同一テーブル（意図的に複製）。
const MILESTONES: { n: number; label: string }[] = [
  { n: 1, label: "一周忌" },
  { n: 2, label: "三回忌" },
  { n: 6, label: "七回忌" },
  { n: 12, label: "十三回忌" },
  { n: 16, label: "十七回忌" },
  { n: 22, label: "二十三回忌" },
  { n: 26, label: "二十七回忌" },
  { n: 32, label: "三十三回忌" },
  { n: 36, label: "三十七回忌" },
  { n: 42, label: "四十三回忌" },
  { n: 46, label: "四十七回忌" },
  { n: 49, label: "五十回忌" },
];

const DEFAULT_MONTHS_AHEAD = 12;
const MAX_MONTHS_AHEAD = 120; // 想定外に大きな期間指定を弾く上限（10年）。

const pad2 = (n: number): string => String(n).padStart(2, "0");
const fmtDate = (d: Date): string =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

// ---------------------------------------------------------------------
// GET /api/notices?monthsAhead=12
//   各故人 × 12 マイルストーンについて実施年 = death_year + n を求め、
//   基準日（サーバの今日）から monthsAhead ヶ月以内に実施日が入るものを抽出する。
//   - 月日が揃う場合: 実施日 = make_date(実施年, death_month, death_day)。
//       実施日 <= 期間末、かつ（実施日 >= 基準日 または 実施年 = 当年）を満たすものを含める。
//       （現行 UI が当年の過去分も表示するため、当年内の過去日は含める）
//   - 月日欠損の場合: 実施年が [当年, 期間末の年] に入るものを含め、targetDate は null。
// ---------------------------------------------------------------------
noticesRoute.get("/", async (c) => {
  const monthsAheadRaw = c.req.query("monthsAhead");
  let monthsAhead = DEFAULT_MONTHS_AHEAD;
  if (monthsAheadRaw !== undefined && monthsAheadRaw !== "") {
    if (!/^\d+$/.test(monthsAheadRaw)) {
      return c.json({ error: "monthsAhead が不正です" }, 400);
    }
    const parsed = Number.parseInt(monthsAheadRaw, 10);
    if (parsed <= 0 || parsed > MAX_MONTHS_AHEAD) {
      return c.json({ error: "monthsAhead は 1〜120 の範囲で指定してください" }, 400);
    }
    monthsAhead = parsed;
  }

  // 基準日・期間末をサーバの今日から算出する（frontend の期間フィルタと同じ setMonth 方式）。
  const today = new Date();
  const baseDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const windowEnd = new Date(today.getFullYear(), today.getMonth() + monthsAhead, today.getDate());

  // $1 = 基準日, $2 = 期間末（いずれも 'YYYY-MM-DD'。パラメタライズ）。
  // 実施日の make_date は、閏日（2/29）の没者が非閏年の実施年に当たる場合に例外を投げるため、
  // その場合のみ 2/28 に丸めて機械算出する（法要は当年の 2/28 実施と見なす暫定運用）。
  const sql = `
    WITH milestones(n, label) AS (
      VALUES
        (1, '一周忌'), (2, '三回忌'), (6, '七回忌'), (12, '十三回忌'),
        (16, '十七回忌'), (22, '二十三回忌'), (26, '二十七回忌'), (32, '三十三回忌'),
        (36, '三十七回忌'), (42, '四十三回忌'), (46, '四十七回忌'), (49, '五十回忌')
    ),
    derived AS (
      SELECT
        dp.id AS deceased_id,
        dp.kaimyo,
        dp.secular_name,
        dp.household_id,
        dp.death_year,
        dp.death_month,
        dp.death_day,
        dp.death_date,
        h.family_name,
        hm.name AS family_head,
        h.phone,
        m.n,
        m.label AS kaiki,
        (dp.death_year + m.n) AS target_year,
        CASE
          WHEN dp.death_month IS NOT NULL AND dp.death_day IS NOT NULL THEN
            make_date(
              dp.death_year + m.n,
              dp.death_month,
              CASE
                WHEN dp.death_month = 2 AND dp.death_day = 29
                     AND NOT (
                       (dp.death_year + m.n) % 4 = 0
                       AND ((dp.death_year + m.n) % 100 <> 0 OR (dp.death_year + m.n) % 400 = 0)
                     )
                THEN 28
                ELSE dp.death_day
              END
            )
          ELSE NULL
        END AS target_date
      FROM deceased_persons dp
      CROSS JOIN milestones m
      LEFT JOIN households h ON h.id = dp.household_id
      LEFT JOIN household_members hm ON hm.household_id = h.id AND hm.member_role = 'head'
      WHERE dp.death_year IS NOT NULL
    )
    SELECT
      deceased_id, kaimyo, secular_name, household_id,
      death_year, death_month, death_day, death_date,
      family_name, family_head, phone, n, kaiki, target_year, target_date
    FROM derived
    WHERE
      CASE
        WHEN death_month IS NOT NULL AND death_day IS NOT NULL THEN
          target_date <= $2::date
          AND (target_date >= $1::date OR target_year = EXTRACT(YEAR FROM $1::date)::int)
        ELSE
          target_year >= EXTRACT(YEAR FROM $1::date)::int
          AND target_year <= EXTRACT(YEAR FROM $2::date)::int
      END
    ORDER BY target_date ASC NULLS LAST, target_year ASC, deceased_id ASC
  `;

  const { rows } = await pool.query(sql, [fmtDate(baseDate), fmtDate(windowEnd)]);

  return c.json(
    rows.map((row) => ({
      id: `${toNum(row.deceased_id)}-${row.n}`,
      deceasedId: toNum(row.deceased_id),
      kaimyo: row.kaimyo,
      secularName: row.secular_name,
      familyName: row.family_name,
      householdId: toNum(row.household_id),
      familyHead: row.family_head,
      phone: row.phone,
      deathDate: row.death_date,
      deathYear: row.death_year,
      deathMonth: row.death_month,
      deathDay: row.death_day,
      kaiki: row.kaiki,
      targetDate: row.target_date,
      targetYear: row.target_year,
      status: "pending" as const,
    })),
  );
});
