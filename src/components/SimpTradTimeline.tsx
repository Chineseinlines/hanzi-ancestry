import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  getSimpTradOrigin,
  getInheritedNote,
  ORIGIN_TYPE_LABELS,
} from '../data/simpTradOrigins';
import { hasCharacter, getSimplifiedForm } from '../data/hanziData';

interface SimpTradTimelineProps {
  /** 当前查看的字 */
  character: string;
  /** 点击字形跳转（可选） */
  onNavigate?: (char: string) => void;
}

const SERIF_FONT = '"Ma Shan Zheng", cursive';
const INTER = 'Inter, sans-serif';

/** 时间线三段：只表先后关系，不标具体年代 */
const STAGES = [
  { key: 'ancient', label: '古代字形', en: 'Ancient' },
  { key: 'traditional', label: '传统通行', en: 'Traditional' },
  { key: 'modern', label: '现行规范', en: 'Modern' },
] as const;

function GlyphButton({
  char,
  size,
  color,
  muted,
  onClick,
  ring,
}: {
  char: string;
  size: string;
  color: string;
  muted?: boolean;
  ring?: boolean;
  onClick?: (char: string) => void;
}) {
  return (
    <button
      onClick={onClick ? () => onClick(char) : undefined}
      disabled={!onClick}
      className={`font-display-cn leading-none transition-all ${onClick ? 'cursor-pointer hover:opacity-70' : 'cursor-default'}`}
      style={{
        fontSize: size,
        color,
        fontFamily: SERIF_FONT,
        opacity: muted ? 0.55 : 1,
        ...(ring
          ? {
              padding: '0.375rem 0.625rem',
              borderRadius: '0.75rem',
              border: '1px solid rgba(196,162,101,0.45)',
              background: 'rgba(196,162,101,0.08)',
            }
          : {}),
      }}
    >
      {char}
    </button>
  );
}

function Connector() {
  return (
    <div className="flex items-center self-center min-w-8 flex-1 px-1" aria-hidden>
      <div className="h-px flex-1" style={{ background: 'rgba(196,162,101,0.35)' }} />
      <div
        className="w-0 h-0"
        style={{
          borderTop: '4px solid transparent',
          borderBottom: '4px solid transparent',
          borderLeft: '6px solid rgba(196,162,101,0.35)',
        }}
      />
    </div>
  );
}

function StageBlock({
  label,
  en,
  children,
}: {
  label: string;
  en: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 min-w-0">
      <span className="text-[0.625rem] tracking-wider uppercase" style={{ color: 'rgba(245,240,232,0.4)', fontFamily: INTER }}>
        {label}
        <span className="ml-1 opacity-60 normal-case">{en}</span>
      </span>
      {children}
    </div>
  );
}

export default function SimpTradTimeline({ character, onNavigate }: SimpTradTimelineProps) {
  const result = getSimpTradOrigin(character);
  if (!result) return null;

  const { kind, simplified, traditionals, origin } = result;
  const isRevival = origin?.originType === 'ancient-variant';
  const isMerger = origin?.originType === 'merger';

  // 点击字形跳转：繁体字不在词典中时，回退到其简体字的详情页
  const navigateTo = (c: string) => {
    if (!onNavigate) return;
    if (hasCharacter(c)) {
      onNavigate(c);
      return;
    }
    const simp = getSimplifiedForm(c);
    if (simp && hasCharacter(simp)) onNavigate(simp);
  };

  const badge = kind === 'inherited' ? '传承字' : origin ? ORIGIN_TYPE_LABELS[origin.originType] : '简化';

  const note = kind === 'inherited'
    ? getInheritedNote(character)
    : origin?.note
      ?? `简体「${simplified}」对应繁体「${traditionals.join('、')}」，为现行规范字。`;

  const renderStage = (stageKey: (typeof STAGES)[number]['key']): ReactNode => {
    switch (stageKey) {
      case 'ancient':
        // 古代字形：繁体为主；若为「古字沿用」，简体形古已有之，两形并存
        if (kind === 'inherited') {
          return <GlyphButton char={character} size="2rem" color="#F5F0E8" onClick={navigateTo} />;
        }
        return (
          <div className="flex flex-col items-center gap-1">
            {isRevival && (
              <span className="text-[0.5625rem] tracking-wider" style={{ color: 'rgba(245,240,232,0.4)', fontFamily: INTER }}>
                俗体并存
              </span>
            )}
            <div className="flex items-end gap-1.5">
              <GlyphButton char={traditionals[0]} size="2rem" color="#F5F0E8" onClick={navigateTo} />
              {isRevival && (
                <GlyphButton char={simplified} size="1.125rem" color="rgba(245,240,232,0.55)" muted onClick={navigateTo} />
              )}
            </div>
            {isRevival && (
              <span className="text-[0.5625rem]" style={{ color: 'rgba(245,240,232,0.4)', fontFamily: INTER }}>
                「{simplified}」古已有之
              </span>
            )}
          </div>
        );
      case 'traditional':
        // 传统通行：所有繁体形（合并字显示多个）
        if (kind === 'inherited') {
          return <GlyphButton char={character} size="2rem" color="#F5F0E8" onClick={navigateTo} />;
        }
        return (
          <div className="flex items-center gap-2">
            {traditionals.map((t) => (
              <GlyphButton key={t} char={t} size="2rem" color="#F5F0E8" onClick={navigateTo} />
            ))}
          </div>
        );
      case 'modern':
        // 现行规范：简体，高亮
        return (
          <div className="flex flex-col items-center gap-1">
            <GlyphButton char={simplified} size="2.5rem" color="#C4A265" ring onClick={navigateTo} />
            <span className="text-[0.5625rem]" style={{ color: '#C4A265', fontFamily: INTER }}>
              {kind === 'traditional' ? '现行简体' : isRevival ? '回归古字' : isMerger ? '合并为' : '简化'}
            </span>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="max-w-2xl mx-auto mb-8 rounded-2xl px-5 py-4"
      style={{
        background: 'rgba(245,240,232,0.04)',
        border: '1px solid rgba(245,240,232,0.08)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="font-serif-cn text-sm" style={{ color: '#F5F0E8' }}>简繁溯源</span>
          <span className="text-[0.625rem] uppercase tracking-wider" style={{ color: 'rgba(245,240,232,0.35)', fontFamily: INTER }}>
            Simp–Trad Origin
          </span>
        </div>
        <span
          className="text-[0.625rem] px-2 py-0.5 rounded-full font-medium"
          style={{
            background: 'rgba(196,162,101,0.15)',
            color: '#C4A265',
            border: '1px solid rgba(196,162,101,0.3)',
            fontFamily: INTER,
          }}
        >
          {badge}
          {kind === 'traditional' && <span className="ml-1 opacity-60">（您正在查看繁体）</span>}
        </span>
      </div>

      {/* Timeline */}
      <div className="flex items-start justify-between">
        {STAGES.map((stage, i) => (
          <div key={stage.key} className="flex items-start flex-1">
            <div className="flex-1 flex justify-center min-w-0">
              <StageBlock label={stage.label} en={stage.en}>
                {renderStage(stage.key)}
              </StageBlock>
            </div>
            {i < STAGES.length - 1 && <Connector />}
          </div>
        ))}
      </div>

      {/* Note */}
      <p
        className="mt-4 text-xs leading-relaxed text-center max-w-xl mx-auto"
        style={{ color: 'rgba(245,240,232,0.55)', fontFamily: INTER }}
      >
        {note}
      </p>
    </motion.div>
  );
}
