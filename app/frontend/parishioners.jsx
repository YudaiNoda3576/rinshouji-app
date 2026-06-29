// parishioners.jsx — 檀家管理 (parishioner list + detail + new dialog) — 3 layout variants

const SECTS = ['浄土真宗','曹洞宗','日蓮宗','真言宗','天台宗'];
const RELATIONS = ['戸主','妻','長男','長女','次男','母','父','祖母','祖父','養子'];
const KAMON = ['五三桐','左三巴','丸に橘','下り藤','丸に梅鉢','違い鷹の羽','九曜','蔦','花菱','井桁'];
const ZONES = ['本堂裏','東墓地','西墓地','旧墓地','新区画'];
const PARISH_FAMILIES = [
  { id: 'F-0124', name: '佐藤', head: '佐藤 一彦', members: 5, lastVisit: '2026-05-11', joined: 1972, addr: '東京都品川区南品川3-12-4', phone: '03-3458-XXXX', sect: 0, kamon: 0, zone: 0, ancestors: 6, scheduled: '七回忌 (2026-06-18)' },
  { id: 'F-0118', name: '田中', head: '田中 修', members: 3, lastVisit: '2026-04-22', joined: 1965, addr: '東京都品川区北品川1-8-2', phone: '03-3471-XXXX', sect: 0, kamon: 1, zone: 1, ancestors: 4, scheduled: '十三回忌 (2026-05-22)' },
  { id: 'F-0131', name: '高橋', head: '高橋 義信', members: 4, lastVisit: '2026-05-08', joined: 1984, addr: '東京都品川区東大井2-3-15', phone: '03-3762-XXXX', sect: 1, kamon: 2, zone: 0, ancestors: 8, scheduled: '三十三回忌 (2026-05-29)' },
  { id: 'F-0140', name: '山本', head: '山本 道夫', members: 6, lastVisit: '2026-05-04', joined: 1958, addr: '東京都品川区西大井1-1-1', phone: '03-3777-XXXX', sect: 1, kamon: 3, zone: 2, ancestors: 11, scheduled: null },
  { id: 'F-0152', name: '鈴木', head: '鈴木 健一', members: 4, lastVisit: '2026-03-30', joined: 1991, addr: '東京都品川区荏原2-8-9', phone: '03-3782-XXXX', sect: 2, kamon: 4, zone: 1, ancestors: 3, scheduled: null },
  { id: 'F-0165', name: '伊藤', head: '伊藤 京子', members: 2, lastVisit: '2026-02-18', joined: 2003, addr: '東京都品川区戸越4-15-1', phone: '03-3792-XXXX', sect: 0, kamon: 5, zone: 3, ancestors: 5, scheduled: '一周忌 (2026-08-04)' },
  { id: 'F-0170', name: '渡辺', head: '渡辺 静江', members: 3, lastVisit: '2025-12-23', joined: 1948, addr: '東京都品川区平塚1-2-3', phone: '03-3781-XXXX', sect: 1, kamon: 6, zone: 0, ancestors: 14, scheduled: null },
  { id: 'F-0182', name: '中村', head: '中村 純一', members: 5, lastVisit: '2026-04-30', joined: 1977, addr: '東京都品川区豊町3-4-5', phone: '03-3781-XXXX', sect: 0, kamon: 7, zone: 4, ancestors: 7, scheduled: '七回忌 (2026-09-02)' },
  { id: 'F-0193', name: '小林', head: '小林 麗子', members: 4, lastVisit: '2026-03-12', joined: 1988, addr: '東京都品川区中延5-1-22', phone: '03-3783-XXXX', sect: 2, kamon: 8, zone: 1, ancestors: 6, scheduled: null },
  { id: 'F-0201', name: '加藤', head: '加藤 信吾', members: 3, lastVisit: '2026-05-09', joined: 2010, addr: '東京都品川区旗の台2-6-7', phone: '03-3786-XXXX', sect: 3, kamon: 9, zone: 4, ancestors: 2, scheduled: null },
  { id: 'F-0215', name: '吉田', head: '吉田 とき子', members: 2, lastVisit: '2026-04-12', joined: 1960, addr: '東京都品川区小山3-9-1', phone: '03-3781-XXXX', sect: 0, kamon: 0, zone: 0, ancestors: 9, scheduled: '十七回忌 (2026-07-11)' },
  { id: 'F-0228', name: '山田', head: '山田 健作', members: 5, lastVisit: '2026-04-25', joined: 1973, addr: '東京都品川区西品川1-1-1', phone: '03-3450-XXXX', sect: 4, kamon: 1, zone: 2, ancestors: 8, scheduled: null },
];

