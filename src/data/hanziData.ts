import type { HanziEntry, DecompositionNode, CognateResult, ComponentCognateResult, StrokeData, CulturalData, ShuowenEntry, CharRelations } from './types';

// ── In-memory data store ────────────────────────────────────────────
let charMap: Map<string, HanziEntry> | null = null;
let reverseIndex: Map<string, string[]> | null = null;
let dataLoadPromise: Promise<void> | null = null;

// Stroke & cultural data
let culturalMap: Map<string, CulturalData> | null = null;
let culturalPromise: Promise<void> | null = null;

// Shuowen data
let shuowenMap: Map<string, ShuowenEntry> | null = null;
let shuowenPromise: Promise<void> | null = null;

// Simplified → Traditional mapping
let simpToTrad: Map<string, string> | null = null;
let simpTradPromise: Promise<void> | null = null;

// Character relations — computed in-memory from loaded data (no separate JSON fetch)
let phoneticIndex: Map<string, Set<string>> | null = null;
let semanticIndex: Map<string, Set<string>> | null = null;
let pinyinIndex: Map<string, Set<string>> | null = null;
let pinyinNoToneIndex: Map<string, Set<string>> | null = null;

// Structural importance: how many chars contain this char as a component
// Proxy for character frequency/fundamental-ness
let structuralRank: Map<string, number> | null = null;

// Traditional → Simplified reverse mapping (built from simpToTrad)
let tradToSimp: Map<string, string> | null = null;

// Antonym pairs (high-frequency, curated)
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

// CDN stroke cache
const strokeCache = new Map<string, StrokeData>();
const strokePending = new Map<string, Promise<StrokeData | undefined>>();

const STROKE_CDN = 'https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0';

// Stroke blacklist — pure strokes that shouldn't be treated as components
const STROKE_BLACKLIST = new Set(['一','丨','丿','丶','乙','亅','乀']);

/** Strip tone marks from pinyin, returning base syllable (e.g. "mǎi" → "mai") */
function stripTone(pinyin: string): string {
  return pinyin
    .normalize('NFD')
    .replace(/[̀-̄̆-̧̈-̨]/g, '')
    .normalize('NFC');
}

/**
 * Load character dictionary from Make Me a Hanzi data.
 */
export async function loadData(): Promise<void> {
  if (charMap && reverseIndex) return;
  if (dataLoadPromise) return dataLoadPromise;

  dataLoadPromise = (async () => {
    try {
      const [dictRes, indexRes] = await Promise.all([
        fetch(`${import.meta.env.BASE_URL}hanzi-dict.json`),
        fetch(`${import.meta.env.BASE_URL}hanzi-index.json`),
      ]);

      if (!dictRes.ok) throw new Error(`hanzi-dict.json: ${dictRes.status}`);
      if (!indexRes.ok) throw new Error(`hanzi-index.json: ${indexRes.status}`);

      const rawDict = await dictRes.json() as Record<string, {
        c: string; d: string; p: string[]; r: string; decomposition: string;
        etymology?: { type: string; phonetic?: string; semantic?: string; hint?: string };
      }>;
      const rawIndex = await indexRes.json() as Record<string, string[]>;

      charMap = new Map();
      for (const [char, raw] of Object.entries(rawDict)) {
        const entry: HanziEntry = {
          character: raw.c,
          definition: raw.d || '',
          pinyin: raw.p || [],
          leafComponents: [],
          radical: raw.r || char,
          decomposition: raw.decomposition || '',
          etymologyHint: raw.etymology?.hint,
        };
        if (raw.etymology?.type) {
          entry.etymology = {
            type: raw.etymology.type as 'pictographic' | 'indicative' | 'ideographic' | 'pictophonetic',
            phonetic: raw.etymology.phonetic,
            semantic: raw.etymology.semantic,
            hint: raw.etymology.hint,
          };
        }
        charMap.set(char, entry);
      }

      reverseIndex = new Map();
      for (const [comp, chars] of Object.entries(rawIndex)) {
        reverseIndex.set(comp, chars);
      }

      // Build relation indexes in-memory
      phoneticIndex = new Map();
      semanticIndex = new Map();
      pinyinIndex = new Map();
      pinyinNoToneIndex = new Map();
      const charSet = new Set(Object.keys(rawDict));

      for (const [char, raw] of Object.entries(rawDict)) {
        const phonetic = raw.etymology?.phonetic;
        if (phonetic && charSet.has(phonetic) && phonetic !== char) {
          let s = phoneticIndex.get(phonetic);
          if (!s) { s = new Set(); phoneticIndex.set(phonetic, s); }
          s.add(char);
        }

        const semantic = raw.etymology?.semantic;
        if (semantic && charSet.has(semantic) && semantic !== char) {
          let s = semanticIndex.get(semantic);
          if (!s) { s = new Set(); semanticIndex.set(semantic, s); }
          s.add(char);
        }

        for (const py of raw.p || []) {
          let s = pinyinIndex.get(py);
          if (!s) { s = new Set(); pinyinIndex.set(py, s); }
          s.add(char);
          // Also index by tone-stripped pinyin for near-homophones
          const noTone = stripTone(py);
          let nt = pinyinNoToneIndex.get(noTone);
          if (!nt) { nt = new Set(); pinyinNoToneIndex.set(noTone, nt); }
          nt.add(char);
        }
      }

      // Compute structural importance from reverse index
      // (how many characters contain this char as a component — proxy for frequency)
      structuralRank = new Map();
      for (const [comp, chars] of reverseIndex.entries()) {
        // Dedup the array in case source data has duplicates
        const unique = new Set(chars);
        structuralRank.set(comp, unique.size);
      }
    } catch (err) {
      console.error('Failed to load hanzi data:', err);
      charMap = null;
      reverseIndex = null;
      dataLoadPromise = null;
    }
  })();

  return dataLoadPromise;
}

