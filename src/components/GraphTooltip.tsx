import { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HanziEntry } from '../data/types';
import MiniStrokePreview from './MiniStrokePreview';

interface GraphTooltipProps {
  entry: HanziEntry | null;
  visible: boolean;
  x: number;
  y: number;
  sharedComponents?: string[];
  onExplore?: (char: string) => void;
  nodeRadius?: number;
}

const TOOLTIP_W = 220;
const TOOLTIP_H = 160;
const GAP = 20;
const EASE_SPRING = [0.34, 1.56, 0.64, 1] as [number, number, number, number];

const GraphTooltip = memo(function GraphTooltip({
  entry,
  visible,
  x,
  y,
  sharedComponents = [],
  onExplore,
  nodeRadius = 22,
}: GraphTooltipProps) {
  const [pos, setPos] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (!visible || !entry) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Decide quadrant: which side of the node has more space?
    const spaceRight = vw - x - nodeRadius;
    const spaceLeft = x - nodeRadius;
    const spaceBottom = vh - y - nodeRadius;
    const spaceTop = y - nodeRadius;

    let left: number;
    let top: number;

    // Horizontal: prefer right, fallback to left
    if (spaceRight >= TOOLTIP_W + GAP) {
      left = x + nodeRadius + GAP;
    } else if (spaceLeft >= TOOLTIP_W + GAP) {
      left = x - nodeRadius - TOOLTIP_W - GAP;
    } else {
      // Center below or above
      left = Math.max(8, Math.min(vw - TOOLTIP_W - 8, x - TOOLTIP_W / 2));
    }

    // Vertical: center on node
    top = y - TOOLTIP_H / 2;
    top = Math.max(8, Math.min(vh - TOOLTIP_H - 8, top));

    setPos({ left, top });
  }, [visible, entry, x, y, nodeRadius]);

  if (!entry) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2, ease: EASE_SPRING }}
          className="pointer-events-auto fixed z-[100] rounded-lg bg-white px-4 py-3"
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
            {entry.pinyin.join(', ')}
          </div>
          <div className="mb-1.5 text-[0.75rem] leading-snug text-charcoal" style={{ fontFamily: 'Inter, sans-serif' }}>
            {entry.definition}
          </div>
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

          {onExplore && (
            <button
              onClick={() => onExplore(entry.character)}
              className="mt-1 text-[0.6875rem] font-medium text-cinnabar transition-colors hover:text-vermilion-light"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Explore &rarr;
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default GraphTooltip;
