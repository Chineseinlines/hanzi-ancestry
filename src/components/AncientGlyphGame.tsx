import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Check, X } from 'lucide-react';
import { getCharacter } from '../data/hanziData';
import { COMMON_CHAR_SET } from '../data/commonChars';

const TOTAL_ROUNDS = 10;
const BASE_URL = import.meta.env.BASE_URL;

type GlyphStyle = 'seal' | 'bronze' | 'oracle';

interface GlyphChar { c: string; s: GlyphStyle[]; }

const STYLE_LABEL: Record<GlyphStyle, string> = {
  seal: '小篆',
  bronze: '金文',
  oracle: '甲骨文',
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function charToHex(c: string): string {
  const cp = c.codePointAt(0);
  return cp ? cp.toString(16).toUpperCase() : '';
}

interface Question {
  char: string;
  scriptLabel: string;
  imageUrl: string;
  options: string[];
  correctIndex: number;
}

export default function AncientGlyphGame() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  const generateQuestions = useCallback(async () => {
    setLoading(true);

    // Load pre-verified glyph character list (only chars with real images)
    let glyphChars: GlyphChar[];
    try {
      const resp = await fetch(`${BASE_URL}glyph-chars.json`);
      glyphChars = await resp.json();
    } catch {
      setLoading(false);
      return;
    }

    if (!glyphChars || glyphChars.length < 10) {
      setLoading(false);
      return;
    }

    // Build distractor pool from 3500 common chars that have dict entries
    const distractors: string[] = [];
    for (const ch of COMMON_CHAR_SET) {
      if (getCharacter(ch)) distractors.push(ch);
      if (distractors.length >= 3500) break;
    }

    const pool = shuffle([...glyphChars]);
    const qs: Question[] = [];

    for (const gc of pool) {
      if (qs.length >= TOTAL_ROUNDS) break;
      const ch = gc.c;
      const styles = gc.s;
      const hex = charToHex(ch);
      if (!hex) continue;

      // Pick a random available style
      const style = styles[Math.floor(Math.random() * styles.length)];

      // Build distractors: chars not already used, not the correct answer
      const usedChars = new Set(qs.map(q => q.char));
      const distOpts = shuffle(distractors.filter(d =>
        d !== ch && !usedChars.has(d)
      )).slice(0, 3);
      if (distOpts.length < 3) continue;

      const options = shuffle([ch, ...distOpts]);
      qs.push({
        char: ch,
        scriptLabel: STYLE_LABEL[style],
        imageUrl: `${BASE_URL}glyphs/${style}/${hex}.svg`,
        options,
        correctIndex: options.indexOf(ch),
      });
    }

    setQuestions(qs);
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
    setFinished(false);
    setLoading(false);
  }, []);

  useEffect(() => { generateQuestions(); }, [generateQuestions]);

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
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-charcoal animate-pulse">Loading ancient glyphs...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <p className="text-charcoal">Could not load glyph data.</p>
        <button onClick={generateQuestions} className="rounded-full bg-cinnabar px-4 py-2 text-sm text-white">Retry</button>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="mx-auto max-w-lg px-4 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <p className="text-5xl mb-4">{pct >= 80 ? '🏆' : pct >= 60 ? '👏' : pct >= 40 ? '💪' : '📚'}</p>
          <h2 className="font-display text-3xl font-bold text-ink-black mb-2">{score} / {questions.length}</h2>
          <p className="text-charcoal mb-8">
            {pct >= 80 ? '你是古文字专家！' : pct >= 60 ? '很不错！' : pct >= 40 ? '还行，多看看会有感觉。' : '古文字很难，多练习就会进步的！'}
          </p>
          <button onClick={generateQuestions} className="inline-flex items-center gap-2 rounded-full bg-cinnabar px-6 py-3 text-white font-medium hover:bg-vermilion-light transition-colors">
            <RotateCcw size={16} /> 再来一轮
          </button>
        </motion.div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-charcoal/50">Round {currentQ + 1} / {questions.length}</span>
          <span className="text-xs font-medium text-charcoal/50">{q.scriptLabel}</span>
          <span className="text-xs font-medium text-ink-black">Score: {score}</span>
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
        <p className="text-sm text-charcoal/50 mb-4">这是什么字？</p>
        <div className="mx-auto flex items-center justify-center rounded-2xl overflow-hidden" style={{ maxWidth: 280, minHeight: 200, background: 'linear-gradient(135deg, #F5F0E8 0%, #EDE6D8 100%)', boxShadow: 'inset 0 0 30px rgba(139,105,20,0.08)' }}>
          <img
            src={q.imageUrl}
            alt="Ancient glyph"
            referrerPolicy="no-referrer"
            className="max-h-[180px] max-w-full object-contain p-4"
          />
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
              <span className="font-serif-cn text-3xl font-bold text-ink-black">{opt}</span>
              {answered && isCorrect && <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white"><Check size={12} /></span>}
              {answered && isSelected && !isCorrect && <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-400 text-white"><X size={12} /></span>}
            </motion.button>
          );
        })}
      </div>

      {answered && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-center">
          <p className={`text-sm mb-3 ${selected === q.correctIndex ? 'text-green-600' : 'text-red-500'}`}>
            {selected === q.correctIndex ? 'Correct!' : `Answer: ${q.options[q.correctIndex]}`}
          </p>
          <button onClick={handleNext} className="rounded-full bg-ink-black px-6 py-2.5 text-sm font-medium text-white hover:bg-charcoal transition-colors">
            {currentQ + 1 >= questions.length ? 'View Results' : 'Next'}
          </button>
        </motion.div>
      )}
    </div>
  );
}
