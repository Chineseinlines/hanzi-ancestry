import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch, BookOpen, ScrollText, Globe, Puzzle, ChevronDown,
} from 'lucide-react';
import {
  getCharacter,
  getCulturalData,
  getCognates,
  decomposeCharacter,
  getTraditionalComponents,
  loadData,
  loadCulturalData,
} from '../data/hanziData';
import type { HanziEntry, CognateResult, CulturalData, DecompositionNode } from '../data/types';
import StrokeOrder from '../components/StrokeOrder';
import GlyphEvolution from '../components/GlyphEvolution';
import CharPuzzleGame from '../components/CharPuzzleGame';
import DecompositionGraph from '../components/DecompositionGraph';

const TABS = [
  { id: 'card', label: '知识卡片', icon: BookOpen },
  { id: 'glyph', label: '字形演变', icon: ScrollText },
  { id: 'decomp', label: '部件拆解', icon: GitBranch },
  { id: 'cognates', label: '关联汉字', icon: Globe },
  { id: 'game', label: '趣味练习', icon: Puzzle },
] as const;

type TabId = (typeof TABS)[number]['id'];

/* ── IDS text helpers ── */
interface IDSLine {
  character: string;
  decomposition: string;
  definition: string;
  depth: number;
  isLast: boolean;
  prefix: string;
}

function collectIDSLines(node: DecompositionNode, depth = 0, prefix = '', isLast = true): IDSLine[] {
  const entry = getCharacter(node.character);
  const lines: IDSLine[] = [
    { character: node.character, decomposition: node.decomposition,
      definition: entry?.definition ?? '', depth, isLast, prefix },
  ];
  if (node.children) {
    node.children.forEach((child, i) => {
      const childIsLast = i === node.children.length - 1;
      const childPrefix = prefix + (isLast ? '   ' : '│  ');
      lines.push(...collectIDSLines(child, depth + 1, childPrefix, childIsLast));
    });
  }
  return lines;
}

