/**
 * 王宁《汉字构形学》现代分类体系
 *
 * This module implements the modern Chinese character formation theory
 * by Wang Ning (王宁), complementing the traditional 六书 (Six Books) system.
 *
 * Core concepts:
 *   - 构件类型 (Component Types): 表形/表义/示音/标示/记号
 *   - 结构模式 (Structure Modes): 平面结构/层次结构
 *   - 构形模式 (Formation Modes): 11种合成模式
 *
 * Reference: 王宁《汉字构形学导论》(商务印书馆, 2015)
 */

// ── Component Types 构件类型 ──────────────────────────────────────

export type ComponentType =
  | 'form-depicting'   // 表形构件 — depicts object form (pictographic-like)
  | 'meaning-bearing'  // 表义构件 — carries semantic meaning (形旁)
  | 'sound-indicating' // 示音构件 — indicates pronunciation (声旁)
  | 'marking'          // 标示构件 — abstract marks/indicators
  | 'sign'             // 记号构件 — simplified symbols without meaning/phonetic value
  ;

export interface ComponentTypeInfo {
  key: ComponentType;
  label: string;
  enLabel: string;
  description: string;
  color: string;
  icon: string; // single char symbol
}

export const COMPONENT_TYPES: ComponentTypeInfo[] = [
  {
    key: 'form-depicting', label: '表形构件', enLabel: 'Form-Depicting',
    description: '以线条描摹事物轮廓的构件，类似传统象形。如"日""月""山""水"本身即为表形构件。',
    color: '#5D4037', icon: '形',
  },
  {
    key: 'meaning-bearing', label: '表义构件', enLabel: 'Meaning-Bearing',
    description: '携带语义信息的构件，决定了字的义类范畴。传统"形旁""意符"皆属此类。如"氵(水)""木""言"。',
    color: '#2D5F8A', icon: '义',
  },
  {
    key: 'sound-indicating', label: '示音构件', enLabel: 'Sound-Indicating',
    description: '提示读音信息的构件。王宁先生使用"示音构件"一词替代传统的"声旁"，强调其提示而非决定读音的功能。',
    color: '#CA6702', icon: '音',
  },
  {
    key: 'marking', label: '标示构件', enLabel: 'Marking',
    description: '以抽象符号指示位置、属性、关系等的非字构件。如"本"下的横线标示树根，"刃"上的点标示刀刃。',
    color: '#6A1B9A', icon: '标',
  },
  {
    key: 'sign', label: '记号构件', enLabel: 'Sign',
    description: '简化或讹变后失去表义/表音功能的构件，仅作为书写记号存在。如简化字"丛"中的"一"、"买"的顶部笔画。',
    color: '#78909C', icon: '记',
  },
];

// ── Structure Modes 结构模式 ──────────────────────────────────────

export type StructureMode =
  | 'planar'       // 平面结构 — all components combine at once
  | 'hierarchical' // 层次结构 — components combine in layers
  ;

export interface StructureModeInfo {
  key: StructureMode;
  label: string;
  enLabel: string;
  description: string;
  example: string;
}

export const STRUCTURE_MODES: StructureModeInfo[] = [
  {
    key: 'planar', label: '平面结构', enLabel: 'Planar',
    description: '所有构件在一个层次上一次性组合。如"解"由"角、刀、牛"三者平面组合。',
    example: '解 = 角 + 刀 + 牛（一层组合）',
  },
  {
    key: 'hierarchical', label: '层次结构', enLabel: 'Hierarchical',
    description: '构件分层次逐步组合。如"照"先由"日+召"组合，再与"灬"组合；"召"又由"刀+口"组合。',
    example: '照 = 昭(日+召(刀+口)) + 灬（层层组合）',
  },
];

// ── Formation Modes 构形模式 ──────────────────────────────────────

