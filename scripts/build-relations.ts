/**
 * Build multi-dimensional character relation network.
 *
 * Computes 8 relation types across 4 tiers for every dictionary character
 * and outputs a single static JSON for the frontend.
 *
 * Usage: npx tsx scripts/build-relations.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DICT_PATH = path.resolve(__dirname, '../public/hanzi-dict.json');
const SIMP_TRAD_PATH = path.resolve(__dirname, '../public/simp-trad-map.json');
const OUTPUT_PATH = path.resolve(__dirname, '../public/char-relations.json');

interface DictEntry {
  c: string;
  d: string;
  p: string[];
  r: string;
  decomposition?: string;
  etymology?: {
    type: string;
    phonetic?: string;
    semantic?: string;
    hint?: string;
  };
}

// ── Antonym pairs ────────────────────────────────────────────────────
// High-frequency antonym pairs from classical & modern Chinese.
const ANTONYM_PAIRS: [string, string][] = [
  ['上', '下'], ['大', '小'], ['多', '少'], ['高', '低'], ['长', '短'],
  ['前', '后'], ['左', '右'], ['开', '关'], ['进', '退'], ['出', '入'],
  ['来', '去'], ['天', '地'], ['日', '月'], ['男', '女'], ['生', '死'],
  ['水', '火'], ['东', '西'], ['南', '北'], ['内', '外'], ['深', '浅'],
  ['轻', '重'], ['快', '慢'], ['新', '旧'], ['老', '少'], ['强', '弱'],
  ['好', '坏'], ['真', '假'], ['冷', '热'], ['厚', '薄'], ['远', '近'],
  ['早', '晚'], ['古', '今'], ['明', '暗'], ['正', '反'], ['公', '私'],
  ['得', '失'], ['存', '亡'], ['安', '危'], ['始', '终'], ['首', '尾'],
  ['表', '里'], ['善', '恶'], ['美', '丑'], ['爱', '恨'], ['贫', '富'],
  ['贵', '贱'], ['买', '卖'], ['问', '答'], ['攻', '守'], ['彼', '此'],
  ['曲', '直'], ['动', '静'], ['虚', '实'], ['文', '武'], ['恩', '怨'],
  ['嫁', '娶'], ['昼', '夜'], ['寒', '暑'], ['清', '浊'],
];

// ── Pinyin tone normalisation ────────────────────────────────────────

function stripTone(pinyin: string): string {
  return pinyin
    .normalize('NFD')
    .replace(/[̀-̧̨̄̆̇̈̌]/g, '')
    .replace(/[āáǎà]/g, 'a')
    .replace(/[ēéěè]/g, 'e')
    .replace(/[īíǐì]/g, 'i')
    .replace(/[ōóǒò]/g, 'o')
    .replace(/[ūúǔù]/g, 'u')
    .replace(/[ǖǘǚǜ]/g, 'v')
    .normalize('NFC');
}

// ── CJK character detection ──────────────────────────────────────────

function isCJK(cp: number | undefined): boolean {
  return cp != null && cp >= 0x4E00 && cp <= 0x9FFF;
}

function extractCJK(str: string): string[] {
  const chars: string[] = [];
  for (let i = 0; i < str.length; i++) {
    const cp = str.codePointAt(i);
    if (isCJK(cp)) chars.push(str[i]);
  }
  return chars;
}

// ── Main ────────────────────────────────────────────────────────────

interface CharRelations {
  // Tier 1: source-flow relations (strongest)
  /** chars derived FROM this char (etymology.phonetic === this && decomposition contains this) */
  differentiations: string[];
  /** chars sharing the same phonetic component */
  phoneticFamily: string[];
  /** chars sharing the same semantic component */
  semanticFamily: string[];
  /** chars whose decomposition contains this char as a component */
  containedIn: string[];

  // Tier 2: sound-meaning relations
  /** chars with identical pinyin reading */
  homophones: string[];
  /** chars with same pinyin ignoring tone */
  nearHomophones: string[];
  /** antonym pairs */
  antonyms: string[];

  // Tier 3: structural relations
  /** CJK characters in this char's decomposition */
  components: string[];
  /** chars sharing the same radical */
  radicalFamily: string[];

  // Tier 4: script relations
  /** traditional form, if this is simplified */
  traditional: string | null;
  /** simplified form, if this is traditional */
  simplified: string | null;
}

