// settings.jsx — 設定画面
import * as React from 'react';

import { SETTINGS_NAV, SVC_ICON } from '../constants';
import { SectionData } from './sections/SectionData';
import { SectionIntegration } from './sections/SectionIntegration';
import { SectionKinds } from './sections/SectionKinds';
import { SectionNotifications } from './sections/SectionNotifications';
import { SectionSecurity } from './sections/SectionSecurity';
import { SectionServices } from './sections/SectionServices';
import { SectionStaff } from './sections/SectionStaff';
import { SectionTemple } from './sections/SectionTemple';
import { SectionTemplates } from './sections/SectionTemplates';

interface SettingsPageProps {
  initialSection: string;
}

export function SettingsPage({ initialSection }: SettingsPageProps) {
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
