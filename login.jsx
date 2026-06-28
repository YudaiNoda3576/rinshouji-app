// login.jsx — three login layout variants + shared form

const useNow = () => {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
};

const fmtClock = (d) => `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
const fmtDate = (d) => {
  const days = ['日','月','火','水','木','金','土'];
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 (${days[d.getDay()]})`;
};
const greetingFor = (h) => {
  if (h < 5) return 'お疲れさまです';
  if (h < 11) return 'おはようございます';
  if (h < 17) return 'こんにちは';
  return 'お疲れさまです';
};

function LoginForm({ state, onSubmit, accent }) {
  // state: {id, pw, idErr, pwErr, formErr, submitting}
  const [id, setId] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [showPw, setShowPw] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [errs, setErrs] = React.useState({ id: '', pw: '', form: '' });
  const [submitting, setSubmitting] = React.useState(false);
  const [shake, setShake] = React.useState(false);

  // External demo states
  React.useEffect(() => {
    if (state === 'error') {
      setErrs({ id: '', pw: '', form: '認証情報が正しくありません。' });
      setShake(true); setTimeout(() => setShake(false), 500);
    } else if (state === 'loading') {
      setSubmitting(true); setErrs({ id: '', pw: '', form: '' });
    } else {
      setErrs({ id: '', pw: '', form: '' }); setSubmitting(false);
    }
  }, [state]);

  const handle = (e) => {
    e.preventDefault();
    const newErrs = { id: '', pw: '', form: '' };
    if (!id.trim()) newErrs.id = '寺務員IDを入力してください。';
    if (!pw) newErrs.pw = 'パスワードを入力してください。';
    if (newErrs.id || newErrs.pw) {
      setErrs(newErrs);
      setShake(true); setTimeout(() => setShake(false), 500);
      return;
    }
    setSubmitting(true);
    setErrs({ id: '', pw: '', form: '' });
    setTimeout(() => {
      const ok = id.trim() === 'tera-admin' && pw === 'temple2024';
      if (ok) {
        onSubmit({ ok: true, user: { id: id.trim() } });
      } else {
        setSubmitting(false);
        setErrs({ id: '', pw: '', form: '認証情報が正しくありません。再度ご確認ください。' });
        setShake(true); setTimeout(() => setShake(false), 500);
        onSubmit({ ok: false });
      }
    }, 1100);
  };

  const fillDemo = () => { setId('tera-admin'); setPw('temple2024'); };

  return (
    <form onSubmit={handle} className={shake ? 'shake' : ''} noValidate>
      <div className="field">
        <label htmlFor="id">寺務員ID</label>
        <div className={'input-wrap' + (errs.id ? ' error' : '')}>
          <svg className="lead-icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <input id="id" type="text" autoComplete="username"
                 placeholder="例: tera-admin" value={id}
                 onChange={(e) => setId(e.target.value)}
                 disabled={submitting} />
        </div>
        {errs.id && (
          <p className="field-error">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            {errs.id}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="pw">
          <span>パスワード</span>
          <a className="hint" href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--fg2)', textDecoration: 'none' }}>パスワードをお忘れですか？</a>
        </label>
        <div className={'input-wrap' + (errs.pw ? ' error' : '')}>
          <svg className="lead-icon" viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <input id="pw" type={showPw ? 'text' : 'password'} autoComplete="current-password"
                 placeholder="パスワードを入力" value={pw}
                 onChange={(e) => setPw(e.target.value)}
                 disabled={submitting} />
          <button type="button" className="pw-toggle" onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? 'パスワードを非表示' : 'パスワードを表示'} tabIndex={-1}>
            {showPw
              ? <svg viewBox="0 0 24 24"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
              : <svg viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>}
          </button>
        </div>
        {errs.pw && (
          <p className="field-error">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            {errs.pw}
          </p>
        )}
      </div>

      <div className="row-between">
        <label className="check">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <span className="box"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></span>
          ログイン状態を保持する
        </label>
      </div>

      {errs.form && (
        <p className="field-error" style={{ marginBottom: 12 }}>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          {errs.form}
        </p>
      )}

      <button type="submit" className="submit" disabled={submitting}>
        {submitting ? (
          <>
            <span className="spinner" />
            <span>認証中…</span>
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
            <span>サインイン</span>
          </>
        )}
      </button>

      <div className="demo-hint" role="button" tabIndex={0} onClick={fillDemo}
           onKeyDown={(e) => { if (e.key === 'Enter') fillDemo(); }}
           style={{ cursor: 'pointer' }}>
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        <span>デモ用認証情報: ID <b>tera-admin</b> / パスワード <b>temple2024</b> &nbsp;(クリックで入力)</span>
      </div>
    </form>
  );
}

// ---------- Variant A: Centered ----------
function VariantCentered({ state, onSubmit, motifOn, motifKind }) {
  const Motif = { lotus: MotifLotus, seigaiha: MotifSeigaiha, asanoha: MotifAsanoha }[motifKind] || MotifLotus;
  return (
    <div className="login-stage v-centered" data-screen-label="01 ログイン (中央寄せ)">
      {motifOn && <Motif />}
      <div className="login-card">
        <div className="header-mark">
          <div className="brand-mark lg"><BrandIcon /></div>
          <div className="brand-name">寺院管理システム
            <span className="sub">Temple Administration</span>
          </div>
        </div>
        <h1 className="login-title">サインイン</h1>
        <p className="login-lead">続行するにはサインインしてください。</p>
        <LoginForm state={state} onSubmit={onSubmit} />
      </div>
    </div>
  );
}

