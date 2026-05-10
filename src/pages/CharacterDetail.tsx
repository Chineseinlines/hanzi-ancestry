import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  getCharacter,
  getCulturalData,
  getCognates,
  loadData,
  loadCulturalData,
} from '../data/hanziData';
import type { HanziEntry, CognateResult, CulturalData } from '../data/types';
import StrokeOrder from '../components/StrokeOrder';
import GlyphEvolution from '../components/GlyphEvolution';
import CharPuzzleGame from '../components/CharPuzzleGame';

export default function CharacterDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const char = searchParams.get('char') || '';

  const [entry, setEntry] = useState<HanziEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [cultural, setCultural] = useState<CulturalData | null>(null);
  const [cognates, setCognates] = useState<CognateResult[]>([]);
  const [expandedAllusion, setExpandedAllusion] = useState<number | null>(null);

  // Load all data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await loadData();
      await loadCulturalData();
      if (cancelled) return;

      const e = getCharacter(char);
      setEntry(e ?? null);
      setCultural(getCulturalData(char) ?? null);
      if (e) {
        setCognates(getCognates(char, 12));
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [char]);

  const goToDetail = (c: string) => {
    navigate(`/detail?char=${encodeURIComponent(c)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToExplore = () => {
    navigate(`/explore?char=${encodeURIComponent(char)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F0E8' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#C23B2A', borderTopColor: 'transparent' }} />
          <span className="text-sm" style={{ color: '#8B6914', fontFamily: 'Inter' }}>Loading character data...</span>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4" style={{ background: '#F5F0E8' }}>
        <span className="text-6xl" style={{ fontFamily: '"Ma Shan Zheng", cursive', color: '#C23B2A' }}>{char || '?'}</span>
        <h1 className="text-2xl font-display" style={{ color: '#1A1A18' }}>Character not found</h1>
        <p className="text-sm text-center max-w-md" style={{ color: '#8B6914', fontFamily: 'Inter' }}>
          This character is not yet in our database. Try searching for a different character.
        </p>
        <button
          onClick={() => navigate('/explore')}
          className="px-6 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-105"
          style={{ background: '#C23B2A', color: '#F5F0E8', fontFamily: 'Inter' }}
        >
          Go to Explorer
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: '#F5F0E8' }}>
      {/* ── Hero ── */}
      <section
        className="relative px-4 pt-8 pb-12"
        style={{
          background: 'linear-gradient(180deg, #1A1A18 0%, #2D2D2B 100%)',
        }}
      >
        {/* Radial glow */}
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 50% 100%, #C23B2A 0%, transparent 60%)' }} />

        <div className="relative max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-xs" style={{ color: 'rgba(245,240,232,0.5)', fontFamily: 'Inter' }}>
            <span className="cursor-pointer hover:text-rice-paper" onClick={() => navigate('/')}>Home</span>
            <span>/</span>
            <span className="cursor-pointer hover:text-rice-paper" onClick={() => navigate('/explore')}>Explore</span>
            <span>/</span>
            <span style={{ color: '#F5F0E8' }}>{char}</span>
          </div>

          {/* Giant character */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center text-center"
          >
            <span
              className="font-display-cn leading-none"
              style={{
                fontSize: 'clamp(6rem, 15vw, 10rem)',
                color: '#F5F0E8',
                fontFamily: '"Ma Shan Zheng", cursive',
                textShadow: '0 4px 30px rgba(194,59,42,0.2)',
              }}
            >
              {char}
            </span>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              {entry.pinyin.map((p, i) => (
                <span key={i} className="text-lg tracking-wide" style={{ color: '#C4A265', fontFamily: 'Inter' }}>
                  {p}
                </span>
              ))}
              <span
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{ background: 'rgba(107,127,94,0.2)', color: '#6B7F5E', fontFamily: 'Inter' }}
              >
                Radical: {entry.radical}
              </span>
            </div>

            <p className="mt-3 text-base max-w-lg" style={{ color: 'rgba(245,240,232,0.75)', fontFamily: 'Inter' }}>
              {entry.definition}
            </p>

            {/* Etymology hint */}
            {entry.etymologyHint && (
              <p className="mt-4 text-sm italic max-w-md" style={{ color: 'rgba(245,240,232,0.5)', fontFamily: 'Inter' }}>
                {entry.etymologyHint}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Main Content Grid ── */}
      <div className="max-w-5xl mx-auto px-4 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            {/* Glyph Evolution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-6"
              style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}
            >
              <h2 className="text-xl font-display mb-4" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>
                Glyph Evolution
              </h2>
              <GlyphEvolution character={char} />
            </motion.div>

            {/* Stroke Order */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl p-6"
              style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}
            >
              <h2 className="text-xl font-display mb-4" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>
                Stroke Order
              </h2>
              <div className="flex justify-center">
                <StrokeOrder character={char} size={260} />
              </div>
            </motion.div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            {/* Words & Allusions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl p-6"
              style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}
            >
              <h2 className="text-xl font-display mb-4" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>
                Words & Allusions
              </h2>

              {/* Words */}
              {cultural?.words && cultural.words.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#8B6914', fontFamily: 'Inter' }}>
                    Common Words
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {cultural.words.map((w, i) => (
                      <span
                        key={i}
                        className="rounded-lg px-3 py-1.5 text-sm font-serif-cn"
                        style={{ background: 'rgba(107,127,94,0.1)', color: '#6B7F5E', fontFamily: '"Noto Serif SC", serif' }}
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Allusions */}
              {cultural?.allusions && cultural.allusions.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#8B6914', fontFamily: 'Inter' }}>
                    Historical Allusions
                  </h3>
                  <div className="flex flex-col gap-2">
                    {cultural.allusions.map((a, i) => (
                      <button
                        key={i}
                        onClick={() => setExpandedAllusion(expandedAllusion === i ? null : i)}
                        className="text-left rounded-xl p-3 transition-all"
                        style={{
                          background: expandedAllusion === i ? 'rgba(194,59,42,0.08)' : 'rgba(26,26,24,0.03)',
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-sm font-medium mt-0.5" style={{ color: '#C23B2A' }}>{i + 1}.</span>
                          <span className="text-sm leading-relaxed" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>
                            {a}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Evolution text */}
              {cultural?.evolution && (
                <div className="mt-5 pt-5 border-t" style={{ borderColor: 'rgba(26,26,24,0.08)' }}>
                  <h3 className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#8B6914', fontFamily: 'Inter' }}>
                    Etymology
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>
                    {cultural.evolution}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Character Puzzle Game */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <CharPuzzleGame targetChar={char} onNavigate={goToDetail} />
            </motion.div>
          </div>
        </div>

        {/* ── Cognates Section ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 rounded-2xl p-6"
          style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>
              Etymologically Related Characters
            </h2>
            <button
              onClick={goToExplore}
              className="text-sm font-medium transition-all hover:underline"
              style={{ color: '#C23B2A', fontFamily: 'Inter' }}
            >
              View in Network →
            </button>
          </div>

          {cognates.length === 0 ? (
            <p className="text-sm" style={{ color: '#8B6914', fontFamily: 'Inter' }}>
              No etymologically related characters found. This may be a very basic or rare character.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {cognates.map((c) => (
                <motion.button
                  key={c.character}
                  whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(26,26,24,0.1)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => goToDetail(c.character)}
                  className="flex flex-col items-center rounded-xl p-4 text-center transition-all"
                  style={{ background: '#F5F0E8', border: '1px solid rgba(26,26,24,0.06)' }}
                >
                  <span
                    className="text-3xl font-display-cn"
                    style={{ color: '#1A1A18', fontFamily: '"Ma Shan Zheng", cursive' }}
                  >
                    {c.character}
                  </span>
                  <span className="text-xs mt-1" style={{ color: '#C4A265', fontFamily: 'Inter' }}>
                    {c.pinyin}
                  </span>
                  <span className="text-[10px] mt-1 line-clamp-2" style={{ color: '#8B6914', fontFamily: 'Inter' }}>
                    {c.definition}
                  </span>
                  {c.sharedComponents.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1 mt-2">
                      {c.sharedComponents.slice(0, 3).map(comp => (
                        <span
                          key={comp}
                          className="rounded px-1.5 py-0.5 text-[10px]"
                          style={{ background: 'rgba(194,59,42,0.1)', color: '#C23B2A' }}
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
