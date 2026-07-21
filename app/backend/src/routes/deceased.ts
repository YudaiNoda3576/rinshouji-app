import { Hono } from "hono";
import { pool, toNum } from "../db.js";
import { buildDeathDate, parseId } from "../lib/validation.js";

export const deceasedRoute = new Hono();

const LIST_SORTS = ["recent", "name"] as const;
type ListSort = (typeof LIST_SORTS)[number];

function mapListRow(row: Record<string, unknown>) {
  return {
    id: toNum(row.id as string),
    householdId: toNum(row.household_id as string | null),
    familyName: row.family_name,
    kaimyo: row.kaimyo,
    secularName: row.secular_name,
    relationToHead: row.relation_to_head,
    deathYear: row.death_year,
    deathMonth: row.death_month,
    deathDay: row.death_day,
    deathDate: row.death_date,
    deathWarekiRaw: row.death_wareki_raw,
    ageAtDeath: row.age_at_death,
    legacyDistrict1: row.legacy_district_1,
    legacyDistrict2: row.legacy_district_2,
  };
}

// ---------------------------------------------------------------------
// GET /api/deceased: 一覧
// ---------------------------------------------------------------------
deceasedRoute.get("/", async (c) => {
  const q = c.req.query("q");
  const householdIdRaw = c.req.query("householdId");
  const sortRaw = c.req.query("sort");
  const sort: ListSort = (LIST_SORTS as readonly string[]).includes(sortRaw ?? "")
    ? (sortRaw as ListSort)
    : "recent";

  let householdId: number | null = null;
  if (householdIdRaw !== undefined) {
    householdId = parseId(householdIdRaw);
    if (householdId === null) {
      return c.json({ error: "householdId が不正です" }, 400);
    }
  }

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (q !== undefined && q !== "") {
    params.push(`%${q}%`);
    const idx = params.length;
    conditions.push(`(dp.kaimyo ILIKE $${idx} OR dp.secular_name ILIKE $${idx} OR h.family_name ILIKE $${idx})`);
  }

  if (householdId !== null) {
    params.push(householdId);
    conditions.push(`dp.household_id = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderBy =
    sort === "name"
      ? "dp.kaimyo"
      : "dp.death_year DESC NULLS LAST, dp.death_month DESC NULLS LAST, dp.death_day DESC NULLS LAST";

  const sql = `
    SELECT
      dp.id, dp.household_id, h.family_name, dp.kaimyo, dp.secular_name,
      dp.relation_to_head, dp.death_year, dp.death_month, dp.death_day, dp.death_date,
      dp.death_wareki_raw, dp.age_at_death, dp.legacy_district_1, dp.legacy_district_2
    FROM deceased_persons dp
    LEFT JOIN households h ON h.id = dp.household_id
    ${whereClause}
    ORDER BY ${orderBy}
  `;

  const { rows } = await pool.query(sql, params);
  return c.json(rows.map(mapListRow));
});

// ---------------------------------------------------------------------
// GET /api/deceased/:id: 詳細
// ---------------------------------------------------------------------
deceasedRoute.get("/:id", async (c) => {
  const id = parseId(c.req.param("id"));
  if (id === null) {
    return c.json({ error: "id が不正です" }, 400);
  }

  const { rows } = await pool.query(
    `
    SELECT
      dp.id, dp.household_id, h.family_name, dp.kaimyo, dp.kaimyo_note,
      dp.secular_name, dp.secular_name_kana, dp.relation_to_head,
      dp.death_year, dp.death_month, dp.death_day, dp.death_date, dp.death_wareki_raw,
      dp.age_at_death, dp.sponsor_name, dp.notice_note, dp.note,
      dp.legacy_house_no, dp.legacy_district_1, dp.legacy_district_2
    FROM deceased_persons dp
    LEFT JOIN households h ON h.id = dp.household_id
    WHERE dp.id = $1
    `,
    [id],
  );
  const row = rows[0];
  if (row === undefined) {
    return c.json({ error: "故人が見つかりません" }, 404);
  }

  return c.json({
    ...mapListRow(row),
    kaimyoNote: row.kaimyo_note,
    secularNameKana: row.secular_name_kana,
    sponsorName: row.sponsor_name,
    noticeNote: row.notice_note,
    note: row.note,
    legacyHouseNo: row.legacy_house_no,
  });
});

interface DeceasedBody {
  householdId?: unknown;
  kaimyo?: unknown;
  kaimyoNote?: unknown;
  secularName?: unknown;
  secularNameKana?: unknown;
  deathYear?: unknown;
  deathMonth?: unknown;
  deathDay?: unknown;
  deathWarekiRaw?: unknown;
  ageAtDeath?: unknown;
  sponsorName?: unknown;
  relationToHead?: unknown;
  noticeNote?: unknown;
  note?: unknown;
  legacyDistrict1?: unknown;
  legacyDistrict2?: unknown;
}

function asStringOrNull(value: unknown): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  return typeof value === "string" ? value : null;
}

function asIntOrNull(value: unknown): number | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

interface ValidatedDeceasedBody {
  error: string | null;
  deathDate: string | null;
}

function validateDeceasedBody(body: DeceasedBody): ValidatedDeceasedBody {
  const kaimyo = asStringOrNull(body.kaimyo);
  const secularName = asStringOrNull(body.secularName);
  if (kaimyo === null && secularName === null) {
    return { error: "kaimyo または secularName のいずれかは必須です", deathDate: null };
  }

  const { deathDate, error } = buildDeathDate({
    deathYear: asIntOrNull(body.deathYear),
    deathMonth: asIntOrNull(body.deathMonth),
    deathDay: asIntOrNull(body.deathDay),
  });
  if (error !== null) {
    return { error, deathDate: null };
  }

  return { error: null, deathDate };
}

function buildParams(body: DeceasedBody, deathDate: string | null): unknown[] {
  return [
    body.householdId ?? null,
    asStringOrNull(body.kaimyo),
    asStringOrNull(body.kaimyoNote),
    asStringOrNull(body.secularName),
    asStringOrNull(body.secularNameKana),
    asIntOrNull(body.deathYear),
    asIntOrNull(body.deathMonth),
    asIntOrNull(body.deathDay),
    deathDate,
    asStringOrNull(body.deathWarekiRaw),
    asIntOrNull(body.ageAtDeath),
    asStringOrNull(body.sponsorName),
    asStringOrNull(body.relationToHead),
    asStringOrNull(body.noticeNote),
    asStringOrNull(body.note),
    asStringOrNull(body.legacyDistrict1),
    asStringOrNull(body.legacyDistrict2),
  ];
}

// ---------------------------------------------------------------------
// POST /api/deceased: 新規作成
// ---------------------------------------------------------------------
deceasedRoute.post("/", async (c) => {
  const body = await c.req.json<DeceasedBody>().catch(() => null);
  if (body === null) {
    return c.json({ error: "リクエストボディが不正です" }, 400);
  }
  const { error, deathDate } = validateDeceasedBody(body);
  if (error !== null) {
    return c.json({ error }, 400);
  }

  const { rows } = await pool.query(
    `
    INSERT INTO deceased_persons (
      household_id, kaimyo, kaimyo_note, secular_name, secular_name_kana,
      death_year, death_month, death_day, death_date, death_wareki_raw,
      age_at_death, sponsor_name, relation_to_head, notice_note, note,
      legacy_district_1, legacy_district_2
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    RETURNING id
    `,
    buildParams(body, deathDate),
  );

  return c.json({ id: toNum(rows[0].id) }, 201);
});

// ---------------------------------------------------------------------
// PUT /api/deceased/:id: 更新
// ---------------------------------------------------------------------
deceasedRoute.put("/:id", async (c) => {
  const id = parseId(c.req.param("id"));
  if (id === null) {
    return c.json({ error: "id が不正です" }, 400);
  }
  const body = await c.req.json<DeceasedBody>().catch(() => null);
  if (body === null) {
    return c.json({ error: "リクエストボディが不正です" }, 400);
  }
  const { error, deathDate } = validateDeceasedBody(body);
  if (error !== null) {
    return c.json({ error }, 400);
  }

  const { rows } = await pool.query(
    `
    UPDATE deceased_persons SET
      household_id = $1, kaimyo = $2, kaimyo_note = $3, secular_name = $4,
      secular_name_kana = $5, death_year = $6, death_month = $7, death_day = $8,
      death_date = $9, death_wareki_raw = $10, age_at_death = $11, sponsor_name = $12,
      relation_to_head = $13, notice_note = $14, note = $15,
      legacy_district_1 = $16, legacy_district_2 = $17
    WHERE id = $18
    RETURNING id
    `,
    [...buildParams(body, deathDate), id],
  );

  if (rows.length === 0) {
    return c.json({ error: "故人が見つかりません" }, 404);
  }
  return c.json({ id });
});