export function getCharacter(char: string): HanziEntry | undefined {
  const entry = charMap?.get(char);
  if (entry) return entry;

  // Fall back to traditional form entry
  const trad = simpToTrad?.get(char);
  if (trad) return charMap?.get(trad);
  return undefined;
}

/** Get the character entry, enriched with traditional form data if applicable. */
export function getCharacterEnriched(char: string): HanziEntry | undefined {
  const entry = charMap?.get(char);
  if (!entry) {
    // Try traditional form
    const trad = simpToTrad?.get(char);
    if (trad) return charMap?.get(trad);
    return undefined;
  }

  // If entry already has etymology, return as-is
  if (entry.etymology?.type) return entry;

  // Try to enrich from traditional form
  const trad = simpToTrad?.get(char);
  if (!trad) return entry;

  const tradEntry = charMap?.get(trad);
  if (!tradEntry?.etymology?.type) return entry;

  return {
    ...entry,
    etymology: tradEntry.etymology,
    decomposition: tradEntry.decomposition || entry.decomposition,
    radical: tradEntry.radical || entry.radical,
    traditional: trad,
  };
}

export function hasCharacter(char: string): boolean {
  return charMap?.has(char) ?? false;
}

/**
 * Build etymology-driven decomposition tree.
 *
 * Rules:
 * - pictographic / indicative → atomic (no children), don't split
 * - pictophonetic → one level: semantic + phonetic as leaf nodes
 * - ideographic → one level: extract components from IDS as leaf nodes
 * - No recursive decomposition for any type.
 */
function buildTree(char: string, showEtymology: boolean = true): DecompositionNode {
  const entry = charMap?.get(char);
  if (!entry) {
    return { character: char, decomposition: char, children: [], isLeaf: true };
  }

  const ety = entry.etymology;

  // Pictographic / indicative: always atomic
  if (ety && (ety.type === 'pictographic' || ety.type === 'indicative')) {
    return { character: char, decomposition: char, children: [], isLeaf: true };
  }

  // Pictophonetic: semantic + phonetic as leaf nodes
  if (ety && ety.type === 'pictophonetic' && showEtymology) {
    const children: DecompositionNode[] = [];
    if (ety.semantic && ety.semantic !== char) {
      children.push({ character: ety.semantic, decomposition: ety.semantic, children: [], isLeaf: true });
    }
    if (ety.phonetic && ety.phonetic !== char && ety.phonetic !== ety.semantic) {
      children.push({ character: ety.phonetic, decomposition: ety.phonetic, children: [], isLeaf: true });
    }
    if (children.length > 0) {
      return { character: char, decomposition: char, children, isLeaf: false };
    }
  }

  // Ideographic: extract CJK components from decomposition IDS string
  if (ety && ety.type === 'ideographic' && showEtymology) {
    const decomp = entry.decomposition || '';
    // Extract CJK characters (U+4E00-U+9FFF) from the IDS string
    const cjkChars: string[] = [];
    for (let i = 0; i < decomp.length; i++) {
      const cp = decomp.codePointAt(i);
      if (cp && cp >= 0x4E00 && cp <= 0x9FFF) {
        cjkChars.push(decomp[i]);
      }
    }
    const unique = [...new Set(cjkChars)].filter(c => c !== char && !STROKE_BLACKLIST.has(c));
    if (unique.length >= 1) {
      const children = unique.map(c => ({
        character: c, decomposition: c, children: [], isLeaf: true,
      }));
      return { character: char, decomposition: char, children, isLeaf: false };
    }
  }

  // Fallback: no etymology or can't decompose → atomic
  return { character: char, decomposition: char, children: [], isLeaf: true };
}

