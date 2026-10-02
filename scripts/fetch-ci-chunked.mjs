/**
 * 分块下载 chinese-xinhua 的中文词语释义库（data/ci.json，约 26MB）。
 *
 * 大文件整包下载在弱网下极易中断，故改用 HTTP Range 分块 + 逐块重试，
 * 已完成的分块直接跳过（断点续传）。
 *
 * 产物：scripts/.data/ci.json
 * 用法：GH_TOKEN=xxx node scripts/fetch-ci-chunked.mjs
 */
import { mkdir, writeFile, readFile, appendFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const OWNER = 'pwxcoo';
const REPO = 'chinese-xinhua';
const FILE = 'data/ci.json';
const CHUNK = 2 * 1024 * 1024;
const MAX_ATTEMPTS = 8;

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA = path.join(ROOT, 'scripts', '.data');
const PART = path.join(DATA, 'ci.part');
const OUT = path.join(DATA, 'ci.json');

const token = process.env.GH_TOKEN || '';
const headers = {
  'User-Agent': 'hanzi-ancestry-build',
  Accept: 'application/vnd.github+json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function blobSha() {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/git/trees/master?recursive=1`, { headers });
  if (!res.ok) throw new Error(`trees HTTP ${res.status}`);
  const tree = await res.json();
  const node = tree.tree.find((n) => n.path === FILE);
  if (!node) throw new Error(`not in tree: ${FILE}`);
  return node;
}

async function fetchChunk(url, start, end) {
  const res = await fetch(url, {
    headers: { ...headers, Accept: 'application/vnd.github.raw', Range: `bytes=${start}-${end}` },
  });
  if (res.status !== 206 && res.status !== 200) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const expected = end - start + 1;
  if (res.status === 206 && buf.length !== expected) {
    throw new Error(`short chunk: ${buf.length}/${expected}`);
  }
  return buf;
}

async function main() {
  if (existsSync(OUT)) {
    const s = await stat(OUT);
    if (s.size > 20_000_000) {
      console.log(`[cache] ci.json (${(s.size / 1e6).toFixed(1)} MB)`);
      return;
    }
  }

  const node = await blobSha();
  const total = node.size;
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/git/blobs/${node.sha}`;
  console.log(`[plan] ${(total / 1e6).toFixed(1)} MB / 分块 ${(CHUNK / 1e6).toFixed(1)} MB`);

  await mkdir(DATA, { recursive: true });
  let done = existsSync(PART) ? (await stat(PART)).size : 0;
  if (done === 0) await writeFile(PART, Buffer.alloc(0));
  console.log(`[resume] 已完成 ${(done / 1e6).toFixed(1)} MB`);

  while (done < total) {
    const start = done;
    const end = Math.min(start + CHUNK - 1, total - 1);
    let buf = null;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        buf = await fetchChunk(url, start, end);
        break;
      } catch (err) {
        console.warn(`  [chunk ${(start / 1e6).toFixed(0)}MB] 第 ${attempt} 次失败：${err.message}`);
        await sleep(1500 * attempt);
      }
    }
    if (!buf) throw new Error(`分块 ${start}-${end} 多次重试仍失败`);
    await appendFile(PART, buf);
    done += buf.length;
    process.stdout.write(`\r[progress] ${(done / 1e6).toFixed(1)} / ${(total / 1e6).toFixed(1)} MB`);
  }
  process.stdout.write('\n');

  const full = await readFile(PART);
  const text = full.toString('utf8');
  if (!/^\s*[\[{]/.test(text)) throw new Error('内容不是合法 JSON 起始');
  await writeFile(OUT, full);
  console.log(`[ok] ci.json — ${(full.length / 1e6).toFixed(1)} MB`);
}

main().catch((err) => {
  console.error('\n[fail]', err.message);
  process.exit(1);
});