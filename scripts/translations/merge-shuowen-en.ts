/**
 * 翻译管线合并：chunks/shuowen-en-*.json → public/shuowen-en.json
 *   npx tsx scripts/translations/merge-shuowen-en.ts
 *
 * 校验：每个键必须存在于 shuowen.json；与已有 public 目标合并（chunk 覆盖旧值）。
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, '../../public');
const CHUNKS_DIR = path.resolve(__dirname, 'chunks');
const OUT_PATH = path.join(PUBLIC_DIR, 'shuowen-en.json');

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

const shuowen = readJson<Record<string, unknown>>(path.join(PUBLIC_DIR, 'shuowen.json'));
const shuowenKeys = new Set(Object.keys(shuowen));

// 收集所有 chunk 中已填值
const merged: Record<string, string> = {};
if (fs.existsSync(OUT_PATH)) {
  Object.assign(merged, readJson(OUT_PATH));
}

const chunkFiles = fs
  .readdirSync(CHUNKS_DIR)
  .filter((f) => f.startsWith('shuowen-en-') && f.endsWith('.json'))
  .sort();

let filled = 0;
let invalid = 0;
for (const f of chunkFiles) {
  const chunk = readJson<Record<string, string>>(path.join(CHUNKS_DIR, f));
  for (const [char, val] of Object.entries(chunk)) {
    if (!val || typeof val !== 'string') continue; // 未翻译跳过
    if (!shuowenKeys.has(char)) {
      console.warn(`invalid key (not in shuowen.json): ${char}`);
      invalid++;
      continue;
    }
    merged[char] = val;
    filled++;
  }
}

fs.writeFileSync(OUT_PATH, JSON.stringify(merged), 'utf8');
console.log(`merged ${filled} entries from ${chunkFiles.length} chunks (${invalid} invalid keys skipped)`);
console.log(`public/shuowen-en.json: ${Object.keys(merged).length} entries`);
