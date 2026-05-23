import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { StrokeData } from '../data/types';
import { getStrokeData } from '../data/hanziData';

type Speed = 'slow' | 'normal' | 'fast';
const SPEED_DELAYS: Record<Speed, number> = { slow: 1500, normal: 900, fast: 500 };

interface StrokeOrderProps {
  character: string;
  size?: number;
}

export default function StrokeOrder({ character, size = 220 }: StrokeOrderProps) {
  const [strokeData, setStrokeData] = useState<StrokeData | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(-1);
  const [speed, setSpeed] = useState<Speed>('normal');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setStrokeData(undefined);
    setCurrentStroke(-1);
    getStrokeData(character).then((sd) => {
      if (!cancelled) {
        setStrokeData(sd);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [character]);

  const hasData = strokeData && strokeData.strokes.length > 0;
  const strokeCount = strokeData?.strokes.length ?? 0;

  const playAnimation = useCallback(() => {
    if (!hasData || playing) return;
    setPlaying(true);
    setCurrentStroke(-1);

    let strokeIdx = 0;
    const delay = SPEED_DELAYS[speed];
    const step = () => {
      if (strokeIdx >= strokeCount) {
        setPlaying(false);
        setCurrentStroke(-1);
        return;
      }
      setCurrentStroke(strokeIdx);
      strokeIdx++;
      timerRef.current = setTimeout(step, delay);
    };
    timerRef.current = setTimeout(step, 300);
  }, [hasData, playing, strokeCount, speed]);

  useEffect(() => {
    if (hasData && !playing) {
      const t = setTimeout(playAnimation, 600);
      return () => clearTimeout(t);
    }
  }, [hasData, playAnimation, character]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-xl"
        style={{
          width: size,
          height: size,
          background: 'rgba(245,240,232,0.5)',
        }}
      >
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#C23B2A', borderTopColor: 'transparent' }} />
        <span className="mt-2 text-xs" style={{ color: 'rgba(26,26,24,0.4)', fontFamily: 'Inter' }}>
          Loading strokes...
        </span>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed"
        style={{
          width: size,
          height: size,
          borderColor: 'rgba(26,26,24,0.15)',
          background: 'rgba(245,240,232,0.5)',
        }}
      >
        <span className="text-4xl font-display-cn" style={{ color: 'rgba(26,26,24,0.2)' }}>
          {character}
        </span>
        <span className="mt-2 text-xs" style={{ color: 'rgba(26,26,24,0.4)', fontFamily: 'Inter' }}>
          Stroke data not available
        </span>
      </div>
    );
  }

  const viewSize = 1024;

  // Coordinates are in 1024 space with inverted Y; flip and adjust
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          width: size,
          height: size,
          background: '#FDFBF6',
          boxShadow: 'inset 0 0 20px rgba(139,105,20,0.06)',
        }}
      >
        <svg className="absolute inset-0" width={size} height={size}>
          <defs>
            <pattern id={`grid-${character}`} width={size / 2} height={size / 2} patternUnits="userSpaceOnUse">
              <path d={`M ${size / 2} 0 L ${size / 2} ${size / 2} M 0 ${size / 2} L ${size / 2} ${size / 2}`} stroke="rgba(196,162,101,0.12)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width={size} height={size} fill={`url(#grid-${character})`} />
          <line x1={0} y1={size / 2} x2={size} y2={size / 2} stroke="rgba(196,162,101,0.12)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1={size / 2} y1={0} x2={size / 2} y2={size} stroke="rgba(196,162,101,0.12)" strokeWidth="1" strokeDasharray="4 4" />
        </svg>

        <svg
          className="absolute inset-0"
          width={size}
          height={size}
          viewBox={`0 0 ${viewSize} ${viewSize}`}
        >
          <g transform={`scale(1, -1) translate(0, -900)`}>
            {strokeData.strokes.map((path, i) => {
              const isDrawn = i <= currentStroke;
              const isCurrent = i === currentStroke;
              return (
                <g key={i}>
                  <path
                    d={path}
                    fill="none"
                    stroke={isCurrent ? '#C23B2A' : '#1A1A18'}
                    strokeWidth={isCurrent ? 72 : 60}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ opacity: isDrawn ? 1 : 0.12, transition: 'opacity 0.3s ease' }}
                  />
                  {isDrawn && strokeData.medians[i]?.[0] && (
                    <motion.text
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      x={strokeData.medians[i][0][0]}
                      y={-strokeData.medians[i][0][1]}
                      fontSize="80"
                      fill={isCurrent ? '#C23B2A' : '#8B6914'}
                      fontFamily="Inter, sans-serif"
                      fontWeight="600"
                      textAnchor="middle"
                      dominantBaseline="central"
                      style={{ opacity: 0.7 }}
                    >
                      {i + 1}
                    </motion.text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium" style={{ color: '#8B6914', fontFamily: 'Inter' }}>
            {strokeCount} strokes
          </span>
          <button
            onClick={playAnimation}
            disabled={playing}
            className="rounded-full px-4 py-1.5 text-xs font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            style={{
              background: playing ? 'rgba(26,26,24,0.08)' : '#C23B2A',
              color: playing ? '#1A1A18' : '#F5F0E8',
              fontFamily: 'Inter',
            }}
          >
            {playing ? 'Playing...' : 'Replay'}
          </button>
        </div>
        {/* Speed selector */}
        <div className="flex items-center gap-1 rounded-full p-0.5" style={{ background: 'rgba(26,26,24,0.05)' }}>
          {(['slow', 'normal', 'fast'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              disabled={playing}
              className="rounded-full px-3 py-1 text-[0.625rem] font-medium transition-all disabled:opacity-50"
              style={{
                background: speed === s ? '#1A1A18' : 'transparent',
                color: speed === s ? '#F5F0E8' : '#8B6914',
                fontFamily: 'Inter',
              }}
            >
              {s === 'slow' ? '慢速' : s === 'normal' ? '标准' : '快速'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
