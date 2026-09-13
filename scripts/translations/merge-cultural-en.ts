/**
 * 翻译管线合并：chunks/cultural-en-*.json → public/cultural-en.json
 *   npx tsx scripts/translations/merge-cultural-en.ts
 *
 * cultural.json 中 1000/1002 条是模板占位句（「X」字在汉字系统中有悠久历史。），
 * 由本脚本程序化生成英文；少量真实内容（尊、界）内置人工翻译；chunks 中的人工
 * 翻译优先覆盖。
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, '../../public');
const CHUNKS_DIR = path.resolve(__dirname, 'chunks');
const OUT_PATH = path.join(PUBLIC_DIR, 'cultural-en.json');

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

// ── 真实内容的人工翻译（尊、界） ──
const CURATED_EN: Record<string, { evolution: string; allusions: string[] }> = {
  尊: {
    evolution:
      'In oracle bone script, 尊 consists of 酉 (wine vessel) and 廾 (two hands), depicting hands offering up a wine vessel. In bronze script and small seal script it evolved into 酋 (wine vessel) over 寸 (a hand). Its original meaning is a ritual vessel for holding wine, extended to mean "to respect, to revere, noble". During the Shang dynasty, the zun was an important ritual vessel in sacrifices, symbolizing reverence toward heaven, earth, and the spirits.',
    allusions: [
      '"天尊地卑，乾坤定矣" — from the Xici of the I Ching: as heaven is high and earth is low, so social rank and order are established.',
      '"师严然后道尊" — from the Liji (Record of Rites): only when the teacher is strict is the Way held in honor; emphasizes the tradition of respecting teachers.',
      '"德尊一代" — from Han Yu\'s "Preface to Meng Dongye": praising a person of noble virtue held in reverence by all.',
      '"何尊" (He zun) — a Western Zhou bronze; its inscription contains the earliest known occurrence of the word "China" (中国).',
      '"四羊方尊" (Four-ram zun) — a late Shang bronze ritual vessel, a pinnacle of Chinese bronze culture.',
    ],
  },
  界: {
    evolution:
      '界 consists of 田 (field) and 介, which also provides the sound (a phono-semantic compound with ideographic overtones). 田 denotes fields and territory; 介 originally meant armor and by extension "between two things". Together they express the boundary of a field. Its original meaning is a territorial limit or border, later extended to any range, domain, or realm. After Buddhism entered China, 界 was used to translate Sanskrit dhātu (realm), giving rise to words like 世界 (world).',
    allusions: [
      '"域民不以封疆之界" — from Mencius (Gongsun Chou II): a state cannot be governed by geographic borders alone.',
      '"无远弗届，界不可疆" — from the Book of Documents: no land is beyond reach, boundaries cannot confine the realm.',
      '"三界唯心，万法唯识" — a core idea of the Buddhist Consciousness-only school: the three realms (desire, form, formlessness) exist only in the mind.',
      '"眼界无穷世界宽" — a line by Wang Wei: boundless vision makes the world wide; describes a broad outlook and open mind.',
      '"大千世界" — a Buddhist term, short for "three thousand great thousand worlds", describing the vastness of the universe.',
    ],
  },
};

// ── 1. 模板句程序化生成 ──
const cultural = readJson<Record<string, { evolution: string; allusions: string[] }>>(
  path.join(PUBLIC_DIR, 'cultural.json'),
);

const merged: Record<string, { evolution: string; allusions: string[] }> = {};
const TEMPLATE_RE = /^「(.)」字在汉字系统中有悠久历史。$/;

let templated = 0;
for (const [char, data] of Object.entries(cultural)) {
  const m = data.evolution.match(TEMPLATE_RE);
  if (m && data.allusions.length === 0) {
    merged[char] = {
      evolution: `The character "${m[1]}" has a long history in the Chinese writing system.`,
      allusions: [],
    };
    templated++;
  }
}

// ── 2. 内置人工翻译 ──
for (const [char, en] of Object.entries(CURATED_EN)) {
  merged[char] = en;
}

// ── 3. chunks 中的人工翻译覆盖 ──
if (fs.existsSync(CHUNKS_DIR)) {
  const chunkFiles = fs
    .readdirSync(CHUNKS_DIR)
    .filter((f) => f.startsWith('cultural-en-') && f.endsWith('.json'))
    .sort();
  let filled = 0;
  for (const f of chunkFiles) {
    const chunk = readJson<Record<string, { evolution?: string; allusions?: string[] }>>(
      path.join(CHUNKS_DIR, f),
    );
    for (const [char, val] of Object.entries(chunk)) {
      if (!val?.evolution) continue;
      if (!(char in cultural)) {
        console.warn(`invalid key (not in cultural.json): ${char}`);
        continue;
      }
      merged[char] = { evolution: val.evolution, allusions: val.allusions ?? [] };
      filled++;
    }
  }
  if (filled) console.log(`merged ${filled} entries from chunks`);
}

fs.writeFileSync(OUT_PATH, JSON.stringify(merged), 'utf8');
console.log(
  `public/cultural-en.json: ${Object.keys(merged).length}/${Object.keys(cultural).length} entries (${templated} templated, ${Object.keys(CURATED_EN).length} curated)`,
);
