/**
 * One-pass scraper: glyph SVGs + 说文解字 from zdic.net.
 *
 * Usage: npx tsx scripts/cache-all.ts
 *
 * Improvements over cache-glyphs.ts:
 * - 3 retries with exponential backoff
 * - 20s timeout per request
 * - 10 concurrent fetches
 * - Skips already-cached glyphs AND already-scraped shuowen
 * - Priority: top N chars first (default 4000)
 * - Saves incremental progress every 100 chars
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
const SHUOWEN_PATH = path.resolve(__dirname, '../public/shuowen.json');

interface DictEntry {
  c: string;
  d: string;
  p: string[];
  r: string;
  decomposition?: string;
  etymology?: { type: string; phonetic?: string; semantic?: string; hint?: string };
}

interface ShuowenEntry {
  char: string;
  shuowen: string;       // raw 说文 text
  summary: string;        // one-line白话 summary
  structure: string;      // 字形结构 e.g. "左右结构"
  sixBooks: string;       // 六书 e.g. "象形/会意/形声"
}

const SCRIPT_TO_ZDIC: Record<string, string[]> = {
  oracle:   ['jiaguwen'],
  bronze:   ['jinwen'],
  seal:     ['xiaozhuan'],
  clerical: ['lishu'],
};
const SCRIPTS = Object.keys(SCRIPT_TO_ZDIC);

const CONCURRENCY = 10;
const REQUEST_DELAY = 200;
const TIMEOUT_MS = 20000;
const MAX_RETRIES = 3;
const PRIORITY_COUNT = 4000;
const SAVE_INTERVAL = 100;

// ── HTTP helpers ────────────────────────────────────────────────────────

function fetchText(url: string, timeoutMs = TIMEOUT_MS): Promise<string | null> {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'text/html,application/xhtml+xml,*/*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        Referer: 'https://zdic.net/',
      },
      timeout: timeoutMs,
    }, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode || 0)) {
        const loc = res.headers.location;
        if (loc) { resolve(fetchText(loc.startsWith('http') ? loc : `https://zdic.net${loc}`, timeoutMs)); return; }
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

function fetchHttp(url: string, timeoutMs = 15000): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Referer: 'https://zdic.net/',
        Accept: 'image/*,*/*',
      },
      timeout: timeoutMs,
    }, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode || 0)) {
        const loc = res.headers.location;
        if (loc) { resolve(fetchHttp(loc, timeoutMs)); return; }
      }
      if (res.statusCode !== 200) { resolve(null); return; }
      const ct = (res.headers['content-type'] || '').toLowerCase();
      if (ct.includes('text/html') || ct.includes('application/json')) { resolve(null); return; }
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => {
        const data = Buffer.concat(chunks);
        resolve(data.length >= 100 ? data : null);
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Scraping logic ──────────────────────────────────────────────────────

async function fetchWithRetry(url: string, timeoutMs: number, retries: number): Promise<string | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const result = await fetchText(url, timeoutMs);
    if (result && result.length > 1000) return result;
    if (attempt < retries) await delay(500 * (attempt + 1)); // backoff
  }
  return null;
}

function extractShuowen(html: string): string {
  // zdic page has 说文解字 in a structured section
  // Pattern 1: <p> or <span> containing 说文 text after the 说文 header
  // The actual text is usually in a content div near "说文解字" anchor
  const patterns = [
    /說文解字[^<]*<\/[^>]*>\s*<[^>]*>\s*([^<]{20,300}?)\s*</,
    /说文解字[^<]*<\/[^>]*>\s*<[^>]*>\s*([^<]{20,300}?)\s*</,
    /說文[^<]{0,50}?：?\s*([^<]{20,300}?)\s*</,
    /"shuowen"[^>]*>\s*([^<]{20,300}?)\s*</,
  ];

  for (const re of patterns) {
    const m = html.match(re);
    if (m) {
      const text = m[1].replace(/&nbsp;|&lt;|&gt;|&amp;|&quot;/g, ' ').replace(/\s+/g, ' ').trim();
      if (text.length >= 10) return text;
    }
  }

  // Broader search: find the section between 说文 header and next section
  const shuowenIdx = html.indexOf('說文解字') !== -1 ? html.indexOf('說文解字') : html.indexOf('说文解字');
  if (shuowenIdx !== -1) {
    const chunk = html.substring(shuowenIdx, Math.min(html.length, shuowenIdx + 2000));
    // Strip all HTML tags
    const stripped = chunk.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    const keyIdx = stripped.search(/說文解字|说文解字/);
    if (keyIdx !== -1) {
      return stripped.substring(keyIdx + 4, Math.min(stripped.length, keyIdx + 300)).trim();
    }
  }
  return '';
}