function main() {
  const dict = JSON.parse(fs.readFileSync(DICT_PATH, 'utf-8')) as Record<string, DictEntry>;
  const allChars = Object.keys(dict);
  const charSet = new Set(allChars);

  // Load simp-trad map
  let tradToSimp = new Map<string, string>();
  let simpToTrad = new Map<string, string>();
  if (fs.existsSync(SIMP_TRAD_PATH)) {
    const mapData = JSON.parse(fs.readFileSync(SIMP_TRAD_PATH, 'utf-8')) as Record<string, string>;
    for (const [simp, trad] of Object.entries(mapData)) {
      simpToTrad.set(simp, trad);
      tradToSimp.set(trad, simp);
    }
  }

  // ── Build indexes ──────────────────────────────────────────────────

  // phonetic → chars that use it
  const phoneticIndex = new Map<string, Set<string>>();
  // semantic → chars that use it
  const semanticIndex = new Map<string, Set<string>>();
  // pinyin (exact) → chars
  const pinyinIndex = new Map<string, Set<string>>();
  // pinyin (no tone) → chars
  const pinyinNoToneIndex = new Map<string, Set<string>>();
  // radical → chars
  const radicalIndex = new Map<string, Set<string>>();
  // component → chars whose decomposition contains it
  const containmentIndex = new Map<string, Set<string>>();

  const addToIndex = (map: Map<string, Set<string>>, key: string, char: string) => {
    if (!key || key.length === 0) return;
    let set = map.get(key);
    if (!set) { set = new Set(); map.set(key, set); }
    set.add(char);
  };

  for (const [char, entry] of Object.entries(dict)) {
    // Phonetic index
    const phonetic = entry.etymology?.phonetic;
    if (phonetic && charSet.has(phonetic) && phonetic !== char) {
      addToIndex(phoneticIndex, phonetic, char);
    }

    // Semantic index
    const semantic = entry.etymology?.semantic;
    if (semantic && charSet.has(semantic) && semantic !== char) {
      addToIndex(semanticIndex, semantic, char);
    }

    // Pinyin indexes
    for (const py of entry.p) {
      addToIndex(pinyinIndex, py, char);
      addToIndex(pinyinNoToneIndex, stripTone(py), char);
    }

    // Radical index
    const radical = entry.r;
    if (radical && radical !== char) {
      addToIndex(radicalIndex, radical, char);
    }

    // Containment index — extract CJK chars from decomposition
    const decomp = entry.decomposition || '';
    const cjkChars = extractCJK(decomp);
    for (const c of cjkChars) {
      if (c !== char && charSet.has(c)) {
        addToIndex(containmentIndex, c, char);
      }
    }
  }

  // ── Build antonym map ──────────────────────────────────────────────
  const antonymMap = new Map<string, string[]>();
  for (const [a, b] of ANTONYM_PAIRS) {
    if (!charSet.has(a) || !charSet.has(b)) continue;
    const aList = antonymMap.get(a) || [];
    aList.push(b);
    antonymMap.set(a, aList);
    const bList = antonymMap.get(b) || [];
    bList.push(a);
    antonymMap.set(b, bList);
  }

  // ── Build relations per character ──────────────────────────────────

  const relations: Record<string, CharRelations> = {};
  let processed = 0;

  for (const char of allChars) {
    const entry = dict[char];
    const phonetic = entry.etymology?.phonetic;
    const semantic = entry.etymology?.semantic;

    // --- Differentiations: chars that have THIS char as their phonetic
    //     AND whose decomposition contains this char (strong signal of 分化)
    const diffs: string[] = [];
    const phoneticChildren = phoneticIndex.get(char);
    if (phoneticChildren) {
      for (const child of phoneticChildren) {
        const childDecomp = dict[child]?.decomposition || '';
        if (extractCJK(childDecomp).includes(char)) {
          diffs.push(child);
        }
      }
    }

    // --- Phonetic family ---
    const pf: string[] = [];
    if (phonetic && charSet.has(phonetic)) {
      // This char shares a phonetic with its siblings
      const siblings = phoneticIndex.get(phonetic);
      if (siblings) {
        for (const sib of siblings) {
          if (sib !== char) pf.push(sib);
        }
      }
    }
    // Also include chars that use THIS char as phonetic (children)
    if (phoneticChildren) {
      for (const child of phoneticChildren) {
        if (!pf.includes(child)) pf.push(child);
      }
    }
    // Sort by frequency: chars that share a phonetic with many others first
    pf.sort((a, b) => {
      const aCount = phoneticIndex.get(dict[a]?.etymology?.phonetic || '')?.size || 0;
      const bCount = phoneticIndex.get(dict[b]?.etymology?.phonetic || '')?.size || 0;
      return bCount - aCount;
    });

    // --- Semantic family ---
    const sf: string[] = [];
    if (semantic && charSet.has(semantic)) {
      const siblings = semanticIndex.get(semantic);
      if (siblings) {
        for (const sib of siblings) {
          if (sib !== char) sf.push(sib);
        }
      }
    }

    // --- Contained in ---
    const containedIn = containmentIndex.get(char);
    const ci = containedIn ? [...containedIn].sort() : [];

    // --- Components (CJK chars in this char's decomposition) ---
    const components = extractCJK(entry.decomposition || '').filter(c => c !== char);

    // --- Homophones ---
    const homophones: string[] = [];
    const nearHomophones: string[] = [];
    const seenHomo = new Set<string>();
    const seenNear = new Set<string>();
    for (const py of entry.p) {
      const exactMatches = pinyinIndex.get(py);
      if (exactMatches) {
        for (const m of exactMatches) {
          if (m !== char && !seenHomo.has(m)) {
            seenHomo.add(m);
            homophones.push(m);
          }
        }
      }
      const noTone = stripTone(py);
      const nearMatches = pinyinNoToneIndex.get(noTone);
      if (nearMatches) {
        for (const m of nearMatches) {
          if (m !== char && !seenNear.has(m) && !seenHomo.has(m)) {
            seenNear.add(m);
            nearHomophones.push(m);
          }
        }
      }
    }
    // Sort homophones by "interestingness" — prefer chars that share etymological features
    homophones.sort();

    // --- Antonyms ---
    const antonyms = antonymMap.get(char) || [];

    // --- Radical family ---
    const radical = entry.r;
    let radialFamily: string[] = [];
    if (radical && radical !== char) {
      const rf = radicalIndex.get(radical);
      if (rf) {
        radialFamily = [...rf].filter(c => c !== char);
      }
    }

    // --- Traditional / Simplified ---
    const traditional = simpToTrad.get(char) || null;
    const simplified = tradToSimp.get(char) || null;

    relations[char] = {
      differentiations: diffs,
      phoneticFamily: pf.slice(0, 30),
      semanticFamily: sf.slice(0, 30),
      containedIn: ci.slice(0, 30),
      homophones: homophones.slice(0, 20),
      nearHomophones: nearHomophones.slice(0, 20),
      antonyms,
      components,
      radicalFamily: radialFamily.slice(0, 30),
      traditional,
      simplified,
    };

    processed++;
    if (processed % 2000 === 0) {
      console.log(`  ${processed}/${allChars.length} chars processed...`);
    }
  }

  // ── Write ──────────────────────────────────────────────────────────

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(relations), 'utf-8');
  const sizeMB = (fs.statSync(OUTPUT_PATH).size / (1024 * 1024)).toFixed(2);

  // Stats
  let withDiffs = 0, withPhonFam = 0, withSemFam = 0, withContained = 0;
  let withHomo = 0, withAnto = 0, withRadFam = 0, withTrad = 0;
  for (const [char, rel] of Object.entries(relations)) {
    if (rel.differentiations.length > 0) withDiffs++;
    if (rel.phoneticFamily.length > 0) withPhonFam++;
    if (rel.semanticFamily.length > 0) withSemFam++;
    if (rel.containedIn.length > 0) withContained++;
    if (rel.homophones.length > 0) withHomo++;
    if (rel.antonyms.length > 0) withAnto++;
    if (rel.radicalFamily.length > 0) withRadFam++;
    if (rel.traditional) withTrad++;
  }

  console.log(`\nDone! Output: ${OUTPUT_PATH} (${sizeMB} MB)`);
  console.log(`\nCoverage (${allChars.length} chars):`);
  console.log(`  源流分化:  ${withDiffs} chars have derived characters`);
  console.log(`  同声旁族:  ${withPhonFam} chars have phonetic family`);
  console.log(`  同形旁族:  ${withSemFam} chars have semantic family`);
  console.log(`  构件包含:  ${withContained} chars are contained in others`);
  console.log(`  同音字:    ${withHomo} chars have homophones`);
  console.log(`  反义对:    ${withAnto} chars have antonyms`);
  console.log(`  同部首族:  ${withRadFam} chars share radical`);
  console.log(`  有繁体:    ${withTrad} chars have traditional form`);

  // ── Print sample: 买 ───────────────────────────────────────────────
  if (relations['买']) {
    console.log('\n--- Sample: 买 ---');
    console.log(JSON.stringify(relations['买'], null, 2));
  }
}

main();
