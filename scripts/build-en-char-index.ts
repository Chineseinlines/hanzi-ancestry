/**
 * Build English word → Chinese word lookup index from CC-CEDICT.
 *
 * Outputs a mapping from English keywords to arrays of Chinese words
 * (with pinyin and definition), sorted by relevance.
 *
 * Format: { "sun": [{w:"太阳", p:"tai4 yang2", d:"sun"}, ...], ... }
 *
 * This enables the frontend to show a two-layer result:
 *   1. Matching Chinese words (with pinyin + definition)
 *   2. Unique characters extracted from those words
 *
 * Usage: npx tsx scripts/build-en-char-index.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CEDICT_JSON_PATH = path.resolve(__dirname, '../node_modules/cedict-json/cedict.json');
const COMMON_CHARS_PATH = path.resolve(__dirname, '../public/common-chars.json');
const OUTPUT_PATH = path.resolve(__dirname, '../public/en-word-index.json');

interface CedictEntry {
  traditional: string;
  simplified: string;
  pinyin: string;
  english: string[];
}

interface WordEntry {
  w: string;   // Chinese word (simplified)
  p: string;   // pinyin
  d: string;   // the English definition that matched
}

// ── Stop words ────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'between', 'under', 'again',
  'all', 'both', 'each', 'few', 'more', 'most', 'other', 'some',
  'such', 'no', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
  'very', 'and', 'but', 'or', 'nor', 'if', 'while', 'that', 'this',
  'it', 'its', 'he', 'she', 'they', 'them', 'their', 'we', 'us', 'our',
  'you', 'your', 'me', 'my', 'him', 'his', 'her', 'one', 'two', 'also',
  'just', 'up', 'out', 'about', 'over', 'which', 'who', 'whom', 'what',
  'any', 'per', 'used', 'name', 'etc', 'eg', 'ie', 'see', 'cf',
  'like', 'make', 'get', 'set', 'put', 'way', 'part', 'type', 'form',
  'person', 'people', 'thing', 'something', 'anything', 'nothing',
  'much', 'many', 'well', 'often', 'usually', 'especially', 'really',
  'still', 'yet', 'already', 'always', 'never', 'ever', 'even',
  'variant', 'variant of', 'abbr', 'abbr.', 'old', 'new',
  'classifier', 'classifier for', 'measure', 'measure word',
  'surname', 'given', 'proper', 'various', 'different', 'certain',
  'means', 'word', 'term', 'expression', 'literally', 'figuratively',
  'total', 'number', 'place', 'time', 'day', 'year', 'month',
]);

const SKIP_PATTERNS = [
  /^cl$/i, /^cls$/i, /^cl\.$/i,
  /^classifier.*/i,
  /^measure word.*/i,
  /^surname$/i,
  /^\(.*\)$/,
  /^\d+$/,
  /^[a-z]$/,
];

const TOP_N = 20; // max Chinese words per English keyword

function isCJK(cp: number): boolean {
  return cp >= 0x4E00 && cp <= 0x9FFF;
}

