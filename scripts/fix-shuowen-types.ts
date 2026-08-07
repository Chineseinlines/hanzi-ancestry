/**
 * Fix hanzi-dict.json etymology types to match the Shuowen Jiezi (说文解字).
 *
 * For every character present in both hanzi-dict.json and shuowen.json,
 * set etymology.type to the normalized shuowen.sixBooks value.
 *
 * Normalization handles mixed Chinese/English labels in shuowen.json:
 *   形声 / pictophonetic → pictophonetic
 *   会意 / ideographic    → ideographic
 *   象形 / pictographic   → pictographic
 *   指事                  → indicative
 *   假借                  → loan
 *   转注                  → loan (fallback)
 *
 * Characters NOT in shuowen.json (simplified forms, etc.) are left unchanged.
 *
 * Run: npx tsx scripts/fix-shuowen-types.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DICT_PATH = path.resolve(__dirname, '..', 'public', 'hanzi-dict.json');
const SHUOWEN_PATH = path.resolve(__dirname, '..', 'public', 'shuowen.json');

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

interface ShuowenEntry {
  char: string;
  shuowen?: string;
  summary?: string;
  structure?: string;
  sixBooks?: string;
}

// ── Normalization: shuowen.sixBooks → canonical type ──
function normalizeSixBooks(sixBooks: string): string | null {
  switch (sixBooks) {
    // Chinese labels
    case '形声': return 'pictophonetic';
    case '会意': return 'ideographic';
    case '象形': return 'pictographic';
    case '指事': return 'indicative';
    case '假借': return 'loan';
    case '转注': return 'loan'; // fallback — no 转注 chars in current data
    // English labels (shuowen.json uses mixed languages)
    case 'pictophonetic': return 'pictophonetic';
    case 'ideographic': return 'ideographic';
    case 'pictographic': return 'pictographic';
    // Unknown
    default: return null;
  }
}

function main() {
  console.log('Reading data files...');
  const dictRaw = fs.readFileSync(DICT_PATH, 'utf-8');
  const dict = JSON.parse(dictRaw) as Record<string, DictEntry>;

  const shuowenRaw = fs.readFileSync(SHUOWEN_PATH, 'utf-8');
  const shuowen = JSON.parse(shuowenRaw) as Record<string, ShuowenEntry>;

  // ── Statistics ──
  let changed = 0;
  let unchanged = 0;
  let notInShuowen = 0;
  let unknownLabel = 0;
  let newLoanCount = 0;

  const changes: string[] = [];
  const unknownLabels: string[] = [];

  for (const [char, entry] of Object.entries(dict)) {
    const sw = shuowen[char];
    if (!sw || !sw.sixBooks) {
      notInShuowen++;
      continue;
    }

    const newType = normalizeSixBooks(sw.sixBooks);
    if (!newType) {
      unknownLabel++;
      unknownLabels.push(`  ${char}: unknown sixBooks label "${sw.sixBooks}"`);
      continue;
    }

    // Ensure etymology exists
    if (!entry.etymology) {
      entry.etymology = { type: newType, hint: '' };
    }

    const oldType = entry.etymology.type || '(empty)';

    if (oldType !== newType) {
      entry.etymology.type = newType;

      // Track new loan entries
      if (newType === 'loan') newLoanCount++;

      changed++;
      if (changes.length < 50) {
        changes.push(`  ${char}: ${oldType} → ${newType} (shuowen: ${sw.sixBooks})`);
      }
    } else {
      unchanged++;
    }
  }

  // ── Write back ──
  console.log(`\nApplying ${changed} type corrections...`);
  fs.writeFileSync(DICT_PATH, JSON.stringify(dict), 'utf-8');
  console.log('Done!');

  // ── Summary ──
  console.log('\n═══ Fix Summary ═══');
  console.log(`  Changed:      ${changed}`);
  console.log(`  Unchanged:    ${unchanged}`);
  console.log(`  Not in shuowen: ${notInShuowen}`);
  console.log(`  New loan (假借): ${newLoanCount}`);
  if (unknownLabel > 0) {
    console.log(`  ⚠ Unknown labels: ${unknownLabel}`);
    unknownLabels.forEach(l => console.log(l));
  }

  // ── Change samples ──
  if (changes.length > 0) {
    console.log(`\n─── Change samples (first ${Math.min(50, changes.length)}) ───`);
    changes.forEach(c => console.log(c));
  }

  // ── Type distribution after fix ──
  console.log('\n─── Type Distribution After Fix ───');
  const dist: Record<string, number> = {};
  for (const [, entry] of Object.entries(dict)) {
    const t = entry.etymology?.type || '(empty)';
    dist[t] = (dist[t] || 0) + 1;
  }
  for (const [k, v] of Object.entries(dist).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v}`);
  }

  // ── Verification ──
  console.log('\n─── Verification ───');
  // Re-read and check consistency
  const verify = JSON.parse(fs.readFileSync(DICT_PATH, 'utf-8')) as Record<string, DictEntry>;
  let mismatchCount = 0;
  const mismatchSamples: string[] = [];

  for (const [char, entry] of Object.entries(verify)) {
    const sw = shuowen[char];
    if (!sw?.sixBooks) continue;
    const expected = normalizeSixBooks(sw.sixBooks);
    const actual = entry.etymology?.type;
    if (expected && actual !== expected) {
      mismatchCount++;
      if (mismatchSamples.length < 10) {
        mismatchSamples.push(`  ${char}: actual=${actual} expected=${expected} (sw=${sw.sixBooks})`);
      }
    }
  }

  if (mismatchCount === 0) {
    console.log('  ✅ All characters match shuowen!');
  } else {
    console.log(`  ⚠ ${mismatchCount} mismatches remaining`);
    mismatchSamples.forEach(m => console.log(m));
  }

  // Spot-check well-known loan characters
  console.log('\n─── Spot-check Loan Characters ───');
  const loanChecks = ['來', '其', '而', '之', '西', '朋', '能', '焉', '然', '莫', '來'];
  for (const c of loanChecks) {
    const e = verify[c];
    if (e) {
      const t = e.etymology?.type;
      const swType = shuowen[c]?.sixBooks || 'N/A';
      console.log(`  ${c}: type=${t} (shuowen: ${swType})`);
    }
  }

  console.log('\n🎉 Shuowen-based type fix completed!');
}

main();
