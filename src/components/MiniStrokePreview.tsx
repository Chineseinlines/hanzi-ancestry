import { useEffect, useRef, useState, useCallback } from 'react';
import type { StrokeData } from '../data/types';
import { getStrokeData } from '../data/hanziData';

interface MiniStrokePreviewProps {
  character: string;
}

export default function MiniStrokePreview({ character }: MiniStrokePreviewProps) {
  const [strokeData, setStrokeData] = useState<StrokeData | undefined>(undefined);
  const [currentStroke, setCurrentStroke] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    getStrokeData(character).then((sd) => {
      if (!cancelled) setStrokeData(sd);
    });
    return () => { cancelled = true; };
  }, [character]);

  const hasData = strokeData && strokeData.strokes.length > 0;
  const strokeCount = strokeData?.strokes.length ?? 0;

  const play = useCallback(() => {
    if (!hasData) return;
    setCurrentStroke(-1);
    let idx = 0;
    const step = () => {
      if (idx >= strokeCount) {
        setCurrentStroke(-1);
        return;
      }
      setCurrentStroke(idx);
      idx++;
      timerRef.current = setTimeout(step, 600);
    };
    timerRef.current = setTimeout(step, 150);
  }, [hasData, strokeCount]);

  useEffect(() => {
    if (hasData) {
      const t = setTimeout(play, 300);
      return () => clearTimeout(t);
    }
  }, [hasData, play, character]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!hasData) {
    return (
      <span className="text-[10px]" style={{ color: 'rgba(26,26,24,0.3)', fontFamily: 'Inter' }}>
        Loading strokes...
      </span>
    );
  }

  const size = 100;
  const viewSize = 1024;

  return (
    <div className="flex items-center gap-2">
      <div
        className="relative rounded-md overflow-hidden flex-shrink-0"
        style={{
          width: size,
          height: size,
          background: '#FDFBF6',
          border: '1px solid rgba(26,26,24,0.06)',
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${viewSize} ${viewSize}`}
        >
          <g transform="scale(1, -1) translate(0, -900)">
            {strokeData.strokes.map((path, i) => (
              <path
                key={i}
                d={path}
                fill="none"
                stroke={i <= currentStroke ? (i === currentStroke ? '#C23B2A' : '#1A1A18') : 'rgba(26,26,24,0.08)'}
                strokeWidth={i === currentStroke ? 64 : 48}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transition: 'stroke 0.3s ease' }}
              />
            ))}
          </g>
        </svg>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-medium" style={{ color: '#8B6914', fontFamily: 'Inter' }}>
          {strokeCount} strokes
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); play(); }}
          className="text-[10px] rounded-full px-2 py-0.5 transition-colors"
          style={{ background: 'rgba(194,59,42,0.1)', color: '#C23B2A', fontFamily: 'Inter' }}
        >
          Replay
        </button>
      </div>
    </div>
  );
}
