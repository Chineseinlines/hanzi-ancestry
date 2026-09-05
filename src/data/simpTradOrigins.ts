/**
 * 简繁溯源数据（「把字溯源」）
 *
 * 记录简化字与繁体字之间的先后关系与演化线索。重点：很多简体字并非
 * 「现代新造」——有的本身就是古字/俗字（比繁体更古老），有的是草书
 * 楷化，有的来自符号替代、多字合并等。时间线只表示先后关系，不标注
 * 具体年代。
 *
 * 数据分批 curated；未覆盖的简繁对走兜底展示（现代简化，无分类标签）。
 */
import { getTraditionalForm, getSimplifiedForm } from './hanziData';

/** 简化方式分类 */
export type SimpTradOriginType =
  | 'ancient-variant'       // 古字/俗字沿用：简体形古已有之，常比繁体更古老
  | 'cursive'               // 草书楷化：由草书写法楷定而来
  | 'symbol-substitution'   // 符号替代：以「又」「乂」等符号替代复杂部件
  | 'omission'              // 省形简省：保留部分结构，省去其余
  | 'phonetic-replacement'  // 更换声旁：换成更简单的同音声旁
  | 'merger'                // 多字合并：多个繁体字合并为一个简体
  | 'analogy'               // 类推简化：简化偏旁类推到整组字
  | 'other';                // 其他（兜底：现代简化，未细分类）

export interface SimpTradOriginEntry {
  /** 简体字（现行规范字形） */
  char: string;
  /** 对应的繁体字形（合并字有多个） */
  traditionals: string[];
  /** 简化方式 */
  originType: SimpTradOriginType;
  /** 一句话说明 */
  note?: string;
}

export interface SimpTradOriginResult {
  /** 当前查看的字 */
  char: string;
  /** 简化关系种类 */
  kind: 'simplified' | 'traditional' | 'inherited';
  /** 现行规范简体 */
  simplified: string;
  /** 繁体字形列表（无则为空） */
  traditionals: string[];
  /** curated 溯源数据（未覆盖时为 null，走兜底展示） */
  origin: SimpTradOriginEntry | null;
  /** 传承字的说明（仅 kind === 'inherited' 且 curated 时） */
  inheritedNote?: string;
}

export const ORIGIN_TYPE_LABELS: Record<SimpTradOriginType, string> = {
  'ancient-variant': '古字沿用',
  'cursive': '草书楷化',
  'symbol-substitution': '符号替代',
  'omission': '省形简省',
  'phonetic-replacement': '更换声旁',
  'merger': '多字合并',
  'analogy': '类推简化',
  'other': '现代简化',
};

/* ── Curated 高频字（第一批） ───────────────────────────────────── */

