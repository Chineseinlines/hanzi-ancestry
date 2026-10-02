/**
 * 拉取词库构建所需的两个外部数据源（多源 + 重试，应对网络抖动）。
 *
 *   1. jieba 词频表  fxsjy/jieba: jieba/dict.txt   → scripts/.data/jieba-dict.txt
 *      （约 350k 词 + 词频，用于词条筛选与排序）
 *   2. 中文词语释义  pwxcoo/chinese-xinhua: data/ci.json → scripts/.data/ci.json
 *      （约 26MB，用于中文释义；失败则回退英文）
 *
 * 用法：GH_TOKEN=xxx node scripts/fetch-word-sources.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA = path.join(ROOT, 'scripts', '.data');
const token = process.env.GH_TOKEN || '';
const ghHeaders = {
  'User-Agent': 'hanzi-ancestry-build',
  Accept: 'application/vnd.github+json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

const TARGETS = [
  {
    name: 'jieba-dict.txt',
    owner: 'fxsjy',
    repo: 'jieba',
    branch: 'master',
    path: 'jieba/dict.txt',
    minSize: 2_000_000,
    validate: (t) => t.includes('学习'),
  },
  {
    name: 'ci.json',
    owner: 'pwxcoo',
    repo: 'chinese-xinhua',
    branch: 'master',
    path: 'data/ci.json',
    minSize: 5_000_000,
    validate: (t) => t.trimStart().startsWith('[') || t.trimStart().startsWith('{'),
  },
];

const MIRRORS = [
  (o, r, b, p) => `https://raw.githubusercontent.com/${o}/${r}/${b}/${p}`,
  (o, r, b, p) => `https://raw.gitmirror.com/${o}/${r}/${b}/${p}`,
  (o, r, b, p) => `https://ghproxy.net/https://raw.githubusercontent.com/${o}/${r}/${b}/${p}`,
  (o, r, b, p) => `https://gitclone.com/github.com/${o}/${r}/raw/${b}/${p}`,
];

async function blobSha(owner, repo, branch, filePath) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, { headers: ghHeaders });
  if (!res.ok) throw new Error(`trees HTTP ${res.status}`);
  const tree = await res.json();
  const node = tree.tree.find((n) => n.path === filePath);
  if (!node) throw new Error(`not in tree: ${filePath}`);
  return node.sha;
}

async function tryUrl(url, headers, minSize, validate) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < minSize) throw new Error(`too small: ${(buf.length / 1e6).toFixed(2)} MB`);
  const text = buf.toString('utf8');
  if (validate && !validate(text)) throw new Error('content validation failed');
  return buf;
}

async function fetchTarget(t) {
  const out = path.join(DATA, t.name);
  if (existsSync(out) && statSync(out).size >= t.minSize) {
    console.log(`[cache] ${t.name} (${(statSync(out).size / 1e6).toFixed(1)} MB)`);
    return true;
  }

  const sources = [];
  try {
    const sha = await blobSha(t.owner, t.repo, t.branch, t.path);
    sources.push({
      label: 'api-blob',
      url: `https://api.github.com/repos/${t.owner}/${t.repo}/git/blobs/${sha}`,
      headers: { ...ghHeaders, Accept: 'application/vnd.github.raw' },
    });
  } catch (err) {
    console.warn(`[warn] ${t.name}: 解析 blob sha 失败 — ${err.message}`);
  }
  for (const m of MIRRORS) {
    sources.push({ label: 'mirror', url: m(t.owner, t.repo, t.branch, t.path), headers: { 'User-Agent': 'hanzi-ancestry-build' } });
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    for (const src of sources) {
      try {
        const buf = await tryUrl(src.url, src.headers, t.minSize, t.validate);
        await mkdir(DATA, { recursive: true });
        await writeFile(out, buf);
        console.log(`[ok] ${t.name} ← ${src.label} (${(buf.length / 1e6).toFixed(1)} MB)`);
        return true;
      } catch (err) {
        console.warn(`[retry ${attempt}] ${t.name} ← ${src.label}: ${err.message}`);
      }
    }
  }
  console.warn(`[fail] ${t.name} 所有来源均失败，将回退`);
  return false;
}

async function main() {
  let ok = 0;
  for (const t of TARGETS) if (await fetchTarget(t)) ok++;
  console.log(`[done] ${ok}/${TARGETS.length} 数据源就绪`);
}

main();