function buildMembers(seedName) {
  return [
    { name: seedName + ' 一彦',   relation: '戸主',   age: 62, deceased: false, status: 'active' },
    { name: seedName + ' 千恵子', relation: '妻',     age: 58, deceased: false, status: 'active' },
    { name: seedName + ' 拓也',   relation: '長男',   age: 32, deceased: false, status: 'active' },
    { name: seedName + ' 美咲',   relation: '長女',   age: 28, deceased: false, status: 'active' },
    { name: seedName + ' 文蔵',   relation: '父',     age: null, deceased: true,  kaimyo: '釈 浄信 信士', date: '2019-06-18' },
    { name: seedName + ' 千鶴',   relation: '母',     age: null, deceased: true,  kaimyo: '釈尼 妙心 大姉', date: '2013-05-22' },
  ].slice(0, 6);
}

function Kamon({ idx, size = 32, accent }) {
  // Procedurally render a small "crest" mark — same family always same shape
  const shapes = [
    (s) => <circle cx="12" cy="12" r="9" />, // simple disc
    (s) => <g><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="3.5" /></g>,
    (s) => <g><path d="M12 3 L21 12 L12 21 L3 12 Z" /><circle cx="12" cy="12" r="3" fill="white" /></g>,
    (s) => <g><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12 5 L12 19 M5 12 L19 12 M7 7 L17 17 M17 7 L7 17" stroke="currentColor" strokeWidth="1.2" /></g>,
    (s) => <g><path d="M12 3 a9 9 0 0 0 0 18 a9 9 0 0 0 0 -18 z" /><path d="M12 3 a4.5 4.5 0 0 1 0 9 a4.5 4.5 0 0 1 0 9 z" fill="white" /></g>,
    (s) => <g><path d="M12 3 L14 10 L21 12 L14 14 L12 21 L10 14 L3 12 L10 10 Z" /></g>,
    (s) => <g><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="5.5" r="2.3" /><circle cx="12" cy="18.5" r="2.3" /><circle cx="5.5" cy="12" r="2.3" /><circle cx="18.5" cy="12" r="2.3" /></g>,
    (s) => <g><path d="M12 4 C 16 9, 16 9, 20 12 C 16 15, 16 15, 12 20 C 8 15, 8 15, 4 12 C 8 9, 8 9, 12 4 Z" /></g>,
    (s) => <g><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12 6 L15 12 L12 18 L9 12 Z" /></g>,
    (s) => <g><rect x="4" y="4" width="16" height="16" transform="rotate(45 12 12)" fill="none" stroke="currentColor" strokeWidth="2" /><rect x="8" y="8" width="8" height="8" transform="rotate(45 12 12)" /></g>,
  ];
  const c = accent || 'currentColor';
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={{ color: c }}>
      <g fill="currentColor">{shapes[idx % shapes.length]()}</g>
    </svg>
  );
}

const daysAgo = (iso) => {
  const t = new Date(2026, 4, 11);
  const d = new Date(iso);
  return Math.round((t - d) / (24 * 3600 * 1000));
};
const fmtRelativeDate = (iso) => {
  const days = daysAgo(iso);
  if (days <= 0) return '本日';
  if (days === 1) return '昨日';
  if (days < 7) return days + '日前';
  if (days < 30) return Math.floor(days / 7) + '週間前';
  if (days < 365) return Math.floor(days / 30) + 'ヶ月前';
  return Math.floor(days / 365) + '年以上前';
};

