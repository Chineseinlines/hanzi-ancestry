/**
 * 生成「词语家族」数据：按汉字聚合多字词语，供详情页分类展示。
 *
 * 数据源：
 *   - jieba 词频表（scripts/.data/jieba-dict.txt，MIT）—— 词条筛选与词频排序
 *   - CC-CEDICT（node_modules/cedict-json/cedict.json，CC BY-SA 4.0）—— 拼音 + 英文释义
 *   - chinese-xinhua data/ci.json（MIT，可选，scripts/.data/ci.json）—— 中文释义
 *   - chinese-xinhua data/idiom.json（MIT，scripts/.cache/idiom.json）—— 成语释义/出处/例句
 *
 * 产物：public/word-families.json
 *   { "学": {
 *       "s2": [["学习","xué xí","to learn"], ...],   // 两字词，该字为首字
 *       "e2": [["求学","qiú xué","..."], ...],       // 两字词，该字为尾字
 *       "s3": [...],                                  // 三字词
 *       "s4": [...],                                  // 四字词（不含成语）
 *       "id": [["学而不厌","...","释义","出处","例句"], ...]  // 成语
 *   } }
 *
 * 用法：node scripts/build-word-families.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PUB = path.join(ROOT, 'public');
const CEDICT = path.join(ROOT, 'node_modules/cedict-json/cedict.json');
const JIEBA = path.join(ROOT, 'scripts/.data/jieba-dict.txt');
const CI = path.join(ROOT, 'scripts/.data/ci.json');
const IDIOM = path.join(ROOT, 'scripts/.cache/idiom.json');
const OUT = path.join(PUB, 'word-families.json');

const CAP = { s2: 4, e2: 4, s3: 3, s4: 3, id: 4 };
const GLOSS_MAX = 22;
const ZH_GLOSS_MAX = 24;
const IDIOM_GLOSS_MAX = 28;
const IDIOM_SRC_MAX = 36;
const IDIOM_EX_MAX = 36;
const MIN_WORD_FREQ = 30;

const TONE = {
  a: ['ā', 'á', 'ǎ', 'à'], e: ['ē', 'é', 'ě', 'è'], i: ['ī', 'í', 'ǐ', 'ì'],
  o: ['ō', 'ó', 'ǒ', 'ò'], u: ['ū', 'ú', 'ǔ', 'ù'], 'ü': ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
};

function markSyllable(s) {
  const m = /^([a-zA-Zü:]+)([1-5])$/.exec(s);
  if (!m) return s.toLowerCase();
  const base = m[1].toLowerCase().replace(/u:/g, 'ü').replace(/v/g, 'ü');
  const tone = Number(m[2]);
  if (tone === 5) return base;
  let idx = base.indexOf('a');
  if (idx < 0) idx = base.indexOf('e');
  if (idx < 0 && base.includes('ou')) idx = base.indexOf('o');
  if (idx < 0) {
    for (let i = base.length - 1; i >= 0; i--) {
      if ('iouü'.includes(base[i])) { idx = i; break; }
    }
  }
  if (idx < 0) return base;
  const marks = TONE[base[idx]];
  if (!marks) return base;
  return base.slice(0, idx) + marks[tone - 1] + base.slice(idx + 1);
}

const toDiacritics = (py) => (py || '').trim().split(/\s+/).filter(Boolean).map(markSyllable).join(' ');

/** 清理释义：去引号/空白，截断；「无」视为空 */
function clean(s, max) {
  let t = (s ?? '').replace(/[“”"]/g, '').replace(/\s+/g, ' ').trim();
  if (t === '无' || t === 'none') t = '';
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

function parseJieba() {
  const freq = new Map();
  if (!existsSync(JIEBA)) {
    console.warn('[warn] 缺少 jieba 词频表，排序质量将下降');
    return freq;
  }
  for (const line of readFileSync(JIEBA, 'utf8').split('\n')) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 2) continue;
    const n = Number(parts[1]);
    if (parts[0] && Number.isFinite(n)) freq.set(parts[0], n);
  }
  return freq;
}

/** CEDICT 中应排除的释义类型（专名、异体、缩略、地名标注等） */
const BAD_DEF = /(^|\W)(variant of|old variant|see |see also|abbr\.|abbreviation|surname |japanese|taiwan|hong kong|used in|erhua|CL:|also written|archaic|dialect|\(Tw\)|\(HK\)|\(old\))/i;

function loadCedict() {
  const raw = JSON.parse(readFileSync(CEDICT, 'utf8'));
  const arr = Array.isArray(raw) ? raw : Object.values(raw);
  const words = new Map();
  for (const e of arr) {
    const w = (e.simplified || '').trim();
    if (w.length < 2 || w.length > 4 || words.has(w)) continue;
    const defs = (Array.isArray(e.english) ? e.english : [e.english]).map((d) => String(d || '').trim()).filter(Boolean);
    const def = defs.find((d) => !BAD_DEF.test(d));
    if (!def) continue;
    words.set(w, { p: toDiacritics(e.pinyin || ''), d: clean(def, GLOSS_MAX) });
  }
  return words;
}

function loadCi() {
  const map = new Map();
  if (!existsSync(CI)) return map;
  try {
    const raw = JSON.parse(readFileSync(CI, 'utf8'));
    const arr = Array.isArray(raw) ? raw : Object.values(raw);
    for (const it of arr) {
      const w = String(it.ci ?? it.word ?? it.term ?? '').trim();
      const ex = String(it.explanation ?? it.expl ?? it.def ?? '')
        .replace(/^[\s\u3000]*[①-⑳\d]+[.、．)）]?\s*/, '')
        .trim();
      if (w && ex && !map.has(w)) map.set(w, clean(ex, ZH_GLOSS_MAX));
    }
    console.log(`[data] ci.json — ${map.size} 条中文释义`);
  } catch (err) {
    console.warn(`[warn] ci.json 解析失败，回退英文释义：${err.message}`);
  }
  return map;
}

