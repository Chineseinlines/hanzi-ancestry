/**
 * 翻译管线合并：chunks/zh-def-*.json → public/zh-definitions.json
 *   npx tsx scripts/translations/merge-zh-definitions.ts
 *
 * 校验：每个键必须存在于 hanzi-dict.json；与已有 public 目标合并（chunk 覆盖旧值）。
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, '../../public');
const CHUNKS_DIR = path.resolve(__dirname, 'chunks');
const OUT_PATH = path.join(PUBLIC_DIR, 'zh-definitions.json');

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

const dict = readJson<Record<string, unknown>>(path.join(PUBLIC_DIR, 'hanzi-dict.json'));
const dictKeys = new Set(Object.keys(dict));

// 收集所有 chunk 中已填值
const merged: Record<string, { d: string; h?: string }> = {};
if (fs.existsSync(OUT_PATH)) {
  Object.assign(merged, readJson(OUT_PATH));
}

const chunkFiles = fs
  .readdirSync(CHUNKS_DIR)
  .filter((f) => f.startsWith('zh-def-') && f.endsWith('.json'))
  .sort();

let filled = 0;
let invalid = 0;
for (const f of chunkFiles) {
  const chunk = readJson<Record<string, { d?: string; h?: string }>>(path.join(CHUNKS_DIR, f));
  for (const [char, val] of Object.entries(chunk)) {
    if (!val?.d) continue; // 未翻译跳过
    if (!dictKeys.has(char)) {
      console.warn(`invalid key (not in hanzi-dict.json): ${char}`);
      invalid++;
      continue;
    }
    merged[char] = { d: val.d, h: val.h || undefined };
    filled++;
  }
}

fs.writeFileSync(OUT_PATH, JSON.stringify(merged), 'utf8');
console.log(`merged ${filled} entries from ${chunkFiles.length} chunks (${invalid} invalid keys skipped)`);
console.log(`public/zh-definitions.json: ${Object.keys(merged).length} entries`);