function ParishionersPage({ variant, onOpenNew }) {
  const all = PARISH_FAMILIES;
  const [q, setQ] = React.useState('');
  const [sectFilter, setSectFilter] = React.useState('all');
  const [sortKey, setSortKey] = React.useState('lastVisit');
  const [selectedId, setSelectedId] = React.useState(all[0].id);

  const filtered = all.filter(f =>
    (sectFilter === 'all' || f.sect === Number(sectFilter)) &&
    (q === '' || f.name.includes(q) || f.head.includes(q) || f.id.toLowerCase().includes(q.toLowerCase()) || f.addr.includes(q))
  );
  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === 'name') return a.name.localeCompare(b.name, 'ja');
    if (sortKey === 'members') return b.members - a.members;
    if (sortKey === 'joined') return a.joined - b.joined;
    return daysAgo(a.lastVisit) - daysAgo(b.lastVisit);
  });
  const selected = all.find(f => f.id === selectedId) || sorted[0];
  const members = selected ? buildMembers(selected.name) : [];

  return (
    <div className="parish-page">
      <div className="page-head">
        <div>
          <h1>檀家管理</h1>
          <p>檀家家別の情報、家族構成、過去帳、お参り履歴を管理します。</p>
        </div>
        <div className="head-actions">
          <button className="btn outline">
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            名簿を書き出し
          </button>
          <button className="btn primary" onClick={onOpenNew}>
            <svg viewBox="0 0 24 24"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
            新規檀家登録
          </button>
        </div>
      </div>

      <div className="parish-tools">
        <div className="search-wrap">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
          <input placeholder="家名・戸主名・住所・檀家番号で検索" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <ChipGroup label="宗派"
          value={sectFilter}
          options={[{ key: 'all', label: 'すべて' }, ...SECTS.map((s, i) => ({ key: String(i), label: s }))]}
          onChange={setSectFilter} />
        <ChipGroup label="並び"
          value={sortKey}
          options={[
            { key: 'lastVisit', label: '最近のお参り' },
            { key: 'name', label: '家名' },
            { key: 'members', label: '家族数' },
            { key: 'joined', label: '加入年' },
          ]}
          onChange={setSortKey} />
        <div className="count">{filtered.length}家 / 全{all.length}家</div>
      </div>

      <div className="parish-body">
        {variant === 'cards' ? (
          <CardGrid items={sorted} selected={selectedId} onSelect={setSelectedId} />
        ) : variant === 'tree' ? (
          <FamilyMap items={sorted} selected={selectedId} onSelect={setSelectedId} />
        ) : (
          <TableView items={sorted} selected={selectedId} onSelect={setSelectedId} />
        )}

        <aside className="parish-detail card-block">
          {selected && <ParishDetail f={selected} members={members} />}
        </aside>
      </div>
    </div>
  );
}

/* ---------- Variant A: Table ---------- */
function TableView({ items, selected, onSelect }) {
  return (
    <div className="card-block parish-table">
      <div className="ptbl-head">
        <div className="c-name">家名</div>
        <div className="c-head">戸主</div>
        <div className="c-mem">家族</div>
        <div className="c-sect">宗派</div>
        <div className="c-visit">最近のお参り</div>
        <div className="c-anc">過去帳</div>
        <div className="c-sched">直近の予定</div>
      </div>
      {items.map(f => (
        <div key={f.id}
             className={'ptbl-row' + (f.id === selected ? ' selected' : '')}
             onClick={() => onSelect(f.id)}>
          <div className="c-name">
            <div className="kamon-cell"><Kamon idx={f.kamon} size={28} /></div>
            <div>
              <div className="t1">{f.name}家</div>
              <div className="t2">{f.id}</div>
            </div>
          </div>
          <div className="c-head">{f.head}</div>
          <div className="c-mem"><b>{f.members}</b><span>名</span></div>
          <div className="c-sect"><Pill color="gray">{SECTS[f.sect]}</Pill></div>
          <div className="c-visit">
            <div className="t1">{fmtRelativeDate(f.lastVisit)}</div>
            <div className="t2">{f.lastVisit}</div>
          </div>
          <div className="c-anc">{f.ancestors}名</div>
          <div className="c-sched">
            {f.scheduled ? <span className="schedule-chip">{f.scheduled}</span> : <span className="dim">—</span>}
          </div>
        </div>
      ))}
      {items.length === 0 && <div className="vt-empty">該当する檀家家はありません。</div>}
    </div>
  );
}

