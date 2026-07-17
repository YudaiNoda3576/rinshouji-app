// 年忌案内 — 詳細パネル。実データ（GET /api/notices の1件）表示版。
// 連絡先は世帯主（familyHead）と電話番号。孤立故人（householdId null）は「関連檀家なし」。
// 担当者の管理機能は未実装のため「—」固定。送付日・返答日は未永続化のため表示しない。

import * as React from 'react';

import type { PushToast } from '@/types/toast';

import { fetchNoticesPdf } from '../api';
import { NOTICE_STATUS, DEFAULT_NOTICE_TEMPLATE } from '../constants';
import type { NoticeCase } from '../types';
import { daysUntil, downloadBlob, fmtDate, fmtDeathDate, fmtTargetDate } from '../utils';

interface NoticeDetailProps {
  c: NoticeCase | undefined;
  onEdit: () => void;
  onToast?: PushToast;
}

export function NoticeDetail({ c, onEdit, onToast }: NoticeDetailProps) {
  const [exporting, setExporting] = React.useState(false);

  if (!c) return null;
  const status = NOTICE_STATUS[c.status];
  const d = c.targetDate !== null ? daysUntil(c.targetDate) : null;
  const recipient = c.familyHead ?? c.familyName ?? 'ご関係者';

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const blob = await fetchNoticesPdf([c], DEFAULT_NOTICE_TEMPLATE.body);
      downloadBlob(blob, `年忌案内_${c.kaimyo}.pdf`);
    } catch (err) {
      onToast?.({
        kind: 'error',
        title: 'PDFの出力に失敗しました。',
        desc: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <aside className="card notice-detail">
      <header style={{padding: '18px 22px', borderBottom: '1px solid var(--border-default)'}}>
        <div className="nd-status-row">
          <span className="status-chip" style={{background: status.tint, color: status.dark}}>
            <span className="status-dot" style={{background: status.dot}}></span>
            {status.label}
          </span>
          <span className="kaiki-chip lg">{c.kaiki}</span>
        </div>
        <div className="nd-kai">{c.kaimyo}</div>
        <div className="nd-sec">{c.secularName}（{c.familyName ?? '関連檀家なし'}）</div>
        <div className="nd-target">
          <span className="nd-target-d">{fmtTargetDate(c)}</span>
          {d !== null ? (
            <span className={'nd-target-rel' + (d < 0 ? ' past' : (d <= 30 ? ' near' : ''))}>
              {d < 0 ? `${-d}日前に実施` : (d === 0 ? '本日' : `あと${d}日`)}
            </span>
          ) : (
            <span className="nd-target-rel">月日未定</span>
          )}
        </div>
      </header>

      <div className="nd-body">
        <dl className="nd-meta">
          <dt>没年月日</dt><dd>{fmtDeathDate(c)}</dd>
          <dt>連絡先</dt>
          <dd>
            {c.householdId === null
              ? '関連檀家なし'
              : <>{c.familyHead ?? '—'}<span className="dim"> ／ {c.phone ?? '—'}</span></>}
          </dd>
          {/* 担当者の管理機能は未実装（固定表示）。 */}
          <dt>担当</dt><dd>—</dd>
        </dl>

        <div className="letter-preview">
          <div className="lp-head">
            <div className="lp-from">青苔山 浄妙寺</div>
            <div className="lp-date">{fmtDate(new Date().toISOString().slice(0, 10))}</div>
          </div>
          <div className="lp-recipient">{recipient} 様</div>
          <div className="lp-greet">時下ますます御清祥のこととお慶び申し上げます。</div>
          <p className="lp-body">
            さて、来る <strong>{fmtTargetDate(c)}</strong> に
            故 <span className="lp-kai">{c.kaimyo}</span>（{c.secularName}）様の
            <strong>{c.kaiki}</strong>法要を当山にて勤修いたしたく存じます。
          </p>
          <p className="lp-body">
            つきましては、ご家族・ご親族の皆様にご参列いただきたく、ご案内申し上げます。
          </p>
          <dl className="lp-detail">
            <dt>日時</dt><dd>{fmtTargetDate(c)} 午前10時30分より</dd>
            <dt>場所</dt><dd>当山 本堂</dd>
            <dt>御布施</dt><dd>お志</dd>
            <dt>会食</dt><dd>法要後、本院にてお膳を用意いたします</dd>
          </dl>
          <div className="lp-sign">合掌 青苔山 浄妙寺 住職</div>
        </div>
      </div>

      <footer style={{padding: '14px 22px', borderTop: '1px solid var(--border-default)', display: 'flex', gap: 8}}>
        <button className="btn ghost" type="button" style={{flex: 1}} onClick={onEdit}>
          <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          編集する
        </button>
        <button className="btn outline" type="button" style={{flex: 1}} onClick={handleExportPdf} disabled={exporting}>
          <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
          {exporting ? '生成中…' : 'PDF出力'}
        </button>
      </footer>
    </aside>
  );
}
