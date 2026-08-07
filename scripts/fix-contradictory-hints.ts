/**
 * Fix contradictory hints in hanzi-dict.json.
 *
 * After applying shuowen-based types, 184 characters have hints that say
 * "X also provides the pronunciation" but are classified as ideographic
 * (会意), pictographic (象形), or loan (假借) — NOT pictophonetic.
 *
 * Fix:
 *   1. Remove the "; X also provides the pronunciation" clause
 *   2. Remove "X provides the pronunciation and meaning" clause
 *   3. Append type label: (会意) / (象形) / (假借) / (指事)
 *
 * Run: npx tsx scripts/fix-contradictory-hints.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DICT_PATH = path.resolve(__dirname, '..', 'public', 'hanzi-dict.json');

// Type → Chinese label mapping
const TYPE_LABEL: Record<string, string> = {
  'pictographic': '象形',
  'indicative': '指事',
  'ideographic': '会意',
  'pictophonetic': '形声',
  'loan': '假借',
};

interface EtymologyField {
  type?: string;
  phonetic?: string;
  semantic?: string;
  hint?: string;
}

interface DictEntry {
  c: string;
  etymology?: EtymologyField;
}

/**
 * Clean a hint by removing pronunciation-related clauses
 * and appending the type label.
 */
function cleanHint(hint: string, type: string): string {
  let cleaned = hint;

  // Remove "; CJK_char also provides the pronunciation" or "; CJK_char also provides its pronunciation"
  cleaned = cleaned.replace(/\s*;\s*[⺀-⿟㐀-䶿一-鿿豈-﫿]+\s+also provides the pronunciation\s*/g, '');
  cleaned = cleaned.replace(/\s*;\s*[⺀-⿟㐀-䶿一-鿿豈-﫿]+\s+also provides its pronunciation\s*/g, '');

  // Remove "; CJK_char provides the pronunciation"
  cleaned = cleaned.replace(/\s*;\s*[⺀-⿟㐀-䶿一-鿿豈-﫿]+\s+provides the pronunciation\s*/g, '');

  // Remove "CJK_char provides the pronunciation and meaning" (at end or in sentence)
  cleaned = cleaned.replace(/\s*;\s*[⺀-⿟㐀-䶿一-鿿豈-﫿]+\s+provides the (?:pronunciation and meaning|meaning and pronunciation)\s*/g, '');

  // Remove trailing "; " or " ;" artifacts
  cleaned = cleaned.replace(/\s*;\s*$/, '');

  // Append type label
  const label = TYPE_LABEL[type] || type;
  // Only add if not already present
  if (!cleaned.includes(`(${label})`)) {
    cleaned = cleaned.trimEnd() + ` (${label})`;
  }

  return cleaned;
}

function main() {
  console.log('Reading hanzi-dict.json...');
  const raw = fs.readFileSync(DICT_PATH, 'utf-8');
  const dict = JSON.parse(raw) as Record<string, DictEntry>;

  let fixed = 0;
  const fixes: string[] = [];

  for (const [char, entry] of Object.entries(dict)) {
    if (!entry.etymology?.hint) continue;
    if (!entry.etymology?.type) continue;

    const hint = entry.etymology.hint;
    const type = entry.etymology.type;

    // Only fix if hint says "provides pronunciation" but type is NOT pictophonetic
    if (!/provides.*pronunciation|also.*pronunciation/i.test(hint)) continue;
    if (type === 'pictophonetic') continue;

    const newHint = cleanHint(hint, type);

    if (newHint !== hint) {
      entry.etymology.hint = newHint;
      fixed++;
      if (fixes.length < 30) {
        fixes.push(`  ${char} (${type}): "${hint.substring(0, 70)}..." → "${newHint.substring(0, 70)}..."`);
      }
    }
  }

  console.log(`\nFixed: ${fixed} hints`);
  console.log('Writing hanzi-dict.json...');
  fs.writeFileSync(DICT_PATH, JSON.stringify(dict), 'utf-8');

  // Samples
  console.log(`\n─── Fix samples ───`);
  fixes.forEach(f => console.log(f));

  // Verification
  console.log('\n─── Verification ───');
  const verify = JSON.parse(fs.readFileSync(DICT_PATH, 'utf-8')) as Record<string, DictEntry>;
  let remaining = 0;
  const remainingSamples: string[] = [];

  for (const [char, entry] of Object.entries(verify)) {
    if (!entry.etymology?.hint || !entry.etymology?.type) continue;
    if (/provides.*pronunciation|also.*pronunciation/i.test(entry.etymology.hint) &&
        entry.etymology.type !== 'pictophonetic') {
      remaining++;
      if (remainingSamples.length < 10) {
        remainingSamples.push(`  ${char}: type=${entry.etymology.type} hint="${entry.etymology.hint.substring(0, 80)}"`);
      }
    }
  }

  if (remaining === 0) {
    console.log('  ✅ No remaining contradictions!');
  } else {
    console.log(`  ⚠ ${remaining} remaining contradictions:`);
    remainingSamples.forEach(s => console.log(s));
  }

  console.log('\n🎉 Hint fix completed!');
}

main();
