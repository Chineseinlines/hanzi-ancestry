import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  GitBranch,
  Layers,
  ChevronDown,
  Info,
} from 'lucide-react';
import type { DecompositionNode, HanziEntry, CognateResult } from '../data/types';
import type { EnglishSearchResult } from '../data/hanziData';
import {
  getCharacter,
  decomposeCharacter,
  numberToMark,
  getCognates,
  hasCharacter,
  loadData,
  loadRelations,
  getTraditionalComponents,
  searchByPinyin,
  searchByEnglish,
  hasCJK,
} from '../data/hanziData';
import DecompositionGraph from '../components/DecompositionGraph';
import CognateGraph from '../components/CognateGraph';
import { getAnnotation, getMoonAnnotation } from '../data/componentAnnotations';

const QUICK_CHARS = ['国', '森', '明', '好', '武', '家', '想', '语', '尊', '界'];

/** Extract CJK characters from raw input, filtering spaces/punctuation/symbols. */
function extractHanzi(raw: string): string[] {
  const result: string[] = [];
  for (const ch of raw) {
    const cp = ch.codePointAt(0);
    if (cp && cp >= 0x4E00 && cp <= 0x9FFF) result.push(ch);
  }
  return result;
}

const EASE_INK = [0.25, 0.1, 0.25, 1.0] as [number, number, number, number];
const EASE_SPRING = [0.34, 1.56, 0.64, 1] as [number, number, number, number];
const EASE_GENTLE = [0.4, 0, 0.2, 1] as [number, number, number, number];

/* ------------------------------------------------------------------ */
/*  IDS Panel helpers                                                  */
/* ------------------------------------------------------------------ */

interface IDSLine {
  character: string;
  decomposition: string;
  definition: string;
  depth: number;
  isLast: boolean;
  prefix: string;
}