const ORIGIN_ENTRIES: Record<string, SimpTradOriginEntry> = {
  // ── 古字/俗字沿用：简体形古已有之，往往比繁体更古老 ──
  '国': {
    char: '国', traditionals: ['國'], originType: 'ancient-variant',
    note: '「國」从囗从或（或为「域」本字，持戈守城）。「国」作为俗字早见于南北朝碑刻与敦煌写卷，太平天国文书写作「囯」；1956年《汉字简化方案》采用古俗字「国」为规范字。',
  },
  '从': {
    char: '从', traditionals: ['從'], originType: 'ancient-variant',
    note: '甲骨文已有「从」（二人相随），与「從」长期并存；《说文》以「从」为「從」之古文。1956年采用古字「从」。',
  },
  '电': {
    char: '电', traditionals: ['電'], originType: 'ancient-variant',
    note: '「电」金文已有；「電」为后起字，加「雨」旁。1956年回归古字「电」。',
  },
  '气': {
    char: '气', traditionals: ['氣'], originType: 'ancient-variant',
    note: '「气」甲骨文已有，象云气之形；「氣」本义馈赠粮草（今作「饩」），后借为云气义。1956年回归本字「气」。',
  },
  '云': {
    char: '云', traditionals: ['雲'], originType: 'ancient-variant',
    note: '甲骨文「云」象云气回旋；后加「雨」作「雲」以区别于「云曰」之「云」。1956年回归本字「云」。',
  },
  '网': {
    char: '网', traditionals: ['網'], originType: 'ancient-variant',
    note: '「网」为象形本字，甲骨文已有；后加「糸」作「網」。1956年回归本字「网」。',
  },
  '万': {
    char: '万', traditionals: ['萬'], originType: 'ancient-variant',
    note: '「万」先秦已用作「萬」的简体别体（见于古陶文）。1956年采用「万」。',
  },
  '无': {
    char: '无', traditionals: ['無'], originType: 'ancient-variant',
    note: '《说文》所录奇字「无」，先秦已有；「無」为后起形声字。1956年采用「无」。',
  },
  '尔': {
    char: '尔', traditionals: ['爾'], originType: 'ancient-variant',
    note: '「尔」为古字，见于篆文，是「爾」的简体别体。1956年采用「尔」。',
  },
  '个': {
    char: '个', traditionals: ['個'], originType: 'ancient-variant',
    note: '「个」汉代已用作量词（《史记》「竹竿万个」），与「個」并存。1956年采用「个」。',
  },
  '与': {
    char: '与', traditionals: ['與'], originType: 'ancient-variant',
    note: '「与」金文已有，本义赐予；《说文》以「与」为「與」之古文。1956年采用「与」。',
  },
  '号': {
    char: '号', traditionals: ['號'], originType: 'ancient-variant',
    note: '「号」为古字，本义呼号哭叫；「號」为后起形声字。1956年采用「号」。',
  },
  '处': {
    char: '处', traditionals: ['處'], originType: 'ancient-variant',
    note: '「処」见于《说文》或体，「处」为其变体，古已有之。1956年采用「处」。',
  },
  '礼': {
    char: '礼', traditionals: ['禮'], originType: 'ancient-variant',
    note: '甲骨文「豊」为礼器之形；「礼」见于篆文，「禮」为后起形声字。1956年采用「礼」。',
  },
  '时': {
    char: '时', traditionals: ['時'], originType: 'ancient-variant',
    note: '「时」为宋元以来常见俗体（《宋元以来俗字谱》收录）。1956年采用俗字「时」。',
  },
  '达': {
    char: '达', traditionals: ['達'], originType: 'ancient-variant',
    note: '「达」见于甲骨金文，《说文》以「达」为「達」之或体。1956年采用「达」。',
  },
  '灵': {
    char: '灵', traditionals: ['靈'], originType: 'ancient-variant',
    note: '「灵」为元明以来常见俗字，以手奉火会意。1956年采用俗字「灵」。',
  },
  '医': {
    char: '医', traditionals: ['醫'], originType: 'ancient-variant',
    note: '「医」为古字，本义盛弓弩矢的器具（《说文》有之）；「醫」为医生本字。1956年借古字「医」代「醫」。',
  },
  '后': {
    char: '后', traditionals: ['後'], originType: 'ancient-variant',
    note: '「后」本义君主（甲骨文已有），「後」表先后之义，两字古时并存。1956年合并于古字「后」。',
  },

  // ── 草书楷化：由草书写法楷定而来 ──
  '书': { char: '书', traditionals: ['書'], originType: 'cursive', note: '「书」取自「書」草书写法的楷化。' },
  '为': { char: '为', traditionals: ['為', '爲'], originType: 'cursive', note: '「为」取自「為」草书写法的楷化。' },
  '东': { char: '东', traditionals: ['東'], originType: 'cursive', note: '「东」取自「東」草书写法的楷化。' },
  '乐': { char: '乐', traditionals: ['樂'], originType: 'cursive', note: '「乐」取自「樂」草书写法的楷化。' },
  '头': { char: '头', traditionals: ['頭'], originType: 'cursive', note: '「头」取自「頭」草书写法的楷化。' },
  '长': { char: '长', traditionals: ['長'], originType: 'cursive', note: '「长」取自「長」草书写法的楷化（汉简已有近似写法）。' },
  '车': { char: '车', traditionals: ['車'], originType: 'cursive', note: '「车」取自「車」草书写法的楷化。' },
  '门': { char: '门', traditionals: ['門'], originType: 'cursive', note: '「门」取自「門」草书写法的楷化。' },
  '马': { char: '马', traditionals: ['馬'], originType: 'cursive', note: '「马」取自「馬」草书写法的楷化。' },
  '鸟': { char: '鸟', traditionals: ['鳥'], originType: 'cursive', note: '「鸟」取自「鳥」草书写法的楷化。' },
  '龙': { char: '龙', traditionals: ['龍'], originType: 'cursive', note: '「龙」取自「龍」草书写法的楷化。' },
  '风': { char: '风', traditionals: ['風'], originType: 'cursive', note: '「风」取自「風」草书写法的楷化。' },
  '飞': { char: '飞', traditionals: ['飛'], originType: 'cursive', note: '「飞」取自「飛」草书写法的楷化。' },
  '贝': { char: '贝', traditionals: ['貝'], originType: 'cursive', note: '「贝」取自「貝」草书写法的楷化。' },
  '页': { char: '页', traditionals: ['頁'], originType: 'cursive', note: '「页」取自「頁」草书写法的楷化。' },
  '见': { char: '见', traditionals: ['見'], originType: 'cursive', note: '「见」取自「見」草书写法的楷化。' },
  '专': { char: '专', traditionals: ['專'], originType: 'cursive', note: '「专」取自「專」草书写法的楷化。' },
  '学': { char: '学', traditionals: ['學'], originType: 'cursive', note: '「学」取自「學」草书写法的楷化。' },
  '会': { char: '会', traditionals: ['會'], originType: 'cursive', note: '「会」取自「會」草书写法的楷化。' },
  '觉': { char: '觉', traditionals: ['覺'], originType: 'cursive', note: '「觉」取自「覺」草书写法的楷化。' },
  '兴': { char: '兴', traditionals: ['興'], originType: 'cursive', note: '「兴」取自「興」草书写法的楷化。' },
  '当': { char: '当', traditionals: ['當'], originType: 'cursive', note: '「当」取自「當」草书写法的楷化（兼「噹」合并）。' },
  '应': { char: '应', traditionals: ['應'], originType: 'cursive', note: '「应」取自「應」草书写法的楷化。' },
  '农': { char: '农', traditionals: ['農'], originType: 'cursive', note: '「农」取自「農」草书写法的楷化。' },
  '杀': { char: '杀', traditionals: ['殺'], originType: 'cursive', note: '「杀」取自「殺」草书写法的楷化。' },

  // ── 符号替代：以「又」「乂」等简单符号替代复杂部件 ──
  '难': { char: '难', traditionals: ['難'], originType: 'symbol-substitution', note: '以符号「又」替代「堇」。' },
  '鸡': { char: '鸡', traditionals: ['雞'], originType: 'symbol-substitution', note: '以符号「又」替代「奚」。' },
  '观': { char: '观', traditionals: ['觀'], originType: 'symbol-substitution', note: '以符号「又」替代「雚」。' },
  '汉': { char: '汉', traditionals: ['漢'], originType: 'symbol-substitution', note: '以符号「又」替代「堇」。' },
  '欢': { char: '欢', traditionals: ['歡'], originType: 'symbol-substitution', note: '以符号「又」替代「雚」。' },
  '戏': { char: '戏', traditionals: ['戲'], originType: 'symbol-substitution', note: '以符号「又」替代「虍」部分。' },
  '对': { char: '对', traditionals: ['對'], originType: 'symbol-substitution', note: '以符号「又」替代左部。' },
  '凤': { char: '凤', traditionals: ['鳳'], originType: 'symbol-substitution', note: '以「又」居中替代内部结构。' },
  '树': { char: '树', traditionals: ['樹'], originType: 'symbol-substitution', note: '以符号「又」替代「壴」。' },
  '聂': { char: '聂', traditionals: ['聶'], originType: 'symbol-substitution', note: '以「双」替代重叠的三「耳」。' },
  '轰': { char: '轰', traditionals: ['轟'], originType: 'symbol-substitution', note: '以「双」替代重叠的三「車」。' },
  '赵': { char: '赵', traditionals: ['趙'], originType: 'symbol-substitution', note: '以符号「乂」替代「肖」。' },
  '区': { char: '区', traditionals: ['區'], originType: 'symbol-substitution', note: '以符号「乂」替代内部「品」形。' },
  '冈': { char: '冈', traditionals: ['岡'], originType: 'symbol-substitution', note: '以符号「乂」替代内部结构。' },

  // ── 省形简省：保留部分结构，省去其余 ──
  '声': { char: '声', traditionals: ['聲'], originType: 'omission', note: '保留「聲」上部（磬形），省去「殳」「耳」。' },
  '际': { char: '际', traditionals: ['際'], originType: 'omission', note: '保留「阝」「示」，省去「祭」。' },
  '灭': { char: '灭', traditionals: ['滅'], originType: 'omission', note: '「一」覆「火」，会意灭火，省去「戌」「氵」。' },
  '点': { char: '点', traditionals: ['點'], originType: 'omission', note: '保留「占」与「灬」，省去「黑」。' },
  '夺': { char: '夺', traditionals: ['奪'], originType: 'omission', note: '保留上部，省去中部「佳」。' },
  '寻': { char: '寻', traditionals: ['尋'], originType: 'omission', note: '保留上部，省去下部。' },
  '亲': { char: '亲', traditionals: ['親'], originType: 'omission', note: '保留「亲」形，省去「見」。' },

  // ── 更换声旁：换成更简单的同音声旁 ──
  '洁': { char: '洁', traditionals: ['潔'], originType: 'phonetic-replacement', note: '声旁「絜」换为同音「吉」。' },
  '虾': { char: '虾', traditionals: ['蝦'], originType: 'phonetic-replacement', note: '声旁「叚」换为「下」。' },
  '苹': { char: '苹', traditionals: ['蘋'], originType: 'phonetic-replacement', note: '声旁「頻」换为「平」。' },
  '亿': { char: '亿', traditionals: ['億'], originType: 'phonetic-replacement', note: '声旁「意」换为「乙」。' },
  '忆': { char: '忆', traditionals: ['憶'], originType: 'phonetic-replacement', note: '声旁「意」换为「乙」。' },
  '拥': { char: '拥', traditionals: ['擁'], originType: 'phonetic-replacement', note: '声旁「雍」换为「用」。' },
  '优': { char: '优', traditionals: ['優'], originType: 'phonetic-replacement', note: '声旁「憂」换为「尤」。' },
  '邮': { char: '邮', traditionals: ['郵'], originType: 'phonetic-replacement', note: '声旁「垂」换为「由」。' },
  '认': { char: '认', traditionals: ['認'], originType: 'phonetic-replacement', note: '声旁「忍」换为「人」。' },
  '让': { char: '让', traditionals: ['讓'], originType: 'phonetic-replacement', note: '声旁「襄」换为「上」。' },
  '战': { char: '战', traditionals: ['戰'], originType: 'phonetic-replacement', note: '声旁「單」换为「占」。' },
  '远': { char: '远', traditionals: ['遠'], originType: 'phonetic-replacement', note: '声旁「袁」换为「元」。' },
  '园': { char: '园', traditionals: ['園'], originType: 'phonetic-replacement', note: '声旁「袁」换为「元」。' },
  '种': { char: '种', traditionals: ['種'], originType: 'phonetic-replacement', note: '声旁「重」换为「中」。' },

  // ── 多字合并：多个繁体字合并为一个简体 ──
  '发': {
    char: '发', traditionals: ['發', '髮'], originType: 'merger',
    note: '「發」（发射）与「髮」（头发）二字合并为「发」。',
  },
  '干': {
    char: '干', traditionals: ['乾', '幹'], originType: 'merger',
    note: '「干」本字（干戈）与「乾」（干燥）、「幹」（树干）三字合并。',
  },
  '里': {
    char: '里', traditionals: ['裏', '裡'], originType: 'merger',
    note: '「里」本义乡里（古字），「裏／裡」本义衣里，两字古时并存，1956年合并于「里」。',
  },
  '台': {
    char: '台', traditionals: ['臺', '檯', '颱'], originType: 'merger',
    note: '「臺」（高台）、「檯」（台面）、「颱」（台风）合并于古字「台」。',
  },
  '系': {
    char: '系', traditionals: ['係', '繫'], originType: 'merger',
    note: '「系」（系统，古字）与「係」「繫」合并。',
  },
  '面': {
    char: '面', traditionals: ['麵'], originType: 'merger',
    note: '「面」（脸面，古字）与「麵」（面粉）合并。',
  },
  '复': {
    char: '复', traditionals: ['復', '複', '覆'], originType: 'merger',
    note: '「復」（反复）、「複」（复杂）、「覆」（覆盖）合并为「复」。',
  },
  '斗': {
    char: '斗', traditionals: ['鬥'], originType: 'merger',
    note: '「斗」（量器，古字）与「鬥」（争斗）合并。',
  },
  '叶': {
    char: '叶', traditionals: ['葉'], originType: 'merger',
    note: '借古字「叶」（xié，叶韵）代「葉」（树叶）。',
  },
  '松': {
    char: '松', traditionals: ['鬆'], originType: 'merger',
    note: '「松」（松树）与「鬆」（松散）合并。',
  },
  '谷': {
    char: '谷', traditionals: ['穀'], originType: 'merger',
    note: '「谷」（山谷，古字）与「穀」（谷物）合并。',
  },
  '丑': {
    char: '丑', traditionals: ['醜'], originType: 'merger',
    note: '「丑」（地支，古字）与「醜」（丑陋）合并。',
  },
  '钟': {
    char: '钟', traditionals: ['鐘', '鍾'], originType: 'merger',
    note: '「鐘」（钟表、乐器）与「鍾」（钟爱、酒器）合并。',
  },
  '只': {
    char: '只', traditionals: ['隻'], originType: 'merger',
    note: '「只」（语气词，古字）与「隻」（量词）合并。',
  },
  '舍': {
    char: '舍', traditionals: ['捨'], originType: 'merger',
    note: '「舍」（房舍，古字）与「捨」（舍弃）合并。',
  },
  '制': {
    char: '制', traditionals: ['製'], originType: 'merger',
    note: '「制」（制度，古字）与「製」（制造）合并。',
  },
  '板': {
    char: '板', traditionals: ['闆'], originType: 'merger',
    note: '「板」（木板，古字）与「闆」（老板）合并。',
  },

  // ── 类推简化：简化偏旁类推到整组字 ──
  '说': { char: '说', traditionals: ['說', '説'], originType: 'analogy', note: '「言」旁类推简化为「讠」。「說」为正体，「説」为异体。' },
  '钱': { char: '钱', traditionals: ['錢'], originType: 'analogy', note: '「金」旁类推简化为「钅」。' },
  '经': { char: '经', traditionals: ['經'], originType: 'analogy', note: '「糹」旁类推简化为「纟」。' },
  '论': { char: '论', traditionals: ['論'], originType: 'analogy', note: '「言」旁类推简化为「讠」。' },
  '请': { char: '请', traditionals: ['請'], originType: 'analogy', note: '「言」旁类推简化为「讠」。' },
  '记': { char: '记', traditionals: ['記'], originType: 'analogy', note: '「言」旁类推简化为「讠」。' },
  '试': { char: '试', traditionals: ['試'], originType: 'analogy', note: '「言」旁类推简化为「讠」。' },
  '语': { char: '语', traditionals: ['語'], originType: 'analogy', note: '「言」旁类推简化为「讠」。' },
  '银': { char: '银', traditionals: ['銀'], originType: 'analogy', note: '「金」旁类推简化为「钅」。' },
  '线': { char: '线', traditionals: ['線'], originType: 'analogy', note: '「糹」旁类推简化为「纟」。' },
  '级': { char: '级', traditionals: ['級'], originType: 'analogy', note: '「糹」旁类推简化为「纟」。' },
};