function extractStructure(html: string): string {
  const m = html.match(/字形结构[^<]*<[^>]*>\s*([^<\s]{2,8})\s*</);
  if (m) return m[1].trim();
  // Try alt pattern
  const m2 = html.match(/(?:左右|上下|包围|独体|左中右|上中下|品字|全包围|半包围)结构/);
  return m2 ? m2[0] : '';
}

function extractSixBooks(html: string): string {
  const m = html.match(/六书[^<]*<[^>]*>\s*([^<\s]{2,6})\s*</);
  if (m) return m[1].trim();
  const m2 = html.match(/(?:象形|指事|会意|形声|转注|假借)/);
  return m2 ? m2[0] : '';
}

function generateSummary(shuowen: string, etymologyType: string): string {
  if (!shuowen) {
    const templates: Record<string, string> = {
      pictographic: '象形字，以线条描摹事物轮廓。',
      indicative: '指事字，以抽象符号指示意义。',
      ideographic: '会意字，组合多个部件表达含义。',
      pictophonetic: '形声字，形旁表意、声旁表音。',
    };
    return templates[etymologyType] || '';
  }

  // Extract key phrases: look for 象形, 会意, 形声, 从X, X声 etc.
  const keywords: string[] = [];
  if (shuowen.includes('象形')) keywords.push('象形字');
  if (shuowen.includes('会意')) keywords.push('会意字');
  if (shuowen.includes('形声')) keywords.push('形声字');
  if (shuowen.includes('指事')) keywords.push('指事字');

  // Try to extract the core definition phrase
  const defMatch = shuowen.match(/(.{4,30})/);
  let snippet = defMatch ? defMatch[1] : shuowen.substring(0, 40);

  // Trim to reasonable length
  if (snippet.length > 80) snippet = snippet.substring(0, 80) + '...';

  if (keywords.length > 0) {
    return `${keywords[0]}。${snippet}`;
  }
  return snippet;
}

async function scrapeGlyphs(char: string, html: string, hex: string): Promise<number> {
  let found = 0;
  for (const script of SCRIPTS) {
    const cachePath = path.join(CACHE_DIR, script, `${hex}.svg`);
    if (fs.existsSync(cachePath)) { found++; continue; }

    const zdicDirs = SCRIPT_TO_ZDIC[script];
    let data: Buffer | null = null;
    for (const zdicDir of zdicDirs) {
      const re = new RegExp(`data-original="//img\\.zdic\\.net/zy/${zdicDir}/[^"]+\\.svg"`, 'gi');
      const matches = html.match(re);
      if (!matches) continue;

      for (const m of matches) {
        const url = 'https:' + m.slice('data-original="'.length, -1);
        data = await fetchHttp(url);
        if (data) break;
      }
      if (data) break;
    }

    if (data) {
      fs.mkdirSync(path.dirname(cachePath), { recursive: true });
      fs.writeFileSync(cachePath, data);
      found++;
    }
  }
  return found;
}

// ── Per-character worker ────────────────────────────────────────────────

interface ScrapeResult {
  char: string;
  newGlyphs: number;
  shuowenEntry: ShuowenEntry | null;
  error?: string;
}

