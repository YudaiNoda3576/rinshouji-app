// Dashboard — ログイン後の寺務員コンソール（サイドバー + 各機能ページの切替）。
import * as React from 'react';

import { BrandIcon } from '@/components/icons';
import type { PushToast } from '@/types/toast';

import { DashboardHome } from '@/features/dashboard';
import { ParishionersPage, NewParishDialog } from '@/features/parishioners';
import { MemorialPage, NewMemorialDialog } from '@/features/memorial';
import { SchedulePage, NewScheduleDialog } from '@/features/schedule';
import { NoticesPage } from '@/features/notices';
import { ParishMapPage } from '@/features/parish-map';
import { SettingsPage } from '@/features/settings';

type PageKey =
  | 'home'
  | 'schedule'
  | 'parish'
  | 'memorial'
  | 'notices'
  | 'map'
  | 'settings';

interface NavEntry {
  key: PageKey;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

interface DashboardProps {
  onLogout: () => void;
  onToast: PushToast;
}

const NAV: NavEntry[] = [
  { key: 'home', label: 'ダッシュボード', icon: <svg viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
  { key: 'schedule', label: '予定管理', icon: <svg viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg> },
  { key: 'parish', label: '檀家管理', icon: <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
  { key: 'memorial', label: '過去帳', icon: <svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg> },
];

const ADMIN_NAV: NavEntry[] = [
  { key: 'notices', label: '年忌案内', icon: <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg> },
  { key: 'map', label: '檀家地図', icon: <svg viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" x2="8" y1="2" y2="18" /><line x1="16" x2="16" y1="6" y2="22" /></svg> },
  { key: 'settings', label: '設定', icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg> },
];

const PAGE_TITLES: Record<PageKey, string> = {
  home: 'ダッシュボード',
  schedule: '予定管理',
  parish: '檀家管理',
  memorial: '過去帳',
  notices: '年忌案内',
  map: '檀家地図',
  settings: '設定',
};

export function Dashboard({ onLogout, onToast }: DashboardProps) {
  const [page, setPage] = React.useState<PageKey>('home');
  const [showNewParish, setShowNewParish] = React.useState(false);
  const [showNewMemorial, setShowNewMemorial] = React.useState(false);
  const [showNewSchedule, setShowNewSchedule] = React.useState(false);
  const [settingsInitialSection, setSettingsInitialSection] = React.useState('temple');
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  const openSettingsAt = (section: string) => {
    setSettingsInitialSection(section);
    setPage('settings');
    setMobileNavOpen(false);
  };
  const closeMobileNav = () => setMobileNavOpen(false);
  const gotoPage = (key: PageKey) => {
    setPage(key);
    setMobileNavOpen(false);
  };

  const renderNavItem = (n: NavEntry) => (
    <div
      key={n.key}
      className={'nav-item' + (page === n.key ? ' active' : '') + (n.disabled ? ' disabled' : '')}
      onClick={() => !n.disabled && gotoPage(n.key)}
    >
      {n.icon}{n.label}
    </div>
  );

  return (
    <div className="dash-stage" data-active="1">
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button className="mobile-hamburger" onClick={() => setMobileNavOpen(true)} aria-label="メニューを開く">
          <svg viewBox="0 0 24 24"><line x1="3" x2="21" y1="6" y2="6" /><line x1="3" x2="21" y1="12" y2="12" /><line x1="3" x2="21" y1="18" y2="18" /></svg>
        </button>
        <div className="mobile-title">
          <div className="mt-brand"><BrandIcon /></div>
          <span>{PAGE_TITLES[page]}</span>
        </div>
        <div className="mobile-spacer" />
      </div>

      {/* Mobile drawer overlay */}
      {mobileNavOpen && <div className="mobile-nav-overlay" onClick={closeMobileNav}></div>}

      <aside className={'dash-sidebar' + (mobileNavOpen ? ' open' : '')}>
        <div className="brand">
          <div className="brand-mark"><BrandIcon /></div>
          <div className="brand-name">寺院管理<span className="sub">Staff Console</span></div>
          <button className="mobile-nav-close" onClick={closeMobileNav} aria-label="閉じる">
            <svg viewBox="0 0 24 24"><line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" /></svg>
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
          {NAV.map(renderNavItem)}
          <div className="section-label">管理機能</div>
          {ADMIN_NAV.map(renderNavItem)}
        </nav>
        <div className="foot">
          <div className="nav-item danger" onClick={onLogout}>
            <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
            サインアウト
          </div>
        </div>
      </aside>

      <main className="dash-main">
        {page === 'parish' ? (
          <>
            <ParishionersPage onOpenNew={() => setShowNewParish(true)} onToast={onToast} />
            <NewParishDialog
              open={showNewParish}
              onClose={() => setShowNewParish(false)}
              onSave={(form) => {
                setShowNewParish(false);
                onToast({ kind: 'success', title: '檀家を登録しました。', desc: form.name + '家 / ' + form.head });
              }}
            />
          </>
        ) : page === 'memorial' ? (
          <>
            <MemorialPage onOpenNew={() => setShowNewMemorial(true)} onToast={onToast} />
            <NewMemorialDialog
              open={showNewMemorial}
              onClose={() => setShowNewMemorial(false)}
              onSave={(form) => {
                setShowNewMemorial(false);
                onToast({ kind: 'success', title: '過去帳に登録しました。', desc: (form.prefix + ' ' + form.name + ' ' + form.rank).trim() + ' / ' + form.secular });
              }}
            />
          </>
        ) : page === 'schedule' ? (
          <>
            <SchedulePage onOpenNew={() => setShowNewSchedule(true)} onOpenSettings={openSettingsAt} />
            <NewScheduleDialog
              open={showNewSchedule}
              onClose={() => setShowNewSchedule(false)}
              onOpenSettings={openSettingsAt}
              onSave={(form) => {
                setShowNewSchedule(false);
                onToast({ kind: 'success', title: '予定を追加しました。', desc: form.title + ' / ' + form.date + ' ' + form.time });
              }}
            />
          </>
        ) : page === 'notices' ? (
          <NoticesPage onToast={onToast} />
        ) : page === 'map' ? (
          <ParishMapPage />
        ) : page === 'settings' ? (
          <SettingsPage initialSection={settingsInitialSection} />
        ) : (
          <DashboardHome />
        )}
      </main>
    </div>
  );
}
