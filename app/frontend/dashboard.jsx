// dashboard.jsx — minimal post-login staff console preview

function Dashboard({ active, onLogout, onToast, accent, parishVariant }) {
  const [page, setPage] = React.useState('home');
  const [showNewVisit, setShowNewVisit] = React.useState(false);
  const [showNewParish, setShowNewParish] = React.useState(false);
  const [showNewMemorial, setShowNewMemorial] = React.useState(false);
  const [showNewSchedule, setShowNewSchedule] = React.useState(false);
  const [settingsInitialSection, setSettingsInitialSection] = React.useState('temple');
  const openSettingsAt = (section) => { setSettingsInitialSection(section); setPage('settings'); setMobileNavOpen(false); };
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const closeMobileNav = () => setMobileNavOpen(false);
  const gotoPage = (key) => { setPage(key); setMobileNavOpen(false); };

  const NAV = [
  { key: 'home', label: 'ダッシュボード', icon: <svg viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
  { key: 'schedule', label: '予定管理', icon: <svg viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg> },
  { key: 'visits', label: 'お参り記録', icon: <svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9" /><path d="M3 5v4h4" /><path d="M12 7v5l3 2" /></svg> },
  { key: 'parish', label: '檀家管理', icon: <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
  { key: 'memorial', label: '過去帳', icon: <svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg> }];

  const ADMIN_NAV = [
  { key: 'notices', label: '年忌案内', icon: <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg> },
  { key: 'map', label: '檀家地図', icon: <svg viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" x2="8" y1="2" y2="18" /><line x1="16" x2="16" y1="6" y2="22" /></svg> },
  { key: 'settings', label: '設定', icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg> }];


  const screenLabel = page === 'visits' ? '05 お参り記録一覧' : page === 'parish' ? '06 檀家管理' : page === 'memorial' ? '07 過去帳' : page === 'schedule' ? '08 予定管理' : page === 'notices' ? '09 年忌案内の自動集計' : page === 'map' ? '10 檀家地図' : page === 'settings' ? '11 設定' : '04 ダッシュボード (ログイン後)';

  const pageTitle = page === 'visits' ? 'お参り記録' : page === 'parish' ? '檀家管理' : page === 'memorial' ? '過去帳' : page === 'schedule' ? '予定管理' : page === 'notices' ? '年忌案内' : page === 'map' ? '檀家地図' : page === 'settings' ? '設定' : 'ダッシュボード';

  return (
    <div className="dash-stage" data-active={active ? '1' : '0'} data-screen-label={screenLabel}>
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button className="mobile-hamburger" onClick={() => setMobileNavOpen(true)} aria-label="メニューを開く">
          <svg viewBox="0 0 24 24"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
        </button>
        <div className="mobile-title">
          <div className="mt-brand"><BrandIcon /></div>
          <span>{pageTitle}</span>
        </div>
        {page === 'schedule' ?
        <button className="mobile-today-btn" type="button" aria-label="今日に戻る"
        onClick={() => window.dispatchEvent(new CustomEvent('schedule:go-today'))}>
          <svg viewBox="0 0 24 24">
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <text x="12" y="17.5" textAnchor="middle">{window.SCHEDULE_TODAY_ISO ? parseInt(window.SCHEDULE_TODAY_ISO.slice(8), 10) : new Date().getDate()}</text>
          </svg>
        </button> :
        <div className="mobile-spacer" />}
      </div>

      {/* Mobile drawer overlay */}
      {mobileNavOpen && <div className="mobile-nav-overlay" onClick={closeMobileNav}></div>}

      <aside className={'dash-sidebar' + (mobileNavOpen ? ' open' : '')}>
        <div className="brand">
          <div className="brand-mark"><BrandIcon /></div>
          <div className="brand-name">寺院管理<span className="sub">Staff Console</span></div>
          <button className="mobile-nav-close" onClick={closeMobileNav} aria-label="閉じる">
            <svg viewBox="0 0 24 24"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
          </button>
        </div>
        <div className="me">
          <div className="av">寺</div>
          <div>
            <div className="n">寺務員 太郎</div>
            <div className="r">tera-admin</div>
          </div>
        </div>
        <nav>
          {NAV.map((n) =>
          <div key={n.key}
          className={'nav-item' + (page === n.key ? ' active' : '') + (n.disabled ? ' disabled' : '')}
          onClick={() => !n.disabled && gotoPage(n.key)}>
              {n.icon}{n.label}
            </div>
          )}
          <div className="section-label">管理機能</div>
          {ADMIN_NAV.map((n) =>
          <div key={n.key}
          className={'nav-item' + (page === n.key ? ' active' : '') + (n.disabled ? ' disabled' : '')}
          onClick={() => !n.disabled && gotoPage(n.key)}>
              {n.icon}{n.label}
            </div>
          )}
        </nav>
        <div className="foot">
          <div className="nav-item danger" onClick={onLogout}>
            <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
            サインアウト
          </div>
        </div>
      </aside>

      <main className="dash-main">
        {page === 'visits' ?
        <>
            <VisitsPage onOpenNew={() => setShowNewVisit(true)} />
            <NewVisitDialog open={showNewVisit} onClose={() => setShowNewVisit(false)}
          onSave={(form) => {setShowNewVisit(false);onToast && onToast({ kind: 'success', title: 'お参りを登録しました。', desc: form.family + ' / ' + (form.name || '記名なし') });}} />
          </> :
        page === 'parish' ?
        <>
            <ParishionersPage variant={parishVariant || 'table'} onOpenNew={() => setShowNewParish(true)} />
            <NewParishDialog open={showNewParish} onClose={() => setShowNewParish(false)}
          onSave={(form) => {setShowNewParish(false);onToast && onToast({ kind: 'success', title: '檀家を登録しました。', desc: form.name + '家 / ' + form.head });}} />
          </> :
        page === 'memorial' ?
        <>
            <MemorialPage onOpenNew={() => setShowNewMemorial(true)} />
            <NewMemorialDialog open={showNewMemorial} onClose={() => setShowNewMemorial(false)}
          onSave={(form) => {setShowNewMemorial(false);onToast && onToast({ kind: 'success', title: '過去帳に登録しました。', desc: (form.prefix + ' ' + form.name + ' ' + form.rank).trim() + ' / ' + form.secular });}} />
          </> :
        page === 'schedule' ?
        <>
            <SchedulePage onOpenNew={() => setShowNewSchedule(true)} onOpenSettings={openSettingsAt} />
            <NewScheduleDialog open={showNewSchedule} onClose={() => setShowNewSchedule(false)}
          onOpenSettings={openSettingsAt}
          onSave={(form) => {setShowNewSchedule(false);onToast && onToast({ kind: 'success', title: '予定を追加しました。', desc: form.title + ' / ' + form.date + ' ' + form.time });}} />
          </> :
        page === 'notices' ?
        <NoticesPage /> :
        page === 'map' ?
        <ParishMapPage /> :
        page === 'settings' ?
        <SettingsPage initialSection={settingsInitialSection} /> :

        <DashboardHome onJumpToVisits={() => setPage('visits')} />
        }
      </main>
    </div>);

}

function DashboardHome({ onJumpToVisits }) {
  return (
    <>
        <div className="dash-head">
          <div>
            <h1>寺院管理システムへようこそ。</h1>
            <p>本日の概要をご確認いただけます。</p>
          </div>
          <div className="who">
            <b>寺務員 太郎 様</b>
            最終ログイン 2026年5月10日 18:42
          </div>
        </div>

        <div className="stats4">
          <div className="stat-card">
            <div className="tile blue"><svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9" /><path d="M3 5v4h4" /><path d="M12 7v5l3 2" /></svg></div>
            <div>
              <div className="label">本日のお参り</div>
              <div className="value">12</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="tile green"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></div>
            <div>
              <div className="label">檀家総数</div>
              <div className="value">248</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="tile purple"><svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg></div>
            <div>
              <div className="label">過去帳記録数</div>
              <div className="value">1,284</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="tile red"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg></div>
            <div>
              <div className="label">寺務員数</div>
              <div className="value">6</div>
            </div>
          </div>
        </div>

        <div className="row-cards">
          <section className="card-block">
            <header><h3>最近のお参り</h3><a href="#" onClick={(e) => e.preventDefault()}>すべて表示</a></header>
            <ul>
              <li>
                <div className="who">
                  <div className="av-sm blue"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></div>
                  <div><div className="name">佐藤 千恵子 様</div><div className="meta">月命日 法要</div></div>
                </div>
                <div className="date">本日 10:30</div>
              </li>
              <li>
                <div className="who">
                  <div className="av-sm"><svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg></div>
                  <div><div className="name">田中家</div><div className="meta">お盆 参拝</div></div>
                </div>
                <div className="date">本日 09:10</div>
              </li>
              <li>
                <div className="who">
                  <div className="av-sm"><svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg></div>
                  <div><div className="name">高橋家</div><div className="meta">三回忌 法要</div></div>
                </div>
                <div className="date">昨日 16:00</div>
              </li>
              <li>
                <div className="who">
                  <div className="av-sm blue"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></div>
                  <div><div className="name">山本 義信 様</div><div className="meta">月命日 法要</div></div>
                </div>
                <div className="date">5月9日 11:00</div>
              </li>
            </ul>
          </section>

          <section className="card-block">
            <header><h3>今月の年忌法要</h3><a href="#" onClick={(e) => e.preventDefault()}>すべて表示</a></header>
            <ul>
              <li>
                <div className="who">
                  <div className="av-sm"><svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg></div>
                  <div><div className="name">釈 浄信</div><div className="meta">七回忌 / 佐藤家</div></div>
                </div>
                <div className="date">5月18日</div>
              </li>
              <li>
                <div className="who">
                  <div className="av-sm"><svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg></div>
                  <div><div className="name">釈尼 妙心</div><div className="meta">十三回忌 / 田中家</div></div>
                </div>
                <div className="date">5月22日</div>
              </li>
              <li>
                <div className="who">
                  <div className="av-sm"><svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg></div>
                  <div><div className="name">釈 慈光</div><div className="meta">三十三回忌 / 高橋家</div></div>
                </div>
                <div className="date">5月29日</div>
              </li>
            </ul>
          </section>
        </div>
      </>);

}

Object.assign(window, { Dashboard });
