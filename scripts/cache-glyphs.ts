/**
 * Pre-cache ancient glyph SVGs from zdic.net for all characters in the dictionary.
 *
 * Usage: npx tsx scripts/cache-glyphs.ts
 *
 * This scrapes zdic.net character pages to find oracle/bronze/seal/clerical SVG images
 * and saves them to public/glyphs/{script}/{codepoint}.svg for production deployment.
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

interface DictEntry {
  c: string;
  d: string;
  p: string[];
  r: string;
  etymology?: { type: string };
}

const SCRIPT_TO_ZDIC: Record<string, string[]> = {
  oracle:   ['jiaguwen'],
  bronze:   ['jinwen'],
  seal:     ['xiaozhuan'],
  clerical: ['lishu', 'qinwenzi'],
};

const SCRIPTS = Object.keys(SCRIPT_TO_ZDIC);
const CONCURRENCY = 6;
const REQUEST_DELAY = 300; // ms between batches to avoid rate limiting

function fetchText(url: string, timeoutMs = 12000): Promise<string | null> {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'text/html,*/*',
      },
      timeout: timeoutMs,
    }, (res) => {
      if (res.statusCode !== 200) { resolve(null); return; }
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

function fetchHttp(url: string, timeoutMs = 8000): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Referer: 'https://www.zdic.net/',
        Accept: 'image/*,*/*',
      },
      timeout: timeoutMs,
    }, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode || 0)) {
        const redirectUrl = res.headers.location;
        if (redirectUrl) { resolve(fetchHttp(redirectUrl, timeoutMs)); return; }
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

async function scrapeZdicGlyph(char: string, zdicDir: string): Promise<Buffer | null> {
  const pageUrl = `https://www.zdic.net/hans/${encodeURIComponent(char)}`;
  const html = await fetchText(pageUrl);
  if (!html) return null;

  const re = new RegExp(`data-original="//img\\.zdic\\.net/zy/${zdicDir}/[^"]+\\.svg"`, 'gi');
  const matches = html.match(re);
  if (!matches || matches.length === 0) return null;

  for (const m of matches) {
    const url = 'https:' + m.slice('data-original="'.length, -1);
    const data = await fetchHttp(url);
    if (data) return data;
  }
  return null;
}

async function processChar(char: string): Promise<number> {
  let found = 0;
  const hex = char.codePointAt(0)!.toString(16).toUpperCase();

  for (const script of SCRIPTS) {
    const cachePath = path.join(CACHE_DIR, script, `${hex}.svg`);
    if (fs.existsSync(cachePath)) {
      found++;
      continue; // already cached
    }

    const zdicDirs = SCRIPT_TO_ZDIC[script];
    let data: Buffer | null = null;
    for (const zdicDir of zdicDirs) {
      data = await scrapeZdicGlyph(char, zdicDir);
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

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const dict = JSON.parse(fs.readFileSync(DICT_PATH, 'utf-8')) as Record<string, DictEntry>;
  const chars = Object.keys(dict).filter(c => dict[c].etymology?.type);

  // Count existing cache
  let totalCached = 0;
  for (const c of chars) {
    const hex = c.codePointAt(0)!.toString(16).toUpperCase();
    for (const script of SCRIPTS) {
      if (fs.existsSync(path.join(CACHE_DIR, script, `${hex}.svg`))) totalCached++;
    }
  }
  const totalPossible = chars.length * SCRIPTS.length;

  console.log(`字典总字数: ${Object.keys(dict).length}`);
  console.log(`有字源数据: ${chars.length}`);
  console.log(`已缓存字形: ${totalCached} / ${totalPossible} (${Math.round(totalCached/totalPossible*100)}%)\n`);

  // Process in batches
  let processed = 0;
  let newlyCached = 0;
  const startTime = Date.now();

  for (let i = 0; i < chars.length; i += CONCURRENCY) {
    const batch = chars.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(c => processChar(c)));
    newlyCached += results.reduce((a, b) => a + b, 0);
    processed += batch.length;

    const elapsed = (Date.now() - startTime) / 1000;
    const rate = processed / elapsed;
    const remaining = (chars.length - processed) / rate;

    process.stdout.write(`\r进度: ${processed}/${chars.length} (${Math.round(processed/chars.length*100)}%) | 新增缓存: ${newlyCached} | 耗时: ${Math.round(elapsed)}s | 预计剩余: ${Math.round(remaining)}s     `);

    if (i + CONCURRENCY < chars.length) {
      await delay(REQUEST_DELAY);
    }
  }

  console.log('\n\n完成! 共处理', processed, '字, 新增缓存', newlyCached, '个字形图片');
  console.log(`耗时: ${Math.round((Date.now() - startTime) / 1000)}秒`);
}

main().catch(console.error);
