import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Hammer, RotateCcw, Shuffle, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import ComposedGlyph from '../ComposedGlyph';
import {
  getAllComponentRules,
  getComponentRules,
  validateComposition,
  type Position,
  type StructureTemplate,
} from '../../data/visualGrammar';
import { buildIds, findRealCharacter } from '../../data/composedGlyphs';
import { loadData } from '../../data/hanziData';
import { useLanguage } from '../../contexts/LanguageContext';
import { sample } from '../../data/gameContent';

interface TemplateConfig {
  key: StructureTemplate;
  labelKey: string;
  marker: string;
  positions: Position[];
}

const TEMPLATES: TemplateConfig[] = [
  { key: 'left-right', labelKey: 'game.forge.leftRight', marker: '⿰', positions: ['left', 'right'] },
  { key: 'top-bottom', labelKey: 'game.forge.topBottom', marker: '⿱', positions: ['top', 'bottom'] },
  { key: 'full-enclose', labelKey: 'game.forge.enclose', marker: '⿴', positions: ['enclose', 'overlay'] },
];

const C = {
  ink: '#1A1A18',
  cinnabar: '#C23B2A',
  green: '#2E7D32',
  gold: '#8B6914',
  rice: '#FDFBF6',
  cream: '#F5F0E8',
};

function isEncloseOnly(allowed: Position[]): boolean {
  return allowed.length === 1 && allowed[0] === 'enclose';
}

