import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { StrokeData } from '../data/types';
import { getStrokeData } from '../data/hanziData';
import { useLanguage } from '../contexts/LanguageContext';

type Speed = 'slow' | 'normal' | 'fast';
const SPEED_DELAYS: Record<Speed, number> = { slow: 1500, normal: 900, fast: 500 };

/** 描红判分：笔画中位点在 1024 坐标系内的命中半径 */
const TRACE_HIT_RADIUS = 90;
/** 描红判分：命中比例阈值 */
const TRACE_PASS_RATIO = 0.6;

interface StrokeOrderProps {
  character: string;
  size?: number;
}

export default function StrokeOrder({ character, size = 220 }: StrokeOrderProps) {
  const { t } = useLanguage();
  const [strokeData, setStrokeData] = useState<StrokeData | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(-1);
  const [speed, setSpeed] = useState<Speed>('normal');
  const [loop, setLoop] = useState(false);
  const [mode, setMode] = useState<'play' | 'trace'>('play');
  const [traceStroke, setTraceStroke] = useState(0);
  const [traceMsg, setTraceMsg] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playingRef = useRef(false);
  const loopRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef<{ active: boolean; points: [number, number][] } | null>(null);

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setStrokeData(undefined);
    setCurrentStroke(-1);
    setMode('play');
    setLoop(false);
    setTraceStroke(0);
    setTraceMsg('');
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

  const stopAnimation = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    playingRef.current = false;
    setPlaying(false);
    setCurrentStroke(-1);
  }, []);

  const playAnimation = useCallback(() => {
    if (!hasData || playingRef.current) return;
    playingRef.current = true;
    setPlaying(true);
    setCurrentStroke(-1);

    let strokeIdx = 0;
    const delay = SPEED_DELAYS[speed];
    const step = () => {
      if (strokeIdx >= strokeCount) {
        if (loopRef.current) {
          strokeIdx = 0;
          setCurrentStroke(-1);
          timerRef.current = setTimeout(step, 700);
        } else {
          playingRef.current = false;
          setPlaying(false);
          setCurrentStroke(-1);
        }
        return;
      }
      setCurrentStroke(strokeIdx);
      strokeIdx++;
      timerRef.current = setTimeout(step, delay);
    };
    timerRef.current = setTimeout(step, 300);
  }, [hasData, strokeCount, speed]);

  useEffect(() => {
    if (hasData && !playingRef.current && mode === 'play') {
      const timer = setTimeout(playAnimation, 600);
      return () => clearTimeout(timer);
    }
  }, [hasData, playAnimation, character, mode]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const enterTrace = useCallback(() => {
    stopAnimation();
    setMode('trace');
    setLoop(false);
    setTraceStroke(0);
    setTraceMsg('');
    setCurrentStroke(-1);
    setTimeout(clearCanvas, 0);
  }, [stopAnimation, clearCanvas]);

  const exitTrace = useCallback(() => {
    setMode('play');
    setTraceStroke(0);
    setTraceMsg('');
    clearCanvas();
  }, [clearCanvas]);

  /** 画布坐标 → 字形 1024 坐标系（y 轴与原 SVG 变换一致） */
  const toSourcePoint = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
      const rect = e.currentTarget.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      return [px * 1024 / size, 900 - py * 1024 / size];
    },
    [size],
  );

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode !== 'trace' || traceStroke >= strokeCount) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = toSourcePoint(e);
    drawingRef.current = { active: true, points: [p] };
    setTraceMsg('');
  }, [mode, traceStroke, strokeCount, toSourcePoint]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const drawing = drawingRef.current;
    if (!drawing?.active) return;
    const p = toSourcePoint(e);
    const prev = drawing.points[drawing.points.length - 1];
    drawing.points.push(p);

    const ctx = e.currentTarget.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#C23B2A';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(prev[0] / 1024 * size, (900 - prev[1]) / 1024 * size);
    ctx.lineTo(p[0] / 1024 * size, (900 - p[1]) / 1024 * size);
    ctx.stroke();
  }, [size, toSourcePoint]);

  const handlePointerUp = useCallback(() => {
    const drawing = drawingRef.current;
    drawingRef.current = null;
    if (!drawing) return;

    const median = strokeData?.medians[traceStroke] ?? [];
    if (drawing.points.length < 2 || median.length === 0) {
      // 数据不足时不阻断练习：直接进入下一笔
      if (drawing.points.length < 2) {
        setTraceMsg(t('cmp.strokeOrder.traceShort'));
        setTimeout(clearCanvas, 200);
        return;
      }
    }

    let hit = 0;
    for (const [mx, my] of median) {
      if (drawing.points.some(([x, y]) => Math.hypot(x - mx, y - my) < TRACE_HIT_RADIUS)) hit++;
    }
    const ratio = median.length > 0 ? hit / median.length : 1;

    if (ratio >= TRACE_PASS_RATIO) {
      clearCanvas();
      if (traceStroke + 1 >= strokeCount) {
        setTraceStroke(strokeCount);
        setTraceMsg(t('cmp.strokeOrder.traceDone'));
      } else {
        setTraceStroke((i) => i + 1);
        setTraceMsg('');
      }
    } else {
      setTraceMsg(t('cmp.strokeOrder.traceRetry'));
      setTimeout(clearCanvas, 250);
    }
  }, [strokeData, traceStroke, strokeCount, t, clearCanvas]);

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
  const traceGuide = mode === 'trace' && traceStroke < strokeCount ? strokeData.medians[traceStroke] : undefined;

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
          {traceGuide && traceGuide.length > 1 && (
            <g transform="scale(1, -1) translate(0, -900)">
              <polyline
                points={traceGuide.map(([x, y]) => `${x},${y}`).join(' ')}
                fill="none"
                stroke="rgba(196,162,101,0.55)"
                strokeWidth={56}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}
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

        {mode === 'trace' && (
          <canvas
            ref={canvasRef}
            width={size}
            height={size}
            className="absolute inset-0"
            style={{ width: size, height: size, touchAction: 'none', cursor: 'crosshair' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
        )}
      </div>

      {mode === 'trace' && (
        <p className="text-center text-xs font-medium" style={{ color: traceMsg === t('cmp.strokeOrder.traceDone') ? '#6B7F5E' : '#8B6914', fontFamily: 'Inter' }}>
          {traceMsg || t('cmp.strokeOrder.traceHint', { n: Math.min(traceStroke + 1, strokeCount), total: strokeCount })}
        </p>
      )}

      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-medium" style={{ color: '#8B6914', fontFamily: 'Inter' }}>
            {t('cmp.strokeOrder.strokes', { n: strokeCount })}
          </span>
          <button
            onClick={playAnimation}
            disabled={playing || mode === 'trace'}
            className="rounded-full px-4 py-1.5 text-xs font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            style={{
              background: playing ? 'rgba(26,26,24,0.08)' : '#C23B2A',
              color: playing ? '#1A1A18' : '#F5F0E8',
              fontFamily: 'Inter',
            }}
          >
            {playing ? t('cmp.strokeOrder.playing') : t('cmp.strokeOrder.replay')}
          </button>
          <button
            onClick={() => { setLoop((v) => !v); }}
            disabled={mode === 'trace'}
            className="rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
            style={{
              borderColor: loop ? '#C23B2A' : 'rgba(26,26,24,0.15)',
              background: loop ? 'rgba(194,59,42,0.1)' : 'transparent',
              color: loop ? '#C23B2A' : '#8B6914',
              fontFamily: 'Inter',
            }}
          >
            {t('cmp.strokeOrder.loop')}
          </button>
          <button
            onClick={mode === 'trace' ? exitTrace : enterTrace}
            className="rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:scale-105"
            style={{
              borderColor: mode === 'trace' ? '#2D5F8A' : 'rgba(26,26,24,0.15)',
              background: mode === 'trace' ? 'rgba(45,95,138,0.12)' : 'transparent',
              color: mode === 'trace' ? '#2D5F8A' : '#8B6914',
              fontFamily: 'Inter',
            }}
          >
            {mode === 'trace' ? t('cmp.strokeOrder.exitTrace') : t('cmp.strokeOrder.trace')}
          </button>
        </div>
        {mode === 'play' && (
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
                {t(`cmp.strokeOrder.${s}`)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
