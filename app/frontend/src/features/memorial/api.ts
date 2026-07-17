// 過去帳（memorial register）— 型付き fetch ラッパ。
// dev では vite.config.ts の proxy 設定により /api -> backend(localhost:3002) へ転送される。

import type { DeceasedDetail, DeceasedListItem, DeceasedPayload, HouseholdOption } from './types';

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

  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

function buildQuery(entries: Array<[string, string | undefined]>): string {
  const usp = new URLSearchParams();
  for (const [key, value] of entries) {
    if (value !== undefined && value !== '') usp.set(key, value);
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

export type DeceasedSort = 'recent' | 'name';

export interface DeceasedListParams {
  q?: string;
  householdId?: string;
  sort?: DeceasedSort;
}

export function fetchDeceasedList(params: DeceasedListParams = {}): Promise<DeceasedListItem[]> {
  const qs = buildQuery([
    ['q', params.q],
    ['householdId', params.householdId],
    ['sort', params.sort],
  ]);
  return request<DeceasedListItem[]>(`/deceased${qs}`);
}

export function fetchDeceasedDetail(id: string): Promise<DeceasedDetail> {
  return request<DeceasedDetail>(`/deceased/${encodeURIComponent(id)}`);
}

export function createDeceased(payload: DeceasedPayload): Promise<{ id: string }> {
  return request<{ id: string }>('/deceased', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateDeceased(id: string, payload: DeceasedPayload): Promise<void> {
  return request<void>(`/deceased/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function fetchHouseholdOptions(q: string): Promise<HouseholdOption[]> {
  return request<HouseholdOption[]>(`/households${buildQuery([['q', q]])}`);
}
