/**
 * 形声字声旁可靠性 6 级标注体系
 *
 * Based on expert feedback: systematic classification of how a
 * pictophonetic character's pronunciation relates to its phonetic component (示音构件/声旁).
 *
 * Reference levels:
 *   1. 完全相同 Identical        — 汉字读音与声旁完全相同，包括声调 (e.g. 清/qīng/ ← 青/qīng/)
 *   2. 同音节异调 SameSylDiffTone — 音节相同，声调不同 (e.g. 请/qǐng/ ← 青/qīng/)
 *   3. 同韵母 SameFinal          — 韵母相同，声母不同 (e.g. 精/jīng/ ← 青/qīng/)
 *   4. 同声母 SameInitial        — 声母相同，韵母不同 (e.g. 结/jié/ ← 吉/jí/)
 *   5. 完全不同 CompletelyDiff   — 发音完全不一样 (e.g. 猜/cāi/ ← 青/qīng/)
 *   6. 多音字 MultiPron          — 汉字或声旁不止一个发音 (e.g. 朴/pò|piáo/)
 *
 * Integrates with existing phoneticRating.ts 3-color system:
 *   Level 1 → green, Level 2-3 → yellow, Level 4-6 → red
 */

export type PhoneticLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface PhoneticRelation {
  level: PhoneticLevel;
  label: string;
  enLabel: string;
  shortLabel: string;
  description: string;
  example: string;
  color: string;
  /** Mapping to the 3-color simplified rating */
  simplifiedRating: 'green' | 'yellow' | 'red';
}

export const PHONETIC_LEVELS: PhoneticRelation[] = [
  {
    level: 1, label: '完全相同', enLabel: 'Identical', shortLabel: '同音',
    description: '汉字读音与声旁完全相同，包括声调',
    example: '"清"/qīng/ ← 声旁"青"/qīng/',
    color: '#1B5E20', simplifiedRating: 'green',
  },
  {
    level: 2, label: '同音节异调', enLabel: 'Same Syllable, Diff Tone', shortLabel: '异调',
    description: '汉字发音与声旁音节相同，声调不同',
    example: '"请"/qǐng/ ← 声旁"青"/qīng/',
    color: '#2E7D32', simplifiedRating: 'green',
  },
  {
    level: 3, label: '同韵母', enLabel: 'Same Final', shortLabel: '同韵',
    description: '形声字韵母与声旁韵母相同，声母不同',
    example: '"精"/jīng/ ← 声旁"青"/qīng/',
    color: '#F57F17', simplifiedRating: 'yellow',
  },
  {
    level: 4, label: '同声母', enLabel: 'Same Initial', shortLabel: '同声',
    description: '汉字发音开头与声旁相同，末尾不同',
    example: '"结"/jié/ ← 声旁"吉"/jí/',
    color: '#E65100', simplifiedRating: 'yellow',
  },
  {
    level: 5, label: '完全不同', enLabel: 'Completely Different', shortLabel: '异音',
    description: '汉字发音与声旁完全不一样',
    example: '"猜"/cāi/ ← 声旁"青"/qīng/',
    color: '#BF360C', simplifiedRating: 'red',
  },
  {
    level: 6, label: '多音字', enLabel: 'Multiple Pronunciations', shortLabel: '多音',
    description: '汉字或声旁不止一个发音',
    example: '"朴"读/pò/或/piáo/；"度"读/dù/或/duó/',
    color: '#78909C', simplifiedRating: 'red',
  },
];

// All possible pinyin initials (声母), including zero-initial
const PINYIN_INITIALS = [
  'zh', 'ch', 'sh',
  'b', 'p', 'm', 'f',
  'd', 't', 'n', 'l',
  'g', 'k', 'h',
  'j', 'q', 'x',
  'z', 'c', 's',
  'r', 'y', 'w',
];

interface ParsedPinyin {
  initial: string;
  final: string;
  tone: number;
}

