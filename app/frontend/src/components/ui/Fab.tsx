import type { ReactNode } from 'react';

// 右下固定の FAB（フローティングアクションボタン）。SP でのみ表示（CSS で min-width:641px 時に非表示）。
interface FabProps {
  onClick: () => void;
  label: string; // aria-label（アイコンのみのため必須）
  color?: 'blue' | 'purple';
  icon?: ReactNode; // 既定はプラス記号
}

// 既定アイコン（プラス）。
const defaultIcon = (
  <svg viewBox="0 0 24 24"><line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" /></svg>
);

export function Fab({ onClick, label, color = 'blue', icon }: FabProps) {
  return (
    <button
      className={'fab' + (color === 'purple' ? ' purple' : '')}
      type="button"
      aria-label={label}
      onClick={onClick}
    >
      {icon ?? defaultIcon}
    </button>
  );
}
