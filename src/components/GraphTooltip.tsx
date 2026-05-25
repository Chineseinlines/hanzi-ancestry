import { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HanziEntry } from '../data/types';
import { PHONETIC_COLORS, RED_WARNING_TEXT, type PhoneticRating } from '../data/phoneticRating';
import { getAnnotation, getMoonAnnotation, getMoonTrueAnnotation } from '../data/componentAnnotations';
import { numberToMark } from '../data/hanziData';
import { getGhostSuggestion } from '../data/ghostComponents';
import MiniStrokePreview from './MiniStrokePreview';

interface GraphTooltipProps {
  entry: HanziEntry | null;
  visible: boolean;
  x: number;
  y: number;
  sharedComponents?: string[];
  nodeRadius?: number;
  nodeType?: string;
  phoneticRating?: PhoneticRating | null;
  isGhost?: boolean;
}

const TOOLTIP_W = 260;
const TOOLTIP_H = 200;
const GAP = 20;
const EASE_SPRING = [0.34, 1.56, 0.64, 1] as [number, number, number, number];

const GraphTooltip = memo(function GraphTooltip({
  entry,
  visible,
  x,
  y,
  sharedComponents = [],
  nodeRadius = 22,
  nodeType,
  phoneticRating,
  isGhost: _isGhost,
}: GraphTooltipProps) {
  const [pos, setPos] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (!visible || !entry) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const spaceRight = vw - x - nodeRadius;
    const spaceLeft = x - nodeRadius;

    let left: number;
    let top: number;

    if (spaceRight >= TOOLTIP_W + GAP) {
      left = x + nodeRadius + GAP;
    } else if (spaceLeft >= TOOLTIP_W + GAP) {
      left = x - nodeRadius - TOOLTIP_W - GAP;
    } else {
      left = Math.max(8, Math.min(vw - TOOLTIP_W - 8, x - TOOLTIP_W / 2));
    }

    top = y - TOOLTIP_H / 2;
    top = Math.max(8, Math.min(vh - TOOLTIP_H - 8, top));

    setPos({ left, top });
  }, [visible, entry, x, y, nodeRadius]);

  if (!entry) return null;

  // Component annotation
  const annotation = getAnnotation(entry.character);
  const moonBodyAnn = entry.character === '月'
    ? getMoonAnnotation(entry.definition)
    : null;
  const moonTrueAnn = entry.character === '月' && !moonBodyAnn
    ? getMoonTrueAnnotation()
    : null;
  const activeAnnotation = annotation || moonBodyAnn || moonTrueAnn;

  // Ghost component
  const ghostSuggestion = getGhostSuggestion(entry.character);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2, ease: EASE_SPRING }}
          className="pointer-events-none fixed z-[100] rounded-lg bg-white px-4 py-3"
          style={{
            left: pos.left,
            top: pos.top,
            width: TOOLTIP_W,
            boxShadow: '0 8px 30px rgba(26,26,24,0.12)',
            border: '1px solid var(--border-light)',
          }}
        >
          <div className="mb-1 font-display-cn text-[1.5rem] leading-none text-ink-black">
            {entry.character}
          </div>
          <div className="mb-1 font-mono text-[0.75rem] text-cinnabar">
            {entry.pinyin.map(p => numberToMark(p)).join(', ')}
          </div>
          <div className="mb-1.5 text-[0.75rem] leading-snug text-charcoal" style={{ fontFamily: 'Inter, sans-serif' }}>
            {entry.definition}
          </div>

          {/* Phonetic rating badge */}
          {nodeType === 'phonetic' && phoneticRating && (
            <div
              className="mb-1.5 rounded-md px-2 py-1 text-[0.6875rem] font-medium"
              style={{
                background: PHONETIC_COLORS[phoneticRating].bg,
                color: PHONETIC_COLORS[phoneticRating].text,
                border: `1px solid ${PHONETIC_COLORS[phoneticRating].border}`,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {phoneticRating === 'green' && '准确 — 声韵一致，可直接参考声旁读音'}
              {phoneticRating === 'yellow' && '近似 — 声韵部分匹配，仅可部分参考'}
              {phoneticRating === 'red' && `失效 — ${RED_WARNING_TEXT}`}
            </div>
          )}

          {/* Component annotation badge */}
          {activeAnnotation && (
            <div
              className="mb-1.5 rounded-md px-2 py-1 text-[0.6875rem]"
              style={{
                background: 'rgba(45,95,138,0.08)',
                color: '#2D5F8A',
                border: '1px solid rgba(45,95,138,0.2)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <span className="font-semibold">{activeAnnotation.name}</span>
              <span className="mx-1 opacity-50">—</span>
              {entry.character} → {activeAnnotation.original}
            </div>
          )}

          {/* Ghost component warning */}
          {ghostSuggestion && (
            <div
              className="mb-1.5 rounded-md px-2 py-1 text-[0.6875rem] leading-snug"
              style={{
                background: 'rgba(176,173,165,0.15)',
                color: '#8B8680',
                border: '1px solid rgba(176,173,165,0.3)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {ghostSuggestion}
            </div>
          )}

          {entry.decomposition && entry.decomposition !== '？' && (
            <div className="mb-1 font-mono text-[0.6875rem] text-charcoal/70">
              {entry.decomposition}
            </div>
          )}
          {sharedComponents.length > 0 && (
            <div className="mb-1.5 text-[0.6875rem] text-graph-node-cognate" style={{ fontFamily: 'Inter, sans-serif' }}>
              Shared: {sharedComponents.join(', ')}
            </div>
          )}

          {/* Mini stroke preview */}
          <div className="mt-2 pt-2 border-t" style={{ borderColor: 'rgba(26,26,24,0.08)' }}>
            <MiniStrokePreview character={entry.character} />
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default GraphTooltip;