export function decomposeCharacter(char: string): DecompositionNode | null {
  if (!charMap) return null;
  if (!charMap.has(char)) return null;
  return buildTree(char, true);
}

export function getCharacterLeaves(char: string): string[] {
  const node = decomposeCharacter(char);
  if (!node) return [];
  return node.children.map(c => c.character);
}

export function getTraditional(_char: string): string | null {
  return null; // New data source doesn't include traditional forms
}

export function getTraditionalComponents(_char: string): string[] {
  return []; // New data source doesn't include traditional components
}

// ── Stroke data (async, from CDN) ─────────────────────────────────

export async function getStrokeData(char: string): Promise<StrokeData | undefined> {
  if (strokeCache.has(char)) return strokeCache.get(char);
  if (strokePending.has(char)) return strokePending.get(char);

  const promise = (async () => {
    try {
      const url = `${STROKE_CDN}/${encodeURIComponent(char)}.json`;
      const res = await fetch(url);
      if (!res.ok) return undefined;
      const data = await res.json();
      if (!data.strokes || data.strokes.length === 0) return undefined;
      const sd: StrokeData = {
        strokes: data.strokes,
        medians: data.medians || [],
      };
      strokeCache.set(char, sd);
      return sd;
    } catch {
      return undefined;
    } finally {
      strokePending.delete(char);
    }
  })();

  strokePending.set(char, promise);
  return promise;
}

export function getStrokeDataCached(char: string): StrokeData | undefined {
  return strokeCache.get(char);
}

export function preloadStrokeData(chars: string[]): void {
  for (const c of chars) {
    if (!strokeCache.has(c) && !strokePending.has(c)) {
      getStrokeData(c);
    }
  }
}

// ── Cognitive network ──────────────────────────────────────────────

export function getComponentCognates(component: string, maxResults: number = 30): ComponentCognateResult[] {
  if (!charMap || !reverseIndex) return [];

  const chars = reverseIndex.get(component);
  if (!chars || chars.length === 0) return [];

  const results: ComponentCognateResult[] = [];
  for (const c of chars) {
    if (!charMap.has(c)) continue;
    const entry = charMap.get(c)!;
    const etymological = entry.etymology?.phonetic === component || entry.etymology?.semantic === component ? 10 : 0;
    const importance = getImportance(c);
    const score = etymological + Math.log2(importance + 1);
    results.push({ character: c, definition: entry.definition, pinyin: entry.pinyin[0] || '', score });
  }

  results.sort((a, b) => b.score - a.score);
  // Apply simp-trad dedup on the sorted results
  const seen = new Set<string>();
  const deduped: ComponentCognateResult[] = [];
  for (const r of results) {
    if (seen.has(r.character)) continue;
    // Also skip traditional form if simplified already seen
    const simp = tradToSimp?.get(r.character);
    if (simp && seen.has(simp)) continue;
    const trad = simpToTrad?.get(r.character);
    if (trad && seen.has(trad)) continue;
    seen.add(r.character);
    deduped.push(r);
  }
  return deduped.slice(0, maxResults);
}

