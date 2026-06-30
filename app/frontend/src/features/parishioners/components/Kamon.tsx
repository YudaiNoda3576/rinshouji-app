import type { JSX } from 'react';

interface KamonProps {
  idx: number;
  size?: number;
  accent?: string;
}

export function Kamon({ idx, size = 32, accent }: KamonProps) {
  // Procedurally render a small "crest" mark — same family always same shape
  const shapes: Array<() => JSX.Element> = [
    () => <circle cx="12" cy="12" r="9" />, // simple disc
    () => <g><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="3.5" /></g>,
    () => <g><path d="M12 3 L21 12 L12 21 L3 12 Z" /><circle cx="12" cy="12" r="3" fill="white" /></g>,
    () => <g><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12 5 L12 19 M5 12 L19 12 M7 7 L17 17 M17 7 L7 17" stroke="currentColor" strokeWidth="1.2" /></g>,
    () => <g><path d="M12 3 a9 9 0 0 0 0 18 a9 9 0 0 0 0 -18 z" /><path d="M12 3 a4.5 4.5 0 0 1 0 9 a4.5 4.5 0 0 1 0 9 z" fill="white" /></g>,
    () => <g><path d="M12 3 L14 10 L21 12 L14 14 L12 21 L10 14 L3 12 L10 10 Z" /></g>,
    () => <g><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="5.5" r="2.3" /><circle cx="12" cy="18.5" r="2.3" /><circle cx="5.5" cy="12" r="2.3" /><circle cx="18.5" cy="12" r="2.3" /></g>,
    () => <g><path d="M12 4 C 16 9, 16 9, 20 12 C 16 15, 16 15, 12 20 C 8 15, 8 15, 4 12 C 8 9, 8 9, 12 4 Z" /></g>,
    () => <g><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12 6 L15 12 L12 18 L9 12 Z" /></g>,
    () => <g><rect x="4" y="4" width="16" height="16" transform="rotate(45 12 12)" fill="none" stroke="currentColor" strokeWidth="2" /><rect x="8" y="8" width="8" height="8" transform="rotate(45 12 12)" /></g>,
  ];
  const c = accent || 'currentColor';
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={{ color: c }}>
      <g fill="currentColor">{shapes[idx % shapes.length]()}</g>
    </svg>
  );
}
