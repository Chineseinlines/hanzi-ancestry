import { BookOpen, Database, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, viewportOnce } from './variants';
import { useLanguage } from '../../contexts/LanguageContext';

interface DataCardProps {
  icon: React.ReactNode;
  title: string;
  descriptionKey: string;
  link?: { textKey: string; href: string };
  stats?: { value: string; labelKey: string }[];
  index: number;
}

function DataCard({ icon, title, descriptionKey, link, stats, index }: DataCardProps) {
  const { t } = useLanguage();
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      custom={0.15 + index * 0.1}
      className="flex flex-col items-center rounded-lg bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg sm:p-8"
    >
      {/* Icon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cinnabar/10 text-cinnabar">
        {icon}
      </div>

      {/* Title */}
      <h3 className="mt-4 text-center font-serif-cn text-lg font-semibold text-ink-black">
        {title}
      </h3>

      {/* Description */}
      <p className="mt-3 text-center text-[0.9375rem] leading-[1.7] text-charcoal">
        {t(descriptionKey)}
      </p>

      {/* Stats */}
      {stats && stats.length > 0 && (
        <div className="mt-5 flex w-full items-center justify-center gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="font-display text-[1.25rem] font-bold text-cinnabar sm:text-[1.5rem]">
                {stat.value}
              </span>
              <span className="mt-0.5 text-[0.6875rem] text-charcoal">
                {t(stat.labelKey)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Link */}
      {link && (
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center text-[0.875rem] font-medium text-cinnabar transition-colors duration-200 hover:text-vermilion-light hover:underline"
        >
          {t(link.textKey)}
          <svg
            className="ml-1 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      )}
    </motion.div>
  );
}

const dataSources: Omit<DataCardProps, 'index'>[] = [
  {
    icon: <BookOpen size={24} />,
    title: 'Make Me A Hanzi',
    descriptionKey: 'about.ds1Desc',
    link: {
      textKey: 'about.viewOnGithub',
      href: 'https://github.com/skishore/makemeahanzi',
    },
    stats: [
      { value: '4,597', labelKey: 'about.charsStat' },
      { value: 'Full IDS', labelKey: 'about.coverageStat' },
      { value: 'Open', labelKey: 'about.sourceStat' },
    ],
  },
  {
    icon: <Database size={24} />,
    title: 'CHISE Project',
    descriptionKey: 'about.ds2Desc',
    link: {
      textKey: 'about.learnMore',
      href: 'https://www.chise.org/',
    },
    stats: [
      { value: '88,940+', labelKey: 'about.charsStat' },
      { value: 'CJK', labelKey: 'about.unifiedStat' },
      { value: 'IDS', labelKey: 'about.dataStat' },
    ],
  },
  {
    icon: <Globe size={24} />,
    title: 'CC-CEDICT',
    descriptionKey: 'about.ds3Desc',
    link: {
      textKey: 'about.learnMore',
      href: 'https://www.mdbg.net/chinese/dictionary?page=cc-cedict',
    },
    stats: [
      { value: '120K+', labelKey: 'about.entriesStat' },
      { value: 'Open', labelKey: 'about.licenseStat' },
      { value: 'Community', labelKey: 'about.maintainedStat' },
    ],
  },
];

export default function DataAttribution() {
  const { t } = useLanguage();
  return (
    <section className="bg-bg-warm py-16 md:py-20">
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
            {t('about.dataSources')}
          </h2>
          <p className="mt-3 text-base text-charcoal">
            {t('about.dataSourcesSubtitle')}
          </p>
        </motion.div>

        {/* Data cards grid */}
        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          custom={0.12}
        >
          {dataSources.map((source, i) => (
            <DataCard key={source.title} {...source} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
