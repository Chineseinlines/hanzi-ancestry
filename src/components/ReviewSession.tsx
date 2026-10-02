import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { getCharacter, getLocalizedDefinition, loadData, numberToMark } from '../data/hanziData';
import { useLanguage } from '../contexts/LanguageContext';
import SpeakButton from './SpeakButton';
import type { Grade } from '../lib/srs';

interface ReviewSessionProps {
  initialQueue: string[];
  onGrade: (char: string, grade: Grade) => void;
  onExit: () => void;
}

const GRADES: { key: Grade; labelKey: string; bg: string }[] = [
  { key: 'again', labelKey: 'wordbook.gradeAgain', bg: '#C23B2A' },
  { key: 'hard', labelKey: 'wordbook.gradeHard', bg: '#B4762A' },
  { key: 'good', labelKey: 'wordbook.gradeGood', bg: '#2D5F8A' },
  { key: 'easy', labelKey: 'wordbook.gradeEasy', bg: '#2F7D5B' },
];

const EMPTY_TALLY: Record<Grade, number> = { again: 0, hard: 0, good: 0, easy: 0 };

/** 生字本复习卡：先回忆、再揭示、最后按掌握程度评级（SM-2）。 */
export default function ReviewSession({ initialQueue, onGrade, onExit }: ReviewSessionProps) {
  const { t, lang } = useLanguage();
  const [queue, setQueue] = useState<string[]>(initialQueue);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [tally, setTally] = useState<Record<Grade, number>>(EMPTY_TALLY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    loadData().then(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const finished = index >= queue.length;
  const char = queue[index];

  const handleGrade = (grade: Grade) => {
    onGrade(char, grade);
    setTally((prev) => ({ ...prev, [grade]: prev[grade] + 1 }));
    // 「忘记」的卡片重新排入本轮队尾，当日强化
    if (grade === 'again') setQueue((prev) => [...prev, char]);
    setRevealed(false);
    setIndex((n) => n + 1);
  };

  if (finished) {
    const reviewed = Object.values(tally).reduce((s, v) => s + v, 0);
    return (
      <section className="mx-auto max-w-2xl px-4 py-24 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="rounded-3xl border p-10 text-center"
          style={{ background: '#FDFBF6', borderColor: '#E5E0D8' }}
        >
          <p className="text-5xl mb-4">🎉</p>
          <h2 className="text-2xl font-display mb-2" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>
            {t('wordbook.sessionDone')}
          </h2>
          <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
            {t('wordbook.sessionTally', {
              n: reviewed,
              again: tally.again,
              hard: tally.hard,
              good: tally.good,
              easy: tally.easy,
            })}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setQueue(initialQueue);
                setIndex(0);
                setTally(EMPTY_TALLY);
                setRevealed(false);
              }}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: '#2D5F8A' }}
            >
              <RotateCcw size={15} /> {t('wordbook.restart')}
            </button>
            <button
              onClick={onExit}
              className="rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-black/5"
              style={{ borderColor: '#E5E0D8', color: '#1A1A18' }}
            >
              {t('wordbook.backToWordBook')}
            </button>
          </div>
        </motion.div>
      </section>
    );
  }

  const entry = getCharacter(char);
  const pinyin = entry?.pinyin?.length ? entry.pinyin.map(numberToMark).join(' / ') : '';
  const definition = getLocalizedDefinition(entry, lang);
  const progress = Math.round((index / Math.max(queue.length, 1)) * 100);

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70"
          style={{ color: '#6B7280' }}
        >
          <ArrowLeft size={16} /> {t('wordbook.exitReview')}
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: 'rgba(26,26,24,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: '#2D5F8A' }}
            initial={{ width: `${progress}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-xs font-medium tabular-nums" style={{ color: '#9CA3AF' }}>
          {t('wordbook.sessionProgress', { n: index + 1, total: queue.length })}
        </span>
      </div>

      <motion.div
        key={index}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-3xl border p-10 text-center"
        style={{ background: '#FDFBF6', borderColor: '#E5E0D8' }}
      >
        <div className="flex items-center justify-center gap-4">
          <span className="font-display-cn text-7xl" style={{ color: '#1A1A18' }}>
            {char}
          </span>
          <SpeakButton text={char} lang="zh-CN" size={18} />
        </div>

        {ready && pinyin && (
          <p className="mt-5 font-mono text-lg" style={{ color: '#C23B2A' }}>
            {pinyin}
          </p>
        )}

        <div className="mt-6 min-h-[4.5rem]">
          {revealed ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mx-auto max-w-md text-sm leading-relaxed"
              style={{ color: '#44534E' }}
            >
              {ready && definition ? definition : t('wordbook.noDefinition')}
            </motion.p>
          ) : (
            <p className="text-sm" style={{ color: '#9CA3AF' }}>
              {t('wordbook.promptHint')}
            </p>
          )}
        </div>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="mt-4 rounded-xl px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: '#1A1A18' }}
          >
            {t('wordbook.revealAnswer')}
          </button>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {GRADES.map((g) => (
              <button
                key={g.key}
                onClick={() => handleGrade(g.key)}
                className="rounded-xl px-3 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: g.bg }}
              >
                {t(g.labelKey)}
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}