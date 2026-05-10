import type { HanziEntry, DecompositionNode, CognateResult, ComponentCognateResult, StrokeData, CulturalData } from './types';

// ── In-memory data store ────────────────────────────────────────────
let charMap: Map<string, HanziEntry> | null = null;
let reverseIndex: Map<string, string[]> | null = null;
let dataLoadPromise: Promise<void> | null = null;

// Stroke & cultural data
let culturalMap: Map<string, CulturalData> | null = null;
let culturalPromise: Promise<void> | null = null;

// CDN stroke cache
const strokeCache = new Map<string, StrokeData>();
const strokePending = new Map<string, Promise<StrokeData | undefined>>();

const STROKE_CDN = 'https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0';

// Stroke blacklist — pure strokes that shouldn't be treated as components
const STROKE_BLACKLIST = new Set(['一','丨','丿','丶','乙','亅','乀']);

/**
 * Load character dictionary from Make Me a Hanzi data.
 */
export async function loadData(): Promise<void> {
  if (charMap && reverseIndex) return;
  if (dataLoadPromise) return dataLoadPromise;

  dataLoadPromise = (async () => {
    try {
      const [dictRes, indexRes] = await Promise.all([
        fetch('/hanzi-dict.json'),
        fetch('/hanzi-index.json'),
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
    } catch (err) {
      console.error('Failed to load hanzi data:', err);
      charMap = new Map();
      reverseIndex = new Map();
    }
  })();

  return dataLoadPromise;
}

export function getCharacter(char: string): HanziEntry | undefined {
  return charMap?.get(char);
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
    const score = entry.etymology?.phonetic === component || entry.etymology?.semantic === component ? 10 : 1;
    results.push({ character: c, definition: entry.definition, pinyin: entry.pinyin[0] || '', score });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, maxResults);
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
    .sort((a, b) => b[1].score - a[1].score);

  const results: CognateResult[] = [];
  for (const [c, data] of filtered.slice(0, maxResults)) {
    const cEntry = charMap!.get(c)!;
    results.push({
      character: c,
      definition: cEntry.definition,
      pinyin: cEntry.pinyin[0] || '',
      sharedComponents: Array.from(data.shared),
      score: data.score,
    });
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
      const res = await fetch('/cultural.json');
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

// Legacy alias — stroke data is now async, use getStrokeData() instead
export async function loadStrokeData(): Promise<void> {
  // No-op: strokes are now fetched on-demand from CDN
  return Promise.resolve();
}
