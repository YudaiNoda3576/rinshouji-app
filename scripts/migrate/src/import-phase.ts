/**
 * フェーズ①: CSV → import_records。
 * 全列（無名列含む）を raw_data JSONB に列名キーで格納。
 * 冪等性: import_records を TRUNCATE RESTART IDENTITY CASCADE してから取込む。
 */
import type { PoolClient } from 'pg';
import { loadCsv } from './csv.js';
import { SOURCE_KAKOCHO, SOURCE_MEIBO } from './config.js';
import type { Report } from './report.js';

export interface ImportPaths {
  readonly meibo: string;
  readonly kakocho: string;
}

export async function runImportPhase(
  client: PoolClient,
  paths: ImportPaths,
  report: Report,
): Promise<void> {
  await client.query('BEGIN');
  try {
    await client.query('TRUNCATE TABLE import_records RESTART IDENTITY CASCADE');
    const meibo = await importFile(client, paths.meibo, SOURCE_MEIBO);
    const kakocho = await importFile(client, paths.kakocho, SOURCE_KAKOCHO);
    await client.query('COMMIT');

    report.counts.csvMeibo = meibo.inserted;
    report.counts.importMeibo = meibo.inserted;
    report.counts.skippedMeibo = meibo.skipped;
    report.counts.csvKakocho = kakocho.inserted;
    report.counts.importKakocho = kakocho.inserted;
    report.counts.skippedKakocho = kakocho.skipped;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
}

interface ImportFileResult {
  readonly inserted: number;
  readonly skipped: number;
}

async function importFile(
  client: PoolClient,
  path: string,
  sourceFile: string,
): Promise<ImportFileResult> {
  const csv = loadCsv(path);
  for (const record of csv.records) {
    await client.query(
      'INSERT INTO import_records (source_file, row_number, raw_data) VALUES ($1, $2, $3)',
      [sourceFile, record.rowNumber, JSON.stringify(record.data)],
    );
  }
  return { inserted: csv.records.length, skipped: csv.skipped };
}
