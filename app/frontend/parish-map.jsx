// parish-map.jsx — 檀家地図 (parish geographic map view)

// Stylized lon/lat-ish coords (SVG units 0..1000 x 0..700) within a stylized 品川区 map
const MAP_FAMILIES = [
  { id: 'F-0124', name: '佐藤家', head: '佐藤 一彦',  addr: '南品川3-12-4',  x: 540, y: 420, sect: 0, zone: 0, lastVisit: '2026-05-11', scheduled: '七回忌',     district: '南品川' },
  { id: 'F-0118', name: '田中家', head: '田中 修',    addr: '北品川1-8-2',   x: 600, y: 250, sect: 0, zone: 1, lastVisit: '2026-04-22', scheduled: '十三回忌',   district: '北品川' },
  { id: 'F-0131', name: '高橋家', head: '高橋 義信',  addr: '東大井2-3-15',  x: 720, y: 470, sect: 1, zone: 0, lastVisit: '2026-05-08', scheduled: '三十三回忌', district: '東大井' },
  { id: 'F-0140', name: '山本家', head: '山本 道夫',  addr: '西大井1-1-1',   x: 380, y: 480, sect: 1, zone: 2, lastVisit: '2026-05-04', scheduled: null,         district: '西大井' },
  { id: 'F-0152', name: '鈴木家', head: '鈴木 健一',  addr: '荏原2-8-9',     x: 250, y: 380, sect: 2, zone: 1, lastVisit: '2026-03-30', scheduled: null,         district: '荏原' },
  { id: 'F-0165', name: '伊藤家', head: '伊藤 京子',  addr: '戸越4-15-1',    x: 320, y: 460, sect: 0, zone: 3, lastVisit: '2026-02-18', scheduled: '一周忌',     district: '戸越' },
  { id: 'F-0170', name: '渡辺家', head: '渡辺 静江',  addr: '平塚1-2-3',     x: 290, y: 320, sect: 1, zone: 0, lastVisit: '2025-12-23', scheduled: null,         district: '平塚' },
  { id: 'F-0182', name: '中村家', head: '中村 純一',  addr: '豊町3-4-5',     x: 410, y: 540, sect: 0, zone: 4, lastVisit: '2026-04-30', scheduled: '七回忌',     district: '豊町' },
  { id: 'F-0193', name: '小林家', head: '小林 麗子',  addr: '中延5-1-22',    x: 340, y: 560, sect: 2, zone: 1, lastVisit: '2026-03-12', scheduled: null,         district: '中延' },
  { id: 'F-0201', name: '加藤家', head: '加藤 信吾',  addr: '旗の台2-6-7',   x: 280, y: 580, sect: 3, zone: 4, lastVisit: '2026-05-09', scheduled: null,         district: '旗の台' },
  { id: 'F-0215', name: '吉田家', head: '吉田 とき子',addr: '小山3-9-1',     x: 230, y: 480, sect: 0, zone: 0, lastVisit: '2026-04-12', scheduled: '十七回忌',   district: '小山' },
  { id: 'F-0228', name: '山田家', head: '山田 健作',  addr: '西品川1-1-1',   x: 470, y: 380, sect: 4, zone: 2, lastVisit: '2026-04-25', scheduled: null,         district: '西品川' },
  { id: 'F-0241', name: '森家',   head: '森 弘',      addr: '大井1-14-2',    x: 660, y: 390, sect: 0, zone: 0, lastVisit: '2026-04-08', scheduled: null,         district: '大井' },
  { id: 'F-0247', name: '池田家', head: '池田 美佐',  addr: '勝島2-5-8',     x: 820, y: 410, sect: 0, zone: 1, lastVisit: '2025-11-30', scheduled: null,         district: '勝島' },
  { id: 'F-0253', name: '岡本家', head: '岡本 道久',  addr: '八潮5-2-1',     x: 870, y: 540, sect: 1, zone: 2, lastVisit: '2026-02-04', scheduled: '七回忌',     district: '八潮' },
  { id: 'F-0260', name: '藤田家', head: '藤田 みち',  addr: '東品川4-3-7',   x: 720, y: 320, sect: 0, zone: 0, lastVisit: '2026-05-02', scheduled: null,         district: '東品川' },
  { id: 'F-0266', name: '内田家', head: '内田 剛',    addr: '広町1-2-1',     x: 510, y: 290, sect: 0, zone: 0, lastVisit: '2026-03-22', scheduled: null,         district: '広町' },
  { id: 'F-0274', name: '坂本家', head: '坂本 千恵',  addr: '東五反田2-6-3', x: 460, y: 200, sect: 1, zone: 3, lastVisit: '2026-04-15', scheduled: '三回忌',     district: '東五反田' },
];