function parsePinyin(pinyin: string): ParsedPinyin | null {
  if (!pinyin) return null;

  // Remove tone diacritics
  const accentMap: Record<string, string> = {
    'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
    'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
    'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
    'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
    'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
    'ǖ': 'v', 'ǘ': 'v', 'ǚ': 'v', 'ǜ': 'v',
    'ü': 'v',
  };

  // Detect tone number (e.g., "qing1")
  const numMatch = pinyin.match(/^([a-zü]+)([1-5])$/i);
  let raw: string;
  let tone = 0; // 0 = neutral/unknown

  if (numMatch) {
    raw = numMatch[1].toLowerCase();
    tone = parseInt(numMatch[2]);
  } else {
    // Detect diacritic tone
    raw = pinyin.toLowerCase();
    let foundTone = 0;
    raw = raw.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/g, (c) => {
      if ('āēīōūǖ'.includes(c)) foundTone = 1;
      else if ('áéíóúǘ'.includes(c)) foundTone = 2;
      else if ('ǎěǐǒǔǚ'.includes(c)) foundTone = 3;
      else if ('àèìòùǜ'.includes(c)) foundTone = 4;
      return accentMap[c] || c;
    });
    tone = foundTone;
  }

  // Match initial
  for (const init of PINYIN_INITIALS) {
    if (raw.startsWith(init)) {
      return { initial: init, final: raw.slice(init.length), tone };
    }
  }

  // Zero initial
  return { initial: '', final: raw, tone };
}

/**
 * Compute the 6-level phonetic relation between a character and its phonetic component.
 */
export function computePhoneticLevel(
  charPinyin: string | undefined,
  phoneticPinyin: string | undefined,
): PhoneticLevel {
  if (!charPinyin || !phoneticPinyin) return 6;

  const charParsed = parsePinyin(charPinyin);
  const phonParsed = parsePinyin(phoneticPinyin);

  if (!charParsed || !phonParsed) return 6;

  const sameInitial = charParsed.initial === phonParsed.initial;
  const sameFinal = charParsed.final === phonParsed.final;
  const sameTone = charParsed.tone === phonParsed.tone;

  // Level 1: identical initial, final, and tone
  if (sameInitial && sameFinal && sameTone) return 1;

  // Level 2: same initial and final, different tone
  if (sameInitial && sameFinal && !sameTone) return 2;

  // Level 3: same final, different initial
  if (sameFinal && !sameInitial) return 3;

  // Level 4: same initial, different final
  if (sameInitial && !sameFinal) return 4;

  // Level 5: completely different
  return 5;
}

/**
 * Compute the phonetic level with multi-pronunciation detection.
 * Caller should pass ALL pinyin readings for both character and phonetic.
 */
export function computePhoneticLevelMulti(
  charPinyins: string[],
  phoneticPinyins: string[],
): { level: PhoneticLevel; bestMatch: string } {
  // Check for multi-pronunciation
  if (charPinyins.length > 1 || phoneticPinyins.length > 1) {
    // Try to find best match across all pronunciations
    let bestLevel: PhoneticLevel = 6;
    let bestMatch = '';

    for (const cp of charPinyins) {
      for (const pp of phoneticPinyins) {
        const level = computePhoneticLevel(cp, pp);
        if (level < bestLevel) {
          bestLevel = level;
          bestMatch = `${cp} ← ${pp}`;
        }
      }
    }

    // If there are multiple pronunciations, it's at least level 6 conceptually
    // but we show the best actual match level
    if (charPinyins.length > 1 || phoneticPinyins.length > 1) {
      return { level: Math.max(bestLevel, 6) as PhoneticLevel, bestMatch };
    }
    return { level: bestLevel, bestMatch };
  }

  const level = computePhoneticLevel(charPinyins[0], phoneticPinyins[0]);
  return { level, bestMatch: `${charPinyins[0]} ← ${phoneticPinyins[0]}` };
}

/**
 * Get human-readable phonetic relation info for display.
 */
export function getPhoneticLevelInfo(level: PhoneticLevel): PhoneticRelation {
  return PHONETIC_LEVELS[level - 1];
}

/**
 * Map 6-level to 3-color simplified rating (for backward compatibility).
 */
export function phoneticLevelToColor(level: PhoneticLevel): 'green' | 'yellow' | 'red' {
  return PHONETIC_LEVELS[level - 1].simplifiedRating;
}
