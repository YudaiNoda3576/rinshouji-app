import { Hono } from "hono";
import { pool, toNum } from "../db.js";
import { parseId } from "../lib/validation.js";

// POST/PUT/DELETE /api/households の作成・更新・削除系ルート。
// households.ts（一覧・詳細の参照系）とはファイルを分け、1ファイル400行以下を保つ。
export const householdsWriteRoute = new Hono();

interface HouseholdBody {
  familyName?: unknown;
  headName?: unknown;
  headKana?: unknown;
  districtId?: unknown;
  relationType?: unknown;
  postalCode?: unknown;
  address1?: unknown;
  address2?: unknown;
  phone?: unknown;
  mobilePhone?: unknown;
  hannyaService?: unknown;
  sejikiService?: unknown;
  tanagyoSchedule?: unknown;
  monthlyServiceDay?: unknown;
  jizoFlag?: unknown;
  ihaiStatus?: unknown;
  note?: unknown;
}

function asStringOrNull(value: unknown): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  return typeof value === "string" ? value : null;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function validateHouseholdBody(body: HouseholdBody): string | null {
  if (typeof body.familyName !== "string" || body.familyName.trim() === "") {
    return "familyName は必須です";
  }
  if (typeof body.headName !== "string" || body.headName.trim() === "") {
    return "headName は必須です";
  }
  return null;
}

// households テーブルの INSERT/UPDATE で共通の列順に並べたパラメータ配列を作る。
function buildHouseholdParams(body: HouseholdBody): unknown[] {
  return [
    body.districtId ?? null,
    body.familyName,
    asStringOrNull(body.relationType),
    asStringOrNull(body.postalCode),
    asStringOrNull(body.address1),
    asStringOrNull(body.address2),
    asStringOrNull(body.phone),
    asStringOrNull(body.mobilePhone),
    asStringOrNull(body.hannyaService),
    asStringOrNull(body.sejikiService),
    asStringOrNull(body.tanagyoSchedule),
    asStringOrNull(body.monthlyServiceDay),
    asBoolean(body.jizoFlag),
    asStringOrNull(body.ihaiStatus),
    asStringOrNull(body.note),
  ];
}

// ---------------------------------------------------------------------
// POST /api/households: 新規作成
// ---------------------------------------------------------------------
householdsWriteRoute.post("/", async (c) => {
  const body = await c.req.json<HouseholdBody>().catch(() => null);
  if (body === null) {
    return c.json({ error: "リクエストボディが不正です" }, 400);
  }
  const validationError = validateHouseholdBody(body);
  if (validationError !== null) {
    return c.json({ error: validationError }, 400);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const householdResult = await client.query(
      `
      INSERT INTO households (
        district_id, family_name, relation_type, postal_code, address_1, address_2,
        phone, mobile_phone, hannya_service, sejiki_service, tanagyo_schedule,
        monthly_service_day, jizo_flag, ihai_status, note
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id
      `,
      buildHouseholdParams(body),
    );
    const householdId = householdResult.rows[0].id as string;

    await client.query(
      `INSERT INTO household_members (household_id, member_role, name, name_kana)
       VALUES ($1, 'head', $2, $3)`,
      [householdId, body.headName, asStringOrNull(body.headKana)],
    );

    await client.query("COMMIT");
    return c.json({ id: toNum(householdId) }, 201);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------
// PUT /api/households/:id: 更新
// ---------------------------------------------------------------------
householdsWriteRoute.put("/:id", async (c) => {
  const id = parseId(c.req.param("id"));
  if (id === null) {
    return c.json({ error: "id が不正です" }, 400);
  }
  const body = await c.req.json<HouseholdBody>().catch(() => null);
  if (body === null) {
    return c.json({ error: "リクエストボディが不正です" }, 400);
  }
  const validationError = validateHouseholdBody(body);
  if (validationError !== null) {
    return c.json({ error: validationError }, 400);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const updateResult = await client.query(
      `
      UPDATE households SET
        district_id = $1, family_name = $2, relation_type = $3, postal_code = $4,
        address_1 = $5, address_2 = $6, phone = $7, mobile_phone = $8,
        hannya_service = $9, sejiki_service = $10, tanagyo_schedule = $11,
        monthly_service_day = $12, jizo_flag = $13, ihai_status = $14, note = $15
      WHERE id = $16
      RETURNING id
      `,
      [...buildHouseholdParams(body), id],
    );

    if (updateResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return c.json({ error: "世帯が見つかりません" }, 404);
    }

    // 現戸主の部分UNIQUEインデックス (household_id) WHERE member_role='head' を
    // 使った UPSERT。既存の head 行があれば更新、無ければ新規作成する。
    await client.query(
      `
      INSERT INTO household_members (household_id, member_role, name, name_kana)
      VALUES ($1, 'head', $2, $3)
      ON CONFLICT (household_id) WHERE member_role = 'head'
      DO UPDATE SET name = EXCLUDED.name, name_kana = EXCLUDED.name_kana
      `,
      [id, body.headName, asStringOrNull(body.headKana)],
    );

    await client.query("COMMIT");
    return c.json({ id });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------
// DELETE /api/households/:id: 論理削除
// ---------------------------------------------------------------------
householdsWriteRoute.delete("/:id", async (c) => {
  const id = parseId(c.req.param("id"));
  if (id === null) {
    return c.json({ error: "id が不正です" }, 400);
  }

  const result = await pool.query(
    `UPDATE households SET status = 'deleted' WHERE id = $1 RETURNING id`,
    [id],
  );
  if (result.rows.length === 0) {
    return c.json({ error: "世帯が見つかりません" }, 404);
  }

  return c.body(null, 204);
});
