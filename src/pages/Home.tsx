import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, GitBranch, Layers } from 'lucide-react';
import { getCharacter, hasCharacter, getCharacterLeaves, loadData } from '../data/hanziData';

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

function HeroSection() {
  const navigate = useNavigate();
  const [searchChar, setSearchChar] = useState('');
  const [searchError, setSearchError] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    loadData(); // Pre-load character data before search
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = () => {
    if (!searchChar.trim()) return;
    // Extract CJK chars from input (filter spaces/punctuation/pinyin)
    const hanzi: string[] = [];
    for (const ch of searchChar) {
      const cp = ch.codePointAt(0);
      if (cp && cp >= 0x4E00 && cp <= 0x9FFF) hanzi.push(ch);
    }
    if (hanzi.length === 0) {
      setSearchError('Please enter a Chinese character.');
      return;
    }
    const char = hanzi[0];
    if (!hasCharacter(char)) {
      setSearchError(`"${char}" is not in our database. Try another character.`);
      return;
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
          Explore the structure of
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
          Discover how Chinese characters decompose into components and find their etymological relatives
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
              }}
              onKeyDown={handleKeyDown}
              placeholder="输入汉字或粘贴文本..."
              className="h-14 w-full rounded-full border px-6 text-center font-serif-cn text-2xl outline-none transition-all duration-300 focus:border-cinnabar"
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
          <AnimatePresence>
            {searchError && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 text-sm text-vermilion-light"
              >
                {searchError}
              </motion.p>
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

/* ────────────────────── Featured Character Card ────────────────────────── */

interface FeaturedCardProps {
  char: string;
  index: number;
}

function FeaturedCard({ char, index }: FeaturedCardProps) {
  const navigate = useNavigate();
  const entry = getCharacter(char);
  if (!entry) return null;

  const leaves = getCharacterLeaves(char);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      custom={index * 0.15}
      whileHover={{ y: -6 }}
      onClick={() => navigate(`/explore?char=${encodeURIComponent(char)}`)}
      className="group cursor-pointer rounded-lg bg-white p-6 shadow-md transition-shadow duration-300 hover:border hover:border-cinnabar hover:shadow-lg"
      style={{ border: '1px solid transparent' }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div>
          <span className="font-display-cn text-[2.5rem] leading-none text-ink-black">
            {char}
          </span>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs text-cinnabar">
            {entry.pinyin[0] || ''}
          </p>
          <p className="mt-1 text-[0.8125rem] text-charcoal">
            {entry.definition}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="my-3 h-[1px] bg-border-light" />

      {/* IDS Preview */}
      <div className="font-mono text-base">
        {entry.decomposition && entry.decomposition !== '？' ? (
          <span>
            {entry.decomposition.split('').map((c, i) => {
              if ('⿰⿱⿴⿵⿶⿷⿸⿹⿺⿻⿳⿲'.includes(c)) {
                return (
                  <span key={i} className="text-charcoal">
                    {c}
                  </span>
                );
              }
              return (
                <span key={i} className="text-graph-node-component">
                  {c}
                </span>
              );
            })}
          </span>
        ) : (
          <span className="text-charcoal/40">Atomic character</span>
        )}
      </div>

      {/* Component preview */}
      {leaves.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {leaves.slice(0, 4).map((leaf) => {
            const leafEntry = getCharacter(leaf);
            return (
              <div key={leaf} className="flex flex-col items-center gap-0.5">
                <span className="font-serif-cn text-xl font-bold text-ink-black">
                  {leaf}
                </span>
                <span className="max-w-[60px] truncate text-[0.6875rem] text-charcoal/60">
                  {leafEntry?.definition || ''}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Explore link */}
      <div className="mt-4 flex justify-end">
        <span className="text-[0.8125rem] font-medium text-cinnabar transition-colors duration-200 group-hover:text-vermilion-light">
          Explore &rarr;
        </span>
      </div>
    </motion.div>
  );
}

/* ─────────────────── Featured Character Showcase ───────────────────────── */

function FeaturedShowcase() {
  const featuredChars = ['国', '森', '明', '好', '尊', '界'];

  return (
    <section className="bg-rice-paper py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="mb-4 text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          custom={0}
        >
          <h2
            className="font-display font-bold text-ink-black"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            See It In Action
          </h2>
          <p className="mt-3 text-base text-charcoal">
            Enter any character to reveal its hidden structure and find its relatives
          </p>
        </motion.div>

        {/* Ink wash divider */}
        <motion.div
          className="mx-auto mb-12 w-[200px]"
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          custom={0.2}
        >
          <img
            src="./ink-wash-divider.svg"
            alt=""
            className="w-full"
          />
        </motion.div>

        {/* Card grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {featuredChars.map((char, i) => (
            <FeaturedCard key={char} char={char} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── How It Works ──────────────────────────────────── */

function HowItWorks() {
  const steps = [
    {
      num: '01',
      icon: <Search size={24} />,
      title: 'Enter a Character',
      desc: 'Type any single Chinese character into the search field. Our database covers 1,111 characters with full decomposition data.',
    },
    {
      num: '02',
      icon: <GitBranch size={24} />,
      title: 'Watch It Decompose',
      desc: 'See the character break down into its structural components through IDS (Ideographic Description Sequence) parsing, visualized as an interactive tree graph.',
    },
    {
      num: '03',
      icon: <Layers size={24} />,
      title: 'Find Related Characters',
      desc: 'Explore cognate characters that share the same components. Each connection reveals an etymological thread woven through the writing system.',
    },
  ];

  return (
    <section className="bg-bg-warm py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="mb-16 text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          custom={0}
        >
          <h2
            className="font-display font-bold text-ink-black"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            How It Works
          </h2>
          <p className="mt-3 text-base text-charcoal">
            Three steps to uncover the hidden architecture of any character
          </p>
        </motion.div>

        {/* Steps grid */}
        <motion.div
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          custom={0.2}
        >
          {steps.map((step) => (
            <motion.div
              key={step.num}
              variants={fadeUp}
              className="flex flex-col items-center text-center"
            >
              {/* Number */}
              <span
                className="font-display text-[2.5rem] font-bold text-cinnabar/30"
              >
                {step.num}
              </span>

              {/* Icon circle */}
              <motion.div
                variants={scaleIn}
                className="mt-4 flex h-20 w-20 items-center justify-center rounded-full border border-border-light bg-rice-paper text-cinnabar"
              >
                {step.icon}
              </motion.div>

              {/* Title */}
              <h3
                className="mt-6 font-serif-cn text-xl font-semibold text-ink-black"
              >
                {step.title}
              </h3>

              {/* Description */}
              <p className="mt-3 leading-relaxed text-charcoal">
                {step.desc}
              </p>
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
          Ready to Explore?
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
          Start with any character and discover the hidden network beneath
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
            Start Exploring
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
      <FeaturedShowcase />
      <HowItWorks />
      <CTABanner />
    </>
  );
}
