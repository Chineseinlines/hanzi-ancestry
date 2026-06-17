/**
 * 形声字语义关系 8 级标注体系
 *
 * Based on expert feedback: systematic classification of how a
 * pictophonetic character's meaning relates to its semantic component (意符/形旁).
 *
 * Reference levels as specified:
 *   1. 同义 Identical        — 汉字与表意构件意义完全相同 (e.g. 树 vs 木)
 *   2. 种属 Taxonomic        — 汉字所表事物属于意旁种类 (e.g. 鸥 is a 鸟)
 *   3. 直接相关 Direct       — 汉字意义与表意构件直接相关 (e.g. 河 vs 水)
 *   4. 间接相关 Indirect     — 汉字意义与表意构件间接相关 (e.g. 炒 vs 火)
 *   5. 引申直接 Extended Direct   — 引申义与意符直接相关 (e.g. 请: visit→invite, 言)
 *   6. 引申间接 Extended Indirect — 引申义与意符间接相关 (e.g. 距: spur→distance, 足)
 *   7. 不相关 Unrelated      — 汉字意义与表意构件不相关 (e.g. 软 vs 车)
 *   8. 难定义 Undefinable    — 简化字或其他原因难以定义 (e.g. 丛)
 */

export type SemanticLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface SemanticRelation {
  level: SemanticLevel;
  label: string;
  enLabel: string;
  shortLabel: string;
  description: string;
  example: string;
  color: string;
}

export const SEMANTIC_LEVELS: SemanticRelation[] = [
  {
    level: 1, label: '同义', enLabel: 'Identical', shortLabel: '同义',
    description: '汉字与表意构件意义完全相同',
    example: '"树"与意旁"木"都指树木',
    color: '#1B5E20',
  },
  {
    level: 2, label: '种属', enLabel: 'Taxonomic', shortLabel: '种属',
    description: '汉字所表事物属于意旁所表事物的种类',
    example: '"鸥"是一种"鸟"',
    color: '#2E7D32',
  },
  {
    level: 3, label: '直接相关', enLabel: 'Directly Related', shortLabel: '直接',
    description: '汉字意义与表意构件意义直接相关',
    example: '"河"与意旁"氵(水)"直接相关',
    color: '#558B2F',
  },
  {
    level: 4, label: '间接相关', enLabel: 'Indirectly Related', shortLabel: '间接',
    description: '汉字意义与表意构件意义间接相关',
    example: '"炒"与意旁"火"有联系',
    color: '#F57F17',
  },
  {
    level: 5, label: '引申直接相关', enLabel: 'Extended Direct', shortLabel: '引申直',
    description: '汉字引申义与表意构件意义直接相关',
    example: '"请"(拜访→邀请)与部首"言"',
    color: '#E65100',
  },
  {
    level: 6, label: '引申间接相关', enLabel: 'Extended Indirect', shortLabel: '引申间',
    description: '汉字引申义与表意构件意义间接相关',
    example: '"距"(鸡趾→距离)与部首"足"',
    color: '#BF360C',
  },
  {
    level: 7, label: '不相关', enLabel: 'Unrelated', shortLabel: '无关',
    description: '汉字意义与表意构件意义不相关',
    example: '"软"与部首"车"无关系',
    color: '#78909C',
  },
  {
    level: 8, label: '难定义', enLabel: 'Undefinable', shortLabel: '难定',
    description: '由于简化字或其他原因难以定义表意构件关系',
    example: '"丛"的简化构件关系不透明',
    color: '#B0BEC5',
  },
];

/**
 * Manually curated semantic relation levels for common 形声字.
 * Key: character → { level, semantic component, explanation }
 * This is a seed dataset — should be expanded over time.
 */
const CURATED_SEMANTIC: Record<string, { level: SemanticLevel; semantic: string; note: string }> = {
  // Level 1: 同义
  '树': { level: 1, semantic: '木', note: '树与木同指树木' },
  '船': { level: 1, semantic: '舟', note: '船与舟同指水上交通工具' },
  '爸': { level: 1, semantic: '父', note: '爸与父同指父亲' },

  // Level 2: 种属
  '鸥': { level: 2, semantic: '鸟', note: '鸥是鸟的一种' },
  '鲤': { level: 2, semantic: '鱼', note: '鲤是鱼的一种' },
  '松': { level: 2, semantic: '木', note: '松是树的一种' },
  '铜': { level: 2, semantic: '金', note: '铜是金属的一种' },
  '虹': { level: 2, semantic: '虫', note: '古人认为虹是虫类' },

  // Level 3: 直接相关
  '河': { level: 3, semantic: '水', note: '河与水直接相关' },
  '洗': { level: 3, semantic: '水', note: '洗需要水' },
  '打': { level: 3, semantic: '手', note: '打需要用手' },
  '跑': { level: 3, semantic: '足', note: '跑与足直接相关' },
  '说': { level: 3, semantic: '言', note: '说与言语直接相关' },
  '饿': { level: 3, semantic: '食', note: '饿与食物直接相关' },

  // Level 4: 间接相关
  '炒': { level: 4, semantic: '火', note: '炒需要用火，间接关联' },
  '冷': { level: 4, semantic: '冰', note: '冷与冰间接相关' },
  '快': { level: 4, semantic: '心', note: '快(乐)与心情间接相关' },

  // Level 5: 引申直接相关
  '请': { level: 5, semantic: '言', note: '原义拜访→引申邀请，与言直接相关' },

  // Level 6: 引申间接相关
  '距': { level: 6, semantic: '足', note: '原义鸡趾→引申距离，与足间接相关' },

  // Level 7: 不相关
  '软': { level: 7, semantic: '车', note: '软与车无意义关联' },

  // Level 8: 难定义
  '丛': { level: 8, semantic: '一', note: '简化构件关系不透明' },
};

/**
 * Get the curated semantic relation level for a character.
 * Returns null if no curated data exists — caller should fall back to heuristics.
 */
export function getCuratedSemanticLevel(char: string): { level: SemanticLevel; semantic: string; note: string } | null {
  return CURATED_SEMANTIC[char] ?? null;
}

/**
 * Heuristic semantic level detection based on definition overlap.
 * This is a fallback when no curated data exists.
 */
export function guessSemanticLevel(
  charDefinition: string,
  semanticComponentDefinition: string,
): SemanticLevel {
  if (!charDefinition || !semanticComponentDefinition) return 8;

  const charLower = charDefinition.toLowerCase();
  const semLower = semanticComponentDefinition.toLowerCase();

  // Check for identical or near-identical definitions
  if (charLower === semLower) return 1;

  // Extract key content words from definitions
  const charWords = new Set(charLower.split(/\s+|[,;、，；]/).filter(w => w.length > 1));
  const semWords = new Set(semLower.split(/\s+|[,;、，；]/).filter(w => w.length > 1));

  // Count overlapping words
  let overlap = 0;
  for (const w of charWords) {
    if (semWords.has(w)) overlap++;
    else {
      // Partial match — one contains the other
      for (const sw of semWords) {
        if (w.includes(sw) || sw.includes(w)) { overlap += 0.5; break; }
      }
    }
  }

  if (overlap >= 2) return 3;   // Directly related — significant word overlap
  if (overlap >= 1) return 4;   // Indirectly related — some overlap
  return 7; // Default: unrelated (conservative)
}

/**
 * Get human-readable semantic relation info for display.
 */
export function getSemanticLevelInfo(level: SemanticLevel): SemanticRelation {
  return SEMANTIC_LEVELS[level - 1];
}
