// 寺務員・権限
import * as React from 'react';

import type { SectionProps, StaffMember, StaffPerm, StaffRoleInfo } from '../../types';
import { SettingsHeader } from '../SettingsHeader';

export function SectionStaff(_props: SectionProps) {
  const [staff] = React.useState<StaffMember[]>([
    { name: '高橋 良観', role: '主任住職', email: 'abbot@jomyo-ji.jp', perm: 'admin',    last: '2026-05-12 08:14' },
    { name: '中村 文隆', role: '住職',     email: 'naka@jomyo-ji.jp',  perm: 'admin',    last: '2026-05-11 19:02' },
    { name: '佐藤 慶順', role: '副住職',   email: 'sato@jomyo-ji.jp',  perm: 'staff',    last: '2026-05-11 16:30' },
    { name: '寺務員 太郎', role: '寺務員', email: 'office@jomyo-ji.jp',perm: 'staff',    last: '2026-05-10 18:42' },
    { name: '田村 啓子', role: '寺務員',   email: 'tamura@jomyo-ji.jp',perm: 'readonly', last: '2026-05-08 11:20' },
  ]);

  const ROLES: Record<StaffPerm, StaffRoleInfo> = {
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
