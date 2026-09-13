import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, viewportOnce } from './variants';
import { useLanguage } from '../../contexts/LanguageContext';

const evolutionCards = [
  { char: '日', meaningKey: 'about.evoSun', descKey: 'about.evoSunDesc' },
  { char: '木', meaningKey: 'about.evoTree', descKey: 'about.evoTreeDesc' },
  { char: '森', meaningKey: 'about.evoForest', descKey: 'about.evoForestDesc' },
  { char: '明', meaningKey: 'about.evoBright', descKey: 'about.evoBrightDesc' },
];

function DecompositionDiagram() {
  const { t } = useLanguage();
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      custom={0.3}
      className="mx-auto mt-10 max-w-[500px] rounded-lg bg-white p-6 shadow-md md:p-8"
    >
      <div className="text-center">
        <h4 className="mb-4 font-serif-cn text-lg font-semibold text-ink-black">
          {t('about.decompExample')}
        </h4>

        {/* Forest character decomposition */}
        <div className="flex flex-col items-center gap-4">
          {/* Level 1: 森 */}
          <div className="flex items-center gap-3">
            <span className="font-display-cn text-[2.5rem] leading-none text-ink-black">
              森
            </span>
            <span className="font-mono text-sm text-charcoal">=</span>
            <span className="font-mono text-lg text-charcoal">⿱</span>
            <div className="flex items-center gap-2">
              <span className="font-display-cn text-[1.75rem] text-graph-node-component">木</span>
              <span className="font-mono text-sm text-charcoal">+</span>
              <span className="font-display-cn text-[1.75rem] text-graph-node-cognate">林</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-[1px] w-full bg-border-light" />

          {/* Level 2: 林 breaks down */}
          <div className="flex items-center gap-3">
            <span className="font-display-cn text-[1.5rem] text-graph-node-cognate">林</span>
            <span className="font-mono text-sm text-charcoal">=</span>
            <span className="font-mono text-lg text-charcoal">⿰</span>
            <div className="flex items-center gap-2">
              <span className="font-display-cn text-[1.25rem] text-graph-node-component">木</span>
              <span className="font-mono text-sm text-charcoal">+</span>
              <span className="font-display-cn text-[1.25rem] text-graph-node-component">木</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-[1px] w-full bg-border-light" />

          {/* Level 3: Full expansion */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-charcoal">{t('about.fullExpansion')}</span>
            <span className="font-mono text-base text-charcoal">⿱</span>
            <span className="font-display-cn text-lg text-graph-node-component">木</span>
            <span className="font-mono text-base text-charcoal">⿰</span>
            <span className="font-display-cn text-lg text-graph-node-component">木</span>
            <span className="font-display-cn text-lg text-graph-node-component">木</span>
          </div>

          <p className="mt-2 text-sm text-charcoal">
            <span className="font-display-cn text-lg text-ink-black">森</span>
            {' = '}
            <span className="font-serif-cn">{t('about.threeTrees')}</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function BuildingBlocks() {
  const { t } = useLanguage();
  return (
    <section className="bg-rice-paper py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          {/* Left column: text */}
          <div className="lg:col-span-3">
            <motion.h2
              className="font-display font-bold leading-[1.25] tracking-[-0.01em] text-ink-black"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              custom={0}
            >
              {t('about.buildingBlocks')}
            </motion.h2>

            <motion.div
              className="mt-6 max-w-[640px] space-y-4 text-base leading-[1.8] text-charcoal"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              custom={0.15}
            >
              <p>{t('about.bbP1')}</p>
              <p>{t('about.bbP2')}</p>
              <p>{t('about.bbP3')}</p>
            </motion.div>

            {/* Evolution cards */}
            <motion.div
              className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              custom={0.15}
            >
              {evolutionCards.map((card) => (
                <motion.div
                  key={card.char}
                  variants={fadeUp}
                  className="flex flex-col items-center rounded-lg bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md"
                >
                  <span className="font-display-cn text-[2.5rem] leading-none text-ink-black">
                    {card.char}
                  </span>
                  <span className="mt-2 text-[0.8125rem] font-medium text-cinnabar">
                    {t(card.meaningKey)}
                  </span>
                  <span className="mt-1 text-center text-[0.6875rem] leading-tight text-charcoal/60">
                    {t(card.descKey)}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right column: decomposition diagram */}
          <div className="lg:col-span-2">
            <DecompositionDiagram />

            {/* Secondary example */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              custom={0.4}
              className="mx-auto mt-6 max-w-[500px] rounded-lg bg-bg-warm p-5"
            >
              <h4 className="mb-3 text-center font-serif-cn text-base font-semibold text-ink-black">
                {t('about.anotherExample')}
              </h4>
              <div className="flex items-center justify-center gap-2">
                <span className="font-display-cn text-[2rem] text-ink-black">明</span>
                <span className="font-mono text-sm text-charcoal">=</span>
                <span className="font-mono text-base text-charcoal">⿰</span>
                <span className="font-display-cn text-[1.5rem] text-graph-node-component">日</span>
                <span className="font-mono text-sm text-charcoal">+</span>
                <span className="font-display-cn text-[1.5rem] text-graph-node-cognate">月</span>
              </div>
              <p className="mt-2 text-center text-sm text-charcoal">
                {t('about.sunMoonBright')}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
