// 年忌案内の一斉送付ダイアログ。
// 【未永続化】実際の送信・保存は未実装。確定時は NoticesPage のローカル state を
// 「送付済」に上書きしてトースト表示するのみ（リロードで消える）。

import * as React from 'react';

import type { PushToast } from '@/types/toast';

import { fetchNoticesPdf } from '../api';
import { DEFAULT_NOTICE_TEMPLATE } from '../constants';
import type { NoticeCase } from '../types';
import { downloadBlob, fmtDate } from '../utils';

interface SendNoticesDialogProps {
  open: boolean;
  onClose: () => void;
  notices: NoticeCase[];
  onSend: () => void;
  onToast?: PushToast;
}

// 日時指定の初期値（今日の3日後）。
const defaultScheduledDate = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  const pad2 = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

export function SendNoticesDialog({ open, onClose, notices, onSend, onToast }: SendNoticesDialogProps) {
  const [channel, setChannel] = React.useState<'mail' | 'print'>('mail');
  const [sendAt, setSendAt] = React.useState<'now' | 'scheduled'>('now');
  const [scheduledDate, setScheduledDate] = React.useState(defaultScheduledDate);
  const [scheduledTime, setScheduledTime] = React.useState('09:00');
  const [generating, setGenerating] = React.useState(false);
  const count = notices.length;
  if (!open) return null;

  // 郵送 (印刷) の確定時は、選択分をまとめて1つのPDFに出力してダウンロードする。
  // 生成に失敗した場合は送付済への更新を行わずダイアログを開いたままにする。
  const handleConfirm = async () => {
    if (channel === 'print') {
      if (notices.length === 0) return;
      setGenerating(true);
      try {
        const blob = await fetchNoticesPdf(notices, DEFAULT_NOTICE_TEMPLATE.body);
        downloadBlob(blob, `年忌案内_${notices.length}件.pdf`);
      } catch (err) {
        onToast?.({
          kind: 'error',
          title: 'PDFの生成に失敗しました。',
          desc: err instanceof Error ? err.message : undefined,
        });
        setGenerating(false);
        return;
      }
      setGenerating(false);
    }
    onSend();
    onClose();
  };
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
                <input className="input-plain" type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} style={{flex: 1}} />
                <input className="input-plain" type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} style={{width: 120}} />
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
              <strong>{sendAt === 'now' ? '今すぐ' : `${fmtDate(scheduledDate)} ${scheduledTime}`}</strong>
            </div>
          </div>

          <p style={{margin: '14px 0 0', fontSize: 11, color: 'var(--fg2)'}}>
            ※ 保存はまだ永続化されません。送付状態は画面上のみの反映で、リロードすると未送付に戻ります。
          </p>
        </div>
        <footer>
          <button className="btn outline" type="button" onClick={onClose} disabled={generating}>キャンセル</button>
          <button className="btn primary" type="button" onClick={handleConfirm} disabled={generating || count === 0}>
            {generating ? '生成中…' : (channel === 'print' ? 'PDFを生成' : '送付する')}
          </button>
        </footer>
      </div>
    </div>
  );
}
