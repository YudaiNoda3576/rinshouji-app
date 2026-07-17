/**
 * 移行 CLI エントリポイント。
 *   --import    フェーズ①のみ（CSV → import_records。--meibo/--kakocho 必須）
 *   --transform フェーズ②のみ（import_records → 本番テーブル）
 *   --all       ①②を連続実行（既定。--meibo/--kakocho 必須）
 * 接続先は DATABASE_URL 環境変数（既定: ローカル compose の postgres）。
 */
import { createPool } from './db.js';
import { runImportPhase } from './import-phase.js';
import { runTransformPhase } from './transform-phase.js';
import { Report } from './report.js';
import { REPORT_DIR } from './config.js';

interface CliOptions {
  readonly mode: 'all' | 'import' | 'transform';
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

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));
  const pool = createPool();
  const client = await pool.connect();
  const report = new Report();

  try {
    if (opts.mode !== 'transform') {
      await runImportPhase(client, requirePaths(opts), report);
    }
    if (opts.mode !== 'import') {
      await runTransformPhase(client, report);
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
