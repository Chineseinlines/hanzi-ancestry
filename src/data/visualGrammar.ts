/**
 * Visual Grammar Rules Engine — 汉字视觉语法规则引擎
 *
 * Defines the spatial rules governing Chinese character component combination.
 * Based on linguistic analysis of character structure patterns across the CJK script.
 *
 * Core concept: 汉字的功能构件在空间上有明确的组合规则。
 * 哪些组合方式是"正确"的（符合汉字构形规律），
 * 哪些是"错误"的（违反空间组合规则）。
 *
 * This module serves as the foundation for:
 *   - Pseudo-character generation (假字生成)
 *   - User character builder validation (用户造字工坊)
 *   - Structural correctness checking
 */

import { getAnnotation } from './componentAnnotations';

// ── Position Types 位置类型 ───────────────────────────────────────

export type Position =
  | 'left'         // 左 — 形旁常居左 (e.g. 氵, 亻, 木)
  | 'right'        // 右 — 声旁常居右 (e.g. 可, 青, 工)
  | 'top'          // 上 — 艹, ⻊, 雨
  | 'bottom'       // 下 — 心, 皿, 灬
  | 'enclose'      // 全包围 — 囗, 門
  | 'semi-enclose' // 半包围 — 辶, 匚, 厂, 广, 疒, 尸
  | 'overlay'      // 穿插/叠加 — 一, 丨 (笔画级别的叠加)
  ;

export interface PositionInfo {
  key: Position;
  label: string;
  enLabel: string;
  description: string;
  idsMarker: string; // IDS symbol: ⿰ ⿱ ⿺ ⿵ ⿶ ⿷ ⿸ ⿹ ⿻
}

export const POSITIONS: PositionInfo[] = [
  { key: 'left',   label: '左', enLabel: 'Left',   description: '构件位于左侧', idsMarker: '⿰' },
  { key: 'right',  label: '右', enLabel: 'Right',  description: '构件位于右侧', idsMarker: '⿰' },
  { key: 'top',    label: '上', enLabel: 'Top',    description: '构件位于上方', idsMarker: '⿱' },
  { key: 'bottom', label: '下', enLabel: 'Bottom', description: '构件位于下方', idsMarker: '⿱' },
  { key: 'enclose',      label: '全包围', enLabel: 'Fully Enclose',     description: '构件全包围其他构件', idsMarker: '⿴' },
  { key: 'semi-enclose', label: '半包围', enLabel: 'Semi-Enclose',      description: '构件半包围其他构件', idsMarker: '⿺' },
  { key: 'overlay',      label: '穿插',   enLabel: 'Overlay/Intersect', description: '构件与其他构件穿插叠加', idsMarker: '⿻' },
];

// ── Component Position Rules 构件位置规则 ─────────────────────────

export interface ComponentRule {
  /** The component character (base form) */
  component: string;
  /** Allowed positions for this component */
  allowedPositions: Position[];
  /** Forbidden positions */
  forbiddenPositions: Position[];
  /** Deformed form(s) when in specific positions */
  deformations?: { position: Position; form: string }[];
  /** Must co-occur with another component (i.e. can't be standalone as a char) */
  requiresCompanion?: boolean;
  /** Component category for grouping */
  category: 'semantic-radical' | 'phonetic-frequent' | 'structural' | 'basic';
  /** Human-readable description of the rule */
  description: string;
}

/**
 * Core position rules for common Chinese character components.
 *
 * These rules are derived from linguistic analysis:
 * - Semantic radicals (形旁) overwhelmingly appear on the LEFT
 * - Phonetic components (声旁) overwhelmingly appear on the RIGHT
 * - Structural components (囗, 辶, 门) appear in enclosing positions
 * - Some components change form based on position (变形偏旁)
 */
