/**
 * 移行レポート。件数サマリ・警告リスト（カテゴリ別）・暫定処理適用件数を蓄積し、
 * Markdown ファイル出力と console サマリを行う。
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export interface CountSummary {
  csvMeibo: number;
  csvKakocho: number;
  importMeibo: number;
  importKakocho: number;
  skippedMeibo: number;
  skippedKakocho: number;
  districtsLevel1: number;
  districtsLevel2: number;
  households: number;
  membersHead: number;
  membersFormer: number;
  membersFamily: number;
  cemeteryPlots: number;
  columbariumUnits: number;
  deceased: number;
  partiesImported: number;
  householdMemberships: number;
  partyRoles: number;
}

interface WarnEntry {
  readonly source: string;
  readonly row: number;
  readonly detail: string;
}

export class Report {
  readonly counts: CountSummary = {
    csvMeibo: 0,
    csvKakocho: 0,
    importMeibo: 0,
    importKakocho: 0,
    skippedMeibo: 0,
    skippedKakocho: 0,
    districtsLevel1: 0,
    districtsLevel2: 0,
    households: 0,
    membersHead: 0,
    membersFormer: 0,
    membersFamily: 0,
    cemeteryPlots: 0,
    columbariumUnits: 0,
    deceased: 0,
    partiesImported: 0,
    householdMemberships: 0,
    partyRoles: 0,
  };

  private readonly warnings = new Map<string, WarnEntry[]>();
  private readonly provisional = new Map<string, number>();

  warn(category: string, source: string, row: number, detail: string): void {
    const list = this.warnings.get(category) ?? [];
    list.push({ source, row, detail });
    this.warnings.set(category, list);
  }

  provisionalHit(label: string): void {
    this.provisional.set(label, (this.provisional.get(label) ?? 0) + 1);
  }

  warnCountByCategory(): ReadonlyMap<string, number> {
    const m = new Map<string, number>();
    for (const [cat, list] of this.warnings) m.set(cat, list.length);
    return m;
  }

  /** Markdown 全文を生成。 */
  render(): string {
    const lines: string[] = [];
    lines.push('# データ移行レポート', '');
    lines.push(`生成日時: ${new Date().toISOString()}`, '');
    this.renderCounts(lines);
    this.renderProvisional(lines);
    this.renderWarnings(lines);
    return lines.join('\n');
  }

  /** レポートをファイル出力し、パスを返す。 */
  writeFile(dir: string): string {
    mkdirSync(dir, { recursive: true });
    const path = join(dir, 'migration-report.md');
    writeFileSync(path, this.render(), 'utf8');
    return path;
  }

  /** console へサマリ出力。 */
  printSummary(): void {
    const c = this.counts;
    /* eslint-disable no-console */
    console.log('==== 件数サマリ ====');
    console.log(`CSV: 名簿 ${c.csvMeibo} / 過去帳 ${c.csvKakocho}`);
    console.log(
      `import_records: 名簿 ${c.importMeibo}（skip ${c.skippedMeibo}） / 過去帳 ${c.importKakocho}（skip ${c.skippedKakocho}）`,
    );
    console.log(`districts: level1 ${c.districtsLevel1} / level2 ${c.districtsLevel2}`);
    console.log(`households: ${c.households}`);
    console.log(
      `household_members: head ${c.membersHead} / former ${c.membersFormer} / family ${c.membersFamily}`,
    );
    console.log(`cemetery_plots: ${c.cemeteryPlots}`);
    console.log(`columbarium_units: ${c.columbariumUnits}`);
    console.log(`deceased_persons: ${c.deceased}`);
    console.log(
      `parties(import): ${c.partiesImported} / household_memberships: ${c.householdMemberships} / party_roles: ${c.partyRoles}`,
    );
    console.log('==== 警告カテゴリ別件数 ====');
    for (const [cat, n] of this.warnCountByCategory()) {
      console.log(`  ${cat}: ${n}`);
    }
    console.log('==== 暫定処理適用件数 ====');
    for (const [label, n] of this.provisional) {
      console.log(`  ${label}: ${n}`);
    }
    /* eslint-enable no-console */
  }

  private renderCounts(lines: string[]): void {
    const c = this.counts;
    lines.push('## 1. 件数サマリ', '');
    lines.push('| 区分 | 件数 |', '| --- | --- |');
    lines.push(`| CSV 名簿（有効行） | ${c.csvMeibo} |`);
    lines.push(`| CSV 過去帳（有効行） | ${c.csvKakocho} |`);
    lines.push(`| import_records 名簿 | ${c.importMeibo} |`);
    lines.push(`| import_records 過去帳 | ${c.importKakocho} |`);
    lines.push(`| スキップ（名簿 空行） | ${c.skippedMeibo} |`);
    lines.push(`| スキップ（過去帳 空行） | ${c.skippedKakocho} |`);
    lines.push(`| districts level1 | ${c.districtsLevel1} |`);
    lines.push(`| districts level2 | ${c.districtsLevel2} |`);
    lines.push(`| households | ${c.households} |`);
    lines.push(`| household_members head | ${c.membersHead} |`);
    lines.push(`| household_members former_head | ${c.membersFormer} |`);
    lines.push(`| household_members family | ${c.membersFamily} |`);
    lines.push(`| cemetery_plots | ${c.cemeteryPlots} |`);
    lines.push(`| columbarium_units | ${c.columbariumUnits} |`);
    lines.push(`| deceased_persons | ${c.deceased} |`);
    lines.push(`| parties（origin=import） | ${c.partiesImported} |`);
    lines.push(`| household_memberships | ${c.householdMemberships} |`);
    lines.push(`| party_roles | ${c.partyRoles} |`);
    lines.push('');
  }

  private renderProvisional(lines: string[]): void {
    lines.push('## 2. 暫定処理適用件数（要ヒアリング関連）', '');
    if (this.provisional.size === 0) {
      lines.push('（なし）', '');
      return;
    }
    lines.push('| 処理 | 件数 |', '| --- | --- |');
    for (const [label, n] of this.provisional) {
      lines.push(`| ${label} | ${n} |`);
    }
    lines.push('');
  }

  private renderWarnings(lines: string[]): void {
    lines.push('## 3. 警告リスト（カテゴリ別）', '');
    if (this.warnings.size === 0) {
      lines.push('（警告なし）', '');
      return;
    }
    for (const [category, list] of this.warnings) {
      lines.push(`### ${category}（${list.length} 件）`, '');
      lines.push('| source | row | 原文・詳細 |', '| --- | --- | --- |');
      for (const w of list) {
        lines.push(`| ${w.source} | ${w.row} | ${escapePipe(w.detail)} |`);
      }
      lines.push('');
    }
  }
}

function escapePipe(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}
