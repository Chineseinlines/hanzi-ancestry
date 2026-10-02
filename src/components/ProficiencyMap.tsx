import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { computeProficiency, type Band } from '../lib/proficiency';
import type { UserStats } from '../lib/database';

const BAND_COLOR: Record<Band, string> = {
  elementary: '#2F7D5B',
  intermediate: '#2D5F8A',
  advanced: '#B4762A',
};

const BAND_ROWS: { band: Band; labelKey: string }[] = [
  { band: 'advanced', labelKey: 'proficiency.bandAdvanced' },
  { band: 'intermediate', labelKey: 'proficiency.bandIntermediate' },
  { band: 'elementary', labelKey: 'proficiency.bandElementary' },
];

const CN_NUM = ['', '一', '二', '三', '四', '五', '六'];

export default function ProficiencyMap({ stats }: { stats: UserStats }) {
  const { t, lang } = useLanguage();
  const p = computeProficiency(stats);

  const levelText = (level: number) =>
    level === 7
      ? t('proficiency.levelAdvanced')
      : lang === 'zh'
        ? `${CN_NUM[level]}级`
        : t('proficiency.levelN', { n: level });

  const bandText = (band: Band) =>
    t(
      band === 'advanced'
        ? 'proficiency.bandAdvanced'
        : band === 'intermediate'
          ? 'proficiency.bandIntermediate'
          : 'proficiency.bandElementary',
    );

  return (
    <section
      className="mb-10 rounded-3xl p-6 sm:p-8"
      style={{ background: '#FDFBF6', border: '1px solid #E5E0D8' }}
    >
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2
            className="text-xl font-display"
            style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}
          >
            {t('proficiency.title')}
          </h2>
          <p className="mt-1 text-xs" style={{ color: '#9CA3AF' }}>
            {t('proficiency.subtitle')}
          </p>
        </div>
        <div className="text-right">
          <div className="text-[0.65rem] uppercase tracking-[0.12em]" style={{ color: '#9CA3AF' }}>
            {t('proficiency.current')}
          </div>
          <div className="text-lg font-semibold" style={{ color: BAND_COLOR[p.band] }}>
            {p.hasData ? `${bandText(p.band)} · ${levelText(p.level)}` : t('proficiency.unrated')}
          </div>
        </div>
      </div>

      {/* Ladder */}
      <div className="space-y-3">
        {BAND_ROWS.map((row) => {
          const nodes = p.nodes.filter((n) => n.band === row.band);
          return (
            <div key={row.band} className="flex items-center gap-3">
              <div
                className="w-12 shrink-0 text-xs font-medium"
                style={{ color: BAND_COLOR[row.band] }}
              >
                {t(row.labelKey)}
              </div>
              <div className="flex flex-1 gap-2">
                {nodes.map((n) => {
                  const isCurrent = p.hasData && n.level === p.level;
                  const achieved = p.hasData && n.achieved;
                  return (
                    <motion.div
                      key={n.level}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: n.level * 0.04 }}
                      className="flex flex-1 flex-col items-center rounded-xl px-1 py-2"
                      style={{
                        background: achieved ? BAND_COLOR[row.band] : 'transparent',
                        border: `1.5px solid ${achieved ? BAND_COLOR[row.band] : '#E5E0D8'}`,
                        boxShadow: isCurrent ? `0 0 0 3px ${BAND_COLOR[row.band]}22` : 'none',
                      }}
                    >
                      <span
                        className="text-sm font-semibold"
                        style={{ color: achieved ? '#FDFBF6' : '#9CA3AF' }}
                      >
                        {levelText(n.level)}
                      </span>
                      <span
                        className="mt-0.5 text-[0.6rem]"
                        style={{ color: achieved ? 'rgba(253,251,246,0.75)' : '#C4C4C4' }}
                      >
                        {t('proficiency.targetChars', { n: n.target })}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dimensions */}
      <div className="mt-6 border-t pt-5" style={{ borderColor: '#E5E0D8' }}>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: '#6B7280' }}>
            {t('proficiency.dimensions')}
          </span>
          <span className="text-xs" style={{ color: '#9CA3AF' }}>
            {t('proficiency.index')} <b style={{ color: '#1A1A18' }}>{p.hasData ? p.score : '—'}</b>
          </span>
        </div>
        <div className="space-y-2.5">
          {p.dimensions.map((d) => (
            <div key={d.key} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-[0.7rem]" style={{ color: '#6B7280' }}>
                {t(`proficiency.dim_${d.key}`)}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: '#EFEAE1' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: BAND_COLOR[p.band] }}
                  initial={{ width: 0 }}
                  animate={{ width: `${p.hasData ? d.value : 0}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
              <span className="w-9 shrink-0 text-right text-[0.7rem] font-medium" style={{ color: '#1A1A18' }}>
                {p.hasData ? `${d.value}%` : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer hint */}
      <p className="mt-5 text-[0.7rem] leading-relaxed" style={{ color: '#9CA3AF' }}>
        {!p.hasData
          ? t('proficiency.noData')
          : p.next
            ? t('proficiency.toNext', { level: levelText(p.next.level), n: p.next.remaining })
            : t('proficiency.maxLevel')}
        {' · '}
        {t('proficiency.estimateNote')}
      </p>
    </section>
  );
}