export default function CharacterDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const char = searchParams.get('char') || '';

  const [entry, setEntry] = useState<HanziEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [cultural, setCultural] = useState<CulturalData | null>(null);
  const [cognates, setCognates] = useState<CognateResult[]>([]);
  const [expandedAllusion, setExpandedAllusion] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('card');
  const [idsExpanded, setIdsExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setActiveTab('card');
      setIdsExpanded(false);
      await loadData();
      await loadCulturalData();
      if (cancelled) return;
      const e = getCharacter(char);
      setEntry(e ?? null);
      setCultural(getCulturalData(char) ?? null);
      if (e) setCognates(getCognates(char, 12));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [char]);

  const decomposition = useMemo(() => (char ? decomposeCharacter(char) : null), [char]);
  const traditionalComponents = useMemo(() => (char ? getTraditionalComponents(char) : []), [char]);
  const idsLines = useMemo(() => {
    if (!decomposition) return [];
    return collectIDSLines(decomposition);
  }, [decomposition]);

  const goToDetail = (c: string) => {
    navigate(`/detail?char=${encodeURIComponent(c)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goToExplore = () => navigate(`/explore?char=${encodeURIComponent(char)}`);

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
          <span className="text-sm" style={{ color: '#8B6914', fontFamily: 'Inter' }}>Loading character data...</span>
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
          This character is not yet in our database. Try searching for a different character.
        </p>
        <button onClick={() => navigate('/explore')} className="px-6 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-105" style={{ background: '#C23B2A', color: '#F5F0E8', fontFamily: 'Inter' }}>
          Go to Explorer
        </button>
      </div>
    );
  }

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  return (
    <div className="min-h-screen pb-20" style={{ background: '#F5F0E8' }}>
      {/* ── Hero ── */}
      <section className="relative px-4 pt-8 pb-10" style={{ background: 'linear-gradient(180deg, #1A1A18 0%, #2D2D2B 100%)' }}>
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 50% 100%, #C23B2A 0%, transparent 60%)' }} />
        <div className="relative max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-6 text-xs" style={{ color: 'rgba(245,240,232,0.5)', fontFamily: 'Inter' }}>
            <span className="cursor-pointer hover:text-rice-paper transition-colors" onClick={() => navigate('/')}>Home</span>
            <span>/</span>
            <span className="cursor-pointer hover:text-rice-paper transition-colors" onClick={() => navigate('/explore')}>Explore</span>
            <span>/</span>
            <span style={{ color: '#F5F0E8' }}>{char}</span>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <span className="font-display-cn leading-none block" style={{ fontSize: 'clamp(5rem, 12vw, 8rem)', color: '#F5F0E8', fontFamily: '"Ma Shan Zheng", cursive', textShadow: '0 4px 30px rgba(194,59,42,0.2)' }}>
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
            {entry.etymologyHint && (
              <p className="mt-3 text-sm italic max-w-md mx-auto" style={{ color: 'rgba(245,240,232,0.5)', fontFamily: 'Inter' }}>
                {entry.etymologyHint}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Tab Bar ── */}
      <div className="sticky top-16 z-30 border-b" style={{ background: '#FDFBF6', borderColor: 'rgba(26,26,24,0.08)' }}>
        <div className="max-w-5xl mx-auto px-4 overflow-x-auto">
          <div className="flex min-w-max gap-0">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-all duration-200"
                  style={{
                    color: isActive ? '#C23B2A' : '#8B6914',
                    fontFamily: 'Inter, sans-serif',
                    borderBottom: isActive ? '2px solid #C23B2A' : '2px solid transparent',
                  }}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <AnimatePresence mode="wait">
          {/* ── Tab: 知识卡片 ── */}
          {activeTab === 'card' && (
            <motion.div key="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stroke Order */}
                <div className="rounded-2xl p-6" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
                  <h2 className="text-xl font-display mb-4" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>Stroke Order</h2>
                  <div className="flex justify-center">
                    <StrokeOrder character={char} size={260} />
                  </div>
                </div>

                {/* Words & Allusions */}
                <div className="rounded-2xl p-6" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
                  <h2 className="text-xl font-display mb-4" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>Words & Allusions</h2>

                  {cultural?.words && cultural.words.length > 0 && (
                    <div className="mb-5">
                      <h3 className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#8B6914', fontFamily: 'Inter' }}>Common Words</h3>
                      <div className="flex flex-wrap gap-2">
                        {cultural.words.map((w, i) => (
                          <span key={i} className="rounded-lg px-3 py-1.5 text-sm font-serif-cn" style={{ background: 'rgba(107,127,94,0.1)', color: '#6B7F5E', fontFamily: '"Noto Serif SC", serif' }}>{w}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {cultural?.allusions && cultural.allusions.length > 0 && (
                    <div>
                      <h3 className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#8B6914', fontFamily: 'Inter' }}>Historical Allusions</h3>
                      <div className="flex flex-col gap-2">
                        {cultural.allusions.map((a, i) => (
                          <button key={i} onClick={() => setExpandedAllusion(expandedAllusion === i ? null : i)} className="text-left rounded-xl p-3 transition-all" style={{ background: expandedAllusion === i ? 'rgba(194,59,42,0.08)' : 'rgba(26,26,24,0.03)' }}>
                            <div className="flex items-start gap-2">
                              <span className="text-sm font-medium mt-0.5" style={{ color: '#C23B2A' }}>{i + 1}.</span>
                              <span className="text-sm leading-relaxed" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>{a}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Etymology text */}
              {cultural?.evolution && (
                <div className="rounded-2xl p-6" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
                  <h2 className="text-xl font-display mb-3" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>Etymology</h2>
                  <p className="text-sm leading-relaxed" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>{cultural.evolution}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Tab: 字形演变 ── */}
          {activeTab === 'glyph' && (
            <motion.div key="glyph" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <div className="rounded-2xl p-6" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
                <h2 className="text-xl font-display mb-4" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>Glyph Evolution</h2>
                <GlyphEvolution character={char} />
              </div>
            </motion.div>
          )}

          {/* ── Tab: 部件拆解 ── */}
          {activeTab === 'decomp' && (
            <motion.div key="decomp" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="space-y-6">
              {/* Decomposition Graph */}
              {decomposition && (
                <div className="rounded-2xl p-4" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
                  <div className="flex items-center gap-2 mb-2 px-2">
                    <GitBranch size={16} className="text-cinnabar" />
                    <span className="text-sm font-semibold uppercase tracking-[0.06em]" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>Character Decomposition</span>
                    <span className="ml-auto font-serif-cn text-sm" style={{ color: 'rgba(139,105,20,0.6)' }}>拆解图</span>
                  </div>
                  <span className="text-[10px] px-2" style={{ color: 'rgba(139,105,20,0.6)', fontFamily: 'Inter' }}>单击汉字查看详情 · 双击展开系联</span>
                  <div className="h-[380px]">
                    <DecompositionGraph
                      decomposition={decomposition}
                      onNodeClick={(c) => navigate(`/detail?char=${encodeURIComponent(c)}`)}
                      onNodeDoubleClick={(c) => navigate(`/explore?char=${encodeURIComponent(c)}`)}
                    />
                  </div>
                </div>
              )}

              {/* IDS Text Tree */}
              {idsLines.length > 0 && (
                <div className="rounded-2xl p-6" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
                  <button onClick={() => setIdsExpanded(!idsExpanded)} className="flex w-full items-center justify-between text-left">
                    <span className="text-sm font-medium" style={{ color: '#1A1A18', fontFamily: 'Inter' }}>View Full Decomposition Text</span>
                    <ChevronDown size={18} className={`transition-transform duration-300 ${idsExpanded ? 'rotate-180' : ''}`} style={{ color: '#8B6914' }} />
                  </button>
                  <AnimatePresence>
                    {idsExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                        <pre className="mt-4 overflow-x-auto rounded-lg p-4 font-mono text-sm leading-relaxed" style={{ background: '#F5F0E8', whiteSpace: 'pre' }}>
                          {idsLines.map((line, i) => {
                            const indentPx = line.depth * 24;
                            const color = line.depth === 0 ? '#1A1A18' : line.depth === 1 ? '#2D5F8A' : line.depth === 2 ? 'rgba(45,95,138,0.7)' : '#8B6914';
                            return (
                              <div key={`${line.character}-${i}`} style={{ color, paddingLeft: `${indentPx}px` }}>
                                <span style={{ color: 'rgba(139,105,20,0.5)' }}>{line.prefix}{line.depth > 0 && (line.isLast ? '└─ ' : '├─ ')}</span>
                                {line.decomposition && line.decomposition !== '？' && <span style={{ color: 'rgba(139,105,20,0.6)' }}>{line.decomposition} </span>}
                                <span className="font-semibold">{line.character}</span>
                                {line.definition && <span style={{ color: 'rgba(139,105,20,0.6)' }}> — {line.definition}</span>}
                              </div>
                            );
                          })}
                        </pre>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Tab: 关联汉字 ── */}
          {activeTab === 'cognates' && (
            <motion.div key="cognates" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <div className="rounded-2xl p-6" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-display" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>Etymologically Related Characters</h2>
                  <button onClick={goToExplore} className="text-sm font-medium transition-all hover:underline" style={{ color: '#C23B2A', fontFamily: 'Inter' }}>View in Network →</button>
                </div>
                {cognates.length === 0 ? (
                  <p className="text-sm" style={{ color: '#8B6914', fontFamily: 'Inter' }}>No etymologically related characters found. This may be a very basic or rare character.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {cognates.map((c) => (
                      <motion.button key={c.character} whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(26,26,24,0.1)' }} whileTap={{ scale: 0.97 }}
                        onClick={() => goToDetail(c.character)}
                        className="flex flex-col items-center rounded-xl p-4 text-center transition-all"
                        style={{ background: '#F5F0E8', border: '1px solid rgba(26,26,24,0.06)' }}
                      >
                        <span className="text-3xl font-display-cn" style={{ color: '#1A1A18', fontFamily: '"Ma Shan Zheng", cursive' }}>{c.character}</span>
                        <span className="text-xs mt-1" style={{ color: '#C4A265', fontFamily: 'Inter' }}>{c.pinyin}</span>
                        <span className="text-[10px] mt-1 line-clamp-2" style={{ color: '#8B6914', fontFamily: 'Inter' }}>{c.definition}</span>
                        {c.sharedComponents.length > 0 && (
                          <div className="flex flex-wrap justify-center gap-1 mt-2">
                            {c.sharedComponents.slice(0, 3).map(comp => (
                              <span key={comp} className="rounded px-1.5 py-0.5 text-[10px]" style={{ background: 'rgba(194,59,42,0.1)', color: '#C23B2A' }}>{comp}</span>
                            ))}
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Tab: 趣味练习 ── */}
          {activeTab === 'game' && (
            <motion.div key="game" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <CharPuzzleGame targetChar={char} onNavigate={goToDetail} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
