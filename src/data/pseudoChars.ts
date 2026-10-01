/**
 * 假字（虚构形声字）语料库
 *
 * 用于「假字猜义猜音」游戏：由合法的表义构件（形旁）与示音构件（声旁）
 * 按左右结构拼合，生成字典中不存在的"假字"，以检验并培养用户对
 * 形声字构形逻辑（形旁表义、声旁示音）的掌握。
 */

export interface SemanticComponent {
  /** 构件本字 */
  base: string;
  /** 居左时的书写形体 */
  left: string;
  /** 义类（中文） */
  category: string;
  /** 义类（英文） */
  categoryEn: string;
}

export interface PhoneticComponent {
  char: string;
  /** 带声调拼音 */
  pinyin: string;
}

/** 可居左的表义构件（形旁）及其义类 */
export const SEMANTIC_COMPONENTS: SemanticComponent[] = [
  { base: '水', left: '氵', category: '与水或液体有关', categoryEn: 'water or liquids' },
  { base: '木', left: '木', category: '与树木、木器有关', categoryEn: 'trees and wood' },
  { base: '言', left: '讠', category: '与言语、说话有关', categoryEn: 'speech and words' },
  { base: '金', left: '钅', category: '与金属有关', categoryEn: 'metals' },
  { base: '心', left: '忄', category: '与心理、情绪有关', categoryEn: 'the mind and emotions' },
  { base: '手', left: '扌', category: '与手的动作有关', categoryEn: 'actions of the hand' },
  { base: '犬', left: '犭', category: '与兽类有关', categoryEn: 'beasts and animals' },
  { base: '火', left: '火', category: '与火、热有关', categoryEn: 'fire and heat' },
  { base: '土', left: '土', category: '与土地、地形有关', categoryEn: 'earth and land' },
  { base: '女', left: '女', category: '与女性、亲属有关', categoryEn: 'women and kinship' },
  { base: '目', left: '目', category: '与眼睛、观看有关', categoryEn: 'the eye and seeing' },
  { base: '石', left: '石', category: '与石头、坚硬物有关', categoryEn: 'stone and hard objects' },
  { base: '虫', left: '虫', category: '与虫类有关', categoryEn: 'insects and worms' },
  { base: '米', left: '米', category: '与粮食有关', categoryEn: 'grain and rice' },
  { base: '口', left: '口', category: '与口、发声有关', categoryEn: 'the mouth and utterance' },
  { base: '食', left: '饣', category: '与饮食有关', categoryEn: 'food and eating' },
  { base: '糸', left: '纟', category: '与丝线、织物有关', categoryEn: 'silk and textiles' },
  { base: '貝', left: '贝', category: '与钱财、交易有关', categoryEn: 'money and trade' },
  { base: '足', left: '足', category: '与脚、行走有关', categoryEn: 'the foot and walking' },
  { base: '車', left: '车', category: '与车辆、运输有关', categoryEn: 'vehicles and transport' },
];

/** 常作声旁的构件及其读音 */
export const PHONETIC_COMPONENTS: PhoneticComponent[] = [
  { char: '可', pinyin: 'kě' },
  { char: '青', pinyin: 'qīng' },
  { char: '工', pinyin: 'gōng' },
  { char: '古', pinyin: 'gǔ' },
  { char: '巴', pinyin: 'bā' },
  { char: '白', pinyin: 'bái' },
  { char: '丁', pinyin: 'dīng' },
  { char: '令', pinyin: 'lìng' },
  { char: '生', pinyin: 'shēng' },
  { char: '相', pinyin: 'xiāng' },
  { char: '分', pinyin: 'fēn' },
  { char: '中', pinyin: 'zhōng' },
  { char: '主', pinyin: 'zhǔ' },
  { char: '羊', pinyin: 'yáng' },
  { char: '交', pinyin: 'jiāo' },
  { char: '尚', pinyin: 'shàng' },
  { char: '各', pinyin: 'gè' },
  { char: '良', pinyin: 'liáng' },
  { char: '方', pinyin: 'fāng' },
  { char: '且', pinyin: 'qiě' },
  { char: '京', pinyin: 'jīng' },
  { char: '里', pinyin: 'lǐ' },
  { char: '未', pinyin: 'wèi' },
  { char: '者', pinyin: 'zhě' },
  { char: '王', pinyin: 'wáng' },
  { char: '高', pinyin: 'gāo' },
  { char: '同', pinyin: 'tóng' },
  { char: '半', pinyin: 'bàn' },
  { char: '央', pinyin: 'yāng' },
  { char: '户', pinyin: 'hù' },
  { char: '反', pinyin: 'fǎn' },
  { char: '戈', pinyin: 'gē' },
  { char: '甘', pinyin: 'gān' },
  { char: '正', pinyin: 'zhèng' },
  { char: '由', pinyin: 'yóu' },
  { char: '争', pinyin: 'zhēng' },
  { char: '牙', pinyin: 'yá' },
  { char: '共', pinyin: 'gòng' },
  { char: '占', pinyin: 'zhàn' },
  { char: '乔', pinyin: 'qiáo' },
];