export default function CharacterForge() {
  const { t } = useLanguage();
  const [ready, setReady] = useState(false);
  const [templateKey, setTemplateKey] = useState<StructureTemplate>('left-right');
  const [slots, setSlots] = useState<[string, string]>(['', '']);

  useEffect(() => {
    let alive = true;
    loadData().then(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, []);

  const rules = useMemo(() => getAllComponentRules(), []);
  const encloseRules = useMemo(() => rules.filter(r => isEncloseOnly(r.allowedPositions)), [rules]);
  const generalRules = useMemo(() => rules.filter(r => !isEncloseOnly(r.allowedPositions)), [rules]);

  const template = TEMPLATES.find(tp => tp.key === templateKey)!;
  const positions = template.positions;

  const paletteFor = (slotIndex: number) =>
    positions[slotIndex] === 'enclose' ? encloseRules : generalRules;

  const parts = slots.map((comp, i) => {
    if (!comp) return '';
    const rule = getComponentRules(comp);
    const def = rule?.deformations?.find(d => d.position === positions[i]);
    return def?.form ?? comp;
  });

  const filled = slots.every(Boolean);

  const validation = useMemo(
    () => (filled ? validateComposition(slots, positions) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slots[0], slots[1], templateKey, filled],
  );

  const ids = filled ? buildIds(templateKey, parts) : '';
  const realChar = ids ? findRealCharacter(ids) : undefined;

  const setSlot = (index: number, comp: string) => {
    setSlots(prev => {
      const next: [string, string] = [...prev] as [string, string];
      next[index] = prev[index] === comp ? '' : comp;
      return next;
    });
  };

  const randomize = () => {
    const a = sample(paletteFor(0), 1)[0];
    const b = sample(paletteFor(1), 1)[0];
    setSlots([a?.component ?? '', b?.component ?? '']);
  };

  return (
    <div className="space-y-5">
      {/* Intro */}
      <div className="rounded-2xl p-5" style={{ background: C.rice, boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Hammer size={18} style={{ color: C.cinnabar }} />
          <h3 className="font-serif-cn text-lg font-semibold" style={{ color: C.ink }}>{t('game.forge.title')}</h3>
        </div>
        <p className="text-sm text-charcoal/60" style={{ fontFamily: 'Inter, sans-serif' }}>{t('game.forge.subtitle')}</p>
      </div>

      {/* Template selector */}
      <div className="flex flex-wrap gap-2">
        {TEMPLATES.map(tp => (
          <button
            key={tp.key}
            onClick={() => { setTemplateKey(tp.key); setSlots(['', '']); }}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all"
            style={{
              background: templateKey === tp.key ? C.ink : '#F5F0E8',
              color: templateKey === tp.key ? '#FFFFFF' : 'rgba(61,61,56,0.7)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <span className="font-mono text-base">{tp.marker}</span>
            {t(tp.labelKey)}
          </button>
        ))}
        <button
          onClick={randomize}
          className="ml-auto flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium"
          style={{ background: 'rgba(194,59,42,0.1)', color: C.cinnabar, fontFamily: 'Inter, sans-serif' }}
        >
          <Shuffle size={14} /> {t('game.forge.random')}
        </button>
        <button
          onClick={() => setSlots(['', ''])}
          className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium"
          style={{ background: '#F5F0E8', color: 'rgba(61,61,56,0.7)', fontFamily: 'Inter, sans-serif' }}
        >
          <RotateCcw size={14} /> {t('game.forge.clear')}
        </button>
      </div>

      {/* Preview + validation */}
      <div className="rounded-2xl p-5" style={{ background: C.rice, boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div
            className="flex-shrink-0 rounded-xl flex items-center justify-center"
            style={{ width: 140, height: 140, background: C.cream, border: `1px solid rgba(26,26,24,0.08)` }}
          >
            {filled ? (
              <ComposedGlyph parts={parts} template={templateKey} size={110} />
            ) : (
              <span className="text-4xl" style={{ color: 'rgba(26,26,24,0.15)', fontFamily: 'Inter' }}>{template.marker}</span>
            )}
          </div>

          <div className="flex-1 min-w-0 w-full">
            {/* Slot labels */}
            <div className="flex items-center gap-2 mb-3 font-mono text-sm" style={{ color: 'rgba(61,61,56,0.7)' }}>
              <span className="text-base" style={{ color: C.cinnabar }}>{template.marker}</span>
              <span>{parts[0] || '?'}</span>
              <span>{parts[1] || '?'}</span>
            </div>

            {!filled && (
              <p className="text-sm text-charcoal/50" style={{ fontFamily: 'Inter, sans-serif' }}>{t('game.forge.emptySlot')}</p>
            )}

            {validation && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {validation.valid ? (
                    <>
                      <CheckCircle2 size={16} style={{ color: C.green }} />
                      <span className="text-sm font-semibold" style={{ color: C.green, fontFamily: 'Inter' }}>{t('game.forge.valid')}</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={16} style={{ color: C.cinnabar }} />
                      <span className="text-sm font-semibold" style={{ color: C.cinnabar, fontFamily: 'Inter' }}>{t('game.forge.invalid')}</span>
                    </>
                  )}
                </div>

                {validation.errors.map((err, i) => (
                  <p key={i} className="text-xs mb-1 leading-relaxed" style={{ color: C.cinnabar, fontFamily: 'Inter' }}>• {err}</p>
                ))}

                {validation.deformations.map((d, i) => (
                  <p key={i} className="text-xs mb-1" style={{ color: C.gold, fontFamily: 'Inter' }}>
                    {t('game.forge.deformationHint', { base: d.component, form: d.deformedForm })}
                  </p>
                ))}

                {ids && (
                  <p className="mt-2 text-xs" style={{ fontFamily: 'Inter' }}>
                    {realChar ? (
                      <span style={{ color: C.green }}>{t('game.forge.realChar', { char: realChar })}</span>
                    ) : (
                      <span style={{ color: 'rgba(61,61,56,0.55)' }}>{t('game.forge.noRealChar')}</span>
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Palettes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[0, 1].map(slotIndex => (
          <motion.div
            key={slotIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: slotIndex * 0.06 }}
            className="rounded-2xl p-4"
            style={{ background: C.rice, boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.cinnabar, fontFamily: 'Inter' }}>
                {t(slotIndex === 0 ? 'game.forge.slotA' : 'game.forge.slotB')}
              </span>
              <span className="text-[0.625rem] text-charcoal/40" style={{ fontFamily: 'Inter' }}>
                {t(`game.forge.pos.${positions[slotIndex]}`)}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto">
              {paletteFor(slotIndex).map(rule => (
                <button
                  key={rule.component}
                  onClick={() => setSlot(slotIndex, rule.component)}
                  title={rule.description}
                  className="flex h-10 w-10 items-center justify-center rounded-lg font-serif-cn text-lg transition-all"
                  style={{
                    background: slots[slotIndex] === rule.component ? C.cinnabar : C.cream,
                    color: slots[slotIndex] === rule.component ? '#FFFFFF' : C.ink,
                    border: '1px solid rgba(26,26,24,0.06)',
                  }}
                >
                  {rule.component}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {ready && !filled && (
        <p className="flex items-center gap-1.5 text-xs text-charcoal/40" style={{ fontFamily: 'Inter' }}>
          <Sparkles size={12} /> {t('game.forge.tip')}
        </p>
      )}
    </div>
  );
}