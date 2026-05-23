/**
 * Phonetic three-color rating system for 形声字 (pictophonetic characters).
 *
 * Compares the phonetic component's pronunciation with the full character's
 * pronunciation to determine how reliable the phonetic hint is today.
 *
 * Rules:
 * - GREEN  (准确): Same initial AND same final — tone may differ (芳fāng/方fāng)
 * - YELLOW (近似): Either initial OR final matches (one is close) (轩xuān/干gān)
 * - RED    (失效): Neither initial nor final matches — ancient sound change (汤tāng/昜yáng)
 */

export type PhoneticRating = 'green' | 'yellow' | 'red';

export interface PhoneticRatingResult {
  rating: PhoneticRating;
  charPinyin: string;
  phoneticPinyin: string;
  charInitial: string;
  charFinal: string;
  phoneticInitial: string;
  phoneticFinal: string;
  label: string;
  tooltip: string;
}

// All possible pinyin initials (声母), including zero-initial
const PINYIN_INITIALS = [
  'zh', 'ch', 'sh', // must come before z, c, s
  'b', 'p', 'm', 'f',
  'd', 't', 'n', 'l',
  'g', 'k', 'h',
  'j', 'q', 'x',
  'z', 'c', 's',
  'r', 'y', 'w',
];

function parsePinyin(pinyin: string): { initial: string; final: string } {
  if (!pinyin) return { initial: '', final: '' };

  // Remove tone digit if present (e.g., "fang1" → "fang")
  let raw = pinyin.replace(/[0-9]/g, '').toLowerCase().trim();
  if (!raw) return { initial: '', final: '' };

  // Remove tone diacritics — map accented vowels to plain
  const accentMap: Record<string, string> = {
    'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
    'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
    'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
    'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
    'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
    'ǖ': 'v', 'ǘ': 'v', 'ǚ': 'v', 'ǜ': 'v',
    'ü': 'v',
  };
  raw = raw.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/g, (c) => accentMap[c] || c);

  // Try to match an initial
  for (const init of PINYIN_INITIALS) {
    if (raw.startsWith(init)) {
      return { initial: init, final: raw.slice(init.length) };
    }
  }

  // Zero initial
  return { initial: '', final: raw };
}

/**
 * Compute the phonetic reliability rating between a character and its phonetic component.
 */
export function ratePhonetic(
  charPinyinRaw: string | undefined,
  phoneticPinyinRaw: string | undefined,
): PhoneticRatingResult | null {
  if (!charPinyinRaw || !phoneticPinyinRaw) return null;

  const charParsed = parsePinyin(charPinyinRaw);
  const phonParsed = parsePinyin(phoneticPinyinRaw);

  if (!charParsed.final && !phonParsed.final) return null;

  const sameInitial = charParsed.initial === phonParsed.initial;
  const sameFinal = charParsed.final === phonParsed.final;

  let rating: PhoneticRating;
  if (sameInitial && sameFinal) {
    rating = 'green';
  } else if (sameInitial || sameFinal) {
    rating = 'yellow';
  } else {
    rating = 'red';
  }

  const label =
    rating === 'green' ? '准确' :
    rating === 'yellow' ? '近似' : '失效';

  const tooltip =
    rating === 'green'
      ? `声韵一致：${charPinyinRaw} ↔ ${phoneticPinyinRaw}（声母"${charParsed.initial || '(零)'}"、韵母"${charParsed.final}"相同，声调可能不同，可直接参考声旁读音）`
    : rating === 'yellow'
      ? `声韵部分匹配：${charPinyinRaw} ↔ ${phoneticPinyinRaw}（${sameInitial ? `声母"${charParsed.initial}"相同但韵母不同` : `韵母"${charParsed.final}"相同但声母不同`}，仅可部分参考声旁读音）`
      : `古今音变：${charPinyinRaw} ↔ ${phoneticPinyinRaw}（声韵均不匹配，该声旁古今读音差异极大，不具备现代参考读音价值，请勿凭偏旁猜读）`;

  return {
    rating,
    charPinyin: charPinyinRaw,
    phoneticPinyin: phoneticPinyinRaw,
    charInitial: charParsed.initial,
    charFinal: charParsed.final,
    phoneticInitial: phonParsed.initial,
    phoneticFinal: phonParsed.final,
    label,
    tooltip,
  };
}

/** Color hex values for each rating level */
export const PHONETIC_COLORS: Record<PhoneticRating, { bg: string; text: string; border: string }> = {
  green:  { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7' },
  yellow: { bg: '#FFF8E1', text: '#F57F17', border: '#FFE082' },
  red:    { bg: '#FFEBEE', text: '#C62828', border: '#EF9A9A' },
};

/** Fixed warning text for red-rated (失效) characters */
export const RED_WARNING_TEXT = '该声旁古今读音差异极大，不具备现代参考读音价值，请勿凭偏旁猜读';