/** Extract keywords from a single English definition string, deduped. */
function extractKeywords(def: string): Set<string> {
  let cleaned = def.replace(/\([^)]*\)/g, ' ').replace(/\[[^\]]*\]/g, ' ');
  cleaned = cleaned.replace(/[.,;:!?/\\"']/g, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  const words = new Set<string>();
  for (const w of cleaned.split(' ')) {
    const word = w.toLowerCase().trim();
    if (!word || word.length < 2) continue;
    if (STOP_WORDS.has(word)) continue;
    let skip = false;
    for (const pat of SKIP_PATTERNS) {
      if (pat.test(word)) { skip = true; break; }
    }
    if (skip) continue;
    words.add(word);
  }
  return words;
}

// ── Main ───────────────────────────────────────────────────────────
async function main() {
  console.log('Loading CC-CEDICT data...');
  const cedictRaw = fs.readFileSync(CEDICT_JSON_PATH, 'utf-8');
  const cedict: CedictEntry[] = JSON.parse(cedictRaw);
  console.log(`  Loaded ${cedict.length.toLocaleString()} entries`);

  // Load valid character set (6500 common chars from 通用规范汉字表)
  console.log('Loading common-chars.json...');
  const commonRaw = fs.readFileSync(COMMON_CHARS_PATH, 'utf-8');
  const commonList: string[] = JSON.parse(commonRaw);
  const validChars = new Set(commonList);
  console.log(`  ${validChars.size} common characters`);

  // Build: english word → Map<chinese word, WordEntry>
  // (using Map to deduplicate by word, keeping the definition that matched)
  const enToWords = new Map<string, Map<string, WordEntry>>();

  let processedCount = 0;
  for (const entry of cedict) {
    processedCount++;
    if (processedCount % 20000 === 0) {
      console.log(`  Processing... ${processedCount.toLocaleString()}/${cedict.length.toLocaleString()}`);
    }

    const word = entry.simplified;
    // Only include words that contain at least one valid character
    let hasValidChar = false;
    for (const ch of word) {
      const cp = ch.codePointAt(0);
      if (cp && isCJK(cp) && validChars.has(ch)) { hasValidChar = true; break; }
    }
    if (!hasValidChar) continue;

    const pinyin = entry.pinyin;

    for (const def of entry.english) {
      const keywords = extractKeywords(def);
      for (const kw of keywords) {
        let wordMap = enToWords.get(kw);
        if (!wordMap) {
          wordMap = new Map();
          enToWords.set(kw, wordMap);
        }
        // Keep the first (shortest) definition for each keyword
        if (!wordMap.has(word)) {
          wordMap.set(word, { w: word, p: pinyin, d: def.length > 100 ? def.slice(0, 97) + '...' : def });
        }
      }
    }
  }

  console.log(`  Built index with ${enToWords.size.toLocaleString()} unique English keywords`);

  // Sort and trim: keep top N Chinese words per English keyword
  // Relevancy: keyword hit count in definition → shorter word → shorter definition
  console.log('Sorting and trimming...');
  const output: Record<string, WordEntry[]> = {};

  // Count how many times a keyword appears in a definition (exact word match)
  function keywordHits(kw: string, def: string): number {
    const lower = def.toLowerCase();
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\b${escaped}\\b`, 'gi');
    const matches = lower.match(re);
    return matches ? matches.length : 0;
  }

  for (const [kw, wordMap] of enToWords) {
    if (wordMap.size < 2) continue;

    const sorted = [...wordMap.values()].sort((a, b) => {
      // 1. Keyword occurrence count in definition (more mentions → more relevant)
      const hitsA = keywordHits(kw, a.d);
      const hitsB = keywordHits(kw, b.d);
      if (hitsA !== hitsB) return hitsB - hitsA;
      // 2. Shorter words are more likely to be direct translations
      if (a.w.length !== b.w.length) return a.w.length - b.w.length;
      // 3. Among same length, prefer shorter definitions
      return a.d.length - b.d.length;
    });

    output[kw] = sorted.slice(0, TOP_N);
  }

  const keptCount = Object.keys(output).length;
  console.log(`  Output: ${keptCount.toLocaleString()} keywords`);

  // Write
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output), 'utf-8');
  const outputSize = (fs.statSync(OUTPUT_PATH).size / 1024 / 1024).toFixed(2);
  console.log(`\nOutput: ${OUTPUT_PATH} (${outputSize} MB)`);

  // ── Examples ──────────────────────────────────────────────────
  const examples = ['sun', 'go', 'water', 'moon', 'fire', 'tree', 'mountain', 'rude', 'brave', 'heart'];
  console.log('\n── Examples ──');
  for (const ex of examples) {
    const words = output[ex];
    if (words) {
      const preview = words.slice(0, 6).map(e => `${e.w}(${e.d.slice(0, 30)})`).join(' | ');
      console.log(`  "${ex}" (${words.length}): ${preview}`);
    } else {
      console.log(`  "${ex}" → (not found)`);
    }
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
