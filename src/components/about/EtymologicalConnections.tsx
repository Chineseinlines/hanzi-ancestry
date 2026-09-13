import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, viewportOnce } from './variants';
import { useLanguage } from '../../contexts/LanguageContext';

const spearChars = [
  { char: '我', pinyin: 'wǒ' },
  { char: '战', pinyin: 'zhàn' },
  { char: '武', pinyin: 'wǔ' },
  { char: '戏', pinyin: 'xì' },
  { char: '戎', pinyin: 'róng' },
  { char: '戍', pinyin: 'shù' },
  { char: '戒', pinyin: 'jiè' },
  { char: '戮', pinyin: 'lù' },
];

export default function EtymologicalConnections() {
  const { t } = useLanguage();
  return (
    <section className="bg-rice-paper py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="mb-12 text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          custom={0}
        >
          <h2
            className="font-display font-bold leading-[1.25] tracking-[-0.01em] text-ink-black"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}
          >
            {t('about.hiddenConnections')}
          </h2>
          <p className="mt-3 text-base text-charcoal">
            {t('about.hcSubtitle')}
          </p>
        </motion.div>

        {/* Explanation text */}
        <motion.div
          className="mx-auto mb-12 max-w-[700px] space-y-4 text-base leading-[1.8] text-charcoal"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          custom={0.15}
        >
          <p>{t('about.hcP1')}</p>
          <p>{t('about.hcP2')}</p>
          <p>{t('about.hcP3')}</p>
        </motion.div>

        {/* Character cards */}
        <motion.div
          className="mx-auto max-w-[800px]"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          custom={0.1}
        >
          {/* Center component badge */}
          <motion.div
            variants={fadeUp}
            className="mb-8 flex flex-col items-center"
          >
            <div className="flex items-center gap-3 rounded-full bg-ink-black px-5 py-2">
              <span className="font-serif-cn text-[1.25rem] font-bold text-cinnabar">戈</span>
              <span className="text-[0.8125rem] text-rice-paper/70">{t('about.spearBadge')}</span>
            </div>
            <p className="mt-2 text-sm text-charcoal">
              {t('about.containingComp')}
            </p>
          </motion.div>

          {/* Character grid */}
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8 sm:gap-4">
            {spearChars.map((item) => (
              <motion.div
                key={item.char}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="group flex flex-col items-center rounded-lg bg-white p-3 shadow-md transition-all duration-300 hover:border hover:border-cinnabar hover:shadow-lg"
                style={{ border: '1px solid transparent' }}
              >
                <span className="font-display-cn text-[2rem] leading-none text-ink-black transition-colors duration-200 group-hover:text-cinnabar">
                  {item.char}
                </span>
                <span className="mt-1 font-mono text-[0.6875rem] text-cinnabar">
                  {item.pinyin}
                </span>
                <span className="mt-0.5 text-center text-[0.6875rem] leading-tight text-charcoal/70">
                  {t(`about.spearMeanings.${item.char}`)}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Explanation label */}
          <motion.p
            variants={fadeUp}
            className="mt-6 text-center text-sm text-charcoal"
          >
            {t('about.spearConclusion')}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
