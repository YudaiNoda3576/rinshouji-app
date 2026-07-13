import * as React from 'react';

interface SendNoticesDialogProps {
  open: boolean;
  onClose: () => void;
  count: number;
}

export function SendNoticesDialog({ open, onClose, count }: SendNoticesDialogProps) {
  const [channel, setChannel] = React.useState<'mail' | 'print'>('mail');
  const [sendAt, setSendAt] = React.useState<'now' | 'scheduled'>('now');
  if (!open) return null;
  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" style={{width: 540}} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <div>
            <h3>年忌案内の一斉送付</h3>
            <p style={{margin: '4px 0 0', fontSize: 12, color: 'var(--fg2)'}}>{count}件の未送付案内をまとめて送付します。</p>
          </div>
          <button className="x-btn" onClick={onClose} aria-label="閉じる">
            <svg viewBox="0 0 24 24"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
          </button>
        </header>
        <div className="body">
          <div className="form-field" style={{marginBottom: 16}}>
            <label>送付方法</label>
            <div className="channel-picker">
              <label className={'ch-card' + (channel === 'mail' ? ' on' : '')}>
                <input type="radio" name="ch" checked={channel === 'mail'} onChange={() => setChannel('mail')} />
                <div className="ch-icon mail">
                  <svg viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 5L2 7"/></svg>
                </div>
                <div className="ch-info">
                  <div className="ch-label">メール</div>
                  <div className="ch-desc">PDF案内を添付して送信</div>
                </div>
              </label>
              <label className={'ch-card' + (channel === 'print' ? ' on' : '')}>
                <input type="radio" name="ch" checked={channel === 'print'} onChange={() => setChannel('print')} />
                <div className="ch-icon print">
                  <svg viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                </div>
                <div className="ch-info">
                  <div className="ch-label">郵送 (印刷)</div>
                  <div className="ch-desc">封書用PDFをまとめて出力</div>
                </div>
              </label>
            </div>
          </div>

          <div className="form-field">
            <label>送付タイミング</label>
            <div className="seg" style={{width: 'fit-content'}}>
              <button className={'seg-btn' + (sendAt === 'now' ? ' on' : '')} onClick={() => setSendAt('now')}>今すぐ送付</button>
              <button className={'seg-btn' + (sendAt === 'scheduled' ? ' on' : '')} onClick={() => setSendAt('scheduled')}>日時を指定</button>
            </div>
            {sendAt === 'scheduled' && (
              <div style={{display: 'flex', gap: 8, marginTop: 10}}>
                <input className="input-plain" type="date" defaultValue="2026-05-15" style={{flex: 1}} />
                <input className="input-plain" type="time" defaultValue="09:00" style={{width: 120}} />
              </div>
            )}
          </div>

          <div className="send-summary">
            <div className="ss-row">
              <span>送付件数</span>
              <strong>{count}件</strong>
            </div>
            <div className="ss-row">
              <span>送付方法</span>
              <strong>{channel === 'mail' ? 'メール' : '郵送 (印刷)'}</strong>
            </div>
            <div className="ss-row">
              <span>送付日時</span>
              <strong>{sendAt === 'now' ? '今すぐ' : '2026年5月15日 9:00'}</strong>
            </div>
          </div>
        </div>
        <footer>
          <button className="btn outline" type="button" onClick={onClose}>キャンセル</button>
          <button className="btn primary" type="button" onClick={onClose}>
            {channel === 'print' ? 'PDFを生成' : '送付する'}
          </button>
        </footer>
      </div>
    </div>
  );
}
