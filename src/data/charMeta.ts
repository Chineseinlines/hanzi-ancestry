/**
 * 字级元数据：HSK 3.0（《等级标准》）级别、旧版 HSK 级别、现代语料频序。
 * 数据由 scripts/build-char-meta.mjs 生成至 public/char-meta.json。
 */

export interface CharMeta {
  /** GF0025-2021 / HSK 3.0 级别（1-6；79 表示高等 7-9 级） */
  hsk3?: number;
  /** 旧版 HSK 1.0（HSK 1-6）级别 */
  hsk2?: number;
  /** Jun Da 现代汉语语料频序（1 = 最常用） */
  freqRank?: number;
}

interface CharMetaFile {
  fr: string[];
  hsk3: Record<string, string[]>;
  hsk2: Record<string, string[]>;
  v: number;
}

let metaMap: Map<string, CharMeta> | null = null;
let loadPromise: Promise<void> | null = null;

export async function loadCharMeta(): Promise<void> {
  if (metaMap) return;
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}char-meta.json`);
      if (!res.ok) return;
      const raw = (await res.json()) as CharMetaFile;
      const map = new Map<string, CharMeta>();
      raw.fr.forEach((c, i) => {
        map.set(c, { freqRank: i + 1 });
      });
      for (const [lv, chars] of Object.entries(raw.hsk3)) {
        const level = parseInt(lv, 10);
        for (const c of chars) {
          const m = map.get(c) ?? {};
          m.hsk3 = level;
          map.set(c, m);
        }
      }
      for (const [lv, chars] of Object.entries(raw.hsk2)) {
        const level = parseInt(lv, 10);
        for (const c of chars) {
          const m = map.get(c) ?? {};
          m.hsk2 = level;
          map.set(c, m);
        }
      }
      metaMap = map;
    } catch {
      console.warn('char-meta.json not available — HSK/frequency badges disabled');
    }
  })();
  return loadPromise;
}

export function getCharMeta(char: string): CharMeta | undefined {
  return metaMap?.get(char);
}

export const FREQ_TOTAL = 9933;

/** HSK 3.0 级别 → 等次（初/中/高） */
export function hsk3Band(level: number): 'elementary' | 'intermediate' | 'advanced' {
  if (level >= 79) return 'advanced';
  if (level >= 4) return 'intermediate';
  return 'elementary';
}

export function hsk3LevelLabel(level: number): string {
  return level === 79 ? '7-9' : String(level);
}
