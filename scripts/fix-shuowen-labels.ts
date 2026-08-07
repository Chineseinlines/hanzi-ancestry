/**
 * Normalize shuowen.json sixBooks labels: English → Chinese.
 *
 * Problem: shuowen.json uses mixed Chinese/English labels for sixBooks.
 *   形声 5186 + pictophonetic 2099
 *   会意 706  + ideographic 482
 *   象形 296  + pictographic 25
 *
 * English labels cause frontend display bug — getEnglishSummary() etc.
 * only match Chinese keys, so English labels show as raw text.
 *
 * Fix: Replace all English labels with their Chinese equivalents.
 *
 * Run: npx tsx scripts/fix-shuowen-labels.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SHUOWEN_PATH = path.resolve(__dirname, '..', 'public', 'shuowen.json');

const LABEL_MAP: Record<string, string> = {
  'pictophonetic': '形声',
  'ideographic': 'ideographic',  // wait — 会意
  'pictographic': '象形',
};

// Actually let me use the correct mapping:
const CORRECT_MAP: Record<string, string> = {
  'pictophonetic': '形声',
  'ideographic': '会意',
  'pictographic': '象形',
};

interface ShuowenEntry {
  char: string;
  sixBooks?: string;
  [key: string]: unknown;
}

function main() {
  console.log('Reading shuowen.json...');
  const raw = fs.readFileSync(SHUOWEN_PATH, 'utf-8');
  const data = JSON.parse(raw) as Record<string, ShuowenEntry>;

  let fixed = 0;
  const before: Record<string, number> = {};

  for (const [, entry] of Object.entries(data)) {
    if (!entry.sixBooks) continue;

    // Track before state
    before[entry.sixBooks] = (before[entry.sixBooks] || 0) + 1;

    // Normalize
    const newLabel = CORRECT_MAP[entry.sixBooks];
    if (newLabel) {
      entry.sixBooks = newLabel;
      fixed++;
    }
  }

  console.log('\nBefore:');
  for (const [k, v] of Object.entries(before).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v}`);
  }

  console.log(`\nFixed: ${fixed} entries`);
  console.log('Writing shuowen.json...');
  fs.writeFileSync(SHUOWEN_PATH, JSON.stringify(data), 'utf-8');

  // Verify
  const verify = JSON.parse(fs.readFileSync(SHUOWEN_PATH, 'utf-8')) as Record<string, ShuowenEntry>;
  const after: Record<string, number> = {};
  let stillEnglish = 0;

  for (const [, entry] of Object.entries(verify)) {
    if (!entry.sixBooks) continue;
    after[entry.sixBooks] = (after[entry.sixBooks] || 0) + 1;
    if (/^[a-zA-Z]/.test(entry.sixBooks)) {
      stillEnglish++;
    }
  }

  console.log('\nAfter:');
  for (const [k, v] of Object.entries(after).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v}`);
  }

  if (stillEnglish === 0) {
    console.log('\n✅ All labels normalized! No English labels remaining.');
  } else {
    console.log(`\n⚠ ${stillEnglish} English labels still remain.`);
  }
}

main();
