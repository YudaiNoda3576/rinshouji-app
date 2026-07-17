// 案内テンプレート設定ダイアログ（郵送/メール系のみ）。

import * as React from 'react';

import type { NoticeTemplate } from '../types';

interface TemplateSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: () => void;
}

const TEMPLATES: NoticeTemplate[] = [
  {
    id: 'kaiki-letter',
    name: '年忌案内 (封書)',
    body: `{{戸主名}} 様

時下ますます御清祥のこととお慶び申し上げます。

さて、来る {{法要日}} に
故 {{戒名}}（{{俗名}}）様の{{年忌}}法要を当山にて勤修いたしたく存じます。

つきましては、ご家族・ご親族の皆様にご参列いただきたく、ご案内申し上げます。

日時：{{法要日}} 午前10時30分より
場所：当山 本堂
御布施：お志
会食：法要後、本院にてお膳を用意いたします

合掌 {{寺院名}} 住職`,
  },
  {
    id: 'obon',
    name: 'お盆参拝のご案内',
    body: `{{戸主名}} 様

盛夏の候、ますます御清祥のこととお慶び申し上げます。

本年もお盆の合同法要を当山にて厳修いたします。
ご先祖様への御回向に、ぜひご家族おそろいでお参りください。

日時：8月13日〜15日 午前10時より
場所：当山 本堂

合掌 {{寺院名}} 住職`,
  },
  {
    id: 'higan',
    name: 'お彼岸参拝のご案内',
    body: `{{戸主名}} 様

彼岸の候、ますます御清祥のこととお慶び申し上げます。

お彼岸の合同法要を当山にて厳修いたします。
ご先祖様への御回向に、どうぞお参りください。

日時：彼岸の中日 午前10時より
場所：当山 本堂

合掌 {{寺院名}} 住職`,
  },
  {
    id: 'shotsuki',
    name: '月命日リマインダー',
    body: `{{戸主名}} 様

{{法要日}} は 故 {{戒名}}（{{俗名}}）様の月命日でございます。
お参りをご希望の際は、お気軽にお申し付けください。

{{寺院名}}`,
  },
];

const VARS = ['{{戸主名}}', '{{戒名}}', '{{俗名}}', '{{法要日}}', '{{年忌}}', '{{寺院名}}', '{{住職名}}', '{{家名}}', '{{住所}}'];

export function TemplateSettingsDialog({ open, onClose, onSave }: TemplateSettingsDialogProps) {
  const [active, setActive] = React.useState(TEMPLATES[0].id);
  const [body, setBody] = React.useState(TEMPLATES[0].body);
  const cur = TEMPLATES.find(t => t.id === active) ?? TEMPLATES[0];

  // 再オープン時は先頭テンプレ・初期本文にリセット（他ダイアログと同じ open 依存の規約）。
  React.useEffect(() => {
    if (open) {
      setActive(TEMPLATES[0].id);
      setBody(TEMPLATES[0].body);
    }
  }, [open]);

  const selectTemplate = (t: NoticeTemplate) => {
    setActive(t.id);
    setBody(t.body);
  };

  if (!open) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" style={{width: 720}} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <div>
            <h3>案内テンプレート</h3>
            <p style={{margin: '4px 0 0', fontSize: 12, color: 'var(--fg2)'}}>
              変数は二重波括弧 {'{{ }}'} で挿入できます。送信時に自動置換されます。
            </p>
          </div>
          <button className="x-btn" onClick={onClose} aria-label="閉じる">
            <svg viewBox="0 0 24 24"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
          </button>
        </header>
        <div className="body">
          <div className="tpl-layout">
            <div className="tpl-list">
              {TEMPLATES.map(t => (
                <button key={t.id} className={'tpl-row' + (active === t.id ? ' on' : '')} onClick={() => selectTemplate(t)}>
                  <span className="tpl-name">{t.name}</span>
                </button>
              ))}
              <button className="btn outline tpl-add" type="button">
                <svg viewBox="0 0 24 24"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
                新しいテンプレート
              </button>
            </div>

            <div className="tpl-edit">
              <div className="tpl-edit-head">
                <input className="input-plain" defaultValue={cur.name} key={cur.id} />
              </div>
              <div className="tpl-vars">
                <span className="tpl-vars-l">挿入できる変数</span>
                {VARS.map(v => (
                  <button key={v} className="tpl-var-chip" type="button" onClick={() => setBody(body + ' ' + v)}>{v}</button>
                ))}
              </div>
              <textarea className="tpl-body" value={body} onChange={(e) => setBody(e.target.value)} rows={14} />
              <div className="tpl-edit-foot">
                <span className="dim">{body.length}文字</span>
              </div>
            </div>
          </div>
          <p style={{margin: '14px 0 0', fontSize: 11, color: 'var(--fg2)'}}>
            ※ 保存はまだ永続化されません。テンプレートの変更は画面上のみの反映で、リロードすると元に戻ります。
          </p>
        </div>
        <footer>
          <button className="btn outline" type="button" onClick={onClose}>キャンセル</button>
          <button className="btn primary" type="button" onClick={() => { onSave?.(); onClose(); }}>保存する</button>
        </footer>
      </div>
    </div>
  );
}