export function getCognates(char: string, maxResults: number = 30): CognateResult[] {
  const entry = charMap?.get(char);
  if (!entry) return [];

  const ety = entry.etymology;
  const componentsToCheck: string[] = [];

  if (ety) {
    if (ety.semantic) componentsToCheck.push(ety.semantic);
    if (ety.phonetic) componentsToCheck.push(ety.phonetic);
  }

  // Fallback: use decomposition
  if (componentsToCheck.length === 0 && entry.decomposition) {
    for (let i = 0; i < entry.decomposition.length; i++) {
      const cp = entry.decomposition.codePointAt(i);
      if (cp && cp >= 0x4E00 && cp <= 0x9FFF) {
        const c = entry.decomposition[i];
        if (!STROKE_BLACKLIST.has(c) && c !== char) componentsToCheck.push(c);
      }
    }
  }

  const cognateScores = new Map<string, { score: number; shared: Set<string> }>();

  for (const comp of componentsToCheck) {
    if (STROKE_BLACKLIST.has(comp)) continue;
    const chars = reverseIndex?.get(comp);
    if (!chars) continue;

    for (const c of chars) {
      if (c === char) continue;
      if (!charMap?.has(c)) continue;

      const existing = cognateScores.get(c);
      if (existing) {
        existing.score += 1;
        existing.shared.add(comp);
      } else {
        cognateScores.set(c, { score: 1, shared: new Set([comp]) });
      }
    }
  }

  const filtered = Array.from(cognateScores.entries())
    .filter(([, data]) => data.shared.size > 0)
    .sort((a, b) => {
      // Primary: number of shared components; secondary: structural importance
      const scoreDiff = b[1].score - a[1].score;
      if (scoreDiff !== 0) return scoreDiff;
      return getImportance(b[0]) - getImportance(a[0]);
    });

  const results: CognateResult[] = [];
  const seen = new Set<string>();
  for (const [c, data] of filtered) {
    if (seen.has(c)) continue;
    const simp = tradToSimp?.get(c);
    if (simp && seen.has(simp)) continue;
    const trad = simpToTrad?.get(c);
    if (trad && seen.has(trad)) continue;
    seen.add(c);
    const cEntry = charMap!.get(c)!;
    results.push({
      character: c,
      definition: cEntry.definition,
      pinyin: cEntry.pinyin[0] || '',
      sharedComponents: Array.from(data.shared),
      score: data.score,
    });
    if (results.length >= maxResults) break;
  }

  return results;
}

export function getCharactersWithComponent(comp: string): string[] {
  return reverseIndex?.get(comp) ?? [];
}

export function getCharacterCount(): number {
  return charMap?.size ?? 0;
}

export function getAllCharacters(): HanziEntry[] {
  return Array.from(charMap?.values() ?? []);
}

// ── Cultural data ──────────────────────────────────────────────────
export async function loadCulturalData(): Promise<void> {
  if (culturalMap) return;
  if (culturalPromise) return culturalPromise;

  culturalPromise = (async () => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}cultural.json`);
      if (!res.ok) throw new Error(`cultural.json: ${res.status}`);
      const data = await res.json() as Record<string, CulturalData>;
      culturalMap = new Map(Object.entries(data));
    } catch (err) {
      console.error('Failed to load cultural data:', err);
      culturalMap = new Map();
    }
  })();
  return culturalPromise;
}

export function getCulturalData(char: string): CulturalData | undefined {
  return culturalMap?.get(char);
}

// ── Shuowen data ────────────────────────────────────────────────────
export async function loadShuowen(): Promise<void> {
  if (shuowenMap) return;
  if (shuowenPromise) return shuowenPromise;

  shuowenPromise = (async () => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}shuowen.json`);
      if (!res.ok) throw new Error(`shuowen.json: ${res.status}`);
      const data = await res.json() as Record<string, ShuowenEntry>;
      shuowenMap = new Map(Object.entries(data));
    } catch (err) {
      console.error('Failed to load shuowen data:', err);
      shuowenMap = new Map();
    }
  })();
  return shuowenPromise;
}

export function getShuowen(char: string): ShuowenEntry | undefined {
  if (shuowenMap?.has(char)) return shuowenMap.get(char);
  // Fall back to traditional form
  const trad = simpToTrad?.get(char);
  if (trad && shuowenMap?.has(trad)) return shuowenMap.get(trad);
  return undefined;
}

