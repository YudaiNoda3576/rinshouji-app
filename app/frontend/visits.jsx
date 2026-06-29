// visits.jsx — お参り一覧機能 (visit list page) + detail panel + new dialog

const VISITORS = [
  '佐藤 千恵子','田中 一郎','高橋 美和','山本 義信','鈴木 道夫','伊藤 京子','渡辺 静江','中村 純一',
  '小林 麗子','加藤 信吾','吉田 とき子','山田 健作','佐々木 史','松本 紀子','井上 幸雄','木村 義行',
  '清水 美智子','林 慶介','斎藤 久子','池田 直樹','岡田 結花','石川 弘','前田 信子','藤田 善男',
];
const FAMILIES = ['佐藤家','田中家','高橋家','山本家','鈴木家','伊藤家','渡辺家','中村家','小林家','加藤家','吉田家','山田家'];
const KINDS = [
  { key: 'monthly',   label: '月命日',     color: 'blue' },
  { key: 'memorial',  label: '年忌法要',   color: 'purple' },
  { key: 'obon',      label: 'お盆',       color: 'green' },
  { key: 'higan',     label: 'お彼岸',     color: 'green' },
  { key: 'visit',     label: '一般参拝',   color: 'gray' },
];
const STATUS = [
  { key: 'done',      label: '完了',       color: 'green' },
  { key: 'scheduled', label: '予定',       color: 'blue' },
  { key: 'cancelled', label: '中止',       color: 'gray' },
];

// Deterministic-ish data
function buildVisits() {
  const arr = [];
  const base = new Date(2026, 4, 11); // May 11, 2026
  for (let i = 0; i < 28; i++) {
    const k = KINDS[i % KINDS.length];
    const s = i < 3 ? STATUS[1] : (i % 9 === 0 ? STATUS[2] : STATUS[0]);
    const d = new Date(base);
    d.setDate(base.getDate() - (i - 3));
    const hour = 8 + (i * 3) % 9;
    const min = (i * 17) % 60;
    arr.push({
      id: 'V-' + (1024 + i),
      date: d,
      hour, min,
      name: VISITORS[i % VISITORS.length] + ' 様',
      family: FAMILIES[i % FAMILIES.length],
      kind: k,
      status: s,
      offering: [5000, 10000, 30000, 50000, 0][i % 5],
      note: ['','お茶のご用意あり。','ご家族3名でご来寺。','読経のみ。','次回ご予約あり。'][i % 5],
      handler: ['寺務員 太郎','寺務員 花子','住職'][i % 3],
    });
  }
  return arr;
}

