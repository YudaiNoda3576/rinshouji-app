// notices.jsx — 年忌案内の自動集計・出力 (memorial notice aggregation + output)

const NOTICE_KAIKI = [
  { years: 1,  label: '一周忌' },
  { years: 3,  label: '三回忌' },
  { years: 7,  label: '七回忌' },
  { years: 13, label: '十三回忌' },
  { years: 17, label: '十七回忌' },
  { years: 23, label: '二十三回忌' },
  { years: 27, label: '二十七回忌' },
  { years: 33, label: '三十三回忌' },
  { years: 50, label: '五十回忌' },
];

const NOTICE_STATUS = {
  pending:   { label: '未送付', dot: '#9CA3AF', tint: 'hsl(210 11% 96%)', dark: '#4B5563' },
  sent:      { label: '送付済', dot: 'var(--temple-blue)',   tint: 'var(--temple-blue-tint)',   dark: '#1E3A8A' },
  confirmed: { label: '出席確認', dot: 'var(--temple-green)', tint: 'var(--temple-green-tint)',  dark: '#064E3B' },
  declined:  { label: '欠席連絡', dot: 'var(--temple-red)',   tint: 'var(--temple-red-tint)',    dark: '#7F1D1D' },
};

// Today is 2026-05-12 (令和8年). Generate aggregated 年忌 cases.
// Each case = (故人 × 該当する年忌) for 故人 whose 没年 + 年忌歳 falls within selected period.
const NOTICE_CASES = [
  { id: 'N-001', kaimyo: '釈 浄信 信士',     secular: '佐藤 文蔵',     family: '佐藤家', familyId: 'F-0124', familyHead: '佐藤 一彦',  phone: '03-XXXX-1124', deathDate: '2025-06-18', kaiki: '一周忌',   targetDate: '2026-06-18', priority: 'high',   status: 'sent',      sentVia: 'line', sentAt: '2026-05-02', responseAt: null,           assignee: '住職' },
  { id: 'N-002', kaimyo: '釈尼 妙心 大姉',   secular: '佐藤 八重',     family: '佐藤家', familyId: 'F-0124', familyHead: '佐藤 一彦',  phone: '03-XXXX-1124', deathDate: '2013-05-22', kaiki: '十三回忌', targetDate: '2026-05-22', priority: 'high',   status: 'confirmed', sentVia: 'line', sentAt: '2026-04-18', responseAt: '2026-04-22',   assignee: '住職' },
  { id: 'N-003', kaimyo: '釈 浄観 信士',     secular: '田中 久蔵',     family: '田中家', familyId: 'F-0118', familyHead: '田中 圭吾',  phone: '03-XXXX-1118', deathDate: '2013-09-10', kaiki: '十三回忌', targetDate: '2026-09-10', priority: 'medium', status: 'sent',      sentVia: 'mail', sentAt: '2026-04-10', responseAt: null,           assignee: '副住職' },
  { id: 'N-004', kaimyo: '釈 道幸 居士',     secular: '高橋 平太郎',   family: '高橋家', familyId: 'F-0131', familyHead: '高橋 治',    phone: '03-XXXX-2031', deathDate: '1993-11-04', kaiki: '三十三回忌', targetDate: '2026-11-04', priority: 'high',   status: 'pending',   sentVia: null,   sentAt: null,         responseAt: null,           assignee: '主任住職' },
  { id: 'N-005', kaimyo: '釈尼 妙信 大姉',   secular: '鈴木 ナミ',     family: '鈴木家', familyId: 'F-0152', familyHead: '鈴木 健一',  phone: '03-XXXX-2152', deathDate: '2019-08-15', kaiki: '七回忌',   targetDate: '2026-08-15', priority: 'medium', status: 'sent',      sentVia: 'line', sentAt: '2026-04-25', responseAt: null,           assignee: '住職' },
  { id: 'N-006', kaimyo: '釈 浄水 信士',     secular: '伊藤 茂吉',     family: '伊藤家', familyId: 'F-0165', familyHead: '伊藤 真一',  phone: '03-XXXX-3165', deathDate: '2023-10-30', kaiki: '三回忌',   targetDate: '2026-10-30', priority: 'medium', status: 'pending',   sentVia: null,   sentAt: null,         responseAt: null,           assignee: '住職' },
  { id: 'N-007', kaimyo: '釈 心月 居士',     secular: '山本 茂',       family: '山本家', familyId: 'F-0140', familyHead: '山本 健太',  phone: '03-XXXX-2140', deathDate: '2010-02-08', kaiki: '十七回忌', targetDate: '2026-02-08', priority: 'low',    status: 'confirmed', sentVia: 'line', sentAt: '2025-12-10', responseAt: '2025-12-18',   assignee: '住職' },
  { id: 'N-008', kaimyo: '釈 智観 信士',     secular: '渡辺 三郎',     family: '渡辺家', familyId: 'F-0177', familyHead: '渡辺 弘',    phone: '03-XXXX-3177', deathDate: '2009-12-05', kaiki: '十七回忌', targetDate: '2026-12-05', priority: 'medium', status: 'pending',   sentVia: null,   sentAt: null,         responseAt: null,           assignee: '副住職' },
  { id: 'N-009', kaimyo: '釈尼 清月 大姉',   secular: '中村 たつ',     family: '中村家', familyId: 'F-0188', familyHead: '中村 良和',  phone: '03-XXXX-4188', deathDate: '1999-07-22', kaiki: '二十七回忌', targetDate: '2026-07-22', priority: 'medium', status: 'sent',      sentVia: 'mail', sentAt: '2026-04-30', responseAt: null,           assignee: '住職' },
  { id: 'N-010', kaimyo: '釈 浄安 信士',     secular: '小林 安治',     family: '小林家', familyId: 'F-0193', familyHead: '小林 雅彦',  phone: '03-XXXX-4193', deathDate: '2019-01-14', kaiki: '七回忌',   targetDate: '2026-01-14', priority: 'low',    status: 'confirmed', sentVia: 'line', sentAt: '2025-11-22', responseAt: '2025-12-02',   assignee: '副住職' },
  { id: 'N-011', kaimyo: '釈尼 静香 大姉',   secular: '吉田 静江',     family: '吉田家', familyId: 'F-0215', familyHead: '吉田 浩司',  phone: '03-XXXX-5215', deathDate: '2003-04-09', kaiki: '二十三回忌', targetDate: '2026-04-09', priority: 'low',    status: 'declined',  sentVia: 'line', sentAt: '2026-02-18', responseAt: '2026-02-25',   assignee: '住職' },
  { id: 'N-012', kaimyo: '釈 道仁 居士',     secular: '加藤 仁三郎',   family: '加藤家', familyId: 'F-0202', familyHead: '加藤 隆',    phone: '03-XXXX-5202', deathDate: '1976-09-30', kaiki: '五十回忌', targetDate: '2026-09-30', priority: 'high',   status: 'pending',   sentVia: null,   sentAt: null,         responseAt: null,           assignee: '主任住職' },
  { id: 'N-013', kaimyo: '釈尼 妙音 大姉',   secular: '山田 とき',     family: '山田家', familyId: 'F-0227', familyHead: '山田 正夫',  phone: '03-XXXX-6227', deathDate: '2025-03-12', kaiki: '一周忌',   targetDate: '2026-03-12', priority: 'high',   status: 'confirmed', sentVia: 'line', sentAt: '2026-01-15', responseAt: '2026-01-20',   assignee: '住職' },
  { id: 'N-014', kaimyo: '釈 浄行 信士',     secular: '高橋 信太郎',   family: '高橋家', familyId: 'F-0131', familyHead: '高橋 治',    phone: '03-XXXX-2031', deathDate: '2023-07-08', kaiki: '三回忌',   targetDate: '2026-07-08', priority: 'medium', status: 'pending',   sentVia: null,   sentAt: null,         responseAt: null,           assignee: '住職' },
  { id: 'N-015', kaimyo: '釈 心観 信士',     secular: '佐藤 良蔵',     family: '佐藤家', familyId: 'F-0124', familyHead: '佐藤 一彦',  phone: '03-XXXX-1124', deathDate: '1993-04-04', kaiki: '三十三回忌', targetDate: '2026-04-04', priority: 'medium', status: 'sent',      sentVia: 'line', sentAt: '2026-02-08', responseAt: null,           assignee: '住職' },
];

