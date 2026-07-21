// parishioners（檀家管理）の API クライアント。dev では vite proxy 経由で backend(/api) に接続する。

import type {
  District,
  HouseholdDetail,
  HouseholdForm,
  HouseholdListResponse,
  HouseholdSort,
} from './types';

const BASE = '/api';

// レスポンスを検証して JSON を返す。失敗時は `{ error }` を優先して Error を throw する。
async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw await toError(res);
  }
  return (await res.json()) as T;
}

// ボディを返さない（204 等）エンドポイント用。失敗時のみ Error を throw する。
async function ensureOk(res: Response): Promise<void> {
  if (!res.ok) {
    throw await toError(res);
  }
}

async function toError(res: Response): Promise<Error> {
  let message = `通信に失敗しました (HTTP ${res.status})`;
  try {
    const body = (await res.json()) as { error?: unknown };
    if (body && typeof body.error === 'string') message = body.error;
  } catch {
    // JSON でないエラーレスポンスはステータス由来のメッセージのままにする。
  }
  return new Error(message);
}

export interface HouseholdQuery {
  q?: string;
  districtId?: number | null;
  relationType?: string;
  includeInactive?: boolean;
  sort?: HouseholdSort;
  page?: number;
}

export function fetchDistricts(signal?: AbortSignal): Promise<District[]> {
  return fetch(`${BASE}/districts`, { signal }).then(res => parseJson<District[]>(res));
}

export function fetchHouseholds(
  query: HouseholdQuery,
  signal?: AbortSignal,
): Promise<HouseholdListResponse> {
  const params = new URLSearchParams();
  if (query.q && query.q.trim() !== '') params.set('q', query.q.trim());
  if (query.districtId != null) params.set('districtId', String(query.districtId));
  if (query.relationType) params.set('relationType', query.relationType);
  if (query.includeInactive) params.set('includeInactive', 'true');
  if (query.sort) params.set('sort', query.sort);
  if (query.page != null) params.set('page', String(query.page));
  const qs = params.toString();
  return fetch(`${BASE}/households${qs ? `?${qs}` : ''}`, { signal }).then(res =>
    parseJson<HouseholdListResponse>(res),
  );
}

export function fetchHousehold(id: number, signal?: AbortSignal): Promise<HouseholdDetail> {
  return fetch(`${BASE}/households/${id}`, { signal }).then(res =>
    parseJson<HouseholdDetail>(res),
  );
}

// フォーム値を API ボディへ変換する（空文字は送らない）。
function toBody(form: HouseholdForm): Record<string, unknown> {
  const optionalText = (v: string): string | undefined => {
    const trimmed = v.trim();
    return trimmed === '' ? undefined : trimmed;
  };
  return {
    familyName: form.familyName.trim(),
    headName: form.headName.trim(),
    headKana: optionalText(form.headKana),
    districtId: form.districtId ?? undefined,
    relationType: form.relationType || undefined,
    postalCode: optionalText(form.postalCode),
    address1: optionalText(form.address1),
    address2: optionalText(form.address2),
    phone: optionalText(form.phone),
    mobilePhone: optionalText(form.mobilePhone),
    hannyaService: form.hannyaService || undefined,
    sejikiService: form.sejikiService || undefined,
    tanagyoSchedule: optionalText(form.tanagyoSchedule),
    monthlyServiceDay: optionalText(form.monthlyServiceDay),
    jizoFlag: form.jizoFlag,
    ihaiStatus: form.ihaiStatus || undefined,
    note: optionalText(form.note),
  };
}

export function createHousehold(form: HouseholdForm): Promise<{ id: number }> {
  return fetch(`${BASE}/households`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toBody(form)),
  }).then(res => parseJson<{ id: number }>(res));
}

export function updateHousehold(id: number, form: HouseholdForm): Promise<void> {
  // 状態（active/inactive）は編集モーダルで扱うため併せて送る。
  return fetch(`${BASE}/households/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...toBody(form), status: form.status }),
  }).then(ensureOk);
}

export function deleteHousehold(id: number): Promise<void> {
  return fetch(`${BASE}/households/${id}`, { method: 'DELETE' }).then(ensureOk);
}
