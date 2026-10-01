/**
 * 大篆字形抓取脚本 (Large Seal glyph scraper)
 *
 * 汉典(zdic.net)字形库没有独立的「大篆」类目。大篆作为西周晚期至战国的
 * 籀文系统，其可得的直系代表是「秦系文字」(qinwenzi)——战国秦文字，为
 * 小篆的直接前身。本脚本把 zdic 的 qinwenzi 字形缓存到 public/glyphs/
 * large-seal/，供字形演变时间线的「大篆」阶段使用。
 *
 * 目标字集：public/common-chars.json（与既有 oracle/bronze/seal 目录的
 * 覆盖规模一致）。缺字的简体字会尝试从对应繁体字形复制。
 *
 * 用法: node scripts/cache-large-seal.mjs
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const COMMON_PATH = path.resolve(ROOT, 'public/common-chars.json');
const SIMP_TRAD_PATH = path.resolve(ROOT, 'public/simp-trad-map.json');
const CACHE_DIR = path.resolve(ROOT, 'public/glyphs/large-seal');

const ZDIC_DIR = 'qinwenzi';
const CONCURRENCY = 10;
const REQUEST_DELAY = 150;
const TIMEOUT_MS = 20000;
const MAX_RETRIES = 2;

// ── HTTP ────────────────────────────────────────────────────────────

function fetchHtml(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'text/html,application/xhtml+xml,*/*',
          'Accept-Language': 'zh-CN,zh;q=0.9',
          Referer: 'https://zdic.net/',
        },
        timeout: TIMEOUT_MS,
      },
      (res) => {
        if ([301, 302, 307, 308].includes(res.statusCode || 0)) {
          const loc = res.headers.location;
          if (loc) {
            resolve(fetchHtml(loc.startsWith('http') ? loc : `https://zdic.net${loc}`));
            return;
          }
        }
        if (res.statusCode !== 200) {
          resolve(null);
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      },
    );
    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
  });
}

function fetchSvg(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Referer: 'https://zdic.net/',
          Accept: 'image/*,*/*',
        },
        timeout: 15000,
      },
      (res) => {
        if ([301, 302, 307, 308].includes(res.statusCode || 0)) {
          const loc = res.headers.location;
          if (loc) {
            resolve(fetchSvg(loc.startsWith('http') ? loc : `https:${loc}`));
            return;
          }
        }
        if (res.statusCode !== 200) {
          resolve(null);
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const data = Buffer.concat(chunks);
          if (data.length < 200) {
            resolve(null);
            return;
          }
          const head = data.toString('utf-8', 0, 100).toLowerCase();
          resolve(head.includes('<svg') || head.includes('<?xml') ? data : null);
        });
      },
    );
    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
  });
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Glyph extraction ────────────────────────────────────────────────

/** Extract qinwenzi SVG URLs from a zdic character page. */
function extractGlyphUrls(html) {
  const re = new RegExp(`//img\\.zdic\\.net/zy/${ZDIC_DIR}/([^"\\s<>'\\]]+\\.svg)`, 'gi');
  const seen = new Set();
  const urls = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    const url = `https://img.zdic.net/zy/${ZDIC_DIR}/${m[1]}`;
    if (seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
  }
  return urls;
}

const hexOf = (ch) => ch.codePointAt(0).toString(16).toUpperCase();
const cachePathOf = (ch) => path.join(CACHE_DIR, `${hexOf(ch)}.svg`);

async function scrapeChar(char) {
  if (fs.existsSync(cachePathOf(char))) return 'skip';

  const url = `https://zdic.net/hans/${encodeURIComponent(char)}`;
  let html = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    html = await fetchHtml(url);
    if (html && html.length > 5000) break;
    if (attempt < MAX_RETRIES) await delay(500 * (attempt + 1));
  }
  if (!html || html.length < 5000) return 'fail';

  const urls = extractGlyphUrls(html);
  if (urls.length === 0) return 'missing';

  for (const u of urls) {
    let data = null;
    for (let attempt = 0; attempt <= 1; attempt++) {
      data = await fetchSvg(u);
      if (data) break;
      await delay(300);
    }
    if (data) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
      fs.writeFileSync(cachePathOf(char), data);
      return 'new';
    }
  }
  return 'missing';
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  const chars = JSON.parse(fs.readFileSync(COMMON_PATH, 'utf-8'));
  const common = Array.isArray(chars) ? chars : Object.keys(chars);
  const simpToTrad = fs.existsSync(SIMP_TRAD_PATH)
    ? new Map(Object.entries(JSON.parse(fs.readFileSync(SIMP_TRAD_PATH, 'utf-8'))))
    : new Map();

  // 详情页按「繁体形」查历史字形（displayChar = traditional || character），
  // 因此繁体 hex 也必须在缓存中。目标集 = 常用字 ∪ 其繁体形。
  const targetSet = new Set(common);
  for (const c of common) {
    const tr = simpToTrad.get(c);
    if (tr) targetSet.add(tr);
  }
  const list = [...targetSet];

  fs.mkdirSync(CACHE_DIR, { recursive: true });

  console.log(`常用字: ${common.length} | 含繁体形目标集: ${list.length} 字`);
  console.log(`数据源: zdic /zy/${ZDIC_DIR} → public/glyphs/large-seal`);
  console.log(`并发: ${CONCURRENCY} | 重试: ${MAX_RETRIES}\n`);

  const stats = { new: 0, skip: 0, missing: 0, fail: 0 };
  const start = Date.now();

  for (let i = 0; i < list.length; i += CONCURRENCY) {
    const batch = list.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map((c) => scrapeChar(c)));
    for (const r of results) stats[r] += 1;

    const done = Math.min(i + CONCURRENCY, list.length);
    const elapsed = (Date.now() - start) / 1000;
    const rate = done / elapsed;
    const remaining = rate > 0 ? (list.length - done) / rate : 0;
    process.stdout.write(
      `\r[${done}/${list.length} ${Math.round((done / list.length) * 100)}%] ` +
        `新增:${stats.new} 跳过:${stats.skip} 无字形:${stats.missing} 失败:${stats.fail} ` +
        `${Math.round(elapsed)}s 预计剩余:${Math.round(remaining)}s    `,
    );

    if (done < list.length) await delay(REQUEST_DELAY);
  }

  // 阶段 2：简繁字形互补（同一字的历史字形一致，任一侧有即复制到另一侧）
  console.log('\n\n阶段 2: 简繁字形互补复制…');
  let copied = 0;
  for (const [simp, trad] of simpToTrad) {
    if (simp === trad) continue;
    const s = cachePathOf(simp);
    const t = cachePathOf(trad);
    const hasS = fs.existsSync(s);
    const hasT = fs.existsSync(t);
    if (!hasS && hasT) {
      fs.copyFileSync(t, s);
      copied += 1;
    } else if (hasS && !hasT) {
      fs.copyFileSync(s, t);
      copied += 1;
    }
  }

  const files = fs.readdirSync(CACHE_DIR).filter((f) => f.endsWith('.svg')).length;
  console.log(`  简繁互补复制: ${copied}`);
  console.log('\n========================================');
  console.log('完成!');
  console.log(`新增: ${stats.new} | 跳过: ${stats.skip} | 无字形: ${stats.missing} | 失败: ${stats.fail}`);
  console.log(`large-seal 目录现有字形: ${files}`);
  console.log(`耗时: ${Math.round((Date.now() - start) / 1000)} 秒`);
}

main().catch(console.error);