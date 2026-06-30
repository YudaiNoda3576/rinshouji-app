// 檀家地図 (parish geographic map view)

import * as React from 'react';
import {
  DISTRICTS,
  MAP_FAMILIES,
  MAP_SECTS,
  RIVER,
  ROADS,
  SECT_COLORS,
  SHORE,
  TEMPLE_POS,
} from '../constants';
import type { ColorBy, MapFamily, VisitFilter } from '../types';
import {
  districtLabelX,
  districtLabelY,
  fmtParishDate,
  monthsSince,
} from '../utils';
import { TempleGlyph } from './TempleGlyph';

const COLOR_OPTIONS: { k: ColorBy; l: string }[] = [
  { k: 'sect',      l: '宗派別' },
  { k: 'visit',     l: '最終参拝' },
  { k: 'scheduled', l: '予定あり' },
];

const VISIT_OPTIONS: { k: VisitFilter; l: string }[] = [
  { k: 'all',    l: 'すべて' },
  { k: 'recent', l: '1ヶ月以内' },
  { k: 'stale',  l: '3ヶ月以上前' },
];

export function ParishMapPage(): React.ReactElement {
  const [colorBy, setColorBy] = React.useState<ColorBy>('sect'); // sect / visit / scheduled
  const [sectFilter, setSectFilter] = React.useState('all');
  const [visitFilter, setVisitFilter] = React.useState<VisitFilter>('all'); // all / recent / stale
  const [showRoads, setShowRoads] = React.useState(true);
  const [showDistricts, setShowDistricts] = React.useState(true);
  const [showLabels, setShowLabels] = React.useState(true);
  const [q, setQ] = React.useState('');
  const [selectedId, setSelectedId] = React.useState('F-0124');
  const [zoom, setZoom] = React.useState(1);
  const [hoverId, setHoverId] = React.useState<string | null>(null);

  const filtered = MAP_FAMILIES.filter(f => {
    if (sectFilter !== 'all' && f.sect !== Number(sectFilter)) return false;
    if (visitFilter === 'recent' && monthsSince(f.lastVisit) > 1) return false;
    if (visitFilter === 'stale' && monthsSince(f.lastVisit) <= 3) return false;
    if (q && !`${f.name} ${f.head} ${f.addr} ${f.district}`.includes(q)) return false;
    return true;
  });

  const markerColor = (f: MapFamily): string => {
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
    const map = new Map<string, number>();
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
              {COLOR_OPTIONS.map(o => (
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
              {VISIT_OPTIONS.map(o => (
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
                  <text x={districtLabelX(dist.d)} y={districtLabelY(dist.d)} fontSize="10" fill="#a3937a" letterSpacing="1">{dist.name}</text>
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
