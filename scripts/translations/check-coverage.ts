/**
 * 翻译覆盖率检查（覆盖率唯一事实来源）。
 *   npx tsx scripts/translations/check-coverage.ts [target]
 *
 * 对每个目标打印：源键数 / 已覆盖 / 缺失清单（前 30 个）。
 * target: zh-def | shuowen-en | cultural-en（默认全部）
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, '../../public');

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

interface CheckConfig {
  id: string;
  sourceFile: string;
  outputFile: string;
  /** 从源数据提取应翻译的键 */
  sourceKeys: () => string[];
  isFilled: (val: unknown) => boolean;
}

const CHECKS: CheckConfig[] = [
  {
    id: 'zh-def',
    sourceFile: 'hanzi-dict.json',
    outputFile: 'zh-definitions.json',
    sourceKeys: () =>
      Object.keys(readJson<Record<string, unknown>>(path.join(PUBLIC_DIR, 'hanzi-dict.json'))),
    isFilled: (v) => Boolean((v as { d?: string })?.d),
  },
  {
    id: 'shuowen-en',
    sourceFile: 'shuowen.json',
    outputFile: 'shuowen-en.json',
    sourceKeys: () => {
      const dict = readJson<Record<string, unknown>>(path.join(PUBLIC_DIR, 'hanzi-dict.json'));
      const dictKeys = new Set(Object.keys(dict));
      return Object.keys(
        readJson<Record<string, unknown>>(path.join(PUBLIC_DIR, 'shuowen.json')),
      ).filter((k) => dictKeys.has(k));
    },
    isFilled: (v) => typeof v === 'string' && v.length > 0,
  },
  {
    id: 'cultural-en',
    sourceFile: 'cultural.json',
    outputFile: 'cultural-en.json',
    sourceKeys: () =>
      Object.keys(readJson<Record<string, unknown>>(path.join(PUBLIC_DIR, 'cultural.json'))),
    isFilled: (v) => Boolean((v as { evolution?: string })?.evolution),
  },
];

let allOk = true;
for (const check of CHECKS) {
  if (process.argv[2] && process.argv[2] !== check.id) continue;

  const keys = check.sourceKeys();
  const outPath = path.join(PUBLIC_DIR, check.outputFile);
  const out = fs.existsSync(outPath)
    ? readJson<Record<string, unknown>>(outPath)
    : {};

  const missing = keys.filter((k) => !check.isFilled(out[k]));
  const pct = (((keys.length - missing.length) / keys.length) * 100).toFixed(2);
  console.log(`\n[${check.id}] ${keys.length - missing.length}/${keys.length} (${pct}%)`);
  if (missing.length > 0) {
    allOk = false;
    console.log(`  missing ${missing.length}: ${missing.slice(0, 30).join(' ')}${missing.length > 30 ? ' …' : ''}`);
  }
}

if (allOk) {
  console.log('\n✓ all translation targets at 100% coverage');
} else {
  console.log('\n✗ coverage incomplete — run gen-chunks to produce remaining batches');
  process.exitCode = 1;
}
