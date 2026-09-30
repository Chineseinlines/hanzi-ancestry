// ────────────────────────────────────────────────────────────────
// 汉字游戏静态题库
// 集中存放变形部件、形近字、易错笔顺、汉字故事、冷知识、
// HSK 分级示例字、以及笔画数等手写内容。
// ────────────────────────────────────────────────────────────────

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample<T>(arr: T[], count: number): T[] {
  return shuffle(arr).slice(0, count);
}

// ── 变形部件：变形体 → 本字 ─────────────────────────────────
export interface VariantRadical {
  variant: string;
  origin: string;
  gloss: string;
}

export const VARIANT_RADICALS: VariantRadical[] = [
  { variant: '忄', origin: '心', gloss: '竖心旁，与内心、情感有关' },
  { variant: '扌', origin: '手', gloss: '提手旁，与手的动作有关' },
  { variant: '氵', origin: '水', gloss: '三点水，与水有关' },
  { variant: '灬', origin: '火', gloss: '四点底，与火、热有关' },
  { variant: '犭', origin: '犬', gloss: '反犬旁，与兽类有关' },
  { variant: '亻', origin: '人', gloss: '单人旁，与人有关' },
  { variant: '讠', origin: '言', gloss: '言字旁，与言语有关' },
  { variant: '纟', origin: '糸', gloss: '绞丝旁，与丝线有关' },
  { variant: '钅', origin: '金', gloss: '金字旁，与金属有关' },
  { variant: '饣', origin: '食', gloss: '食字旁，与食物有关' },
  { variant: '礻', origin: '示', gloss: '示字旁，与祭祀、神示有关' },
  { variant: '衤', origin: '衣', gloss: '衣字旁，与衣物有关' },
  { variant: '刂', origin: '刀', gloss: '立刀旁，与刀、切割有关' },
  { variant: '冫', origin: '冰', gloss: '两点水，与寒冷有关' },
  { variant: '艹', origin: '艸', gloss: '草字头（艸=草的总名），与草木有关' },
  { variant: '罒', origin: '网', gloss: '四字头，像张开的网' },
  { variant: '攵', origin: '攴', gloss: '反文旁（攴=手持杖击打）' },
  { variant: '彳', origin: '行', gloss: '双人旁，与行走、道路有关' },
];

// ── 形近字：词语挖空 + 选项 ─────────────────────────────────
export interface LookalikeItem {
  word: string;          // 含 "__" 挖空的词语，如 "__论"
  pinyin: string;        // 目标字读音提示
  options: string[];     // 候选形近字
  correct: string;       // 正确字
  explain: string;       // 形近字区分讲解
}

