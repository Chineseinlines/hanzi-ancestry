import { zh } from './locales/zh';
import { en } from './locales/en';

export type Locale = 'zh' | 'en';

const dicts = { zh, en } as const;

/**
 * 按点路径从字典取值并做 `{param}` 插值。
 * 键缺失时返回键名本身（开发期 console.warn 暴露遗漏）。
 */
export function translate(
  lang: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const dict = dicts[lang];
  let val: unknown = dict;
  for (const part of key.split('.')) {
    if (val && typeof val === 'object') {
      val = (val as Record<string, unknown>)[part];
    } else {
      val = undefined;
      break;
    }
  }
  if (typeof val !== 'string') {
    if (import.meta.env.DEV) console.warn(`[i18n] missing key: ${key} (${lang})`);
    return key;
  }
  if (params) {
    return val.replace(/\{(\w+)\}/g, (match, k: string) =>
      params[k] !== undefined ? String(params[k]) : match,
    );
  }
  return val;
}

/** 英文模式下标题使用西文衬线字体（Playfair Display），中文用中文书法体。 */
export function headingClass(lang: Locale): string {
  return lang === 'zh' ? 'font-display-cn' : 'font-display';
}