const COMPONENT_RULES: ComponentRule[] = [
  // ── Left-side semantic radicals (形旁居左) ──
  {
    component: '人', allowedPositions: ['left', 'top', 'bottom'], forbiddenPositions: [],
    deformations: [{ position: 'left', form: '亻' }],
    category: 'semantic-radical',
    description: '人作左旁时变形为亻（单人旁）。也可居上（个）或居下。',
  },
  {
    component: '水', allowedPositions: ['left', 'bottom'], forbiddenPositions: ['right', 'top'],
    deformations: [{ position: 'left', form: '氵' }],
    category: 'semantic-radical',
    description: '水作左旁时变形为氵（三点水）。也可居下（浆）。不可居右或居上。',
  },
  {
    component: '心', allowedPositions: ['left', 'bottom'], forbiddenPositions: ['right', 'top'],
    deformations: [{ position: 'left', form: '忄' }, { position: 'bottom', form: '心' }],
    category: 'semantic-radical',
    description: '心作左旁时变形为忄（竖心旁）。也可居下（想、思）。',
  },
  {
    component: '手', allowedPositions: ['left', 'bottom'], forbiddenPositions: ['right'],
    deformations: [{ position: 'left', form: '扌' }],
    category: 'semantic-radical',
    description: '手作左旁时变形为扌（提手旁）。也可居下（掌、拳）。',
  },
  {
    component: '火', allowedPositions: ['left', 'bottom'], forbiddenPositions: [],
    deformations: [{ position: 'bottom', form: '灬' }],
    category: 'semantic-radical',
    description: '火作底旁时变形为灬（四点底）。也可居左（灶）。',
  },
  {
    component: '犬', allowedPositions: ['left', 'right'], forbiddenPositions: ['top', 'bottom'],
    deformations: [{ position: 'left', form: '犭' }],
    category: 'semantic-radical',
    description: '犬作左旁时变形为犭（反犬旁）。',
  },
  {
    component: '示', allowedPositions: ['left', 'bottom'], forbiddenPositions: ['right'],
    deformations: [{ position: 'left', form: '礻' }],
    category: 'semantic-radical',
    description: '示作左旁时变形为礻（示字旁）。与衤(衣字旁)仅一点之差。',
  },
  {
    component: '衣', allowedPositions: ['left', 'bottom', 'top'], forbiddenPositions: [],
    deformations: [{ position: 'left', form: '衤' }],
    category: 'semantic-radical',
    description: '衣作左旁时变形为衤（衣字旁）。与礻(示字旁)区分：衤两点，礻一点。',
  },
  {
    component: '食', allowedPositions: ['left', 'bottom'], forbiddenPositions: [],
    deformations: [{ position: 'left', form: '饣' }],
    category: 'semantic-radical',
    description: '食作左旁时简化为饣（食字旁）。',
  },
  {
    component: '金', allowedPositions: ['left', 'bottom'], forbiddenPositions: [],
    deformations: [{ position: 'left', form: '钅' }],
    category: 'semantic-radical',
    description: '金作左旁时简化为钅（金字旁）。',
  },
  {
    component: '言', allowedPositions: ['left', 'bottom'], forbiddenPositions: [],
    deformations: [{ position: 'left', form: '讠' }],
    category: 'semantic-radical',
    description: '言作左旁时简化为讠（言字旁）。',
  },
  {
    component: '糸', allowedPositions: ['left', 'bottom'], forbiddenPositions: [],
    deformations: [{ position: 'left', form: '纟' }],
    category: 'semantic-radical',
    description: '糸作左旁时简化为纟（绞丝旁）。',
  },
  {
    component: '刀', allowedPositions: ['right', 'bottom'], forbiddenPositions: ['left'],
    deformations: [{ position: 'right', form: '刂' }],
    category: 'semantic-radical',
    description: '刀作右旁时变形为刂（立刀旁）。',
  },
  {
    component: '阜', allowedPositions: ['left'], forbiddenPositions: ['right', 'top', 'bottom'],
    deformations: [{ position: 'left', form: '阝' }],
    category: 'semantic-radical',
    description: '阜作左旁时变形为阝（左耳旁，表地形）。右耳旁则来自邑（表城邑）。',
  },
  {
    component: '邑', allowedPositions: ['right'], forbiddenPositions: ['left', 'top', 'bottom'],
    deformations: [{ position: 'right', form: '阝' }],
    category: 'semantic-radical',
    description: '邑作右旁时变形为阝（右耳旁，表城邑）。左耳旁则来自阜（表地形）。',
  },
  {
    component: '冰', allowedPositions: ['left'], forbiddenPositions: ['right', 'top', 'bottom'],
    deformations: [{ position: 'left', form: '冫' }],
    category: 'semantic-radical',
    description: '冰作左旁时变形为冫（两点水）。与氵(三点水)区分。',
  },

  // ── Top-position radicals (部首居上) ──
  {
    component: '艸', allowedPositions: ['top'], forbiddenPositions: ['left', 'right', 'bottom'],
    deformations: [{ position: 'top', form: '艹' }],
    category: 'semantic-radical',
    description: '艸作上旁时变形为艹（草字头）。仅居上。',
  },
  {
    component: '竹', allowedPositions: ['top'], forbiddenPositions: ['left', 'right', 'bottom'],
    deformations: [{ position: 'top', form: '𥫗' }],
    category: 'semantic-radical',
    description: '竹作上旁时变形为𥫗（竹字头）。仅居上。',
  },
  {
    component: '雨', allowedPositions: ['top'], forbiddenPositions: ['bottom'],
    category: 'semantic-radical',
    description: '雨通常居上（雷、雪、雾）。也可居左但较少。',
  },

  // ── Bottom-position radicals (部首居下) ──
  {
    component: '皿', allowedPositions: ['bottom'], forbiddenPositions: ['left', 'right', 'top'],
    category: 'semantic-radical',
    description: '皿仅居下（盆、盒、盛）。',
  },

  // ── Enclosing radicals (包围部首) ──
  {
    component: '囗', allowedPositions: ['enclose'], forbiddenPositions: ['left', 'right', 'top', 'bottom'],
    category: 'structural',
    description: '囗全包围（国、围、园）。内部的构件必须小于外框。',
  },
  {
    component: '门', allowedPositions: ['enclose'], forbiddenPositions: ['left', 'right', 'top', 'bottom'],
    category: 'structural',
    description: '门全包围（问、间、闭）。内部构件居中。',
  },
  {
    component: '辵', allowedPositions: ['semi-enclose'], forbiddenPositions: ['left', 'right', 'top', 'bottom', 'enclose'],
    deformations: [{ position: 'semi-enclose', form: '辶' }],
    category: 'structural',
    description: '辵半包围时变形为辶（走之底）。左下包右上。',
  },
  {
    component: '匚', allowedPositions: ['semi-enclose'], forbiddenPositions: ['left', 'right', 'top', 'bottom', 'enclose'],
    category: 'structural',
    description: '匚左下半包围（匠、匡、匣）。',
  },
  {
    component: '厂', allowedPositions: ['semi-enclose'], forbiddenPositions: ['left', 'right', 'bottom', 'enclose'],
    category: 'structural',
    description: '厂左上包右下（历、压、厘）。',
  },
  {
    component: '广', allowedPositions: ['semi-enclose'], forbiddenPositions: ['left', 'right', 'bottom', 'enclose'],
    category: 'structural',
    description: '广左上包右下（店、府、庭）。比厂多一点。',
  },
  {
    component: '疒', allowedPositions: ['semi-enclose'], forbiddenPositions: ['left', 'right', 'bottom', 'enclose'],
    category: 'structural',
    description: '疒左上包右下（病、痛、瘦）。病字头，与疾病相关。',
  },
  {
    component: '尸', allowedPositions: ['semi-enclose'], forbiddenPositions: ['left', 'right', 'bottom', 'enclose'],
    category: 'structural',
    description: '尸左上包右下（层、居、屋）。',
  },

  // ── Common phonetic components (常作声旁) ──
  {
    component: '青', allowedPositions: ['right', 'bottom'], forbiddenPositions: ['left'],
    category: 'phonetic-frequent',
    description: '青常作声旁居右（清、请、情、晴）。少数居下（菁）。',
  },
  {
    component: '方', allowedPositions: ['right', 'bottom'], forbiddenPositions: ['top'],
    category: 'phonetic-frequent',
    description: '方常作声旁居右（放、房、访）。少数居下（芳）。',
  },
  {
    component: '工', allowedPositions: ['right', 'bottom'], forbiddenPositions: ['top'],
    category: 'phonetic-frequent',
    description: '工常作声旁居右（红、虹、江）。也可居下（功、攻）。',
  },
  {
    component: '可', allowedPositions: ['right'], forbiddenPositions: ['left', 'top', 'bottom'],
    category: 'phonetic-frequent',
    description: '可仅作声旁居右（河、何、柯）。',
  },
  {
    component: '古', allowedPositions: ['right', 'bottom'], forbiddenPositions: ['left'],
    category: 'phonetic-frequent',
    description: '古常作声旁居右（故、姑、估）。',
  },
  {
    component: '巴', allowedPositions: ['right', 'bottom'], forbiddenPositions: ['top'],
    category: 'phonetic-frequent',
    description: '巴常作声旁居右（把、吧、爸）。',
  },
  {
    component: '马', allowedPositions: ['right', 'left', 'bottom'], forbiddenPositions: [],
    category: 'phonetic-frequent',
    description: '马可作声旁居右（妈、吗、码），也可作形旁居左（骑、驾）。',
  },
];

