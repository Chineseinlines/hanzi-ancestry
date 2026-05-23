/**
 * Glyph scraper v2 — correct URL pattern matching.
 *
 * Fixes the original cache-all.ts which used a wrong regex (data-original attr)
 * that missed most glyphs. This script correctly extracts
 * //img.zdic.net/zy/{script}/{id}.svg URLs from page HTML.
 *
 * Usage: npx tsx scripts/cache-glyphs-v2.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DICT_PATH = path.resolve(__dirname, '../public/hanzi-dict.json');
const CACHE_DIR = path.resolve(__dirname, '../public/glyphs');
const SIMP_TRAD_PATH = path.resolve(__dirname, '../public/simp-trad-map.json');

interface DictEntry {
  c: string;
  d: string;
  p: string[];
  r: string;
  decomposition?: string;
  etymology?: { type: string; phonetic?: string; semantic?: string; hint?: string };
}

// Script directory mapping (zdic zy/ directory → our local directory)
const ZDIC_SCRIPT_MAP: Record<string, string> = {
  jiaguwen:   'oracle',
  jinwen:     'bronze',
  xiaozhuan:  'seal',
  lishu:      'clerical',
};

const ALL_SCRIPTS = ['jiaguwen', 'jinwen', 'xiaozhuan', 'lishu'] as const;

const CONCURRENCY = 10;
const REQUEST_DELAY = 150;
const TIMEOUT_MS = 20000;
const MAX_RETRIES = 3;
const SAVE_INTERVAL = 50; // report progress every N chars

// ── HTTP ────────────────────────────────────────────────────────────

function fetchHtml(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'text/html,application/xhtml+xml,*/*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        Referer: 'https://zdic.net/',
      },
      timeout: TIMEOUT_MS,
    }, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode || 0)) {
        const loc = res.headers.location;
        if (loc) {
          resolve(fetchHtml(loc.startsWith('http') ? loc : `https://zdic.net${loc}`));
          return;
        }
      }
      if (res.statusCode !== 200) { resolve(null); return; }
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

