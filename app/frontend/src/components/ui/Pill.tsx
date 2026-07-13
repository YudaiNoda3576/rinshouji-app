import type { ReactNode } from 'react';

// Pill / StatusDot などで使う配色キー（全 feature 共通）。
export type PillColor = 'blue' | 'purple' | 'green' | 'gray';

interface PillProps {
  color: PillColor;
  children: ReactNode;
}

// ラベル用の丸ピル。配色は .pill-<color>（styles.css のグローバル定義）に対応。
export function Pill({ color, children }: PillProps) {
  return <span className={'pill pill-' + color}>{children}</span>;
}
