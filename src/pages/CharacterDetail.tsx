import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch, BookOpen, ScrollText, Globe, Puzzle, ChevronDown, Heart,
} from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import {
  getCharacter,
  getCharacterEnriched,
  getCulturalData,
  getRelatedChars,
  decomposeCharacter,
  loadData,
  loadCulturalData,
  loadShuowen,
  loadSimpTradMap,
  loadRelations,
  getShuowen,
} from '../data/hanziData';
import type { HanziEntry, CulturalData, DecompositionNode, ShuowenEntry, CharRelations } from '../data/types';
import StrokeOrder from '../components/StrokeOrder';
import GlyphEvolution from '../components/GlyphEvolution';
import CharPuzzleGame from '../components/CharPuzzleGame';
import DecompositionGraph from '../components/DecompositionGraph';
import { getAnnotation, getMoonAnnotation, getMoonTrueAnnotation, type ComponentAnnotation } from '../data/componentAnnotations';
import { ratePhonetic, PHONETIC_COLORS, type PhoneticRatingResult } from '../data/phoneticRating';
import { getGhostSuggestion } from '../data/ghostComponents';

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

function getEnglishSummary(shuowen: ShuowenEntry, entry: HanziEntry | null): string {
  const parts: string[] = [];
  const sb = shuowen.sixBooks;
  if (sb === '象形') parts.push('Pictograph (象形) — depicts the object\'s form');
  else if (sb === '指事') parts.push('Ideogram (指事) — abstract symbol indicating a concept');
  else if (sb === '会意') parts.push('Compound ideograph (会意) — combines multiple components for meaning');
  else if (sb === '形声') parts.push('Phono-semantic compound (形声) — semantic component hints at meaning, phonetic at sound');
  else if (sb === '转注') parts.push('Transferred cognate (转注) — characters sharing meaning/pronunciation');
  else if (sb === '假借') parts.push('Phonetic loan (假借) — borrowed for its sound');
  else if (sb) parts.push(sb);

  if (shuowen.structure && shuowen.structure !== sb) {
    parts.push(`Structure: ${shuowen.structure}`);
  }

  if (entry?.etymology) {
    const ety = entry.etymology;
    if (ety.semantic) parts.push(`Semantic component: ${ety.semantic}`);
    if (ety.phonetic) parts.push(`Phonetic component: ${ety.phonetic}`);
  }

  return parts.join('. ') + (parts.length > 0 ? '.' : '');
}

