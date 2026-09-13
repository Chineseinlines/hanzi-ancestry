import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, GitBranch, Layers, BookOpen, Gamepad2, GraduationCap, Compass } from 'lucide-react';
import { hasCharacter, loadData, searchByPinyin, searchByEnglish, searchByChineseMeaning, hasCJK } from '../data/hanziData';
import type { EnglishSearchResult } from '../data/hanziData';
import { useLanguage } from '../contexts/LanguageContext';

/* ─────────────────────────── animation variants ─────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, delay, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] },
  }),
};

const brushReveal = {
  hidden: { clipPath: 'inset(0 100% 0 0)' },
  visible: (delay: number = 0) => ({
    clipPath: 'inset(0 0% 0 0)',
    transition: { duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: (stagger: number = 0.12) => ({
    transition: { staggerChildren: stagger },
  }),
};

/* ──────────────────────────────── Hero ─────────────────────────────────── */

type SearchMode = 'auto' | 'hanzi' | 'pinyin' | 'english';

const SEARCH_MODES: { key: SearchMode; labelKey: string }[] = [
  { key: 'auto', labelKey: 'explore.modeAuto' },
  { key: 'hanzi', labelKey: 'explore.modeHanzi' },
  { key: 'pinyin', labelKey: 'explore.modePinyin' },
  { key: 'english', labelKey: 'explore.modeEn' },
];

const PRESET_CHARS = ['家', '国'];

