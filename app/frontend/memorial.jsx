// memorial.jsx — 過去帳 (memorial register): list + detail + new dialog

const KAIMYO_PREFIXES = ['釈', '釈尼', ''];
const KAIMYO_RANKS = ['居士', '大姉', '信士', '信女', '童子', '童女'];
const SECTS_M = ['浄土真宗', '曹洞宗', '日蓮宗', '真言宗', '天台宗'];

// Deterministic dataset of 18 memorial entries
const MEMORIAL_ENTRIES = [
  { id: 'K-0019', kaimyo: '釈 浄信 信士',       prefix: '釈',   name: '浄信',     rank: '信士', secular: '佐藤 文蔵',   age: 78, deceased: '2019-06-18', family: '佐藤家', familyId: 'F-0124', relation: '父',     sect: 0, anniversary: '七回忌',     nextDate: '2026-06-18', notes: '生前は寺の世話人を長く務める。' },
  { id: 'K-0022', kaimyo: '釈尼 妙心 大姉',     prefix: '釈尼', name: '妙心',     rank: '大姉', secular: '佐藤 千鶴',   age: 72, deceased: '2013-05-22', family: '佐藤家', familyId: 'F-0124', relation: '母',     sect: 0, anniversary: '十三回忌',   nextDate: '2026-05-22', notes: '十三回忌、本堂にて勤める。' },
  { id: 'K-0027', kaimyo: '釈 道幸 居士',       prefix: '釈',   name: '道幸',     rank: '居士', secular: '高橋 元次郎', age: 84, deceased: '1994-05-29', family: '高橋家', familyId: 'F-0131', relation: '祖父',   sect: 1, anniversary: '三十三回忌', nextDate: '2026-05-29', notes: '三十三回忌、年忌納め予定。' },
  { id: 'K-0034', kaimyo: '釈 浄観 信士',       prefix: '釈',   name: '浄観',     rank: '信士', secular: '田中 正三',   age: 81, deceased: '2014-05-22', family: '田中家', familyId: 'F-0118', relation: '父',     sect: 0, anniversary: '十三回忌',   nextDate: '2026-05-22', notes: '十三回忌、本堂にて勤める。' },
  { id: 'K-0038', kaimyo: '釈尼 妙円 大姉',     prefix: '釈尼', name: '妙円',     rank: '大姉', secular: '伊藤 八重',   age: 89, deceased: '2025-08-04', family: '伊藤家', familyId: 'F-0165', relation: '祖母',   sect: 0, anniversary: '一周忌',     nextDate: '2026-08-04', notes: '初盆を兼ねて勤める。' },
  { id: 'K-0041', kaimyo: '釈 浄安 信士',       prefix: '釈',   name: '浄安',     rank: '信士', secular: '吉田 為三郎', age: 73, deceased: '2010-07-11', family: '吉田家', familyId: 'F-0215', relation: '祖父',   sect: 0, anniversary: '十七回忌',   nextDate: '2026-07-11', notes: '— ' },
  { id: 'K-0045', kaimyo: '釈 道清 居士',       prefix: '釈',   name: '道清',     rank: '居士', secular: '中村 太郎',   age: 76, deceased: '2020-09-02', family: '中村家', familyId: 'F-0182', relation: '父',     sect: 0, anniversary: '七回忌',     nextDate: '2026-09-02', notes: '七回忌、9月初旬に予定。' },
  { id: 'K-0049', kaimyo: '釈尼 妙香 信女',     prefix: '釈尼', name: '妙香',     rank: '信女', secular: '小林 富江',   age: 81, deceased: '2002-04-09', family: '小林家', familyId: 'F-0193', relation: '祖母',   sect: 2, anniversary: '二十五回忌', nextDate: '2026-04-09', notes: '春彼岸に併修。' },
  { id: 'K-0053', kaimyo: '釈 浄真 居士',       prefix: '釈',   name: '浄真',     rank: '居士', secular: '山本 一平',   age: 87, deceased: '1987-10-23', family: '山本家', familyId: 'F-0140', relation: '曾祖父', sect: 1, anniversary: '三十三回忌', nextDate: '2020-10-23', notes: '年忌納め済。' },
  { id: 'K-0058', kaimyo: '釈尼 妙照 信女',     prefix: '釈尼', name: '妙照',     rank: '信女', secular: '山本 トモ',   age: 79, deceased: '2006-03-15', family: '山本家', familyId: 'F-0140', relation: '祖母',   sect: 1, anniversary: '二十一回忌', nextDate: '2026-03-15', notes: '— ' },
  { id: 'K-0062', kaimyo: '釈 道明 信士',       prefix: '釈',   name: '道明',     rank: '信士', secular: '渡辺 庄助',   age: 91, deceased: '1972-11-08', family: '渡辺家', familyId: 'F-0170', relation: '曾祖父', sect: 1, anniversary: '五十回忌',   nextDate: '2022-11-08', notes: '年忌納め済。記録のみ。' },
  { id: 'K-0067', kaimyo: '釈 浄久 信士',       prefix: '釈',   name: '浄久',     rank: '信士', secular: '山田 久蔵',   age: 88, deceased: '1956-12-30', family: '山田家', familyId: 'F-0228', relation: '高祖父', sect: 4, anniversary: '五十回忌',   nextDate: '2006-12-30', notes: '初代戸主。年忌納め済。' },
  { id: 'K-0073', kaimyo: '釈 道俊 居士',       prefix: '釈',   name: '道俊',     rank: '居士', secular: '加藤 俊雄',   age: 72, deceased: '2023-02-11', family: '加藤家', familyId: 'F-0201', relation: '父',     sect: 3, anniversary: '三回忌',     nextDate: '2026-02-11', notes: '三回忌、本年初に勤める。' },
  { id: 'K-0079', kaimyo: '釈尼 妙信 大姉',     prefix: '釈尼', name: '妙信',     rank: '大姉', secular: '鈴木 信子',   age: 84, deceased: '2018-10-04', family: '鈴木家', familyId: 'F-0152', relation: '母',     sect: 2, anniversary: '七回忌',     nextDate: '2024-10-04', notes: '昨年勤め済。' },
  { id: 'K-0084', kaimyo: '釈 浄空 童子',       prefix: '釈',   name: '浄空',     rank: '童子', secular: '佐藤 正彦',   age: 8,  deceased: '1953-04-12', family: '佐藤家', familyId: 'F-0124', relation: '伯父',   sect: 0, anniversary: '七十三回忌', nextDate: '2026-04-12', notes: '幼くして亡くなる。家系記録参照。' },
  { id: 'K-0089', kaimyo: '釈 道源 居士',       prefix: '釈',   name: '道源',     rank: '居士', secular: '田中 源右衛門', age: 80, deceased: '1898-06-04', family: '田中家', familyId: 'F-0118', relation: '高祖父', sect: 0, anniversary: '百二十八回忌', nextDate: '2026-06-04', notes: '田中家中興の祖。' },
  { id: 'K-0094', kaimyo: '釈尼 妙寿 大姉',     prefix: '釈尼', name: '妙寿',     rank: '大姉', secular: '高橋 トシ',   age: 95, deceased: '2024-11-28', family: '高橋家', familyId: 'F-0131', relation: '祖母',   sect: 1, anniversary: '三回忌',     nextDate: '2026-11-28', notes: '三回忌、秋に予定。' },
  { id: 'K-0098', kaimyo: '釈 浄海 信士',       prefix: '釈',   name: '浄海',     rank: '信士', secular: '中村 海三',   age: 69, deceased: '1996-01-19', family: '中村家', familyId: 'F-0182', relation: '祖父',   sect: 0, anniversary: '三十一回忌', nextDate: '2026-01-19', notes: '— ' },
];