export default function CharacterDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const char = searchParams.get('char') || '';

  const [entry, setEntry] = useState<HanziEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [cultural, setCultural] = useState<CulturalData | null>(null);
  const [relations, setRelations] = useState<CharRelations | null>(null);
  const [shuowen, setShuowen] = useState<ShuowenEntry | null>(null);
  const [expandedAllusion, setExpandedAllusion] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('card');
  const [idsExpanded, setIdsExpanded] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setActiveTab('card');
      setIdsExpanded(true);
      await loadData();
      await loadCulturalData();
      await loadShuowen();
      await loadSimpTradMap();
      await loadRelations();
      if (cancelled) return;
      const e = getCharacterEnriched(char);
      setEntry(e ?? null);
      setCultural(getCulturalData(char) ?? null);
      setShuowen(getShuowen(char) ?? null);
      if (e) setRelations(getRelatedChars(char) as CharRelations | null);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [char]);

  const decomposition = useMemo(() => (char ? decomposeCharacter(char) : null), [char]);
  const idsLines = useMemo(() => {
    if (!decomposition) return [];
    return collectIDSLines(decomposition);
  }, [decomposition]);

  // Collect component annotations from decomposition tree
  const componentAnnotations = useMemo(() => {
    if (!decomposition) return [];
    const results: { component: string; annotation: ComponentAnnotation }[] = [];
    const seen = new Set<string>();

    function walk(node: DecompositionNode) {
      for (const child of node.children) {
        if (seen.has(child.character)) continue;
        seen.add(child.character);

        const ann = getAnnotation(child.character);
        if (ann) {
          results.push({ component: child.character, annotation: ann });
        } else if (child.character === '月') {
          const moonAnn = getMoonAnnotation(entry?.definition ?? '');
          if (moonAnn) {
            results.push({ component: child.character, annotation: moonAnn });
          } else {
            // Explicitly mark as true moon for clarity
            results.push({ component: child.character, annotation: getMoonTrueAnnotation() });
          }
        }
        // 阝: positional阜/邑 detection not currently implemented from IDS alone
        walk(child);
      }
    }
    walk(decomposition);
    return results;
  }, [decomposition, entry]);

  // Phonetic rating for pictophonetic characters
  const phoneticRating = useMemo((): PhoneticRatingResult | null => {
    if (!entry?.etymology || entry.etymology.type !== 'pictophonetic') return null;
    const phonetic = entry.etymology.phonetic;
    if (!phonetic) return null;
    const phoneticEntry = getCharacter(phonetic);
    if (!phoneticEntry?.pinyin?.[0]) return null;
    return ratePhonetic(entry.pinyin[0], phoneticEntry.pinyin[0]);
  }, [entry]);

  // Ghost component detection for the current character
  const ghostInfo = useMemo(() => {
    if (!char) return null;
    return getGhostSuggestion(char);
  }, [char]);

  // Ghost annotations for child components
  const ghostComponentAnnotations = useMemo(() => {
    if (!decomposition) return [];
    const results: { component: string; suggestion: string }[] = [];
    const seen = new Set<string>();

    function walk(node: DecompositionNode) {
      for (const child of node.children) {
        if (seen.has(child.character)) continue;
        seen.add(child.character);
        const sug = getGhostSuggestion(child.character);
        if (sug) {
          results.push({ component: child.character, suggestion: sug });
        }
        walk(child);
      }
    }
    walk(decomposition);
    return results;
  }, [decomposition]);

  const { isFavorite, toggleFavorite } = useFavorites();
  const charIsFav = char ? isFavorite(char) : false;

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
              <button
                onClick={() => toggleFavorite(char)}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all hover:scale-105"
                style={{
                  background: charIsFav ? 'rgba(194,59,42,0.2)' : 'rgba(245,240,232,0.1)',
                  color: charIsFav ? '#C23B2A' : 'rgba(245,240,232,0.5)',
                  fontFamily: 'Inter',
                }}
                title={charIsFav ? '取消收藏' : '收藏'}
              >
                <Heart size={12} fill={charIsFav ? '#C23B2A' : 'none'} />
                {charIsFav ? '已收藏' : '收藏'}
              </button>
            </div>
            <p className="mt-3 text-base max-w-lg mx-auto" style={{ color: 'rgba(245,240,232,0.75)', fontFamily: 'Inter' }}>
              {entry.definition}
            </p>
            {entry.etymologyHint && (
              <p className="mt-3 text-sm italic max-w-md mx-auto" style={{ color: 'rgba(245,240,232,0.5)', fontFamily: 'Inter' }}>
                {entry.etymologyHint}
              </p>
            )}

            {/* Phonetic Rating Badge */}
            {phoneticRating && (
              <div className="mt-3 flex justify-center">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    background: PHONETIC_COLORS[phoneticRating.rating].bg,
                    color: PHONETIC_COLORS[phoneticRating.rating].text,
                    border: `1px solid ${PHONETIC_COLORS[phoneticRating.rating].border}`,
                    fontFamily: 'Inter, sans-serif',
                  }}
                  title={phoneticRating.tooltip}
                >
                  声旁可靠性: {phoneticRating.label}
                  <span className="font-mono text-[0.6875rem] opacity-70">
                    ({phoneticRating.charPinyin} ← {phoneticRating.phoneticPinyin})
                  </span>
                </span>
              </div>
            )}

            {/* Ghost Component Warning */}
            {ghostInfo && (
              <div className="mt-3 flex justify-center">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs"
                  style={{
                    background: 'rgba(176,173,165,0.2)',
                    color: 'rgba(245,240,232,0.8)',
                    border: '1px solid rgba(176,173,165,0.3)',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {ghostInfo}
                </span>
              </div>
            )}

            {/* Traditional form data source indicator */}
            {entry?.traditional && (
              <div className="mt-3 flex justify-center">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs"
                  style={{
                    background: 'rgba(139,105,20,0.15)',
                    color: '#C4A265',
                    border: '1px solid rgba(196,162,101,0.3)',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  字形 & 字源数据来自繁体: {entry.traditional}
                </span>
              </div>
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

              {/* Shuowen structure & classification */}
              {shuowen && (shuowen.structure || shuowen.sixBooks || shuowen.shuowen) && (
                <div className="rounded-2xl p-6" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-xl font-display" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>说文解字</h2>
                    <span className="text-[0.625rem] px-2 py-0.5 rounded-full" style={{ background: 'rgba(194,59,42,0.1)', color: '#C23B2A', fontFamily: 'Inter' }}>Shuowen</span>
                  </div>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {shuowen.structure && (
                      <span className="text-sm px-3 py-1.5 rounded-lg font-medium" style={{ background: 'rgba(45,95,138,0.08)', color: '#2D5F8A', fontFamily: 'Inter', border: '1px solid rgba(45,95,138,0.15)' }}>
                        字形结构: {shuowen.structure}
                      </span>
                    )}
                    {shuowen.sixBooks && (
                      <span className="text-sm px-3 py-1.5 rounded-lg font-medium" style={{ background: 'rgba(107,127,94,0.1)', color: '#6B7F5E', fontFamily: 'Inter', border: '1px solid rgba(107,127,94,0.2)' }}>
                        六书分类: {shuowen.sixBooks}
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>
                    {getEnglishSummary(shuowen, entry)}
                  </p>
                  {shuowen.shuowen && (
                    <details className="mt-3">
                      <summary className="text-xs font-medium cursor-pointer" style={{ color: '#C23B2A', fontFamily: 'Inter' }}>查看原文</summary>
                      <p className="mt-2 text-xs leading-relaxed font-serif-cn rounded-lg p-3 max-h-40 overflow-y-auto" style={{ background: 'rgba(245,240,232,0.5)', color: '#5A5548' }}>
                        {shuowen.shuowen}
                      </p>
                    </details>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Tab: 字形演变 ── */}
          {activeTab === 'glyph' && (
            <motion.div key="glyph" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <div className="rounded-2xl p-6" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
                <h2 className="text-xl font-display mb-4" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>Glyph Evolution</h2>
                <GlyphEvolution character={char} traditional={entry?.traditional} shuowen={shuowen} />
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

              {/* Component Annotations */}
              {componentAnnotations.length > 0 && (
                <div className="rounded-2xl p-6" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.06em] mb-4" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>
                    Component Notes
                    <span className="ml-2 font-serif-cn text-xs font-normal normal-case" style={{ color: 'rgba(139,105,20,0.6)' }}>部件注释</span>
                  </h2>
                  <div className="flex flex-col gap-3">
                    {componentAnnotations.map(({ component, annotation }) => (
                      <div key={component} className="flex items-start gap-3 rounded-xl p-4 transition-all hover:shadow-md" style={{ background: 'rgba(196,162,101,0.08)', border: '1px solid rgba(196,162,101,0.15)' }}>
                        <span className="font-display-cn text-2xl flex-shrink-0" style={{ color: '#C23B2A', fontFamily: '"Ma Shan Zheng", cursive' }}>
                          {component}
                        </span>
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold" style={{ color: '#1A1A18', fontFamily: 'Inter' }}>
                              {annotation.name}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(194,59,42,0.12)', color: '#C23B2A', fontFamily: 'Inter' }}>
                              {component} → {annotation.original}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: '#8B6914', fontFamily: 'Inter' }}>
                            {annotation.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Ghost Component Annotations within the same card */}
                  {ghostComponentAnnotations.length > 0 && (
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(176,173,165,0.3)' }}>
                      <h3 className="text-xs font-semibold uppercase tracking-[0.06em] mb-3" style={{ color: '#A39E93', fontFamily: 'Inter' }}>
                        Simplified Ghost Components
                        <span className="ml-2 font-serif-cn text-xs font-normal normal-case" style={{ color: 'rgba(176,173,165,0.8)' }}>简体幽灵部件</span>
                      </h3>
                      <div className="flex flex-col gap-2">
                        {ghostComponentAnnotations.map(({ component, suggestion }) => (
                          <div key={component} className="flex items-start gap-3 rounded-xl p-3" style={{ background: 'rgba(176,173,165,0.06)', border: '1px solid rgba(176,173,165,0.15)' }}>
                            <span className="font-display-cn text-xl flex-shrink-0" style={{ color: '#A39E93', fontFamily: '"Ma Shan Zheng", cursive' }}>
                              {component}
                            </span>
                            <p className="text-xs leading-relaxed" style={{ color: '#8B8680', fontFamily: 'Inter' }}>
                              {suggestion}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Standalone ghost component annotations when no regular annotations exist */}
              {componentAnnotations.length === 0 && ghostComponentAnnotations.length > 0 && (
                <div className="rounded-2xl p-6" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.06em] mb-4" style={{ color: '#A39E93', fontFamily: 'Inter' }}>
                    Simplified Ghost Components
                    <span className="ml-2 font-serif-cn text-xs font-normal normal-case" style={{ color: 'rgba(176,173,165,0.8)' }}>简体幽灵部件</span>
                  </h2>
                  <div className="flex flex-col gap-2">
                    {ghostComponentAnnotations.map(({ component, suggestion }) => (
                      <div key={component} className="flex items-start gap-3 rounded-xl p-3" style={{ background: 'rgba(176,173,165,0.06)', border: '1px solid rgba(176,173,165,0.15)' }}>
                        <span className="font-display-cn text-xl flex-shrink-0" style={{ color: '#A39E93', fontFamily: '"Ma Shan Zheng", cursive' }}>
                          {component}
                        </span>
                        <p className="text-xs leading-relaxed" style={{ color: '#8B8680', fontFamily: 'Inter' }}>
                          {suggestion}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* IDS Text Tree */}
              {idsLines.length > 0 && (
                <div
                  className="rounded-2xl p-5"
                  style={{
                    background: '#FDFBF6',
                    boxShadow: '0 4px 20px rgba(26,26,24,0.06)',
                    borderLeft: '3px solid #C23B2A',
                  }}
                >
                  <button onClick={() => setIdsExpanded(!idsExpanded)} className="flex w-full items-center justify-between text-left">
                    <div className="flex items-center gap-2">
                      <GitBranch size={14} className="text-cinnabar" />
                      <span className="text-sm font-semibold uppercase tracking-[0.06em]" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>
                        Full Decomposition Tree
                      </span>
                      <span className="font-serif-cn text-xs" style={{ color: 'rgba(139,105,20,0.5)' }}>完整拆解树</span>
                    </div>
                    <ChevronDown size={18} className={`transition-transform duration-300 ${idsExpanded ? 'rotate-180' : ''}`} style={{ color: '#C23B2A' }} />
                  </button>
                  <AnimatePresence>
                    {idsExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                        <pre className="mt-3 overflow-x-auto rounded-lg p-4 font-mono text-sm leading-relaxed" style={{ background: 'rgba(245,240,232,0.5)', whiteSpace: 'pre' }}>
                          {idsLines.map((line, i) => {
                            const indentPx = line.depth * 24;
                            const color = line.depth === 0 ? '#1A1A18' : line.depth === 1 ? '#2D5F8A' : line.depth === 2 ? 'rgba(45,95,138,0.7)' : '#8B6914';
                            const ann = getAnnotation(line.character);
                            const isMoonBody = line.character === '月' && getMoonAnnotation(entry?.definition ?? '');
                            const variantBadge = ann || isMoonBody;
                            return (
                              <div key={`${line.character}-${i}`} style={{ color, paddingLeft: `${indentPx}px`, display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                <span>
                                  <span style={{ color: 'rgba(139,105,20,0.5)' }}>{line.prefix}{line.depth > 0 && (line.isLast ? '└─ ' : '├─ ')}</span>
                                  {line.decomposition && line.decomposition !== '？' && <span style={{ color: 'rgba(139,105,20,0.6)' }}>{line.decomposition} </span>}
                                  <span className="font-semibold">{line.character}</span>
                                  {line.definition && <span style={{ color: 'rgba(139,105,20,0.6)' }}> — {line.definition}</span>}
                                </span>
                                {variantBadge && (
                                  <span className="text-[10px] px-1.5 py-px rounded-full font-medium whitespace-nowrap" style={{ background: 'rgba(194,59,42,0.12)', color: '#C23B2A', fontFamily: 'Inter' }}>
                                    {variantBadge.name}
                                  </span>
                                )}
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
                <h2 className="text-xl font-display mb-4" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>Character Relations</h2>
                {relations && (() => {
                  // Build grouped relations, each char in highest-priority group only
                  const seen = new Set<string>([char]);
                  const groups: { label: string; en: string; color: string; bg: string; chars: string[] }[] = [];

                  const addGroup = (label: string, en: string, color: string, bg: string, chars: string[]) => {
                    const filtered = chars.filter(c => !seen.has(c));
                    if (filtered.length > 0) {
                      filtered.forEach(c => seen.add(c));
                      groups.push({ label, en, color, bg, chars: filtered });
                    }
                  };

                  addGroup('源流分化', 'Differentiation', '#C23B2A', 'rgba(194,59,42,0.08)', relations.differentiations);
                  addGroup('反义对举', 'Antonym', '#9B2226', 'rgba(155,34,38,0.06)', relations.antonyms);
                  addGroup('同声旁族', 'Phonetic Family', '#CA6702', 'rgba(202,103,2,0.06)', relations.phoneticFamily);
                  addGroup('同形旁族', 'Semantic Family', '#2D5F8A', 'rgba(45,95,138,0.06)', relations.semanticFamily);
                  addGroup('构件包含', 'Component Of', '#6B7F5E', 'rgba(107,127,94,0.06)', relations.containedIn);
                  addGroup('同音近音', 'Homophone', '#8B6914', 'rgba(139,105,20,0.06)', relations.homophones);

                  if (groups.length === 0) {
                    return <p className="text-sm" style={{ color: '#8B6914', fontFamily: 'Inter' }}>No related characters found.</p>;
                  }

                  return (
                    <div className="space-y-5">
                      {groups.map(g => (
                        <div key={g.label}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: g.bg, color: g.color, fontFamily: 'Inter' }}>
                              {g.label}
                            </span>
                            <span className="text-[10px] uppercase tracking-wide" style={{ color: 'rgba(139,105,20,0.5)', fontFamily: 'Inter' }}>{g.en}</span>
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                            {g.chars.slice(0, 18).map(c => {
                              const info = getCharacter(c);
                              return (
                                <motion.button key={c} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}
                                  onClick={() => goToDetail(c)}
                                  className="flex flex-col items-center rounded-xl p-3 text-center transition-all"
                                  style={{ background: '#F5F0E8', border: '1px solid rgba(26,26,24,0.06)' }}
                                >
                                  <span className="text-2xl font-display-cn" style={{ color: '#1A1A18', fontFamily: '"Ma Shan Zheng", cursive' }}>{c}</span>
                                  {info && (
                                    <>
                                      <span className="text-[10px] mt-0.5" style={{ color: '#C4A265', fontFamily: 'Inter' }}>{info.pinyin[0]}</span>
                                      <span className="text-[9px] mt-0.5 line-clamp-1" style={{ color: '#8B6914', fontFamily: 'Inter' }}>{info.definition.slice(0, 10)}</span>
                                    </>
                                  )}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
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
