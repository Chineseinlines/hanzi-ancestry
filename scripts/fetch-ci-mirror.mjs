/**
 * 经镜像站并发分块下载 chinese-xinhua 的中文词语释义库（data/ci.json，约 26MB）。
 *
 * GitHub 直连与 API 在此网络环境下不可用；实测 gh-proxy.com 镜像可稳定提供
 * Range 请求。单连接速度仅 ~14KB/s，故改为多连接并发抓取分块（默认 6 路），
 * 每块单独落盘，已完成分块直接跳过（断点续传），最后按序拼接。
 *
 * 产物：scripts/.data/ci.json
 * 用法：node scripts/fetch-ci-mirror.mjs
 */
import { mkdir, writeFile, readFile, stat, readdir, unlink } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';

const RAW = 'https://raw.githubusercontent.com/pwxcoo/chinese-xinhua/master/data/ci.json';
const MIRRORS = [
  { label: 'gh-proxy', url: `https://gh-proxy.com/${RAW}` },
  { label: 'ghproxy.net', url: `https://ghproxy.net/${RAW}` },
];
const CHUNK = 1024 * 1024;
const CONCURRENCY = 6;
const MAX_ATTEMPTS = 8;

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA = path.join(ROOT, 'scripts', '.data');
const PART = path.join(DATA, 'ci.part');
const PARTS = path.join(DATA, 'ci.parts');
const OUT = path.join(DATA, 'ci.json');

const UA = { 'User-Agent': 'hanzi-ancestry-build' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function totalSize(mirror) {
  const res = await fetch(mirror.url, { headers: { ...UA, Range: 'bytes=0-0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const cr = res.headers.get('content-range') || '';
  const m = /\/(\d+)$/.exec(cr);
  if (!m) throw new Error(`no content-range: ${cr}`);
  await res.arrayBuffer();
  return Number(m[1]);
}

async function fetchChunk(mirror, start, end) {
  const res = await fetch(mirror.url, { headers: { ...UA, Range: `bytes=${start}-${end}` } });
  if (res.status !== 206 && res.status !== 200) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const expected = end - start + 1;
  if (buf.length !== expected) throw new Error(`short chunk: ${buf.length}/${expected}`);
  return buf;
}

async function main() {
  if (existsSync(OUT) && (await stat(OUT)).size > 20_000_000) {
    console.log(`[cache] ci.json (${((await stat(OUT)).size / 1e6).toFixed(1)} MB)`);
    return;
  }
  await mkdir(DATA, { recursive: true });
  await mkdir(PARTS, { recursive: true });

  let mirror = null;
  let total = 0;
  for (const m of MIRRORS) {
    try {
      total = await totalSize(m);
      mirror = m;
      console.log(`[plan] 源=${m.label} 总大小=${(total / 1e6).toFixed(1)} MB / 分块 ${(CHUNK / 1e6).toFixed(1)} MB × ${CONCURRENCY} 并发`);
      break;
    } catch (err) {
      console.warn(`[warn] ${m.label} 不可用：${err.message}`);
    }
  }
  if (!mirror) throw new Error('所有镜像均不可用');

  // 复用先前顺序下载的前缀：只保留整块部分
  let base = 0;
  if (existsSync(PART)) {
    base = Math.floor((await stat(PART)).size / CHUNK) * CHUNK;
    console.log(`[resume] 复用前缀 ${(base / 1e6).toFixed(1)} MB`);
  }

  const firstIdx = base / CHUNK;
  const totalChunks = Math.ceil(total / CHUNK);
  const chunkRange = (i) => [i * CHUNK, Math.min((i + 1) * CHUNK - 1, total - 1)];
  const partPath = (i) => path.join(PARTS, `${i}.bin`);

  const todo = [];
  for (let i = firstIdx; i < totalChunks; i++) {
    const p = partPath(i);
    const [s, e] = chunkRange(i);
    if (existsSync(p) && statSync(p).size === e - s + 1) continue;
    todo.push(i);
  }
  console.log(`[chunks] 需下载 ${todo.length} / ${totalChunks - firstIdx} 块`);

  let done = firstIdx + (totalChunks - firstIdx - todo.length);
  let cursor = 0;
  const t0 = Date.now();
  const tick = () => {
    const got = done * CHUNK;
    const kbs = (got / 1024 / ((Date.now() - t0) / 1000)).toFixed(0);
    process.stdout.write(`\r[progress] ${(got / 1e6).toFixed(1)} / ${(total / 1e6).toFixed(1)} MB  ${kbs} KB/s   `);
  };
  tick();

  async function worker() {
    while (cursor < todo.length) {
      const i = todo[cursor++];
      const [s, e] = chunkRange(i);
      let buf = null;
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
          buf = await fetchChunk(mirror, s, e);
          break;
        } catch (err) {
          await sleep(800 * attempt);
        }
      }
      if (!buf) throw new Error(`分块 #${i} 重试 ${MAX_ATTEMPTS} 次仍失败`);
      await writeFile(partPath(i), buf);
      done++;
      tick();
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  process.stdout.write('\n');

  // 按序拼接
  const pieces = [];
  if (base > 0) {
    const pre = await readFile(PART);
    pieces.push(pre.subarray(0, base));
  }
  for (let i = firstIdx; i < totalChunks; i++) {
    const p = partPath(i);
    if (!existsSync(p)) throw new Error(`缺少分块 #${i}`);
    pieces.push(await readFile(p));
  }
  const full = Buffer.concat(pieces);
  if (full.length !== total) throw new Error(`拼接长度不符：${full.length}/${total}`);
  const text = full.toString('utf8');
  if (!/^\s*[[{]/.test(text)) throw new Error('内容不是合法 JSON 起始');

  await writeFile(OUT, full);
  console.log(`[ok] ci.json — ${(full.length / 1e6).toFixed(1)} MB`);

  // 清理中间产物
  for (const f of await readdir(PARTS)) await unlink(path.join(PARTS, f));
  if (existsSync(PART)) await unlink(PART);
}

main().catch((err) => {
  console.error('\n[fail]', err.message);
  process.exit(1);
});