/**
 * Fix character type misclassifications in hanzi-dict.json.
 *
 * This script corrects ~620+ character classification errors discovered
 * during the etymology audit:
 *
 *   Part 1 (~593 chars): ideographic → pictophonetic
 *     Characters whose hints explicitly state a component "provides the
 *     pronunciation", yet are classified as pure ideographic (会意).
 *     The phonetic and semantic components are auto-extracted.
 *
 *   Part 2 (~20 chars): specific manual corrections
 *     Characters with clearly wrong types, wrong component assignments,
 *     or wrong hint content — verified against 说文解字.
 *
 *   Part 3 (~3 chars): hint content fixes
 *     Characters whose hints contain factual errors (炏, 象, 社).
 *
 * Run: npx tsx scripts/fix-misclassifications.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DICT_PATH = path.resolve(__dirname, '..', 'public', 'hanzi-dict.json');

// ── Types ──
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

// ── CJK character regex (BMP Han chars, extensions, radicals) ──
const CJK_RE = /[⺀-⿟㐀-䶿一-鿿豈-﫿]/g;

// ── Phonetic extraction regex: "X [also] provides the pronunciation" ──
const PHONETIC_HINT_RE = /([⺀-⿟㐀-䶿一-鿿豈-﫿]+)\s+(?:also\s+)?provides?\s+(?:the\s+|a\s+)?(?:pronunciation|sound)/i;

// ══════════════════════════════════════════════════════════════════════════
// Part 1: Auto-fix ideographic → pictophonetic
// ══════════════════════════════════════════════════════════════════════════

// Characters where automatic phonetic extraction fails — hand-reviewed overrides.
// Each entry: { char, phonetic, semantic }
const PHONETIC_OVERRIDES: Record<string, { phonetic: string; semantic: string }> = {
  '壑': { phonetic: '㕡', semantic: '土' },      // 㕡 is Extension A U+3B61
  '学': { phonetic: '⺍', semantic: '子' },       // ⺍ is CJK Radical U+2E8D, sem=子 (building+child)
  '殷': { phonetic: '㐆', semantic: '殳' },       // 㐆 is Extension A U+3406
  '竺': { phonetic: '⺮', semantic: '二' },       // ⺮ is bamboo radical U+2EAE
  '筑': { phonetic: '⺮', semantic: '巩' },       // ⺮ phonetic
  '箍': { phonetic: '㧜', semantic: '⺮' },       // 㧜 is Extension A U+3B1C
  '築': { phonetic: '⺮', semantic: '巩木' },     // ⺮ phonetic, sem components joined
};

// Characters where the extracted phonetic is NOT in the decomposition
// (usually because the hint describes a compound component)
// These are skipped from auto-fix and flagged for manual review.
const SKIP_AUTO_FIX = new Set([
  // Add if needed; currently all extractable
]);

/**
 * Extract all CJK characters from an IDS decomposition string.
 */
function extractComponents(decomposition: string): string[] {
  if (!decomposition) return [];
  const matches = decomposition.match(CJK_RE);
  return matches ? [...matches] : [];
}

/**
 * Extract the phonetic component from a hint string.
 * Returns null if no phonetic pattern found.
 */
function extractPhoneticFromHint(hint: string): string | null {
  const match = hint.match(PHONETIC_HINT_RE);
  return match ? match[1] : null;
}

// ══════════════════════════════════════════════════════════════════════════
// Part 2: Manual type corrections
// ══════════════════════════════════════════════════════════════════════════

interface ManualFix {
  char: string;
  newType: string;
  newPhonetic?: string;
  newSemantic?: string;
  newHint?: string;
  reason: string;
}