/* ── 传承字说明（无简繁之分的字） ─────────────────────────────── */

const INHERITED_NOTES: Record<string, string> = {
  '家': '「家」从宀从豕（屋内有猪，定居之象），甲骨文已如此，古今同形，未经历简化。',
  '人': '「人」象侧立人形，甲骨文已如此，古今同形，未经历简化。',
  '山': '「山」象三峰并立，甲骨文已如此，古今同形，未经历简化。',
  '水': '「水」象流水之形，甲骨文已如此，古今同形，未经历简化。',
  '火': '「火」象火焰上腾之形，甲骨文已如此，古今同形，未经历简化。',
  '日': '「日」象太阳之形，甲骨文已如此，古今同形，未经历简化。',
  '月': '「月」象弦月之形，甲骨文已如此，古今同形，未经历简化。',
  '木': '「木」象树木之形，甲骨文已如此，古今同形，未经历简化。',
  '田': '「田」象阡陌纵横之田，甲骨文已如此，古今同形，未经历简化。',
  '子': '「子」象襁褓婴儿之形，甲骨文已如此，古今同形，未经历简化。',
};

const DEFAULT_INHERITED_NOTE = '传承字：古今同形，未经历简化。';

/* ── 查询 ────────────────────────────────────────────────────── */

/**
 * 查询一个字的简繁溯源信息。
 * - 简体字且有繁体 → kind: 'simplified'
 * - 繁体字且有简体 → kind: 'traditional'
 * - 无简繁之分     → kind: 'inherited'（传承字）
 */
export function getSimpTradOrigin(char: string): SimpTradOriginResult | null {
  if (!char) return null;

  // 1. 简体字（现行规范）→ 找繁体
  const trad = getTraditionalForm(char);
  if (trad !== char) {
    const origin = ORIGIN_ENTRIES[char] ?? null;
    return {
      char,
      kind: 'simplified',
      simplified: char,
      traditionals: origin?.traditionals ?? [trad],
      origin,
    };
  }

  // 2. 繁体字 → 找简体
  const simp = getSimplifiedForm(char);
  if (simp) {
    const origin = ORIGIN_ENTRIES[simp] ?? null;
    return {
      char,
      kind: 'traditional',
      simplified: simp,
      traditionals: origin?.traditionals ?? [char],
      origin,
    };
  }

  // 3. 传承字（无简繁之分）
  return {
    char,
    kind: 'inherited',
    simplified: char,
    traditionals: [],
    origin: null,
    inheritedNote: INHERITED_NOTES[char],
  };
}

/** 传承字的说明文案（curated 或默认） */
export function getInheritedNote(char: string): string {
  return INHERITED_NOTES[char] ?? DEFAULT_INHERITED_NOTE;
}