async function scrapeChar(char: string, entry: DictEntry, shuowenMap: Map<string, ShuowenEntry>): Promise<ScrapeResult> {
  const hex = char.codePointAt(0)!.toString(16).toUpperCase();

  // Check if already fully cached (glyphs + shuowen)
  const allGlyphsCached = SCRIPTS.every(s => fs.existsSync(path.join(CACHE_DIR, s, `${hex}.svg`)));
  const shuowenCached = shuowenMap.has(char);

  if (allGlyphsCached && shuowenCached) {
    return { char, newGlyphs: 0, shuowenEntry: null };
  }

  // Fetch page with retries
  const url = `https://zdic.net/hans/${encodeURIComponent(char)}`;
  const html = await fetchWithRetry(url, TIMEOUT_MS, MAX_RETRIES);

  if (!html || html.length < 5000) {
    return { char, newGlyphs: 0, shuowenEntry: null, error: 'page fetch failed' };
  }

  // Scrape glyphs
  const newGlyphs = allGlyphsCached ? 0 : await scrapeGlyphs(char, html, hex);

  // Scrape 说文
  let shuowenEntry: ShuowenEntry | null = null;
  if (!shuowenCached) {
    const shuowen = extractShuowen(html);
    const structure = extractStructure(html);
    const sixBooks = extractSixBooks(html);
    const etyType = entry.etymology?.type || '';
    const summary = generateSummary(shuowen, etyType);

    shuowenEntry = {
      char,
      shuowen,
      summary,
      structure: structure || sixBooks || '',
      sixBooks: sixBooks || etyType || '',
    };
  }

  return { char, newGlyphs: newGlyphs > 0 ? newGlyphs : 0, shuowenEntry };
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  const dict = JSON.parse(fs.readFileSync(DICT_PATH, 'utf-8')) as Record<string, DictEntry>;
  const allChars = Object.keys(dict);

  // Load existing shuowen data
  let shuowenMap = new Map<string, ShuowenEntry>();
  if (fs.existsSync(SHUOWEN_PATH)) {
    const existing = JSON.parse(fs.readFileSync(SHUOWEN_PATH, 'utf-8')) as Record<string, ShuowenEntry>;
    shuowenMap = new Map(Object.entries(existing));
  }

  // Prioritize: chars with etymology first, then by dictionary order
  const withEty = allChars.filter(c => dict[c].etymology?.type);
  const priority = withEty.slice(0, PRIORITY_COUNT);
  const rest = withEty.slice(PRIORITY_COUNT);

  console.log(`字典总字数: ${allChars.length}`);
  console.log(`有字源数据: ${withEty.length}`);
  console.log(`优先抓取: ${priority.length} 字 (前${PRIORITY_COUNT})`);
  console.log(`已有说文: ${shuowenMap.size} 字`);
  console.log(`并发数: ${CONCURRENCY} | 重试: ${MAX_RETRIES} | 超时: ${TIMEOUT_MS}ms\n`);

  // Count existing glyphs
  let existingGlyphs = 0;
  for (const c of priority) {
    const hex = c.codePointAt(0)!.toString(16).toUpperCase();
    for (const s of SCRIPTS) {
      if (fs.existsSync(path.join(CACHE_DIR, s, `${hex}.svg`))) existingGlyphs++;
    }
  }
  console.log(`优先字已有字形: ${existingGlyphs} / ${priority.length * SCRIPTS.length} (${(existingGlyphs/(priority.length*SCRIPTS.length)*100).toFixed(0)}%)\n`);

  const startTime = Date.now();
  let processed = 0;
  let totalNewGlyphs = 0;
  let totalNewShuowen = 0;
  let failed = 0;

  async function processBatch(chars: string[], label: string) {
    for (let i = 0; i < chars.length; i += CONCURRENCY) {
      const batch = chars.slice(i, i + CONCURRENCY);
      const results = await Promise.all(batch.map(c => scrapeChar(c, dict[c], shuowenMap)));

      for (const r of results) {
        processed++;
        totalNewGlyphs += r.newGlyphs;
        if (r.shuowenEntry) {
          shuowenMap.set(r.char, r.shuowenEntry);
          totalNewShuowen++;
        }
        if (r.error) failed++;
      }

      // Progress
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = processed / elapsed;
      const remaining = (chars.length - processed + (label === 'priority' ? rest.length : 0)) / rate;
      const pct = Math.round((processed / (label === 'priority' ? priority.length : chars.length)) * 100);

      process.stdout.write(`\r[${label}] ${processed}/${label === 'priority' ? priority.length : chars.length} (${pct}%) | 新增字形: ${totalNewGlyphs} | 新增说文: ${totalNewShuowen} | 失败: ${failed} | ${Math.round(elapsed)}s | 预计剩余: ${Math.round(remaining)}s     `);

      // Save progress every SAVE_INTERVAL chars
      if (processed % SAVE_INTERVAL === 0) {
        const obj = Object.fromEntries(shuowenMap);
        fs.writeFileSync(SHUOWEN_PATH, JSON.stringify(obj, null, 2), 'utf-8');
      }

      if (i + CONCURRENCY < chars.length) {
        await delay(REQUEST_DELAY);
      }
    }
  }

  // Phase 1: Priority characters
  await processBatch(priority, '优先字');

  // Phase 2: Rest
  if (rest.length > 0) {
    console.log('\n');
    await processBatch(rest, '剩余字');
  }

  // Final save
  const obj = Object.fromEntries(shuowenMap);
  fs.writeFileSync(SHUOWEN_PATH, JSON.stringify(obj, null, 2), 'utf-8');

  console.log('\n\n========================================');
  console.log('完成!');
  console.log(`处理字数: ${processed}`);
  console.log(`新增字形: ${totalNewGlyphs}`);
  console.log(`说文解字: ${shuowenMap.size} 字`);
  console.log(`失败: ${failed}`);
  console.log(`耗时: ${Math.round((Date.now() - startTime) / 1000)}秒`);
  console.log(`说文已保存到: ${SHUOWEN_PATH}`);
}

main().catch(console.error);