export const LOOKALIKES: LookalikeItem[] = [
  { word: '__论', pinyin: 'biàn', options: ['辩', '辨', '辫', '瓣'], correct: '辩', explain: '辩＝用言语争论（辩论）；辨＝区分（分辨）；辫＝辫子（纟）；瓣＝花瓣（瓜）。' },
  { word: '分__', pinyin: 'biàn', options: ['辨', '辩', '辫', '瓣'], correct: '辨', explain: '分辨＝区分开来，故用「辨」；辨中间从「刀」表剖分。' },
  { word: '本__倒置', pinyin: 'mò', options: ['末', '未'], correct: '末', explain: '末＝树梢、末端（本末）；未＝还没有（未来）。' },
  { word: '__来', pinyin: 'wèi', options: ['未', '末', '本'], correct: '未', explain: '未来＝还没有到来，故用「未」。' },
  { word: '战__', pinyin: 'shì', options: ['士', '土'], correct: '士', explain: '士＝士兵、有知识的人；土＝泥土。' },
  { word: '泥__', pinyin: 'tǔ', options: ['土', '士'], correct: '土', explain: '泥土、土地用「土」。' },
  { word: '__经', pinyin: 'yǐ', options: ['已', '己', '巳'], correct: '已', explain: '已＝已经（半开口）；己＝自己（全开口）；巳＝地支之一（全闭口）。' },
  { word: '自__', pinyin: 'jǐ', options: ['己', '已', '巳'], correct: '己', explain: '自己、舍己为人用「己」。' },
  { word: '打__', pinyin: 'zhé', options: ['折', '拆'], correct: '折', explain: '折＝断、弯曲、折扣；拆＝拆开、拆除。' },
  { word: '__除', pinyin: 'chāi', options: ['拆', '折'], correct: '拆', explain: '拆除、拆开用「拆」，比「折」多一点。' },
  { word: '眼__', pinyin: 'jīng', options: ['睛', '晴', '情', '清'], correct: '睛', explain: '睛＝眼睛（目）；晴＝晴天（日）；情＝感情（忄）；清＝清水（氵）。' },
  { word: '心__', pinyin: 'qíng', options: ['情', '晴', '睛', '清'], correct: '情', explain: '感情（忄）用「情」。' },
  { word: '干__', pinyin: 'zào', options: ['燥', '躁', '澡'], correct: '燥', explain: '燥＝干燥（火）；躁＝急躁、浮躁（足）；澡＝洗澡（氵）。' },
  { word: '急__', pinyin: 'zào', options: ['躁', '燥', '澡'], correct: '躁', explain: '急躁、躁动与「足」（跳脚）有关，用「躁」。' },
  { word: '蜂__', pinyin: 'mì', options: ['蜜', '密'], correct: '蜜', explain: '蜜＝蜂蜜（虫）；密＝严密、秘密（山）。' },
  { word: '秘__', pinyin: 'mì', options: ['密', '蜜'], correct: '密', explain: '秘密、紧密用「密」。' },
  { word: '一__树', pinyin: 'kē', options: ['棵', '颗'], correct: '棵', explain: '棵＝量词，用于植物（树木）；颗＝量词，用于颗粒状物（一颗星）。' },
  { word: '一__星', pinyin: 'kē', options: ['颗', '棵'], correct: '颗', explain: '颗粒状小物用「颗」（页，指头/圆粒）。' },
  { word: '必__', pinyin: 'xū', options: ['须', '需'], correct: '须', explain: '必须＝一定要（须＝待、当）；需＝需要、需求（雨，万物需雨）。' },
  { word: '__要', pinyin: 'xū', options: ['需', '须'], correct: '需', explain: '需要、需求用「需」（从雨）。' },
];

// ── 易错笔顺字 ─────────────────────────────────────────────
export interface TrickyStroke {
  char: string;
  count: number;
  order?: string;   // 完整笔顺说明（仅对确定笔顺的字填写）
  tip: string;      // 易错点提示
}

export const TRICKY_STROKES: TrickyStroke[] = [
  { char: '火', count: 4, order: '点、撇、撇、捺', tip: '先写左右两点，再写中间的人（撇、捺）。' },
  { char: '山', count: 3, order: '竖、竖折、竖', tip: '先写中间的竖，再写两边。' },
  { char: '水', count: 4, order: '竖钩、横撇、撇、捺', tip: '先写中间竖钩，再左右两边。' },
  { char: '心', count: 4, order: '点、卧钩、点、点', tip: '先点、卧钩，再补两点。' },
  { char: '必', count: 5, order: '点、卧钩、点、撇、点', tip: '与「心」类似先点，中间多一撇。' },
  { char: '为', count: 4, order: '点、撇、横折钩、点', tip: '先点后撇，横折钩，再点。' },
  { char: '及', count: 3, order: '撇、横折折撇、捺', tip: '第一笔是撇，共三画。' },
  { char: '乃', count: 2, order: '横折折折钩、撇', tip: '只有两画，第一笔是折。' },
  { char: '与', count: 3, order: '横、竖折折钩、横', tip: '横、竖折折钩、横，共三画。' },
  { char: '方', count: 4, order: '点、横、横折钩、撇', tip: '先点，第三笔是横折钩。' },
  { char: '万', count: 3, order: '横、横折钩、撇', tip: '横、横折钩、撇，共三画。' },
  { char: '九', count: 2, order: '撇、横折弯钩', tip: '先撇，再横折弯钩。' },
  { char: '匕', count: 2, order: '撇、竖弯钩', tip: '先撇，再竖弯钩。' },
  { char: '长', count: 4, order: '撇、横、竖提、捺', tip: '共四画，注意第三笔是竖提。' },
  { char: '世', count: 5, tip: '共五画，先横，注意竖折的收笔。' },
  { char: '母', count: 5, tip: '共五画，先两个折，最后是点、横、点。' },
  { char: '出', count: 5, tip: '共五画，先竖折，注意不要与「山」混淆。' },
  { char: '凸', count: 5, tip: '共五画，起笔先写竖。' },
];

