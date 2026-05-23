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

// Character relations
let relationsMap: Map<string, CharRelations> | null = null;
let relationsPromise: Promise<void> | null = null;
let relationsVersion = 0;

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
    } catch (err) {
      console.error('Failed to load hanzi data:', err);
      charMap = new Map();
      reverseIndex = new Map();
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

// ── Character relations ───────────────────────────────────────────────

export async function loadRelations(): Promise<void> {
  if (relationsMap) return;
  if (relationsPromise) return relationsPromise;

  relationsPromise = (async () => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}char-relations.json`);
      if (!res.ok) throw new Error(`char-relations.json: ${res.status}`);
      const data = await res.json() as Record<string, CharRelations>;
      relationsMap = new Map(Object.entries(data));
      relationsVersion++;
    } catch (err) {
      console.error('Failed to load char relations:', err);
      relationsMap = new Map();
      relationsVersion++;
    }
  })();
  return relationsPromise;
}

export function getRelationsVersion(): number {
  return relationsVersion;
}

export function getRelations(char: string): CharRelations | undefined {
  const rel = relationsMap?.get(char);
  if (rel) return rel;
  // Fall back to traditional form
  const trad = simpToTrad?.get(char);
  if (trad) return relationsMap?.get(trad);
  return undefined;
}

export function hasRelations(char: string): boolean {
  return relationsMap?.has(char) ?? false;
}

/** Get all characters that are directly related to this char, grouped by type. */
export function getRelatedChars(char: string): {
  differentiations: string[];
  phoneticFamily: string[];
  semanticFamily: string[];
  containedIn: string[];
  homophones: string[];
  antonyms: string[];
} {
  const rel = getRelations(char);
  if (!rel) return { differentiations: [], phoneticFamily: [], semanticFamily: [], containedIn: [], homophones: [], antonyms: [] };
  return {
    differentiations: rel.differentiations,
    phoneticFamily: rel.phoneticFamily,
    semanticFamily: rel.semanticFamily,
    containedIn: rel.containedIn,
    homophones: rel.homophones.slice(0, 10),
    antonyms: rel.antonyms,
  };
}

// Legacy alias — stroke data is now async, use getStrokeData() instead
export async function loadStrokeData(): Promise<void> {
  // No-op: strokes are now fetched on-demand from CDN
  return Promise.resolve();
}
