import * as React from 'react';

export function TempleGlyph(): React.ReactElement {
  return (
    <svg viewBox="0 0 18 18" width="14" height="14" style={{verticalAlign: 'middle', marginRight: 4}}>
      <g fill="var(--temple-purple)">
        <path d="M9 1 L17 4 L9 7 L1 4 Z"/>
        <rect x="3" y="6" width="12" height="2"/>
        <rect x="2" y="14" width="14" height="3"/>
        <rect x="5" y="8" width="2" height="6"/>
        <rect x="11" y="8" width="2" height="6"/>
      </g>
    </svg>
  );
}