// ── Structural Conflict Rules ────────────────────────────────────

export interface ConflictRule {
  description: string;
  /** Check function: returns true if this combination is INVALID */
  check: (components: string[], positions: Position[]) => boolean;
  message: string;
}

/**
 * Structural conflicts — combinations that are invalid.
 */
const CONFLICT_RULES: ConflictRule[] = [
  {
    description: '两个全包围构件不能共存',
    check: (comps) => {
      const enclosers = comps.filter(c => {
        const rule = COMPONENT_RULES.find(r => r.component === c);
        return rule?.allowedPositions.length === 1 && rule.allowedPositions[0] === 'enclose';
      });
      return enclosers.length >= 2;
    },
    message: '两个全包围部首（如囗+门）无法同时存在于一个字中',
  },
  {
    description: '同一构件不能同时占据左右位置',
    check: (comps, positions) => {
      const seen = new Set<string>();
      for (let i = 0; i < comps.length; i++) {
        const key = `${comps[i]}-${positions[i]}`;
        if (seen.has(key)) return true;
        seen.add(key);
      }
      return false;
    },
    message: '同一构件在同一位置重复出现',
  },
  {
    description: '变形偏旁不能独立存在（需要伴生构件）',
    check: (comps) => {
      return comps.some(c => {
        const rule = COMPONENT_RULES.find(r =>
          r.deformations?.some(d => d.form === c)
        );
        return rule?.requiresCompanion && comps.length === 1;
      });
    },
    message: '变形偏旁（如亻、氵、扌）必须与其他构件组合，不能独立成字',
  },
  {
    description: '左右结构的字中，两个构件不能都是形旁（需要声旁或至少一个中性构件）',
    check: (comps, positions) => {
      if (positions.length !== 2) return false;
      if (!(positions.includes('left') && positions.includes('right'))) return false;
      const allSemantic = comps.every(c => {
        const rule = COMPONENT_RULES.find(r => r.component === c || r.deformations?.some(d => d.form === c));
        return rule?.category === 'semantic-radical';
      });
      return allSemantic;
    },
    message: '两个形旁直接组合通常不能构成形声字（除非是特殊的会意组合）',
  },
];

