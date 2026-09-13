/**
 * 翻译管线第 1 步：把未覆盖的键切分成 chunk 文件，供子代理并行翻译。
 *
 *   npx tsx scripts/translations/gen-chunks.ts [target] [batchSize]
 *
 * target: zh-def | shuowen-en | cultural-en （默认全部）
 * batchSize: 每批键数（默认 zh-def 250 / shuowen-en 200 / cultural-en 250）
 *
 * 断点续跑：键已在 public 目标 JSON 或已填值的 chunk 中出现即跳过。
 * chunk 值格式：
 *   zh-def:     { "字": { "d": "", "h": "" } }        d=中文释义 h=中文词源提示
 *   shuowen-en: { "字": "" }                          空串=待翻译
 *   cultural-en:{ "字": { "evolution": "", "allusions": [] } }
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, '../../public');
const CHUNKS_DIR = path.resolve(__dirname, 'chunks');

interface TargetConfig {
  id: string;
  sourceFile: string; // 源键来源（public 下）
  outputFile: string; // 合并目标（public 下）
  chunkPrefix: string;
  defaultBatch: number;
  /** 生成空 chunk 值 */
  emptyValue: (char: string) => unknown;
  /** 判断 chunk 值是否已翻译完成（非空） */
  isFilled: (val: unknown) => boolean;
}

const TARGETS: Record<string, TargetConfig> = {
  'zh-def': {
    id: 'zh-def',
    sourceFile: 'hanzi-dict.json',
    outputFile: 'zh-definitions.json',
    chunkPrefix: 'zh-def-',
    defaultBatch: 250,
    emptyValue: () => ({ d: '', h: '' }),
    isFilled: (v) => Boolean((v as { d?: string })?.d),
  },
  'shuowen-en': {
    id: 'shuowen-en',
    sourceFile: 'shuowen.json',
    outputFile: 'shuowen-en.json',
    chunkPrefix: 'shuowen-en-',
    defaultBatch: 200,
    emptyValue: () => '',
    isFilled: (v) => typeof v === 'string' && v.length > 0,
  },
  'cultural-en': {
    id: 'cultural-en',
    sourceFile: 'cultural.json',
    outputFile: 'cultural-en.json',
    chunkPrefix: 'cultural-en-',
    defaultBatch: 250,
    emptyValue: () => ({ evolution: '', allusions: [] }),
    isFilled: (v) => Boolean((v as { evolution?: string })?.evolution),
  },
};

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

function sourceKeys(cfg: TargetConfig): string[] {
  const data = readJson<Record<string, unknown>>(path.join(PUBLIC_DIR, cfg.sourceFile));
  if (cfg.id === 'shuowen-en') {
    // 只翻译与主字典相交的字头（生僻字头英文版回退原文）
    const dict = readJson<Record<string, unknown>>(path.join(PUBLIC_DIR, 'hanzi-dict.json'));
    const dictKeys = new Set(Object.keys(dict));
    return Object.keys(data).filter((k) => dictKeys.has(k));
  }
  return Object.keys(data);
}

function alreadyCovered(cfg: TargetConfig): Set<string> {
  const covered = new Set<string>();
  // 1. public 目标 JSON 中已有的非空键
  const outPath = path.join(PUBLIC_DIR, cfg.outputFile);
  if (fs.existsSync(outPath)) {
    const out = readJson<Record<string, unknown>>(outPath);
    for (const [k, v] of Object.entries(out)) {
      if (cfg.isFilled(v)) covered.add(k);
    }
  }
  // 2. 已有 chunk 中已填值的键
  if (fs.existsSync(CHUNKS_DIR)) {
    for (const f of fs.readdirSync(CHUNKS_DIR)) {
      if (!f.startsWith(cfg.chunkPrefix) || !f.endsWith('.json')) continue;
      const chunk = readJson<Record<string, unknown>>(path.join(CHUNKS_DIR, f));
      for (const [k, v] of Object.entries(chunk)) {
        if (cfg.isFilled(v)) covered.add(k);
      }
    }
  }
  return covered;
}

function genChunks(cfg: TargetConfig, batchSize: number) {
  const keys = sourceKeys(cfg);
  const covered = alreadyCovered(cfg);
  const missing = keys.filter((k) => !covered.has(k));
  if (missing.length === 0) {
    console.log(`[${cfg.id}] all ${keys.length} keys covered — nothing to chunk`);
    return;
  }

  fs.mkdirSync(CHUNKS_DIR, { recursive: true });
  // 计算下一个 chunk 序号
  const seq = fs
    .readdirSync(CHUNKS_DIR)
    .filter((f) => f.startsWith(cfg.chunkPrefix))
    .length;

  let idx = 0;
  let chunkNo = seq;
  while (idx < missing.length) {
    const batch = missing.slice(idx, idx + batchSize);
    const chunk: Record<string, unknown> = {};
    for (const k of batch) chunk[k] = cfg.emptyValue(k);
    const file = path.join(CHUNKS_DIR, `${cfg.chunkPrefix}${String(chunkNo).padStart(4, '0')}.json`);
    fs.writeFileSync(file, JSON.stringify(chunk, null, 2), 'utf8');
    console.log(`[${cfg.id}] wrote ${file} (${batch.length} keys)`);
    idx += batchSize;
    chunkNo++;
  }
  console.log(`[${cfg.id}] ${missing.length} keys remaining, ${Math.ceil(missing.length / batchSize)} chunks written`);
}

const argTarget = process.argv[2];
const argBatch = process.argv[3] ? parseInt(process.argv[3], 10) : undefined;

for (const [id, cfg] of Object.entries(TARGETS)) {
  if (argTarget && argTarget !== id) continue;
  genChunks(cfg, argBatch ?? cfg.defaultBatch);
}
