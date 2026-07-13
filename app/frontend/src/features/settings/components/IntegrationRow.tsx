import type * as React from 'react';

import type { IntegrationIcon, IntegrationStatus } from '../types';

interface IntegrationRowProps {
  icon: IntegrationIcon;
  name: string;
  desc: string;
  status: IntegrationStatus;
  channel: string;
  onToggle: () => void;
}

interface IntegrationIconDef {
  bg: string;
  el: React.ReactNode;
}

export function IntegrationRow({ icon, name, desc, status, channel, onToggle }: IntegrationRowProps) {
  const ICONS: Record<IntegrationIcon, IntegrationIconDef> = {
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