export type FormationMode =
  | 'zero-combination'    // 全功能零合成 — character IS one component
  | 'mark-form'           // 标形合成 — marker + form
  | 'mark-meaning'        // 标义合成 — marker + meaning
  | 'form-form'           // 会形合成 — form + form
  | 'form-meaning'        // 形义合成 — form + meaning
  | 'meaning-meaning'     // 义义合成 — meaning + meaning (= traditional 会意)
  | 'meaning-sound'       // 义音合成 — meaning + sound (= traditional 形声)
  | 'mark-sound'          // 标音合成 — marker + sound
  | 'sound-sound'         // 音音合成 — sound + sound
  | 'form-sound'          // 形音合成 — form + sound
  | 'sign-composite'      // 记号复合 — containing simplified/opaque signs
  ;

export interface FormationModeInfo {
  key: FormationMode;
  label: string;
  enLabel: string;
  description: string;
  /** Corresponding traditional 六书 category (if applicable) */
  sixBookEquivalent: string | null;
  example: string;
  color: string;
}

export const FORMATION_MODES: FormationModeInfo[] = [
  {
    key: 'zero-combination', label: '全功能零合成', enLabel: 'Zero-Combination',
    description: '汉字由一个独立的、同时具有形音义全功能的构件直接构成。对应传统"独体字"，包括象形字和部分指事字。',
    sixBookEquivalent: '象形 / 指事', example: '日、月、一、二、人',
    color: '#5D4037',
  },
  {
    key: 'mark-form', label: '标形合成', enLabel: 'Mark-Form',
    description: '在表形构件上加标示符号构成新字。传统归入指事字。',
    sixBookEquivalent: '指事', example: '本(木+一)、刃(刀+丶)、亦(大+丶丶)',
    color: '#6A1B9A',
  },
  {
    key: 'mark-meaning', label: '标义合成', enLabel: 'Mark-Meaning',
    description: '在表义构件上加标示符号。标示构件指示字义的焦点所在。',
    sixBookEquivalent: '指事', example: '太(大+丶)、甘(口+一)',
    color: '#7B1FA2',
  },
  {
    key: 'form-form', label: '会形合成', enLabel: 'Form-Form',
    description: '两个或多个表形构件组合，通过形象的组合表达新义。传统归入会意。',
    sixBookEquivalent: '会意', example: '休(人+木)、林(木+木)',
    color: '#8B6914',
  },
  {
    key: 'form-meaning', label: '形义合成', enLabel: 'Form-Meaning',
    description: '表形构件与表义构件组合。一个构件提供形象，一个提供义类。',
    sixBookEquivalent: '会意 / 形声', example: '社(示+土)',
    color: '#9E7B3F',
  },
  {
    key: 'meaning-meaning', label: '义义合成', enLabel: 'Meaning-Meaning',
    description: '两个或多个表义构件组合，通过意义的结合表达新义。即传统会意字的主体。',
    sixBookEquivalent: '会意', example: '明(日+月)、信(人+言)、武(止+戈)',
    color: '#5A8A6B',
  },
  {
    key: 'meaning-sound', label: '义音合成', enLabel: 'Meaning-Sound',
    description: '表义构件与示音构件组合。即传统形声字，占汉字总数约90%。是最能产的构形模式。',
    sixBookEquivalent: '形声', example: '河(氵+可)、清(氵+青)、想(心+相)',
    color: '#CA6702',
  },
  {
    key: 'mark-sound', label: '标音合成', enLabel: 'Mark-Sound',
    description: '标示构件加在示音构件上，通过标示改变或限定字义。较为罕见。',
    sixBookEquivalent: '指事 / 形声', example: '百(白+一)',
    color: '#8E24AA',
  },
  {
    key: 'sound-sound', label: '音音合成', enLabel: 'Sound-Sound',
    description: '两个示音构件组合。较为罕见，多为方言字或后起字。',
    sixBookEquivalent: '形声', example: '較少見',
    color: '#E65100',
  },
  {
    key: 'form-sound', label: '形音合成', enLabel: 'Form-Sound',
    description: '表形构件与示音构件组合。表形构件提供形象参考，示音构件提示读音。',
    sixBookEquivalent: '形声', example: '齿(止+⿱)',
    color: '#BF360C',
  },
  {
    key: 'sign-composite', label: '记号复合', enLabel: 'Sign-Composite',
    description: '含有记号构件的字。简化字中大量存在，构件已失去表义/表音功能，仅作为书写记号。',
    sixBookEquivalent: null, example: '丛、买、专、龙',
    color: '#78909C',
  },
];

