/**
 * 移行 CLI エントリポイント。
 *   --import    フェーズ①のみ（CSV → import_records。--meibo/--kakocho 必須）
 *   --transform フェーズ②③（import_records → 本番テーブル → parties 再生成）
 *   --parties   フェーズ③のみ（household_members → parties 再生成。
 *               CSV 引数不要、単独トランザクションで実行）
 *   --all       ①②③を連続実行（既定。--meibo/--kakocho 必須）
 * 接続先は DATABASE_URL 環境変数（既定: ローカル compose の postgres）。
 */
import type { PoolClient } from 'pg';
import { createPool } from './db.js';
import { runImportPhase } from './import-phase.js';
import { runTransformPhase } from './transform-phase.js';
import { buildParties } from './build-parties.js';
import { Report } from './report.js';
import { REPORT_DIR } from './config.js';

interface CliOptions {
  readonly mode: 'all' | 'import' | 'transform' | 'parties';
  readonly meibo: string | null;
  readonly kakocho: string | null;
}

function parseArgs(argv: readonly string[]): CliOptions {
  let mode: CliOptions['mode'] = 'all';
  let meibo: string | null = null;
  let kakocho: string | null = null;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '--all':
        mode = 'all';
        break;
      case '--import':
        mode = 'import';
        break;
      case '--transform':
        mode = 'transform';
        break;
      case '--parties':
        mode = 'parties';
        break;
      case '--meibo':
        meibo = argv[i + 1] ?? null;
        i += 1;
        break;
      case '--kakocho':
        kakocho = argv[i + 1] ?? null;
        i += 1;
        break;
      default:
        throw new Error(`不明な引数です: ${arg}`);
    }
  }
  return { mode, meibo, kakocho };
}

function requirePaths(opts: CliOptions): { meibo: string; kakocho: string } {
  if (opts.meibo === null || opts.kakocho === null) {
    throw new Error(
      '取込には --meibo <名簿CSVパス> と --kakocho <過去帳CSVパス> の両方が必要です。',
    );
  }
  return { meibo: opts.meibo, kakocho: opts.kakocho };
}

/** フェーズ③のみを単独トランザクションで実行する（既存 household_members から再生成）。 */
async function runPartiesOnly(client: PoolClient, report: Report): Promise<void> {
  await client.query('BEGIN');
  try {
    await buildParties(client, report);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));
  const pool = createPool();
  const client = await pool.connect();
  const report = new Report();

  try {
    if (opts.mode === 'parties') {
      await runPartiesOnly(client, report);
    } else {
      if (opts.mode !== 'transform') {
        await runImportPhase(client, requirePaths(opts), report);
      }
      if (opts.mode !== 'import') {
        await runTransformPhase(client, report);
      }
    }
  } finally {
    client.release();
    await pool.end();
  }

  const reportPath = report.writeFile(REPORT_DIR);
  report.printSummary();
  console.log(`\nレポート: ${reportPath}`);
}

main().catch((err: unknown) => {
  console.error('移行に失敗しました:', err);
  process.exitCode = 1;
});
