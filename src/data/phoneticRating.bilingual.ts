/**
 * phoneticRating.ts 的双语伴生数据：英文版 label/tooltip/warning。
 */

import type { PhoneticRating, PhoneticRatingResult } from './phoneticRating';

const LABELS_EN: Record<PhoneticRating, string> = {
  green: 'Reliable',
  yellow: 'Partial',
  red: 'Unreliable',
};

export const RED_WARNING_TEXT_EN =
  'The pronunciation of this phonetic component has drifted far from the character — do not guess pronunciation from it';

/** 声旁评级标签（当前语言）。 */
export function getLocalizedPhoneticLabel(rating: PhoneticRating, lang: 'zh' | 'en'): string {
  if (lang === 'zh') {
    return rating === 'green' ? '准确' : rating === 'yellow' ? '近似' : '失效';
  }
  return LABELS_EN[rating];
}

/** 声旁评级 tooltip（当前语言；en 动态构造，zh 用 ratePhonetic 的结果）。 */
export function getLocalizedPhoneticTooltip(result: PhoneticRatingResult, lang: 'zh' | 'en'): string {
  if (lang === 'zh') return result.tooltip;
  const sameInitial = result.charInitial === result.phoneticInitial;

  if (result.rating === 'green') {
    return `Same initial and final: ${result.charPinyin} ↔ ${result.phoneticPinyin} (initial "${result.charInitial || '(zero)'}" and final "${result.charFinal}" match; tone may differ — the phonetic hint is reliable)`;
  }
  if (result.rating === 'yellow') {
    return `Partial match: ${result.charPinyin} ↔ ${result.phoneticPinyin} (${
      sameInitial
        ? `initial "${result.charInitial}" matches but the final differs`
        : `final "${result.charFinal}" matches but the initial differs`
    } — only partially reliable)`;
  }
  return `Sound change over time: ${result.charPinyin} ↔ ${result.phoneticPinyin} (neither initial nor final matches — the phonetic hint is unreliable in modern pronunciation; don't guess pronunciation from the component)`;
}

/** 红色评级警示文案（当前语言）。 */
export function getLocalizedRedWarning(lang: 'zh' | 'en'): string {
  if (lang === 'zh') {
    return '该声旁古今读音差异极大，不具备现代参考读音价值，请勿凭偏旁猜读';
  }
  return RED_WARNING_TEXT_EN;
}
