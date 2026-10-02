/**
 * Build public/char-meta.json — char → { HSK 3.0 level, old HSK 2.0 level, frequency rank }
 *
 * Sources (see About page "数据来源与许可"):
 *  - HSK 3.0 / GF0025-2021 chars: npm @leonsilicon/hsk3.0 (github.com/leonsilicon/hsk3.0)
 *  - HSK 2.0 (old HSK 1-6) chars: npm @leonsilicon/hsk2.0 (github.com/leonsilicon/hsk2.0)
 *  - Modern char frequency: Jun Da list, https://lingua.mtsu.edu/chinese-computing/statistics/
 *    (raw GB18030 file pre-converted to UTF-8 at scripts/.data/junda-utf8.tsv)
 *
 * Output format (compact):
 * {
 *   "fr":   ["的","一",...],          // rank = index + 1
 *   "hsk3": {"1":["一",...],"79":[...]}, // level 79 = GF0025 advanced band 7-9
 *   "hsk2": {"1":[...],...,"6":[...]}
 * }
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const dataDir = resolve(__dirname, '.data');
const outFile = resolve(root, 'public', 'char-meta.json');

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function ensureHsk(pkgPrefix, levels) {
  const out = {};
  for (const lv of levels) {
    const file = resolve(dataDir, `${pkgPrefix}_l${lv}.json`);
    if (existsSync(file)) {
      out[lv] = JSON.parse(readFileSync(file, 'utf8'));
    } else {
      out[lv] = await fetchJson(`https://cdn.jsdelivr.net/npm/@leonsilicon/${pkgPrefix}/${pkgPrefix === 'hsk30' ? 'HSK3.0' : 'HSK2.0'}_chars_level${lv}.json`);
      mkdirSync(dataDir, { recursive: true });
      writeFileSync(file, JSON.stringify(out[lv]));
    }
  }
  return out;
}

function parseJunDa() {
  const file = resolve(dataDir, 'junda-utf8.tsv');
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  const chars = [];
  for (const line of lines) {
    if (!line || line.startsWith('/*')) continue;
    const cols = line.split('\t');
    if (cols.length < 2) continue;
    const rank = parseInt(cols[0], 10);
    const ch = cols[1].trim();
    if (Number.isInteger(rank) && ch && ch.length >= 1) {
      chars.push(Array.from(ch)[0]);
    }
  }
  return chars;
}

const hsk3 = await ensureHsk('hsk30', [1, 2, 3, 4, 5, 6, '7-9']);
const hsk2 = await ensureHsk('hsk20', [1, 2, 3, 4, 5, 6]);

const fr = parseJunDa();

const hsk3Out = {};
for (const [lv, chars] of Object.entries(hsk3)) {
  hsk3Out[lv === '7-9' ? '79' : lv] = chars;
}
const hsk2Out = {};
for (const [lv, chars] of Object.entries(hsk2)) {
  hsk2Out[lv] = chars;
}

const result = { fr, hsk3: hsk3Out, hsk2: hsk2Out, v: 1 };
writeFileSync(outFile, JSON.stringify(result));

const frSet = new Set(fr);
let dup = 0;
fr.forEach((c, i) => { if (fr.indexOf(c) !== i) dup++; });
console.log(`char-meta.json written: ${fr.length} freq entries (${dup} dup ranks)`);
console.log(`hsk3 levels: ${Object.entries(hsk3Out).map(([k, v]) => `${k}:${v.length}`).join(' ')}`);
console.log(`hsk2 levels: ${Object.entries(hsk2Out).map(([k, v]) => `${k}:${v.length}`).join(' ')}`);
const hsk3All = new Set(Object.values(hsk3Out).flat());
console.log(`hsk3 unique chars: ${hsk3All.size}; not in freq list: ${[...hsk3All].filter((c) => !frSet.has(c)).length}`);
