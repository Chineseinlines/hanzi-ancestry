/**
 * Component variant annotations — maps abbreviated/shape-variant forms
 * found in character decompositions back to their etymological radicals.
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
  '忄': {
    original: '心',
    name: '竖心旁',
    description: 'Abbreviated form of 心 (heart), used as a left-side radical in characters about emotions and mental states.',
  },
  '犭': {
    original: '犬',
    name: '反犬旁',
    description: 'Abbreviated form of 犬 (dog), used as a left-side radical in characters naming mammals and animals.',
  },
  '扌': {
    original: '手',
    name: '提手旁',
    description: 'Abbreviated form of 手 (hand), used as a left-side radical in characters describing manual actions.',
  },
  '阝': {
    original: '阜 / 邑',
    name: '双耳旁',
    description: 'Abbreviated form of 阜 (mound, hill) when on the left, or 邑 (city, settlement) when on the right. Context determines which.',
  },
  '王': {
    original: '玉',
    name: '玉字旁',
    description: 'When used as a left-side radical, 王 often represents 玉 (jade) rather than "king", appearing in characters for precious stones and ceremonial objects.',
  },
  '氵': {
    original: '水',
    name: '三点水',
    description: 'Abbreviated form of 水 (water), used as a left-side radical in characters about liquids, rivers, and flowing.',
  },
  '灬': {
    original: '火',
    name: '四点底',
    description: 'Abbreviated form of 火 (fire), used as a bottom radical in characters about heat, cooking, and burning.',
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
  '肚', '肠', '脑', '胸', '臂', '脉', '脂', '腰', '腹',
];

export function getAnnotation(char: string): ComponentAnnotation | null {
  return ANNOTATIONS[char] ?? null;
}

export function getMoonAnnotationByDefinition(parentDefinition: string): ComponentAnnotation | null {
  if (!parentDefinition) return null;
  const lower = parentDefinition.toLowerCase();
  const hasBody = BODY_KEYWORDS.some(kw => lower.includes(kw));
  if (!hasBody) return null;
  return {
    original: '肉',
    name: '肉月旁',
    description: 'This 月 component likely represents 肉 (flesh), not 月 (moon) — it is the "flesh radical" used in characters about body parts and organs.',
  };
}

export function hasAnnotation(char: string): boolean {
  return char in ANNOTATIONS;
}

export function getAllAnnotations(): Record<string, ComponentAnnotation> {
  return { ...ANNOTATIONS };
}
