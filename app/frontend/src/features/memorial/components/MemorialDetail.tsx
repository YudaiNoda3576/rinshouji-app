// 過去帳 — 詳細パネル（画面項目定義書 §6.1 準拠）。

import * as React from 'react';

import type { DeceasedDetail } from '../types';
import { fmtDeathDate, getServiceHistory, nextAnniversary } from '../utils';

interface MemorialDetailProps {
  entry: DeceasedDetail;
  onEdit: () => void;
}

export function MemorialDetail({ entry, onEdit }: MemorialDetailProps) {
  const [noteOpen, setNoteOpen] = React.useState(false);

  const deathDate = fmtDeathDate(entry);
  const next = nextAnniversary(entry);
  // 法要記録タイムライン: 正式な法要実施記録テーブルは未整備のため、没年月日からの
  // 機械算出によるモック表示（画面項目定義書 §6.1 参照）。
  const history = getServiceHistory(entry);
  const upcoming = history.find((h) => !h.done);

  const hasNote = Boolean(entry.kaimyoNote && entry.kaimyoNote.trim() !== '');
  const relationSuffix = entry.relationToHead ? `（${entry.relationToHead}）` : '';

  return (
    <aside className="card memorial-detail">
      <header className="md-head">
        <div className="md-id">過去帳 {entry.id}</div>
        <div className="md-kaimyo-wrap">
          <div className="md-kaimyo-row">
            <div className="md-kaimyo">{entry.kaimyo}</div>
            {hasNote && (
              <button
                type="button"
                className="md-note-btn"
                aria-label="戒名表記注意を表示"
                onClick={() => setNoteOpen((v) => !v)}
              >
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
              </button>
            )}
          </div>
          {hasNote && noteOpen && <div className="md-note-inline">{entry.kaimyoNote}</div>}
          <div className="md-secular">
            俗名 — {entry.secularName}
            {entry.secularNameKana && <span className="md-secular-kana">（{entry.secularNameKana}）</span>}
          </div>
        </div>
        <div className="md-meta">
          <div>
            <div className="md-meta-l">没年月日</div>
            <div className="md-meta-v">{deathDate.text}</div>
            {deathDate.warekiOriginalNote && <div className="md-meta-sub">{deathDate.warekiOriginalNote}</div>}
          </div>
          <div>
            <div className="md-meta-l">享年</div>
            <div className="md-meta-v">
              {entry.ageAtDeath != null ? <>{entry.ageAtDeath}<span className="md-meta-u">歳</span></> : '不詳'}
            </div>
          </div>
        </div>
      </header>

      <section className="md-section">
        <div className="md-row">
          <span className="md-row-l">施主名</span>
          <span className="md-row-v">{entry.sponsorName ? `${entry.sponsorName}${relationSuffix}` : '—'}</span>
        </div>
        <div className="md-row">
          <span className="md-row-l">関連檀家</span>
          <span className="md-row-v">
            {entry.householdId ? (
              <a href="#" onClick={(e) => e.preventDefault()}>{entry.familyName ?? '(家名未設定)'}</a>
            ) : (
              <span className="md-legacy-note">
                関連檀家なし
                {(entry.legacyDistrict1 || entry.legacyDistrict2 || entry.legacyHouseNo) && (
                  <>
                    {' '}
                    ／ 移行時地区（未整理）: {entry.legacyDistrict1 ?? '—'} / {entry.legacyDistrict2 ?? '—'}
                    {entry.legacyHouseNo && <>、旧家番: {entry.legacyHouseNo}</>}
                  </>
                )}
              </span>
            )}
          </span>
        </div>
        {entry.noticeNote && entry.noticeNote.trim() !== '' && (
          <div className="md-row">
            <span className="md-row-l">案内注意</span>
            <span className="md-row-v">{entry.noticeNote}</span>
          </div>
        )}
      </section>

      <section className="md-section">
        <div className="md-section-head">
          <h3>法要記録（モック表示）</h3>
          {upcoming && <span className="md-next-pill">次回 {upcoming.label} ・ {upcoming.dateLabel}</span>}
        </div>
        {history.length === 0 ? (
          <p className="md-notes">没年月日が未登録のため、法要記録を算出できません。</p>
        ) : (
          <ol className="service-timeline">
            {history.map((h, idx) => (
              <li key={idx} className={'st-item' + (h.done ? ' done' : ' upcoming') + (h.kind === 'funeral' ? ' funeral' : '')}>
                <div className="st-dot" />
                <div className="st-content">
                  <div className="st-label">{h.label}</div>
                  <div className="st-date">{h.dateLabel}</div>
                </div>
                <div className="st-status">{h.done ? '勤修済' : '予定'}</div>
              </li>
            ))}
          </ol>
        )}
        {next && (
          <p className="md-notes md-next-summary">
            次の年忌: {next.status === 'done'
              ? `${next.label}（済）`
              : next.status === 'monthDayUnknown'
                ? `${next.label}（実施年度: ${next.year}年度、月日未定）`
                : `${next.label}（${next.date}）`}
          </p>
        )}
      </section>

      {entry.note && entry.note.trim() !== '' && (
        <section className="md-section">
          <div className="md-section-head"><h3>備考</h3></div>
          <p className="md-notes">{entry.note}</p>
        </section>
      )}

      <footer className="md-foot">
        <button className="btn ghost" type="button" onClick={onEdit}>
          <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          編集する
        </button>
        <button className="btn ghost purple-text" type="button" title="スケジュール機能との連携は未接続です">
          <svg viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
          年忌を予定に追加
        </button>
      </footer>
    </aside>
  );
}
