import * as React from 'react';

import type { PushToast } from '@/types/toast';

import { NOTICE_CASES, NOTICE_STATUS, TODAY } from '../constants';
import type { NoticeGroupBy, NoticePeriod, NoticeStatusFilter } from '../types';
import { daysUntil, fmtDate, fmtMonth } from '../utils';
import { EditNoticeDialog } from './EditNoticeDialog';
import { NoticeDetail } from './NoticeDetail';
import { SendNoticesDialog } from './SendNoticesDialog';
import { TemplateSettingsDialog } from './TemplateSettingsDialog';

interface NoticesPageProps {
  onToast?: PushToast;
}

export function NoticesPage({ onToast }: NoticesPageProps) {
  const [period, setPeriod] = React.useState<NoticePeriod>('1y'); // 1y / 6m / next3m
  const [statusFilter, setStatusFilter] = React.useState<NoticeStatusFilter>('all');
  const [groupBy, setGroupBy] = React.useState<NoticeGroupBy>('month'); // month / family / status
  const [q, setQ] = React.useState('');
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [detailId, setDetailId] = React.useState('N-001');
  const [showSendDialog, setShowSendDialog] = React.useState(false);
  const [showTemplates, setShowTemplates] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

  const periodEnd = React.useMemo(() => {
    const d = new Date(TODAY);
    if (period === '6m') d.setMonth(d.getMonth() + 6);
    else if (period === 'next3m') d.setMonth(d.getMonth() + 3);
    else d.setFullYear(d.getFullYear() + 1);
    return d;
  }, [period]);
  const periodStart = TODAY;

  const filtered = NOTICE_CASES.filter(c => {
    const t = new Date(c.targetDate);
    if (period === 'next3m') {
      if (t < periodStart || t > periodEnd) return false;
    }
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (q) {
      const hay = `${c.kaimyo} ${c.secular} ${c.family} ${c.familyHead}`;
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => a.targetDate.localeCompare(b.targetDate));

  // Group
  const groups = React.useMemo(() => {
    const g = new Map<string, typeof sorted>();
    for (const c of sorted) {
      let key: string;
      if (groupBy === 'month') key = fmtMonth(c.targetDate);
      else if (groupBy === 'family') key = c.family;
      else key = NOTICE_STATUS[c.status].label;
      const bucket = g.get(key);
      if (bucket) bucket.push(c);
      else g.set(key, [c]);
    }
    return [...g.entries()];
  }, [sorted, groupBy]);

  const stats = {
    total: filtered.length,
    pending: filtered.filter(c => c.status === 'pending').length,
    sent: filtered.filter(c => c.status === 'sent').length,
    confirmed: filtered.filter(c => c.status === 'confirmed').length,
  };

  const detail = NOTICE_CASES.find(c => c.id === detailId) || sorted[0] || NOTICE_CASES[0];

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(c => c.id)));
  };
  const clearSelection = () => setSelected(new Set());

  const selectedPending = [...selected].filter(id => {
    const c = NOTICE_CASES.find(x => x.id === id);
    return c && c.status === 'pending';
  });

  return (
    <div className="page-shell notices-page">
      <div className="page-head">
        <div>
          <h1>年忌案内の自動集計</h1>
          <p>過去帳から該当する年忌を抽出し、案内状の作成・送付・出欠確認をまとめて行います。</p>
        </div>
        <div className="head-actions">
          <button className="btn ghost" type="button" onClick={() => setShowTemplates(true)}>
            <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
            テンプレート設定
          </button>
        </div>
      </div>

      <div className="notice-stats">
        <div className="nstat tot">
          <div className="nstat-l">該当年忌</div>
          <div className="nstat-v">{stats.total}<span className="nstat-u">件</span></div>
        </div>
        <div className="nstat pending">
          <div className="nstat-l">未送付</div>
          <div className="nstat-v">{stats.pending}<span className="nstat-u">件</span></div>
          <div className="nstat-meter"><div className="nstat-fill pend" style={{width: stats.total ? `${stats.pending/stats.total*100}%` : '0'}}></div></div>
        </div>
        <div className="nstat sent">
          <div className="nstat-l">送付済</div>
          <div className="nstat-v">{stats.sent}<span className="nstat-u">件</span></div>
          <div className="nstat-meter"><div className="nstat-fill snt" style={{width: stats.total ? `${stats.sent/stats.total*100}%` : '0'}}></div></div>
        </div>
        <div className="nstat conf">
          <div className="nstat-l">出席確認済</div>
          <div className="nstat-v">{stats.confirmed}<span className="nstat-u">件</span></div>
          <div className="nstat-meter"><div className="nstat-fill cnf" style={{width: stats.total ? `${stats.confirmed/stats.total*100}%` : '0'}}></div></div>
        </div>
      </div>

      <div className="notice-toolbar">
        <div className="search-wrap" style={{flex: '0 0 280px'}}>
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="戒名・俗名・家名で検索" />
        </div>
        <div className="nt-group">
          <label>対象期間</label>
          <div className="seg">
            {[
              { k: 'next3m', l: '今後3ヶ月' },
              { k: '6m',     l: '今後6ヶ月' },
              { k: '1y',     l: '今後1年' },
            ].map(o => (
              <button key={o.k} className={'seg-btn' + (period === o.k ? ' on' : '')} onClick={() => setPeriod(o.k as NoticePeriod)}>{o.l}</button>
            ))}
          </div>
        </div>
        <div className="nt-group">
          <label>状態</label>
          <select className="input-plain" style={{height: 32}} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as NoticeStatusFilter)}>
            <option value="all">すべて</option>
            <option value="pending">未送付</option>
            <option value="sent">送付済</option>
            <option value="confirmed">出席確認済</option>
            <option value="declined">欠席連絡</option>
          </select>
        </div>
        <div className="nt-group">
          <label>並び順</label>
          <select className="input-plain" style={{height: 32}} value={groupBy} onChange={(e) => setGroupBy(e.target.value as NoticeGroupBy)}>
            <option value="month">月別</option>
            <option value="family">家別</option>
            <option value="status">状態別</option>
          </select>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="bulk-bar">
          <div className="bulk-l">
            <span className="bulk-count">{selected.size}件選択中</span>
            <button className="link-btn" onClick={clearSelection}>選択解除</button>
          </div>
          <div className="bulk-r">
            <button className="btn ghost" type="button">
              <svg viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
              選択分を印刷
            </button>
            <button className="btn primary" type="button" onClick={() => setShowSendDialog(true)} disabled={selectedPending.length === 0}>
              <svg viewBox="0 0 24 24"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg>
              一斉送付 ({selectedPending.length}件)
            </button>
          </div>
        </div>
      )}

      <div className="notice-body">
        <div className="notice-list">
          <div className="nl-head">
            <label className="checkbox-cell">
              <input type="checkbox"
                     checked={selected.size === filtered.length && filtered.length > 0}
                     onChange={toggleAll}
                     ref={el => { if (el) el.indeterminate = selected.size > 0 && selected.size < filtered.length; }} />
            </label>
            <div className="nl-h-target">対象日</div>
            <div className="nl-h-kai">戒名・俗名</div>
            <div className="nl-h-family">家</div>
            <div className="nl-h-kaiki">年忌</div>
            <div className="nl-h-status">状態</div>
            <div className="nl-h-resp">出席</div>
          </div>

          {groups.map(([groupKey, items]) => (
            <div key={groupKey} className="nl-group">
              <div className="nl-group-head">
                <span className="nl-group-l">{groupKey}</span>
                <span className="nl-group-c">{items.length}件</span>
              </div>
              {items.map(c => {
                const d = daysUntil(c.targetDate);
                const status = NOTICE_STATUS[c.status];
                const isPast = d < 0;
                const isNear = d >= 0 && d <= 30;
                return (
                  <div key={c.id}
                       className={'nl-row' + (detailId === c.id ? ' selected' : '') + (selected.has(c.id) ? ' checked' : '')}
                       onClick={() => setDetailId(c.id)}>
                    <label className="checkbox-cell" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} />
                    </label>
                    <div className="nl-target">
                      <div className="nl-target-d">{fmtDate(c.targetDate).replace(/^\d{4}年/, '')}</div>
                      <div className={'nl-target-rel' + (isPast ? ' past' : (isNear ? ' near' : ''))}>
                        {isPast ? `${-d}日前` : (d === 0 ? '本日' : `あと${d}日`)}
                      </div>
                    </div>
                    <div className="nl-kai">
                      <div className="nl-kai-name">{c.kaimyo}</div>
                      <div className="nl-kai-sec">{c.secular}</div>
                    </div>
                    <div className="nl-family">
                      <div className="nl-family-name">{c.family}</div>
                      <div className="nl-family-head">{c.familyHead}</div>
                    </div>
                    <div className="nl-kaiki">
                      <span className="kaiki-chip">{c.kaiki}</span>
                    </div>
                    <div className="nl-status">
                      <span className="status-chip" style={{background: status.tint, color: status.dark}}>
                        <span className="status-dot" style={{background: status.dot}}></span>
                        {status.label}
                      </span>
                      {c.sentVia && (
                        <span className="via-chip" title="メールで送付">メール</span>
                      )}
                    </div>
                    <div className="nl-resp">
                      {c.responseAt ? fmtDate(c.responseAt).replace(/^\d{4}年/, '') : '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="empty">該当する年忌はありません。</div>
          )}
        </div>

        <NoticeDetail c={detail} onEdit={() => setEditOpen(true)} />
      </div>

      <SendNoticesDialog open={showSendDialog} onClose={() => setShowSendDialog(false)} count={selectedPending.length} />
      <TemplateSettingsDialog
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSave={() => onToast?.({ kind: 'success', title: 'テンプレートを保存しました。' })}
      />
      <EditNoticeDialog
        open={editOpen}
        notice={detail}
        onClose={() => setEditOpen(false)}
        onSave={() => {
          setEditOpen(false);
          onToast?.({ kind: 'success', title: '案内を更新しました。', desc: `${detail.kaimyo}（${detail.family}）` });
        }}
      />
    </div>
  );
}