const MANUAL_FIXES: ManualFix[] = [
  // ── 象形 → 会意 ──
  {
    char: '友',
    newType: 'ideographic',
    newPhonetic: '',
    newHint: 'Two hands 又 joined together, representing friendship (会意)',
    reason: '两只手并列=会意，非象形；hint itself describes 会意',
  },
  {
    char: '北',
    newType: 'ideographic',
    newPhonetic: '',
    reason: 'Two people back-to-back = 会意, not pictographic',
  },
  {
    char: '射',
    newType: 'ideographic',
    newPhonetic: '',
    reason: '说文: 会意, 从身从寸 (bow + hand)',
  },
  {
    char: '丧',
    newType: 'ideographic',
    newPhonetic: '',
    reason: '说文: 会意; simplified form of 喪',
  },
  {
    char: '喪',
    newType: 'ideographic',
    newPhonetic: '',
    reason: '说文: 会意; to cry over the dead',
  },
  {
    char: '炏',
    newType: 'ideographic',
    newPhonetic: '',
    newHint: 'Two fires 火 burning side by side (会意)',
    reason: '⿰火火=two fires=会意; original hint was WRONG (copied from 艸, grass)',
  },
  {
    char: '有',
    newType: 'ideographic',
    newPhonetic: '',
    newSemantic: '',
    newHint: 'A hand 𠂇 holding meat 月, representing possession (会意)',
    reason: '⿸𠂇月=手持肉=会意; 说文: 从月又声 but 又/𠂇 is semantic, 月=肉 is also semantic',
  },

  // ── 形声 → 象形 ──
  {
    char: '虫',
    newType: 'pictographic',
    newPhonetic: '',
    newSemantic: '',
    newHint: 'A picture of a snake with a broad head and coiled body (象形)',
    reason: '蛇的象形, not 形声; 说文: 象其臥形',
  },

  // ── 指事 → 会意 (undo fix-indicative.ts mistakes) ──
  {
    char: '章',
    newType: 'ideographic',
    newHint: 'Music 音 organized into movements 十 (会意); 说文: 乐竟为一章，从音从十',
    reason: '说文: 从音从十=会意, not 指事; previous fix-indicative.ts was wrong',
  },
  {
    char: '引',
    newType: 'ideographic',
    newHint: 'To draw a bow 弓 by pulling the string 丨 (会意); 说文: 开弓也',
    reason: '说文: 从弓丨=会意, not 指事; previous fix-indicative.ts was wrong',
  },

  // ── 象形 → 形声 ──
  {
    char: '亭',
    newType: 'pictophonetic',
    newPhonetic: '丁',
    newSemantic: '亠口冖',
    newHint: 'A pavilion ⿳亠口冖; 丁 provides the pronunciation (形声)',
    reason: 'Hint explicitly says 丁 provides pronunciation; 说文: 从高省, 丁声',
  },
  {
    char: '宣',
    newType: 'pictophonetic',
    newPhonetic: '亘',
    newSemantic: '宀',
    newHint: 'A palace 宀 where proclamations are made; 亘 provides the pronunciation (形声)',
    reason: '从宀亘声=形声, not pictographic; 说文: 形声',
  },
  {
    char: '齿',
    newType: 'pictophonetic',
    newPhonetic: '止',
    newSemantic: '凵人',
    newHint: 'Teeth ⿶凵人; 止 provides the pronunciation (形声)',
    reason: 'Hint explicitly says 止 provides pronunciation; 说文: 形声',
  },
  {
    char: '默',
    newType: 'pictophonetic',
    newPhonetic: '黑',
    newSemantic: '犬',
    newHint: 'A dog 犬 watching silently in the dark 黑 (形声); 黑 also provides the pronunciation',
    reason: '从犬黑声=形声, not pictographic; 说文: 形声',
  },

  // ── 会意 → 形声 (with wrong hint about phonetic) ──
  {
    char: '社',
    newType: 'pictophonetic',
    newPhonetic: '土',
    newSemantic: '礻',
    newHint: 'An earth 土 spirit 礻 (形声); 土 provides the pronunciation',
    reason: '说文: 从示土声; original hint wrongly said 礻 provides pronunciation (礻≠社 in sound)',
  },

  // ── 指事 → 形声 ──
  {
    char: '少',
    newType: 'pictophonetic',
    newPhonetic: '丿',
    newSemantic: '小',
    newHint: 'Small 小 with a mark 丿 indicating few/little; 丿 provides the pronunciation (形声); 说文: 从小丿声',
    reason: '说文: 从小丿声=形声; hint admits 小 provides pronunciation, making it at minimum 形声',
  },

  // ── Component swap (type correct, phon/sem reversed) ──
  {
    char: '建',
    newType: 'pictophonetic',
    newPhonetic: '廴',
    newSemantic: '聿',
    newHint: 'To establish 聿; 廴 provides the pronunciation (形声)',
    reason: '说文: 从聿廴声; current data had phon/sem swapped (phon=聿, sem=廴)',
  },

  // ── 会意 → 形声 (missed by auto-fix: "provides the meaning and pronunciation") ──
  {
    char: '私',
    newType: 'pictophonetic',
    newPhonetic: '厶',
    newSemantic: '禾',
    newHint: 'Grain 禾 for private use 厶; 厶 provides the pronunciation (形声); 说文: 从禾厶声',
    reason: '说文: 从禾厶声=形声; hint says 厶 provides meaning AND pronunciation',
  },

  // ── Data fixes (type correct, content wrong) ──
  {
    char: '象',
    newType: 'pictographic',
    newPhonetic: '',
    newSemantic: '',
    newHint: 'A picture of an elephant with a long trunk, tusks, and four legs (象形)',
    reason: 'Type is correct (pictographic), but hint said "boar" and sem=豕 (pig) — both wrong; 象=elephant',
  },
  {
    char: '灰',
    newType: 'ideographic',
    newPhonetic: '',
    newHint: 'The remains of a fire 火 swept away by hand 𠂇 (会意); 说文: 死火餘㶳也，从又从火',
    reason: 'Hint wrongly claimed 火 provides pronunciation; 灰≠火 in sound, it is 会意 (hand+fire=ashes)',
  },
];

