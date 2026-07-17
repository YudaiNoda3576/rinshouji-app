// 年忌案内 — メインビュー。実 API（GET /api/notices）接続版。
//
// 【未永続化】送付状態を保存するテーブルは未設計のため、API は全件 status='pending' を返す。
// 画面上の状態変更（編集ダイアログ・一斉送付）は statusOverrides（ローカル state）で
// 上書き表示するのみで、リロード・期間変更による再取得で消える。

import * as React from 'react';

import type { PushToast } from '@/types/toast';

import { fetchNotices } from '../api';
import { NOTICE_STATUS } from '../constants';
import type { NoticeCase, NoticeGroupBy, NoticePeriod, NoticeStatusFilter, NoticeStatusKey } from '../types';
import { daysUntil, fmtDate, fmtMonth } from '../utils';
import { EditNoticeDialog } from './EditNoticeDialog';
import { NoticeDetail } from './NoticeDetail';
import { SendNoticesDialog } from './SendNoticesDialog';
import { TemplateSettingsDialog } from './TemplateSettingsDialog';

interface NoticesPageProps {
  onToast?: PushToast;
}

// 期間フィルタ → API の monthsAhead への対応。
const PERIOD_MONTHS: Record<NoticePeriod, number> = { next3m: 3, '6m': 6, '1y': 12 };

