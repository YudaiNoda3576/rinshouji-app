// 外部連携
import * as React from 'react';

import type { SectionProps } from '../../types';
import { IntegrationRow } from '../IntegrationRow';
import { SettingsHeader } from '../SettingsHeader';

export function SectionIntegration({ onChange }: SectionProps) {
  const [mail, setMail] = React.useState(true);
  const [map, setMap] = React.useState(true);
  const [cal, setCal] = React.useState(false);

  return (
    <section className="settings-card card">
      <SettingsHeader title="外部サービスとの連携" desc="案内発信や地図表示などで連携する外部サービスを管理します。" />
      <div className="sc-body intg-list">
        <IntegrationRow icon="mail" name="メール送信サーバー (SMTP)" desc="案内メール、領収書PDFの送信に使用します。" status={mail ? 'connected' : 'off'} channel="smtp.sakura.ne.jp" onToggle={() => { setMail(!mail); onChange(); }} />
        <IntegrationRow icon="map"  name="地図表示サービス" desc="檀家地図の表示に使用します。" status={map ? 'connected' : 'off'} channel="Google Maps Platform" onToggle={() => { setMap(!map); onChange(); }} />
        <IntegrationRow icon="cal"  name="Googleカレンダー" desc="法要予定をGoogleカレンダーと双方向同期します。" status={cal ? 'connected' : 'off'} channel={cal ? 'jomyo-ji@gmail.com' : '未連携'} onToggle={() => { setCal(!cal); onChange(); }} />
      </div>
    </section>
  );
}