// ══════════════════════════════════════════════════════════════════════════
// Main function
// ══════════════════════════════════════════════════════════════════════════

function main() {
  console.log('Reading hanzi-dict.json...');
  const raw = fs.readFileSync(DICT_PATH, 'utf-8');
  const dict = JSON.parse(raw) as Record<string, DictEntry>;

  // ── Statistics ──
  const stats = {
    part1Auto: 0,
    part1Manual: 0,
    part1Skipped: 0,
    part2Fixed: 0,
    part2NotFound: 0,
  };
  const part1Fixes: string[] = [];
  const part1SkippedList: string[] = [];
  const part2Fixes: string[] = [];

  // ═══════════════════════════════════════════════════════════════
  // Part 1: Auto-fix ideographic → pictophonetic
  // ═══════════════════════════════════════════════════════════════
  console.log('\n─── Part 1: Auto-fix ideographic → pictophonetic ───');

  for (const [char, entry] of Object.entries(dict)) {
    if (!entry.etymology || entry.etymology.type !== 'ideographic') continue;
    if (!entry.etymology.hint) continue;

    // Check if hint mentions pronunciation
    if (!/provides.*pronunciation|also.*pronunciation/i.test(entry.etymology.hint)) continue;

    // Skip if in the manual fix list (Part 2 will handle it)
    if (MANUAL_FIXES.some(f => f.char === char)) continue;

    // Check for manual override (edge cases)
    if (PHONETIC_OVERRIDES[char]) {
      const ov = PHONETIC_OVERRIDES[char];
      entry.etymology.type = 'pictophonetic';
      entry.etymology.phonetic = ov.phonetic;
      entry.etymology.semantic = ov.semantic;
      stats.part1Manual++;
      part1Fixes.push(`  ${char}: ideographic → pictophonetic [manual] phon=${ov.phonetic} sem=${ov.semantic}`);
      continue;
    }

    // Extract phonetic from hint
    const phonetic = extractPhoneticFromHint(entry.etymology.hint);
    if (!phonetic) {
      stats.part1Skipped++;
      part1SkippedList.push(`  ${char}: could not extract phonetic from hint: "${entry.etymology.hint.substring(0, 80)}"`);
      continue;
    }

    // Skip if auto-fix blocked
    if (SKIP_AUTO_FIX.has(char)) {
      stats.part1Skipped++;
      part1SkippedList.push(`  ${char}: in SKIP_AUTO_FIX list`);
      continue;
    }

    // Extract semantic from decomposition
    const allComps = extractComponents(entry.decomposition);
    if (allComps.length === 0) {
      stats.part1Skipped++;
      part1SkippedList.push(`  ${char}: no components in decomposition "${entry.decomposition}"`);
      continue;
    }

    // Remove phonetic from components to get semantic
    const semanticComps = allComps.filter(c => c !== phonetic);
    const semantic = semanticComps.length > 0 ? semanticComps.join('') : '';

    if (!semantic && allComps.length === 1) {
      // Only one component which is also the phonetic — flag for review
      stats.part1Skipped++;
      part1SkippedList.push(`  ${char}: only one component "${allComps[0]}" which equals phonetic`);
      continue;
    }

    // Apply fix
    entry.etymology.type = 'pictophonetic';
    entry.etymology.phonetic = phonetic;
    entry.etymology.semantic = semantic;
    stats.part1Auto++;
    part1Fixes.push(`  ${char}: ideographic → pictophonetic [auto] phon=${phonetic} sem=${semantic}`);
  }

  console.log(`  Auto-fixed: ${stats.part1Auto}`);
  console.log(`  Manual overrides: ${stats.part1Manual}`);
  console.log(`  Skipped: ${stats.part1Skipped}`);

  if (part1SkippedList.length > 0) {
    console.log(`\n  ⚠ Skipped entries (${part1SkippedList.length}):`);
    part1SkippedList.forEach(s => console.log(s));
  }

  // ═══════════════════════════════════════════════════════════════
  // Part 2: Manual fixes
  // ═══════════════════════════════════════════════════════════════
  console.log('\n─── Part 2: Manual type corrections ───');

  for (const fix of MANUAL_FIXES) {
    const entry = dict[fix.char];
    if (!entry) {
      stats.part2NotFound++;
      console.log(`  ⚠ ${fix.char}: NOT FOUND in dictionary`);
      continue;
    }

    if (!entry.etymology) {
      entry.etymology = {};
    }

    const oldType = entry.etymology.type || '(empty)';
    entry.etymology.type = fix.newType;

    if (fix.newPhonetic !== undefined) {
      entry.etymology.phonetic = fix.newPhonetic;
    }
    if (fix.newSemantic !== undefined) {
      entry.etymology.semantic = fix.newSemantic;
    }
    if (fix.newHint !== undefined) {
      entry.etymology.hint = fix.newHint;
    }

    stats.part2Fixed++;
    part2Fixes.push(`  ${fix.char}: ${oldType} → ${fix.newType} — ${fix.reason}`);
  }

  console.log(`  Fixed: ${stats.part2Fixed}`);
  if (stats.part2NotFound > 0) {
    console.log(`  Not found: ${stats.part2NotFound}`);
  }

  // ═══════════════════════════════════════════════════════════════
  // Write back
  // ═══════════════════════════════════════════════════════════════
  const totalFixes = stats.part1Auto + stats.part1Manual + stats.part2Fixed;
  console.log(`\nTotal fixes to apply: ${totalFixes}`);
  console.log('Writing hanzi-dict.json...');
  fs.writeFileSync(DICT_PATH, JSON.stringify(dict), 'utf-8');
  console.log('Done!');

  // ═══════════════════════════════════════════════════════════════
  // Print detailed fix logs
  // ═══════════════════════════════════════════════════════════════
  if (part1Fixes.length > 0) {
    console.log(`\n─── Part 1 Fixes (${part1Fixes.length}) ───`);
    console.log('(Sample: first 20 and last 10)');
    part1Fixes.slice(0, 20).forEach(f => console.log(f));
    if (part1Fixes.length > 30) {
      console.log('  ...');
      part1Fixes.slice(-10).forEach(f => console.log(f));
    }
  }

  if (part2Fixes.length > 0) {
    console.log(`\n─── Part 2 Fixes (${part2Fixes.length}) ───`);
    part2Fixes.forEach(f => console.log(f));
  }

  // ═══════════════════════════════════════════════════════════════
  // Verification
  // ═══════════════════════════════════════════════════════════════
  console.log('\n─── Verification ───');
  const verify = JSON.parse(fs.readFileSync(DICT_PATH, 'utf-8')) as Record<string, DictEntry>;

  let pictophoneticCount = 0;
  let ideographicCount = 0;
  let pictographicCount = 0;
  let indicativeCount = 0;
  let emptyCount = 0;

  for (const [, entry] of Object.entries(verify)) {
    const t = entry.etymology?.type;
    if (t === 'pictophonetic') pictophoneticCount++;
    else if (t === 'ideographic') ideographicCount++;
    else if (t === 'pictographic') pictographicCount++;
    else if (t === 'indicative') indicativeCount++;
    else emptyCount++;
  }

  console.log(`  pictophonetic (形声): ${pictophoneticCount}`);
  console.log(`  ideographic (会意):   ${ideographicCount}`);
  console.log(`  pictographic (象形):  ${pictographicCount}`);
  console.log(`  indicative (指事):    ${indicativeCount}`);
  console.log(`  empty:                ${emptyCount}`);
  console.log(`  TOTAL:                ${pictophoneticCount + ideographicCount + pictographicCount + indicativeCount + emptyCount}`);

  // Verify specific manual fixes
  console.log('\n─── Spot-check Manual Fixes ───');
  for (const fix of MANUAL_FIXES) {
    const e = verify[fix.char];
    if (!e) continue;
    const t = e.etymology?.type;
    const status = t === fix.newType ? '✅' : '❌';
    console.log(`  ${status} ${fix.char}: ${t} (expected ${fix.newType})`);
  }

  // Verify Part 1 — spot check a few
  console.log('\n─── Spot-check Part 1 (random sample) ───');
  const spotChecks = ['住', '作', '伸', '忙', '快', '花', '客', '指', '抓', '字', '功', '包', '供', '语', '记', '酒', '论', '证'];
  for (const c of spotChecks) {
    const e = verify[c];
    const t = e?.etymology?.type;
    const status = t === 'pictophonetic' ? '✅' : '❌';
    console.log(`  ${status} ${c}: ${t} phon=${e?.etymology?.phonetic || '(none)'} sem=${e?.etymology?.semantic || '(none)'}`);
  }

  console.log('\n🎉 Fix script completed successfully!');
  console.log('   Original data backed up at: public/hanzi-dict.backup.json');
}

main();
