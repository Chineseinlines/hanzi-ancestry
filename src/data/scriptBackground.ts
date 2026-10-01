/**
 * 字形阶段的文化背景（Script-stage cultural background）
 *
 * 为字形演变时间线的每个历史阶段提供「时代—载体—书写特征—文化语境」的
 * 说明。与单字层面的 CulturalData（cultural.json，讲某个字的故事）不同，
 * 这里讲的是**字体本身**的来龙去脉，用于回答「甲骨文/金文/大篆/小篆是
 * 什么、为什么长这样」。
 *
 * key 必须与 GlyphEvolution 的 SCRIPT_STYLES[].key 保持一致。
 */

export interface ScriptBackground {
  /** 大致年代（中文） */
  period: string;
  /** 大致年代（英文） */
  periodEn: string;
  /** 文化背景说明（中文） */
  background: string;
  /** 文化背景说明（英文） */
  backgroundEn: string;
}

export const SCRIPT_BACKGROUND: Record<string, ScriptBackground> = {
  oracle: {
    period: '约公元前 1250—前 1046 年',
    periodEn: 'c. 1250–1046 BCE',
    background:
      '商代晚期刻写在龟甲、兽骨上的占卜记录，1899 年发现于河南安阳殷墟，因用于占卜又称「卜辞」。笔画瘦硬方折、直线居多，字形随骨面而变，象形性极强，是现存最早的成体系汉字。',
    backgroundEn:
      'Divination records incised on turtle plastrons and ox scapulae in the late Shang dynasty, discovered in 1899 at Yinxu (Anyang, Henan) and therefore also called "divination inscriptions." Strokes are thin, hard and angular, mostly straight; forms shift with the surface of the bone. Strongly pictographic, it is the earliest known fully developed Chinese writing.',
  },
  bronze: {
    period: '约公元前 1046—前 256 年',
    periodEn: 'c. 1046–256 BCE',
    background:
      '铸造或刻凿于青铜礼器（钟鼎彝器）上的铭文，故又称「钟鼎文」。多记祭祀、征伐、册命、赏赐之事。因是范铸而成，笔画圆浑肥厚、布局匀整，比甲骨文更接近后来的篆书。',
    backgroundEn:
      'Inscriptions cast or engraved on bronze ritual vessels (bells and cauldrons), hence also "bell-and-cauldron script." They mostly record sacrifices, military campaigns, royal investitures and grants. Because the characters were cast from moulds, strokes are round and full with even spacing — closer to later seal script than oracle-bone forms.',
  },
  'large-seal': {
    period: '约公元前 8 世纪—前 3 世纪',
    periodEn: 'c. 8th–3rd century BCE',
    background:
      '西周末至战国的籀文系统，以石鼓文与秦系文字为代表，是小篆的直接前身。笔画圆转匀称，字形渐趋方正严整。汉典字形库没有独立的「大篆」类目，此处样本取自「秦系文字」，即战国秦地通行的籀文一脉。',
    backgroundEn:
      'The Zhou seal tradition (籀文) from the late Western Zhou through the Warring States, represented by the Stone Drums (石鼓文) and by Qin script; the direct forerunner of small seal. Strokes are rounded and even, forms growing square and regular. The glyph library has no separate "large seal" category, so the sample shown here is drawn from Qin script (秦系文字), the Warring States Qin branch of the Zhou seal lineage.',
  },
  seal: {
    period: '公元前 221 年以降',
    periodEn: 'After 221 BCE',
    background:
      '秦始皇统一天下后「书同文」，由李斯等整理推行的标准字体。笔画圆转匀称、结构规范定型，字形多呈轴对称，是古文字与今文字的分界。',
    backgroundEn:
      'After Qin Shi Huang unified China he imposed "one script for all writing," and Li Si and others standardized this script. Strokes are rounded and even, structures fixed and regular, forms often axially symmetrical — the watershed between ancient and modern Chinese script.',
  },
  clerical: {
    period: '约公元前 2 世纪—公元 3 世纪',
    periodEn: 'c. 2nd century BCE – 3rd century CE',
    background:
      '由小篆草写简化而来，盛行于汉代。变圆转为方折、化弧线为直笔，出现「蚕头燕尾」的波磔。隶变是汉字由古文字向今文字转变的关键一步。',
    backgroundEn:
      'Arising from the rapid, simplified writing of small seal and dominant in the Han dynasty. Rounded turns became square angles and curves became straight strokes, with the "silkworm head and swallow tail" flourish. The clerical transformation (隶变) is the decisive step from ancient to modern script.',
  },
  regular: {
    period: '约公元 3 世纪至今',
    periodEn: 'c. 3rd century CE – present',
    background:
      '汉末魏晋逐渐成熟，笔画平直、结构方正，去隶书的波磔而存其横平竖直，成为沿用至今的标准字体。',
    backgroundEn:
      'Maturing from the late Han through the Wei–Jin period. Strokes are level and straight and structures square and upright; it drops the clerical wave-flourish while keeping the horizontal-vertical discipline, and remains the standard script in use today.',
  },
};

export function getScriptBackground(key: string): ScriptBackground | undefined {
  return SCRIPT_BACKGROUND[key];
}