function fetchSvg(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Referer: 'https://zdic.net/',
        Accept: 'image/*,*/*',
      },
      timeout: 15000,
    }, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode || 0)) {
        const loc = res.headers.location;
        if (loc) {
          resolve(fetchSvg(loc.startsWith('http') ? loc : `https:${loc}`));
          return;
        }
      }
      if (res.statusCode !== 200) { resolve(null); return; }
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => {
        const data = Buffer.concat(chunks);
        // Must be SVG and at least a reasonable size
        if (data.length < 200) { resolve(null); return; }
        const head = data.toString('utf-8', 0, 100).toLowerCase();
        if (head.includes('<svg') || head.includes('<?xml')) {
          resolve(data);
        } else {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Glyph extraction ────────────────────────────────────────────────

interface GlyphUrl {
  zdicScript: string;  // e.g. "jiaguwen"
  localScript: string; // e.g. "oracle"
  url: string;         // full https URL
}

/**
 * Extract all ancient glyph URLs from zdic page HTML.
 * Matches: //img.zdic.net/zy/jiaguwen/42_XXXX.svg etc.
 */
function extractGlyphUrls(html: string): GlyphUrl[] {
  const results: GlyphUrl[] = [];
  const seen = new Set<string>();

  // Match ALL img.zdic.net/zy/... URLs regardless of surrounding context
  const re = /\/\/img\.zdic\.net\/zy\/([a-z]+)\/([^\"\s<>'\\\]]+\.svg)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const zdicScript = m[1].toLowerCase();
    const filePath = m[2];
    const localScript = ZDIC_SCRIPT_MAP[zdicScript];
    if (!localScript) continue; // skip chuwenzi, qinwenzi etc.

    const url = `https://img.zdic.net/zy/${zdicScript}/${filePath}`;
    if (seen.has(url)) continue;
    seen.add(url);

    results.push({ zdicScript, localScript, url });
  }

  return results;
}

// ── Per-character worker ────────────────────────────────────────────

interface ScrapeResult {
  char: string;
  url: string;          // the page URL used
  newGlyphs: number;    // how many new SVGs downloaded
  skipped: number;      // already cached
  missing: number;      // not found on page
  error?: string;
}

async function scrapeChar(char: string): Promise<ScrapeResult> {
  const hex = char.codePointAt(0)!.toString(16).toUpperCase();

  // Check which scripts we already have cached
  const cached = new Set<string>();
  const needed = new Set<string>();
  for (const s of ALL_SCRIPTS) {
    const local = ZDIC_SCRIPT_MAP[s];
    const cachePath = path.join(CACHE_DIR, local, `${hex}.svg`);
    if (fs.existsSync(cachePath)) {
      cached.add(local);
    } else {
      needed.add(local);
    }
  }

  if (needed.size === 0) {
    return { char, url: '', newGlyphs: 0, skipped: 4, missing: 0 };
  }

  // Fetch page with retries
  const url = `https://zdic.net/hans/${encodeURIComponent(char)}`;
  let html: string | null = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    html = await fetchHtml(url);
    if (html && html.length > 5000) break;
    if (attempt < MAX_RETRIES) await delay(500 * (attempt + 1));
  }

  if (!html || html.length < 5000) {
    return { char, url, newGlyphs: 0, skipped: cached.size, missing: needed.size, error: 'page fetch failed' };
  }

  // Extract glyph URLs
  const glyphUrls = extractGlyphUrls(html);
  if (glyphUrls.length === 0) {
    return { char, url, newGlyphs: 0, skipped: cached.size, missing: needed.size };
  }

  // Download needed glyphs
  let newGlyphs = 0;
  for (const glyph of glyphUrls) {
    if (!needed.has(glyph.localScript)) continue; // already have it

    // Try a few times
    let data: Buffer | null = null;
    for (let attempt = 0; attempt <= 2; attempt++) {
      data = await fetchSvg(glyph.url);
      if (data) break;
      if (attempt < 2) await delay(300);
    }

    if (data) {
      const cachePath = path.join(CACHE_DIR, glyph.localScript, `${hex}.svg`);
      fs.mkdirSync(path.dirname(cachePath), { recursive: true });
      fs.writeFileSync(cachePath, data);
      newGlyphs++;
      needed.delete(glyph.localScript);
      cached.add(glyph.localScript);
    }
  }

  return {
    char,
    url,
    newGlyphs,
    skipped: cached.size - newGlyphs,
    missing: needed.size,
  };
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  const dict = JSON.parse(fs.readFileSync(DICT_PATH, 'utf-8')) as Record<string, DictEntry>;
  const allChars = Object.keys(dict);

  // Load simp-trad map
  let simpToTraditional: Map<string, string> = new Map();
  if (fs.existsSync(SIMP_TRAD_PATH)) {
    const mapData = JSON.parse(fs.readFileSync(SIMP_TRAD_PATH, 'utf-8'));
    simpToTraditional = new Map(Object.entries(mapData));
  }

  console.log(`字典总字数: ${allChars.length}`);
  console.log(`繁简映射: ${simpToTraditional.size} 对`);
  console.log(`并发数: ${CONCURRENCY} | 重试: ${MAX_RETRIES} | 超时: ${TIMEOUT_MS}ms\n`);

  // Count existing
  let existingCount = 0;
  let totalSlots = 0;
  for (const c of allChars) {
    const hex = c.codePointAt(0)!.toString(16).toUpperCase();
    for (const s of ALL_SCRIPTS) {
      totalSlots++;
      const local = ZDIC_SCRIPT_MAP[s];
      if (fs.existsSync(path.join(CACHE_DIR, local, `${hex}.svg`))) existingCount++;
    }
  }
  console.log(`已有字形: ${existingCount}/${totalSlots} (${(existingCount/totalSlots*100).toFixed(1)}%)\n`);

  // Also count via traditional fallback
  for (const [simp, trad] of simpToTraditional) {
    const simpHex = simp.codePointAt(0)!.toString(16).toUpperCase();
    const tradHex = trad.codePointAt(0)!.toString(16).toUpperCase();
    for (const s of ALL_SCRIPTS) {
      const local = ZDIC_SCRIPT_MAP[s];
      const simpPath = path.join(CACHE_DIR, local, `${simpHex}.svg`);
      const tradPath = path.join(CACHE_DIR, local, `${tradHex}.svg`);
      // If simplified has no glyph but traditional does, we could link
      if (!fs.existsSync(simpPath) && fs.existsSync(tradPath)) {
        // Don't count — just note we'll handle this
      }
    }
  }

  const startTime = Date.now();
  let processed = 0;
  let totalNewGlyphs = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  // Process in batches
  for (let i = 0; i < allChars.length; i += CONCURRENCY) {
    const batch = allChars.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(c => scrapeChar(c)));

    for (const r of results) {
      processed++;
      totalNewGlyphs += r.newGlyphs;
      totalSkipped += r.skipped;
      if (r.error) totalFailed++;
    }

    // Progress
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = processed / elapsed;
    const remaining = (allChars.length - processed) / rate;
    const pct = Math.round((processed / allChars.length) * 100);

    process.stdout.write(
      `\r[${processed}/${allChars.length} ${pct}%] ` +
      `新增: ${totalNewGlyphs} | 跳过: ${totalSkipped} | 失败: ${totalFailed} | ` +
      `${Math.round(elapsed)}s | 预计剩余: ${Math.round(remaining)}s    `
    );

    if (i + CONCURRENCY < allChars.length) {
      await delay(REQUEST_DELAY);
    }
  }

  // Phase 2: also fetch traditional chars to fill in simplified glyphs via copy
  console.log('\n\n阶段 2: 为简化字复制繁体字形...');
  let copied = 0;
  for (const [simp, trad] of simpToTraditional) {
    const simpHex = simp.codePointAt(0)!.toString(16).toUpperCase();
    const tradHex = trad.codePointAt(0)!.toString(16).toUpperCase();

    // If we already scraped the traditional char page, its SVGs may be under tradHex
    // But the simplified char has glyphs under simpHex
    // Let's copy: if trad has a glyph that simp doesn't, symlink/copy it
    for (const s of ALL_SCRIPTS) {
      const local = ZDIC_SCRIPT_MAP[s];
      const simpPath = path.join(CACHE_DIR, local, `${simpHex}.svg`);
      const tradPath = path.join(CACHE_DIR, local, `${tradHex}.svg`);

      if (!fs.existsSync(simpPath) && fs.existsSync(tradPath)) {
        fs.copyFileSync(tradPath, simpPath);
        copied++;
      }
    }
  }
  if (copied > 0) console.log(`  从繁体复制了 ${copied} 个字形文件`);

  // Final stats
  console.log('\n========================================');
  console.log('完成!');
  console.log(`处理字数: ${processed}`);
  console.log(`新增字形: ${totalNewGlyphs}`);
  console.log(`繁→简复制: ${copied}`);
  console.log(`失败: ${totalFailed}`);
  console.log(`耗时: ${Math.round((Date.now() - startTime) / 1000)}秒`);

  // Print final coverage
  let finalCount = 0;
  for (const c of allChars) {
    const hex = c.codePointAt(0)!.toString(16).toUpperCase();
    for (const s of ALL_SCRIPTS) {
      const local = ZDIC_SCRIPT_MAP[s];
      if (fs.existsSync(path.join(CACHE_DIR, local, `${hex}.svg`))) finalCount++;
    }
  }
  console.log(`最终字形: ${finalCount}/${totalSlots} (${(finalCount/totalSlots*100).toFixed(1)}%)`);
}

main().catch(console.error);
