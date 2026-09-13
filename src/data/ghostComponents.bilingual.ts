/**
 * ghostComponents.ts 的双语伴生数据：英文版警示与 15 个幽灵部件说明。
 */

import { getGhostAnnotation } from './ghostComponents';

const GHOST_WARNING_EN =
  'This stroke/component is a simplification artifact with no etymological meaning — it cannot be analyzed by decomposition. Learn the glyph as a whole.';

const DESCRIPTIONS_EN: Record<string, string> = {
  买: 'The top stroke "乛" is a cursive-simplification artifact',
  尽: 'The upper part merges two simplified forms and is not an independent component',
  专: 'The whole glyph is a cursive simplification and cannot be broken down by components',
  长: 'A cursive simplification, not a traditional compound structure',
  书: 'A cursive simplification; the top part is not an independent component',
  为: 'A cursive simplification; it cannot be decomposed for analysis',
  东: 'A cursive simplification with no etymological logic to trace',
  乐: 'A simplified form that cannot be decomposed by components',
  头: 'A simplified form; the left part is not an independent character',
  发: 'A merged simplification of two traditional characters; the upper form has no independent meaning',
  后: 'A merged simplification (後 → 后); originally two independent characters',
  里: 'A merged simplification (裏/裡 → 里); originally two independent characters',
  农: 'A cursive simplification; it cannot be analyzed by traditional components',
  龙: 'A cursive simplification, not the traditional pictographic structure',
  万: 'A sound-borrowing simplification with no glyph relation to traditional 萬',
};

/** 通用警示（当前语言）。 */
export function getLocalizedGhostWarning(lang: 'zh' | 'en'): string {
  if (lang === 'zh') {
    return '该笔画/部件为简体简化衍生形态，无造字意义，无需拆分理解，建议整体记忆字形';
  }
  return GHOST_WARNING_EN;
}

/** 单字幽灵部件提示（当前语言）。fallback：中文说明。 */
export function getLocalizedGhostSuggestion(char: string, lang: 'zh' | 'en'): string | null {
  const entry = getGhostAnnotation(char);
  if (!entry) return null;
  if (lang === 'zh') {
    return `${entry.ghostDescription}（繁体：${entry.traditionalForm}）。建议整体记忆字形。`;
  }
  const enDesc = DESCRIPTIONS_EN[char] ?? entry.ghostDescription;
  return `${enDesc} (traditional form: ${entry.traditionalForm}). Learn the glyph as a whole.`;
}