// ---------- Variant B: Split ----------
function VariantSplit({ state, onSubmit, motifOn, motifKind }) {
  const Motif = { lotus: MotifLotus, seigaiha: MotifSeigaiha, asanoha: MotifAsanoha }[motifKind] || MotifSeigaiha;
  const now = useNow();
  return (
    <div className="login-stage v-split" data-screen-label="02 ログイン (左右分割)">
      <section className="pane-form">
        <div className="pane-form-inner">
          <div className="brand-row">
            <div className="brand-mark"><BrandIcon /></div>
            <div className="brand-name">寺院管理システム
              <span className="sub">寺務員コンソール</span>
            </div>
          </div>
          <div className="login-card">
            <h1 className="login-title">サインイン</h1>
            <p className="login-lead">寺務員IDとパスワードを入力してください。</p>
            <LoginForm state={state} onSubmit={onSubmit} />
          </div>
        </div>
      </section>
      <section className="pane-brand" aria-hidden="true">
        {motifOn && <Motif style={{ filter: 'invert(1)' }} />}
        <div>
          <div className="seal">
            <div className="mark"><BrandIcon /></div>
            <div className="name">寺院管理システム<span className="sub">TEMPLE ADMIN</span></div>
          </div>
          <div className="copy">
            <h2>静かな日々の記録を、<br />たしかな仕組みで。</h2>
            <p>お参り、檀家、過去帳、年忌——寺務にまつわる記録を一つの場所に。日々の所作はそのままに、必要な情報をすぐ取り出せます。</p>
          </div>
          <div className="stats-peek" aria-label="本日の概要">
            <div className="cell"><div className="l">本日のお参り</div><div className="v">12<small>件</small></div></div>
            <div className="cell"><div className="l">今月の法要</div><div className="v">8<small>件</small></div></div>
            <div className="cell"><div className="l">未読のお知らせ</div><div className="v">3<small>件</small></div></div>
          </div>
          <div className="today">
            <div className="l">
              <svg viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              本日のご予定
            </div>
            <ul>
              <li><span>月命日 法要 / 佐藤家</span><span className="time">10:30</span></li>
              <li><span>檀家面談 / 田中家</span><span className="time">14:00</span></li>
              <li><span>三回忌 法要 / 高橋家</span><span className="time">16:00</span></li>
            </ul>
          </div>
        </div>
        <div className="foot">
          <span>{fmtDate(now)}</span>
          <span style={{ fontFeatureSettings: "'tnum'" }}>{fmtClock(now)}</span>
        </div>
      </section>
    </div>
  );
}

// ---------- Variant C: Full-bleed (novel) ----------
function VariantFullbleed({ state, onSubmit, motifOn, motifKind }) {
  const Motif = { lotus: MotifLotus, seigaiha: MotifSeigaiha, asanoha: MotifAsanoha }[motifKind] || MotifAsanoha;
  const now = useNow();
  const hello = greetingFor(now.getHours());
  return (
    <div className="login-stage v-fullbleed" data-screen-label="03 ログイン (フルブリード)">
      {motifOn && <Motif />}
      <div className="topbar">
        <div className="brand-row">
          <div className="brand-mark"><BrandIcon /></div>
          <div className="brand-name">寺院管理システム
            <span className="sub">Temple Administration</span>
          </div>
        </div>
        <div className="right">
          <span>{fmtDate(now)}</span>
          <span className="clock">{fmtClock(now)}</span>
          <a className="help" href="#" onClick={(e) => e.preventDefault()}>困ったときは</a>
        </div>
      </div>

      <div className="stage">
        <aside className="greet">
          <div className="seal-stamp" aria-hidden="true">寺</div>
          <h1>{hello}。<br />本日のご記録をはじめましょう。</h1>
          <p>寺務にまつわる記録を、落ち着いた所作で。必要なときに、すぐに。</p>
          <div className="agenda">
            <div className="l">
              <svg viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              本日のご予定
            </div>
            <div className="v">3<small>件</small></div>
            <div className="note">
              <svg viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              詳細はサインイン後にご確認いただけます
            </div>
          </div>
        </aside>

        <div className="login-card glass">
          <div className="header-mark">
            <div className="brand-mark"><BrandIcon /></div>
            <div>
              <h1 className="login-title" style={{ margin: 0, fontSize: 18 }}>サインイン</h1>
              <p className="login-lead" style={{ margin: '2px 0 0' }}>寺務員アカウントでお進みください。</p>
            </div>
          </div>
          <LoginForm state={state} onSubmit={onSubmit} />
        </div>

        <aside className="side">
          <div className="kv"><b>本日</b><span>{fmtDate(now)}</span></div>
          <div className="kv"><b>担当</b><span>当番制</span></div>
          <div className="kv"><b>サポート</b><span>03-0000-0000</span></div>
          <div className="kv"><b>バージョン</b><span>v1.0.0 (2026.05)</span></div>
        </aside>
      </div>
    </div>
  );
}

Object.assign(window, { LoginForm, VariantCentered, VariantSplit, VariantFullbleed });