const TODAY = new Date('2026-05-12');

const fmtDate = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
};
const fmtMonth = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth()+1}月`;
};
const daysUntil = (iso) => {
  const t = new Date(iso);
  return Math.round((t - TODAY) / (1000 * 60 * 60 * 24));
};

function NoticesPage() {
  const [period, setPeriod] = React.useState('1y'); // 1y / 6m / next3m
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [groupBy, setGroupBy] = React.useState('month'); // month / family / status
  const [q, setQ] = React.useState('');
  const [selected, setSelected] = React.useState(new Set());
  const [detailId, setDetailId] = React.useState('N-001');
  const [showSendDialog, setShowSendDialog] = React.useState(false);

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
    const g = new Map();
    for (const c of sorted) {
      let key;
      if (groupBy === 'month') key = fmtMonth(c.targetDate);
      else if (groupBy === 'family') key = c.family;
      else key = NOTICE_STATUS[c.status].label;
      if (!g.has(key)) g.set(key, []);
      g.get(key).push(c);
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

  const toggle = (id) => {
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
          <button className="btn ghost" type="button">
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            一覧をCSV出力
          </button>
          <button className="btn ghost" type="button">
            <svg viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
            印刷プレビュー
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
              <button key={o.k} className={'seg-btn' + (period === o.k ? ' on' : '')} onClick={() => setPeriod(o.k)}>{o.l}</button>
            ))}
          </div>
        </div>
        <div className="nt-group">
          <label>状態</label>
          <select className="input-plain" style={{height: 32}} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">すべて</option>
            <option value="pending">未送付</option>
            <option value="sent">送付済</option>
            <option value="confirmed">出席確認済</option>
            <option value="declined">欠席連絡</option>
          </select>
        </div>
        <div className="nt-group">
          <label>並び順</label>
          <select className="input-plain" style={{height: 32}} value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
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
                        <span className="via-chip" title={c.sentVia === 'line' ? 'LINEで送付' : 'メールで送付'}>
                          {c.sentVia === 'line' ? 'LINE' : 'メール'}
                        </span>
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

        <NoticeDetail c={detail} />
      </div>

      <SendNoticesDialog open={showSendDialog} onClose={() => setShowSendDialog(false)} count={selectedPending.length} />
    </div>
  );
}

function NoticeDetail({ c }) {
  if (!c) return null;
  const status = NOTICE_STATUS[c.status];
  const d = daysUntil(c.targetDate);
  const [previewMode, setPreviewMode] = React.useState('letter'); // letter / line

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

function SendNoticesDialog({ open, onClose, count }) {
  const [channel, setChannel] = React.useState('line');
  const [sendAt, setSendAt] = React.useState('now');
  if (!open) return null;
  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" style={{width: 540}} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <div>
            <h3>年忌案内の一斉送付</h3>
            <p style={{margin: '4px 0 0', fontSize: 12, color: 'var(--fg2)'}}>{count}件の未送付案内をまとめて送付します。</p>
          </div>
          <button className="x-btn" onClick={onClose} aria-label="閉じる">
            <svg viewBox="0 0 24 24"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
          </button>
        </header>
        <div className="body">
          <div className="form-field" style={{marginBottom: 16}}>
            <label>送付方法</label>
            <div className="channel-picker">
              <label className={'ch-card' + (channel === 'line' ? ' on' : '')}>
                <input type="radio" name="ch" checked={channel === 'line'} onChange={() => setChannel('line')} />
                <div className="ch-icon line">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 5.6 2 10c0 4 3.7 7.3 8.7 7.9.3.1.7.2.8.5.1.2.1.6.1.8l-.1.7c0 .2-.2.9.8.5.9-.4 5.1-3 7-5.2 1.3-1.4 1.7-2.9 1.7-4.7 0-4.4-4.5-8-10-8z"/></svg>
                </div>
                <div className="ch-info">
                  <div className="ch-label">LINE</div>
                  <div className="ch-desc">即時配信・既読/返答が把握できる</div>
                </div>
              </label>
              <label className={'ch-card' + (channel === 'mail' ? ' on' : '')}>
                <input type="radio" name="ch" checked={channel === 'mail'} onChange={() => setChannel('mail')} />
                <div className="ch-icon mail">
                  <svg viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 5L2 7"/></svg>
                </div>
                <div className="ch-info">
                  <div className="ch-label">メール</div>
                  <div className="ch-desc">PDF案内を添付して送信</div>
                </div>
              </label>
              <label className={'ch-card' + (channel === 'print' ? ' on' : '')}>
                <input type="radio" name="ch" checked={channel === 'print'} onChange={() => setChannel('print')} />
                <div className="ch-icon print">
                  <svg viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                </div>
                <div className="ch-info">
                  <div className="ch-label">郵送 (印刷)</div>
                  <div className="ch-desc">封書用PDFをまとめて出力</div>
                </div>
              </label>
            </div>
          </div>

          <div className="form-field">
            <label>送付タイミング</label>
            <div className="seg" style={{width: 'fit-content'}}>
              <button className={'seg-btn' + (sendAt === 'now' ? ' on' : '')} onClick={() => setSendAt('now')}>今すぐ送付</button>
              <button className={'seg-btn' + (sendAt === 'scheduled' ? ' on' : '')} onClick={() => setSendAt('scheduled')}>日時を指定</button>
            </div>
            {sendAt === 'scheduled' && (
              <div style={{display: 'flex', gap: 8, marginTop: 10}}>
                <input className="input-plain" type="date" defaultValue="2026-05-15" style={{flex: 1}} />
                <input className="input-plain" type="time" defaultValue="09:00" style={{width: 120}} />
              </div>
            )}
          </div>

          <div className="send-summary">
            <div className="ss-row">
              <span>送付件数</span>
              <strong>{count}件</strong>
            </div>
            <div className="ss-row">
              <span>送付方法</span>
              <strong>{channel === 'line' ? 'LINE' : channel === 'mail' ? 'メール' : '郵送 (印刷)'}</strong>
            </div>
            <div className="ss-row">
              <span>送付日時</span>
              <strong>{sendAt === 'now' ? '今すぐ' : '2026年5月15日 9:00'}</strong>
            </div>
          </div>
        </div>
        <footer>
          <button className="btn outline" type="button" onClick={onClose}>キャンセル</button>
          <button className="btn primary" type="button" onClick={onClose}>
            {channel === 'print' ? 'PDFを生成' : '送付する'}
          </button>
        </footer>
      </div>
    </div>
  );
}

Object.assign(window, { NoticesPage });
