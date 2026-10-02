/**
 * 从 pwxcoo/chinese-xinhua 拉取中文词语释义库（data/ci.json，约 26MB）。
 *
 * 通过 GitHub Git Blobs API 获取原始内容（contents API 仅支持 ≤1MB）。
 * 产物：scripts/.data/ci.json
 *
 * 用法：GH_TOKEN=xxx node scripts/fetch-ci.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';

const OWNER = 'pwxcoo';
const REPO = 'chinese-xinhua';
const TARGET = 'data/ci.json';
const ROOT = path.resolve(import.meta.dirname, '..');
const DATA_DIR = path.join(ROOT, 'scripts', '.data');
const OUT = path.join(DATA_DIR, TARGET.replace('/', '_'));

const token = process.env.GH_TOKEN || '';
const headers = {
  'User-Agent': 'hanzi-ancestry-build',
  Accept: 'application/vnd.github+json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function api(url, accept) {
  const res = await fetch(url, { headers: accept ? { ...headers, Accept: accept } : headers });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res;
}

async function main() {
  if (existsSync(OUT) && statSync(OUT).size > 1_000_000) {
    console.log(`[cache] ${path.relative(ROOT, OUT)} (${(statSync(OUT).size / 1e6).toFixed(1)} MB)`);
    return;
  }

  console.log('[1/2] resolve blob sha via git trees API…');
  const tree = await (await api(`https://api.github.com/repos/${OWNER}/${REPO}/git/trees/master?recursive=1`)).json();
  const node = tree.tree.find((n) => n.path === TARGET);
  if (!node) throw new Error(`not found in tree: ${TARGET}`);
  console.log(`      sha=${node.sha} size=${(node.size / 1e6).toFixed(1)} MB`);

  console.log('[2/2] download raw blob…');
  const res = await api(`https://api.github.com/repos/${OWNER}/${REPO}/git/blobs/${node.sha}`, 'application/vnd.github.raw');
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(OUT, buf);
  console.log(`[out] ${path.relative(ROOT, OUT)} — ${(buf.length / 1e6).toFixed(1)} MB`);
}

main().catch((err) => {
  console.error('[fail]', err.message);
  process.exit(1);
});