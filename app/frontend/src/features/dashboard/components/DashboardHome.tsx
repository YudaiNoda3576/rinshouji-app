// dashboard ホーム — ログイン後の概要ビュー。

export function DashboardHome() {
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
    </>
  );
}
