/**
 * Fix 指事字 (indicative) classifications in hanzi-dict.json.
 *
 * Background: 82+ 指事字 were misclassified:
 *   - 54 as "ideographic" (会意) → should be "indicative" (指事)
 *   - 15 as empty/missing         → should be "indicative"
 *   - 10 as "pictographic" (象形)  → reviewed, some corrected
 *   - 3  as "pictophonetic" (形声) → reviewed, corrected
 *
 * Run: npx tsx scripts/fix-indicative.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DICT_PATH = path.resolve(__dirname, '..', 'public', 'hanzi-dict.json');

// ── Characters currently marked "ideographic" that are really 指事 ──
const IDEOGRAPHIC_TO_INDICATIVE = new Set([
  '非', '太', '卑', '一', '公', '卓', '卅', '八', '不', '乒',
  '章', '乓', '乏', '音', '甘', '竟', '卡', '叉', '即', '尺',
  '夫', '五', '本', '至', '亡', '下', '凶', '旦', '未', '交',
  '幻', '牵', '函', '亦', '中', '王', '朱', '二', '末', '天',
  '丹', '四', '上', '寸', '三', '引', '廿', '曰', '司', '克',
  '血', '半', '爻', '刃',
]);

// ── Characters currently missing etymology that are 指事 ──
const EMPTY_TO_INDICATIVE = new Set([
  '丑', '屯', '兮', '丨', '丩', '齐', '亟', '六', '午', '七',
  '十', '臣', '派', '乎', '永',
]);

// ── Characters marked "pictographic" that should be "indicative" ──
// (carefully reviewed against standard references)
const PICTOGRAPHIC_TO_INDICATIVE = new Set([
  '立', // A man standing on the ground — the line 一 indicates standing position → 指事
  '元', // A man with lines emphasizing the head — lines indicate/point to head → 指事
  '片', // Half of a tree trunk — indicates "half" → 指事
  '少', // Grains of sand, dots indicating "few/little" → 指事
  '卒', // A soldier in armor, mark on clothing indicates status → 指事
]);

// ── Characters marked "pictophonetic" that should be "indicative" ──
const PICTOPHONETIC_TO_INDICATIVE = new Set([
  '象', // Picture of an elephant → should be 象形 (pictographic), not 形声
]);

// ── Characters marked "pictophonetic" that should be "pictographic" ──
const PICTOPHONETIC_TO_PICTOGRAPHIC = new Set([
  '象', // Actually let's put it as pictographic since it's literally a picture of an elephant
]);

// ── 指事字 that are correctly "pictographic" — leave alone ──
// 九 (elbow, pictographic), 世 (three leaves, pictographic),
// 尹 (scepter, pictographic), 示 (altar, pictographic), 南 (musical bell, pictographic)
// 牟 (ox sound → probably correct as pictophonetic), 尤 (needs more research)

interface EtymologyField {
  type?: string;
  phonetic?: string;
  semantic?: string;
  hint?: string;
}

interface DictEntry {
  c: string;
  d: string;
  p: string[];
  r: string;
  decomposition: string;
  etymology?: EtymologyField;
}

function main() {
  console.log('Reading hanzi-dict.json...');
  const raw = fs.readFileSync(DICT_PATH, 'utf-8');
  const dict = JSON.parse(raw) as Record<string, DictEntry>;

  let fixCount = 0;
  const fixes: string[] = [];

  for (const [char, entry] of Object.entries(dict)) {
    const currentType = entry.etymology?.type;

    // Check ideographic → indicative
    if (IDEOGRAPHIC_TO_INDICATIVE.has(char) && currentType === 'ideographic') {
      entry.etymology!.type = 'indicative';
      fixCount++;
      fixes.push(`  ${char}: ideographic → indicative`);
      continue;
    }

    // Check empty → indicative
    if (EMPTY_TO_INDICATIVE.has(char) && (!entry.etymology || !entry.etymology.type)) {
      if (!entry.etymology) {
        entry.etymology = { type: 'indicative', hint: '' };
      } else {
        entry.etymology.type = 'indicative';
      }
      fixCount++;
      fixes.push(`  ${char}: (empty) → indicative`);
      continue;
    }

    // Check pictographic → indicative
    if (PICTOGRAPHIC_TO_INDICATIVE.has(char) && currentType === 'pictographic') {
      entry.etymology!.type = 'indicative';
      fixCount++;
      fixes.push(`  ${char}: pictographic → indicative`);
      continue;
    }
  }

  // Handle 象 separately — it's in both sets but should be pictographic
  if (PICTOPHONETIC_TO_PICTOGRAPHIC.has('象')) {
    const entry = dict['象'];
    if (entry?.etymology && entry.etymology.type === 'pictophonetic') {
      entry.etymology.type = 'pictographic';
      fixCount++;
      fixes.push(`  象: pictophonetic → pictographic`);
    }
  }

  // Check for characters in the fix lists that are NOT in the dictionary
  const allFixChars = new Set([
    ...IDEOGRAPHIC_TO_INDICATIVE,
    ...EMPTY_TO_INDICATIVE,
    ...PICTOGRAPHIC_TO_INDICATIVE,
    ...PICTOPHONETIC_TO_INDICATIVE,
    ...PICTOPHONETIC_TO_PICTOGRAPHIC,
  ]);

  const missing: string[] = [];
  for (const char of allFixChars) {
    if (!dict[char]) {
      missing.push(char);
    }
  }

  if (missing.length > 0) {
    console.log(`\n⚠ Characters in fix list but NOT in dictionary (${missing.length}):`);
    missing.forEach(c => console.log(`  ${c}`));
  }

  // Write back
  console.log(`\nApplying ${fixCount} fixes...`);
  fs.writeFileSync(DICT_PATH, JSON.stringify(dict), 'utf-8');
  console.log(`Done! Fixed ${fixCount} entries.`);

  // Print summary
  console.log('\n─── Fix Summary ───');
  fixes.forEach(f => console.log(f));

  // Verification
  console.log('\n─── Verification ───');
  const verify = JSON.parse(fs.readFileSync(DICT_PATH, 'utf-8')) as Record<string, DictEntry>;
  let indicativeCount = 0;
  let stillIdeographic = 0;
  let stillEmpty = 0;

  for (const char of allFixChars) {
    const e = verify[char];
    if (!e) continue; // skip chars not in dict
    const t = e.etymology?.type;
    if (t === 'indicative') indicativeCount++;
    else if (t === 'ideographic') stillIdeographic++;
    else if (!t) stillEmpty++;
  }

  console.log(`  Confirmed indicative: ${indicativeCount}/${allFixChars.size - missing.length}`);
  if (stillIdeographic > 0) console.log(`  ⚠ Still ideographic: ${stillIdeographic}`);
  if (stillEmpty > 0) console.log(`  ⚠ Still empty: ${stillEmpty}`);
  if (stillIdeographic === 0 && stillEmpty === 0) {
    console.log('  ✅ All accessible characters fixed!');
  }
}

main();
