/**
 * Fill empty phonetic/semantic fields for pictophonetic characters.
 *
 * Strategy for 2-component chars:
 *   - Match radical to one component → that's the semantic (形旁)
 *   - The other component → phonetic (声旁)
 *
 * Strategy for 3+ component chars:
 *   - Radical match → semantic
 *   - Remaining CJK chars joined → phonetic
 *
 * Strategy for 0/1 component chars:
 *   - Skip, flag for manual review
 *
 * Run: npx tsx scripts/fix-empty-components.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DICT_PATH = path.resolve(__dirname, '..', 'public', 'hanzi-dict.json');

interface DictEntry {
  c: string;
  r: string;
  decomposition: string;
  etymology?: {
    type?: string;
    phonetic?: string;
    semantic?: string;
    hint?: string;
  };
}

// Kangxi radical variants → base radical
const RADICAL_VARIANTS: Record<string, string> = {
  '扌': '手', '氵': '水', '灬': '火', '忄': '心',
  '礻': '示', '纟': '糸', '钅': '金', '饣': '食',
  '衤': '衣', '讠': '言', '贝': '貝', '车': '車',
  '门': '門', '马': '馬', '鱼': '魚', '鸟': '鳥',
  '龙': '龍', '刂': '刀', '阝': '阜',
};

function extractCJK(s: string): string[] {
  return [...s.matchAll(/[一-鿿]/g)].map(m => m[0]);
}

function isRadicalMatch(comp: string, radical: string): boolean {
  if (comp === radical) return true;
  if (RADICAL_VARIANTS[comp] === radical) return true;
  return false;
}

function main() {
  const raw = fs.readFileSync(DICT_PATH, 'utf-8');
  const dict = JSON.parse(raw) as Record<string, DictEntry>;

  let autoFixed = 0;
  let manualNeeded = 0;
  const manualList: string[] = [];

  for (const [char, entry] of Object.entries(dict)) {
    if (!entry.etymology) continue;
    if (entry.etymology.type !== 'pictophonetic') continue;
    const hasPhon = entry.etymology.phonetic && entry.etymology.phonetic !== '';
    const hasSem = entry.etymology.semantic && entry.etymology.semantic !== '';
    if (hasPhon && hasSem) continue; // already complete

    const comps = extractCJK(entry.decomposition || '');
    const radical = entry.r;

    if (comps.length === 0 || comps.length === 1) {
      manualNeeded++;
      if (manualList.length < 20) manualList.push(`${char}: decomp="${entry.decomposition}" r=${radical}`);
      continue;
    }

    // Find which component matches the radical
    const semIdx = comps.findIndex(c => isRadicalMatch(c, radical));
    const sem = semIdx >= 0 ? comps[semIdx] : undefined;

    // Phonetic = all other components joined
    const phonComps = comps.filter((_, i) => i !== semIdx);
    const phon = phonComps.join('');

    if (sem || phon) {
      // Only auto-fix if we found at least one match
      if (sem && (!entry.etymology.semantic || entry.etymology.semantic === '')) {
        entry.etymology.semantic = sem;
      }
      if (phon && (!entry.etymology.phonetic || entry.etymology.phonetic === '')) {
        entry.etymology.phonetic = phon;
      }
      autoFixed++;
    } else {
      manualNeeded++;
      if (manualList.length < 30) manualList.push(`${char}: decomp="${entry.decomposition}" r=${radical} comps=${comps.join(',')}`);
    }
  }

  console.log(`Auto-fixed: ${autoFixed}`);
  console.log(`Manual needed: ${manualNeeded}\n`);

  if (manualList.length > 0) {
    console.log('Manual review needed (sample):');
    manualList.forEach(s => console.log('  ' + s));
  }

  // Write back
  fs.writeFileSync(DICT_PATH, JSON.stringify(dict), 'utf-8');

  // Verify
  const verify = JSON.parse(fs.readFileSync(DICT_PATH, 'utf-8')) as Record<string, DictEntry>;
  let stillEmpty = 0;
  for (const [, e] of Object.entries(verify)) {
    if (e.etymology?.type === 'pictophonetic') {
      if ((!e.etymology.phonetic || e.etymology.phonetic === '') &&
          (!e.etymology.semantic || e.etymology.semantic === '')) {
        stillEmpty++;
      }
    }
  }
  console.log(`\nStill both empty after fix: ${stillEmpty} (was 269)`);
}

main();
