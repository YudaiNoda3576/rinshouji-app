// motifs.jsx — subtle temple-themed SVG backgrounds + brand icons

const MotifLotus = () => (
  <div className="motif" style={{
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
</svg>`)}")` }} />
);

const MotifSeigaiha = () => (
  <div className="motif" style={{
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
    backgroundSize: '120px 60px',
  }} />
);

const MotifAsanoha = () => (
  <div className="motif" style={{
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
    backgroundSize: '120px 138px',
  }} />
);

// Brand mark: a temple-roof inspired glyph in a tinted square (canonical placement).
const BrandIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 10 L12 4 L21 10" />
    <path d="M5 10 V20 H19 V10" />
    <path d="M9 20 V14 H15 V20" />
    <path d="M3 10 H21" />
  </svg>
);

// Building (source-canonical)
const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
    <path d="M9 22v-4h6v4"/>
    <path d="M8 6h.01"/><path d="M16 6h.01"/>
    <path d="M12 6h.01"/><path d="M12 10h.01"/>
    <path d="M12 14h.01"/><path d="M16 10h.01"/>
    <path d="M16 14h.01"/><path d="M8 10h.01"/>
    <path d="M8 14h.01"/>
  </svg>
);

Object.assign(window, { MotifLotus, MotifSeigaiha, MotifAsanoha, BrandIcon, BuildingIcon });