// ── 笔画数（常见字 → 笔画数） ───────────────────────────────
export interface StrokeCount { char: string; count: number; }

export const STROKE_COUNTS: StrokeCount[] = [
  { char: '一', count: 1 }, { char: '二', count: 2 }, { char: '三', count: 3 },
  { char: '四', count: 5 }, { char: '五', count: 4 }, { char: '六', count: 4 },
  { char: '七', count: 2 }, { char: '八', count: 2 }, { char: '九', count: 2 },
  { char: '十', count: 2 }, { char: '人', count: 2 }, { char: '大', count: 3 },
  { char: '天', count: 4 }, { char: '日', count: 4 }, { char: '月', count: 4 },
  { char: '水', count: 4 }, { char: '火', count: 4 }, { char: '山', count: 3 },
  { char: '木', count: 4 }, { char: '口', count: 3 }, { char: '田', count: 5 },
  { char: '中', count: 4 }, { char: '上', count: 3 }, { char: '下', count: 3 },
  { char: '王', count: 4 }, { char: '门', count: 3 }, { char: '马', count: 3 },
  { char: '女', count: 3 }, { char: '子', count: 3 }, { char: '儿', count: 2 },
  { char: '心', count: 4 }, { char: '手', count: 4 }, { char: '白', count: 5 },
  { char: '生', count: 5 }, { char: '本', count: 5 }, { char: '末', count: 5 },
  { char: '东', count: 5 }, { char: '西', count: 6 }, { char: '风', count: 4 },
  { char: '你', count: 7 }, { char: '我', count: 7 }, { char: '他', count: 5 },
  { char: '好', count: 6 }, { char: '学', count: 8 }, { char: '老', count: 6 },
  { char: '师', count: 6 }, { char: '国', count: 8 }, { char: '汉', count: 5 },
  { char: '语', count: 9 }, { char: '明', count: 8 }, { char: '问', count: 6 },
  { char: '花', count: 7 }, { char: '电', count: 5 }, { char: '鸟', count: 5 },
  { char: '力', count: 2 }, { char: '刀', count: 2 }, { char: '又', count: 2 },
  { char: '土', count: 3 }, { char: '士', count: 3 }, { char: '工', count: 3 },
];

// ── 汉字故事：多选问答 ─────────────────────────────────────
export interface StoryItem {
  char: string;
  question: string;
  options: string[];
  correctIndex: number;
  explain: string;
}

