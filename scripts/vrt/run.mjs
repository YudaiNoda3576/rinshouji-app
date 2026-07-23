#!/usr/bin/env node
// run.mjs — フロントエンド ビジュアルリグレッションテスト(VRT)ハーネス
// 使い方:
//   npm run vrt         … baseline と current を比較
//   npm run vrt:update  … current を baseline として登録(比較は行わない)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE_URL = process.env.BASE_URL || 'http://localhost:8123';
const CHROME_PATH =
  process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const UPDATE = process.argv.includes('--update');

const DIFF_RATIO_LIMIT = 0.001; // 差分ピクセル率0.1%を超えたらFAIL
const PIXELMATCH_THRESHOLD = 0.1;

const BASELINE_DIR = path.join(__dirname, 'baseline');
const OUTPUT_DIR = path.join(__dirname, 'output');
const CURRENT_DIR = path.join(OUTPUT_DIR, 'current');
const DIFF_DIR = path.join(OUTPUT_DIR, 'diff');

const VIEWPORTS = {
  sp: { width: 375, height: 812 },
  pc: { width: 1440, height: 900 },
};

// 予定管理内のビュー切替ボタン(.cv-btn)のラベルとファイル名サフィックスの対応
const SCHEDULE_VIEWS = [
  { suffix: 'day', label: '日' },
  { suffix: 'week', label: '週' },
  { suffix: 'month', label: '月' },
  { suffix: 'agenda', label: 'スケジュール' },
];

// アニメーション・トランジション・キャレットを無効化し撮影を決定論的にするCSS
const DETERMINISM_CSS = `
*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}
html{scroll-behavior:auto!important}
.toast-stack{display:none!important}
`;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// BASE_URLへの疎通確認
async function checkServerUp() {
  try {
    const res = await fetch(BASE_URL, { method: 'GET' });
    return res.status < 500;
  } catch {
    return false;
  }
}

// 決定論性確保のためのスタイルをページに注入する
async function injectDeterminismStyle(page) {
  await page.evaluate((css) => {
    const style = document.createElement('style');
    style.setAttribute('data-vrt', '1');
    style.textContent = css;
    document.head.appendChild(style);
  }, DETERMINISM_CSS);
}

// Webフォントの読み込み完了を待つ
async function waitForFonts(page) {
  await page.evaluate(() =>
    document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()
  );
}

// 指定セレクタの中からテキストが完全一致する要素をクリックする
async function clickByText(page, selector, text) {
  const clicked = await page.evaluate(
    (selector, text) => {
      const els = Array.from(document.querySelectorAll(selector));
      const el = els.find((e) => e.textContent.trim() === text);
      if (el) {
        el.click();
        return true;
      }
      return false;
    },
    selector,
    text
  );
  if (!clicked) {
    throw new Error(`要素が見つかりません: ${selector} "${text}"`);
  }
}

