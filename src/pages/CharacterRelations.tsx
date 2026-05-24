import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Info } from 'lucide-react';
import {
  getCharacter,
  getCharacterEnriched,
  loadData,
  loadRelations,
  loadSimpTradMap,
  scoreRelations,
} from '../data/hanziData';
import type { HanziEntry, ScoredRelation } from '../data/types';

type SortKey = 'total' | 'form' | 'sound' | 'meaning';

const SORT_OPTIONS: { key: SortKey; label: string; en: string }[] = [
  { key: 'total', label: '综合', en: 'Overall' },
  { key: 'form', label: '字形', en: 'Form' },
  { key: 'sound', label: '字音', en: 'Sound' },
  { key: 'meaning', label: '字义', en: 'Meaning' },
];

const TAG_COLORS: Record<string, string> = {
  '源流分化': '#C23B2A',
  '反义': '#9B2226',
  '同声旁': '#CA6702',
  '同形旁': '#2D5F8A',
  '同音': '#8B6914',
  '近音': '#A08A5A',
  '构件包含': '#6B7F5E',
  '同部首': '#5A6B8A',
};

export default function CharacterRelations() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const char = searchParams.get('char') || '';

  const [entry, setEntry] = useState<HanziEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [relations, setRelations] = useState<ScoredRelation[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>('total');
  const [showLegend, setShowLegend] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await loadData();
      await loadSimpTradMap();
      await loadRelations();
      if (cancelled) return;
      const e = getCharacterEnriched(char);
      setEntry(e ?? null);
      if (e) setRelations(scoreRelations(char));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [char]);

  const sorted = useMemo(() => {
    const key = sortBy === 'total' ? 'totalScore' : sortBy === 'form' ? 'formScore' : sortBy === 'sound' ? 'soundScore' : 'meaningScore';
    return [...relations].sort((a, b) => b[key] - a[key]);
  }, [relations, sortBy]);

  const goToDetail = (c: string) => {
    navigate(`/detail?char=${encodeURIComponent(c)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F0E8' }}>
        <div className="flex flex-col items-center gap-4">
          <svg className="w-16 h-16" viewBox="0 0 80 80">
            <rect x="10" y="30" width="60" height="4" rx="2" fill="#C23B2A" opacity="0.15" />
            <rect x="20" y="42" width="40" height="4" rx="2" fill="#C23B2A" opacity="0.3" />
            <rect x="15" y="54" width="50" height="4" rx="2" fill="#C23B2A" opacity="0.5" />
            <circle cx="40" cy="40" r="38" fill="none" stroke="#C23B2A" strokeWidth="2" strokeDasharray="240" strokeLinecap="round">
              <animate attributeName="stroke-dashoffset" from="480" to="0" dur="2s" repeatCount="indefinite" />
            </circle>
          </svg>
          <span className="text-sm" style={{ color: '#8B6914', fontFamily: 'Inter' }}>Loading relations...</span>
        </div>
      </div>
    );
  }

  /* ── Not Found ── */
  if (!entry) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4" style={{ background: '#F5F0E8' }}>
        <span className="text-6xl" style={{ fontFamily: '"Ma Shan Zheng", cursive', color: '#C23B2A' }}>{char || '?'}</span>
        <h1 className="text-2xl font-display" style={{ color: '#1A1A18' }}>Character not found</h1>
        <p className="text-sm text-center max-w-md" style={{ color: '#8B6914', fontFamily: 'Inter' }}>
          This character is not yet in our database.
        </p>
        <button onClick={() => navigate('/explore')} className="px-6 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-105" style={{ background: '#C23B2A', color: '#F5F0E8', fontFamily: 'Inter' }}>
          Go to Explorer
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: '#F5F0E8' }}>
      {/* ── Hero ── */}
      <section className="relative px-4 pt-8 pb-10" style={{ background: 'linear-gradient(180deg, #1A1A18 0%, #2D2D2B 100%)' }}>
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 50% 100%, #C23B2A 0%, transparent 60%)' }} />
        <div className="relative max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-xs" style={{ color: 'rgba(245,240,232,0.5)', fontFamily: 'Inter' }}>
            <span className="cursor-pointer hover:text-rice-paper transition-colors" onClick={() => navigate('/')}>Home</span>
            <span>/</span>
            <span className="cursor-pointer hover:text-rice-paper transition-colors" onClick={() => navigate(`/detail?char=${encodeURIComponent(char)}`)}>{char}</span>
            <span>/</span>
            <span style={{ color: '#F5F0E8' }}>Relations</span>
          </div>

          {/* Back button */}
          <button
            onClick={() => navigate(`/detail?char=${encodeURIComponent(char)}`)}
            className="flex items-center gap-1.5 text-xs mb-6 transition-colors hover:opacity-80"
            style={{ color: 'rgba(245,240,232,0.6)', fontFamily: 'Inter' }}
          >
            <ArrowLeft size={14} />
            Back to {char}
          </button>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <span className="font-display-cn leading-none block" style={{ fontSize: 'clamp(4rem, 10vw, 7rem)', color: '#F5F0E8', fontFamily: '"Ma Shan Zheng", cursive', textShadow: '0 4px 30px rgba(194,59,42,0.2)' }}>
              {char}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
              {entry.pinyin.map((p, i) => (
                <span key={i} className="text-lg tracking-wide" style={{ color: '#C4A265', fontFamily: 'Inter' }}>{p}</span>
              ))}
              <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: 'rgba(107,127,94,0.2)', color: '#6B7F5E', fontFamily: 'Inter' }}>
                Radical: {entry.radical}
              </span>
            </div>
            <p className="mt-3 text-base max-w-lg mx-auto" style={{ color: 'rgba(245,240,232,0.75)', fontFamily: 'Inter' }}>
              {entry.definition}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Controls Bar ── */}
      <div className="sticky top-16 z-30 border-b" style={{ background: '#FDFBF6', borderColor: 'rgba(26,26,24,0.08)' }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#8B6914', fontFamily: 'Inter' }}>
              {relations.length} related characters
            </span>
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="flex items-center gap-1 text-xs transition-colors"
              style={{ color: showLegend ? '#C23B2A' : 'rgba(139,105,20,0.5)', fontFamily: 'Inter' }}
              title="Scoring legend"
            >
              <Info size={12} />
              Legend
            </button>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs mr-1" style={{ color: '#8B6914', fontFamily: 'Inter' }}>Sort by:</span>
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className="text-xs px-2.5 py-1 rounded-full transition-all"
                style={{
                  background: sortBy === opt.key ? '#C23B2A' : 'transparent',
                  color: sortBy === opt.key ? '#F5F0E8' : '#8B6914',
                  fontFamily: 'Inter',
                  border: sortBy === opt.key ? '1px solid #C23B2A' : '1px solid transparent',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Legend Panel ── */}
      {showLegend && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden border-b" style={{ background: '#FDFBF6', borderColor: 'rgba(26,26,24,0.08)' }}>
          <div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap gap-5 text-xs" style={{ fontFamily: 'Inter' }}>
            <div className="flex items-start gap-2">
              <div className="w-3 h-3 rounded-sm mt-0.5 flex-shrink-0" style={{ background: '#2D5F8A' }} />
              <div>
                <span className="font-semibold" style={{ color: '#1A1A18' }}>Form 字形 (40%)</span>
                <p className="mt-0.5" style={{ color: '#8B6914' }}>Shared components, radical, phonetic/semantic element match</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-3 h-3 rounded-sm mt-0.5 flex-shrink-0" style={{ background: '#CA6702' }} />
              <div>
                <span className="font-semibold" style={{ color: '#1A1A18' }}>Sound 字音 (35%)</span>
                <p className="mt-0.5" style={{ color: '#8B6914' }}>Exact homophone or near-homophone (same syllable, different tone)</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-3 h-3 rounded-sm mt-0.5 flex-shrink-0" style={{ background: '#6B7F5E' }} />
              <div>
                <span className="font-semibold" style={{ color: '#1A1A18' }}>Meaning 字义 (25%)</span>
                <p className="mt-0.5" style={{ color: '#8B6914' }}>Semantic family, antonym pairs, etymological derivation, shared radical</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Relation Cards ── */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        {sorted.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {sorted.map((rel, i) => {
              const info = getCharacter(rel.character);
              return (
                <motion.button
                  key={rel.character}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.015, 0.3) }}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => goToDetail(rel.character)}
                  className="flex flex-col items-center rounded-xl p-4 text-center transition-all"
                  style={{
                    background: '#FDFBF6',
                    boxShadow: '0 2px 12px rgba(26,26,24,0.06)',
                    border: '1px solid rgba(26,26,24,0.06)',
                  }}
                >
                  {/* Character */}
                  <span className="text-3xl font-display-cn leading-none" style={{ color: '#1A1A18', fontFamily: '"Ma Shan Zheng", cursive' }}>
                    {rel.character}
                  </span>

                  {/* Pinyin + Definition */}
                  <span className="text-[10px] mt-1" style={{ color: '#C4A265', fontFamily: 'Inter' }}>{rel.pinyin}</span>
                  <span className="text-[10px] mt-0.5 line-clamp-1 mb-2" style={{ color: '#8B6914', fontFamily: 'Inter' }}>
                    {(info?.definition || rel.definition).slice(0, 12)}
                  </span>

                  {/* Total Score */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-lg font-bold" style={{ color: '#C23B2A', fontFamily: 'Inter' }}>{rel.totalScore}</span>
                    <span className="text-[9px]" style={{ color: '#8B6914', fontFamily: 'Inter' }}>pts</span>
                  </div>

                  {/* Dimension Bars */}
                  <div className="w-full space-y-0.5 mb-2">
                    <ScoreBar label="形" value={rel.formScore} color="#2D5F8A" />
                    <ScoreBar label="音" value={rel.soundScore} color="#CA6702" />
                    <ScoreBar label="义" value={rel.meaningScore} color="#6B7F5E" />
                  </div>

                  {/* Tags */}
                  {rel.tags.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-0.5 mt-auto">
                      {rel.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-[8px] font-semibold px-1.5 py-px rounded-full"
                          style={{
                            background: (TAG_COLORS[tag] || '#8B6914') + '18',
                            color: TAG_COLORS[tag] || '#8B6914',
                            fontFamily: 'Inter',
                          }}
                        >{tag}</span>
                      ))}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: '#8B6914', fontFamily: 'Inter' }}>No related characters found for {char}.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Mini Score Bar ── */
function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="flex items-center gap-1">
      <span className="text-[9px] w-3 text-right font-medium" style={{ color, fontFamily: 'Inter' }}>{label}</span>
      <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(26,26,24,0.08)' }}>
        <div className="h-1 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
