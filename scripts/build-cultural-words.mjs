/**
 * 从开源成语数据集生成「词语与典故」填充数据。
 *
 * 数据源：pwxcoo/chinese-xinhua（MIT License）
 *   https://github.com/pwxcoo/chinese-xinhua
 *
 * 产物：public/cultural-words.json
 *   { "国": { "words": ["国泰民安", ...], "allusions": ["国泰民安：……", ...] } }
 *
 * 用法：node scripts/build-cultural-words.mjs
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const IDIOM_URL =
  'https://raw.githubusercontent.com/pwxcoo/chinese-xinhua/master/data/idiom.json';

const ROOT = path.resolve(import.meta.dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const CACHE_DIR = path.join(ROOT, 'scripts', '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'idiom.json');
const OUT_FILE = path.join(PUBLIC_DIR, 'cultural-words.json');

const MAX_WORDS = 6;
const MAX_ALLUSIONS = 3;
const MAX_DERIVATION = 110;

async function loadIdioms() {
  if (existsSync(CACHE_FILE)) {
    const cached = await readFile(CACHE_FILE, 'utf8');
    console.log(`[cache] ${path.relative(ROOT, CACHE_FILE)}`);
    return JSON.parse(stripBom(cached));
  }
  console.log(`[fetch] ${IDIOM_URL}`);
  const res = await fetch(IDIOM_URL);
  if (!res.ok) throw new Error(`idiom.json: HTTP ${res.status}`);
  const text = stripBom(await res.text());
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(CACHE_FILE, text, 'utf8');
  return JSON.parse(text);
}

function stripBom(s) {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

function truncate(s, max) {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

async function main() {
  const idioms = await loadIdioms();
  console.log(`[data] ${idioms.length} idioms`);

  const index = JSON.parse(
    await readFile(path.join(PUBLIC_DIR, 'hanzi-index.json'), 'utf8'),
  );
  const common = JSON.parse(
    await readFile(path.join(PUBLIC_DIR, 'common-chars.json'), 'utf8'),
  );
  const targets = new Set([...Object.keys(index), ...common]);
  console.log(`[data] ${targets.size} target characters`);

  /** @type {Map<string, {word: string, explanation: string, derivation: string}[]>} */
  const buckets = new Map();
  for (const it of idioms) {
    const word = (it.word ?? '').trim();
    if (!word) continue;
    const entry = {
      word,
      explanation: (it.explanation ?? '').trim(),
      derivation: (it.derivation ?? '').trim(),
    };
    for (const ch of new Set([...word])) {
      if (!targets.has(ch)) continue;
      const list = buckets.get(ch);
      if (list) list.push(entry);
      else buckets.set(ch, [entry]);
    }
  }

  const out = {};
  for (const [ch, list] of buckets) {
    const ranked = [...list].sort((a, b) => {
      const da = a.derivation ? 0 : 1;
      const db = b.derivation ? 0 : 1;
      if (da !== db) return da - db;
      if (a.word.length !== b.word.length) return a.word.length - b.word.length;
      return a.word.localeCompare(b.word);
    });

    const words = [];
    const allusions = [];
    const seenWord = new Set();
    for (const it of ranked) {
      if (words.length < MAX_WORDS && !seenWord.has(it.word)) {
        seenWord.add(it.word);
        words.push(it.word);
      }
      if (
        allusions.length < MAX_ALLUSIONS &&
        it.derivation &&
        it.derivation.length >= 6
      ) {
        allusions.push(`${it.word}：${truncate(it.derivation, MAX_DERIVATION)}`);
      }
      if (words.length >= MAX_WORDS && allusions.length >= MAX_ALLUSIONS) break;
    }

    if (words.length || allusions.length) {
      out[ch] = { words, allusions };
    }
  }

  await writeFile(OUT_FILE, JSON.stringify(out), 'utf8');
  const withWords = Object.values(out).filter((e) => e.words.length).length;
  const withAllusions = Object.values(out).filter((e) => e.allusions.length).length;
  console.log(
    `[out] ${path.relative(ROOT, OUT_FILE)} — ${Object.keys(out).length} chars ` +
      `(${withWords} with words, ${withAllusions} with allusions)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});