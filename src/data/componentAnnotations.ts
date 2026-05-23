/**
 * Component variant annotations — maps abbreviated/shape-variant forms
 * found in character decompositions back to their etymological radicals.
 *
 * P0 upgrade: expanded coverage for 同形异义部件 (moon/flesh, fu/yi),
 * plus full 变形偏旁 coverage (亻/刂/冫/礻/衤/饣/纟/艹/辶/钅 etc.)
 */

export interface ComponentAnnotation {
  /** The original radical or character this form derives from */
  original: string;
  /** Chinese name of the original radical */
  name: string;
  /** English description of the transformation */
  description: string;
}

const ANNOTATIONS: Record<string, ComponentAnnotation> = {
  // ── Core deformed radicals (already present, descriptions refined) ──
  '忄': {
    original: '心',
    name: '竖心旁',
    description: 'Abbreviated form of 心 (heart), used as a left-side radical in characters about emotions, thoughts, and mental states (想、情、快、慢). Not an independent character — always a left radical.',
  },
  '犭': {
    original: '犬',
    name: '反犬旁',
    description: 'Abbreviated form of 犬 (dog), used as a left-side radical in characters naming mammals and beasts (狗、猫、狼、猪).',
  },
  '扌': {
    original: '手',
    name: '提手旁',
    description: 'Abbreviated form of 手 (hand), used as a left-side radical in characters describing manual actions (打、拍、推、拉).',
  },
  '阝': {
    original: '阜 / 邑',
    name: '双耳旁',
    description: 'When on the LEFT side of a character (左耳旁): derives from 阜 (mound, hill), used in characters about terrain, elevation, and barriers (阶、险、防、陆). When on the RIGHT side (右耳旁): derives from 邑 (city, settlement), used in characters about places, administrative divisions, and towns (都、郡、郊、邦).',
  },
  '王': {
    original: '玉',
    name: '斜玉旁',
    description: 'When used as a left-side radical, 王 represents 玉 (jade), not "king". Appears in characters for precious stones, ceremonial objects, and valuables (珍、珠、理、瑞). The extra dot of 玉 is omitted to fit the narrow left position.',
  },
  '氵': {
    original: '水',
    name: '三点水',
    description: 'Abbreviated form of 水 (water), used as a left-side radical in characters about liquids, rivers, flowing, and moisture (河、海、洗、酒).',
  },
  '灬': {
    original: '火',
    name: '四点底',
    description: 'Abbreviated form of 火 (fire), used as a bottom radical in characters about heat, cooking, and burning (热、煮、煎、熟). The four dots represent flames — NOT water dots.',
  },

  // ── New additions for full coverage ──
  '亻': {
    original: '人',
    name: '单人旁',
    description: 'Abbreviated form of 人 (person), used as a left-side radical in characters about human roles, relationships, and actions (你、他、们、休).',
  },
  '刂': {
    original: '刀',
    name: '立刀旁',
    description: 'Abbreviated form of 刀 (knife), used as a right-side radical in characters about cutting, carving, and sharp tools (刻、利、别、削).',
  },
  '冫': {
    original: '冰',
    name: '两点水',
    description: 'Abbreviated form of 冰 (ice), used as a left radical in characters about cold and freezing (冰、冷、冻、凛). Distinct from 氵(water) — only two dots, not three.',
  },
  '礻': {
    original: '示',
    name: '示字旁',
    description: 'Abbreviated form of 示 (altar, spirit), used as a left-side radical in characters about ritual, worship, blessings, and the supernatural (神、礼、福、祝).',
  },
  '衤': {
    original: '衣',
    name: '衣字旁',
    description: 'Abbreviated form of 衣 (clothing), used as a left-side radical in characters about garments and textiles (裤、裙、衬、袖). 礻(altar) has one dot; 衤(clothing) has two — a common exam trap.',
  },
  '饣': {
    original: '食',
    name: '食字旁',
    description: 'Simplified abbreviated form of 食 (food, eat), used as a left-side radical in characters about meals, hunger, and nourishment (饭、饿、饱、饺).',
  },
  '纟': {
    original: '糸',
    name: '绞丝旁',
    description: 'Simplified abbreviated form of 糸 (silk thread), used as a left-side radical in characters about textiles, binding, and thread (线、红、细、经).',
  },
  '艹': {
    original: '艸',
    name: '草字头',
    description: 'Abbreviated form of 艸 (grass), used as a top radical in characters about plants, herbs, and vegetation (花、草、药、茶).',
  },
  '辶': {
    original: '辵',
    name: '走之底',
    description: 'Abbreviated form of 辵 (walk, move), used as a bottom-left wrapping radical in characters about movement, distance, and travel (过、远、进、道).',
  },
  '钅': {
    original: '金',
    name: '金字旁',
    description: 'Simplified abbreviated form of 金 (metal, gold), used as a left-side radical in characters about metals and metal objects (铁、银、钱、针).',
  },
  '贝': {
    original: '貝',
    name: '贝字旁（简写）',
    description: 'Simplified form of 貝 (shell, currency). In ancient China, cowrie shells were used as money, so this radical appears in characters about wealth, trade, and value (财、货、贵、购).',
  },
  '门': {
    original: '門',
    name: '门字框（简写）',
    description: 'Simplified form of 門 (gate, door), used as a surrounding radical in characters about doors, spaces, and access (间、闭、闻、问).',
  },
  '马': {
    original: '馬',
    name: '马字旁（简写）',
    description: 'Simplified form of 馬 (horse), used as a left-side radical in characters about horses and riding (骑、驾、骏、骄).',
  },
  '车': {
    original: '車',
    name: '车字旁（简写）',
    description: 'Simplified form of 車 (vehicle, cart), used as a left-side radical in characters about wheeled transport (轮、辆、转、轻).',
  },
  '见': {
    original: '見',
    name: '见字旁（简写）',
    description: 'Simplified form of 見 (see), used in characters about vision and perception (视、觉、规、览).',
  },
  '页': {
    original: '頁',
    name: '页字旁（简写）',
    description: 'Simplified form of 頁 (head, page), used as a right-side radical in characters about the head and face (顶、项、颜、领).',
  },
};

