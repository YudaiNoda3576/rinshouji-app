import * as React from 'react';

import { NOTICE_STATUS } from '../constants';
import type { NoticeCase } from '../types';
import { daysUntil, fmtDate } from '../utils';

interface NoticeDetailProps {
  c: NoticeCase | undefined;
}

export function NoticeDetail({ c }: NoticeDetailProps) {
  const [previewMode, setPreviewMode] = React.useState<'letter' | 'line'>('letter'); // letter / line
  if (!c) return null;
  const status = NOTICE_STATUS[c.status];
  const d = daysUntil(c.targetDate);

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
        <div className="nd-sec">{c.secular}（{c.family}）</div>
        <div className="nd-target">
          <span className="nd-target-d">{fmtDate(c.targetDate)}</span>
          <span className={'nd-target-rel' + (d < 0 ? ' past' : (d <= 30 ? ' near' : ''))}>
            {d < 0 ? `${-d}日前に実施` : (d === 0 ? '本日' : `あと${d}日`)}
          </span>
        </div>
      </header>

      <div className="nd-body">
        <dl className="nd-meta">
          <dt>没年月日</dt><dd>{fmtDate(c.deathDate)}</dd>
          <dt>連絡先</dt><dd>{c.familyHead}<span className="dim"> ／ {c.phone}</span></dd>
          <dt>担当</dt><dd>{c.assignee}</dd>
          {c.sentAt && (<><dt>送付日</dt><dd>{fmtDate(c.sentAt)}<span className="dim"> ({c.sentVia === 'line' ? 'LINE' : 'メール'})</span></dd></>)}
          {c.responseAt && (<><dt>返答日</dt><dd>{fmtDate(c.responseAt)}</dd></>)}
        </dl>

        <div className="nd-tabs">
          <button className={'nd-tab' + (previewMode === 'letter' ? ' on' : '')} onClick={() => setPreviewMode('letter')}>案内状プレビュー</button>
          <button className={'nd-tab' + (previewMode === 'line' ? ' on' : '')} onClick={() => setPreviewMode('line')}>LINE文面</button>
        </div>

        {previewMode === 'letter' ? (
          <div className="letter-preview">
            <div className="lp-head">
              <div className="lp-from">青苔山 浄妙寺</div>
              <div className="lp-date">{fmtDate('2026-05-08')}</div>
            </div>
            <div className="lp-recipient">{c.familyHead} 様</div>
            <div className="lp-greet">時下ますます御清祥のこととお慶び申し上げます。</div>
            <p className="lp-body">
              さて、来る <strong>{fmtDate(c.targetDate)}</strong> に
              故 <span className="lp-kai">{c.kaimyo}</span>（{c.secular}）様の
              <strong>{c.kaiki}</strong>法要を当山にて勤修いたしたく存じます。
            </p>
            <p className="lp-body">
              つきましては、ご家族・ご親族の皆様にご参列いただきたく、ご案内申し上げます。
            </p>
            <dl className="lp-detail">
              <dt>日時</dt><dd>{fmtDate(c.targetDate)} 午前10時30分より</dd>
              <dt>場所</dt><dd>当山 本堂</dd>
              <dt>御布施</dt><dd>お志</dd>
              <dt>会食</dt><dd>法要後、本院にてお膳を用意いたします</dd>
            </dl>
            <div className="lp-sign">合掌 青苔山 浄妙寺 住職</div>
          </div>
        ) : (
          <div className="line-preview">
            <div className="line-bubble">
              <div className="line-bubble-head">青苔山 浄妙寺</div>
              <p>{c.familyHead} 様</p>
              <p>
                来る <strong>{fmtDate(c.targetDate)}</strong>、
                故 {c.kaimyo}（{c.secular}）様の<strong>{c.kaiki}</strong>を
                当山本堂にて勤修いたします。
              </p>
              <p>ご家族でご参列いただけますと幸いです。</p>
              <p className="line-time">午前10時30分〜（会食ご用意）</p>
              <div className="line-actions">
                <button className="line-btn confirm">出席する</button>
                <button className="line-btn decline">欠席する</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer style={{padding: '14px 22px', borderTop: '1px solid var(--border-default)', display: 'flex', gap: 8}}>
        <button className="btn ghost" type="button" style={{flex: 1}}>
          <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          編集
        </button>
        {c.status === 'pending' ? (
          <button className="btn primary" type="button" style={{flex: 1}}>
            <svg viewBox="0 0 24 24"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg>
            この1件を送付
          </button>
        ) : (
          <button className="btn outline" type="button" style={{flex: 1}}>
            <svg viewBox="0 0 24 24"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
            状態を変更
          </button>
        )}
      </footer>
    </aside>
  );
}
