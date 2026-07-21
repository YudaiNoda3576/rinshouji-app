/**
 * フェーズ②③オーケストレーション: import_records → 本番 7 テーブル → parties。
 * 本番テーブルを TRUNCATE RESTART IDENTITY CASCADE で洗い替えて冪等化した後、
 * 同一トランザクション内でフェーズ③（build-parties.ts）を実行する。
 */
import type { PoolClient } from 'pg';
import { PRODUCTION_TABLES, SOURCE_KAKOCHO, SOURCE_MEIBO } from './config.js';
import { buildDistricts } from './districts.js';
import { transformHouseholds, type MeiboRecord } from './transform-households.js';
import { transformDeceased, type KakochoRecord } from './transform-deceased.js';
import { buildParties } from './build-parties.js';
import type { Report } from './report.js';

export async function runTransformPhase(
  client: PoolClient,
  report: Report,
): Promise<void> {
  await client.query('BEGIN');
  try {
    await client.query(
      `TRUNCATE TABLE ${PRODUCTION_TABLES.join(', ')} RESTART IDENTITY CASCADE`,
    );

    const meibo = await loadRecords<MeiboRecord>(client, SOURCE_MEIBO);
    const kakocho = await loadRecords<KakochoRecord>(client, SOURCE_KAKOCHO);

    const districts = await buildDistricts(client, meibo);
    report.counts.districtsLevel1 = districts.countLevel1;
    report.counts.districtsLevel2 = districts.countLevel2;

    const houseNoMap = await transformHouseholds(client, meibo, districts, report);
    await transformDeceased(client, kakocho, houseNoMap, report);

    // フェーズ③: household_members から parties を再生成（同一トランザクション内）。
    await buildParties(client, report);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
}

async function loadRecords<T extends { id: number; rowNumber: number; raw: Record<string, string> }>(
  client: PoolClient,
  sourceFile: string,
): Promise<T[]> {
  const res = await client.query<{ id: string; row_number: number; raw_data: Record<string, string> }>(
    `SELECT id, row_number, raw_data FROM import_records
      WHERE source_file = $1 ORDER BY row_number`,
    [sourceFile],
  );
  return res.rows.map(
    (r) => ({ id: Number(r.id), rowNumber: r.row_number, raw: r.raw_data }) as T,
  );
}
