/**
 * CSV 読込。ヘッダ行をキーに各データ行を連想配列化する。
 * 無名列は「無名列」「無名列2」… に振り替える。
 * row_number は元 CSV のデータ行番号（ヘッダ除く 1 始まり）を維持し、
 * 全項目空のスペーサ行はスキップする（採番は維持＝欠番許容）。
 */
import { readFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';
import { UNNAMED_KEY_BASE } from './config.js';
import { isBlank } from './converters/text.js';

export interface CsvRecord {
  readonly rowNumber: number;
  readonly data: Readonly<Record<string, string>>;
}

export interface CsvLoadResult {
  readonly headers: readonly string[];
  readonly records: readonly CsvRecord[];
  /** 物理データ行数（ヘッダ除く、スペーサ含む）。 */
  readonly totalRows: number;
  /** 全項目空でスキップした行数。 */
  readonly skipped: number;
}

export function loadCsv(path: string): CsvLoadResult {
  const raw = readFileSync(path);
  const rows: string[][] = parse(raw, {
    bom: true,
    relax_column_count: true,
    skip_empty_lines: false,
  });
  if (rows.length === 0) {
    return { headers: [], records: [], totalRows: 0, skipped: 0 };
  }

  const headers = buildHeaders(rows[0] ?? []);
  const records: CsvRecord[] = [];
  let skipped = 0;

  for (let i = 1; i < rows.length; i += 1) {
    const cells = rows[i] ?? [];
    const rowNumber = i; // ヘッダ除く 1 始まり（スキップ行も採番維持）
    if (cells.every((c) => isBlank(c))) {
      skipped += 1;
      continue;
    }
    records.push({ rowNumber, data: toRecord(headers, cells) });
  }

  return { headers, records, totalRows: rows.length - 1, skipped };
}

function buildHeaders(headerRow: readonly string[]): string[] {
  const headers: string[] = [];
  let unnamed = 0;
  for (const cell of headerRow) {
    const name = (cell ?? '').trim();
    if (name === '') {
      unnamed += 1;
      headers.push(unnamed === 1 ? UNNAMED_KEY_BASE : `${UNNAMED_KEY_BASE}${unnamed}`);
    } else {
      headers.push(name);
    }
  }
  return headers;
}

function toRecord(
  headers: readonly string[],
  cells: readonly string[],
): Record<string, string> {
  const record: Record<string, string> = {};
  headers.forEach((key, idx) => {
    record[key] = (cells[idx] ?? '').trim();
  });
  return record;
}
