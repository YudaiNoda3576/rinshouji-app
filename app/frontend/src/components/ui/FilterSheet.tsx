import type { ReactNode } from 'react';

// 下から出るボトムシート（汎用）。SP 判定は呼び出し側が行い、open で表示制御する。
interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  count?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function FilterSheet({ open, onClose, title = '絞り込み', count, children, footer }: FilterSheetProps) {
  if (!open) return null;
  return (
    <div className="filter-sheet-overlay" onClick={onClose}>
      <div className="filter-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="fs-head">
          <span className="fs-title">{title}</span>
          {count != null && <span className="fs-count">{count}</span>}
          <button className="fs-close" type="button" aria-label="閉じる" onClick={onClose}>
            <svg viewBox="0 0 24 24"><line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" /></svg>
          </button>
        </div>
        <div className="fs-body">{children}</div>
        {footer && <div className="fs-foot">{footer}</div>}
      </div>
    </div>
  );
}