export const CHAR_STORIES: StoryItem[] = [
  { char: '日', question: '「日」字的本义是什么？', options: ['太阳', '月亮', '眼睛', '种子'], correctIndex: 0, explain: '「日」是象形字，像圆圆的太阳，中间一点表示太阳的光芒或黑子。' },
  { char: '月', question: '「月」字的本义是什么？', options: ['月亮', '肉', '船', '弓'], correctIndex: 0, explain: '「月」像一弯新月。作偏旁的「月」旁其实很多来自「肉」，故又叫「肉月旁」。' },
  { char: '山', question: '「山」字像什么？', options: ['相连的山峰', '一块石头', '高大的楼房', '波浪'], correctIndex: 0, explain: '「山」是象形字，像三座相连的山峰。' },
  { char: '休', question: '「休」＝亻（人）＋木，表示什么？', options: ['人靠在树旁休息', '人砍树', '人种树', '人爬树'], correctIndex: 0, explain: '「休」由「人」和「木」组成，人靠在树上歇息，就是「休息」。' },
  { char: '明', question: '「明」＝日＋月，表示什么？', options: ['明亮', '时间', '黑夜', '寒冷'], correctIndex: 0, explain: '日月同辉，光线充足，「明」的本义就是明亮。' },
  { char: '森', question: '三个「木」组成「森」，表示什么？', options: ['树木众多', '树根', '一根木头', '柴火'], correctIndex: 0, explain: '三个木叠加表示树木很多，「森」即森林。' },
  { char: '众', question: '三个「人」组成「众」，表示什么？', options: ['很多人', '一个人', '巨人', '坏人'], correctIndex: 0, explain: '三人为「众」，表示众多的人。' },
  { char: '从', question: '「从」像一个人跟着另一个人，表示什么？', options: ['跟随', '反对', '离开', '超越'], correctIndex: 0, explain: '「从」画的是两人前后相随，本义是跟随。' },
  { char: '安', question: '「安」＝宀（房子）＋女，表示什么？', options: ['屋内有女子则安定', '女子有危险', '房子倒塌', '女子外出劳作'], correctIndex: 0, explain: '古人在屋内安稳生活，家里有了女主人即「安」，引申为平安、安定。' },
  { char: '家', question: '「家」＝宀＋豕（猪），反映怎样的观念？', options: ['屋里有猪代表家业安定', '猪圈就是家', '以打猎为生', '以游牧为生'], correctIndex: 0, explain: '「豕」是猪。古代养猪定居是家庭富裕安稳的标志，故「家」字从宀从豕。' },
  { char: '信', question: '「信」＝亻（人）＋言，表示什么？', options: ['人说话要讲信用', '写一封信', '传口信', '邮递员'], correctIndex: 0, explain: '「信」由「人」和「言」组成，人说话讲诚信就是「信」。' },
  { char: '好', question: '「好」＝女＋子，最初表示什么？', options: ['美好', '只有女儿', '女子参军', '子女分离'], correctIndex: 0, explain: '「好」由「女」「子」相合，本义是美好，常含亲睦、佳善之意。' },
  { char: '本', question: '「本」在「木」的根部加一横，指树的哪里？', options: ['树根', '树梢', '树叶', '树干'], correctIndex: 0, explain: '「本」在「木」下加指事符号，指树根，引申为根本、本原。' },
  { char: '末', question: '「末」在「木」的顶部加一横，指树的哪里？', options: ['树梢', '树根', '树皮', '种子'], correctIndex: 0, explain: '「末」在「木」上加指事符号，指树梢，引申为末端、末尾。' },
  { char: '刃', question: '「刃」在「刀」上加一点，指什么？', options: ['刀刃', '刀背', '刀柄', '刀鞘'], correctIndex: 0, explain: '「刃」在刀口处加指事符号，指锋利的刀刃。' },
];

// ── 汉字冷知识：多选问答 ───────────────────────────────────
export interface FactItem {
  question: string;
  options: string[];
  correctIndex: number;
  explain: string;
}

