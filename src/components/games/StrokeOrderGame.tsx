import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Trophy, SkipForward } from 'lucide-react';
import { getStrokeData } from '../../data/hanziData';
import type { StrokeData } from '../../data/types';
import { STROKE_COUNTS, shuffle } from '../../data/gameContent';

const TOTAL_ROUNDS = 8;
const C = { ink: '#1A1A18', cinnabar: '#C23B2A', green: '#6B7F5E', gold: '#8B6914', rice: '#FDFBF6' };

export default function StrokeOrderGame() {
  const [seed, setSeed] = useState(0);
  const chars = useMemo(() => shuffle(STROKE_COUNTS.map(s => s.char)).slice(0, TOTAL_ROUNDS), [seed]);

  const [round, setRound] = useState(0);
  const [data, setData] = useState<StrokeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [order, setOrder] = useState<number[]>([]);
  const [hover, setHover] = useState<number | null>(null);
  const [wrongFlash, setWrongFlash] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [totalPossible, setTotalPossible] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [finished, setFinished] = useState(false);
  const advancingRef = useRef(false);

  const currentChar = chars[round];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setData(null);
    setOrder([]);
    setHover(null);
    setWrongFlash(null);
    setMistakes(0);
    advancingRef.current = false;

    getStrokeData(currentChar)
      .then(sd => {
        if (cancelled) return;
        if (!sd || sd.strokes.length === 0) {
          setError(true);
          setLoading(false);
          return;
        }
        setData(sd);
        setTotalPossible(p => p + sd.strokes.length);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [currentChar]);

  const advance = () => {
    advancingRef.current = false;
    if (round + 1 >= chars.length) {
      setFinished(true);
    } else {
      setRound(r => r + 1);
    }
  };

  const handleClick = (i: number) => {
    if (!data || finished || advancingRef.current) return;
    if (order.includes(i)) return;
    if (i === order.length) {
      const newOrder = [...order, i];
      setOrder(newOrder);
      setScore(s => s + 1);
      if (newOrder.length === data.strokes.length) {
        advancingRef.current = true;
        window.setTimeout(() => advance(), 420);
      }
    } else {
      setMistakes(m => m + 1);
      setWrongFlash(i);
      window.setTimeout(() => setWrongFlash(null), 380);
    }
  };

  const reset = () => {
    setSeed(s => s + 1);
    setRound(0);
    setScore(0);
    setTotalPossible(0);
    setFinished(false);
    setOrder([]);
    setMistakes(0);
  };

  if (finished) {
    const pct = totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 0;
    return (
      <div className="rounded-2xl p-6 text-center" style={{ background: C.rice, boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
        <Trophy size={40} className="mx-auto mb-3" style={{ color: '#C4A265' }} />
        <h2 className="font-display text-xl mb-2" style={{ color: C.ink, fontFamily: '"Playfair Display", serif' }}>{score} / {totalPossible}</h2>
        <p className="text-sm mb-6" style={{ color: C.gold, fontFamily: 'Inter' }}>
          {pct >= 90 ? '笔顺掌握得很好！' : pct >= 70 ? '很不错，继续巩固易错笔顺！' : pct >= 50 ? '再多练练，注意笔顺规律！' : '建议先观察完整笔顺，再尝试书写。'}
        </p>
        <button onClick={reset} className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-white transition-all hover:scale-105" style={{ background: C.cinnabar, fontFamily: 'Inter' }}>
          <RotateCcw size={16} /> 再来一轮
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl" style={{ background: C.rice, boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: C.cinnabar, borderTopColor: 'transparent' }} />
          <span className="text-sm" style={{ color: C.gold, fontFamily: 'Inter' }}>正在加载笔顺…</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl" style={{ background: C.rice, boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
        <p className="text-charcoal/60" style={{ fontFamily: 'Inter' }}>「{currentChar}」的笔顺数据加载失败</p>
        <button onClick={() => advance()} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white" style={{ background: C.cinnabar, fontFamily: 'Inter' }}>
          <SkipForward size={14} /> 换一个字
        </button>
      </div>
    );
  }

  const drawnCount = order.length;
  const total = data.strokes.length;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: C.rice, boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="text-xs font-medium" style={{ color: C.gold, fontFamily: 'Inter' }}>
          第 {round + 1} / {chars.length} 字
          {mistakes > 0 && <span className="ml-2" style={{ color: C.cinnabar }}>失误 ×{mistakes}</span>}
        </div>
        <div className="text-sm font-bold" style={{ color: C.cinnabar }}>{score} 笔</div>
      </div>

      <div className="mx-5 mb-4 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(26,26,24,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: C.cinnabar }}
          animate={{ width: `${(drawnCount / total) * 100}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Character reference */}
      <div className="px-5 text-center mb-2">
        <div className="flex items-baseline justify-center gap-3">
          <span className="text-sm" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>请按正确笔顺依次点击笔画</span>
          <span className="font-display-cn text-2xl" style={{ color: C.ink, fontFamily: '"Ma Shan Zheng", cursive' }}>{currentChar}</span>
        </div>
      </div>

      {/* Stroke canvas */}
      <div className="px-5 pb-4">
        <div className="mx-auto" style={{ maxWidth: 320 }}>
          <svg viewBox="0 0 1024 1024" className="w-full" style={{ background: '#FDFBF6', boxShadow: 'inset 0 0 24px rgba(139,105,20,0.07)', borderRadius: 16 }}>
            <g transform="scale(1, -1) translate(0, -900)">
              {data.strokes.map((d, i) => {
                const drawnIdx = order.indexOf(i);
                const drawn = drawnIdx !== -1;
                const isWrong = wrongFlash === i;
                const isHover = hover === i && !drawn;

                let color = C.ink;
                let opacity = 0.14;
                if (drawn) { color = C.ink; opacity = 1; }
                else if (isHover) { opacity = 0.5; }
                if (isWrong) { color = C.cinnabar; opacity = 1; }

                return (
                  <g key={i}>
                    <path
                      d={d}
                      fill="none"
                      stroke={color}
                      strokeWidth={64}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ opacity, transition: 'opacity 0.2s ease' }}
                      pointerEvents="none"
                    />
                    {!drawn && (
                      <path
                        d={d}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={150}
                        strokeLinecap="round"
                        style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
                        onClick={() => handleClick(i)}
                        onMouseEnter={() => setHover(i)}
                        onMouseLeave={() => setHover(null)}
                      />
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Progress line */}
        <div className="mt-3 flex items-center justify-between px-1">
          <span className="text-xs" style={{ color: C.gold, fontFamily: 'Inter' }}>已写 {drawnCount} / {total} 笔</span>
          <button
            onClick={() => advance()}
            disabled={advancingRef.current}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all hover:scale-105 disabled:opacity-40"
            style={{ background: 'rgba(26,26,24,0.05)', color: '#3D3D3B', fontFamily: 'Inter' }}
          >
            <SkipForward size={13} /> 跳过
          </button>
        </div>
        {drawnCount === total && (
          <div className="mt-2 flex justify-center">
            <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: 'rgba(107,127,94,0.15)', color: C.green, fontFamily: 'Inter' }}>✓ 「{currentChar}」笔顺完成</span>
          </div>
        )}
      </div>
    </div>
  );
}