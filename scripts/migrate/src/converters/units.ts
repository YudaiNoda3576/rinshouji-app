/**
 * 納骨堂区分・墓地区分の行生成判定。
 */
import { extractInt, toHalfWidthAlnum, trimAll } from './text.js';
import { parsePaidOn, type PaidOnParse } from './wareki.js';

const NONE_VALUES = new Set(['なし', '無し', '無']);

export interface ColumbariumParse {
  readonly create: boolean;
  readonly unitCode: string | null;
  readonly unitType: '区画' | '一時' | '合葬' | null;
  readonly note: string | null;
  /** 種別を確定できずコードでもない（返還/あり等）場合 true。 */
  readonly ambiguous: boolean;
}

/**
 * 納骨堂区分。なし/空→行なし。一時/合葬/区画コードを判別し、判別不能はメモ扱い。
 */
export function parseColumbarium(raw: string): ColumbariumParse {
  const value = trimAll(raw);
  if (value === '' || NONE_VALUES.has(value)) {
    return { create: false, unitCode: null, unitType: null, note: null, ambiguous: false };
  }
  if (value.includes('一時')) {
    const memo = trimAll(value.replace('一時', ''));
    return {
      create: true,
      unitCode: null,
      unitType: '一時',
      note: memo === '' ? null : memo.slice(0, 255),
      ambiguous: false,
    };
  }
  if (value.includes('合葬')) {
    const memo = trimAll(value.replace('合葬', ''));
    return {
      create: true,
      unitCode: null,
      unitType: '合葬',
      note: memo === '' ? null : memo.slice(0, 255),
      ambiguous: false,
    };
  }
  if (looksLikeUnitCode(value)) {
    return {
      create: true,
      unitCode: value.slice(0, 30),
      unitType: '区画',
      note: null,
      ambiguous: false,
    };
  }
  // 「あり」「返還」等：種別不明のメモとして残す。
  return {
    create: true,
    unitCode: null,
    unitType: null,
    note: value.slice(0, 255),
    ambiguous: true,
  };
}

function looksLikeUnitCode(value: string): boolean {
  // 方位・区画記号（い/ろ/は/に/へ 等）＋数字＋区切りを含む典型コード。
  return /[北南東西中]/.test(value) && /[０-９0-9]/.test(value);
}

export interface CemeteryParse {
  readonly create: boolean;
  readonly plotCode: string | null;
  readonly widthCm: number | null;
  readonly fee: number | null;
  readonly paidOn: PaidOnParse;
  readonly paidOnRaw: string | null;
  readonly note: string | null;
  /** ？等を含み目視確認が望ましい場合 true。 */
  readonly needsReview: boolean;
}

/**
 * 墓地区分。なし/空→行なし。コードを plot_code へ、幅・代金を数値化、入金を DATE 化。
 */
export function parseCemetery(
  plot: string,
  width: string,
  fee: string,
  paidIn: string,
  note: string,
): CemeteryParse {
  const code = trimAll(plot);
  if (code === '' || NONE_VALUES.has(code)) {
    return emptyCemetery();
  }
  const paidRaw = trimAll(paidIn);
  const noteVal = trimAll(note);
  return {
    create: true,
    plotCode: code.slice(0, 20),
    widthCm: extractInt(toHalfWidthAlnum(width)),
    fee: extractInt(toHalfWidthAlnum(fee)),
    paidOn: parsePaidOn(paidRaw),
    paidOnRaw: paidRaw === '' ? null : paidRaw.slice(0, 20),
    note: noteVal === '' ? null : noteVal.slice(0, 255),
    needsReview: /[？?]/.test(code),
  };
}

function emptyCemetery(): CemeteryParse {
  return {
    create: false,
    plotCode: null,
    widthCm: null,
    fee: null,
    paidOn: { date: null, ambiguous: false, assumedShowa: false },
    paidOnRaw: null,
    note: null,
    needsReview: false,
  };
}
