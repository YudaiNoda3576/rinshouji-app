import type { CSSProperties } from 'react';

// 寺院をテーマにした控えめな SVG 背景モチーフ。
// 背景画像として敷き詰めて使う装飾コンポーネント。

interface MotifProps {
  style?: CSSProperties;
}

export function MotifLotus({ style }: MotifProps) {
  return (
    <div
      className="motif"
      style={{
        ...style,
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 240' width='240' height='240'>
  <g fill='none' stroke='%231e293b' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'>
    <g transform='translate(120 120)'>
      <path d='M0 -52 C 14 -36 14 -16 0 0 C -14 -16 -14 -36 0 -52 Z'/>
      <path d='M0 -52 C 14 -36 14 -16 0 0 C -14 -16 -14 -36 0 -52 Z' transform='rotate(60)'/>
      <path d='M0 -52 C 14 -36 14 -16 0 0 C -14 -16 -14 -36 0 -52 Z' transform='rotate(120)'/>
      <path d='M0 -52 C 14 -36 14 -16 0 0 C -14 -16 -14 -36 0 -52 Z' transform='rotate(180)'/>
      <path d='M0 -52 C 14 -36 14 -16 0 0 C -14 -16 -14 -36 0 -52 Z' transform='rotate(240)'/>
      <path d='M0 -52 C 14 -36 14 -16 0 0 C -14 -16 -14 -36 0 -52 Z' transform='rotate(300)'/>
      <circle r='9'/>
    </g>
  </g>
</svg>`)}")`,
      }}
    />
  );
}

export function MotifSeigaiha({ style }: MotifProps) {
  return (
    <div
      className="motif"
      style={{
        ...style,
        backgroundSize: '120px 60px',
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 60' width='120' height='60'>
  <g fill='none' stroke='%231e293b' stroke-width='1' stroke-linecap='round'>
    <circle cx='0' cy='30' r='30'/>
    <circle cx='0' cy='30' r='20'/>
    <circle cx='0' cy='30' r='10'/>
    <circle cx='60' cy='30' r='30'/>
    <circle cx='60' cy='30' r='20'/>
    <circle cx='60' cy='30' r='10'/>
    <circle cx='120' cy='30' r='30'/>
    <circle cx='120' cy='30' r='20'/>
    <circle cx='120' cy='30' r='10'/>
    <circle cx='30' cy='60' r='30'/>
    <circle cx='30' cy='60' r='20'/>
    <circle cx='30' cy='60' r='10'/>
    <circle cx='90' cy='60' r='30'/>
    <circle cx='90' cy='60' r='20'/>
    <circle cx='90' cy='60' r='10'/>
    <circle cx='30' cy='0' r='30'/>
    <circle cx='30' cy='0' r='20'/>
    <circle cx='30' cy='0' r='10'/>
    <circle cx='90' cy='0' r='30'/>
    <circle cx='90' cy='0' r='20'/>
    <circle cx='90' cy='0' r='10'/>
  </g>
</svg>`)}")`,
      }}
    />
  );
}

export function MotifAsanoha({ style }: MotifProps) {
  return (
    <div
      className="motif"
      style={{
        ...style,
        backgroundSize: '120px 138px',
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 138' width='120' height='138'>
  <g fill='none' stroke='%231e293b' stroke-width='0.9' stroke-linejoin='round'>
    <polygon points='60,0 120,34.6 120,103.9 60,138.6 0,103.9 0,34.6'/>
    <line x1='60' y1='0' x2='60' y2='138.6'/>
    <line x1='0' y1='34.6' x2='120' y2='103.9'/>
    <line x1='120' y1='34.6' x2='0' y2='103.9'/>
    <line x1='60' y1='69.3' x2='0' y2='34.6'/>
    <line x1='60' y1='69.3' x2='120' y2='34.6'/>
    <line x1='60' y1='69.3' x2='0' y2='103.9'/>
    <line x1='60' y1='69.3' x2='120' y2='103.9'/>
  </g>
</svg>`)}")`,
      }}
    />
  );
}
