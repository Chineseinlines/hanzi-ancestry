import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch, BookOpen, ScrollText, Globe, Puzzle, ChevronDown, Heart, Search,
} from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { useWordBook } from '../hooks/useWordBook';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { recordCharView } from '../lib/database';
import {
  getCharacter,
  getCharacterEnriched,
  getCulturalData,
  getRelations,
  decomposeCharacter,
  loadData,
  loadCulturalData,
  loadShuowen,
  loadSimpTradMap,
  loadRelations,
  loadWordFamilies,
  getWordFamilies,
  getShuowen,
  scoreRelations,
  getTraditional,
  getSimplifiedForm,
  hasCharacter,
  searchByPinyin,
  getLocalizedDefinition,
  getLocalizedEtymologyHint,
} from '../data/hanziData';
import type { HanziEntry, CulturalData, DecompositionNode, ShuowenEntry, CharRelations, ScoredRelation, WordFamilies as WordFamiliesData } from '../data/types';
import StrokeOrder from '../components/StrokeOrder';
import GlyphEvolution from '../components/GlyphEvolution';
import GlyphEvolutionTimeline from '../components/GlyphEvolutionTimeline';
import SimpTradTimeline from '../components/SimpTradTimeline';
import CharPuzzleGame from '../components/CharPuzzleGame';
import DecompositionGraph from '../components/DecompositionGraph';
import CognateGraph from '../components/CognateGraph';
import WordFamilies from '../components/WordFamilies';
import { getAnnotation, getMoonAnnotation, getMoonTrueAnnotation, type ComponentAnnotation } from '../data/componentAnnotations';
import { getLocalizedAnnotationName, getLocalizedAnnotationDescription } from '../data/componentAnnotations.bilingual';
import { getSimpTradOrigin } from '../data/simpTradOrigins';
import { ratePhonetic, PHONETIC_COLORS, type PhoneticRatingResult } from '../data/phoneticRating';
import { getLocalizedPhoneticLabel, getLocalizedPhoneticTooltip } from '../data/phoneticRating.bilingual';
import { getGhostSuggestion } from '../data/ghostComponents';
import { getLocalizedGhostSuggestion } from '../data/ghostComponents.bilingual';
import { computePhoneticLevelMulti, getPhoneticLevelInfo, type PhoneticLevel } from '../data/phoneticLevels';
import { getCuratedSemanticLevel, guessSemanticLevel, getSemanticLevelInfo, type SemanticLevel } from '../data/semanticLevels';
import { PHONETIC_LEVEL_DESCRIPTIONS_EN } from '../data/phoneticLevels.en';
import { SEMANTIC_LEVEL_DESCRIPTIONS_EN } from '../data/semanticLevels.en';
import SpeakButton from '../components/SpeakButton';
import { loadCharMeta, getCharMeta, FREQ_TOTAL, hsk3Band, hsk3LevelLabel } from '../data/charMeta';
import { setPageMeta } from '../lib/seo';

const TAG_COLORS: Record<string, string> = {
  '源流分化': '#C23B2A',
  '反义': '#9B2226',
  '同声旁': '#CA6702',
  '同形旁': '#2D5F8A',
  '同构件': '#5A8A6B',
  '同音': '#8B6914',
  '近音': '#A08A5A',
  '构件包含': '#6B7F5E',
  '同部首': '#5A6B8A',
};