// ── Classification mapping ────────────────────────────────────────

export interface ModernClassification {
  /** Primary formation mode */
  formationMode: FormationMode;
  /** Component breakdown with types */
  components: ModernComponent[];
  /** Structure mode (planar vs hierarchical) */
  structure: StructureMode;
  /** Whether this classification is manually curated or auto-inferred */
  curated: boolean;
}

export interface ModernComponent {
  character: string;
  componentType: ComponentType;
  role: string; // human-readable role description
}

/**
 * Map traditional 六书 etymology type to modern formation mode.
 * This is a heuristic — not all characters map perfectly.
 */
function mapSixBookToFormation(
  sixBookType: 'pictographic' | 'indicative' | 'ideographic' | 'pictophonetic' | 'loan',
  hasPhonetic: boolean,
  hasSemantic: boolean,
): FormationMode {
  switch (sixBookType) {
    case 'pictographic':
      return 'zero-combination';
    case 'indicative':
      // 指事字 can be mark-form, mark-meaning, or zero-combination
      return hasSemantic ? 'mark-meaning' : 'mark-form';
    case 'ideographic':
      return hasPhonetic ? 'form-meaning' : 'meaning-meaning';
    case 'pictophonetic':
      return 'meaning-sound';
    case 'loan':
      // 假借字 — borrowed for sound, original formation mode unknown
      return 'zero-combination';
  }
}

/**
 * Auto-classify a character using available data.
 * Returns null if insufficient data for classification.
 */
export function classifyCharacter(
  etymologyType: 'pictographic' | 'indicative' | 'ideographic' | 'pictophonetic' | 'loan' | undefined,
  phonetic: string | undefined,
  semantic: string | undefined,
  decomposition: string | undefined,
): ModernClassification | null {
  if (!etymologyType) return null;

  const formationMode = mapSixBookToFormation(
    etymologyType,
    !!phonetic,
    !!semantic,
  );

  const components: ModernComponent[] = [];

  // Determine component types based on formation mode and etymology
  if (etymologyType === 'pictophonetic') {
    if (semantic) {
      components.push({
        character: semantic,
        componentType: 'meaning-bearing',
        role: '表义构件（形旁），提示字的意义范畴',
      });
    }
    if (phonetic) {
      components.push({
        character: phonetic,
        componentType: 'sound-indicating',
        role: '示音构件（声旁），提示字的读音信息',
      });
    }
  } else if (etymologyType === 'ideographic') {
    // Extract all CJK components as meaning-bearing
    if (decomposition) {
      const cjkChars = extractCJK(decomposition);
      for (const c of cjkChars) {
        components.push({
          character: c,
          componentType: 'meaning-bearing',
          role: '表义构件，多个构件意义结合成字',
        });
      }
    }
  } else if (etymologyType === 'indicative') {
    if (semantic) {
      components.push({
        character: semantic,
        componentType: 'form-depicting',
        role: '表形构件，标示符号所依附的基础构件',
      });
    }
    components.push({
      character: '（标示符号）',
      componentType: 'marking',
      role: '标示构件，以抽象符号指示字义焦点',
    });
  } else if (etymologyType === 'pictographic') {
    components.push({
      character: '（整体象形）',
      componentType: 'form-depicting',
      role: '全功能零合成 — 字形本身即为独立表形构件',
    });
  } else if (etymologyType === 'loan') {
    components.push({
      character: '（同音假借）',
      componentType: 'sign',
      role: '假借字 — 借用同音字的字形表示另一个词，本义与本形分离',
    });
  }

  // Determine structure mode
  const structure: StructureMode =
    components.length <= 2 ? 'planar' : 'hierarchical';

  return {
    formationMode,
    components,
    structure,
    curated: false,
  };
}

function extractCJK(str: string): string[] {
  const chars: string[] = [];
  for (let i = 0; i < str.length; i++) {
    const cp = str.codePointAt(i);
    if (cp && cp >= 0x4E00 && cp <= 0x9FFF) chars.push(str[i]);
  }
  return [...new Set(chars)];
}