function HeroSection() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [searchChar, setSearchChar] = useState('');
  const [searchError, setSearchError] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('auto');
  const [enResults, setEnResults] = useState<EnglishSearchResult | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    loadData(); // Pre-load character data before search
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = async () => {
    if (!searchChar.trim()) return;
    await loadData(); // Ensure data is loaded before searching
    const raw = searchChar.trim();

    const tryHanzi = (): string | null => {
      const hanzi: string[] = [];
      for (const ch of raw) {
        const cp = ch.codePointAt(0);
        if (cp && cp >= 0x4E00 && cp <= 0x9FFF) hanzi.push(ch);
      }
      if (hanzi.length > 0 && hasCharacter(hanzi[0])) return hanzi[0];
      return null;
    };

    const tryPinyin = (): string | null => {
      const results = searchByPinyin(raw);
      return results.length > 0 ? results[0].char : null;
    };

    let char: string | null = null;

    // zh 模式：拼音 + 中文释义搜索；en 模式：拼音 + 英文索引搜索
    const tryMeaningSearch = async (): Promise<boolean> => {
      if (lang === 'zh') {
        const results = searchByChineseMeaning(raw);
        if (results.length > 0) {
          setSearchError('');
          setEnResults({ words: [], chars: results });
          return true;
        }
        return false;
      }
      const enRes = await searchByEnglish(raw);
      if (enRes.words.length > 0 || enRes.chars.length > 0) {
        setSearchError('');
        setEnResults(enRes);
        return true;
      }
      return false;
    };

    switch (searchMode) {
      case 'hanzi':
        char = tryHanzi();
        if (!char) { setSearchError(t('home.errorNoHanzi')); return; }
        break;
      case 'pinyin':
        char = tryPinyin();
        if (!char) { setSearchError(t('home.errorNoPinyin')); return; }
        break;
      case 'english': {
        const found = await tryMeaningSearch();
        if (!found) {
          setSearchError(lang === 'zh' ? t('home.errorNoResults') : t('home.errorNoEnglish'));
          setEnResults(null);
          return;
        }
        return; // Show results panel, don't navigate
      }
      case 'auto':
      default:
        if (hasCJK(raw)) {
          char = tryHanzi();
          if (!char) { setSearchError(t('home.errorNotInDb')); return; }
        } else {
          // Try pinyin first, then meaning search
          const pinyinChar = tryPinyin();
          if (pinyinChar) {
            char = pinyinChar;
          } else {
            const found = await tryMeaningSearch();
            if (found) return; // Show results panel
            setSearchError(t('home.errorNoResults'));
            return;
          }
        }
        break;
    }

    setSearchError('');
    navigate(`/explore?char=${encodeURIComponent(char)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <section
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#1A1A18' }}
    >
      {/* Background texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: 'url(./hero-bg-texture.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-[800px] flex-col items-center px-4 text-center">
        {/* Decorative bar */}
        <motion.div
          className="mb-6 h-[1px] bg-cinnabar"
          initial={{ width: 0 }}
          animate={{ width: 60 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
        />

        {/* Subtitle */}
        <motion.p
          className="mb-4 text-[0.75rem] font-medium uppercase tracking-[0.2em]"
          style={{ color: 'rgba(245, 240, 232, 0.5)' }}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          custom={0.4}
        >
          {t('home.heroSubtitle')}
        </motion.p>

        {/* Chinese title */}
        <motion.h1
          className="font-display-cn leading-[1.1] tracking-[0.02em] text-rice-paper"
          style={{ fontSize: 'clamp(4rem, 10vw, 8rem)' }}
          variants={brushReveal}
          initial="hidden"
          animate="visible"
          custom={0.6}
        >
          字里行间
        </motion.h1>

        {/* English title */}
        <motion.h2
          className="mt-2 font-display font-bold leading-[1.15] tracking-[-0.02em] text-rice-paper"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1.0}
        >
          LINES
        </motion.h2>

        {/* Tagline */}
        <motion.p
          className="mx-auto mt-6 max-w-[520px] text-base leading-relaxed"
          style={{ color: 'rgba(245, 240, 232, 0.65)' }}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1.2}
        >
          {t('home.tagline')}
        </motion.p>

        {/* Search bar */}
        <motion.div
          className="mt-10 w-full max-w-[480px]"
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          custom={1.4}
        >
          <div className="relative">
            <input
              type="text"
              maxLength={10}
              value={searchChar}
              onChange={(e) => {
                setSearchChar(e.target.value);
                setSearchError('');
                setEnResults(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder={t('home.placeholder')}
              className="h-14 w-full rounded-full border px-6 text-center text-2xl outline-none transition-all duration-300 focus:border-cinnabar"
              style={{
                backgroundColor: 'rgba(245, 240, 232, 0.08)',
                borderColor: 'rgba(245, 240, 232, 0.15)',
                color: '#F5F0E8',
              }}
            />
            <button
              onClick={handleSearch}
              className="absolute right-1 top-1 flex h-12 w-12 items-center justify-center rounded-full bg-cinnabar text-white transition-all duration-200 hover:scale-105 hover:bg-vermilion-light"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </div>
          {/* Search mode selector */}
          <div className="mt-3 flex items-center justify-center gap-1">
            {SEARCH_MODES.map((mode) => (
              <button
                key={mode.key}
                onClick={() => setSearchMode(mode.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${
                  searchMode === mode.key
                    ? 'bg-cinnabar text-white'
                    : 'text-rice-paper/50 hover:text-rice-paper/80'
                }`}
                style={searchMode !== mode.key ? { background: 'rgba(245,240,232,0.06)' } : {}}
              >
                {t(mode.labelKey)}
              </button>
            ))}
          </div>

          {/* Preset character chips */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-[0.625rem] text-rice-paper/25 mr-1">{t('home.tryLabel', { chars: '' })}</span>
            {PRESET_CHARS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setSearchChar(c);
                  navigate(`/explore?char=${encodeURIComponent(c)}`);
                }}
                className="rounded-full border px-3 py-1.5 font-serif-cn text-lg transition-all duration-200 hover:scale-110 hover:bg-cinnabar hover:text-white hover:border-cinnabar"
                style={{
                  borderColor: 'rgba(245, 240, 232, 0.18)',
                  color: '#F5F0E8',
                  background: 'rgba(245, 240, 232, 0.06)',
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* English search results panel */}
          <AnimatePresence>
            {enResults && (enResults.words.length > 0 || enResults.chars.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 mx-auto max-w-[540px] rounded-2xl p-5 text-left"
                style={{
                  background: 'rgba(245, 240, 232, 0.1)',
                  border: '1px solid rgba(245, 240, 232, 0.12)',
                }}
              >
                {/* Chinese words */}
                {enResults.words.length > 0 && (
                  <>
                    <p className="mb-3 text-[0.6875rem] font-medium uppercase tracking-wider text-rice-paper/40">
                      {t('home.wordsHeading', { q: searchChar })}
                    </p>
                    <div className="space-y-2 mb-4">
                      {enResults.words.slice(0, 12).map((w) => (
                        <div key={w.w} className="flex items-center gap-3 text-sm group">
                          <button
                            onClick={() => {
                              const firstChar = [...w.w].find(ch => {
                                const cp = ch.codePointAt(0);
                                return cp && cp >= 0x4E00 && cp <= 0x9FFF && hasCharacter(ch);
                              });
                              if (firstChar) navigate(`/explore?char=${encodeURIComponent(firstChar)}`);
                            }}
                            className="font-serif-cn text-xl font-semibold text-rice-paper min-w-[3rem] text-left hover:text-cinnabar transition-colors underline decoration-cinnabar/30 underline-offset-4 hover:decoration-cinnabar cursor-pointer"
                            title={`View "${w.w}"`}
                          >
                            {w.w}
                          </button>
                          <span className="text-xs text-rice-paper/30 font-mono">{w.p}</span>
                          <span className="text-xs text-rice-paper/50 truncate flex-1">{w.d}</span>
                        </div>
                      ))}
                    </div>
                    {enResults.words.length > 12 && (
                      <p className="text-[0.625rem] text-rice-paper/25 mb-3">
                        {t('explore.moreWords', { n: enResults.words.length - 12 })}
                      </p>
                    )}
                  </>
                )}

                {/* Unique characters */}
                {enResults.chars.length > 0 && (
                  <div className="pt-3 border-t border-rice-paper/10">
                    <p className="mb-2 text-[0.6875rem] font-medium uppercase tracking-wider text-rice-paper/40">
                      {t('explore.allChars')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {enResults.chars.slice(0, 24).map((r) => (
                        <button
                          key={r.char}
                          onClick={() => navigate(`/explore?char=${encodeURIComponent(r.char)}`)}
                          className="rounded-lg px-3 py-1.5 text-lg font-serif-cn text-rice-paper hover:bg-cinnabar hover:text-white transition-all hover:scale-110"
                          style={{ background: 'rgba(245,240,232,0.08)' }}
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

          <AnimatePresence>
            {searchError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3"
              >
                <p className="text-sm text-vermilion-light">{searchError}</p>
                <p className="mt-2 text-xs text-rice-paper/40">
                  {t('home.tryLabel', { chars: '家 · 国' })}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        custom={1.8}
        style={{ opacity: scrolled ? 0 : 1, transition: 'opacity 0.3s' }}
      >
        <ChevronDown
          size={24}
          className="animate-bounce-subtle"
          style={{ color: 'rgba(245, 240, 232, 0.3)' }}
        />
      </motion.div>
    </section>
  );
}

/* ─────────────────── Feature Entry Cards ───────────────────────────────── */

function EntryCards() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const cards = [
    {
      icon: <Compass size={28} />,
      titleKey: 'home.cardLookupTitle',
      descKey: 'home.cardLookupDesc',
      action: () => navigate('/explore'),
      gradient: 'from-cinnabar to-vermilion-light',
    },
    {
      icon: <BookOpen size={28} />,
      titleKey: 'home.cardLearnTitle',
      descKey: 'home.cardLearnDesc',
      action: () => navigate('/learn'),
      gradient: 'from-graph-node-component to-[#4A7DB5]',
    },
    {
      icon: <Gamepad2 size={28} />,
      titleKey: 'home.cardGamesTitle',
      descKey: 'home.cardGamesDesc',
      action: () => navigate('/games'),
      gradient: 'from-[#C47B2A] to-[#E8A840]',
    },
    {
      icon: <GraduationCap size={28} />,
      titleKey: 'home.cardQuizTitle',
      descKey: 'home.cardQuizDesc',
      action: () => navigate('/quiz'),
      gradient: 'from-green-sage to-[#8DA37E]',
    },
  ];

  return (
    <section className="bg-rice-paper py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-12 text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          custom={0}
        >
          <h2 className="font-display font-bold text-ink-black" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
            {t('home.sectionTitle')}
          </h2>
          <p className="mt-3 text-base text-charcoal">
            {t('home.sectionSubtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {cards.map((card, i) => (
            <motion.button
              key={card.titleKey}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              custom={i * 0.12}
              whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(26,26,24,0.12)' }}
              whileTap={{ scale: 0.98 }}
              onClick={card.action}
              className="group flex flex-col items-start rounded-2xl p-6 text-left transition-shadow duration-300"
              style={{
                background: '#FDFBF6',
                boxShadow: '0 4px 20px rgba(26,26,24,0.06)',
                border: '1px solid transparent',
              }}
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}>
                {card.icon}
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-serif-cn text-xl font-bold text-ink-black">{t(card.titleKey)}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
                {t(card.descKey)}
              </p>
              <span className="mt-3 text-xs font-medium text-cinnabar opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {t('home.enter')}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── How It Works ──────────────────────────────────── */

function HowItWorks() {
  const { t } = useLanguage();
  const steps = [
    { num: '01', icon: <Search size={20} />, titleKey: 'home.step1Title', descKey: 'home.step1Desc' },
    { num: '02', icon: <GitBranch size={20} />, titleKey: 'home.step2Title', descKey: 'home.step2Desc' },
    { num: '03', icon: <Layers size={20} />, titleKey: 'home.step3Title', descKey: 'home.step3Desc' },
  ];

  return (
    <section className="bg-bg-warm py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div className="mb-14 text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} custom={0}>
          <h2 className="font-display font-bold text-ink-black" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>{t('home.howTitle')}</h2>
          <p className="mt-3 text-base text-charcoal">
            {t('home.howSubtitle')}
          </p>
        </motion.div>

        <motion.div className="grid grid-cols-1 gap-6 md:grid-cols-3" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} custom={0.2}>
          {steps.map((step) => (
            <motion.div key={step.num} variants={fadeUp} className="flex flex-col items-center text-center rounded-2xl p-6" style={{ background: '#FDFBF6', boxShadow: '0 2px 12px rgba(26,26,24,0.04)' }}>
              <span className="font-display text-[2rem] font-bold text-cinnabar/20">{step.num}</span>
              <motion.div variants={scaleIn} className="mt-3 flex h-16 w-16 items-center justify-center rounded-full border border-border-light bg-rice-paper text-cinnabar">
                {step.icon}
              </motion.div>
              <h3 className="mt-4 font-serif-cn text-lg font-semibold text-ink-black">{t(step.titleKey)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{t(step.descKey)}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────── CTA Banner ────────────────────────────────────── */

function CTABanner() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section
      className="py-20 md:py-24"
      style={{
        backgroundColor: '#1A1A18',
        background: 'radial-gradient(ellipse at center, rgba(194,59,42,0.08) 0%, transparent 70%), #1A1A18',
      }}
    >
      <div className="mx-auto max-w-[600px] px-4 text-center sm:px-6">
        <motion.h2
          className="font-display font-bold text-rice-paper"
          style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          custom={0}
        >
          {t('home.ctaTitle')}
        </motion.h2>

        <motion.p
          className="mt-4 text-base"
          style={{ color: 'rgba(245, 240, 232, 0.6)' }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          custom={0.15}
        >
          {t('home.ctaSubtitle')}
        </motion.p>

        <motion.div
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          custom={0.3}
        >
          <button
            onClick={() => navigate('/explore')}
            className="mt-8 inline-flex items-center rounded-full bg-cinnabar px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-vermilion-light hover:shadow-cinnabar"
          >
            {t('home.ctaButton')}
          </button>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Home Page ─────────────────────────────────── */

export default function Home() {
  return (
    <>
      <HeroSection />
      <EntryCards />
      <HowItWorks />
      <CTABanner />
    </>
  );
}
