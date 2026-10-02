import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useWordBook } from '../hooks/useWordBook';
import { useSrs } from '../hooks/useSrs';
import { getCharacter } from '../data/hanziData';
import { cardState } from '../lib/srs';
import { useLanguage } from '../contexts/LanguageContext';
import ReviewSession from '../components/ReviewSession';

const STATE_COLOR: Record<string, string> = {
  new: '#9CA3AF',
  due: '#C23B2A',
  learning: '#B4762A',
  mastered: '#2F7D5B',
};

export default function WordBook() {
  const { words, remove } = useWordBook();
  const { store, stats, buildQueue, grade } = useSrs(words);
  const { t } = useLanguage();
  const [queue, setQueue] = useState<string[] | null>(null);

  if (words.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center p-8">
          <div className="text-5xl mb-4">📖</div>
          <h1 className="text-2xl font-display mb-2" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>
            {t('wordbook.yourWordBook')}
          </h1>
          <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
            {t('wordbook.emptyHint')}
          </p>
          <Link
            to="/explore"
            className="inline-block px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: '#2D5F8A' }}
          >
            {t('wordbook.exploreChars')}
          </Link>
        </div>
      </div>
    );
  }

  if (queue) {
    return <ReviewSession initialQueue={queue} onGrade={grade} onExit={() => setQueue(null)} />;
  }

  const startReview = () => {
    const q = buildQueue();
    if (q.length > 0) setQueue(q);
  };

  const dueTotal = stats.due + stats.fresh;
  const statItems: { key: string; label: string; value: number; color: string }[] = [
    { key: 'due', label: t('wordbook.statDue'), value: stats.due, color: STATE_COLOR.due },
    { key: 'fresh', label: t('wordbook.statFresh'), value: stats.fresh, color: STATE_COLOR.new },
    { key: 'learning', label: t('wordbook.statLearning'), value: stats.learning, color: STATE_COLOR.learning },
    { key: 'mastered', label: t('wordbook.statMastered'), value: stats.mastered, color: STATE_COLOR.mastered },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display mb-1" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>
            {t('common.wordBook')}
          </h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>{t('wordbook.charCount', { n: words.length })}</p>
        </div>
        <button
          onClick={startReview}
          disabled={dueTotal === 0}
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: '#2D5F8A' }}
        >
          <Play size={15} /> {dueTotal > 0 ? t('wordbook.startReview', { n: dueTotal }) : t('wordbook.noDue')}
        </button>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statItems.map((s) => (
          <div
            key={s.key}
            className="rounded-2xl border p-4"
            style={{ background: '#FDFBF6', borderColor: '#E5E0D8' }}
          >
            <div className="text-2xl font-semibold tabular-nums" style={{ color: s.color }}>{s.value}</div>
            <div className="mt-1 text-xs" style={{ color: '#6B7280' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
        {words.map(char => {
          const entry = getCharacter(char);
          const state = cardState(store[char]);
          return (
            <div key={char} className="group relative">
              <Link
                to={`/detail?char=${encodeURIComponent(char)}`}
                className="block aspect-square rounded-xl flex flex-col items-center justify-center border transition-all hover:shadow-md"
                style={{ background: '#FDFBF6', borderColor: '#E5E0D8' }}
              >
                <span className="text-2xl font-display-cn" style={{ color: '#1A1A18' }}>{char}</span>
                {entry?.pinyin?.[0] && (
                  <span className="text-[0.6rem] mt-0.5" style={{ color: '#9CA3AF' }}>{entry.pinyin[0]}</span>
                )}
              </Link>
              <span
                className="absolute top-1.5 left-1.5 h-2 w-2 rounded-full"
                style={{ background: STATE_COLOR[state] }}
                title={t(`wordbook.state_${state}`)}
              />
              <button
                onClick={(e) => { e.preventDefault(); remove(char); }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[0.6rem] text-white opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: '#C23B2A' }}
                title={t('wordbook.remove')}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}