/**
 * 月 appears as 肉 in left-side position (body parts), and as 月 (moon) elsewhere.
 * We detect this heuristically by checking if the parent character's definition
 * relates to body/flesh.
 */
const BODY_KEYWORDS = [
  'muscle', 'flesh', 'body', 'skin', 'organ', 'liver', 'lung',
  'kidney', 'limb', 'leg', 'arm', 'chest', 'stomach', 'belly',
  'intestine', 'brain', 'blood', 'bone', 'fat', 'tendon',
  '肌', '肉', '肤', '脏', '肝', '肺', '肾', '腿', '脚', '脸',
  '肚', '肠', '脑', '胸', '臂', '脉', '脂', '腰', '腹', '背',
  '膏', '肥', '胖', '脖', '腕', '膝', '肘', '肋',
];

const MOON_ANNOTATION: ComponentAnnotation = {
  original: '肉',
  name: '肉月旁',
  description: 'This 月 component represents 肉 (flesh), not 月 (moon). It is the "flesh radical" used in characters about body parts and organs (肚、肤、肾、背). All characters containing this radical relate to the human body, muscles, or organs.',
};

const MOON_TRUE_ANNOTATION: ComponentAnnotation = {
  original: '月',
  name: '月亮部',
  description: 'This 月 component genuinely represents 月 (moon), used in characters about light, time, and celestial phenomena (明、朗、朝、期). Distinct from 肉月旁 which represents flesh/body parts.',
};

export function getAnnotation(char: string): ComponentAnnotation | null {
  return ANNOTATIONS[char] ?? null;
}

/**
 * Detect whether 月 means "moon" or "flesh" based on parent character context.
 * Returns the appropriate annotation for display.
 */
export function getMoonAnnotation(parentDefinition: string, _position?: 'left' | 'right' | 'bottom' | 'top'): ComponentAnnotation | null {
  if (!parentDefinition) return null;
  const lower = parentDefinition.toLowerCase();
  const hasBody = BODY_KEYWORDS.some(kw => lower.includes(kw));
  return hasBody ? MOON_ANNOTATION : null;
}

/**
 * Get the "true moon" annotation — for characters where 月 really means moon.
 * Used when we want to explicitly confirm 月 is 月 (not 肉) for clarity.
 */
export function getMoonTrueAnnotation(): ComponentAnnotation {
  return MOON_TRUE_ANNOTATION;
}

/**
 * Detect position-based 阝 meaning: left side = 阜 (terrain), right side = 邑 (city).
 * Caller must provide which side 阝 appears on.
 */
export function getErAnnotation(position: 'left' | 'right'): ComponentAnnotation {
  if (position === 'left') {
    return {
      original: '阜',
      name: '左耳旁（阜部）',
      description: 'Left-side 阝 derives from 阜 (mound, hill). Used in characters about terrain, elevation, slopes, and barriers (阶、险、防、陆、阻). The original pictograph shows阶梯 (steps) on a hillside.',
    };
  }
  return {
    original: '邑',
    name: '右耳旁（邑部）',
    description: 'Right-side 阝 derives from 邑 (city, settlement). Used in characters about places, towns, administrative divisions, and postal stations (都、郡、郊、邦、邮). The original pictograph shows a walled settlement.',
  };
}

export function hasAnnotation(char: string): boolean {
  return char in ANNOTATIONS;
}

export function getAllAnnotations(): Record<string, ComponentAnnotation> {
  return { ...ANNOTATIONS };
}