// ── Character Structure Templates 结构模板 ────────────────────────

export type StructureTemplate =
  | 'left-right'      // ⿰ 左右结构
  | 'top-bottom'      // ⿱ 上下结构
  | 'left-mid-right'  // 左中右结构
  | 'top-mid-bottom'  // 上中下结构
  | 'full-enclose'    // ⿴ 全包围
  | 'semi-enclose-tl' // ⿸ 左上包围
  | 'semi-enclose-bl' // ⿺ 左下包围
  | 'semi-enclose-tr' // 右上包围
  | 'semi-enclose-l'  // ⿷ 左包围
  | 'semi-enclose-b'  // ⿵ 下包围
  | 'semi-enclose-t'  // ⿶ 上包围 (rare)
  | 'overlay'         // ⿻ 穿插
  | 'pin'             // 品字结构 (三个相同构件)
  ;

export interface StructureTemplateInfo {
  key: StructureTemplate;
  label: string;
  enLabel: string;
  idsMarker: string;
  componentCount: number; // typical number of components
  example: string;
  description: string;
}

export const STRUCTURE_TEMPLATES: StructureTemplateInfo[] = [
  { key: 'left-right', label: '左右结构', enLabel: 'Left-Right', idsMarker: '⿰',
    componentCount: 2, example: '明 = 日 + 月', description: '最常见的结构，形旁居左、声旁居右。' },
  { key: 'top-bottom', label: '上下结构', enLabel: 'Top-Bottom', idsMarker: '⿱',
    componentCount: 2, example: '音 = 立 + 日', description: '构件上下排列。' },
  { key: 'left-mid-right', label: '左中右结构', enLabel: 'Left-Mid-Right',
    idsMarker: '⿲', componentCount: 3, example: '班 = 王 + 刂 + 王', description: '三个构件水平排列。' },
  { key: 'top-mid-bottom', label: '上中下结构', enLabel: 'Top-Mid-Bottom',
    idsMarker: '⿳', componentCount: 3, example: '草 = 艹 + 日 + 十', description: '三个构件垂直排列。' },
  { key: 'full-enclose', label: '全包围', enLabel: 'Full Enclose', idsMarker: '⿴',
    componentCount: 2, example: '国 = 囗 + 玉', description: '外部构件全包围内部构件。' },
  { key: 'semi-enclose-tl', label: '左上包围', enLabel: 'Top-Left Wrap', idsMarker: '⿸',
    componentCount: 2, example: '病 = 疒 + 丙', description: '左上方构件包住右下。' },
  { key: 'semi-enclose-bl', label: '左下包围', enLabel: 'Bottom-Left Wrap', idsMarker: '⿺',
    componentCount: 2, example: '过 = 辶 + 寸', description: '左下方构件托住右上。' },
  { key: 'pin', label: '品字结构', enLabel: 'Triple Stack', idsMarker: '品',
    componentCount: 3, example: '品 = 口 + 口 + 口', description: '三个相同构件呈品字形排列。' },
  { key: 'overlay', label: '穿插结构', enLabel: 'Overlay', idsMarker: '⿻',
    componentCount: 2, example: '中 = 口 + 丨', description: '构件相互穿插叠加。' },
];

