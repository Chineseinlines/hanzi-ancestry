import { getAllCharacters } from './hanziData';
import type { StructureTemplate } from './visualGrammar';

/** Structure template → IDS operator */
const TEMPLATE_MARKER: Record<StructureTemplate, string> = {
  'left-right': '⿰',
  'top-bottom': '⿱',
  'left-mid-right': '⿲',
  'top-mid-bottom': '⿳',
  'full-enclose': '⿴',
  'semi-enclose-tl': '⿸',
  'semi-enclose-bl': '⿺',
  'semi-enclose-tr': '⿹',
  'semi-enclose-l': '⿷',
  'semi-enclose-b': '⿵',
  'semi-enclose-t': '⿶',
  overlay: '⿻',
  pin: '品',
};

/**
 * Build an IDS (Ideographic Description Sequence) string for a composition.
 * Pin structure (品字形) is expressed as ⿱ + ⿰, matching conventional IDS.
 */
export function buildIds(template: StructureTemplate, parts: string[]): string {
  if (template === 'pin' && parts.length >= 3) {
    return `⿱${parts[0]}⿰${parts[1]}${parts[2]}`;
  }
  return TEMPLATE_MARKER[template] + parts.join('');
}

let idsMap: Map<string, string> | null = null;

/** IDS → real character, built once from the loaded dictionary. */
function getExistingIdsMap(): Map<string, string> {
  if (idsMap) return idsMap;
  idsMap = new Map();
  for (const entry of getAllCharacters()) {
    const ids = entry.decomposition;
    if (ids && !idsMap.has(ids)) idsMap.set(ids, entry.character);
  }
  return idsMap;
}

/**
 * Return the real character matching an IDS, if the dictionary contains one.
 * Used to keep pseudo-characters (假字) genuinely non-existent.
 */
export function findRealCharacter(ids: string): string | undefined {
  return getExistingIdsMap().get(ids);
}

export function isRealComposition(ids: string): boolean {
  return getExistingIdsMap().has(ids);
}