import { Hono } from "hono";
import { pool, toNum } from "../db.js";

interface DistrictRow {
  id: string;
  name: string;
  level: number;
  parent_id: string | null;
}

export const districtsRoute = new Hono();

// GET /api/districts: 地区一覧（name 昇順）
districtsRoute.get("/", async (c) => {
  const { rows } = await pool.query<DistrictRow>(
    "SELECT id, name, level, parent_id FROM districts ORDER BY name",
  );

  return c.json(
    rows.map((row) => ({
      id: toNum(row.id),
      name: row.name,
      level: row.level,
      parentId: toNum(row.parent_id),
    })),
  );
});