// Service history per entry (memorial services performed)
function getServiceHistory(entry) {
  // Standard anniversaries: 1, 3, 7, 13, 17, 23, 27, 33, 37, 50回忌
  const deathYear = new Date(entry.deceased).getFullYear();
  const cur = 2026;
  const elapsed = cur - deathYear;
  const milestones = [
    { n: 1, label: '一周忌' },
    { n: 3, label: '三回忌' },
    { n: 7, label: '七回忌' },
    { n: 13, label: '十三回忌' },
    { n: 17, label: '十七回忌' },
    { n: 23, label: '二十三回忌' },
    { n: 27, label: '二十七回忌' },
    { n: 33, label: '三十三回忌' },
    { n: 50, label: '五十回忌' },
  ];
  const out = [];
  // Funeral (葬儀)
  out.push({ label: '葬儀', date: entry.deceased, kind: 'funeral', done: true });
  for (const m of milestones) {
    // 三回忌 is actually 2 years after death (満2年), but use elapsed for demo
    const yearOfService = deathYear + (m.n === 1 ? 1 : m.n - 1);
    if (yearOfService > cur + 1) break;
    out.push({
      label: m.label,
      date: yearOfService + '-' + entry.deceased.slice(5),
      kind: 'memorial',
      done: yearOfService < cur || (yearOfService === cur && new Date(yearOfService + '-' + entry.deceased.slice(5)) < new Date(2026, 4, 11)),
    });
  }
  return out;
}

