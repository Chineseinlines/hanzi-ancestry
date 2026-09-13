/**
 * English companion descriptions for visualGrammar.ts
 *
 * Keys correspond to the identifiers used in the Chinese source module:
 *   - POSITION_DESCRIPTIONS_EN      key = Position ('left', 'right', ...)
 *   - COMPONENT_RULE_DESCRIPTIONS_EN key = component base form ('人', '水', ...)
 *   - STRUCTURE_DESCRIPTIONS_EN     key = StructureTemplate ('left-right', ...)
 *
 * Display-only strings — no validation logic depends on them.
 */

// ── Position Types 位置类型 ───────────────────────────────────────

export const POSITION_DESCRIPTIONS_EN: Record<string, string> = {
  left: 'The component occupies the left position.',
  right: 'The component occupies the right position.',
  top: 'The component occupies the top position.',
  bottom: 'The component occupies the bottom position.',
  enclose: 'The component completely encloses the other components.',
  'semi-enclose': 'The component partly encloses the other components.',
  overlay: 'The component interpenetrates and overlays the other components.',
};

// ── Component Position Rules 构件位置规则 ─────────────────────────

export const COMPONENT_RULE_DESCRIPTIONS_EN: Record<string, string> = {
  '人': 'When 人 serves as a left-side component it deforms to 亻 (the single-person radical); it may also appear above (as in 个) or below.',
  '水': 'When 水 serves as a left-side component it deforms to 氵 (the three-dot water radical); it may also appear below (as in 浆). It cannot appear on the right or above.',
  '心': 'When 心 serves as a left-side component it deforms to 忄 (the vertical-heart radical); it may also appear below (as in 想, 思).',
  '手': 'When 手 serves as a left-side component it deforms to 扌 (the hand radical); it may also appear below (as in 掌, 拳).',
  '火': 'When 火 serves as a bottom component it deforms to 灬 (the four-dot fire radical); it may also appear on the left (as in 灶).',
  '犬': 'When 犬 serves as a left-side component it deforms to 犭 (the dog radical).',
  '示': 'When 示 serves as a left-side component it deforms to 礻 (the 示 radical). It differs from 衤 (the clothing radical) by a single dot.',
  '衣': 'When 衣 serves as a left-side component it deforms to 衤 (the clothing radical). It is distinguished from 礻 (the 示 radical) in that 衤 carries two dots and 礻 only one.',
  '食': 'When 食 serves as a left-side component it is simplified to 饣 (the food radical).',
  '金': 'When 金 serves as a left-side component it is simplified to 钅 (the metal radical).',
  '言': 'When 言 serves as a left-side component it is simplified to 讠 (the speech radical).',
  '糸': 'When 糸 serves as a left-side component it is simplified to 纟 (the silk radical).',
  '刀': 'When 刀 serves as a right-side component it deforms to 刂 (the standing-knife radical).',
  '阜': 'When 阜 serves as a left-side component it deforms to 阝 (the left-ear radical, indicating terrain). The right-ear form derives instead from 邑 (indicating a city or settlement).',
  '邑': 'When 邑 serves as a right-side component it deforms to 阝 (the right-ear radical, indicating a city or settlement). The left-ear form derives instead from 阜 (indicating terrain).',
  '冰': 'When 冰 serves as a left-side component it deforms to 冫 (the two-dot ice radical), to be distinguished from 氵 (the three-dot water radical).',

  '艸': 'When 艸 serves as a top component it deforms to 艹 (the grass radical). It occurs in the top position only.',
  '竹': 'When 竹 serves as a top component it deforms to 𥫗 (the bamboo radical). It occurs in the top position only.',
  '雨': '雨 normally occurs at the top (as in 雷, 雪, 雾). It may also occur on the left, though this is rare.',

  '皿': '皿 occurs in the bottom position only (as in 盆, 盒, 盛).',

  '囗': '囗 fully encloses the other component (as in 国, 围, 园). The enclosed component must be smaller than the outer frame.',
  '门': '门 fully encloses the other component (as in 问, 间, 闭). The enclosed component is centred inside it.',
  '辵': 'When 辵 serves as a semi-enclosing component it deforms to 辶 (the walking radical), wrapping the upper right from the lower left.',
  '匚': '匚 semi-encloses from the lower left (as in 匠, 匡, 匣).',
  '厂': '厂 wraps the lower right from the upper left (as in 历, 压, 厘).',
  '广': '广 wraps the lower right from the upper left (as in 店, 府, 庭). It has one stroke more than 厂.',
  '疒': '疒 wraps the lower right from the upper left (as in 病, 痛, 瘦). The sickness radical, associated with illness.',
  '尸': '尸 wraps the lower right from the upper left (as in 层, 居, 屋).',

  '青': '青 frequently serves as a phonetic component on the right (as in 清, 请, 情, 晴); in a few characters it occurs below (as in 菁).',
  '方': '方 frequently serves as a phonetic component on the right (as in 放, 房, 访); in a few characters it occurs below (as in 芳).',
  '工': '工 frequently serves as a phonetic component on the right (as in 红, 虹, 江); it may also occur below (as in 功, 攻).',
  '可': '可 occurs only as a phonetic component on the right (as in 河, 何, 柯).',
  '古': '古 frequently serves as a phonetic component on the right (as in 故, 姑, 估).',
  '巴': '巴 frequently serves as a phonetic component on the right (as in 把, 吧, 爸).',
  '马': '马 may serve as a phonetic component on the right (as in 妈, 吗, 码) or as a semantic component on the left (as in 骑, 驾).',
};

// ── Character Structure Templates 结构模板 ────────────────────────

export const STRUCTURE_DESCRIPTIONS_EN: Record<string, string> = {
  'left-right': 'The most common structure: the semantic component stands on the left and the phonetic component on the right.',
  'top-bottom': 'The components are arranged one above the other.',
  'left-mid-right': 'Three components are arranged horizontally.',
  'top-mid-bottom': 'Three components are arranged vertically.',
  'full-enclose': 'The outer component completely encloses the inner component.',
  'semi-enclose-tl': 'The upper-left component wraps around the lower right.',
  'semi-enclose-bl': 'The lower-left component supports and wraps the upper right.',
  'pin': 'Three identical components are arranged in the triangular 品 configuration.',
  'overlay': 'The components interpenetrate and overlay one another.',
};
