/**
 * Vite plugin: Glyph Image Cache Proxy
 *
 * Intercepts `/glyph/{script}/{hex}` requests, scrapes the zdic.net character
 * page to find ancient script SVG images, and caches them to disk.
 *
 * On first request: fetches zdic page → extracts image URLs → downloads image
 * → saves to public/glyphs/ → returns image. Subsequent reads from cache.
 * If zdic has no image: returns 404 → frontend shows font fallback.
 */
import type { Plugin } from 'vite';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

const CACHE_DIR = 'public/glyphs';

/** Map our script keys → zdic.net /zy/ directory names (tried in order) */
const SCRIPT_TO_ZDIC: Record<string, string[]> = {
  oracle:   ['jiaguwen'],
  bronze:   ['jinwen'],
  seal:     ['xiaozhuan'],
  clerical: ['lishu', 'qinwenzi'],
};

export function glyphCachePlugin(): Plugin {
  return {
    name: 'glyph-cache',
    configureServer(server) {
      const cacheRoot = path.resolve(process.cwd(), CACHE_DIR);

      // NOTE: do NOT mount at '/glyph' — connect strips the prefix from req.url
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/glyph/')) return next();

        // Parse path: /glyph/oracle/4E00
        const match = req.url.match(/^\/glyph\/(\w+)\/([0-9A-Fa-f]+)/);
        if (!match) return next();

        const [, script, hex] = match;
        const zdicDirs = SCRIPT_TO_ZDIC[script];
        if (!zdicDirs) return next();

        const hexUpper = hex.toUpperCase();
        const cachePath = path.join(cacheRoot, script, `${hexUpper}.svg`);

        // Serve from disk cache
        if (fs.existsSync(cachePath)) {
          serveFile(res, cachePath);
          return;
        }

        // Not cached — convert hex to character and scrape zdic
        const char = String.fromCodePoint(parseInt(hex, 16));
        let data: Buffer | null = null;

        for (const zdicDir of zdicDirs) {
          data = await fetchZdicGlyph(char, zdicDir);
          if (data) break;
        }

        if (data) {
          fs.mkdirSync(path.dirname(cachePath), { recursive: true });
          fs.writeFileSync(cachePath, data);
          serveData(res, data);
        } else {
          res.statusCode = 404;
          res.end();
        }
      });
    },
  };
}

/**
 * Scrape zdic.net character page to find an ancient script SVG image.
 * Returns the image data for the first matching script, or null.
 */
async function fetchZdicGlyph(char: string, zdicDir: string): Promise<Buffer | null> {
  const pageUrl = `https://www.zdic.net/hans/${encodeURIComponent(char)}`;
  const html = await fetchText(pageUrl);
  if (!html) return null;

  // Extract image URLs matching the target zdic script directory.
  // Pattern: data-original="//img.zdic.net/zy/jiaguwen/52_EA02.svg"
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

/** Fetch a URL and return response body as Buffer, or null on failure */
function fetchHttp(url: string, timeoutMs = 8000): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Referer: 'https://www.zdic.net/',
          Accept: 'image/*,*/*',
        },
        timeout: timeoutMs,
      },
      (res) => {
        if ([301, 302, 307, 308].includes(res.statusCode || 0)) {
          const redirectUrl = res.headers.location;
          if (redirectUrl) {
            resolve(fetchHttp(redirectUrl, timeoutMs));
            return;
          }
        }
        if (res.statusCode !== 200) {
          resolve(null);
          return;
        }
        const ct = (res.headers['content-type'] || '').toLowerCase();
        if (ct.includes('text/html') || ct.includes('application/json')) {
          resolve(null);
          return;
        }
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => {
          const data = Buffer.concat(chunks);
          resolve(data.length >= 100 ? data : null);
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

/** Fetch a URL and return the response as text, or null on failure */
function fetchText(url: string, timeoutMs = 10000): Promise<string | null> {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'text/html,*/*',
        },
        timeout: timeoutMs,
      },
      (res) => {
        if (res.statusCode !== 200) {
          resolve(null);
          return;
        }
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
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

function serveFile(res: http.ServerResponse, filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext] || 'image/svg+xml';
  res.setHeader('Content-Type', mime);
  res.setHeader('Cache-Control', 'public, max-age=86400');
  fs.createReadStream(filePath).pipe(res);
}

function serveData(res: http.ServerResponse, data: Buffer) {
  const mime = detectMime(data);
  res.setHeader('Content-Type', mime);
  res.setHeader('Content-Length', data.length);
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.end(data);
}

const MIME_TYPES: Record<string, string> = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

function detectMime(data: Buffer): string {
  if (data.length < 4) return 'image/svg+xml';
  if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47) return 'image/png';
  if (data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46) return 'image/gif';
  if (data[0] === 0xff && data[1] === 0xd8) return 'image/jpeg';
  if (data[0] === 0x3c) return 'image/svg+xml';
  return 'image/svg+xml';
}