const fmtJDate = (d) => {
  const days = ['日','月','火','水','木','金','土'];
  return `${d.getMonth()+1}月${d.getDate()}日(${days[d.getDay()]})`;
};
const fmtYen = (n) => n === 0 ? '—' : '¥' + n.toLocaleString();
const fmtTime = (h, m) => `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
const isToday = (d) => {
  const t = new Date(2026, 4, 11);
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
};

function VisitsPage({ accent, onOpenNew }) {
  const all = React.useMemo(buildVisits, []);
  const [q, setQ] = React.useState('');
  const [kindFilter, setKindFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [selectedId, setSelectedId] = React.useState(all[0].id);
  const [page, setPage] = React.useState(1);
  const perPage = 12;

  const filtered = all.filter(v =>
    (kindFilter === 'all' || v.kind.key === kindFilter) &&
    (statusFilter === 'all' || v.status.key === statusFilter) &&
    (q === '' || v.name.includes(q) || v.family.includes(q) || v.id.toLowerCase().includes(q.toLowerCase()))
  );
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const cur = Math.min(page, pages);
  const visible = filtered.slice((cur - 1) * perPage, cur * perPage);
  const selected = all.find(v => v.id === selectedId) || filtered[0];

  return (
    <div className="visits-page">
      <div className="page-head">
        <div>
          <h1>お参り記録</h1>
          <p>寺院でのお参り、法要、お布施の記録と管理を行います。</p>
        </div>
        <div className="head-actions">
          <button className="btn outline">
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            CSV書き出し
          </button>
          <button className="btn primary" onClick={onOpenNew}>
            <svg viewBox="0 0 24 24"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
            お参りを登録
          </button>
        </div>
      </div>

      <div className="visits-tools">
        <div className="search-wrap">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
          <input placeholder="氏名・家名・記録IDで検索" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
        <ChipGroup
          label="種別"
          value={kindFilter}
          options={[{ key: 'all', label: 'すべて' }, ...KINDS.map(k => ({ key: k.key, label: k.label }))]}
          onChange={(v) => { setKindFilter(v); setPage(1); }}
        />
        <ChipGroup
          label="状態"
          value={statusFilter}
          options={[{ key: 'all', label: 'すべて' }, ...STATUS.map(s => ({ key: s.key, label: s.label }))]}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
        />
        <div className="count">{filtered.length}件</div>
      </div>

      <div className="visits-body">
        <div className="visits-table card-block">
          <div className="vtbl">
            <div className="vt-head">
              <div className="c-date">日時</div>
              <div className="c-who">参拝者 / 家</div>
              <div className="c-kind">種別</div>
              <div className="c-status">状態</div>
              <div className="c-amt">お布施</div>
            </div>
            {visible.map(v => (
              <div key={v.id}
                   className={'vt-row' + (v.id === selectedId ? ' selected' : '')}
                   onClick={() => setSelectedId(v.id)}>
                <div className="c-date">
                  <div className="d-main">{fmtJDate(v.date)}{isToday(v.date) && <span className="today-pill">本日</span>}</div>
                  <div className="d-sub">{fmtTime(v.hour, v.min)}</div>
                </div>
                <div className="c-who">
                  <div className="w-name">{v.name}</div>
                  <div className="w-sub">{v.family} · {v.id}</div>
                </div>
                <div className="c-kind"><Pill color={v.kind.color}>{v.kind.label}</Pill></div>
                <div className="c-status"><StatusDot status={v.status} /></div>
                <div className="c-amt">{fmtYen(v.offering)}</div>
              </div>
            ))}
            {visible.length === 0 && (
              <div className="vt-empty">該当するお参り記録はありません。</div>
            )}
          </div>
          <div className="vt-foot">
            <div>{filtered.length === 0 ? 0 : ((cur - 1) * perPage + 1)} – {Math.min(cur * perPage, filtered.length)} / {filtered.length}件</div>
            <div className="pager">
              <button className="btn outline btn-sm" disabled={cur === 1} onClick={() => setPage(cur - 1)}>
                <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <span className="page-num">{cur} / {pages}</span>
              <button className="btn outline btn-sm" disabled={cur === pages} onClick={() => setPage(cur + 1)}>
                <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
        </div>

        <aside className="visit-detail card-block">
          {selected ? <VisitDetail v={selected} /> : <div className="vt-empty">記録を選択してください。</div>}
        </aside>
      </div>
    </div>
  );
}

function VisitDetail({ v }) {
  return (
    <>
      <header style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
        <div className="detail-id">{v.id}</div>
        <h3>{v.name}</h3>
      </header>
      <div className="detail-body">
        <div className="kv-list">
          <div className="kv"><span>家名</span><b>{v.family}</b></div>
          <div className="kv"><span>日付</span><b>{fmtJDate(v.date)}</b></div>
          <div className="kv"><span>時刻</span><b>{fmtTime(v.hour, v.min)}</b></div>
          <div className="kv"><span>種別</span><b><Pill color={v.kind.color}>{v.kind.label}</Pill></b></div>
          <div className="kv"><span>状態</span><b><StatusDot status={v.status} /></b></div>
          <div className="kv"><span>お布施</span><b>{fmtYen(v.offering)}</b></div>
          <div className="kv"><span>対応者</span><b>{v.handler}</b></div>
        </div>
        <div className="note-block">
          <div className="l">メモ</div>
          <p>{v.note || '—'}</p>
        </div>
        <div className="action-row">
          <button className="btn primary">
            <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
            編集
          </button>
          <button className="btn ghost danger-text">
            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
            削除
          </button>
        </div>
      </div>
    </>
  );
}

function Pill({ color, children }) {
  return <span className={'pill pill-' + color}>{children}</span>;
}
function StatusDot({ status }) {
  return <span className={'status-dot status-' + status.color}><i />{status.label}</span>;
}
function ChipGroup({ label, value, options, onChange }) {
  return (
    <div className="chip-group">
      <span className="cg-label">{label}</span>
      <div className="cg-track">
        {options.map(o => (
          <button key={o.key}
                  className={'cg-btn' + (o.key === value ? ' on' : '')}
                  onClick={() => onChange(o.key)}>{o.label}</button>
        ))}
      </div>
    </div>
  );
}

function NewVisitDialog({ open, onClose, onSave }) {
  const [form, setForm] = React.useState({ family: '', name: '', date: '2026-05-11', time: '10:30', kind: 'monthly', offering: '', note: '' });
  React.useEffect(() => { if (open) setForm({ family: '', name: '', date: '2026-05-11', time: '10:30', kind: 'monthly', offering: '', note: '' }); }, [open]);
  if (!open) return null;
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = (e) => {
    e.preventDefault();
    if (!form.family || !form.name) return;
    onSave(form);
  };
  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" style={{ width: 540 }} onClick={(e) => e.stopPropagation()}>
        <header style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h3>お参りを登録</h3>
          <button className="x-btn" onClick={onClose} aria-label="閉じる">
            <svg viewBox="0 0 24 24"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
          </button>
        </header>
        <form onSubmit={submit}>
          <div className="body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>家名</label>
              <input className="input-plain" placeholder="例: 佐藤家" value={form.family} onChange={(e) => upd('family', e.target.value)} />
            </div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>参拝者名</label>
              <input className="input-plain" placeholder="例: 佐藤 千恵子 様" value={form.name} onChange={(e) => upd('name', e.target.value)} />
            </div>
            <div className="form-field">
              <label>日付</label>
              <input className="input-plain" type="date" value={form.date} onChange={(e) => upd('date', e.target.value)} />
            </div>
            <div className="form-field">
              <label>時刻</label>
              <input className="input-plain" type="time" value={form.time} onChange={(e) => upd('time', e.target.value)} />
            </div>
            <div className="form-field">
              <label>種別</label>
              <select className="input-plain" value={form.kind} onChange={(e) => upd('kind', e.target.value)}>
                {KINDS.map(k => <option key={k.key} value={k.key}>{k.label}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>お布施 (円)</label>
              <input className="input-plain" type="number" placeholder="0" value={form.offering} onChange={(e) => upd('offering', e.target.value)} />
            </div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label>メモ</label>
              <textarea className="input-plain" rows={3} placeholder="お参りに関する備考をご記入ください。" value={form.note} onChange={(e) => upd('note', e.target.value)} />
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

Object.assign(window, { VisitsPage, NewVisitDialog });
