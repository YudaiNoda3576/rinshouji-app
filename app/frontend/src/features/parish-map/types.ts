// 檀家地図（parish geographic map view）ドメインの型。

// 地図上の檀家1軒分のデータ。
export interface MapFamily {
  id: string;
  name: string;
  head: string;
  addr: string;
  x: number;
  y: number;
  sect: number;
  zone: number;
  lastVisit: string;
  scheduled: string | null;
  district: string;
}

// 地区ポリゴン（名称と SVG path）。
export interface MapDistrict {
  name: string;
  d: string;
}

// 地図上の座標。
export interface MapPoint {
  x: number;
  y: number;
}

// マーカーの色分け基準。
export type ColorBy = 'sect' | 'visit' | 'scheduled';

// 最終参拝フィルタ。
export type VisitFilter = 'all' | 'recent' | 'stale';