/** 读取 src/data/idiomStories.ts 中已撰写文化故事的成语键，用于排序加权 */
function loadStoryKeys() {
  const p = path.join(ROOT, 'src/data/idiomStories.ts');
  if (!existsSync(p)) return new Set();
  const txt = readFileSync(p, 'utf8');
  return new Set([...txt.matchAll(/^\s{2}([^\s:]{2,8}):\s*\{/gm)].map((m) => m[1]));
}

function loadIdioms() {
  const arr = JSON.parse(readFileSync(IDIOM, 'utf8'));
  const map = new Map();
  for (const it of arr) {
    const w = (it.word ?? '').trim();
    if (!w || w.length < 3 || w.length > 8 || map.has(w)) continue;
    const e = clean(it.explanation, IDIOM_GLOSS_MAX);
    if (!e) continue;
    map.set(w, { w, p: toDiacritics(it.pinyin), e, s: clean(it.derivation, IDIOM_SRC_MAX), x: clean(it.example, IDIOM_EX_MAX) });
  }
  return map;
}

function main() {
  const commonSet = new Set(JSON.parse(readFileSync(path.join(PUB, 'common-chars.json'), 'utf8')));
  const freq = parseJieba();
  const words = loadCedict();
  const ci = loadCi();
  const idioms = loadIdioms();
  const storyKeys = loadStoryKeys();
  console.log(`[data] jieba ${freq.size} / CEDICT ${words.size} / 成语 ${idioms.size} / 目标汉字 ${commonSet.size} / 文化故事 ${storyKeys.size}`);

  const isCommonWord = (w) => [...w].every((ch) => commonSet.has(ch));
  const f = (w) => freq.get(w) ?? 0;

  /** @type {Map<string, {s2: any[], e2: any[], s3: any[], s4: any[], id: any[]}>} */
  const buckets = new Map();
  const bucketFor = (ch) => {
    let b = buckets.get(ch);
    if (!b) { b = { s2: [], e2: [], s3: [], s4: [], id: [] }; buckets.set(ch, b); }
    return b;
  };

  let used = 0;
  for (const [w, info] of words) {
    if (!isCommonWord(w)) continue;
    const n = f(w);
    if (n < MIN_WORD_FREQ) continue;
    // [词语, 拼音, 中文释义, 英文释义]
    const entry = [w, info.p, ci.get(w) ?? '', info.d ?? ''];
    used++;
    if (w.length === 2) {
      bucketFor(w[0]).s2.push([n, ...entry]);
      bucketFor(w[1]).e2.push([n, ...entry]);
    } else if (w.length === 3) {
      for (const ch of new Set(w)) bucketFor(ch).s3.push([n, ...entry]);
    } else {
      if (idioms.has(w)) continue;
      for (const ch of new Set(w)) bucketFor(ch).s4.push([n, ...entry]);
    }
  }

  for (const [w, it] of idioms) {
    if (!isCommonWord(w)) continue;
    // 已撰写文化故事的成语优先展示；其余按词频排序，无词频者按是否有出处排序
    const n = f(w);
    const score = (storyKeys.has(w) ? 2_000_000 : 0) + (n > 0 ? n : (it.s ? -1 : -2));
    for (const ch of new Set(w)) bucketFor(ch).id.push([score, w, it.p, it.e, it.s, it.x]);
  }

  const out = {};
  const byScore = (a, b) => b[0] - a[0] || a[1].length - b[1].length || a[1].localeCompare(b[1]);
  for (const [ch, b] of buckets) {
    if (!commonSet.has(ch)) continue;
    const take = (list, cap) => list.sort(byScore).slice(0, cap).map((r) => r.slice(1));
    const entry = {};
    for (const [key, cap] of [['s2', CAP.s2], ['e2', CAP.e2], ['s3', CAP.s3], ['s4', CAP.s4]]) {
      const list = take(b[key], cap);
      if (list.length) entry[key] = list;
    }
    const id = take(b.id, CAP.id).map((r) => {
      const t = [...r];
      while (t.length > 3 && !t[t.length - 1]) t.pop();
      return t;
    });
    if (id.length) entry.id = id;
    if (Object.keys(entry).length) out[ch] = entry;
  }

  const json = JSON.stringify(out);
  writeFileSync(OUT, json, 'utf8');

  const chars = Object.keys(out);
  const total = chars.reduce((s, c) => {
    const e = out[c];
    return s + (e.s2?.length ?? 0) + (e.e2?.length ?? 0) + (e.s3?.length ?? 0) + (e.s4?.length ?? 0) + (e.id?.length ?? 0);
  }, 0);
  console.log(`[out] ${path.relative(ROOT, OUT)} — ${chars.length} 汉字 / ${total} 词条 / ${(json.length / 1e6).toFixed(2)} MB`);
  let idSlots = 0, idStory = 0;
  for (const ch of chars) for (const r of (out[ch].id ?? [])) { idSlots++; if (storyKeys.has(r[0])) idStory++; }
  console.log(`[stats] 词频筛选后候选词 ${used} / 释义来源 ${ci.size ? '中文' : '英文'}`);
  console.log(`[stats] 展示成语 ${idSlots} 条，含文化故事 ${idStory} 条`);
  console.log(`[caps] ${JSON.stringify(CAP)}`);
}

main();