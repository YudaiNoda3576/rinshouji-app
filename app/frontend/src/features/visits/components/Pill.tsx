import * as React from 'react';

import type { PillColor } from '../types';

interface PillProps {
  color: PillColor;
  children: React.ReactNode;
}

export function Pill({ color, children }: PillProps) {
  return <span className={'pill pill-' + color}>{children}</span>;
}
