/**
 * componentAnnotations.ts 的双语伴生数据：
 * - NAMES_EN: 偏旁名英译（键 = 注解的 original 偏旁字；阝/月 用特殊键区分）
 * - DESCRIPTIONS_ZH: 描述中译（中文版 UI 用，fallback 英文描述）
 */
import type { ComponentAnnotation } from './componentAnnotations';

const NAMES_EN: Record<string, string> = {
  心: 'Heart Radical',
  犬: 'Animal Radical',
  手: 'Hand Radical',
  '阜 / 邑': 'Ear Radical',
  玉: 'Jade Radical',
  水: 'Water Radical',
  火: 'Fire Radical',
  人: 'Person Radical',
  刀: 'Knife Radical',
  冰: 'Ice Radical',
  示: 'Altar Radical',
  衣: 'Clothing Radical',
  食: 'Food Radical',
  糸: 'Silk Radical',
  艸: 'Grass Radical',
  辵: 'Walk Radical',
  金: 'Metal Radical',
  貝: 'Shell Radical',
  門: 'Gate Radical',
  馬: 'Horse Radical',
  車: 'Cart Radical',
  見: 'See Radical',
  頁: 'Page Radical',
  '__er_left__': 'Left Ear Radical (阜)',
  '__er_right__': 'Right Ear Radical (邑)',
  '__moon__': 'Flesh Radical',
  '__moon_true__': 'Moon Radical',
};

const DESCRIPTIONS_ZH: Record<string, string> = {
  心: '「心」的变形写法，作左偏旁，用于表示情感、思想、心理状态的字（想、情、快、慢）。不独立成字——永远作左偏旁。',
  犬: '「犬」的变形写法，作左偏旁，用于表示哺乳动物和野兽的字（狗、猫、狼、猪）。',
  手: '「手」的变形写法，作左偏旁，用于表示手部动作的字（打、拍、推、拉）。',
  '阜 / 邑': '在字左侧时（左耳旁）：源自「阜」（土山、高地），用于表示地形、地势、险阻的字（阶、险、防、陆）。在字右侧时（右耳旁）：源自「邑」（城邑、聚落），用于表示地方、行政区划、城镇的字（都、郡、郊、邦）。',
  玉: '作左偏旁时，「王」表示「玉」（美玉），而非「国王」。出现在表示宝石、礼器、贵重之物的字中（珍、珠、理、瑞）。为适应左侧窄位而省去「玉」的一点。',
  水: '「水」的变形写法，作左偏旁，用于表示液体、河流、流动、湿润的字（河、海、洗、酒）。',
  火: '「火」的变形写法，作底部偏旁，用于表示热、烹饪、燃烧的字（热、煮、煎、熟）。四点表示火焰——不是水滴。',
  人: '「人」的变形写法，作左偏旁，用于表示人物、关系、行为的字（你、他、们、休）。',
  刀: '「刀」的变形写法，作右偏旁，用于表示切割、雕刻、利器的字（刻、利、别、削）。',
  冰: '「冰」的变形写法，作左偏旁，用于表示寒冷、冰冻的字（冰、冷、冻、凛）。与「氵」（水）不同——只有两点，不是三点。',
  示: '「示」（祭台、神灵）的变形写法，作左偏旁，用于表示祭祀、礼拜、祝福、神异的字（神、礼、福、祝）。',
  衣: '「衣」（衣物）的变形写法，作左偏旁，用于表示服装、纺织品的字（裤、裙、衬、袖）。「礻」（祭台）一点、「衤」（衣物）两点——常见考试陷阱。',
  食: '「食」（食物、吃）的简体变形写法，作左偏旁，用于表示餐食、饥饿、营养的字（饭、饿、饱、饺）。',
  糸: '「糸」（丝线）的简体变形写法，作左偏旁，用于表示纺织、绑缚、丝线的字（线、红、细、经）。',
  艸: '「艸」（草）的变形写法，作顶部偏旁，用于表示植物、草药、草木的字（花、草、药、茶）。',
  辵: '「辵」（行走、移动）的变形写法，作左下包围偏旁，用于表示移动、距离、旅行的字（过、远、进、道）。',
  金: '「金」（金属、黄金）的简体变形写法，作左偏旁，用于表示金属和金属制品的字（铁、银、钱、针）。',
  貝: '「貝」（贝壳、货币）的简体写法。古代中国以货贝为钱，故此偏旁出现在表示财富、贸易、价值的字中（财、货、贵、购）。',
  門: '「門」（门户）的简体写法，作包围偏旁，用于表示门、空间、出入的字（间、闭、闻、问）。',
  馬: '「馬」（马）的简体写法，作左偏旁，用于表示马和骑乘的字（骑、驾、骏、骄）。',
  車: '「車」（车、车辆）的简体写法，作左偏旁，用于表示轮式交通的字（轮、辆、转、轻）。',
  見: '「見」（看见）的简体写法，用于表示视觉、感知的字（视、觉、规、览）。',
  頁: '「頁」（头、页）的简体写法，作右偏旁，用于表示头部、面部的字（顶、项、颜、领）。',
  '__er_left__': '左侧的「阝」源自「阜」（土山、高地）。用于表示地形、地势、坡道、险阻的字（阶、险、防、陆、阻）。',
  '__er_right__': '右侧的「阝」源自「邑」（城邑、聚落）。用于表示地方、城镇、行政区划、驿站的字（都、郡、郊、邦、邮）。',
  '__moon__': '此「月」部件表示「肉」（肉体），不是「月」（月亮）。它是用于表示身体部位和器官的「肉月旁」（肚、肤、肾、背）。含此偏旁的字都与人体、肌肉或器官相关。',
  '__moon_true__': '此「月」部件确为「月」（月亮），用于表示光明、时间、天象的字（明、朗、朝、期）。与表示肉体、身体部位的「肉月旁」不同。',
};

/** 取偏旁名的当前语言文案。fallback：原中文名 / 部件字。 */
export function getLocalizedAnnotationName(
  ann: ComponentAnnotation,
  lang: 'zh' | 'en',
): string {
  if (lang === 'zh') return ann.name;
  return NAMES_EN[ann.original] ?? ann.name;
}

/** 取描述的当前语言文案。中文版取中译（缺失回退英文），英文版恒为英文。 */
export function getLocalizedAnnotationDescription(
  ann: ComponentAnnotation,
  lang: 'zh' | 'en',
): string {
  if (lang === 'zh') return DESCRIPTIONS_ZH[ann.original] ?? ann.description;
  return ann.description;
}
