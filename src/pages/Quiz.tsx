import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Check, X } from 'lucide-react';
import { loadData, getAllCharacters, numberToMark, stripToneNumber, decomposeCharacter } from '../data/hanziData';
import { COMMON_CHAR_SET } from '../data/commonChars';

// 一级字表 (3500 most common chars), ordered by frequency
const COMMON_3500 = new Set([...COMMON_CHAR_SET].slice(0, 3500));
import type { HanziEntry, DecompositionNode } from '../data/types';

type QuestionType = 'pinyin2char' | 'char2pinyin' | 'ids2char';

interface Question {
  type: QuestionType;
  prompt: string;
  correctChar: string;
  options: string[];
  correctIndex: number;
}

const TOTAL_ROUNDS = 10;

const typeLabels: Record<QuestionType, string> = {
  pinyin2char: '看拼音选字',
  char2pinyin: '看字选拼音',
  ids2char: '看拆解选字',
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function genPinyin2Char(entries: HanziEntry[]): Question | null {
  const candidates = entries.filter(e => e.pinyin.length > 0);
  if (candidates.length < 4) return null;

  const correct = candidates[Math.floor(Math.random() * candidates.length)];
  const displayPinyin = correct.pinyin.map(p => numberToMark(p)).join(' / ');

  const correctPinyinSet = new Set(correct.pinyin.map(p => stripToneNumber(p)));
  const distractors = new Set<string>();
  for (const e of shuffle(candidates.filter(c =>
    c.character !== correct.character &&
    !c.pinyin.some(p => correctPinyinSet.has(stripToneNumber(p)))
  ))) {
    if (distractors.size >= 3) break;
    distractors.add(e.character);
  }

  const options = shuffle([correct.character, ...distractors]);
  return {
    type: 'pinyin2char', prompt: displayPinyin, correctChar: correct.character,
    options, correctIndex: options.indexOf(correct.character),
  };
}

function genChar2Pinyin(entries: HanziEntry[]): Question | null {
  const candidates = entries.filter(e => e.pinyin.length > 0);
  if (candidates.length < 4) return null;

  const correct = candidates[Math.floor(Math.random() * candidates.length)];
  const correctPinyin = correct.pinyin.map(p => numberToMark(p)).join(' / ');

  const distractorPinyins = new Set<string>();
  for (const e of shuffle(candidates.filter(e => e.character !== correct.character))) {
    if (distractorPinyins.size >= 3) break;
    const py = e.pinyin.map(p => numberToMark(p)).join(' / ');
    if (py !== correctPinyin) distractorPinyins.add(py);
  }

  const options = shuffle([correctPinyin, ...distractorPinyins]);
  return {
    type: 'char2pinyin', prompt: correct.character, correctChar: correct.character,
    options, correctIndex: options.indexOf(correctPinyin),
  };
}

function genIds2Char(entries: HanziEntry[]): Question | null {
  const withIds = entries.filter(e => {
    const dec = e.decomposition || '';
    return dec.length > 0 && /^[⿰⿱⿲⿳⿴⿵⿶⿷⿸⿹⿺⿻]/.test(dec);
  });
  if (withIds.length < 4) return null;

  const correct = withIds[Math.floor(Math.random() * withIds.length)];
  const ids = correct.decomposition!;

  const node = decomposeCharacter(correct.character);
  const correctComponents = new Set<string>();
  function collect(c: DecompositionNode) {
    if (c.character) correctComponents.add(c.character);
    c.children.forEach(collect);
  }
  if (node) collect(node);

  const distractors = new Set<string>();
  for (const e of shuffle(withIds.filter(e => e.character !== correct.character))) {
    if (distractors.size >= 3) break;
    try {
      const en = decomposeCharacter(e.character);
      if (!en) continue;
      const comps = new Set<string>();
      function c2(n: DecompositionNode) { if (n.character) comps.add(n.character); n.children.forEach(c2); }
      c2(en);
      if ([...comps].some(c => correctComponents.has(c))) distractors.add(e.character);
    } catch { /* skip */ }
  }
  for (const e of shuffle(withIds.filter(e => !distractors.has(e.character) && e.character !== correct.character))) {
    if (distractors.size >= 3) break;
    distractors.add(e.character);
  }

  const options = shuffle([correct.character, ...distractors]);
  return {
    type: 'ids2char', prompt: ids, correctChar: correct.character,
    options, correctIndex: options.indexOf(correct.character),
  };
}

export default function Quiz() {
  const [entries, setEntries] = useState<HanziEntry[] | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    loadData()
      .then(() => {
        const all = getAllCharacters();
        // Directly use COMMON_CHAR_SET as the question pool — no filtering, just intersection
        const map = new Map(all.map(e => [e.character, e]));
        const pool: HanziEntry[] = [];
        for (const ch of COMMON_3500) {
          const entry = map.get(ch);
          if (entry) pool.push(entry);
        }
        setEntries(pool);
        setLoading(false);
      })
      .catch(() => {
        setLoadError('Failed to load character data.');
        setLoading(false);
      });
  }, []);

  const startQuiz = useCallback(() => {
    if (!entries) return;
    const pool: Question[] = [];
    const gens = [genPinyin2Char, genChar2Pinyin, genIds2Char];
    let attempts = 0;
    while (pool.length < TOTAL_ROUNDS && attempts < 100) {
      attempts++;
      const gen = gens[Math.floor(Math.random() * gens.length)];
      const q = gen(entries);
      if (q) pool.push(q);
    }
    setQuestions(pool);
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
    setFinished(false);
    setStarted(true);
  }, [entries]);

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === questions[currentQ].correctIndex) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentQ + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentQ(c => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-charcoal animate-pulse">Loading question bank...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-cinnabar">{loadError}</p>
      </div>
    );
  }

  if (!started) {
    return (
      <section className="bg-bg-warm py-16 md:py-24 min-h-[70vh]">
        <div className="mx-auto max-w-lg px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="font-display text-4xl font-bold text-ink-black mb-4">汉字题库</h1>
            <p className="text-charcoal mb-2">测试你的汉字知识：拼音、字形、结构拆解</p>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {(['pinyin2char', 'char2pinyin', 'ids2char'] as QuestionType[]).map(t => (
                <span key={t} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-charcoal shadow-sm">{typeLabels[t]}</span>
              ))}
            </div>
            <p className="text-sm text-charcoal/60 mb-6">{TOTAL_ROUNDS} 题 · 即时反馈 · 可反复练习</p>
            <button onClick={startQuiz} className="rounded-full bg-cinnabar px-8 py-3 text-white font-medium hover:bg-vermilion-light transition-colors">
              开始答题
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const emoji = pct >= 90 ? '🏆' : pct >= 70 ? '👏' : pct >= 50 ? '💪' : '📚';
    return (
      <section className="bg-bg-warm py-16 md:py-24 min-h-[70vh]">
        <div className="mx-auto max-w-lg px-4 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
            <p className="text-5xl mb-4">{emoji}</p>
            <h2 className="font-display text-3xl font-bold text-ink-black mb-2">{score} / {questions.length}</h2>
            <p className="text-charcoal mb-8">
              {pct >= 90 ? '太厉害了！你对汉字了如指掌。' : pct >= 70 ? '很不错！继续保持。' : pct >= 50 ? '还不错，再练练会更好。' : '继续加油！多查多练，进步很快。'}
            </p>
            <button onClick={startQuiz} className="inline-flex items-center gap-2 rounded-full bg-cinnabar px-6 py-3 text-white font-medium hover:bg-vermilion-light transition-colors">
              <RotateCcw size={16} /> 再来一轮
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  const q = questions[currentQ];
  if (!q) return null;

  return (
    <section className="bg-bg-warm py-16 md:py-24 min-h-[70vh]">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-charcoal/50">第 {currentQ + 1} / {questions.length} 题</span>
            <span className="text-xs font-medium text-charcoal/50">{typeLabels[q.type]}</span>
            <span className="text-xs font-medium text-ink-black">得分: {score}</span>
          </div>
          <div className="h-1.5 rounded-full bg-charcoal/10 overflow-hidden">
            <motion.div className="h-full rounded-full bg-cinnabar"
              initial={{ width: `${(currentQ / questions.length) * 100}%` }}
              animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <motion.div key={currentQ} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mb-10 text-center">
          <p className="text-sm text-charcoal/50 mb-3">
            {q.type === 'pinyin2char' && '以下拼音对应哪个汉字？'}
            {q.type === 'char2pinyin' && '以下汉字的读音是？'}
            {q.type === 'ids2char' && '以下拆解结构对应哪个汉字？'}
          </p>
          <div className={q.type === 'char2pinyin' ? 'font-display-cn text-5xl text-ink-black' : 'font-mono text-2xl text-cinnabar'}>
            {q.prompt}
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          {q.options.map((opt, i) => {
            const isCorrect = i === q.correctIndex;
            const isSelected = i === selected;
            return (
              <motion.button
                key={`${currentQ}-${i}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                onClick={() => handleSelect(i)}
                disabled={answered}
                className={`relative rounded-xl px-4 py-5 text-center transition-all duration-200
                  ${answered ? isCorrect ? 'bg-green-50 ring-2 ring-green-400' : isSelected ? 'bg-red-50 ring-2 ring-red-300' : 'bg-white/60' : 'bg-white hover:bg-cinnabar/5 hover:ring-2 hover:ring-cinnabar/20 shadow-sm'}
                  ${answered && !isCorrect && !isSelected ? 'opacity-50' : ''}`}
              >
                <span className={q.type === 'char2pinyin' ? 'font-mono text-lg' : 'font-serif-cn text-2xl font-semibold text-ink-black'}>
                  {opt}
                </span>
                {answered && isCorrect && (
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white"><Check size={12} /></span>
                )}
                {answered && isSelected && !isCorrect && (
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-400 text-white"><X size={12} /></span>
                )}
              </motion.button>
            );
          })}
        </div>

        {answered && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-center">
            <p className={`text-sm mb-3 ${selected === q.correctIndex ? 'text-green-600' : 'text-red-500'}`}>
              {selected === q.correctIndex ? '正确！' : `正确答案是: ${q.options[q.correctIndex]}`}
            </p>
            <button onClick={handleNext} className="rounded-full bg-ink-black px-6 py-2.5 text-sm font-medium text-white hover:bg-charcoal transition-colors">
              {currentQ + 1 >= questions.length ? '查看成绩' : '下一题'}
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