export const FUN_FACTS: FactItem[] = [
  { question: '「尖」＝小＋大，意思是什么？', options: ['上小下大、锐利', '又小又圆', '又高又大', '大小不一'], correctIndex: 0, explain: '「尖」由「小」「大」会意：上小下大，物体末端细小即「尖」。' },
  { question: '「歪」＝不＋正，意思是什么？', options: ['不正、偏斜', '非常正直', '不认真', '不正确'], correctIndex: 0, explain: '「歪」由「不」「正」合体会意，不正即歪。' },
  { question: '「尘」＝小＋土，意思是什么？', options: ['细小的土、灰尘', '小土堆', '土壤', '沙石'], correctIndex: 0, explain: '「尘」由「小」「土」会意，细小的土粒就是灰尘。' },
  { question: '「甭」＝不＋用，意思是什么？', options: ['不用', '不会', '不是', '不明'], correctIndex: 0, explain: '「甭」是「不用」的合音合体字。' },
  { question: '「孬」＝不＋好，意思是什么？', options: ['不好、懦弱', '很好', '不小', '不多'], correctIndex: 0, explain: '「孬」由「不」「好」会意，指不好、怯懦。' },
  { question: '「泪」＝氵＋目，意思是什么？', options: ['眼中的水、眼泪', '雨水', '露珠', '汗水'], correctIndex: 0, explain: '「泪」由「水（氵）」「目」会意，眼中的水即是眼泪。' },
  { question: '三个「水」组成「淼」（miǎo），意思是什么？', options: ['水势浩大', '水流很小', '水面平静', '水很清澈'], correctIndex: 0, explain: '三「水」为「淼」，水多势大的样子。' },
  { question: '「森、众、鑫」这类三叠字共同体现了什么造字特点？', options: ['同体会意，表示数量众多', '纯属装饰', '表示声音', '表示否定'], correctIndex: 0, explain: '把同一个字叠加三次表示「多」：三木=森，三人=众，三金=鑫。' },
  { question: '「册」这个字的字形像什么？', options: ['竹简编成的册子', '一座门', '一扇窗', '一把尺'], correctIndex: 0, explain: '「册」像用绳子把一片片竹简串起来的样子。' },
  { question: '「肝、肺、脑」等字里的「月」旁，其实大多表示什么？', options: ['肉（身体部位）', '月亮', '夜晚', '船'], correctIndex: 0, explain: '这些「月」旁其实是「肉」的变形，叫「肉月旁」，多表身体部位。' },
  { question: '「婚」＝女＋昏，为什么用「昏」？', options: ['古代婚礼常在黄昏举行', '女子昏睡', '黄昏出生', '天气昏沉'], correctIndex: 0, explain: '「婚」从「昏」，因为古人多在黄昏时分迎娶成婚。' },
  { question: '「兵」这个字原本指的是什么？', options: ['武器', '士兵', '军营', '战争'], correctIndex: 0, explain: '「兵」甲骨文像双手持斧（斤），本义是兵器，后引申为持兵器的人（士兵）。' },
];

// ── HSK 分级示例字（单字） ─────────────────────────────────
export interface HskLevel {
  level: number;
  name: string;
  chars: string[];
}

export const HSK_LEVELS: HskLevel[] = [
  { level: 1, name: 'HSK 一级 · 入门', chars: ['我', '你', '他', '她', '是', '不', '人', '大', '小', '上', '下', '中', '天', '水', '火', '山', '口', '女', '子', '好'] },
  { level: 2, name: 'HSK 二级 · 基础', chars: ['白', '百', '忙', '慢', '快', '晚', '早', '晴', '雨', '雪', '病', '药', '身', '体', '睡', '累', '玩', '会', '红', '绿'] },
  { level: 3, name: 'HSK 三级 · 进阶', chars: ['包', '鞋', '帽', '眼', '睛', '耳', '朵', '鼻', '嘴', '牙', '脸', '借', '还', '丢', '忘', '记', '冬', '秋', '夏', '春'] },
  { level: 4, name: 'HSK 四级 · 中阶', chars: ['厨', '房', '浴', '灯', '桌', '椅', '沙', '发', '杯', '碗', '盘', '筷', '刀', '叉', '勺', '锅'] },
  { level: 5, name: 'HSK 五级 · 高阶', chars: ['宁', '静', '寂', '寞', '恋', '慰', '誉', '含', '蓄', '幽', '默', '谦', '虚', '谨', '慎'] },
  { level: 6, name: 'HSK 六级 · 精通', chars: ['惩', '罚', '焕', '辉', '煌', '隆', '诚', '恳', '坦', '率', '渊', '博', '卓', '越', '缅'] },
];