// ── Manually curated classifications (seed data) ──────────────────

const CURATED_CLASSIFICATIONS: Record<string, ModernClassification> = {
  '本': {
    formationMode: 'mark-form',
    components: [
      { character: '木', componentType: 'form-depicting', role: '表形构件 — 树木的形象' },
      { character: '一', componentType: 'marking', role: '标示构件 — 横线标示树根所在位置' },
    ],
    structure: 'planar', curated: true,
  },
  '刃': {
    formationMode: 'mark-form',
    components: [
      { character: '刀', componentType: 'form-depicting', role: '表形构件 — 刀的形象' },
      { character: '丶', componentType: 'marking', role: '标示构件 — 点标示刀刃位置' },
    ],
    structure: 'planar', curated: true,
  },
  '上': {
    formationMode: 'mark-form',
    components: [
      { character: '一', componentType: 'marking', role: '标示构件 — 参考线' },
      { character: '⺊', componentType: 'marking', role: '标示构件 — 指示上方位置' },
    ],
    structure: 'planar', curated: true,
  },
  '明': {
    formationMode: 'meaning-meaning',
    components: [
      { character: '日', componentType: 'meaning-bearing', role: '表义构件 — 太阳，提供"光明"义' },
      { character: '月', componentType: 'meaning-bearing', role: '表义构件 — 月亮，提供"光明"义' },
    ],
    structure: 'planar', curated: true,
  },
  '休': {
    formationMode: 'form-form',
    components: [
      { character: '人', componentType: 'form-depicting', role: '表形构件 — 人的侧立形象（亻）' },
      { character: '木', componentType: 'form-depicting', role: '表形构件 — 树木的形象' },
    ],
    structure: 'planar', curated: true,
  },
  '河': {
    formationMode: 'meaning-sound',
    components: [
      { character: '水', componentType: 'meaning-bearing', role: '表义构件 — 提示与水相关' },
      { character: '可', componentType: 'sound-indicating', role: '示音构件 — 提示读音 /kě/ → /hé/' },
    ],
    structure: 'planar', curated: true,
  },
  '想': {
    formationMode: 'meaning-sound',
    components: [
      { character: '心', componentType: 'meaning-bearing', role: '表义构件 — 提示与心理/思考相关' },
      { character: '相', componentType: 'sound-indicating', role: '示音构件 — 提示读音 /xiāng/ → /xiǎng/' },
    ],
    structure: 'hierarchical', curated: true,
  },
  '丛': {
    formationMode: 'sign-composite',
    components: [
      { character: '从', componentType: 'sound-indicating', role: '示音构件 — 提示读音' },
      { character: '一', componentType: 'sign', role: '记号构件 — 简化产生的无意义记号' },
    ],
    structure: 'planar', curated: true,
  },
};

/**
 * Get modern classification for a character.
 * Checks curated data first, then falls back to auto-classification.
 */
export function getModernClassification(
  etymologyType: 'pictographic' | 'indicative' | 'ideographic' | 'pictophonetic' | 'loan' | undefined,
  phonetic: string | undefined,
  semantic: string | undefined,
  decomposition: string | undefined,
  char: string,
): ModernClassification | null {
  // Check curated data
  if (CURATED_CLASSIFICATIONS[char]) {
    return CURATED_CLASSIFICATIONS[char];
  }

  // Auto-classify
  return classifyCharacter(etymologyType, phonetic, semantic, decomposition);
}

/**
 * Get human-readable formation mode info.
 */
export function getFormationModeInfo(mode: FormationMode): FormationModeInfo {
  return FORMATION_MODES.find(m => m.key === mode)!;
}

/**
 * Get human-readable component type info.
 */
export function getComponentTypeInfo(type: ComponentType): ComponentTypeInfo {
  return COMPONENT_TYPES.find(t => t.key === type)!;
}

/**
 * Get human-readable structure mode info.
 */
export function getStructureModeInfo(mode: StructureMode): StructureModeInfo {
  return STRUCTURE_MODES.find(m => m.key === mode)!;
}