/* ---------- Variant B: Card grid ---------- */
function CardGrid({ items, selected, onSelect }) {
  return (
    <div className="parish-cards">
      {items.map(f => (
        <button key={f.id}
                className={'parish-card' + (f.id === selected ? ' selected' : '')}
                onClick={() => onSelect(f.id)}>
          <div className="pc-top">
            <div className="pc-kamon"><Kamon idx={f.kamon} size={44} /></div>
            <div className="pc-head">
              <div className="pc-name">{f.name}家</div>
              <div className="pc-id">{f.id} · 加入 {f.joined}年</div>
            </div>
          </div>
          <div className="pc-meta">
            <div><span>戸主</span><b>{f.head}</b></div>
            <div><span>家族</span><b>{f.members}名</b></div>
            <div><span>宗派</span><b>{SECTS[f.sect]}</b></div>
            <div><span>区画</span><b>{ZONES[f.zone]}</b></div>
          </div>
          <div className="pc-foot">
            <div className="pc-last">
              <i style={{ background: 'var(--temple-blue)' }} />
              {fmtRelativeDate(f.lastVisit)} のお参り
            </div>
            {f.scheduled && <span className="schedule-chip">{f.scheduled.split(' ')[0]}</span>}
          </div>
        </button>
      ))}
    </div>
  );
}