// ── Simplified-Traditional mapping ──────────────────────────────────
export async function loadSimpTradMap(): Promise<void> {
  if (simpToTrad) return;
  if (simpTradPromise) return simpTradPromise;

  simpTradPromise = (async () => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}simp-trad-map.json`);
      if (!res.ok) throw new Error(`simp-trad-map.json: ${res.status}`);
      const data = await res.json() as Record<string, string>;
      simpToTrad = new Map(Object.entries(data));
      // Build reverse mapping (traditional → simplified)
      tradToSimp = new Map();
      for (const [simp, trad] of Object.entries(data)) {
        if (!tradToSimp.has(trad)) tradToSimp.set(trad, simp);
      }
    } catch (err) {
      console.error('Failed to load simp-trad map:', err);
      simpToTrad = new Map();
    }
  })();
  return simpTradPromise;
}

/** Get the traditional form of a character, or return the char itself if none exists. */
export function getTraditionalForm(char: string): string {
  return simpToTrad?.get(char) ?? char;
}

/** Check if a char is simplified and has a traditional counterpart. */
export function hasTraditional(char: string): boolean {
  return simpToTrad?.has(char) ?? false;
}

// ── Character relations (computed in-memory, no JSON fetch) ─────────────

let relationsReady = false;

function extractCJK(str: string): string[] {
  const chars: string[] = [];
  for (let i = 0; i < str.length; i++) {
    const cp = str.codePointAt(i);
    if (cp && cp >= 0x4E00 && cp <= 0x9FFF) chars.push(str[i]);
  }
  return chars;
}

/** Structural importance score — higher = more fundamental/common character */
function getImportance(c: string): number {
  // Base: how many characters contain this char as a component (fundamental building block)
  const struct = structuralRank?.get(c) ?? 0;
  // Bonus for having etymology data (well-studied, common char)
  const entry = charMap?.get(c);
  const hasEtymology = entry?.etymology?.type ? 5 : 0;
  return struct + hasEtymology;
}

/** Sort an array of characters by structural importance (descending) */
function sortByImportance(chars: string[]): string[] {
  return chars.sort((a, b) => getImportance(b) - getImportance(a));
}

/**
 * Remove traditional-form duplicates from a list.
 * Uses explicit simp-trad map first, then falls back to pinyin+definition overlap.
 * When both forms exist, keeps the more common (higher importance) one.
 */
function dedupSimpTrad(chars: string[]): string[] {
  if (chars.length <= 1) return chars;
  const toRemove = new Set<string>();

  for (let i = 0; i < chars.length; i++) {
    if (toRemove.has(chars[i])) continue;
    for (let j = i + 1; j < chars.length; j++) {
      if (toRemove.has(chars[j])) continue;
      const a = chars[i], b = chars[j];

      // Check 1: explicit simp-trad map
      const aTrad = simpToTrad?.get(a);
      const bTrad = simpToTrad?.get(b);
      const aSimp = tradToSimp?.get(a);
      const bSimp = tradToSimp?.get(b);

      if (aTrad === b || bTrad === a || aSimp === b || bSimp === a) {
        // Keep the more important one
        if (getImportance(a) >= getImportance(b)) toRemove.add(b);
        else toRemove.add(a);
        continue;
      }

      // Check 2: same tone-stripped pinyin + definition overlap (heuristic)
      const entryA = charMap?.get(a), entryB = charMap?.get(b);
      if (entryA && entryB) {
        const pinyinA = entryA.pinyin.map(p => stripTone(p));
        const pinyinB = entryB.pinyin.map(p => stripTone(p));
        const sharePinyin = pinyinA.some(pa => pinyinB.includes(pa));
        if (sharePinyin) {
          const defA = entryA.definition || '', defB = entryB.definition || '';
          // Definition similarity: one contains the other, or high overlap
          const shareDef = defA.includes(defB.slice(0, 10)) || defB.includes(defA.slice(0, 10))
            || (defA.slice(0, 20) === defB.slice(0, 20));
          if (shareDef) {
            if (getImportance(a) >= getImportance(b)) toRemove.add(b);
            else toRemove.add(a);
          }
        }
      }
    }
  }

  return toRemove.size === 0 ? chars : chars.filter(c => !toRemove.has(c));
}

export function computeRelations(char: string): CharRelations {
  const entry = charMap?.get(char);
  if (!entry) {
    return { differentiations:[], phoneticFamily:[], semanticFamily:[], containedIn:[], homophones:[], nearHomophones:[], antonyms:[], components:[], radicalFamily:[], traditional:null, simplified:null };
  }

  const charSet = charMap!;
  const phonetic = entry.etymology?.phonetic;
  const semantic = entry.etymology?.semantic;

  // ── Differentiations ──────────────────────────────────────────────
  const diffSet = new Set<string>();
  const children = phoneticIndex?.get(char);
  if (children) {
    for (const child of children) {
      const cd = charSet.get(child)?.decomposition || '';
      if (extractCJK(cd).includes(char)) diffSet.add(child);
    }
  }

  // ── Antonyms ──────────────────────────────────────────────────────
  const antonymLookup = new Map<string, string[]>();
  for (const [a, b] of ANTONYM_PAIRS) {
    if (!charSet.has(a) || !charSet.has(b)) continue;
    const l = antonymLookup.get(a) || []; l.push(b); antonymLookup.set(a, l);
    const r = antonymLookup.get(b) || []; r.push(a); antonymLookup.set(b, r);
  }
  const antSet = new Set(antonymLookup.get(char) || []);

  // ── Phonetic family ───────────────────────────────────────────────
  const pfSet = new Set<string>();
  if (phonetic && charSet.has(phonetic)) {
    const sibs = phoneticIndex?.get(phonetic);
    if (sibs) for (const s of sibs) { if (s !== char) pfSet.add(s); }
  }
  if (children) for (const c of children) pfSet.add(c);

  // ── Semantic family ───────────────────────────────────────────────
  const sfSet = new Set<string>();
  if (semantic && charSet.has(semantic)) {
    const sibs = semanticIndex?.get(semantic);
    if (sibs) for (const s of sibs) { if (s !== char) sfSet.add(s); }
  }

  // ── Contained in ──────────────────────────────────────────────────
  const ciSet = new Set(reverseIndex?.get(char) || []);

  // ── Homophones ────────────────────────────────────────────────────
  const homoSet = new Set<string>();
  for (const py of entry.pinyin) {
    const exact = pinyinIndex?.get(py);
    if (exact) for (const c of exact) { if (c !== char) homoSet.add(c); }
  }

  // ── Near-homophones ───────────────────────────────────────────────
  const nearHomoSet = new Set<string>();
  for (const py of entry.pinyin) {
    const noTone = stripTone(py);
    const near = pinyinNoToneIndex?.get(noTone);
    if (near) for (const c of near) {
      if (c !== char && !homoSet.has(c)) nearHomoSet.add(c);
    }
  }

  // ── Components ────────────────────────────────────────────────────
  const components = extractCJK(entry.decomposition || '').filter(c => c !== char);

  // ── Radical family ────────────────────────────────────────────────
  const radSet = new Set<string>();
  const radical = entry.radical;
  if (radical && radical !== char) {
    for (const [c, e] of charSet) {
      if (c !== char && e.radical === radical) radSet.add(c);
    }
  }

  // ── Self-variant set (chars to never include) ──────────────────────
  const traditional = simpToTrad?.get(char) || null;
  let simplified: string | null = null;
  if (simpToTrad) {
    for (const [s, t] of simpToTrad) { if (t === char) { simplified = s; break; } }
  }
  const selfVariants = new Set([char, traditional, simplified].filter(Boolean) as string[]);

  // ── Build mutually-exclusive lists (priority order) ───────────────
  // Each character appears only in the highest-priority list that claims it.
  // Priority: differentiation > antonym > phonetic > semantic > containedIn > homophone > nearHomophone > radical
  const claimed = new Set<string>();

  function takeList(set: Set<string>, limit: number): string[] {
    const result = dedupSimpTrad(sortByImportance([...set]))
      .filter(c => !selfVariants.has(c) && !claimed.has(c));
    const taken = result.slice(0, limit);
    for (const c of taken) claimed.add(c);
    return taken;
  }

  const differentiations = takeList(diffSet, 30);
  const antonyms         = takeList(antSet, 30);
  const phoneticFamily   = takeList(pfSet, 30);
  const semanticFamily   = takeList(sfSet, 30);
  const containedIn      = takeList(ciSet, 30);
  const homophones       = takeList(homoSet, 20);
  const nearHomophones   = takeList(nearHomoSet, 20);
  const radicalFamily    = takeList(radSet, 30);

  return {
    differentiations, phoneticFamily, semanticFamily,
    containedIn, homophones, nearHomophones,
    antonyms, components, radicalFamily,
    traditional, simplified,
  };
}

export async function loadRelations(): Promise<void> {
  await loadData();
  relationsReady = true;
}

export function getRelations(char: string): CharRelations | undefined {
  if (!charMap) return undefined;
  const rel = computeRelations(char);
  if (rel.differentiations.length === 0 && rel.phoneticFamily.length === 0 && rel.semanticFamily.length === 0) {
    const trad = simpToTrad?.get(char);
    if (trad && charMap.has(trad)) return computeRelations(trad);
  }
  return rel;
}

export function getRelationsVersion(): number {
  return relationsReady ? 1 : 0;
}

// Legacy alias — stroke data is now async, use getStrokeData() instead
export async function loadStrokeData(): Promise<void> {
  // No-op: strokes are now fetched on-demand from CDN
  return Promise.resolve();
}
