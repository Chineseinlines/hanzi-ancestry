/**
 * Ghost component standardization for simplified Chinese characters.
 *
 * "Ghost components" (简体幽灵部件) are笔画 fragments produced by
 * simplification that carry no semantic or phonetic meaning. They exist
 * only as simplified writing forms and should NOT be decomposed or
 * analyzed for etymological meaning.
 *
 * For characters containing these fragments, we:
 * 1. Gray out the meaningless component in decomposition views
 * 2. Show a fixed tooltip: "该笔画为简体简化衍生形态，无造字意义，无需拆分理解，建议整体记忆字形"
 */

export interface GhostComponentAnnotation {
  /** The character containing ghost components */
  character: string;
  /** Which part of the decomposition is a ghost (the simplified fragment) */
  ghostDescription: string;
  /** The original traditional form(s) this simplified from */
  traditionalForm: string;
}

const GHOST_WARNING =
  '该笔画/部件为简体简化衍生形态，无造字意义，无需拆分理解，建议整体记忆字形';

/**
 * Characters with known ghost components from simplification.
 * Each entry describes the meaningless simplified fragment.
 */
const GHOST_COMPONENTS: Record<string, GhostComponentAnnotation> = {
  '买': {
    character: '买',
    ghostDescription: '顶部"乛"为简体草书楷化衍生笔画',
    traditionalForm: '買',
  },
  '尽': {
    character: '尽',
    ghostDescription: '上部为两简化字形合并，非独立部件',
    traditionalForm: '盡 / 儘',
  },
  '专': {
    character: '专',
    ghostDescription: '整体为草书简化形态，无法按部件拆分',
    traditionalForm: '專',
  },
  '长': {
    character: '长',
    ghostDescription: '整体为草书楷化简化，非传统会意结构',
    traditionalForm: '長',
  },
  '书': {
    character: '书',
    ghostDescription: '整体为草书简化，顶部非独立部件',
    traditionalForm: '書',
  },
  '为': {
    character: '为',
    ghostDescription: '整体为草书简化，不可拆解分析',
    traditionalForm: '爲 / 為',
  },
  '东': {
    character: '东',
    ghostDescription: '整体为草书简化形态，无造字逻辑可循',
    traditionalForm: '東',
  },
  '乐': {
    character: '乐',
    ghostDescription: '整体简化形态，不可按部件拆解',
    traditionalForm: '樂',
  },
  '头': {
    character: '头',
    ghostDescription: '整体简化形态，左部非独立字',
    traditionalForm: '頭',
  },
  '发': {
    character: '发',
    ghostDescription: '一简多繁合并字，上部形态无独立意义',
    traditionalForm: '發 / 髮',
  },
  '后': {
    character: '后',
    ghostDescription: '一简多繁合并字（後→后），原为两独立字',
    traditionalForm: '後（合并于原有"后"字）',
  },
  '里': {
    character: '里',
    ghostDescription: '一简多繁合并字（裏→里），原为两独立字',
    traditionalForm: '裏 / 裡（合并于原有"里"字）',
  },
  '农': {
    character: '农',
    ghostDescription: '整体为草书简化，不可按传统部件分析',
    traditionalForm: '農',
  },
  '龙': {
    character: '龙',
    ghostDescription: '整体为草书简化，非传统象形结构',
    traditionalForm: '龍',
  },
  '万': {
    character: '万',
    ghostDescription: '借音简化，与繁体"萬"无字形关联',
    traditionalForm: '萬',
  },
};

export function isGhostCharacter(char: string): boolean {
  return char in GHOST_COMPONENTS;
}

export function getGhostAnnotation(char: string): GhostComponentAnnotation | null {
  return GHOST_COMPONENTS[char] ?? null;
}

export function getGhostWarning(): string {
  return GHOST_WARNING;
}

/**
 * For a character like 买 — check if its decomposition contains
 * ghost-like fragments (non-CJK chars in IDS that are simplification artifacts).
 */
export function getGhostSuggestion(char: string): string | null {
  const entry = GHOST_COMPONENTS[char];
  if (!entry) return null;
  return `${entry.ghostDescription}（繁体：${entry.traditionalForm}）。建议整体记忆字形。`;
}
