/**
 * English companion descriptions for modernTaxonomy.ts
 *
 * Keys correspond to the identifiers used in the Chinese source module:
 *   - FORMATION_DESCRIPTIONS_EN       key = FormationMode ('zero-combination', ...)
 *   - COMPONENT_TYPE_DESCRIPTIONS_EN  key = ComponentType ('form-depicting', ...)
 *   - STRUCTURE_MODE_DESCRIPTIONS_EN  key = StructureMode ('planar', 'hierarchical')
 *   - COMPONENT_ROLE_DESCRIPTIONS_EN  key = the Chinese `role` string of a ModernComponent
 *
 * The role map lets callers do `COMPONENT_ROLE_DESCRIPTIONS_EN[role] ?? role`.
 * Display-only strings — no classification logic depends on them.
 */

// ── Component Types 构件类型 ──────────────────────────────────────

export const COMPONENT_TYPE_DESCRIPTIONS_EN: Record<string, string> = {
  'form-depicting':
    'A component that traces the outline of a thing in lines, comparable to the traditional pictograph. Characters such as 日, 月, 山 and 水 are themselves form-depicting components.',
  'meaning-bearing':
    'A component that carries semantic information and determines the meaning category of the character. The traditional 形旁 (semantic component) and 意符 (signific) both belong to this class, e.g. 氵(水), 木, 言.',
  'sound-indicating':
    'A component that hints at the pronunciation. Wang Ning adopts the term 示音构件 in place of the traditional 声旁, stressing that such a component suggests rather than determines the reading.',
  'marking':
    'A non-character component that uses an abstract symbol to indicate position, attribute or relation. Thus the horizontal stroke beneath 本 marks the position of the tree root, and the dot on 刃 marks the blade.',
  'sign':
    'A component that has lost its semantic or phonetic function through simplification or corruption and survives only as a graphic sign — e.g. the 一 in the simplified character 丛, or the top strokes of 买.',
};

// ── Structure Modes 结构模式 ──────────────────────────────────────

export const STRUCTURE_MODE_DESCRIPTIONS_EN: Record<string, string> = {
  planar:
    'All components combine at once on a single level — e.g. 解 is formed by the planar combination of 角, 刀 and 牛.',
  hierarchical:
    'Components combine step by step in layers — e.g. 照 is first formed from 日+召 and then combined with 灬, while 召 is in turn formed from 刀+口.',
};

// ── Formation Modes 构形模式 ──────────────────────────────────────

export const FORMATION_DESCRIPTIONS_EN: Record<string, string> = {
  'zero-combination':
    'The character is formed directly by a single independent component that simultaneously performs the full functions of form, sound and meaning. Corresponds to the traditional "single-body character" (独体字), including pictographs and some indicative characters.',
  'mark-form':
    'A marking symbol is added to a form-depicting component to form a new character. Traditionally classified among indicative characters (指事).',
  'mark-meaning':
    'A marking symbol is added to a meaning-bearing component; the marking component indicates where the focus of the character meaning lies.',
  'form-form':
    'Two or more form-depicting components combine, expressing a new meaning through the conjunction of images. Traditionally classified as compound ideographs (会意).',
  'form-meaning':
    'A form-depicting component combines with a meaning-bearing component: one supplies the image, the other the semantic category.',
  'meaning-meaning':
    'Two or more meaning-bearing components combine, expressing a new meaning through the conjunction of their senses. This is the main body of the traditional compound ideograph (会意).',
  'meaning-sound':
    'A meaning-bearing component combines with a sound-indicating component. This is the traditional phono-semantic compound (形声), which accounts for roughly 90% of all Chinese characters and is the most productive formation mode.',
  'mark-sound':
    'A marking component is attached to a sound-indicating component, modifying or restricting the character meaning by means of the mark. Relatively rare.',
  'sound-sound':
    'Two sound-indicating components combine. Relatively rare; such characters are mostly dialect forms or late coinages.',
  'form-sound':
    'A form-depicting component combines with a sound-indicating component: the former supplies an image for reference, the latter hints at the pronunciation.',
  'sign-composite':
    'A character containing sign components. Such characters abound among the simplified forms, where components have lost their semantic or phonetic function and survive only as graphic signs.',
};

// ── Component roles 构件角色（ModernComponent.role） ──────────────

export const COMPONENT_ROLE_DESCRIPTIONS_EN: Record<string, string> = {
  // Auto-classification roles
  '表义构件（形旁），提示字的意义范畴':
    'Meaning-bearing component (semantic component, 形旁); hints at the semantic category of the character.',
  '示音构件（声旁），提示字的读音信息':
    'Sound-indicating component (phonetic, 声旁); hints at the pronunciation of the character.',
  '表义构件，多个构件意义结合成字':
    'Meaning-bearing component; the senses of several components combine to form the character.',
  '表形构件，标示符号所依附的基础构件':
    'Form-depicting component; the base component to which the marking symbol is attached.',
  '标示构件，以抽象符号指示字义焦点':
    'Marking component; an abstract symbol indicating the focus of the character meaning.',
  '全功能零合成 — 字形本身即为独立表形构件':
    'Zero-combination with full function — the graph itself is an independent form-depicting component.',
  '假借字 — 借用同音字的字形表示另一个词，本义与本形分离':
    'Loan character — the graph of a homophone is borrowed to write another word, so that the original meaning is divorced from the original form.',

  // Curated classification roles
  '表形构件 — 树木的形象':
    'Form-depicting component — the image of a tree.',
  '标示构件 — 横线标示树根所在位置':
    'Marking component — the horizontal stroke marks the position of the tree root.',
  '表形构件 — 刀的形象':
    'Form-depicting component — the image of a knife.',
  '标示构件 — 点标示刀刃位置':
    'Marking component — the dot marks the position of the blade.',
  '标示构件 — 参考线':
    'Marking component — a reference line.',
  '标示构件 — 指示上方位置':
    'Marking component — indicates the position above.',
  '表义构件 — 太阳，提供"光明"义':
    'Meaning-bearing component — the sun, contributing the sense of light.',
  '表义构件 — 月亮，提供"光明"义':
    'Meaning-bearing component — the moon, contributing the sense of light.',
  '表形构件 — 人的侧立形象（亻）':
    'Form-depicting component — the standing profile of a person (亻).',
  '表义构件 — 提示与水相关':
    'Meaning-bearing component — hints at a connection with water.',
  '示音构件 — 提示读音 /kě/ → /hé/':
    'Sound-indicating component — hints at the pronunciation /kě/ → /hé/.',
  '表义构件 — 提示与心理/思考相关':
    'Meaning-bearing component — hints at a connection with the mind or with thought.',
  '示音构件 — 提示读音 /xiāng/ → /xiǎng/':
    'Sound-indicating component — hints at the pronunciation /xiāng/ → /xiǎng/.',
  '示音构件 — 提示读音':
    'Sound-indicating component — hints at the pronunciation.',
  '记号构件 — 简化产生的无意义记号':
    'Sign component — a meaningless sign produced by simplification.',
};
