import { Hono } from "hono";
import { pool, toNum } from "../db.js";
import { parseBooleanFlag, parseId } from "../lib/validation.js";

// 一覧・詳細（参照系）のみを扱う。作成・更新・削除は households-write.ts を参照。
export const householdsRoute = new Hono();

const ALLOWED_RELATION_TYPES = ["檀家", "信徒", "檀徒", "他寺", "その他"] as const;
const LIST_SORTS = ["name", "district", "deceased"] as const;
type ListSort = (typeof LIST_SORTS)[number];

// ---------------------------------------------------------------------
// GET /api/households: 一覧
// ---------------------------------------------------------------------
householdsRoute.get("/", async (c) => {
  const q = c.req.query("q");
  const districtIdRaw = c.req.query("districtId");
  const relationType = c.req.query("relationType");
  const includeInactive = parseBooleanFlag(c.req.query("includeInactive"));
  const sortRaw = c.req.query("sort");
  const sort: ListSort = (LIST_SORTS as readonly string[]).includes(sortRaw ?? "")
    ? (sortRaw as ListSort)
    : "name";

  let districtId: number | null = null;
  if (districtIdRaw !== undefined) {
    districtId = parseId(districtIdRaw);
    if (districtId === null) {
      return c.json({ error: "districtId が不正です" }, 400);
    }
  }

  if (relationType !== undefined && !(ALLOWED_RELATION_TYPES as readonly string[]).includes(relationType)) {
    return c.json({ error: "relationType が不正です" }, 400);
  }

  const conditions: string[] = ["h.status != 'deleted'"];
  const params: unknown[] = [];

  conditions.push(includeInactive ? "h.status IN ('active', 'inactive')" : "h.status = 'active'");

  if (q !== undefined && q !== "") {
    params.push(`%${q}%`);
    const idx = params.length;
    conditions.push(
      `(h.family_name ILIKE $${idx} OR hm.name ILIKE $${idx} OR hm.name_kana ILIKE $${idx} OR h.address_1 ILIKE $${idx})`,
    );
  }

  if (districtId !== null) {
    params.push(districtId);
    const idx = params.length;
    conditions.push(`(h.district_id = $${idx} OR d.parent_id = $${idx})`);
  }

  if (relationType !== undefined) {
    params.push(relationType);
    conditions.push(`h.relation_type = $${params.length}`);
  }

  const orderBy =
    sort === "district"
      ? "district1 NULLS LAST, district2 NULLS LAST, h.family_name"
      : sort === "deceased"
        ? "deceased_count DESC, h.family_name"
        : "h.family_name";

  const sql = `
    SELECT
      h.id,
      h.family_name,
      hm.name AS head_name,
      hm.name_kana AS head_kana,
      CASE WHEN d.level = 1 THEN d.name WHEN d.level = 2 THEN p.name END AS district1,
      CASE WHEN d.level = 2 THEN d.name END AS district2,
      h.relation_type,
      h.phone,
      h.mobile_phone,
      h.status,
      (SELECT COUNT(*) FROM deceased_persons dp WHERE dp.household_id = h.id) AS deceased_count
    FROM households h
    LEFT JOIN household_members hm ON hm.household_id = h.id AND hm.member_role = 'head'
    LEFT JOIN districts d ON d.id = h.district_id
    LEFT JOIN districts p ON p.id = d.parent_id
    WHERE ${conditions.join(" AND ")}
    ORDER BY ${orderBy}
  `;

  const { rows } = await pool.query(sql, params);

  return c.json(
    rows.map((row) => ({
      id: toNum(row.id),
      familyName: row.family_name,
      headName: row.head_name,
      headKana: row.head_kana,
      district1: row.district1,
      district2: row.district2,
      relationType: row.relation_type,
      phone: row.phone,
      mobilePhone: row.mobile_phone,
      status: row.status,
      deceasedCount: toNum(row.deceased_count),
    })),
  );
});