// 浄妙寺 (the temple) sits in 南品川
const TEMPLE_POS = { x: 580, y: 380 };

const MAP_SECTS = ['浄土真宗','曹洞宗','日蓮宗','真言宗','天台宗'];
const SECT_COLORS = [
  'var(--temple-purple)',
  'var(--temple-blue)',
  'var(--temple-red)',
  'var(--temple-green)',
  '#B26A00',
];

// Stylized district polygons (very approximate, hand-drawn)
const DISTRICTS = [
  { name: '北品川',   d: 'M 540 180 L 720 200 L 720 290 L 540 290 Z' },
  { name: '東品川',   d: 'M 720 200 L 840 220 L 870 340 L 720 290 Z' },
  { name: '南品川',   d: 'M 540 290 L 720 290 L 720 420 L 540 420 Z' },
  { name: '大井',     d: 'M 720 290 L 870 340 L 870 460 L 720 420 Z' },
  { name: '勝島',     d: 'M 870 340 L 940 380 L 920 470 L 870 460 Z' },
  { name: '八潮',     d: 'M 870 460 L 920 470 L 920 580 L 820 600 Z' },
  { name: '西大井',   d: 'M 320 410 L 470 420 L 470 540 L 320 540 Z' },
  { name: '荏原・戸越',d: 'M 180 320 L 320 320 L 320 540 L 180 540 Z' },
  { name: '中延・旗の台',d: 'M 180 540 L 470 540 L 470 620 L 200 620 Z' },
  { name: '小山',     d: 'M 180 410 L 320 410 L 320 540 L 180 540 Z' },
  { name: '東大井',   d: 'M 540 420 L 720 420 L 720 530 L 540 530 Z' },
  { name: '広町',     d: 'M 470 240 L 540 240 L 540 320 L 470 320 Z' },
  { name: '東五反田', d: 'M 380 170 L 540 180 L 540 240 L 380 240 Z' },
];

// Major roads
const ROADS = [
  'M 100 380 L 940 380',          // 山手通り (east-west)
  'M 470 60 L 470 660',           // 第一京浜 (north-south)
  'M 100 480 L 920 510',           // 中原街道
  'M 720 60 L 720 660',           // 国道15号
];

// Tokyo Bay shoreline (right edge)
const SHORE = 'M 940 60 L 940 660 L 1000 660 L 1000 60 Z';
// 目黒川 (river — meandering)
const RIVER = 'M 100 200 Q 300 240 460 280 Q 600 320 760 320 Q 880 320 940 300';

const fmtParishDate = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
};
const monthsSince = (iso) => {
  const t = new Date('2026-05-12');
  const d = new Date(iso);
  return Math.round((t - d) / (1000 * 60 * 60 * 24 * 30));
};

