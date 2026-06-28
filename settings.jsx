// settings.jsx — 設定画面

const SETTINGS_NAV = [
  { key: 'temple',     label: '寺院情報',         icon: 'temple' },
  { key: 'services',   label: '法要・お布施',     icon: 'service' },
  { key: 'kinds',      label: '予定種別',         icon: 'kinds' },
  { key: 'templates',  label: '案内テンプレート', icon: 'template' },
  { key: 'staff',      label: '寺務員・権限',     icon: 'staff' },
  { key: 'integration',label: '外部連携',         icon: 'plug' },
  { key: 'notifications', label: '通知設定',      icon: 'bell' },
  { key: 'data',       label: 'データ・バックアップ', icon: 'data' },
  { key: 'security',   label: 'アカウント・セキュリティ', icon: 'lock' },
];

const SVC_ICON = {
  temple: (<svg viewBox="0 0 24 24"><path d="M12 2 L22 6 L12 10 L2 6 Z"/><path d="M4 10 V20 H20 V10"/><path d="M9 14 V20 M15 14 V20"/></svg>),
  service: (<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>),
  kinds: (<svg viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/><path d="M12 22a10 10 0 1 1 10-10 4 4 0 0 1-4 4h-2a2 2 0 0 0-1 4 1.5 1.5 0 0 1-1.5 2 8 8 0 0 1-1.5 0"/></svg>),
  template: (<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" x2="15" y1="13" y2="13"/><line x1="9" x2="15" y1="17" y2="17"/></svg>),
  staff: (<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
  plug: (<svg viewBox="0 0 24 24"><path d="M9 2v6M15 2v6"/><path d="M5 8h14v3a7 7 0 0 1-14 0z"/><path d="M12 18v4"/></svg>),
  bell: (<svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>),
  data: (<svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>),
  lock: (<svg viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>),
};

const SECT_OPTIONS = ['浄土真宗','曹洞宗','日蓮宗','真言宗','天台宗','臨済宗','時宗','黄檗宗'];
const KAIKI_YEARS = [1, 3, 7, 13, 17, 23, 27, 33, 50];

function SettingsPage({ initialSection }) {
  const [section, setSection] = React.useState(initialSection || 'temple');
  const [dirty, setDirty] = React.useState(false);
  React.useEffect(() => { if (initialSection) setSection(initialSection); }, [initialSection]);

  return (
    <div className="page-shell settings-page">
      <div className="page-head">
        <div>
          <h1>設定</h1>
          <p>寺院情報や案内テンプレート、寺務員の権限などをご管理いただけます。</p>
        </div>
        <div className="head-actions">
          {dirty && <span className="dirty-pill"><span className="dirty-dot"></span>未保存の変更があります</span>}
          <button className="btn ghost" type="button" onClick={() => setDirty(false)}>変更を破棄</button>
          <button className="btn primary" type="button" onClick={() => setDirty(false)} disabled={!dirty}>
            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            変更を保存
          </button>
        </div>
      </div>

      <div className="settings-body">
        <aside className="settings-nav card">
          {SETTINGS_NAV.map(n => (
            <button key={n.key}
                    className={'sn-item' + (section === n.key ? ' on' : '')}
                    onClick={() => setSection(n.key)}>
              <span className="sn-icon">{SVC_ICON[n.icon]}</span>
              <span className="sn-label">{n.label}</span>
            </button>
          ))}
        </aside>

        <div className="settings-content">
          {section === 'temple'        && <SectionTemple onChange={() => setDirty(true)} />}
          {section === 'services'      && <SectionServices onChange={() => setDirty(true)} />}
          {section === 'kinds'         && <SectionKinds onChange={() => setDirty(true)} />}
          {section === 'templates'     && <SectionTemplates onChange={() => setDirty(true)} />}
          {section === 'staff'         && <SectionStaff onChange={() => setDirty(true)} />}
          {section === 'integration'   && <SectionIntegration onChange={() => setDirty(true)} />}
          {section === 'notifications' && <SectionNotifications onChange={() => setDirty(true)} />}
          {section === 'data'          && <SectionData />}
          {section === 'security'      && <SectionSecurity onChange={() => setDirty(true)} />}
        </div>
      </div>
    </div>
  );
}

function SettingsHeader({ title, desc }) {
  return (
    <header className="sc-head">
      <h2>{title}</h2>
      <p>{desc}</p>
    </header>
  );
}

function Field({ label, hint, children, span }) {
  return (
    <div className={'field-row' + (span === 2 ? ' wide' : '')}>
      <label className="field-label">{label}{hint && <span className="field-hint">{hint}</span>}</label>
      <div className="field-control">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label, desc }) {
  return (
    <div className="toggle-row">
      <div className="toggle-text">
        <div className="toggle-l">{label}</div>
        {desc && <div className="toggle-d">{desc}</div>}
      </div>
      <button className={'toggle' + (checked ? ' on' : '')} onClick={() => onChange(!checked)} role="switch" aria-checked={checked}>
        <span className="toggle-knob"></span>
      </button>
    </div>
  );
}

/* ===== 予定種別 ===== */
function SectionKinds({ onChange }) {
  const [kinds, setKinds] = React.useState(() => (window.getEventKinds ? window.getEventKinds() : []));
  React.useEffect(() => {
    const h = () => setKinds([...(window.getEventKinds ? window.getEventKinds() : [])]);
    window.addEventListener('event-kinds-changed', h);
    return () => window.removeEventListener('event-kinds-changed', h);
  }, []);

  const MAX_KINDS = 8;
  const COLORS = ['#7C3AED', '#2563EB', '#059669', '#DC2626', '#D97706', '#0891B2', '#DB2777', '#6B7280'];

  const commit = (next) => {
    setKinds(next);
    if (window.setEventKinds) window.setEventKinds(next);
    onChange && onChange();
  };
  const update = (i, patch) => {
    const next = kinds.slice();
    const merged = { ...next[i], ...patch };
    if (patch.color) { delete merged.tint; delete merged.dark; }
    next[i] = merged;
    commit(next);
  };
  const remove = (i) => commit(kinds.filter((_, j) => j !== i));
  const add = () => {
    if (kinds.length >= MAX_KINDS) return;
    const key = 'custom-' + Math.random().toString(36).slice(2, 7);
    commit([...kinds, { key, label: '新しい種別', color: COLORS[kinds.length % COLORS.length] }]);
  };
  const atLimit = kinds.length >= MAX_KINDS;

  return (
    <section className="settings-card card">
      <SettingsHeader title="予定種別" desc="予定登録時に選択できる種別とテーマカラーを管理します。" />
      <div className="sc-body">
        <div className="kind-edit-list">
          {kinds.map((k, i) => (
            <div key={k.key} className="kind-edit-row">
              <div className="kind-edit-preview" style={{ background: deriveSet(k).tint, color: deriveSet(k).dark, borderLeft: `4px solid ${k.color}` }}>
                <span className="cal-chip-dot" style={{background: k.color}}></span>
                {k.label || '(無題)'}
              </div>
              <input
                className="input-plain kind-edit-name"
                value={k.label}
                placeholder="種別名"
                onChange={(e) => update(i, { label: e.target.value })}
              />
              <div className="kind-edit-colors">
                {COLORS.map(c => (
                  <button key={c} type="button"
                          className={'kind-color-swatch' + (c.toLowerCase() === (k.color || '').toLowerCase() ? ' on' : '')}
                          style={{ background: c }}
                          onClick={() => update(i, { color: c })}
                          aria-label={`色 ${c}`} />
                ))}
                <input type="color" className="kind-edit-color-input"
                       value={k.color || '#7C3AED'}
                       onChange={(e) => update(i, { color: e.target.value })}
                       title="カスタムカラー" />
              </div>
              <button className="icon-btn" onClick={() => remove(i)} disabled={k.builtin && kinds.length <= 1}
                      title={k.builtin ? '初期種別 (削除可)' : '削除'} aria-label="削除">
                <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span className="dim" style={{ fontSize: 12 }}>
            予定登録ダイアログの「種別を編集」ボタンからもここを開けます。
            <br />
            <span style={{ color: atLimit ? 'var(--temple-red)' : 'inherit', fontWeight: atLimit ? 600 : 400 }}>
              登録済 {kinds.length} / {MAX_KINDS}件 (最大{MAX_KINDS}件まで)
            </span>
          </span>
          <button className="btn outline" type="button" onClick={add} disabled={atLimit} title={atLimit ? `上限(${MAX_KINDS}件)に達しています` : ''}>
            <svg viewBox="0 0 24 24"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
            種別を追加
          </button>
        </div>
      </div>
    </section>
  );
}
function deriveSet(k) {
  if (k.tint && k.dark) return k;
  return {
    tint: `color-mix(in oklab, ${k.color} 16%, white)`,
    dark: `color-mix(in oklab, ${k.color} 78%, black)`,
  };
}

/* ===== 寺院情報 ===== */
function SectionTemple({ onChange }) {
  const [v, setV] = React.useState({
    name: '青苔山 浄妙寺',
    nameKana: 'せいたいざん じょうみょうじ',
    sect: '浄土真宗',
    abbot: '高橋 良観',
    founded: 1623,
    zip: '140-0004',
    addr: '東京都品川区南品川3-12-4',
    phone: '03-3458-0000',
    fax: '03-3458-0001',
    email: 'info@jomyo-ji.jp',
    web: 'https://jomyo-ji.jp',
  });
  const set = (k) => (e) => { setV({ ...v, [k]: e.target.value }); onChange(); };

  return (
    <section className="settings-card card">
      <SettingsHeader title="寺院情報" desc="案内状や領収書、システム表示に使用されます。" />

      <div className="sc-body">
        <div className="logo-row">
          <div className="logo-mark">
            <svg viewBox="0 0 60 60"><g fill="var(--temple-purple)"><path d="M30 4 L56 12 L30 20 L4 12 Z"/><rect x="10" y="20" width="40" height="4"/><rect x="6" y="46" width="48" height="8"/><rect x="14" y="24" width="6" height="22"/><rect x="40" y="24" width="6" height="22"/><rect x="26" y="24" width="8" height="22"/></g></svg>
          </div>
          <div className="logo-meta">
            <div className="field-label" style={{marginBottom: 6}}>寺紋・ロゴ画像</div>
            <div className="logo-actions">
              <button className="btn outline" type="button">画像を変更</button>
              <button className="btn ghost" type="button">初期に戻す</button>
            </div>
            <div className="logo-spec">推奨 200×200px / PNG・SVG / 1MB以内</div>
          </div>
        </div>

        <div className="field-grid">
          <Field label="寺院名"><input className="input-plain" value={v.name} onChange={set('name')} /></Field>
          <Field label="読みがな"><input className="input-plain" value={v.nameKana} onChange={set('nameKana')} /></Field>
          <Field label="宗派">
            <select className="input-plain" value={v.sect} onChange={set('sect')}>
              {SECT_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="現住職"><input className="input-plain" value={v.abbot} onChange={set('abbot')} /></Field>
          <Field label="開山年" hint="西暦"><input className="input-plain" type="number" value={v.founded} onChange={set('founded')} /></Field>
          <Field label="郵便番号"><input className="input-plain" value={v.zip} onChange={set('zip')} style={{maxWidth: 140}} /></Field>
          <Field label="住所" span={2}><input className="input-plain" value={v.addr} onChange={set('addr')} /></Field>
          <Field label="電話"><input className="input-plain" value={v.phone} onChange={set('phone')} /></Field>
          <Field label="FAX"><input className="input-plain" value={v.fax} onChange={set('fax')} /></Field>
          <Field label="メール"><input className="input-plain" value={v.email} onChange={set('email')} /></Field>
          <Field label="Webサイト"><input className="input-plain" value={v.web} onChange={set('web')} /></Field>
        </div>
      </div>
    </section>
  );
}

/* ===== 法要・お布施 ===== */
function SectionServices({ onChange }) {
  const [kaiki, setKaiki] = React.useState(new Set(KAIKI_YEARS));
  const [autoNotify, setAutoNotify] = React.useState(true);
  const [notifyDays, setNotifyDays] = React.useState(60);

  const [services, setServices] = React.useState([
    { name: '月命日法要',  fuse: '5,000円〜',  duration: 30, slot: 4 },
    { name: '年忌法要',    fuse: '30,000円〜', duration: 60, slot: 2 },
    { name: 'お盆参拝',    fuse: '3,000円〜',  duration: 20, slot: 8 },
    { name: 'お彼岸参拝',  fuse: '3,000円〜',  duration: 20, slot: 8 },
    { name: '葬儀',        fuse: '応相談',     duration: 120, slot: 1 },
  ]);

  return (
    <>
      <section className="settings-card card">
        <SettingsHeader title="年忌・案内自動化" desc="該当する年忌の自動抽出と案内送付の事前通知を設定します。" />
        <div className="sc-body">
          <div className="kaiki-grid">
            {KAIKI_YEARS.map(y => (
              <label key={y} className={'kaiki-chip-btn' + (kaiki.has(y) ? ' on' : '')}>
                <input type="checkbox" checked={kaiki.has(y)} onChange={() => {
                  const next = new Set(kaiki);
                  if (next.has(y)) next.delete(y); else next.add(y);
                  setKaiki(next); onChange();
                }} />
                <span className="kaiki-y">{y}</span>
                <span className="kaiki-l">{y === 1 ? '一周忌' : y + '回忌'}</span>
              </label>
            ))}
          </div>

          <div style={{marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8}}>
            <Toggle label="該当年忌を自動で集計する" desc="毎週月曜日に翌年分の年忌を更新します。" checked={autoNotify} onChange={(v) => { setAutoNotify(v); onChange(); }} />
            <div className="indent">
              <Field label="案内送付の事前通知" hint="法要日の何日前から">
                <div className="num-with-suffix">
                  <input className="input-plain" type="number" value={notifyDays} onChange={(e) => { setNotifyDays(e.target.value); onChange(); }} style={{width: 100}} />
                  <span>日前</span>
                </div>
              </Field>
            </div>
          </div>
        </div>
      </section>

      <section className="settings-card card">
        <SettingsHeader title="法要種別とお布施目安" desc="新規予約時の選択肢として表示されます。" />
        <div className="sc-body">
          <table className="svc-table">
            <thead><tr><th>法要種別</th><th>お布施目安</th><th>所要時間</th><th>1日の上限</th><th></th></tr></thead>
            <tbody>
              {services.map((s, i) => (
                <tr key={i}>
                  <td><input className="input-plain" value={s.name} onChange={(e) => { services[i].name = e.target.value; setServices([...services]); onChange(); }} /></td>
                  <td><input className="input-plain" value={s.fuse} onChange={(e) => { services[i].fuse = e.target.value; setServices([...services]); onChange(); }} /></td>
                  <td>
                    <div className="num-with-suffix">
                      <input className="input-plain" type="number" value={s.duration} onChange={(e) => { services[i].duration = e.target.value; setServices([...services]); onChange(); }} style={{width: 70}} />
                      <span>分</span>
                    </div>
                  </td>
                  <td>
                    <div className="num-with-suffix">
                      <input className="input-plain" type="number" value={s.slot} onChange={(e) => { services[i].slot = e.target.value; setServices([...services]); onChange(); }} style={{width: 70}} />
                      <span>件</span>
                    </div>
                  </td>
                  <td><button className="icon-btn" onClick={() => { setServices(services.filter((_, j) => j !== i)); onChange(); }} aria-label="削除"><svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn outline" type="button" onClick={() => { setServices([...services, { name: '', fuse: '', duration: 30, slot: 1 }]); onChange(); }}>
            <svg viewBox="0 0 24 24"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
            行を追加
          </button>
        </div>
      </section>
    </>
  );
}

/* ===== 案内テンプレート ===== */
function SectionTemplates({ onChange }) {
  const [active, setActive] = React.useState('kaiki-letter');
  const TEMPLATES = [
    { id: 'kaiki-letter', name: '年忌案内 (封書)',   channel: 'mail' },
    { id: 'kaiki-line',   name: '年忌案内 (LINE)',   channel: 'line' },
    { id: 'obon',         name: 'お盆参拝のご案内',  channel: 'mail' },
    { id: 'higan',        name: 'お彼岸参拝のご案内',channel: 'line' },
    { id: 'shotsuki',     name: '月命日リマインダー',channel: 'line' },
  ];
  const cur = TEMPLATES.find(t => t.id === active);
  const [body, setBody] = React.useState(`{{戸主名}} 様

時下ますます御清祥のこととお慶び申し上げます。

さて、来る {{法要日}} に
故 {{戒名}}（{{俗名}}）様の{{年忌}}法要を当山にて勤修いたしたく存じます。

つきましては、ご家族・ご親族の皆様にご参列いただきたく、ご案内申し上げます。

日時：{{法要日}} 午前10時30分より
場所：当山 本堂
御布施：お志
会食：法要後、本院にてお膳を用意いたします

合掌 {{寺院名}} 住職`);

  const VARS = ['{{戸主名}}', '{{戒名}}', '{{俗名}}', '{{法要日}}', '{{年忌}}', '{{寺院名}}', '{{住職名}}', '{{家名}}', '{{住所}}'];

  return (
    <section className="settings-card card">
      <SettingsHeader title="案内テンプレート" desc="変数は二重波括弧 {{ }} で挿入できます。送信時に自動置換されます。" />
      <div className="sc-body">
        <div className="tpl-layout">
          <div className="tpl-list">
            {TEMPLATES.map(t => (
              <button key={t.id} className={'tpl-row' + (active === t.id ? ' on' : '')} onClick={() => setActive(t.id)}>
                <span className={'tpl-channel ' + t.channel}>{t.channel === 'mail' ? '郵送' : 'LINE'}</span>
                <span className="tpl-name">{t.name}</span>
              </button>
            ))}
            <button className="btn outline tpl-add" onClick={() => onChange()}>
              <svg viewBox="0 0 24 24"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
              新しいテンプレート
            </button>
          </div>

          <div className="tpl-edit">
            <div className="tpl-edit-head">
              <input className="input-plain" defaultValue={cur.name} onChange={onChange} />
              <select className="input-plain" defaultValue={cur.channel} onChange={onChange} style={{width: 120}}>
                <option value="mail">郵送 / メール</option>
                <option value="line">LINE</option>
              </select>
            </div>
            <div className="tpl-vars">
              <span className="tpl-vars-l">挿入できる変数</span>
              {VARS.map(v => (
                <button key={v} className="tpl-var-chip" onClick={() => { setBody(body + ' ' + v); onChange(); }}>{v}</button>
              ))}
            </div>
            <textarea className="tpl-body" value={body} onChange={(e) => { setBody(e.target.value); onChange(); }} rows={14} />
            <div className="tpl-edit-foot">
              <span className="dim">{body.length}文字</span>
              <button className="btn ghost" type="button">プレビュー</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===== 寺務員・権限 ===== */
function SectionStaff({ onChange }) {
  const [staff, setStaff] = React.useState([
    { name: '高橋 良観', role: '主任住職', email: 'abbot@jomyo-ji.jp', perm: 'admin',    last: '2026-05-12 08:14' },
    { name: '中村 文隆', role: '住職',     email: 'naka@jomyo-ji.jp',  perm: 'admin',    last: '2026-05-11 19:02' },
    { name: '佐藤 慶順', role: '副住職',   email: 'sato@jomyo-ji.jp',  perm: 'staff',    last: '2026-05-11 16:30' },
    { name: '寺務員 太郎', role: '寺務員', email: 'office@jomyo-ji.jp',perm: 'staff',    last: '2026-05-10 18:42' },
    { name: '田村 啓子', role: '寺務員',   email: 'tamura@jomyo-ji.jp',perm: 'readonly', last: '2026-05-08 11:20' },
  ]);

  const ROLES = {
    admin:    { label: '管理者',     color: 'var(--temple-purple)', tint: 'var(--temple-purple-tint)' },
    staff:    { label: '一般スタッフ', color: 'var(--temple-blue)',  tint: 'var(--temple-blue-tint)' },
    readonly: { label: '閲覧のみ',   color: 'var(--temple-green)', tint: 'var(--temple-green-tint)' },
  };

  return (
    <section className="settings-card card">
      <SettingsHeader title="寺務員と権限" desc="システムにサインインできるアカウントを管理します。" />
      <div className="sc-body">
        <div className="staff-actions">
          <span className="dim">登録 {staff.length}名</span>
          <button className="btn primary" type="button">
            <svg viewBox="0 0 24 24"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
            寺務員を追加
          </button>
        </div>
        <table className="staff-table">
          <thead><tr><th>氏名</th><th>役職</th><th>メール</th><th>権限</th><th>最終ログイン</th><th></th></tr></thead>
          <tbody>
            {staff.map((s, i) => (
              <tr key={i}>
                <td>
                  <div className="staff-name">
                    <div className="staff-av">{s.name.slice(0, 1)}</div>
                    <span>{s.name}</span>
                  </div>
                </td>
                <td><span className="dim">{s.role}</span></td>
                <td className="dim mono">{s.email}</td>
                <td>
                  <span className="perm-chip" style={{background: ROLES[s.perm].tint, color: ROLES[s.perm].color}}>
                    {ROLES[s.perm].label}
                  </span>
                </td>
                <td className="dim mono">{s.last}</td>
                <td><button className="icon-btn" aria-label="編集"><svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ===== 外部連携 ===== */
function SectionIntegration({ onChange }) {
  const [line, setLine] = React.useState(true);
  const [mail, setMail] = React.useState(true);
  const [map, setMap] = React.useState(true);
  const [cal, setCal] = React.useState(false);

  return (
    <section className="settings-card card">
      <SettingsHeader title="外部サービスとの連携" desc="案内発信や地図表示などで連携する外部サービスを管理します。" />
      <div className="sc-body intg-list">
        <IntegrationRow icon="line" name="LINE公式アカウント" desc="檀家へのLINE案内発信に使用します。" status={line ? 'connected' : 'off'} channel="@jomyo-ji" onToggle={() => { setLine(!line); onChange(); }} />
        <IntegrationRow icon="mail" name="メール送信サーバー (SMTP)" desc="案内メール、領収書PDFの送信に使用します。" status={mail ? 'connected' : 'off'} channel="smtp.sakura.ne.jp" onToggle={() => { setMail(!mail); onChange(); }} />
        <IntegrationRow icon="map"  name="地図表示サービス" desc="檀家地図の表示に使用します。" status={map ? 'connected' : 'off'} channel="Google Maps Platform" onToggle={() => { setMap(!map); onChange(); }} />
        <IntegrationRow icon="cal"  name="Googleカレンダー" desc="法要予定をGoogleカレンダーと双方向同期します。" status={cal ? 'connected' : 'off'} channel={cal ? 'jomyo-ji@gmail.com' : '未連携'} onToggle={() => { setCal(!cal); onChange(); }} />
      </div>
    </section>
  );
}

function IntegrationRow({ icon, name, desc, status, channel, onToggle }) {
  const ICONS = {
    line: { bg: '#06C755', el: <path d="M12 2C6.5 2 2 5.6 2 10c0 4 3.7 7.3 8.7 7.9.3.1.7.2.8.5.1.2.1.6.1.8l-.1.7c0 .2-.2.9.8.5.9-.4 5.1-3 7-5.2 1.3-1.4 1.7-2.9 1.7-4.7 0-4.4-4.5-8-10-8z" fill="white"/> },
    mail: { bg: 'var(--temple-blue)', el: <><rect width="20" height="16" x="2" y="4" rx="2" fill="none" stroke="white" strokeWidth="2"/><path d="m22 7-10 5L2 7" fill="none" stroke="white" strokeWidth="2"/></> },
    map:  { bg: 'var(--temple-red)',  el: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="none" stroke="white" strokeWidth="2"/><circle cx="12" cy="10" r="3" fill="none" stroke="white" strokeWidth="2"/></> },
    cal:  { bg: 'var(--temple-green)', el: <><rect width="18" height="18" x="3" y="4" rx="2" fill="none" stroke="white" strokeWidth="2"/><line x1="16" x2="16" y1="2" y2="6" stroke="white" strokeWidth="2"/><line x1="8" x2="8" y1="2" y2="6" stroke="white" strokeWidth="2"/><line x1="3" x2="21" y1="10" y2="10" stroke="white" strokeWidth="2"/></> },
  };
  const I = ICONS[icon];
  return (
    <div className="intg-row">
      <div className="intg-icon" style={{background: I.bg}}>
        <svg viewBox="0 0 24 24">{I.el}</svg>
      </div>
      <div className="intg-info">
        <div className="intg-name">{name}</div>
        <div className="intg-desc">{desc}</div>
        <div className="intg-channel">
          <span className={'intg-status ' + status}>
            <span className="intg-dot"></span>
            {status === 'connected' ? '連携中' : '未連携'}
          </span>
          <span className="intg-ch mono">{channel}</span>
        </div>
      </div>
      <div className="intg-actions">
        <button className="btn outline" type="button">設定</button>
        <button className={'btn ' + (status === 'connected' ? 'ghost' : 'primary')} type="button" onClick={onToggle}>
          {status === 'connected' ? '解除' : '連携する'}
        </button>
      </div>
    </div>
  );
}

/* ===== 通知設定 ===== */
function SectionNotifications({ onChange }) {
  const [s, setS] = React.useState({
    todayVisits: true,
    upcomingKaiki: true,
    responseAlert: true,
    weeklyReport: false,
    method: 'app',
    digestTime: '08:00',
  });
  const set = (k, v) => { setS({ ...s, [k]: v }); onChange(); };

  return (
    <section className="settings-card card">
      <SettingsHeader title="通知設定" desc="ダッシュボードや寺務員への通知タイミングを設定します。" />
      <div className="sc-body">
        <div className="toggle-list">
          <Toggle label="本日の参拝予定の朝の通知" desc="毎朝、その日のお参り予定をまとめてお知らせします。" checked={s.todayVisits} onChange={(v) => set('todayVisits', v)} />
          <Toggle label="年忌法要の事前リマインド" desc="該当する年忌の60日前にお知らせします。" checked={s.upcomingKaiki} onChange={(v) => set('upcomingKaiki', v)} />
          <Toggle label="檀家からの返答通知" desc="LINE案内に出欠連絡があった際に通知します。" checked={s.responseAlert} onChange={(v) => set('responseAlert', v)} />
          <Toggle label="週次レポート" desc="毎週月曜日に先週の活動サマリをメール送信します。" checked={s.weeklyReport} onChange={(v) => set('weeklyReport', v)} />
        </div>

        <div className="field-grid" style={{marginTop: 20}}>
          <Field label="通知方法">
            <div className="seg">
              <button className={'seg-btn' + (s.method === 'app' ? ' on' : '')} onClick={() => set('method', 'app')}>アプリ内</button>
              <button className={'seg-btn' + (s.method === 'mail' ? ' on' : '')} onClick={() => set('method', 'mail')}>メール</button>
              <button className={'seg-btn' + (s.method === 'both' ? ' on' : '')} onClick={() => set('method', 'both')}>両方</button>
            </div>
          </Field>
          <Field label="朝の通知時刻">
            <input className="input-plain" type="time" value={s.digestTime} onChange={(e) => set('digestTime', e.target.value)} style={{width: 140}} />
          </Field>
        </div>
      </div>
    </section>
  );
}

/* ===== データ・バックアップ ===== */
function SectionData() {
  return (
    <>
      <section className="settings-card card">
        <SettingsHeader title="データ出力" desc="管理データをCSV / PDFで一括出力できます。" />
        <div className="sc-body data-grid">
          {[
            { label: '檀家一覧', count: '248件', icon: 'parish' },
            { label: '過去帳',   count: '1,284件', icon: 'memorial' },
            { label: 'お参り記録', count: '4,612件', icon: 'visit' },
            { label: '法要予定', count: '156件', icon: 'sched' },
          ].map((it, i) => (
            <div key={i} className="data-card">
              <div className="data-l">{it.label}</div>
              <div className="data-c">{it.count}</div>
              <div className="data-actions">
                <button className="btn ghost sm" type="button">CSV</button>
                <button className="btn ghost sm" type="button">PDF</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="settings-card card">
        <SettingsHeader title="バックアップ" desc="日次で自動バックアップを行っています。" />
        <div className="sc-body">
          <div className="bk-status">
            <div>
              <div className="bk-l">最終バックアップ</div>
              <div className="bk-v">2026年5月12日 03:00<span className="ok-pill">成功</span></div>
            </div>
            <button className="btn outline" type="button">今すぐバックアップ</button>
          </div>
          <table className="bk-table">
            <thead><tr><th>日時</th><th>サイズ</th><th>状態</th><th></th></tr></thead>
            <tbody>
              {[
                ['2026-05-12 03:00', '142 MB', 'success'],
                ['2026-05-11 03:00', '141 MB', 'success'],
                ['2026-05-10 03:00', '141 MB', 'success'],
                ['2026-05-09 03:00', '140 MB', 'success'],
                ['2026-05-08 03:00', '139 MB', 'success'],
              ].map(([d, sz, st], i) => (
                <tr key={i}>
                  <td className="mono">{d}</td>
                  <td className="mono">{sz}</td>
                  <td><span className="ok-pill sm">成功</span></td>
                  <td><button className="btn ghost sm" type="button">復元</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

/* ===== アカウント・セキュリティ ===== */
function SectionSecurity({ onChange }) {
  const [twofa, setTwofa] = React.useState(true);
  const [sessTimeout, setSessTimeout] = React.useState(30);

  return (
    <>
      <section className="settings-card card">
        <SettingsHeader title="ログインアカウント" desc="ご自身のアカウントに関する設定です。" />
        <div className="sc-body">
          <div className="field-grid">
            <Field label="氏名"><input className="input-plain" defaultValue="寺務員 太郎" onChange={onChange} /></Field>
            <Field label="ログインID"><input className="input-plain" defaultValue="tera-admin" disabled /></Field>
            <Field label="メール"><input className="input-plain" defaultValue="office@jomyo-ji.jp" onChange={onChange} /></Field>
            <Field label="パスワード">
              <button className="btn outline" type="button">パスワードを変更</button>
            </Field>
          </div>
        </div>
      </section>

      <section className="settings-card card">
        <SettingsHeader title="セキュリティ" desc="不正アクセスを防ぐための設定です。" />
        <div className="sc-body">
          <Toggle label="二段階認証" desc="ログイン時にメールへワンタイムコードを送信します。" checked={twofa} onChange={(v) => { setTwofa(v); onChange(); }} />
          <Field label="自動ログアウト" hint="無操作で">
            <div className="num-with-suffix">
              <input className="input-plain" type="number" value={sessTimeout} onChange={(e) => { setSessTimeout(e.target.value); onChange(); }} style={{width: 100}} />
              <span>分</span>
            </div>
          </Field>
        </div>
      </section>

      <section className="settings-card card danger">
        <SettingsHeader title="アカウントの削除" desc="この操作は取り消せません。すべての関連データが削除されます。" />
        <div className="sc-body">
          <button className="btn danger" type="button">アカウントを削除する</button>
        </div>
      </section>
    </>
  );
}

Object.assign(window, { SettingsPage });