// ---------------------------------------------------------------------
// GET /api/households/:id: 詳細
// ---------------------------------------------------------------------
householdsRoute.get("/:id", async (c) => {
  const id = parseId(c.req.param("id"));
  if (id === null) {
    return c.json({ error: "id が不正です" }, 400);
  }

  const householdResult = await pool.query(
    `
    SELECT
      h.id, h.district_id, h.family_name, h.status, h.relation_type,
      h.postal_code, h.address_1, h.address_2, h.phone, h.mobile_phone,
      h.hannya_service, h.sejiki_service, h.tanagyo_schedule, h.monthly_service_day,
      h.jizo_flag, h.ihai_status, h.note,
      CASE WHEN d.level = 1 THEN d.name WHEN d.level = 2 THEN p.name END AS district1,
      CASE WHEN d.level = 2 THEN d.name END AS district2
    FROM households h
    LEFT JOIN districts d ON d.id = h.district_id
    LEFT JOIN districts p ON p.id = d.parent_id
    WHERE h.id = $1
    `,
    [id],
  );
  const householdRow = householdResult.rows[0];
  if (householdRow === undefined) {
    return c.json({ error: "世帯が見つかりません" }, 404);
  }

  const [membersResult, plotsResult, unitsResult, deceasedResult] = await Promise.all([
    pool.query(
      `SELECT id, member_role, name, name_kana, succession_order, note
       FROM household_members WHERE household_id = $1
       ORDER BY (member_role = 'head') DESC, succession_order NULLS LAST, id`,
      [id],
    ),
    pool.query(
      `SELECT id, plot_code, width_cm, fee, paid_on, paid_on_raw, note
       FROM cemetery_plots WHERE household_id = $1 ORDER BY id`,
      [id],
    ),
    pool.query(
      `SELECT id, unit_code, unit_type, ihai_name, note
       FROM columbarium_units WHERE household_id = $1 ORDER BY id`,
      [id],
    ),
    pool.query(
      `SELECT id, kaimyo, secular_name, death_year, death_month, death_day, death_date
       FROM deceased_persons WHERE household_id = $1
       ORDER BY death_date DESC NULLS LAST, death_year DESC NULLS LAST,
                death_month DESC NULLS LAST, death_day DESC NULLS LAST`,
      [id],
    ),
  ]);

  return c.json({
    household: {
      id: toNum(householdRow.id),
      districtId: toNum(householdRow.district_id),
      familyName: householdRow.family_name,
      status: householdRow.status,
      relationType: householdRow.relation_type,
      postalCode: householdRow.postal_code,
      address1: householdRow.address_1,
      address2: householdRow.address_2,
      phone: householdRow.phone,
      mobilePhone: householdRow.mobile_phone,
      hannyaService: householdRow.hannya_service,
      sejikiService: householdRow.sejiki_service,
      tanagyoSchedule: householdRow.tanagyo_schedule,
      monthlyServiceDay: householdRow.monthly_service_day,
      jizoFlag: householdRow.jizo_flag,
      ihaiStatus: householdRow.ihai_status,
      note: householdRow.note,
      district1: householdRow.district1,
      district2: householdRow.district2,
    },
    members: membersResult.rows.map((row) => ({
      id: toNum(row.id),
      memberRole: row.member_role,
      name: row.name,
      nameKana: row.name_kana,
      successionOrder: row.succession_order,
      note: row.note,
    })),
    cemeteryPlots: plotsResult.rows.map((row) => ({
      id: toNum(row.id),
      plotCode: row.plot_code,
      widthCm: row.width_cm,
      fee: row.fee,
      paidOn: formatDate(row.paid_on),
      paidOnRaw: row.paid_on_raw,
      note: row.note,
    })),
    columbariumUnits: unitsResult.rows.map((row) => ({
      id: toNum(row.id),
      unitCode: row.unit_code,
      unitType: row.unit_type,
      ihaiName: row.ihai_name,
      note: row.note,
    })),
    deceased: deceasedResult.rows.map((row) => ({
      id: toNum(row.id),
      kaimyo: row.kaimyo,
      secularName: row.secular_name,
      deathYear: row.death_year,
      deathMonth: row.death_month,
      deathDay: row.death_day,
      deathDate: formatDate(row.death_date),
    })),
  });
});

// db.ts で DATE 型 (OID 1082) の型パーサを文字列のまま返すよう設定しているため、
// pg から返る値は既に 'YYYY-MM-DD' 文字列。null の場合のみ通過させる素通しヘルパー。
function formatDate(value: string | null): string | null {
  return value;
}
