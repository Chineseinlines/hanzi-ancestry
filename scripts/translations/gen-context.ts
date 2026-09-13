/**
 * 为每个 chunk 生成翻译上下文文件（chunks/ctx-<prefix>NNNN.json），
 * 供翻译子代理只读：包含源英文释义/原文，避免子代理读取 1.5MB 大文件。
 *   npx tsx scripts/translations/gen-context.ts [target]
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, '../../public');
const CHUNKS_DIR = path.resolve(__dirname, 'chunks');

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

interface CtxConfig {
  prefix: string;
  sourceFile: string;
  /** 从源条目提取上下文字段 */
  extract: (entry: any) => unknown;
}

const CTX: CtxConfig[] = [
  {
    prefix: 'zh-def-',
    sourceFile: 'hanzi-dict.json',
    extract: (e) => ({ d: e?.d ?? '', h: e?.etymology?.hint ?? '' }),
  },
  {
    prefix: 'shuowen-en-',
    sourceFile: 'shuowen.json',
    extract: (e) => ({
      shuowen: e?.shuowen ?? '',
      summary: e?.summary ?? '',
      structure: e?.structure ?? '',
      sixBooks: e?.sixBooks ?? '',
    }),
  },
  {
    prefix: 'cultural-en-',
    sourceFile: 'cultural.json',
    extract: (e) => ({ evolution: e?.evolution ?? '', allusions: e?.allusions ?? [] }),
  },
];

const argTarget = process.argv[2];

for (const cfg of CTX) {
  if (argTarget && !cfg.prefix.startsWith(argTarget)) continue;
  const source = readJson<Record<string, unknown>>(path.join(PUBLIC_DIR, cfg.sourceFile));
  const chunkFiles = fs
    .readdirSync(CHUNKS_DIR)
    .filter((f) => f.startsWith(cfg.prefix) && f.endsWith('.json') && !f.startsWith('ctx-'))
    .sort();

  for (const f of chunkFiles) {
    const chunk = readJson<Record<string, unknown>>(path.join(CHUNKS_DIR, f));
    const ctx: Record<string, unknown> = {};
    for (const key of Object.keys(chunk)) {
      ctx[key] = cfg.extract(source[key]);
    }
    const ctxFile = path.join(CHUNKS_DIR, `ctx-${f}`);
    fs.writeFileSync(ctxFile, JSON.stringify(ctx, null, 2), 'utf8');
  }
  console.log(`[${cfg.prefix}] wrote ${chunkFiles.length} context files`);
}