function collectIDSLines(
  node: DecompositionNode,
  depth = 0,
  prefix = '',
  isLast = true
): IDSLine[] {
  const entry = getCharacter(node.character);
  const lines: IDSLine[] = [
    {
      character: node.character,
      decomposition: node.decomposition,
      definition: entry?.definition ?? '',
      depth,
      isLast,
      prefix,
    },
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

/* ------------------------------------------------------------------ */
/*  Explore Page                                                       */
/* ------------------------------------------------------------------ */

type SearchMode = 'auto' | 'hanzi' | 'pinyin' | 'english';

const SEARCH_MODES_EXPLORE: { key: SearchMode; label: string }[] = [
  { key: 'auto', label: '自动' },
  { key: 'hanzi', label: '汉字' },
  { key: 'pinyin', label: '拼音' },
  { key: 'english', label: 'EN' },
];

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const charParam = searchParams.get('char') ?? '';
  const componentParam = searchParams.get('component') ?? '';

  const [query, setQuery] = useState(charParam);
  const [searchMode, setSearchMode] = useState<SearchMode>('auto');
  const [enResults, setEnResults] = useState<EnglishSearchResult | null>(null);
  const [currentChar, setCurrentChar] = useState(charParam);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'decomposition' | 'cognate'>('decomposition');
  const [idsExpanded, setIdsExpanded] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(componentParam || null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Derived data
  const charData: HanziEntry | undefined = useMemo(
    () => (currentChar ? getCharacter(currentChar) : undefined),
    [currentChar]
  );

  const decomposition: DecompositionNode | null = useMemo(
    () => (currentChar ? decomposeCharacter(currentChar) : null),
    [currentChar]
  );

  const traditionalComponents: string[] = useMemo(
    () => (currentChar ? getTraditionalComponents(currentChar) : []),
    [currentChar]
  );

  const cognates: CognateResult[] = useMemo(
    () => (currentChar ? getCognates(currentChar) : []),
    [currentChar]
  );

  const isNotFound = currentChar !== '' && !hasCharacter(currentChar);

  // Load data on mount
  useEffect(() => {
    loadData();
    loadRelations();
  }, []);

  // Process search – auto-extract CJK chars, or try pinyin/English
  const processSearch = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      let first: string | null = null;

      const tryHanzi = (): string | null => {
        const hanzi = extractHanzi(trimmed);
        return hanzi.length > 0 ? hanzi[0] : null;
      };

      const tryPinyin = (): string | null => {
        const results = searchByPinyin(trimmed);
        return results.length > 0 ? results[0].char : null;
      };

      switch (searchMode) {
        case 'hanzi':
          first = tryHanzi();
          break;
        case 'pinyin':
          first = tryPinyin();
          break;
        case 'english': {
          const enRes = await searchByEnglish(trimmed);
          setEnResults(enRes);
          if (enRes.words.length === 0 && enRes.chars.length === 0) return;
          setSelectedComponent(null);
          return; // Show results panel
        }
        case 'auto':
        default:
          if (hasCJK(trimmed)) {
            first = tryHanzi();
          } else {
            const pinyinChar = tryPinyin();
            if (pinyinChar) {
              first = pinyinChar;
            } else {
              const enRes = await searchByEnglish(trimmed);
              if (enRes.words.length > 0 || enRes.chars.length > 0) {
                setEnResults(enRes);
                setSelectedComponent(null);
                return; // Show results panel
              }
            }
          }
          break;
      }

      if (!first) return;
      setEnResults(null);
      setQuery(first);
      setCurrentChar(first);
      setSelectedComponent(null);
      setSearchParams({ char: first });
      setLoading(true);
      setTimeout(() => setLoading(false), 400);
    },
    [searchMode, setSearchParams]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      processSearch(query);
    },
    [query, processSearch]
  );

  // Click on graph node → navigate to detail page
  const handleNodeClick = useCallback(
    (char: string) => {
      navigate(`/detail?char=${encodeURIComponent(char)}`);
    },
    [navigate]
  );

  // Double-click on graph node → expand cognate network (explore that character)
  const handleNodeDoubleClick = useCallback(
    (char: string) => {
      processSearch(char);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [processSearch]
  );

  // Click on a component (select it)
  const handleComponentClick = useCallback(
    (comp: string) => {
      setSelectedComponent(comp);
      setSearchParams({ char: currentChar, component: comp });
      // On mobile, switch to cognate tab to show component network
      setActiveTab('cognate');
    },
    [currentChar, setSearchParams]
  );

  // Deselect component
  const handleComponentSelect = useCallback(
    (comp: string | null) => {
      setSelectedComponent(comp);
      if (comp) {
        setSearchParams({ char: currentChar, component: comp });
        setActiveTab('cognate');
      } else {
        setSearchParams({ char: currentChar });
      }
    },
    [currentChar, setSearchParams]
  );

  // Sync with URL params
  useEffect(() => {
    if (charParam && charParam !== currentChar) {
      setQuery(charParam);
      setCurrentChar(charParam);
      setSelectedComponent(componentParam || null);
      setLoading(true);
      setTimeout(() => setLoading(false), 400);
    }
  }, [charParam, currentChar, componentParam]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setQuery('');
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // IDS panel data
  const idsLines = useMemo(() => {
    if (!decomposition) return [];
    return collectIDSLines(decomposition);
  }, [decomposition]);

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <div className="min-h-[100dvh] bg-bg-primary">
      {/* ---- Search Header ---- */}
      <section
        className="relative pt-24 pb-10"
        style={{
          background: 'linear-gradient(to bottom, #EDE6D8 0%, #F5F0E8 100%)',
        }}
      >
        <div className="mx-auto max-w-[640px] px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_INK }}
            className="font-display text-[clamp(2rem,4vw,3.5rem)] font-bold leading-tight text-ink-black"
          >
            Character Explorer
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: EASE_GENTLE }}
            className="mt-2 text-base text-charcoal"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Input a character to reveal its components and find its relatives
          </motion.p>

          {/* Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3, ease: EASE_SPRING }}
            onSubmit={handleSubmit}
            className="relative mx-auto mt-8 max-w-[480px]"
          >
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setEnResults(null); }}
                maxLength={20}
                placeholder="汉字 / pinyin / English word..."
                className="h-14 w-full rounded-full border border-border-light bg-white px-6 text-center text-2xl text-ink-black shadow-sm transition-all duration-300 placeholder:text-charcoal/30 focus:border-cinnabar focus:shadow-cinnabar focus:outline-none"
              />
              <button
                type="submit"
                className="absolute top-1/2 right-2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cinnabar text-white transition-all duration-200 hover:scale-105 hover:bg-vermilion-light"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            </div>
          </motion.form>

          {/* Search mode selector */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-3 flex items-center justify-center gap-1"
          >
            {SEARCH_MODES_EXPLORE.map((mode) => (
              <button
                key={mode.key}
                type="button"
                onClick={() => setSearchMode(mode.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${
                  searchMode === mode.key
                    ? 'bg-cinnabar text-white'
                    : 'text-charcoal/40 hover:text-charcoal/70 bg-bg-warm'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </motion.div>

          {/* English search results panel */}
          <AnimatePresence>
            {enResults && (enResults.words.length > 0 || enResults.chars.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 mx-auto max-w-[540px] rounded-2xl bg-white p-5 text-left shadow-md border border-border-light"
              >
                {/* Chinese words */}
                {enResults.words.length > 0 && (
                  <>
                    <p className="mb-3 text-[0.6875rem] font-medium uppercase tracking-wider text-charcoal/40">
                      Chinese words
                    </p>
                    <div className="space-y-2 mb-4 max-h-72 overflow-y-auto">
                      {enResults.words.slice(0, 15).map((w) => (
                        <div key={w.w} className="flex items-center gap-2 text-sm group">
                          <button
                            onClick={() => {
                              const firstChar = [...w.w].find(ch => {
                                const cp = ch.codePointAt(0);
                                return cp && cp >= 0x4E00 && cp <= 0x9FFF && hasCharacter(ch);
                              });
                              if (firstChar) {
                                setEnResults(null);
                                setQuery(firstChar);
                                setCurrentChar(firstChar);
                                setSearchParams({ char: firstChar });
                              }
                            }}
                            className="font-serif-cn text-xl font-semibold text-ink-black min-w-[3rem] text-left hover:text-cinnabar transition-colors underline decoration-cinnabar/20 underline-offset-4 hover:decoration-cinnabar cursor-pointer"
                            title={`View "${w.w}"`}
                          >
                            {w.w}
                          </button>
                          <span className="text-[0.625rem] text-charcoal/30 font-mono hidden sm:inline">{w.p}</span>
                          <span className="text-xs text-charcoal/50 truncate flex-1">{w.d}</span>
                        </div>
                      ))}
                    </div>
                    {enResults.words.length > 15 && (
                      <p className="text-[0.625rem] text-charcoal/30 mb-3">
                        +{enResults.words.length - 15} more words
                      </p>
                    )}
                  </>
                )}

                {/* Unique characters */}
                {enResults.chars.length > 0 && (
                  <div className="pt-3 border-t border-border-light">
                    <p className="mb-2 text-[0.6875rem] font-medium uppercase tracking-wider text-charcoal/40">
                      All characters
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {enResults.chars.slice(0, 24).map((r) => (
                        <button
                          key={r.char}
                          onClick={() => {
                            setEnResults(null);
                            setQuery(r.char);
                            setCurrentChar(r.char);
                            setSearchParams({ char: r.char });
                          }}
                          className="rounded-lg px-3 py-1.5 text-lg font-serif-cn text-ink-black hover:bg-cinnabar hover:text-white transition-all hover:scale-110"
                          style={{ background: 'rgba(26,26,24,0.04)' }}
                          title={`${r.pinyin}: ${r.definition}`}
                        >
                          {r.char}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Character Chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mt-4 flex flex-wrap items-center justify-center gap-2"
          >
            {QUICK_CHARS.map((c, i) => (
              <motion.button
                key={c}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.06 }}
                onClick={() => processSearch(c)}
                className={`rounded-full px-3 py-1.5 font-serif-cn text-base transition-all duration-200 ${
                  currentChar === c
                    ? 'bg-cinnabar text-white'
                    : 'border border-border-light bg-white text-ink-black hover:bg-cinnabar hover:text-white'
                }`}
              >
                {c}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---- Character Info Bar ---- */}
      <AnimatePresence mode="wait">
        {charData && !isNotFound && (
          <motion.section
            key={`info-${currentChar}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: EASE_GENTLE }}
            className="sticky top-16 z-30 border-y border-border-light bg-white"
          >
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: EASE_SPRING }}
                className="font-display-cn text-[2.5rem] leading-none text-ink-black"
              >
                {charData.character}
              </motion.span>
              <span className="font-mono text-sm text-cinnabar">
                {charData.pinyin.map(p => numberToMark(p)).join(', ')}
              </span>
              <span className="hidden text-border-light sm:inline">·</span>
              <span
                className="max-w-[400px] truncate text-sm text-charcoal"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {charData.definition}
              </span>
              <span className="hidden text-border-light lg:inline">·</span>
              <span
                className="rounded-full border border-border-light bg-bg-warm px-2.5 py-1 text-xs font-medium text-charcoal"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Radical: {charData.radical}
              </span>

              {/* Traditional form badge */}
              {charData.traditional && (
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    backgroundColor: 'rgba(194, 59, 42, 0.1)',
                    color: '#C23B2A',
                  }}
                >
                  Traditional: {charData.traditional}
                </span>
              )}

              {/* Original components as clickable chips */}
              {traditionalComponents.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className="text-xs text-charcoal/60"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Original:
                  </span>
                  {traditionalComponents.map((comp) => (
                    <button
                      key={comp}
                      onClick={() => handleComponentClick(comp)}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium transition-all duration-200 ${
                        selectedComponent === comp
                          ? 'bg-cinnabar text-white'
                          : 'border border-border-light bg-white text-ink-black hover:border-cinnabar hover:text-cinnabar'
                      }`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {comp}
                    </button>
                  ))}
                </div>
              )}

              {charData.etymologyHint && (
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    backgroundColor: 'rgba(107, 127, 94, 0.15)',
                    color: '#6B7F5E',
                  }}
                >
                  Etymology
                </span>
              )}
              {charData.etymologyHint && (
                <span
                  className="hidden text-sm italic text-charcoal/70 lg:inline"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {charData.etymologyHint}
                </span>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ---- Graph Display Area ---- */}
      <section className="relative" style={{ minHeight: '70vh' }}>
        {/* Empty State */}
        <AnimatePresence>
          {!currentChar && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center px-4 py-24"
            >
              <span className="font-display-cn text-[8rem] leading-none text-ink-black/5">
                字
              </span>
              <p
                className="mt-4 text-lg text-charcoal"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Enter a character above to begin your exploration
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {['国', '明', '好', '尊', '界'].map((c) => (
                  <button
                    key={c}
                    onClick={() => processSearch(c)}
                    className="flex flex-col items-center gap-1 rounded-lg border border-border-light bg-white px-5 py-3 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-cinnabar hover:shadow-md"
                  >
                    <span className="font-display-cn text-2xl text-ink-black">{c}</span>
                    <span className="text-xs text-charcoal" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {getCharacter(c)?.definition?.split(',')[0] ?? ''}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        <AnimatePresence>
          {isNotFound && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE_INK }}
              className="flex flex-col items-center justify-center px-4 py-24"
            >
              <Info size={48} className="mb-4 text-cinnabar" />
              <h2 className="font-serif-cn text-xl font-semibold text-ink-black">
                Character Not Found
              </h2>
              <p
                className="mt-2 max-w-md text-center text-base text-charcoal"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                This character is not in our current database. Try one of the suggested characters below.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {QUICK_CHARS.map((c) => (
                  <button
                    key={c}
                    onClick={() => processSearch(c)}
                    className="rounded-full border border-border-light bg-white px-4 py-2 font-serif-cn text-base text-ink-black transition-all hover:bg-cinnabar hover:text-white hover:shadow-md"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        <AnimatePresence>
          {loading && currentChar && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-24"
            >
              <div className="relative h-12 w-12">
                <span className="absolute inset-0 inline-block h-12 w-12 animate-ping rounded-full bg-cinnabar/30" />
                <span className="absolute inset-2 inline-block rounded-full bg-cinnabar" />
              </div>
              <p
                className="mt-4 text-sm text-charcoal"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Analyzing character structure...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Graphs */}
        <AnimatePresence>
          {!loading && currentChar && !isNotFound && decomposition && (
            <motion.div
              key={`graphs-${currentChar}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8"
            >
              {/* Mobile Tab Switcher */}
              <div className="mb-4 flex justify-center lg:hidden">
                <div className="inline-flex rounded-full bg-bg-warm p-1">
                  <button
                    onClick={() => setActiveTab('decomposition')}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                      activeTab === 'decomposition'
                        ? 'bg-white text-ink-black shadow-sm'
                        : 'text-charcoal'
                    }`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Decomposition
                  </button>
                  <button
                    onClick={() => setActiveTab('cognate')}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                      activeTab === 'cognate'
                        ? 'bg-white text-ink-black shadow-sm'
                        : 'text-charcoal'
                    }`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Etymological Network
                  </button>
                </div>
              </div>

              {/* Desktop: side by side / Mobile: tab toggle */}
              <div className="flex flex-col gap-4 lg:flex-row lg:h-[70vh]">
                {/* Decomposition Graph */}
                <div
                  className={`lg:w-[40%] ${activeTab !== 'decomposition' ? 'hidden lg:block' : ''}`}
                >
                  <div className="flex h-full flex-col rounded-lg bg-white shadow-md">
                    {/* Title bar */}
                    <div className="flex items-center gap-2 border-b border-border-light px-4 py-3">
                      <GitBranch size={16} className="text-cinnabar" />
                      <span
                        className="text-[0.8125rem] font-semibold uppercase tracking-[0.06em] text-charcoal"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        Character Decomposition
                      </span>
                      <span className="ml-auto font-serif-cn text-sm text-charcoal/50">
                        拆解图
                      </span>
                    </div>
                    <div className="px-4 pb-1">
                      <span className="text-[10px]" style={{ color: 'rgba(139,105,20,0.6)', fontFamily: 'Inter' }}>
                        单击汉字查看详情 · 双击展开系联
                      </span>
                    </div>
                    {/* Graph */}
                    <div className="flex-1 overflow-hidden p-2">
                      <DecompositionGraph
                        decomposition={decomposition}
                        onNodeClick={handleNodeClick}
                        onNodeDoubleClick={handleNodeDoubleClick}
                        onComponentClick={handleComponentClick}
                        selectableComponents={traditionalComponents}
                        highlightedComponent={selectedComponent}
                      />
                    </div>
                    {/* Component chips below graph */}
                    {traditionalComponents.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 border-t border-border-light px-4 py-2.5">
                        <span
                          className="text-xs text-charcoal/60"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          Components:
                        </span>
                        {traditionalComponents.map((comp) => (
                          <button
                            key={comp}
                            onClick={() => handleComponentClick(comp)}
                            className={`rounded-full px-2 py-0.5 text-xs font-medium transition-all duration-200 ${
                              selectedComponent === comp
                                ? 'bg-cinnabar text-white'
                                : 'border border-border-light bg-white text-ink-black hover:border-cinnabar hover:text-cinnabar'
                            }`}
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            {comp}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden w-px bg-border-light lg:block" />

                {/* Cognate Graph */}
                <div
                  className={`lg:w-[60%] ${activeTab !== 'cognate' ? 'hidden lg:block' : ''}`}
                >
                  <div className="flex h-full flex-col rounded-lg bg-white shadow-md">
                    {/* Title bar with component selector */}
                    <div className="flex flex-col gap-2 border-b border-border-light px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Layers size={16} className="text-cinnabar" />
                        <span
                          className="text-[0.8125rem] font-semibold uppercase tracking-[0.06em] text-charcoal"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {selectedComponent
                            ? `Characters containing ${selectedComponent}`
                            : `Related to ${currentChar}`}
                        </span>
                        <span className="ml-auto font-serif-cn text-sm text-charcoal/50">
                          {selectedComponent ? '部件系联' : '同源图'}
                        </span>
                      </div>
                      <div className="px-4 pb-1">
                        <span className="text-[10px]" style={{ color: 'rgba(139,105,20,0.6)', fontFamily: 'Inter' }}>
                          单击汉字查看详情 · 双击展开系联
                        </span>
                      </div>
                      {/* Component Selector */}
                      {traditionalComponents.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            onClick={() => handleComponentSelect(null)}
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-200 ${
                              !selectedComponent
                                ? 'bg-cinnabar text-white'
                                : 'border border-border-light bg-white text-ink-black hover:border-cinnabar hover:text-cinnabar'
                            }`}
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            All
                          </button>
                          {traditionalComponents.map((comp) => (
                            <button
                              key={comp}
                              onClick={() => handleComponentSelect(comp)}
                              className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-200 ${
                                selectedComponent === comp
                                  ? 'bg-cinnabar text-white'
                                  : 'border border-border-light bg-white text-ink-black hover:border-cinnabar hover:text-cinnabar'
                              }`}
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              {comp}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Graph */}
                    <div className="flex-1 overflow-hidden p-2">
                      <CognateGraph
                        character={currentChar}
                        selectedComponent={selectedComponent}
                        cognates={cognates}
                        onNodeClick={handleNodeClick}
                        onNodeDoubleClick={handleNodeDoubleClick}
                        onComponentSelect={handleComponentSelect}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ---- IDS Text Panel ---- */}
      <AnimatePresence>
        {!loading && currentChar && !isNotFound && idsLines.length > 0 && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="border-t border-border-light bg-white"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <button
                onClick={() => setIdsExpanded(!idsExpanded)}
                className="flex w-full items-center justify-between py-4 text-left transition-colors hover:bg-bg-warm/50"
              >
                <span
                  className="text-sm font-medium text-ink-black"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  View Full Decomposition Text
                </span>
                <ChevronDown
                  size={18}
                  className={`text-charcoal transition-transform duration-300 ${
                    idsExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {idsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE_GENTLE }}
                    className="overflow-hidden"
                  >
                    <div className="pb-6">
                      <pre
                        className="overflow-x-auto rounded-lg bg-bg-primary p-4 font-mono text-sm leading-relaxed"
                        style={{ whiteSpace: 'pre' }}
                      >
                        {idsLines.map((line, i) => {
                          const indentClass =
                            line.depth === 0
                              ? 'text-ink-black'
                              : line.depth === 1
                                ? 'text-graph-node-component'
                                : line.depth === 2
                                  ? 'text-graph-node-component/70'
                                  : 'text-charcoal';

                          const indentPx = line.depth * 24;
                          const ann = getAnnotation(line.character);
                          const isMoonBody = line.character === '月' && getMoonAnnotation(charData?.definition ?? '');
                          const variantBadge = ann || isMoonBody;

                          return (
                            <div
                              key={`${line.character}-${i}`}
                              className={`${indentClass}`}
                              style={{ paddingLeft: `${indentPx}px`, display: 'flex', alignItems: 'baseline', gap: '6px' }}
                            >
                              <span>
                                <span className="text-charcoal/50">
                                  {line.prefix}
                                  {line.depth > 0 && (line.isLast ? '└─ ' : '├─ ')}
                                </span>
                                {line.decomposition && line.decomposition !== '？' && (
                                  <span className="text-charcoal/60">
                                    {line.decomposition}{' '}
                                  </span>
                                )}
                                <span className="font-semibold">{line.character}</span>
                                {line.definition && (
                                  <span className="text-charcoal/60">
                                    {' '}
                                    — {line.definition}
                                  </span>
                                )}
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
