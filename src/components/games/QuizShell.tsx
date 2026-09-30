import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RotateCcw, Trophy } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { saveQuizAttempt } from '../../lib/database';

export interface QuizQuestion {
  prompt: ReactNode;      // 题干（大字、图片或文字）
  hint?: ReactNode;       // 题干下方的小字提示
  options: ReactNode[];   // 选项内容
  correctIndex: number;
  explain?: string;       // 答后讲解
  answerKey?: string;     // 用于成绩记录的正确项文本
}

interface QuizShellProps {
  gameId: string;
  questions: QuizQuestion[];
  onReplay: () => void;
  bigOptions?: boolean;   // 选项为大号汉字
}

// 颜色主题（与站点一致）
const C = {
  ink: '#1A1A18',
  cinnabar: '#C23B2A',
  green: '#6B7F5E',
  gold: '#8B6914',
  rice: '#FDFBF6',
  cream: '#F5F0E8',
};

export default function QuizShell({ gameId, questions, onReplay, bigOptions }: QuizShellProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const resultsRef = useRef<Array<{ questionIndex: number; questionType: string; prompt: string; correctChar: string; userAnswer: string; isCorrect: boolean }>>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[index];
  const answered = selected !== null;
  const total = questions.length;

  useEffect(() => {
    if (finished && user && resultsRef.current.length > 0) {
      saveQuizAttempt(user.id, 'quiz', score, total, resultsRef.current, {
        max_streak: maxStreak,
        modes: [gameId],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: C.rice, boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
        <p className="text-charcoal/60" style={{ fontFamily: 'Inter' }}>{t('quiz.loadError')}</p>
        <button onClick={onReplay} className="mt-4 rounded-full px-5 py-2 text-sm font-medium text-white" style={{ background: C.cinnabar, fontFamily: 'Inter' }}>{t('quiz.playAgain')}</button>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / total) * 100);
    return (
      <div className="rounded-2xl p-6 text-center" style={{ background: C.rice, boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
        <Trophy size={40} className="mx-auto mb-3" style={{ color: '#C4A265' }} />
        <h2 className="font-display text-xl mb-2" style={{ color: C.ink, fontFamily: '"Playfair Display", serif' }}>{score} / {total}</h2>
        <p className="text-sm mb-6" style={{ color: C.gold, fontFamily: 'Inter' }}>
          {pct >= 80 ? t('quiz.excellent') : pct >= 60 ? t('quiz.great') : pct >= 40 ? t('quiz.decent') : t('quiz.keepGoing')}
        </p>
        <button onClick={onReplay} className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-white transition-all hover:scale-105" style={{ background: C.cinnabar, fontFamily: 'Inter' }}>
          <RotateCcw size={16} /> {t('quiz.playAgain')}
        </button>
      </div>
    );
  }

  const handleSelect = (i: number) => {
    if (answered) return;
    setSelected(i);
    const isCorrect = i === q.correctIndex;
    if (isCorrect) {
      setScore(s => s + 1);
      setStreak(s => { const n = s + 1; setMaxStreak(m => Math.max(m, n)); return n; });
    } else {
      setStreak(0);
    }
    const correctLabel = q.answerKey ?? String(q.options[q.correctIndex]);
    const userLabel = String(q.options[i]);
    resultsRef.current.push({
      questionIndex: index,
      questionType: gameId,
      prompt: String(q.prompt ?? '').slice(0, 60),
      correctChar: correctLabel,
      userAnswer: userLabel,
      isCorrect,
    });
  };

  const handleNext = () => {
    if (index + 1 >= total) {
      setFinished(true);
    } else {
      setIndex(i => i + 1);
      setSelected(null);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: C.rice, boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="text-xs font-medium" style={{ color: C.gold, fontFamily: 'Inter' }}>
          {t('quiz.question', { n: index + 1, total })}
          {streak >= 3 && <span className="ml-2" style={{ color: C.cinnabar }}>🔥×{streak}</span>}
        </div>
        <div className="text-sm font-bold" style={{ color: C.cinnabar }}>{t('quiz.score', { n: score })}</div>
      </div>

      {/* Progress bar */}
      <div className="mx-5 mb-4 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(26,26,24,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: C.cinnabar }}
          initial={{ width: `${(index / total) * 100}%` }}
          animate={{ width: `${((index + 1) / total) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.22 }}
          className="px-5 pb-6"
        >
          {/* Prompt */}
          <div className="mb-5 text-center">
            <div className="mb-1">{q.prompt}</div>
            {q.hint && <div className="text-sm" style={{ color: '#8B6914', fontFamily: 'Inter' }}>{q.hint}</div>}
          </div>

          {/* Options */}
          <div className={`grid gap-3 ${bigOptions ? 'grid-cols-2' : optionsGridClass(q.options.length)}`}>
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correctIndex;
              const isSelected = i === selected;
              let cls = 'bg-white hover:bg-cinnabar/5 hover:ring-2 hover:ring-cinnabar/20 shadow-sm';
              if (answered) {
                if (isCorrect) cls = 'bg-green-50 ring-2 ring-green-400';
                else if (isSelected) cls = 'bg-red-50 ring-2 ring-red-300';
                else cls = 'bg-white/60 opacity-50';
              }
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: i * 0.04 }}
                  onClick={() => handleSelect(i)}
                  disabled={answered}
                  className={`relative rounded-xl px-4 py-4 text-center transition-all duration-200 ${cls}`}
                >
                  <span className="inline-flex items-center justify-center w-full">
                    {bigOptions
                      ? <span className="font-serif-cn text-3xl font-bold" style={{ color: C.ink }}>{opt}</span>
                      : <span className="text-base font-medium" style={{ color: C.ink, fontFamily: '"Noto Serif SC", "Inter", sans-serif' }}>{opt}</span>}
                  </span>
                  {answered && isCorrect && <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white"><Check size={12} /></span>}
                  {answered && isSelected && !isCorrect && <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-400 text-white"><X size={12} /></span>}
                </motion.button>
              );
            })}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {answered && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 rounded-xl px-4 py-3"
                style={{ background: selected === q.correctIndex ? 'rgba(107,127,94,0.1)' : 'rgba(194,59,42,0.07)' }}
              >
                <div className="flex items-start gap-2">
                  {selected === q.correctIndex
                    ? <Check size={18} style={{ color: C.green }} />
                    : <X size={18} style={{ color: C.cinnabar }} />}
                  <div className="flex-1">
                    <span className="text-sm font-medium" style={{ color: selected === q.correctIndex ? C.green : C.cinnabar, fontFamily: 'Inter' }}>
                      {selected === q.correctIndex ? t('quiz.correct') : t('quiz.answerIs', { a: q.answerKey ?? String(q.options[q.correctIndex]) })}
                    </span>
                    {q.explain && <p className="mt-1 text-sm leading-relaxed" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>{q.explain}</p>}
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleNext}
                    className="rounded-full px-5 py-2 text-sm font-medium text-white transition-all hover:scale-105"
                    style={{ background: C.ink, fontFamily: 'Inter' }}
                  >
                    {index + 1 >= total ? t('quiz.viewResults') : t('quiz.next')} →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function optionsGridClass(n: number): string {
  if (n <= 2) return 'grid-cols-2';
  if (n === 3) return 'grid-cols-3';
  return 'grid-cols-2 sm:grid-cols-4';
}

export function bigChar(s: string): ReactNode {
  return <span className="inline-block font-display-cn" style={{ fontSize: '4rem', lineHeight: 1.1, color: '#1A1A18', fontFamily: '"Ma Shan Zheng", cursive' }}>{s}</span>;
}

export function midChar(s: string): ReactNode {
  return <span className="inline-block font-display-cn" style={{ fontSize: '2.5rem', lineHeight: 1.1, color: '#1A1A18', fontFamily: '"Ma Shan Zheng", cursive' }}>{s}</span>;
}