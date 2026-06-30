import type { Toast } from '@/types/toast';

interface ToastStackProps {
  items: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastStack({ items, onDismiss }: ToastStackProps) {
  return (
    <div className="toast-stack" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={'toast ' + t.kind} data-leaving={t.leaving ? '1' : '0'}>
          <div className="ico">
            {t.kind === 'success' && (
              <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
            )}
            {t.kind === 'error' && (
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
            )}
            {t.kind === 'info' && (
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
            )}
          </div>
          <div className="body">
            <p className="t">{t.title}</p>
            {t.desc && <p className="d">{t.desc}</p>}
          </div>
          <button className="x" onClick={() => onDismiss(t.id)} aria-label="閉じる">
            <svg viewBox="0 0 24 24"><line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" /></svg>
          </button>
        </div>
      ))}
    </div>
  );
}
