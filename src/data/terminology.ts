/**
 * 汉字构形学术语英译对照表 — Terminology glossary
 *
 * 依据王宁《汉字构形学导论》与当代文字学惯例，统一英文术语，
 * 修正早期文献中以 "ideographic component" 指称形旁（表义构件）等旧译。
 *
 * 术语分层：
 *   1. 构件层级（component）—— 形旁/声旁/记号构件等
 *   2. 整字层级（character）—— 形声字/会意字/独体字等
 *   3. 结构层级（structure）—— 构形模式/结构模式等
 */

export interface TermEntry {
  /** 中文术语 */
  zh: string;
  /** 建议英译 */
  en: string;
  /** 不建议使用的旧译（若有） */
  avoid?: string;
  /** 中文说明 */
  note: string;
  /** 英文说明 */
  noteEn: string;
}

export const TERMINOLOGY: TermEntry[] = [
  {
    zh: '构件',
    en: 'component',
    note: '汉字构形的基本功能单位，不限于部首，也不限于成字部件。',
    noteEn: 'The basic functional unit of character formation — not restricted to radicals or standalone characters.',
  },
  {
    zh: '形旁 / 意符',
    en: 'semantic component',
    avoid: 'ideographic component',
    note: '承担意义范畴提示的构件。旧译 "ideographic component" 易与会意字（compound ideograph）混淆，应予废弃。',
    noteEn: 'The component that signals the semantic category. The older "ideographic component" is easily confused with the compound ideograph (会意字) and should be avoided.',
  },
  {
    zh: '声旁',
    en: 'phonetic component',
    avoid: 'phonetic radical',
    note: '提示读音的构件。"radical" 专指部首，声旁未必是部首，故不宜混用。',
    noteEn: 'The component that hints at pronunciation. "Radical" refers specifically to the indexing radical (部首); a phonetic component need not be one.',
  },
  {
    zh: '部首',
    en: 'radical',
    note: '字典检字所用的索引单位，与"形旁"不是同一概念。',
    noteEn: 'The indexing unit used in dictionaries — a distinct concept from the semantic component.',
  },
  {
    zh: '表义构件',
    en: 'meaning-bearing component',
    note: '王宁构形学对形旁一类构件的统称，与"示音构件""标示构件"并列。',
    noteEn: 'Wang Ning\'s umbrella term for meaning-carrying components, alongside sound-indicating and marking components.',
  },
  {
    zh: '示音构件',
    en: 'sound-indicating component',
    note: '强调其"提示"而非"决定"读音的功能，较"声旁"更精确。',
    noteEn: 'Emphasizes that the component *hints at* rather than *determines* the reading — more precise than "phonetic".',
  },
  {
    zh: '记号构件',
    en: 'sign component',
    note: '简化或讹变后失去表义/表音功能的构件，仅作书写记号。',
    noteEn: 'A component that has lost its semantic or phonetic function through simplification or corruption, surviving only as a writing sign.',
  },
  {
    zh: '形声字',
    en: 'phono-semantic compound',
    avoid: 'pictophonetic character',
    note: '由表义构件与示音构件组合而成，占汉字总数约 90%。',
    noteEn: 'A compound of a semantic component and a phonetic component, accounting for roughly 90% of all characters.',
  },
  {
    zh: '会意字',
    en: 'compound ideograph',
    note: '由多个表义构件组合表意。"ideograph" 用于整字层级，不用于构件层级。',
    noteEn: 'A character combining several meaning-bearing components. "Ideograph" belongs to the character level, not the component level.',
  },
  {
    zh: '独体字',
    en: 'single-component character',
    avoid: 'simple character',
    note: '由一个全功能构件直接构成，对应构形学"全功能零合成"。',
    noteEn: 'A character formed by a single fully functional component — the "zero-combination" mode.',
  },
  {
    zh: '合体字',
    en: 'compound character',
    note: '由两个及以上构件合成的字。',
    noteEn: 'A character composed of two or more components.',
  },
  {
    zh: '构形模式',
    en: 'formation mode',
    avoid: 'character formation type',
    note: '王宁构形学的核心概念，共 11 种（义音合成、义义合成等）。',
    noteEn: 'A core concept of Wang Ning\'s theory — eleven modes in total (meaning-sound, meaning-meaning, etc.).',
  },
  {
    zh: '结构模式',
    en: 'structure mode',
    note: '平面结构与层次结构之分，描述构件组合的层级方式。',
    noteEn: 'Distinguishes planar from hierarchical structure — how components are layered in combination.',
  },
  {
    zh: '视觉语法',
    en: 'visual grammar',
    note: '本平台提出的构件空间组合规则体系，规范构件在字内的合法位置与形态。',
    noteEn: 'This platform\'s rule system for the spatial combination of components — governing their legal positions and shapes.',
  },
];

/** 快速取用：中文术语 → 建议英译 */
export function suggestedEnglish(zhTerm: string): string | undefined {
  return TERMINOLOGY.find((t) => t.zh.includes(zhTerm))?.en;
}