/* ---------- Variant C: Family Map (novel) ---------- */
function FamilyMap({ items, selected, onSelect }) {
  // Group by zone (cemetery zone) — novel: spatial layout of families across temple grounds
  const byZone = ZONES.map((z, i) => ({ zone: z, items: items.filter(it => it.zone === i) }));
  return (
    <div className="family-map">
      <div className="fm-legend">
        <span>境内マップ</span>
        <div className="fm-legend-keys">
          <span><i className="dot dot-blue" /> 直近1週以内</span>
          <span><i className="dot dot-amber" /> 1ヶ月以内</span>
          <span><i className="dot dot-gray" /> それ以前</span>
          <span><i className="dot dot-purple" /> 年忌予定あり</span>
        </div>
      </div>
      <div className="fm-grid">
        {byZone.map(({ zone, items }) => (
          <div key={zone} className="fm-zone">
            <div className="fm-zone-head">
              <h4>{zone}</h4>
              <span className="fm-zone-count">{items.length}家</span>
            </div>
            <div className="fm-zone-body">
              {items.length === 0 && <div className="fm-empty">登録なし</div>}
              {items.map(f => {
                const days = daysAgo(f.lastVisit);
                const tone = days <= 7 ? 'blue' : days <= 30 ? 'amber' : 'gray';
                return (
                  <button key={f.id}
                          className={'fm-cell tone-' + tone + (f.id === selected ? ' selected' : '')}
                          onClick={() => onSelect(f.id)}>
                    <div className="fm-cell-top">
                      <Kamon idx={f.kamon} size={20} />
                      <span className="fm-name">{f.name}</span>
                      {f.scheduled && <span className="fm-sched-mark" title={f.scheduled} />}
                    </div>
                    <div className="fm-cell-meta">{f.members}名 · {fmtRelativeDate(f.lastVisit)}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Detail panel ---------- */
function ParishDetail({ f, members }) {
  return (
    <>
      <header style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
        <div className="pd-top">
          <div className="pd-kamon"><Kamon idx={f.kamon} size={48} /></div>
          <div>
            <h3>{f.name}家</h3>
            <div className="detail-id">{f.id} · 加入 {f.joined}年 ({2026 - f.joined}年)</div>
          </div>
        </div>
      </header>
      <div className="detail-body">
        <div className="kv-list">
          <div className="kv"><span>戸主</span><b>{f.head}</b></div>
          <div className="kv"><span>宗派</span><b>{SECTS[f.sect]}</b></div>
          <div className="kv"><span>住所</span><b style={{ maxWidth: 220, textAlign: 'right', whiteSpace: 'normal', lineHeight: 1.4 }}>{f.addr}</b></div>
          <div className="kv"><span>電話</span><b>{f.phone}</b></div>
          <div className="kv"><span>墓地</span><b>{ZONES[f.zone]} 区画</b></div>
          <div className="kv"><span>最近のお参り</span><b>{f.lastVisit} ({fmtRelativeDate(f.lastVisit)})</b></div>
        </div>

        <div className="detail-section">
          <div className="ds-head">家族構成 <span>{members.length}名</span></div>
          <div className="member-list">
            {members.map((m, i) => (
              <div key={i} className={'member-row' + (m.deceased ? ' deceased' : '')}>
                <div className="m-rel">{m.relation}</div>
                <div className="m-info">
                  <div className="m-name">{m.name}{m.deceased && <span className="m-dec-mark">過去帳</span>}</div>
                  {m.deceased
                    ? <div className="m-sub">{m.kaimyo} · {m.date}</div>
                    : <div className="m-sub">{m.age}歳</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {f.scheduled && (
          <div className="detail-section">
            <div className="ds-head">直近の予定</div>
            <div className="scheduled-card">
              <div className="sc-ico"><Kamon idx={f.kamon} size={20} accent="#7C3AED" /></div>
              <div>
                <div className="sc-title">{f.scheduled}</div>
                <div className="sc-sub">年忌法要 · 案内未送信</div>
              </div>
              <button className="btn outline btn-sm">
                <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                案内送信
              </button>
            </div>
          </div>
        )}

        <div className="action-row">
          <button className="btn primary">
            <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
            編集
          </button>
          <button className="btn outline">
            <svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            過去帳を見る
          </button>
          <button className="btn ghost danger-text">
            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            削除
          </button>
        </div>
      </div>
    </>
  );
}

function NewParishDialog({ open, onClose, onSave }) {
  const [form, setForm] = React.useState({ name: '', head: '', sect: 0, members: 1, addr: '', phone: '', zone: 0, note: '' });
  React.useEffect(() => { if (open) setForm({ name: '', head: '', sect: 0, members: 1, addr: '', phone: '', zone: 0, note: '' }); }, [open]);
  if (!open) return null;
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.head) return;
    onSave(form);
  };
  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" style={{ width: 620 }} onClick={(e) => e.stopPropagation()}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>新規檀家登録</h3>
          <button className="x-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
          </button>
        </header>
        <form onSubmit={submit}>
          <div className="body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-field">
              <label>家名</label>
              <input className="input-plain" placeholder="例: 佐藤" value={form.name} onChange={(e) => upd('name', e.target.value)} />
            </div>
            <div className="form-field">
              <label>戸主名</label>
              <input className="input-plain" placeholder="例: 佐藤 一彦" value={form.head} onChange={(e) => upd('head', e.target.value)} />
            </div>
            <div className="form-field">
              <label>宗派</label>
              <select className="input-plain" value={form.sect} onChange={(e) => upd('sect', Number(e.target.value))}>
                {SECTS.map((s, i) => <option key={i} value={i}>{s}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>墓地区画</label>
              <select className="input-plain" value={form.zone} onChange={(e) => upd('zone', Number(e.target.value))}>
                {ZONES.map((z, i) => <option key={i} value={i}>{z}</option>)}
              </select>
            </div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>住所</label>
              <input className="input-plain" placeholder="例: 東京都品川区南品川3-12-4" value={form.addr} onChange={(e) => upd('addr', e.target.value)} />
            </div>
            <div className="form-field">
              <label>電話番号</label>
              <input className="input-plain" placeholder="例: 03-XXXX-XXXX" value={form.phone} onChange={(e) => upd('phone', e.target.value)} />
            </div>
            <div className="form-field">
              <label>家族構成 (人数)</label>
              <input className="input-plain" type="number" min="1" max="20" value={form.members} onChange={(e) => upd('members', Number(e.target.value))} />
            </div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>備考</label>
              <textarea className="input-plain" rows={3} placeholder="家系の経緯、注意事項などをご記入ください。" value={form.note} onChange={(e) => upd('note', e.target.value)} />
            </div>
          </div>
          <footer>
            <button type="button" className="btn outline" onClick={onClose}>キャンセル</button>
            <button type="submit" className="btn primary">保存</button>
          </footer>
        </form>
      </div>
    </div>
  );
}

Object.assign(window, { ParishionersPage, NewParishDialog });
