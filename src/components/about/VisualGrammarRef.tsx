/**
 * Visual Grammar reference panel for the About page.
 * Explains the spatial rules governing Chinese character component combination.
 */
import { motion } from 'framer-motion';
import { Layout, Grid3X3, CheckCircle2, XCircle } from 'lucide-react';
import { fadeUp, viewportOnce } from './variants';
import { useLanguage } from '../../contexts/LanguageContext';

const EXAMPLE_STRUCTURES = [
  { ids: '⿰', label: '左右', en: 'Left-Right', example: '明 = 日 + 月' },
  { ids: '⿱', label: '上下', en: 'Top-Bottom', example: '音 = 立 + 日' },
  { ids: '⿴', label: '全包围', en: 'Enclose', example: '国 = 囗 + 玉' },
  { ids: '⿺', label: '左下包围', en: 'Bottom-Left Wrap', example: '过 = 辶 + 寸' },
  { ids: '⿸', label: '左上包围', en: 'Top-Left Wrap', example: '病 = 疒 + 丙' },
  { ids: '⿻', label: '穿插', en: 'Overlay', example: '中 = 口 + 丨' },
];

const DEFORMATION_EXAMPLES = [
  { base: '人', deformed: '亻', pos: '左', name: '单人旁', en: 'Person' },
  { base: '水', deformed: '氵', pos: '左', name: '三点水', en: 'Water' },
  { base: '心', deformed: '忄', pos: '左', name: '竖心旁', en: 'Heart' },
  { base: '手', deformed: '扌', pos: '左', name: '提手旁', en: 'Hand' },
  { base: '火', deformed: '灬', pos: '下', name: '四点底', en: 'Fire' },
  { base: '刀', deformed: '刂', pos: '右', name: '立刀旁', en: 'Knife' },
  { base: '犬', deformed: '犭', pos: '左', name: '反犬旁', en: 'Dog' },
  { base: '阜', deformed: '阝', pos: '左', name: '左耳旁', en: 'Mound' },
  { base: '邑', deformed: '阝', pos: '右', name: '右耳旁', en: 'City' },
  { base: '示', deformed: '礻', pos: '左', name: '示字旁', en: 'Altar' },
  { base: '衣', deformed: '衤', pos: '左', name: '衣字旁', en: 'Clothing' },
  { base: '食', deformed: '饣', pos: '左', name: '食字旁', en: 'Food' },
];

export default function VisualGrammarRef() {
  const { lang, t } = useLanguage();
  return (
    <section className="py-16" style={{ background: '#F5F0E8' }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mb-12 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Layout size={28} className="text-cinnabar" />
            <h2 className="font-display-cn text-3xl text-ink-black">
              {t('cmp.visualGrammar.title')}
            </h2>
          </div>
          <p className="mt-2 text-sm text-charcoal/60 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            {t('cmp.visualGrammar.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Structure Templates */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="rounded-2xl p-6 bg-white shadow-md"
          >
            <div className="flex items-center gap-2 mb-4">
              <Grid3X3 size={18} className="text-cinnabar" />
              <h3 className="font-serif-cn text-lg font-semibold text-ink-black">{t('cmp.visualGrammar.structureTemplates')}</h3>
              <span className="text-[0.625rem] text-charcoal/40 ml-auto" style={{ fontFamily: 'Inter' }}>Structure Templates</span>
            </div>
            <p className="text-sm text-charcoal/70 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              {t('cmp.visualGrammar.structureTemplatesDesc')}
            </p>
            <div className="space-y-2">
              {EXAMPLE_STRUCTURES.map(s => (
                <div key={s.ids} className="flex items-center gap-3 rounded-lg p-2.5" style={{ background: 'rgba(245,240,232,0.6)' }}>
                  <span className="text-xl font-mono w-10 text-center flex-shrink-0" style={{ color: '#C23B2A' }}>{s.ids}</span>
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-ink-black">{lang === 'zh' ? s.label : s.en}</span>
                    <span className="ml-2 text-xs text-charcoal/50 font-mono">{s.example}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Deformation Rules */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="rounded-2xl p-6 bg-white shadow-md"
          >
            <div className="flex items-center gap-2 mb-4">
              <Layout size={18} className="text-cinnabar" />
              <h3 className="font-serif-cn text-lg font-semibold text-ink-black">{t('cmp.visualGrammar.positionalVariants')}</h3>
              <span className="text-[0.625rem] text-charcoal/40 ml-auto" style={{ fontFamily: 'Inter' }}>Positional Variants</span>
            </div>
            <p className="text-sm text-charcoal/70 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              {t('cmp.visualGrammar.positionalVariantsDesc')}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEFORMATION_EXAMPLES.map(d => (
                <div key={`${d.base}-${d.deformed}`} className="flex items-center gap-2 rounded-lg p-2" style={{ background: 'rgba(245,240,232,0.6)' }}>
                  <span className="text-base font-serif-cn text-ink-black">{d.base}</span>
                  <span className="text-xs text-charcoal/30">→</span>
                  <span className="text-base font-serif-cn" style={{ color: '#C23B2A' }}>{d.deformed}</span>
                  <span className="text-[0.5625rem] ml-auto text-charcoal/40" style={{ fontFamily: 'Inter' }}>{lang === 'zh' ? d.name : d.en}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Correct vs Incorrect examples */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-8 rounded-2xl p-6 bg-white shadow-md"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="font-serif-cn text-lg font-semibold text-ink-black">{t('cmp.visualGrammar.validation')}</span>
            <span className="text-[0.625rem] text-charcoal/40" style={{ fontFamily: 'Inter' }}>Validation Examples</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Valid example */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(46,125,50,0.06)', border: '1px solid rgba(46,125,50,0.2)' }}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={14} style={{ color: '#2E7D32' }} />
                <span className="text-sm font-semibold" style={{ color: '#2E7D32', fontFamily: 'Inter' }}>{t('cmp.visualGrammar.validCombo')}</span>
              </div>
              <p className="text-xs mb-2" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>
                "氵" + "可" → "河"
              </p>
              <p className="text-[0.625rem]" style={{ color: '#8B6914', fontFamily: 'Inter' }}>
                {t('cmp.visualGrammar.validDesc')}
              </p>
            </div>
            {/* Invalid example */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(194,59,42,0.06)', border: '1px solid rgba(194,59,42,0.2)' }}>
              <div className="flex items-center gap-2 mb-2">
                <XCircle size={14} style={{ color: '#C23B2A' }} />
                <span className="text-sm font-semibold" style={{ color: '#C23B2A', fontFamily: 'Inter' }}>{t('cmp.visualGrammar.invalidCombo')}</span>
              </div>
              <p className="text-xs mb-2" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>
                "囗" + "门" → ✗
              </p>
              <p className="text-[0.625rem]" style={{ color: '#8B6914', fontFamily: 'Inter' }}>
                {t('cmp.visualGrammar.invalidDesc')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
