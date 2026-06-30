// 通知設定
import * as React from 'react';

import type { NotificationSettings, SectionProps } from '../../types';
import { Field } from '../Field';
import { SettingsHeader } from '../SettingsHeader';
import { Toggle } from '../Toggle';

export function SectionNotifications({ onChange }: SectionProps) {
  const [s, setS] = React.useState<NotificationSettings>({
    todayVisits: true,
    upcomingKaiki: true,
    responseAlert: true,
    weeklyReport: false,
    method: 'app',
    digestTime: '08:00',
  });
  const set = (patch: Partial<NotificationSettings>): void => {
    setS((prev) => ({ ...prev, ...patch }));
    onChange();
  };

  return (
    <section className="settings-card card">
      <SettingsHeader title="通知設定" desc="ダッシュボードや寺務員への通知タイミングを設定します。" />
      <div className="sc-body">
        <div className="toggle-list">
          <Toggle label="本日の参拝予定の朝の通知" desc="毎朝、その日のお参り予定をまとめてお知らせします。" checked={s.todayVisits} onChange={(v) => set({ todayVisits: v })} />
          <Toggle label="年忌法要の事前リマインド" desc="該当する年忌の60日前にお知らせします。" checked={s.upcomingKaiki} onChange={(v) => set({ upcomingKaiki: v })} />
          <Toggle label="檀家からの返答通知" desc="LINE案内に出欠連絡があった際に通知します。" checked={s.responseAlert} onChange={(v) => set({ responseAlert: v })} />
          <Toggle label="週次レポート" desc="毎週月曜日に先週の活動サマリをメール送信します。" checked={s.weeklyReport} onChange={(v) => set({ weeklyReport: v })} />
        </div>

        <div className="field-grid" style={{marginTop: 20}}>
          <Field label="通知方法">
            <div className="seg">
              <button className={'seg-btn' + (s.method === 'app' ? ' on' : '')} onClick={() => set({ method: 'app' })}>アプリ内</button>
              <button className={'seg-btn' + (s.method === 'mail' ? ' on' : '')} onClick={() => set({ method: 'mail' })}>メール</button>
              <button className={'seg-btn' + (s.method === 'both' ? ' on' : '')} onClick={() => set({ method: 'both' })}>両方</button>
            </div>
          </Field>
          <Field label="朝の通知時刻">
            <input className="input-plain" type="time" value={s.digestTime} onChange={(e) => set({ digestTime: e.target.value })} style={{width: 140}} />
          </Field>
        </div>
      </div>
    </section>
  );
}