export function NoticesPage({ onToast }: NoticesPageProps) {
  const [period, setPeriod] = React.useState<NoticePeriod>('1y'); // 1y / 6m / next3m
  const [statusFilter, setStatusFilter] = React.useState<NoticeStatusFilter>('all');
  const [groupBy, setGroupBy] = React.useState<NoticeGroupBy>('month'); // month / family / status
  const [q, setQ] = React.useState('');
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [detailId, setDetailId] = React.useState<string | null>(null);
  const [showSendDialog, setShowSendDialog] = React.useState(false);
  const [showTemplates, setShowTemplates] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

  const [cases, setCases] = React.useState<NoticeCase[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [reloadToken, setReloadToken] = React.useState(0);

  // 画面上の状態変更の上書き（id -> status）。未永続化のためリロードで消える。
  const [statusOverrides, setStatusOverrides] = React.useState<Map<string, NoticeStatusKey>>(new Map());

  // 一覧取得。期間フィルタは monthsAhead としてサーバへ渡す。
  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchNotices(PERIOD_MONTHS[period])
      .then((data) => {
        if (cancelled) return;
        setCases(data);
        setSelected(new Set());
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : '年忌案内の取得に失敗しました。');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [period, reloadToken]);

  // ローカル上書きを反映した表示用データ。
  const effective = React.useMemo(
    () =>
      cases.map((c) => {
        const override = statusOverrides.get(c.id);
        return override !== undefined && override !== c.status ? { ...c, status: override } : c;
      }),
    [cases, statusOverrides],
  );

  // 検索（戒名/俗名/家名/世帯主）・状態フィルタはクライアント側で行う。
  const filtered = effective.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (q) {
      const hay = `${c.kaimyo} ${c.secularName} ${c.familyName ?? ''} ${c.familyHead ?? ''}`;
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  // 並びは API の targetDate 昇順（null=月日未定は末尾）をそのまま使う。

  // グループ表示（月別/家別/状態別）。
  const groups = React.useMemo(() => {
    const g = new Map<string, NoticeCase[]>();
    for (const c of filtered) {
      let key: string;
      if (groupBy === 'month') key = c.targetDate !== null ? fmtMonth(c.targetDate) : `${c.targetYear}年（月日未定）`;
      else if (groupBy === 'family') key = c.familyName ?? '関連檀家なし';
      else key = NOTICE_STATUS[c.status].label;
      const bucket = g.get(key);
      if (bucket) bucket.push(c);
      else g.set(key, [c]);
    }
    return [...g.entries()];
  }, [filtered, groupBy]);

  const stats = {
    total: filtered.length,
    pending: filtered.filter((c) => c.status === 'pending').length,
    sent: filtered.filter((c) => c.status === 'sent').length,
    confirmed: filtered.filter((c) => c.status === 'confirmed').length,
  };

  const detail = effective.find((c) => c.id === detailId) ?? filtered[0] ?? effective[0];

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((c) => c.id)));
  };
  const clearSelection = () => setSelected(new Set());

  const selectedPending = [...selected].filter((id) => {
    const c = effective.find((x) => x.id === id);
    return c !== undefined && c.status === 'pending';
  });

  // 一斉送付: 選択中の未送付分を画面上のみ「送付済」に上書きする（未永続化）。
  const handleBulkSend = () => {
    setStatusOverrides((prev) => {
      const next = new Map(prev);
      for (const id of selectedPending) next.set(id, 'sent');
      return next;
    });
    setSelected(new Set());
    onToast?.({
      kind: 'success',
      title: `${selectedPending.length}件を送付済にしました。`,
      desc: '※ 画面上のみの反映です（送付状態はまだ永続化されません）。',
    });
  };

  // 編集ダイアログ: 状態変更を画面上のみ反映する（未永続化）。
  const handleEditSave = (status: NoticeStatusKey) => {
    if (!detail) return;
    setStatusOverrides((prev) => new Map(prev).set(detail.id, status));
    setEditOpen(false);
    onToast?.({
      kind: 'success',
      title: '案内を更新しました。',
      desc: `${detail.kaimyo}（${detail.familyName ?? '関連檀家なし'}）※ 画面上のみの反映です。`,
    });
  };

  const retry = () => setReloadToken((t) => t + 1);

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

          {loading ? (
            <div className="empty">読み込み中…</div>
          ) : error ? (
            <div className="empty">
              <p>{error}</p>
              <button className="btn outline" type="button" onClick={retry}>再試行</button>
            </div>
          ) : (
            <>
              {groups.map(([groupKey, items]) => (
                <div key={groupKey} className="nl-group">
                  <div className="nl-group-head">
                    <span className="nl-group-l">{groupKey}</span>
                    <span className="nl-group-c">{items.length}件</span>
                  </div>
                  {items.map(c => {
                    const d = c.targetDate !== null ? daysUntil(c.targetDate) : null;
                    const status = NOTICE_STATUS[c.status];
                    const isPast = d !== null && d < 0;
                    const isNear = d !== null && d >= 0 && d <= 30;
                    return (
                      <div key={c.id}
                           className={'nl-row' + (detail?.id === c.id ? ' selected' : '') + (selected.has(c.id) ? ' checked' : '')}
                           onClick={() => setDetailId(c.id)}>
                        <label className="checkbox-cell" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} />
                        </label>
                        <div className="nl-target">
                          {c.targetDate !== null && d !== null ? (
                            <>
                              <div className="nl-target-d">{fmtDate(c.targetDate).replace(/^\d{4}年/, '')}</div>
                              <div className={'nl-target-rel' + (isPast ? ' past' : (isNear ? ' near' : ''))}>
                                {isPast ? `${-d}日前` : (d === 0 ? '本日' : `あと${d}日`)}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="nl-target-d">{c.targetYear}年</div>
                              <div className="nl-target-rel">月日未定</div>
                            </>
                          )}
                        </div>
                        <div className="nl-kai">
                          <div className="nl-kai-name">{c.kaimyo}</div>
                          <div className="nl-kai-sec">{c.secularName}</div>
                        </div>
                        <div className="nl-family">
                          <div className="nl-family-name">{c.familyName ?? '関連檀家なし'}</div>
                          <div className="nl-family-head">{c.familyHead ?? '—'}</div>
                        </div>
                        <div className="nl-kaiki">
                          <span className="kaiki-chip">{c.kaiki}</span>
                        </div>
                        <div className="nl-status">
                          <span className="status-chip" style={{background: status.tint, color: status.dark}}>
                            <span className="status-dot" style={{background: status.dot}}></span>
                            {status.label}
                          </span>
                        </div>
                        {/* 出欠返答は未管理（送付状態と同様に未永続化）のため常に「—」。 */}
                        <div className="nl-resp">—</div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="empty">該当する年忌はありません。</div>
              )}
            </>
          )}
        </div>

        <NoticeDetail c={detail} onEdit={() => setEditOpen(true)} />
      </div>

      <SendNoticesDialog
        open={showSendDialog}
        onClose={() => setShowSendDialog(false)}
        count={selectedPending.length}
        onSend={handleBulkSend}
      />
      <TemplateSettingsDialog
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSave={() => onToast?.({ kind: 'success', title: 'テンプレートを保存しました。', desc: '※ 画面上のみの反映です（まだ永続化されません）。' })}
      />
      {detail && (
        <EditNoticeDialog
          open={editOpen}
          notice={detail}
          onClose={() => setEditOpen(false)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}