const fmtJpDate = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${y}年${parseInt(m, 10)}月${parseInt(d, 10)}日`;
};
const fmtJpDateShort = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${y}.${m}.${d}`;
};

// Era conversion (rough) for ceremonial feeling
function toEra(iso) {
  const y = parseInt(iso.slice(0, 4), 10);
  let era, n;
  if (y >= 2019) { era = '令和'; n = y - 2018; }
  else if (y >= 1989) { era = '平成'; n = y - 1988; }
  else if (y >= 1926) { era = '昭和'; n = y - 1925; }
  else if (y >= 1912) { era = '大正'; n = y - 1911; }
  else { era = '明治'; n = y - 1867; }
  const nl = n === 1 ? '元' : String(n);
  const m = parseInt(iso.slice(5, 7), 10);
  const d = parseInt(iso.slice(8, 10), 10);
  return `${era}${nl}年${m}月${d}日`;
}

const yearsUntil = (iso) => {
  const t = new Date(2026, 4, 11);
  const d = new Date(iso);
  const diff = (d - t) / (24 * 3600 * 1000);
  return Math.round(diff);
};

// ============================================================
// MEMORIAL PAGE — main view
// ============================================================
function MemorialPage({ onOpenNew }) {
  const [q, setQ] = React.useState('');
  const [familyFilter, setFamilyFilter] = React.useState('all');
  const [sort, setSort] = React.useState('upcoming'); // upcoming | recent | name
  const [selectedId, setSelectedId] = React.useState(MEMORIAL_ENTRIES[0].id);

  const families = React.useMemo(() => {
    const set = new Set(MEMORIAL_ENTRIES.map(e => e.family));
    return ['all', ...Array.from(set)];
  }, []);

  const filtered = React.useMemo(() => {
    let arr = MEMORIAL_ENTRIES.filter(e => {
      if (familyFilter !== 'all' && e.family !== familyFilter) return false;
      if (q) {
        const ql = q.toLowerCase();
        return (
          e.kaimyo.toLowerCase().includes(ql) ||
          e.secular.toLowerCase().includes(ql) ||
          e.family.toLowerCase().includes(ql) ||
          e.id.toLowerCase().includes(ql)
        );
      }
      return true;
    });
    if (sort === 'upcoming') {
      arr = arr.slice().sort((a, b) => {
        const da = yearsUntil(a.nextDate);
        const db = yearsUntil(b.nextDate);
        // Upcoming (positive) first, then descending; past (negative) last
        const score = (n) => n >= 0 ? n : 100000 - n;
        return score(da) - score(db);
      });
    } else if (sort === 'recent') {
      arr = arr.slice().sort((a, b) => b.deceased.localeCompare(a.deceased));
    } else if (sort === 'name') {
      arr = arr.slice().sort((a, b) => a.family.localeCompare(b.family, 'ja'));
    }
    return arr;
  }, [q, familyFilter, sort]);

  const selected = filtered.find(e => e.id === selectedId) || filtered[0] || MEMORIAL_ENTRIES[0];

  React.useEffect(() => {
    if (filtered.length && !filtered.find(e => e.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  // Stat: upcoming this year
  const upcomingCount = MEMORIAL_ENTRIES.filter(e => {
    const d = yearsUntil(e.nextDate);
    return d >= 0 && d <= 365;
  }).length;

  return (
    <div className="page-shell memorial-page">
      <div className="page-head">
        <div>
          <h1>過去帳</h1>
          <p>戒名と年忌の記録を管理します。</p>
        </div>
        <div className="head-actions">
          <button className="btn ghost" type="button">
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            年忌一覧を書き出す
          </button>
          <button className="btn primary purple" type="button" onClick={onOpenNew}>
            <svg viewBox="0 0 24 24"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
            新規登録
          </button>
        </div>
      </div>

      <div className="memorial-stats">
        <div className="mstat">
          <div className="mstat-l">過去帳記録数</div>
          <div className="mstat-v">{MEMORIAL_ENTRIES.length}<span className="mstat-u">件</span></div>
        </div>
        <div className="mstat">
          <div className="mstat-l">今年度の年忌</div>
          <div className="mstat-v">{upcomingCount}<span className="mstat-u">件</span></div>
        </div>
        <div className="mstat">
          <div className="mstat-l">今月の年忌</div>
          <div className="mstat-v">
            {MEMORIAL_ENTRIES.filter(e => {
              const d = yearsUntil(e.nextDate);
              return d >= 0 && d <= 31;
            }).length}
            <span className="mstat-u">件</span>
          </div>
        </div>
        <div className="mstat">
          <div className="mstat-l">関連する檀家</div>
          <div className="mstat-v">{new Set(MEMORIAL_ENTRIES.map(e => e.familyId)).size}<span className="mstat-u">家</span></div>
        </div>
      </div>

      <div className="memorial-tools">
        <div className="search-wrap">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="戒名・俗名・家名・記録番号で検索" />
        </div>
        <div className="mt-filter">
          <label>家</label>
          <select value={familyFilter} onChange={(e) => setFamilyFilter(e.target.value)}>
            {families.map(f => (
              <option key={f} value={f}>{f === 'all' ? 'すべての家' : f}</option>
            ))}
          </select>
        </div>
        <div className="mt-filter">
          <label>並び順</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="upcoming">年忌が近い順</option>
            <option value="recent">没年月日が新しい順</option>
            <option value="name">家名順</option>
          </select>
        </div>
        <div className="mt-count">{filtered.length}件</div>
      </div>

      <div className="memorial-body">
        <div className="card memorial-list-card">
          {filtered.length === 0 ? (
            <div className="empty">該当する記録はありません。</div>
          ) : (
            <ul className="memorial-list">
              {filtered.map(entry => {
                const days = yearsUntil(entry.nextDate);
                const upcoming = days >= 0 && days <= 365;
                const thisMonth = days >= 0 && days <= 31;
                return (
                  <li key={entry.id}
                      className={'memorial-row' + (entry.id === selectedId ? ' selected' : '')}
                      onClick={() => setSelectedId(entry.id)}>
                    <div className="mr-mark">
                      <div className="memo-sigil"><span>戒</span></div>
                    </div>
                    <div className="mr-main">
                      <div className="mr-kaimyo">{entry.kaimyo}</div>
                      <div className="mr-sub">
                        <span className="secular">{entry.secular}</span>
                        <span className="dot-sep">・</span>
                        <span>{entry.family}</span>
                        <span className="dot-sep">・</span>
                        <span>{entry.relation}</span>
                      </div>
                    </div>
                    <div className="mr-date">
                      <div className="d-l">没年月日</div>
                      <div className="d-v">{toEra(entry.deceased)}</div>
                      <div className="d-meta">享年 {entry.age}</div>
                    </div>
                    <div className="mr-next">
                      {upcoming ? (
                        <span className={'next-chip' + (thisMonth ? ' soon' : '')}>
                          {entry.anniversary}
                          <span className="next-d">{fmtJpDateShort(entry.nextDate)}</span>
                        </span>
                      ) : days < 0 ? (
                        <span className="next-chip done">{entry.anniversary} 済</span>
                      ) : (
                        <span className="next-chip pending">{entry.anniversary}</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <MemorialDetail entry={selected} />
      </div>
    </div>
  );
}

// ============================================================
// DETAIL PANEL
// ============================================================
function MemorialDetail({ entry }) {
  if (!entry) return null;
  const history = getServiceHistory(entry);
  const next = history.find(h => !h.done);
  return (
    <aside className="card memorial-detail">
      <header className="md-head">
        <div className="md-id">過去帳 {entry.id}</div>
        <div className="md-kaimyo-wrap">
          <div className="md-kaimyo">{entry.kaimyo}</div>
          <div className="md-secular">俗名 — {entry.secular}</div>
        </div>
        <div className="md-meta">
          <div>
            <div className="md-meta-l">没年月日</div>
            <div className="md-meta-v">{toEra(entry.deceased)}</div>
            <div className="md-meta-sub">{fmtJpDate(entry.deceased)}</div>
          </div>
          <div>
            <div className="md-meta-l">享年</div>
            <div className="md-meta-v">{entry.age}<span className="md-meta-u">歳</span></div>
          </div>
        </div>
      </header>

      <section className="md-section">
        <div className="md-row"><span className="md-row-l">関連檀家</span><span className="md-row-v"><a href="#" onClick={(e) => e.preventDefault()}>{entry.family}</a><span className="md-row-meta"> ({entry.familyId})</span></span></div>
        <div className="md-row"><span className="md-row-l">続柄</span><span className="md-row-v">{entry.relation}</span></div>
        <div className="md-row"><span className="md-row-l">宗派</span><span className="md-row-v">{SECTS_M[entry.sect]}</span></div>
      </section>

      <section className="md-section">
        <div className="md-section-head">
          <h3>法要記録</h3>
          {next && <span className="md-next-pill">次回 {next.label} ・ {fmtJpDateShort(next.date)}</span>}
        </div>
        <ol className="service-timeline">
          {history.map((h, idx) => (
            <li key={idx} className={'st-item' + (h.done ? ' done' : ' upcoming') + (h.kind === 'funeral' ? ' funeral' : '')}>
              <div className="st-dot" />
              <div className="st-content">
                <div className="st-label">{h.label}</div>
                <div className="st-date">{toEra(h.date)}</div>
              </div>
              <div className="st-status">{h.done ? '勤修済' : '予定'}</div>
            </li>
          ))}
        </ol>
      </section>

      {entry.notes && entry.notes.trim() !== '—' && (
        <section className="md-section">
          <div className="md-section-head"><h3>備考</h3></div>
          <p className="md-notes">{entry.notes}</p>
        </section>
      )}

      <footer className="md-foot">
        <button className="btn ghost" type="button">
          <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          編集
        </button>
        <button className="btn ghost purple-text" type="button">
          <svg viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
          年忌を予定に追加
        </button>
      </footer>
    </aside>
  );
}

// ============================================================
// NEW DIALOG
// ============================================================
function NewMemorialDialog({ open, onClose, onSave }) {
  const [form, setForm] = React.useState({
    prefix: '釈',
    name: '',
    rank: '信士',
    secular: '',
    age: '',
    deceased: '2026-05-11',
    family: '佐藤家',
    relation: '父',
    sect: 0,
    notes: '',
  });
  if (!open) return null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const computedKaimyo = `${form.prefix} ${form.name || '◯◯'} ${form.rank}`.trim();

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog memorial-dialog" style={{ width: 720 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3>新規 過去帳登録</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--fg2)' }}>戒名と俗名、没年月日を記録します。</p>
          </div>
          <button className="x-btn" onClick={onClose} aria-label="閉じる">
            <svg viewBox="0 0 24 24"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
          </button>
        </header>
        <div className="body">
          <div className="kaimyo-preview">
            <div className="kp-label">戒名プレビュー</div>
            <div className="kp-value">{computedKaimyo}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            <div className="form-field">
              <label>院号・道号 (前)</label>
              <select className="input-plain" value={form.prefix} onChange={(e) => set('prefix', e.target.value)}>
                {KAIMYO_PREFIXES.map(p => <option key={p || 'none'} value={p}>{p || '— なし'}</option>)}
              </select>
            </div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>戒名 (本号)</label>
              <input className="input-plain" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="例: 浄信" />
            </div>
            <div className="form-field">
              <label>位号</label>
              <select className="input-plain" value={form.rank} onChange={(e) => set('rank', e.target.value)}>
                {KAIMYO_RANKS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>俗名</label>
              <input className="input-plain" value={form.secular} onChange={(e) => set('secular', e.target.value)} placeholder="例: 佐藤 文蔵" />
            </div>
            <div className="form-field">
              <label>享年</label>
              <input className="input-plain" value={form.age} onChange={(e) => set('age', e.target.value)} type="number" min="0" max="120" placeholder="例: 78" />
            </div>
            <div className="form-field">
              <label>没年月日</label>
              <input className="input-plain" value={form.deceased} onChange={(e) => set('deceased', e.target.value)} type="date" />
            </div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>関連檀家</label>
              <select className="input-plain" value={form.family} onChange={(e) => set('family', e.target.value)}>
                {['佐藤家','田中家','高橋家','山本家','鈴木家','伊藤家','渡辺家','中村家','小林家','加藤家','吉田家','山田家'].map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>続柄</label>
              <select className="input-plain" value={form.relation} onChange={(e) => set('relation', e.target.value)}>
                {['戸主','父','母','祖父','祖母','曾祖父','曾祖母','長男','長女','次男','次女','伯父','伯母'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>宗派</label>
              <select className="input-plain" value={form.sect} onChange={(e) => set('sect', parseInt(e.target.value, 10))}>
                {SECTS_M.map((s, i) => <option key={s} value={i}>{s}</option>)}
              </select>
            </div>
            <div className="form-field" style={{ gridColumn: 'span 4' }}>
              <label>備考</label>
              <textarea className="input-plain" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="生前のことなど" />
            </div>
          </div>
        </div>
        <footer>
          <button className="btn outline" type="button" onClick={onClose}>キャンセル</button>
          <button className="btn primary purple" type="button" onClick={() => onSave(form)} disabled={!form.name || !form.secular}>登録する</button>
        </footer>
      </div>
    </div>
  );
}

Object.assign(window, { MemorialPage, NewMemorialDialog });