function ParishMapPage() {
  const [colorBy, setColorBy] = React.useState('sect'); // sect / visit / scheduled
  const [sectFilter, setSectFilter] = React.useState('all');
  const [visitFilter, setVisitFilter] = React.useState('all'); // all / recent / stale
  const [showRoads, setShowRoads] = React.useState(true);
  const [showDistricts, setShowDistricts] = React.useState(true);
  const [showLabels, setShowLabels] = React.useState(true);
  const [q, setQ] = React.useState('');
  const [selectedId, setSelectedId] = React.useState('F-0124');
  const [zoom, setZoom] = React.useState(1);
  const [hoverId, setHoverId] = React.useState(null);

  const filtered = MAP_FAMILIES.filter(f => {
    if (sectFilter !== 'all' && f.sect !== Number(sectFilter)) return false;
    if (visitFilter === 'recent' && monthsSince(f.lastVisit) > 1) return false;
    if (visitFilter === 'stale' && monthsSince(f.lastVisit) <= 3) return false;
    if (q && !`${f.name} ${f.head} ${f.addr} ${f.district}`.includes(q)) return false;
    return true;
  });

  const markerColor = (f) => {
    if (colorBy === 'sect') return SECT_COLORS[f.sect];
    if (colorBy === 'visit') {
      const m = monthsSince(f.lastVisit);
      if (m <= 1) return 'var(--temple-green)';
      if (m <= 3) return 'var(--temple-blue)';
      if (m <= 6) return '#D97706';
      return 'var(--temple-red)';
    }
    if (colorBy === 'scheduled') return f.scheduled ? 'var(--temple-red)' : 'hsl(215 16% 70%)';
    return 'var(--temple-purple)';
  };

  const selected = MAP_FAMILIES.find(f => f.id === selectedId) || filtered[0];

  // Stats by district
  const districtStats = React.useMemo(() => {
    const map = new Map();
    for (const f of MAP_FAMILIES) {
      map.set(f.district, (map.get(f.district) || 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, []);

  return (
    <div className="page-shell parish-map-page">
      <div className="page-head">
        <div>
          <h1>檀家地図</h1>
          <p>檀家のご住所をもとに地図上で可視化し、訪問計画や郵送圏の確認にご活用いただけます。</p>
        </div>
        <div className="head-actions">
          <button className="btn ghost" type="button">
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            GeoJSON 出力
          </button>
          <button className="btn ghost" type="button">
            <svg viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
            地図を印刷
          </button>
        </div>
      </div>

      <div className="pmap-stats">
        <div className="pm-stat">
          <div className="pm-stat-l">登録檀家</div>
          <div className="pm-stat-v">{MAP_FAMILIES.length}<span>軒</span></div>
        </div>
        <div className="pm-stat">
          <div className="pm-stat-l">地区数</div>
          <div className="pm-stat-v">{districtStats.length}<span>地区</span></div>
        </div>
        <div className="pm-stat">
          <div className="pm-stat-l">本日訪問可圏 (3km)</div>
          <div className="pm-stat-v">{MAP_FAMILIES.filter(f => {
            const dx = f.x - TEMPLE_POS.x, dy = f.y - TEMPLE_POS.y;
            return Math.sqrt(dx*dx + dy*dy) < 200;
          }).length}<span>軒</span></div>
        </div>
        <div className="pm-stat">
          <div className="pm-stat-l">最多地区</div>
          <div className="pm-stat-v lg">{districtStats[0][0]}<span>({districtStats[0][1]}軒)</span></div>
        </div>
      </div>

      <div className="pmap-body">
        {/* Left filter rail */}
        <aside className="pmap-filters card">
          <div className="search-wrap">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="家名・住所で検索" />
          </div>

          <div className="filt-block">
            <div className="filt-label">色分け</div>
            <div className="seg vert">
              {[
                { k: 'sect',      l: '宗派別' },
                { k: 'visit',     l: '最終参拝' },
                { k: 'scheduled', l: '予定あり' },
              ].map(o => (
                <button key={o.k} className={'seg-btn' + (colorBy === o.k ? ' on' : '')} onClick={() => setColorBy(o.k)}>{o.l}</button>
              ))}
            </div>
          </div>

          <div className="filt-block">
            <div className="filt-label">宗派</div>
            <select className="input-plain" style={{height: 32, width: '100%'}} value={sectFilter} onChange={(e) => setSectFilter(e.target.value)}>
              <option value="all">すべて</option>
              {MAP_SECTS.map((s, i) => <option key={i} value={i}>{s}</option>)}
            </select>
          </div>

          <div className="filt-block">
            <div className="filt-label">最終参拝</div>
            <div className="seg vert">
              {[
                { k: 'all',    l: 'すべて' },
                { k: 'recent', l: '1ヶ月以内' },
                { k: 'stale',  l: '3ヶ月以上前' },
              ].map(o => (
                <button key={o.k} className={'seg-btn' + (visitFilter === o.k ? ' on' : '')} onClick={() => setVisitFilter(o.k)}>{o.l}</button>
              ))}
            </div>
          </div>

          <div className="filt-block">
            <div className="filt-label">表示要素</div>
            <label className="check-row"><input type="checkbox" checked={showDistricts} onChange={(e) => setShowDistricts(e.target.checked)} /> 地区境界</label>
            <label className="check-row"><input type="checkbox" checked={showRoads} onChange={(e) => setShowRoads(e.target.checked)} /> 主要道路・河川</label>
            <label className="check-row"><input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} /> 家名ラベル</label>
          </div>

          <div className="filt-block">
            <div className="filt-label">凡例</div>
            {colorBy === 'sect' && MAP_SECTS.map((s, i) => (
              <div key={i} className="legend-row"><span className="legend-dot" style={{background: SECT_COLORS[i]}}></span>{s}</div>
            ))}
            {colorBy === 'visit' && (
              <>
                <div className="legend-row"><span className="legend-dot" style={{background: 'var(--temple-green)'}}></span>1ヶ月以内</div>
                <div className="legend-row"><span className="legend-dot" style={{background: 'var(--temple-blue)'}}></span>1〜3ヶ月</div>
                <div className="legend-row"><span className="legend-dot" style={{background: '#D97706'}}></span>3〜6ヶ月</div>
                <div className="legend-row"><span className="legend-dot" style={{background: 'var(--temple-red)'}}></span>6ヶ月以上</div>
              </>
            )}
            {colorBy === 'scheduled' && (
              <>
                <div className="legend-row"><span className="legend-dot" style={{background: 'var(--temple-red)'}}></span>法要予定あり</div>
                <div className="legend-row"><span className="legend-dot" style={{background: 'hsl(215 16% 70%)'}}></span>予定なし</div>
              </>
            )}
            <div className="legend-row tpl"><TempleGlyph /> 浄妙寺</div>
          </div>
        </aside>

        {/* Map area */}
        <div className="pmap-canvas card">
          <div className="pmap-controls">
            <button className="zoom-btn" onClick={() => setZoom(Math.min(zoom + 0.25, 2))} title="拡大">
              <svg viewBox="0 0 24 24"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
            </button>
            <button className="zoom-btn" onClick={() => setZoom(Math.max(zoom - 0.25, 0.6))} title="縮小">
              <svg viewBox="0 0 24 24"><line x1="5" x2="19" y1="12" y2="12"/></svg>
            </button>
            <button className="zoom-btn" onClick={() => setZoom(1)} title="リセット">
              <svg viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
            </button>
            <div className="pmap-scale">
              <div className="scale-line"></div>
              <div className="scale-label">1km</div>
            </div>
          </div>

          <div className="pmap-frame" style={{ transform: `scale(${zoom})` }}>
            <svg viewBox="0 0 1000 700" className="pmap-svg" preserveAspectRatio="xMidYMid meet">
              {/* Background */}
              <rect x="0" y="0" width="1000" height="700" fill="#f7f5ef" />

              {/* Bay */}
              <path d={SHORE} fill="#cfe2ee" />
              <text x="960" y="380" fontSize="14" fill="#7a96aa" textAnchor="middle" transform="rotate(90 960 380)" letterSpacing="3">東 京 湾</text>

              {/* District polygons */}
              {showDistricts && DISTRICTS.map((dist, i) => (
                <g key={i} className="district">
                  <path d={dist.d} fill="#efeae0" stroke="#d6cdb9" strokeWidth="1" strokeDasharray="3 3" />
                  <text x={dist.d.match(/M (\d+)/)[1] - 0 + 30} y={dist.d.match(/L \d+ (\d+)/)[1] - 0 + 14} fontSize="10" fill="#a3937a" letterSpacing="1">{dist.name}</text>
                </g>
              ))}

              {/* River */}
              {showRoads && <path d={RIVER} fill="none" stroke="#a8c8d8" strokeWidth="6" strokeLinecap="round" opacity="0.6" />}
              {showRoads && <text x="700" y="310" fontSize="9" fill="#7a96aa" letterSpacing="1">目黒川</text>}

              {/* Roads */}
              {showRoads && ROADS.map((r, i) => (
                <path key={i} d={r} fill="none" stroke="#d6cdb9" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
              ))}

              {/* Temple radius indicator */}
              <circle cx={TEMPLE_POS.x} cy={TEMPLE_POS.y} r="200" fill="none" stroke="var(--temple-purple)" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />

              {/* Temple marker */}
              <g transform={`translate(${TEMPLE_POS.x} ${TEMPLE_POS.y})`}>
                <circle r="22" fill="var(--temple-purple)" />
                <circle r="22" fill="none" stroke="white" strokeWidth="3" />
                <g transform="translate(-9 -9)" fill="white">
                  <path d="M9 1 L17 4 L9 7 L1 4 Z"/>
                  <rect x="3" y="6" width="12" height="2"/>
                  <rect x="2" y="14" width="14" height="3"/>
                  <rect x="5" y="8" width="2" height="6"/>
                  <rect x="11" y="8" width="2" height="6"/>
                </g>
                <text y="40" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--temple-purple)">浄妙寺</text>
              </g>

              {/* Family markers */}
              {filtered.map(f => {
                const color = markerColor(f);
                const isSel = f.id === selectedId;
                const isHover = f.id === hoverId;
                return (
                  <g key={f.id}
                     transform={`translate(${f.x} ${f.y})`}
                     onClick={() => setSelectedId(f.id)}
                     onMouseEnter={() => setHoverId(f.id)}
                     onMouseLeave={() => setHoverId(null)}
                     className="map-marker"
                     style={{cursor: 'pointer'}}>
                    {isSel && <circle r="18" fill={color} opacity="0.18">
                      <animate attributeName="r" values="14;22;14" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;0.05;0.3" dur="2s" repeatCount="indefinite" />
                    </circle>}
                    <circle r={isSel ? 11 : (isHover ? 10 : 8)} fill={color} stroke="white" strokeWidth="2.5" />
                    {f.scheduled && <circle r="3" cx="6" cy="-6" fill="var(--temple-red)" stroke="white" strokeWidth="1" />}
                    {showLabels && (
                      <text y={isSel ? 26 : 22} textAnchor="middle" fontSize={isSel ? 11 : 10}
                            fontWeight={isSel ? 700 : 500}
                            fill={isSel ? color : '#3a3530'}
                            style={{pointerEvents: 'none'}}>{f.name}</text>
                    )}
                  </g>
                );
              })}

              {/* Compass */}
              <g transform="translate(70 90)">
                <circle r="22" fill="white" stroke="#d6cdb9" strokeWidth="1" />
                <path d="M 0 -14 L 5 5 L 0 0 L -5 5 Z" fill="var(--temple-red)" />
                <path d="M 0 14 L 5 -5 L 0 0 L -5 -5 Z" fill="#a3937a" />
                <text y="-26" textAnchor="middle" fontSize="9" fontWeight="600" fill="#3a3530">N</text>
              </g>
            </svg>
          </div>

          {/* Count overlay */}
          <div className="pmap-count">表示中 <strong>{filtered.length}</strong> / {MAP_FAMILIES.length}軒</div>
        </div>

        {/* Right detail */}
        <aside className="pmap-detail card">
          {selected ? (
            <>
              <div className="pmd-head" style={{borderTop: `4px solid ${markerColor(selected)}`}}>
                <div className="pmd-id">{selected.id}</div>
                <div className="pmd-name">{selected.name}</div>
                <div className="pmd-head-row">
                  <div>戸主</div><div>{selected.head}</div>
                </div>
              </div>
              <div className="pmd-body">
                <dl className="pmd-meta">
                  <dt>住所</dt><dd>{selected.addr}<span className="dim"> ({selected.district})</span></dd>
                  <dt>宗派</dt><dd>{MAP_SECTS[selected.sect]}</dd>
                  <dt>最終参拝</dt><dd>{fmtParishDate(selected.lastVisit)}<span className="dim"> ({monthsSince(selected.lastVisit)}ヶ月前)</span></dd>
                  <dt>予定法要</dt><dd>{selected.scheduled || <span className="dim">なし</span>}</dd>
                  <dt>本山から</dt><dd>{((Math.sqrt(Math.pow(selected.x - TEMPLE_POS.x, 2) + Math.pow(selected.y - TEMPLE_POS.y, 2)) / 200) * 3).toFixed(1)}km</dd>
                </dl>

                <button className="btn outline w-full" type="button">
                  <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  地図アプリで開く
                </button>
                <button className="btn outline w-full" type="button">
                  <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  檀家詳細を開く
                </button>
              </div>

              <div className="pmd-nearby">
                <div className="pmd-nearby-h">近隣の檀家</div>
                {MAP_FAMILIES
                  .filter(f => f.id !== selected.id)
                  .map(f => ({
                    f,
                    d: Math.sqrt(Math.pow(f.x - selected.x, 2) + Math.pow(f.y - selected.y, 2))
                  }))
                  .sort((a, b) => a.d - b.d)
                  .slice(0, 3)
                  .map(({ f, d }) => (
                    <button key={f.id} className="pmd-nearby-row" onClick={() => setSelectedId(f.id)}>
                      <span className="pmd-nb-marker" style={{background: markerColor(f)}}></span>
                      <span className="pmd-nb-name">{f.name}</span>
                      <span className="pmd-nb-dist">{((d / 200) * 3).toFixed(1)}km</span>
                    </button>
                  ))
                }
              </div>
            </>
          ) : <div className="empty">該当する檀家がありません。</div>}
        </aside>
      </div>
    </div>
  );
}

function TempleGlyph() {
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

Object.assign(window, { ParishMapPage });