const TABS = [
  { id: 'card', labelKey: 'detail.tabs.card', icon: BookOpen },
  { id: 'glyph', labelKey: 'detail.tabs.glyph', icon: ScrollText },
  { id: 'decomp-link', labelKey: 'detail.tabs.decompLink', icon: GitBranch },
  { id: 'game', labelKey: 'detail.tabs.game', icon: Puzzle },
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

function collectIDSLines(node: DecompositionNode, lang: 'zh' | 'en', depth = 0, prefix = '', isLast = true): IDSLine[] {
  const entry = getCharacter(node.character);
  const lines: IDSLine[] = [
    { character: node.character, decomposition: node.decomposition,
      definition: getLocalizedDefinition(entry, lang), depth, isLast, prefix },
  ];
  if (node.children) {
    node.children.forEach((child, i) => {
      const childIsLast = i === node.children.length - 1;
      const childPrefix = prefix + (isLast ? '   ' : '│  ');
      lines.push(...collectIDSLines(child, lang, depth + 1, childPrefix, childIsLast));
    });
  }
  return lines;
}

/** 说文摘要：zh 显示中文白话标签，en 显示英文（保留原 getEnglishSummary 语义）。 */
function getShuowenSummary(shuowen: ShuowenEntry, entry: HanziEntry | null, lang: 'zh' | 'en', t: (k: string, p?: Record<string, string | number>) => string): string {
  const parts: string[] = [];
  const sb = shuowen.sixBooks;

  if (lang === 'zh') {
    if (sb === '象形') parts.push(t('detail.shuowenSixBooks.pictographic'));
    else if (sb === '指事') parts.push(t('detail.shuowenSixBooks.indicative'));
    else if (sb === '会意') parts.push(t('detail.shuowenSixBooks.ideographic'));
    else if (sb === '形声') parts.push(t('detail.shuowenSixBooks.pictophonetic'));
    else if (sb === '转注') parts.push(t('detail.shuowenSixBooks.zhuanzhu'));
    else if (sb === '假借') parts.push(t('detail.shuowenSixBooks.loan'));
    else if (sb) parts.push(sb);

    if (shuowen.structure && shuowen.structure !== sb) {
      parts.push(`${t('detail.structure')}：${shuowen.structure}`);
    }
    if (entry?.etymology) {
      const ety = entry.etymology;
      if (ety.semantic) parts.push(`${t('detail.semanticComponent')}：${ety.semantic}`);
      if (ety.phonetic) parts.push(`${t('detail.phoneticComponent')}：${ety.phonetic}`);
    }
    return parts.join('。') + (parts.length > 0 ? '。' : '');
  }

  if (sb === '象形') parts.push(t('detail.shuowenSixBooks.pictographic'));
  else if (sb === '指事') parts.push(t('detail.shuowenSixBooks.indicative'));
  else if (sb === '会意') parts.push(t('detail.shuowenSixBooks.ideographic'));
  else if (sb === '形声') parts.push(t('detail.shuowenSixBooks.pictophonetic'));
  else if (sb === '转注') parts.push(t('detail.shuowenSixBooks.zhuanzhu'));
  else if (sb === '假借') parts.push(t('detail.shuowenSixBooks.loan'));
  else if (sb) parts.push(sb);

  if (shuowen.structure && shuowen.structure !== sb) {
    parts.push(`${t('detail.structure')}: ${shuowen.structure}`);
  }

  if (entry?.etymology) {
    const ety = entry.etymology;
    if (ety.semantic) parts.push(`${t('detail.semanticComponent')}: ${ety.semantic}`);
    if (ety.phonetic) parts.push(`${t('detail.phoneticComponent')}: ${ety.phonetic}`);
  }

  return parts.join('. ') + (parts.length > 0 ? '.' : '');
}

export default function CharacterDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const char = searchParams.get('char') || '';

  const [entry, setEntry] = useState<HanziEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [cultural, setCultural] = useState<CulturalData | null>(null);
  const [wordFamilies, setWordFamilies] = useState<WordFamiliesData | null>(null);
  const [relations, setRelations] = useState<CharRelations | null>(null);
  const [shuowen, setShuowen] = useState<ShuowenEntry | null>(null);
  const [expandedAllusion, setExpandedAllusion] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('card');
  const [idsExpanded, setIdsExpanded] = useState(true);
  // 拆字 tab：简体拆法 / 繁体拆法
  const [decompMode, setDecompMode] = useState<'simp' | 'trad'>('simp');
  // 「拆解系联」标签内的子视图：拆解网络 / 系联网络
  const [netView, setNetView] = useState<'decomp' | 'cognate'>('decomp');

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
      await loadCharMeta();
      await loadWordFamilies();
      if (cancelled) return;
      const e = getCharacterEnriched(char);
      setEntry(e ?? null);
      setCultural(getCulturalData(char) ?? null);
      setWordFamilies(getWordFamilies(char) ?? null);
      setShuowen(getShuowen(char) ?? null);
      if (e) setRelations(getRelations(char) ?? null);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [char]);

  // SEO：动态标题与描述（覆盖 RouteMeta 的通用标题）
  useEffect(() => {
    if (!entry) return;
    setPageMeta({
      title: t('detail.metaTitle', {
        char,
        pinyin: entry.pinyin.join(' / '),
      }),
      description: t('detail.metaDesc', {
        char,
        definition: getLocalizedDefinition(entry, lang).slice(0, 80),
      }),
    });
  }, [entry, char, lang, t]);

  const charMeta = useMemo(() => (char ? getCharMeta(char) : undefined), [char, entry]);

  // entry 在数据加载完成后才 set —— 以它为依赖，避免首次渲染（charMap 未就绪）时把 null 缓存住
  const decomposition = useMemo(() => (char && entry ? decomposeCharacter(char) : null), [char, entry]);

  // 简/繁拆法切换：繁体目标（curated 溯源数据优先，其次简繁映射）
  const simpTradOrigin = useMemo(() => (char ? getSimpTradOrigin(char) : null), [char]);
  const tradTarget = useMemo(() => {
    if (!char) return null;
    return simpTradOrigin?.traditionals?.[0] ?? getTraditional(char);
  }, [char, simpTradOrigin, entry]);
  const tradDecomposition = useMemo(
    () => (tradTarget && tradTarget !== char ? decomposeCharacter(tradTarget) : null),
    [tradTarget, char, entry],
  );
  const activeDecomposition = decompMode === 'trad' && tradDecomposition ? tradDecomposition : decomposition;

  // 切换目标字时重置为简体拆法
  useEffect(() => {
    setDecompMode('simp');
  }, [char]);

  const idsLines = useMemo(() => {
    if (!activeDecomposition) return [];
    return collectIDSLines(activeDecomposition, lang);
  }, [activeDecomposition, lang]);

  // Collect component annotations from decomposition tree
  const componentAnnotations = useMemo(() => {
    if (!activeDecomposition) return [];
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
    walk(activeDecomposition);
    return results;
  }, [activeDecomposition, entry]);

  // Phonetic rating for pictophonetic characters (3-color simplified)
  const phoneticRating = useMemo((): PhoneticRatingResult | null => {
    if (!entry?.etymology || entry.etymology.type !== 'pictophonetic') return null;
    const phonetic = entry.etymology.phonetic;
    if (!phonetic) return null;
    const phoneticEntry = getCharacter(phonetic);
    if (!phoneticEntry?.pinyin?.[0]) return null;
    return ratePhonetic(entry.pinyin[0], phoneticEntry.pinyin[0]);
  }, [entry]);

  // Detailed 6-level phonetic relation for pictophonetic characters
  const phoneticLevelDetail = useMemo((): { level: PhoneticLevel; bestMatch: string } | null => {
    if (!entry?.etymology || entry.etymology.type !== 'pictophonetic') return null;
    const phonetic = entry.etymology.phonetic;
    if (!phonetic) return null;
    const phoneticEntry = getCharacter(phonetic);
    if (!phoneticEntry?.pinyin?.length) return null;
    return computePhoneticLevelMulti(entry.pinyin, phoneticEntry.pinyin);
  }, [entry]);

  // Semantic relation level for pictophonetic characters
  const semanticLevelDetail = useMemo((): { level: SemanticLevel; note: string } | null => {
    if (!entry?.etymology || entry.etymology.type !== 'pictophonetic') return null;
    const semantic = entry.etymology.semantic;
    if (!semantic) return null;

    // Check curated data first
    const curated = getCuratedSemanticLevel(char);
    if (curated && curated.semantic === semantic) {
      return { level: curated.level, note: curated.note };
    }

    // Fall back to heuristic
    const semanticEntry = getCharacter(semantic);
    if (!semanticEntry?.definition) return null;
    const level = guessSemanticLevel(entry.definition, semanticEntry.definition);
    return { level, note: `基于定义自动推断 (${semantic}: ${semanticEntry.definition.slice(0, 30)}...)` };
  }, [entry, char]);

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

  // Build deduplicated character → relation-type map
  const relatedCharMap = useMemo(() => {
    if (!relations) return null;
    const map = new Map<string, { label: string; en: string; color: string }[]>();

    const add = (chars: string[], label: string, en: string, color: string) => {
      for (const c of chars) {
        // Skip self and self-variants (traditional/simplified form of the viewed character)
        if (c === char) continue;
        if (c === relations.traditional || c === relations.simplified) continue;
        let entry = map.get(c);
        if (!entry) { entry = []; map.set(c, entry); }
        if (!entry.some(t => t.label === label)) {
          entry.push({ label, en, color });
        }
      }
    };

    add(relations.differentiations, '源流分化', 'Differentiation', '#C23B2A');
    add(relations.antonyms, '反义对举', 'Antonym', '#9B2226');
    add(relations.phoneticFamily, '同声旁族', 'Phonetic Family', '#CA6702');
    add(relations.semanticFamily, '同形旁族', 'Semantic Family', '#2D5F8A');
    add(relations.sharedComponents, '同构件', 'Shared Component', '#5A8A6B');
    add(relations.containedIn, '构件包含', 'Component Of', '#6B7F5E');
    add(relations.homophones, '同音字', 'Homophone', '#8B6914');
    add(relations.nearHomophones, '近音字', 'Near-Homophone', '#A08A5A');

    return map;
  }, [relations, char]);

  // Top 5 scored relations for preview
  const topRelations = useMemo((): ScoredRelation[] => {
    if (!char) return [];
    return scoreRelations(char, 5);
  }, [char]);

  const { isFavorite, toggleFavorite } = useFavorites();
  const { has: hasInWordBook, toggle: toggleWordBook } = useWordBook();
  const { user } = useAuth();

  // Record character view when page loads
  useEffect(() => {
    if (char && user) {
      recordCharView(user.id, char);
    }
  }, [char, user]);
  const charIsFav = char ? isFavorite(char) : false;

  const goToDetail = (c: string) => {
    navigate(`/detail?char=${encodeURIComponent(c)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 拆解图节点跳转：繁体部件不在词典时，回退到其简体字
  const navigateToChar = (c: string) => {
    if (hasCharacter(c)) {
      goToDetail(c);
      return;
    }
    const simp = getSimplifiedForm(c);
    if (simp && hasCharacter(simp)) goToDetail(simp);
  };
  const navigateToExploreChar = (c: string) => {
    if (hasCharacter(c)) {
      navigate(`/explore?char=${encodeURIComponent(c)}`);
      return;
    }
    const simp = getSimplifiedForm(c);
    if (simp && hasCharacter(simp)) navigate(`/explore?char=${encodeURIComponent(simp)}`);
  };

  /* ── Hero quick search: 汉字/拼音 → 跳转详情 ── */
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  const runSearch = async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    setSearchError('');
    await loadData();
    let target: string | null = null;
    const hanzi = Array.from(trimmed).filter((c) => {
      const cp = c.codePointAt(0);
      return cp != null && cp >= 0x4e00 && cp <= 0x9fff;
    });
    if (hanzi.length > 0) {
      const c = hanzi[0];
      if (hasCharacter(c)) target = c;
      else {
        const simp = getSimplifiedForm(c);
        if (simp && hasCharacter(simp)) target = simp;
      }
    }
    if (!target) {
      const hits = searchByPinyin(trimmed);
      if (hits.length > 0) target = hits[0].char;
    }
    if (target) {
      setSearchQuery('');
      goToDetail(target);
    } else {
      setSearchError(t('detail.searchNotFound'));
    }
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
          <span className="text-sm" style={{ color: '#8B6914', fontFamily: 'Inter' }}>{t('common.loadingCharData')}</span>
        </div>
      </div>
    );
  }

  /* ── Not Found ── */
  if (!entry) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4" style={{ background: '#F5F0E8' }}>
        <span className="text-6xl" style={{ fontFamily: '"Ma Shan Zheng", cursive', color: '#C23B2A' }}>{char || '?'}</span>
        <h1 className="text-2xl font-display" style={{ color: '#1A1A18' }}>{t('common.charNotFound')}</h1>
        <p className="text-sm text-center max-w-md" style={{ color: '#8B6914', fontFamily: 'Inter' }}>
          {t('common.charNotFoundDesc')}
        </p>
        <button onClick={() => navigate('/explore')} className="px-6 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-105" style={{ background: '#C23B2A', color: '#F5F0E8', fontFamily: 'Inter' }}>
          {t('common.goToExplorer')}
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
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-6 text-xs" style={{ color: 'rgba(245,240,232,0.5)', fontFamily: 'Inter' }}>
            <span className="cursor-pointer hover:text-rice-paper transition-colors" onClick={() => navigate('/')}>{t('nav.home')}</span>
            <span>/</span>
            <span className="cursor-pointer hover:text-rice-paper transition-colors" onClick={() => navigate('/explore')}>{t('nav.explore')}</span>
            <span>/</span>
            <span style={{ color: '#F5F0E8' }}>{char}</span>
          </div>

          <SimpTradTimeline character={char} onNavigate={goToDetail} />

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <span className="font-display-cn leading-none block" style={{ fontSize: 'clamp(5rem, 12vw, 8rem)', color: '#F5F0E8', fontFamily: '"Ma Shan Zheng", cursive', textShadow: '0 4px 30px rgba(194,59,42,0.2)' }}>
              {char}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
              {entry.pinyin.map((p, i) => (
                <span key={i} className="text-lg tracking-wide" style={{ color: '#C4A265', fontFamily: 'Inter' }}>{p}</span>
              ))}
              <SpeakButton text={char} title={t('detail.speak')} onDark />
              <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: 'rgba(107,127,94,0.2)', color: '#6B7F5E', fontFamily: 'Inter' }}>
                {t('detail.radical')}: {entry.radical}
              </span>
              {charMeta?.hsk3 !== undefined && (
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  title={t('detail.hsk3Tooltip')}
                  style={{
                    background: hsk3Band(charMeta.hsk3) === 'advanced' ? 'rgba(194,59,42,0.2)' : hsk3Band(charMeta.hsk3) === 'intermediate' ? 'rgba(45,95,138,0.22)' : 'rgba(107,127,94,0.22)',
                    color: hsk3Band(charMeta.hsk3) === 'advanced' ? '#E8836F' : hsk3Band(charMeta.hsk3) === 'intermediate' ? '#8FB4D9' : '#9CB48A',
                    fontFamily: 'Inter',
                  }}
                >
                  {t('detail.hsk3Badge', { level: hsk3LevelLabel(charMeta.hsk3) })}
                  <span className="ml-1 opacity-75">
                    {hsk3Band(charMeta.hsk3) === 'advanced' ? t('detail.bandAdvanced') : hsk3Band(charMeta.hsk3) === 'intermediate' ? t('detail.bandIntermediate') : t('detail.bandElementary')}
                  </span>
                </span>
              )}
              {charMeta?.hsk2 !== undefined && charMeta.hsk2 !== charMeta?.hsk3 && (
                <span
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  title={t('detail.hsk2Tooltip')}
                  style={{ background: 'rgba(245,240,232,0.1)', color: 'rgba(245,240,232,0.55)', fontFamily: 'Inter' }}
                >
                  {t('detail.hsk2Badge', { level: charMeta.hsk2 })}
                </span>
              )}
              {charMeta?.freqRank !== undefined && (
                <span
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  title={t('detail.freqTooltip', { total: FREQ_TOTAL.toLocaleString() })}
                  style={{ background: 'rgba(196,162,101,0.14)', color: '#C4A265', fontFamily: 'Inter' }}
                >
                  {t('detail.freqBadge', { rank: charMeta.freqRank, total: FREQ_TOTAL.toLocaleString() })}
                </span>
              )}
              <button
                onClick={() => toggleFavorite(char)}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all hover:scale-105"
                style={{
                  background: charIsFav ? 'rgba(194,59,42,0.2)' : 'rgba(245,240,232,0.1)',
                  color: charIsFav ? '#C23B2A' : 'rgba(245,240,232,0.5)',
                  fontFamily: 'Inter',
                }}
                title={charIsFav ? t('common.unfavorite') : t('common.favorite')}
              >
                <Heart size={12} fill={charIsFav ? '#C23B2A' : 'none'} />
                {charIsFav ? t('common.favorited') : t('common.favorite')}
              </button>
              <button
                onClick={() => toggleWordBook(char)}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all hover:scale-105"
                style={{
                  background: hasInWordBook(char) ? 'rgba(45,95,138,0.2)' : 'rgba(245,240,232,0.1)',
                  color: hasInWordBook(char) ? '#2D5F8A' : 'rgba(245,240,232,0.5)',
                  fontFamily: 'Inter',
                }}
                title={hasInWordBook(char) ? t('common.removeFromWordBook') : t('common.addToWordBook')}
              >
                {hasInWordBook(char) ? '📗' : '📖'} {hasInWordBook(char) ? t('common.wordBook') : t('common.addToWordBook')}
              </button>
              <button
                onClick={() => navigate(`/explore?char=${encodeURIComponent(char)}`)}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all hover:scale-105"
                style={{
                  background: 'rgba(196,162,101,0.16)',
                  color: '#E9D6A8',
                  fontFamily: 'Inter',
                }}
                title={t('detail.viewNetwork')}
              >
                <Globe size={12} />
                {t('detail.viewNetwork')}
              </button>
            </div>
            <p className="mt-3 text-base max-w-lg mx-auto" style={{ color: 'rgba(245,240,232,0.75)', fontFamily: 'Inter' }}>
              {getLocalizedDefinition(entry, lang)}
            </p>
            {getLocalizedEtymologyHint(entry, lang) && (
              <p className="mt-3 text-sm italic max-w-md mx-auto" style={{ color: 'rgba(245,240,232,0.5)', fontFamily: 'Inter' }}>
                {getLocalizedEtymologyHint(entry, lang)}
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
                  title={getLocalizedPhoneticTooltip(phoneticRating, lang)}
                >
                  {t('detail.phoneticReliability')}: {getLocalizedPhoneticLabel(phoneticRating.rating, lang)}
                  <span className="font-mono text-[0.6875rem] opacity-70">
                    ({phoneticRating.charPinyin} ← {phoneticRating.phoneticPinyin})
                  </span>
                </span>
              </div>
            )}

            {/* Detailed Phonetic Level (6-level) — for pictophonetic chars */}
            {phoneticLevelDetail && (
              <div className="mt-2 flex justify-center">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    background: getPhoneticLevelInfo(phoneticLevelDetail.level).color + '18',
                    color: getPhoneticLevelInfo(phoneticLevelDetail.level).color,
                    border: `1px solid ${getPhoneticLevelInfo(phoneticLevelDetail.level).color}40`,
                    fontFamily: 'Inter, sans-serif',
                  }}
                  title={lang === 'zh' ? getPhoneticLevelInfo(phoneticLevelDetail.level).description : PHONETIC_LEVEL_DESCRIPTIONS_EN[phoneticLevelDetail.level]}
                >
                  {t('detail.phoneticRelation')}: {lang === 'zh' ? getPhoneticLevelInfo(phoneticLevelDetail.level).label : getPhoneticLevelInfo(phoneticLevelDetail.level).enLabel}
                  <span className="font-mono text-[0.625rem] opacity-70">
                    ({lang === 'zh' ? getPhoneticLevelInfo(phoneticLevelDetail.level).enLabel : getPhoneticLevelInfo(phoneticLevelDetail.level).label})
                  </span>
                  {lang === 'zh' && (
                    <span className="text-[0.625rem] opacity-50 ml-0.5">
                      — {getPhoneticLevelInfo(phoneticLevelDetail.level).example.split('。')[0]}
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* Semantic Relation Level (8-level) — for pictophonetic chars */}
            {semanticLevelDetail && (
              <div className="mt-2 flex justify-center">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    background: getSemanticLevelInfo(semanticLevelDetail.level).color + '18',
                    color: getSemanticLevelInfo(semanticLevelDetail.level).color,
                    border: `1px solid ${getSemanticLevelInfo(semanticLevelDetail.level).color}40`,
                    fontFamily: 'Inter, sans-serif',
                  }}
                  title={lang === 'zh' ? semanticLevelDetail.note : SEMANTIC_LEVEL_DESCRIPTIONS_EN[semanticLevelDetail.level]}
                >
                  {t('detail.semanticRelation')}: {lang === 'zh' ? getSemanticLevelInfo(semanticLevelDetail.level).label : getSemanticLevelInfo(semanticLevelDetail.level).enLabel}
                  <span className="font-mono text-[0.625rem] opacity-70">
                    ({lang === 'zh' ? getSemanticLevelInfo(semanticLevelDetail.level).enLabel : getSemanticLevelInfo(semanticLevelDetail.level).label})
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
                  {getLocalizedGhostSuggestion(char, lang) ?? ghostInfo}
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
                  {t('detail.traditionalDataSource')}: {entry.traditional}
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Hero quick search ── */}
      <div className="border-b" style={{ background: '#FDFBF6', borderColor: 'rgba(26,26,24,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <form
            onSubmit={(e) => { e.preventDefault(); runSearch(searchQuery); }}
            className="flex items-center gap-2"
          >
            <div
              className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: '#F5F0E8', border: '1px solid rgba(26,26,24,0.1)' }}
            >
              <Search size={16} style={{ color: '#8B6914', flexShrink: 0 }} />
              <input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); if (searchError) setSearchError(''); }}
                placeholder={t('detail.searchPlaceholder')}
                aria-label={t('detail.searchPlaceholder')}
                maxLength={12}
                className="w-full bg-transparent text-sm outline-none"
                style={{ color: '#1A1A18', fontFamily: 'Inter, sans-serif' }}
              />
            </div>
            <button
              type="submit"
              className="flex-shrink-0 rounded-xl px-5 py-2 text-sm font-semibold transition-all hover:scale-105"
              style={{ background: '#C23B2A', color: '#F5F0E8', fontFamily: 'Inter, sans-serif' }}
            >
              {t('detail.searchButton')}
            </button>
          </form>
          {searchError && (
            <p className="mt-1.5 text-xs" style={{ color: '#C23B2A', fontFamily: 'Inter, sans-serif' }}>{searchError}</p>
          )}
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="sticky top-16 z-30 border-b shadow-sm" style={{ background: '#FDFBF6', borderColor: 'rgba(26,26,24,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 flex items-center">
          <div className="flex min-w-max gap-0 flex-1 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex items-center gap-2 px-5 py-3.5 text-[0.9375rem] font-semibold transition-all duration-200"
                  style={{
                    color: isActive ? '#C23B2A' : '#5A5548',
                    fontFamily: 'Inter, sans-serif',
                    borderBottom: isActive ? '3px solid #C23B2A' : '3px solid transparent',
                  }}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{t(tab.labelKey)}</span>
                </button>
              );
            })}
          </div>
          {/* Prominent WordBook button */}
          <button
            onClick={() => toggleWordBook(char)}
            className="flex-shrink-0 ml-3 px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 hover:shadow-md"
            style={{
              background: hasInWordBook(char) ? '#2D5F8A' : '#FDFBF6',
              color: hasInWordBook(char) ? '#fff' : '#2D5F8A',
              border: hasInWordBook(char) ? 'none' : '2px solid #2D5F8A',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {hasInWordBook(char) ? `📗 ${t('common.inWordBook')}` : `📖 ${t('common.addToWordBook')}`}
          </button>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <AnimatePresence mode="wait">
          {/* ── Tab: 知识卡片 ── */}
          {activeTab === 'card' && (
            <motion.div key="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="space-y-6">
              {/* 字形演变脉络 与 笔画动画 并置 */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-6 items-stretch">
                {/* 字形演变 */}
                <div className="rounded-2xl p-6 flex flex-col" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
                  <h2 className="text-xl font-display mb-4" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>{t('detail.tabs.glyph')}</h2>
                  <div className="flex flex-col justify-center">
                    <GlyphEvolutionTimeline character={char} traditional={entry?.traditional} />
                  </div>

                  {/* 演变说明（说文解字） */}
                  {shuowen && (shuowen.structure || shuowen.sixBooks || shuowen.shuowen) && (
                    <div className="mt-5 pt-5 border-t" style={{ borderColor: 'rgba(26,26,24,0.08)' }}>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-sm font-semibold" style={{ color: '#C23B2A', fontFamily: '"Noto Serif SC", serif' }}>{t('detail.shuowenTitle')}</span>
                        <span className="text-[0.5625rem] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(194,59,42,0.1)', color: '#C23B2A', fontFamily: 'Inter' }}>Shuowen Jiezi</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {shuowen.structure && (
                          <span className="text-[0.6875rem] px-2.5 py-1 rounded-lg font-medium" style={{ background: 'rgba(45,95,138,0.08)', color: '#2D5F8A', fontFamily: 'Inter', border: '1px solid rgba(45,95,138,0.15)' }}>
                            {t('detail.structure')}: {shuowen.structure}
                          </span>
                        )}
                        {shuowen.sixBooks && (
                          <span className="text-[0.6875rem] px-2.5 py-1 rounded-lg font-medium" style={{ background: 'rgba(107,127,94,0.1)', color: '#6B7F5E', fontFamily: 'Inter', border: '1px solid rgba(107,127,94,0.2)' }}>
                            {t('detail.sixBooks')}: {shuowen.sixBooks}
                          </span>
                        )}
                      </div>

                      {lang === 'en' && shuowen.enShuowen ? (
                        <p className="text-[0.75rem] leading-relaxed" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>{shuowen.enShuowen}</p>
                      ) : (
                        <p className="text-[0.75rem] leading-relaxed" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>{getShuowenSummary(shuowen, entry, lang, t)}</p>
                      )}

                      {shuowen.shuowen && (
                        <details className="mt-2">
                          <summary className="text-[0.6875rem] font-medium cursor-pointer inline-flex items-center gap-1 select-none" style={{ color: '#C23B2A', fontFamily: 'Inter' }}>
                            {lang === 'en' ? t('detail.viewOriginalWenyan') : t('detail.viewOriginal')}
                          </summary>
                          <p className="mt-2 text-[0.6875rem] leading-relaxed font-serif-cn rounded-lg p-3 max-h-36 overflow-y-auto" style={{ background: 'rgba(245,240,232,0.5)', color: '#5A5548' }}>
                            {shuowen.shuowen}
                          </p>
                        </details>
                      )}
                    </div>
                  )}
                </div>

                {/* 笔画动画 */}
                <div className="rounded-2xl p-6 flex flex-col" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
                  <h2 className="text-xl font-display mb-4" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>{t('detail.strokeOrder')}</h2>
                  <div className="flex flex-1 items-center justify-center">
                    <StrokeOrder character={char} size={300} />
                  </div>
                </div>
              </div>

              {/* 词语搭配组合 */}
              <div className="rounded-2xl p-6" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-xl font-display" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>{t('detail.wordsAndAllusions')}</h2>
                  <span className="text-[10px]" style={{ color: 'rgba(139,105,20,0.6)', fontFamily: 'Inter' }}>{t('detail.wordsSourceNote')}</span>
                </div>

                {wordFamilies ? (
                  <WordFamilies data={wordFamilies} char={char} />
                ) : (
                  <>
                    {cultural?.words && cultural.words.length > 0 && (
                      <div className="mb-5">
                        <h3 className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#8B6914', fontFamily: 'Inter' }}>{t('detail.commonWords')}</h3>
                        <div className="flex flex-wrap gap-2">
                          {cultural.words.map((w, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-serif-cn" style={{ background: 'rgba(107,127,94,0.1)', color: '#6B7F5E', fontFamily: '"Noto Serif SC", serif' }}>
                              {w}
                              <SpeakButton text={w} size={12} />
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {cultural?.allusions && cultural.allusions.length > 0 && (
                      <div>
                        <h3 className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#8B6914', fontFamily: 'Inter' }}>{t('detail.historicalAllusions')}</h3>
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

                    {!cultural?.words?.length && !cultural?.allusions?.length && (
                      <p className="text-sm" style={{ color: '#9CA3AF' }}>{t('detail.wordsEmpty')}</p>
                    )}
                  </>
                )}
              </div>

              {/* 拆解网络 */}
              {decomposition && (
                <div className="rounded-2xl p-4" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
                  <div className="flex items-center gap-2 mb-2 px-2">
                    <GitBranch size={16} className="text-cinnabar" />
                    <span className="text-sm font-semibold uppercase tracking-[0.06em]" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>{t('detail.decompNetwork')}</span>
                    <span className="ml-auto text-[10px]" style={{ color: 'rgba(139,105,20,0.6)', fontFamily: 'Inter' }}>{t('common.clickForDetails')}</span>
                  </div>
                  <div className="h-[460px] sm:h-[380px]">
                    <DecompositionGraph
                      decomposition={decomposition}
                      onNodeClick={navigateToChar}
                      onNodeDoubleClick={navigateToExploreChar}
                    />
                  </div>
                </div>
              )}

              {/* 系联网络 */}
              <div className="rounded-2xl p-4" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
                <div className="flex items-center gap-2 mb-2 px-2">
                  <Globe size={16} className="text-cinnabar" />
                  <span className="text-sm font-semibold uppercase tracking-[0.06em]" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>{t('detail.cognateNetwork')}</span>
                  <span className="ml-auto text-[10px]" style={{ color: 'rgba(139,105,20,0.6)', fontFamily: 'Inter' }}>{t('common.clickForDetails')}</span>
                </div>
                <div className="h-[460px] sm:h-[380px]">
                  <CognateGraph
                    character={char}
                    onNodeClick={navigateToChar}
                    onNodeDoubleClick={navigateToExploreChar}
                  />
                </div>
              </div>

              {/* Etymology text */}
              {cultural?.evolution && (
                <div className="rounded-2xl p-6" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
                  <h2 className="text-xl font-display mb-3" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>{t('detail.etymology')}</h2>
                  <p className="text-sm leading-relaxed" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>
                    {lang === 'en' ? (cultural.enEvolution ?? cultural.evolution) : cultural.evolution}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Tab: 字形演变 ── */}
          {activeTab === 'glyph' && (
            <motion.div key="glyph" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <div className="rounded-2xl p-6" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
                <h2 className="text-xl font-display mb-4" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>{t('detail.tabs.glyph')}</h2>
                <GlyphEvolution character={char} traditional={entry?.traditional} shuowen={shuowen} />
              </div>
            </motion.div>
          )}

          {/* ── Tab: 拆解系联 ── */}
          {activeTab === 'decomp-link' && (
            <motion.div key="decomp-link" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="space-y-6">
              {/* 子标签切换：拆解网络 / 系联网络 */}
              <div className="flex w-fit items-center gap-1 rounded-xl p-1" style={{ background: 'rgba(245,240,232,0.8)', border: '1px solid rgba(26,26,24,0.08)' }}>
                <button onClick={() => setNetView('decomp')} className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all" style={netView === 'decomp' ? { background: '#1A1A18', color: '#F5F0E8' } : { background: 'transparent', color: '#8B6914' }}>
                  {t('detail.decompNetwork')}
                </button>
                <button onClick={() => setNetView('cognate')} className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all" style={netView === 'cognate' ? { background: '#1A1A18', color: '#F5F0E8' } : { background: 'transparent', color: '#8B6914' }}>
                  {t('detail.cognateNetwork')}
                </button>
              </div>

              {netView === 'decomp' && (
                <>
              {/* Decomposition Graph（含简/繁拆法切换：整个板块一起切换） */}
              {activeDecomposition && (
                <div className="rounded-2xl p-4" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
                  <div className="flex items-center gap-2 mb-2 px-2 flex-wrap">
                    <GitBranch size={16} className="text-cinnabar" />
                    <span className="text-sm font-semibold uppercase tracking-[0.06em]" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>{t('detail.charDecomposition')}</span>
                    <span className="font-serif-cn text-sm" style={{ color: 'rgba(139,105,20,0.6)' }}>{t('detail.charDecomposition')}</span>

                    {/* 简/繁拆法切换 */}
                    {tradTarget && tradTarget !== char && tradDecomposition && decomposition && (
                      <div className="ml-auto flex items-center gap-1 rounded-xl p-1" style={{ background: 'rgba(245,240,232,0.8)', border: '1px solid rgba(26,26,24,0.08)' }}>
                        <button
                          onClick={() => setDecompMode('simp')}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          style={decompMode === 'simp' ? { background: '#1A1A18', color: '#F5F0E8' } : { background: 'transparent', color: '#8B6914' }}
                        >
                          {t('common.simplified')} <span className="font-serif-cn text-sm">{char}</span>
                        </button>
                        <button
                          onClick={() => setDecompMode('trad')}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          style={decompMode === 'trad' ? { background: '#1A1A18', color: '#F5F0E8' } : { background: 'transparent', color: '#8B6914' }}
                        >
                          {t('common.traditional')} <span className="font-serif-cn text-sm">{tradTarget}</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] px-2" style={{ color: 'rgba(139,105,20,0.6)', fontFamily: 'Inter' }}>{t('common.clickForDetails')}</span>
                  <div className="h-[460px] sm:h-[380px]">
                    <DecompositionGraph
                      key={decompMode}
                      decomposition={activeDecomposition}
                      onNodeClick={navigateToChar}
                      onNodeDoubleClick={navigateToExploreChar}
                    />
                  </div>
                </div>
              )}

              {/* Component Annotations */}
              {componentAnnotations.length > 0 && (
                <div className="rounded-2xl p-6" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.06em] mb-4" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>
                    {t('detail.componentNotes')}
                    <span className="ml-2 font-serif-cn text-xs font-normal normal-case" style={{ color: 'rgba(139,105,20,0.6)' }}>{t('detail.componentNotes')}</span>
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
                              {getLocalizedAnnotationName(annotation, lang)}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(194,59,42,0.12)', color: '#C23B2A', fontFamily: 'Inter' }}>
                              {component} → {annotation.original}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: '#8B6914', fontFamily: 'Inter' }}>
                            {getLocalizedAnnotationDescription(annotation, lang)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Ghost Component Annotations within the same card (简体模式) */}
                  {decompMode === 'simp' && ghostComponentAnnotations.length > 0 && (
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(176,173,165,0.3)' }}>
                      <h3 className="text-xs font-semibold uppercase tracking-[0.06em] mb-3" style={{ color: '#A39E93', fontFamily: 'Inter' }}>
                        {t('detail.ghostComponents')}
                        <span className="ml-2 font-serif-cn text-xs font-normal normal-case" style={{ color: 'rgba(176,173,165,0.8)' }}>{t('detail.ghostComponents')}</span>
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

              {/* Standalone ghost component annotations when no regular annotations exist (简体模式) */}
              {decompMode === 'simp' && componentAnnotations.length === 0 && ghostComponentAnnotations.length > 0 && (
                <div className="rounded-2xl p-6" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.06em] mb-4" style={{ color: '#A39E93', fontFamily: 'Inter' }}>
                    {t('detail.ghostComponents')}
                    <span className="ml-2 font-serif-cn text-xs font-normal normal-case" style={{ color: 'rgba(176,173,165,0.8)' }}>{t('detail.ghostComponents')}</span>
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
                        {t('detail.fullDecompTree')}
                      </span>
                      <span className="font-serif-cn text-xs" style={{ color: 'rgba(139,105,20,0.5)' }}>{t('detail.fullDecompTree')}</span>
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
                                    {getLocalizedAnnotationName(variantBadge, lang)}
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
                </>
              )}

              {netView === 'cognate' && (
                <>
              {/* 系联网络 */}
              <div className="rounded-2xl p-4" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
                <div className="flex items-center gap-2 mb-2 px-2">
                  <Globe size={16} className="text-cinnabar" />
                  <span className="text-sm font-semibold uppercase tracking-[0.06em]" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>{t('detail.cognateNetwork')}</span>
                  <span className="ml-auto text-[10px]" style={{ color: 'rgba(139,105,20,0.6)', fontFamily: 'Inter' }}>{t('common.clickForDetails')}</span>
                </div>
                <div className="h-[460px] sm:h-[380px]">
                  <CognateGraph
                    character={char}
                    onNodeClick={navigateToChar}
                    onNodeDoubleClick={navigateToExploreChar}
                  />
                </div>
              </div>

              {/* Preview: Top 5 scored relations */}
              <div className="rounded-2xl p-6" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
                <h2 className="text-xl font-display mb-4" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>{t('detail.characterRelations')}</h2>
                {topRelations.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
                    {topRelations.map(rel => {
                      const info = getCharacter(rel.character);
                      return (
                        <motion.button key={rel.character} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}
                          onClick={() => goToDetail(rel.character)}
                          className="flex flex-col items-center rounded-xl p-3 text-center transition-all"
                          style={{ background: '#F5F0E8', border: '1px solid rgba(26,26,24,0.06)' }}
                        >
                          <span className="text-2xl font-display-cn" style={{ color: '#1A1A18', fontFamily: '"Ma Shan Zheng", cursive' }}>{rel.character}</span>
                          {info && (
                            <>
                              <span className="text-[10px] mt-0.5" style={{ color: '#C4A265', fontFamily: 'Inter' }}>{info.pinyin[0]}</span>
                              <span className="text-[9px] mt-0.5 line-clamp-1" style={{ color: '#8B6914', fontFamily: 'Inter' }}>{info.definition.slice(0, 10)}</span>
                            </>
                          )}
                          <span className="text-xs font-bold mt-1" style={{ color: '#C23B2A', fontFamily: 'Inter' }}>{rel.totalScore}pts</span>
                          {rel.tags.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-0.5 mt-0.5">
                              {rel.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-[7px] font-semibold px-1 py-px rounded-full"
                                  style={{ background: TAG_COLORS[tag] + '18', color: TAG_COLORS[tag], fontFamily: 'Inter' }}
                                >{t(`data.tags.${tag}`)}</span>
                              ))}
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm mb-4" style={{ color: '#8B6914', fontFamily: 'Inter' }}>{t('detail.noRelations')}</p>
                )}

                {/* View All button */}
                <button
                  onClick={() => navigate(`/relations?char=${encodeURIComponent(char)}`)}
                  className="w-full py-3 rounded-xl text-sm font-medium transition-all hover:scale-[1.01]"
                  style={{
                    background: 'linear-gradient(135deg, #C23B2A 0%, #9B2226 100%)',
                    color: '#F5F0E8',
                    fontFamily: 'Inter',
                    boxShadow: '0 2px 12px rgba(194,59,42,0.2)',
                  }}
                >
                  {t('detail.viewAllRelations', { n: relations ? (
                    relations.differentiations.length + relations.phoneticFamily.length + relations.semanticFamily.length +
                    relations.sharedComponents.length + relations.containedIn.length + relations.homophones.length +
                    relations.nearHomophones.length + relations.antonyms.length + relations.radicalFamily.length
                  ) : 0 })}
                </button>
              </div>

              {/* Full relation lists (collapsed by default) */}
              {relatedCharMap && relatedCharMap.size > 0 && (
                <details className="rounded-2xl p-6" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
                  <summary className="text-sm font-medium cursor-pointer" style={{ color: '#8B6914', fontFamily: 'Inter' }}>
                    {t('detail.allRelationsByCategory', { n: relatedCharMap.size })}
                  </summary>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 mt-4">
                    {[...relatedCharMap.entries()].map(([c, types]) => {
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
                          <div className="flex flex-wrap justify-center gap-0.5 mt-1">
                            {types.map(t => (
                              <span key={t.label} className="text-[8px] font-semibold px-1 py-px rounded-full"
                                style={{ background: t.color + '18', color: t.color, fontFamily: 'Inter' }}
                              >{lang === 'zh' ? t.label : t.en}</span>
                            ))}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </details>
              )}
                </>
              )}
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
