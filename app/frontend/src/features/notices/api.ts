// 年忌案内 — 型付き fetch ラッパ（memorial/api.ts と同一パターン）。
// dev では vite.config.ts の proxy 設定により /api -> backend(localhost:3002) へ転送される。

import type { NoticeCase } from './types';

const BASE = '/api';

interface ApiErrorBody {
  error?: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
  } catch {
    throw new Error('サーバーに接続できませんでした。ネットワーク状態を確認してください。');
  }

  if (!res.ok) {
    let message = `リクエストに失敗しました（status ${res.status}）`;
    try {
      const body = (await res.json()) as ApiErrorBody;
      if (body && typeof body.error === 'string' && body.error.trim() !== '') {
        message = body.error;
      }
    } catch {
      // レスポンスが JSON でない場合は既定メッセージのまま扱う。
    }
    throw new Error(message);
  }

  return (await res.json()) as T;
}

// GET /api/notices?monthsAhead=N
// 基準日（サーバの今日）から monthsAhead ヶ月以内に実施日が入る年忌案内を取得する。
// ※ 送付状態は未永続化のため、全件 status='pending' で返る（types.ts の NoticeCase 参照）。
export function fetchNotices(monthsAhead: number): Promise<NoticeCase[]> {
  const usp = new URLSearchParams({ monthsAhead: String(monthsAhead) });
  return request<NoticeCase[]>(`/notices?${usp.toString()}`);
}

// POST /api/notices/pdf
// 案内配列 + テンプレ本文（変数は {{ }} 記法。サーバ側で置換）を渡し、1件1ページの
// 単一PDF（application/pdf）を Blob で受け取る。JSON を返さないため request() は使わない。
export async function fetchNoticesPdf(notices: NoticeCase[], templateBody: string): Promise<Blob> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/notices/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notices, templateBody }),
    });
  } catch {
    throw new Error('サーバーに接続できませんでした。ネットワーク状態を確認してください。');
  }

  if (!res.ok) {
    let message = `PDFの生成に失敗しました（status ${res.status}）`;
    try {
      const body = (await res.json()) as ApiErrorBody;
      if (body && typeof body.error === 'string' && body.error.trim() !== '') {
        message = body.error;
      }
    } catch {
      // レスポンスが JSON でない場合は既定メッセージのまま扱う。
    }
    throw new Error(message);
  }

  return res.blob();
}