// ── Validation Engine 验证引擎 ──────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  /** Suggested structure template */
  suggestedTemplate?: StructureTemplate;
  /** Deformed forms for the given position arrangement */
  deformations: { component: string; position: Position; deformedForm: string }[];
}

/**
 * Validate a proposed character composition.
 *
 * @param components - Array of base component characters
 * @param positions  - Array of positions (must match components length)
 * @returns ValidationResult with errors/warnings/deformations
 */
export function validateComposition(
  components: string[],
  positions: Position[],
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const deformations: { component: string; position: Position; deformedForm: string }[] = [];

  if (components.length !== positions.length) {
    errors.push('构件数量与位置数量不匹配');
    return { valid: false, errors, warnings, deformations };
  }

  if (components.length === 0) {
    errors.push('至少需要一个构件');
    return { valid: false, errors, warnings, deformations };
  }

  if (components.length > 4) {
    errors.push('超过4个构件的组合极为罕见，请检查是否过度拆分');
  }

  // Check each component's position rules
  for (let i = 0; i < components.length; i++) {
    const comp = components[i];
    const pos = positions[i];

    // Find matching rule (check both base form and deformed forms)
    const rule = COMPONENT_RULES.find(r =>
      r.component === comp ||
      r.deformations?.some(d => d.form === comp)
    );

    if (rule) {
      // Check if this position is allowed
      if (rule.forbiddenPositions.includes(pos)) {
        errors.push(
          `"${comp}"不能出现在${POSITIONS.find(p => p.key === pos)?.label}侧。${rule.description}`
        );
      } else if (!rule.allowedPositions.includes(pos)) {
        // Not explicitly forbidden, but also not in the allowed list
        // Deformed forms have stricter position constraints
        if (rule.deformations?.some(d => d.form === comp)) {
          const defInfo = rule.deformations.find(d => d.form === comp)!;
          if (defInfo.position !== pos) {
            errors.push(
              `"${comp}"是"${rule.component}"在${POSITIONS.find(p => p.key === defInfo.position)?.label}侧的变形，不能用于${POSITIONS.find(p => p.key === pos)?.label}侧。`
            );
          }
        }
      }

      // Generate deformation if needed
      if (rule.deformations) {
        const def = rule.deformations.find(d => d.position === pos);
        if (def) {
          deformations.push({ component: comp, position: pos, deformedForm: def.form });
        }
      }
    }
  }

  // Check structural conflicts
  for (const conflict of CONFLICT_RULES) {
    if (conflict.check(components, positions)) {
      errors.push(conflict.message);
    }
  }

  // Suggest structure template
  let suggestedTemplate: StructureTemplate | undefined;
  if (positions.length === 2) {
    if (positions.includes('left') && positions.includes('right')) {
      suggestedTemplate = 'left-right';
    } else if (positions.includes('top') && positions.includes('bottom')) {
      suggestedTemplate = 'top-bottom';
    } else if (positions.includes('enclose')) {
      suggestedTemplate = 'full-enclose';
    } else if (positions.includes('semi-enclose')) {
      suggestedTemplate = positions[0] === 'semi-enclose' ? 'semi-enclose-bl' : 'semi-enclose-tl';
    } else if (positions.includes('overlay')) {
      suggestedTemplate = 'overlay';
    }
  } else if (positions.length === 3) {
    const allSame = new Set(components).size === 1;
    if (allSame) {
      suggestedTemplate = 'pin';
    } else if (positions.every(p => ['left', 'right'].includes(p))) {
      suggestedTemplate = 'left-mid-right';
    } else if (positions.every(p => ['top', 'bottom'].includes(p))) {
      suggestedTemplate = 'top-mid-bottom';
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestedTemplate,
    deformations,
  };
}

/**
 * Get position rules for a specific component.
 */
export function getComponentRules(component: string): ComponentRule | undefined {
  return COMPONENT_RULES.find(r =>
    r.component === component ||
    r.deformations?.some(d => d.form === component)
  );
}

/**
 * Get all known component rules (for UI display / reference).
 */
export function getAllComponentRules(): ComponentRule[] {
  return [...COMPONENT_RULES];
}

/**
 * Check if a proposed position arrangement matches a known structure template.
 */
export function identifyTemplate(positions: Position[]): StructureTemplateInfo | undefined {
  if (positions.length === 2) {
    if (positions.includes('left') && positions.includes('right')) return STRUCTURE_TEMPLATES[0];
    if (positions.includes('top') && positions.includes('bottom')) return STRUCTURE_TEMPLATES[1];
    if (positions.includes('enclose')) return STRUCTURE_TEMPLATES[4];
    if (positions.includes('semi-enclose') && positions.includes('top')) return STRUCTURE_TEMPLATES[6];
    if (positions.includes('semi-enclose')) return STRUCTURE_TEMPLATES[6];
    if (positions.includes('overlay')) return STRUCTURE_TEMPLATES[9];
  }
  if (positions.length === 3) {
    if (positions.every(p => p === 'left' || p === 'right')) return STRUCTURE_TEMPLATES[2];
    if (positions.every(p => p === 'top' || p === 'bottom')) return STRUCTURE_TEMPLATES[3];
  }
  return undefined;
}

/**
 * Determine if a component is actually a deformed form of another component,
 * and return the base form. Uses componentAnnotations for lookup.
 */
export function resolveBaseForm(component: string): string {
  const annotation = getAnnotation(component);
  if (annotation) return annotation.original;
  // Check visual grammar rules too
  const rule = COMPONENT_RULES.find(r =>
    r.deformations?.some(d => d.form === component)
  );
  if (rule) return rule.component;
  return component;
}