// ログインフォームにcontrolled input対応の方法で値を入れて送信する
async function login(page) {
  await page.evaluate(() => {
    const setVal = (el, v) => {
      const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      s.call(el, v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    const inputs = document.querySelectorAll('form input');
    setVal(inputs[0], 'tera-admin');
    setVal(inputs[1], 'temple2024');
    document.querySelector('form').requestSubmit();
  });
  // ログイン成功後、ナビゲーションが出現するまで待つ
  await page.waitForFunction(() => document.querySelector('.nav-item') !== null, {
    timeout: 10000,
  });
}

// 1シナリオを撮影し、更新モードならbaseline登録、通常モードならbaselineと比較する
async function captureOne(page, name, results) {
  const currentPath = path.join(CURRENT_DIR, `${name}.png`);
  await page.screenshot({ path: currentPath, fullPage: false });

  if (UPDATE) {
    const baselinePath = path.join(BASELINE_DIR, `${name}.png`);
    fs.copyFileSync(currentPath, baselinePath);
    results.push({ name, status: 'updated' });
    return;
  }

  results.push(compareToBaseline(name));
}

// current画像とbaseline画像をpixelmatchで比較する
function compareToBaseline(name) {
  const baselinePath = path.join(BASELINE_DIR, `${name}.png`);
  const currentPath = path.join(CURRENT_DIR, `${name}.png`);

  if (!fs.existsSync(baselinePath)) {
    return { name, status: 'new', message: 'NEW (vrt:update で登録してください)' };
  }

  const baselineImg = PNG.sync.read(fs.readFileSync(baselinePath));
  const currentImg = PNG.sync.read(fs.readFileSync(currentPath));

  if (baselineImg.width !== currentImg.width || baselineImg.height !== currentImg.height) {
    return {
      name,
      status: 'fail',
      message: `画像サイズ不一致 baseline:${baselineImg.width}x${baselineImg.height} current:${currentImg.width}x${currentImg.height}`,
    };
  }

  const { width, height } = baselineImg;
  const diff = new PNG({ width, height });
  const diffPixels = pixelmatch(baselineImg.data, currentImg.data, diff.data, width, height, {
    threshold: PIXELMATCH_THRESHOLD,
  });

  const diffRatio = diffPixels / (width * height);

  ensureDir(DIFF_DIR);
  fs.writeFileSync(path.join(DIFF_DIR, `${name}.png`), PNG.sync.write(diff));

  if (diffRatio > DIFF_RATIO_LIMIT) {
    return {
      name,
      status: 'fail',
      message: `差分 ${(diffRatio * 100).toFixed(3)}% (${diffPixels}px)`,
    };
  }

  return { name, status: 'pass', message: `差分 ${(diffRatio * 100).toFixed(3)}%` };
}

// 1つのビューポートに対して dashboard / schedule-* の全シナリオを撮影する
async function captureViewport(browser, vpName, vpSize, results) {
  const page = await browser.newPage();
  await page.setViewport({ ...vpSize, deviceScaleFactor: 1 });

  await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 60000 });
  await injectDeterminismStyle(page);
  await waitForFonts(page);

  await login(page);
  await waitForFonts(page);
  await sleep(300);

  await captureOne(page, `${vpName}-dashboard`, results);

  // 予定管理へ遷移
  await clickByText(page, '.nav-item', '予定管理');
  await page.waitForFunction(() => document.querySelector('.cv-btn') !== null, {
    timeout: 10000,
  });

  for (const v of SCHEDULE_VIEWS) {
    await clickByText(page, '.cv-btn', v.label);
    await sleep(300);
    await captureOne(page, `${vpName}-schedule-${v.suffix}`, results);
  }

  await page.close();
}

// 結果サマリを日本語で表示する
function printSummary(results) {
  console.log('\n=== VRT 結果サマリ ===');
  let pass = 0,
    fail = 0,
    neu = 0,
    updated = 0;
  for (const r of results) {
    let label = '?';
    if (r.status === 'pass') {
      label = 'PASS';
      pass++;
    } else if (r.status === 'fail') {
      label = 'FAIL';
      fail++;
    } else if (r.status === 'new') {
      label = 'NEW ';
      neu++;
    } else if (r.status === 'updated') {
      label = 'UPDATED';
      updated++;
    }
    console.log(`[${label}] ${r.name}${r.message ? ' - ' + r.message : ''}`);
  }
  console.log('----------------------');
  if (UPDATE) {
    console.log(`ベースラインを更新しました: ${updated}件`);
  } else {
    console.log(`PASS: ${pass}件 / FAIL: ${fail}件 / NEW: ${neu}件`);
  }
  return { pass, fail, neu, updated };
}

async function main() {
  console.log(`VRTを開始します (BASE_URL=${BASE_URL})`);

  const up = await checkServerUp();
  if (!up) {
    console.error(`\n${BASE_URL} に接続できませんでした。`);
    console.error('docker compose up -d を実行してください。');
    process.exit(1);
    return;
  }

  ensureDir(BASELINE_DIR);
  ensureDir(CURRENT_DIR);
  ensureDir(DIFF_DIR);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--hide-scrollbars', '--force-color-profile=srgb', '--disable-gpu'],
  });

  const results = [];
  try {
    for (const [vpName, vpSize] of Object.entries(VIEWPORTS)) {
      await captureViewport(browser, vpName, vpSize, results);
    }
  } finally {
    await browser.close();
  }

  const summary = printSummary(results);

  if (!UPDATE && (summary.fail > 0 || summary.neu > 0)) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('VRT実行中にエラーが発生しました:', err);
  process.exit(1);
});
