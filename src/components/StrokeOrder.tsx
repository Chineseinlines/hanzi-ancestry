import { useEffect, useRef, useState, useCallback } from 'react';
import { getStrokeData } from '../data/hanziData';
import { useLanguage } from '../contexts/LanguageContext';

type Speed = 'slow' | 'normal' | 'fast';

/** 速度档位 → hanzi-writer 的笔画动画参数 */
const SPEED: Record<Speed, { speed: number; delay: number }> = {
  slow: { speed: 0.65, delay: 520 },
  normal: { speed: 1, delay: 260 },
  fast: { speed: 1.5, delay: 140 },
};

/**
 * hanzi-writer 3.5.0
 * 代码：MIT（允许商用，保留版权声明）
 * 笔画数据：hanzi-writer-data，Arphic Public License（允许商用，需保留声明与许可副本）
 */
const HW_SRC = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.5.0/dist/hanzi-writer.min.js';

declare global {
  interface Window {
    HanziWriter?: any;
  }
}

let hwPromise: Promise<any> | null = null;

function loadHanziWriter(): Promise<any> {
  if (window.HanziWriter) return Promise.resolve(window.HanziWriter);
  if (!hwPromise) {
    hwPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = HW_SRC;
      s.async = true;
      s.onload = () => (window.HanziWriter ? resolve(window.HanziWriter) : reject(new Error('HanziWriter missing')));
      s.onerror = () => reject(new Error('HanziWriter CDN failed'));
      document.head.appendChild(s);
    });
  }
  return hwPromise;
}

interface StrokeOrderProps {
  character: string;
  size?: number;
}

export default function StrokeOrder({ character, size = 220 }: StrokeOrderProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'ready' | 'nodata' | 'offline'>('ready');
  const [strokeCount, setStrokeCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>('normal');
  const [loop, setLoop] = useState(false);
  const [mode, setMode] = useState<'play' | 'quiz'>('play');
  const [msg, setMsg] = useState('');

  const hostRef = useRef<HTMLDivElement | null>(null);
  const writerRef = useRef<any>(null);
  const playingRef = useRef(false);
  const loopRef = useRef(false);
  const modeRef = useRef<'play' | 'quiz'>('play');

  useEffect(() => { loopRef.current = loop; }, [loop]);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  /** 逐笔播放；loop 开启时反复播放，直到开关关闭或退出描红 */
  const runAnimation = useCallback(async () => {
    const w = writerRef.current;
    if (!w || playingRef.current) return;
    playingRef.current = true;
    setPlaying(true);
    try {
      do {
        await w.animateCharacter();
      } while (loopRef.current && modeRef.current === 'play' && writerRef.current === w);
    } catch {
      /* CDN 数据异常时静默降级 */
    }
    playingRef.current = false;
    setPlaying(false);
  }, []);

  useEffect(() => {
    let disposed = false;
    setLoading(true);
    setStatus('ready');
    setPlaying(false);
    setMode('play');
    modeRef.current = 'play';
    setMsg('');
    setLoop(false);
    loopRef.current = false;
    playingRef.current = false;

    Promise.all([loadHanziWriter(), getStrokeData(character)])
      .then(([HW, sd]) => {
        if (disposed || !hostRef.current) return;
        if (!sd || sd.strokes.length === 0) {
          setStatus('nodata');
          setLoading(false);
          return;
        }
        hostRef.current.innerHTML = '';
        const writer = HW.create(hostRef.current, character, {
          width: size,
          height: size,
          padding: 10,
          showOutline: true,
          showCharacter: true,
          strokeColor: '#2F2A25',
          outlineColor: '#DFD7C9',
          radicalColor: '#C23B2A',
          strokeAnimationSpeed: SPEED[speed].speed,
          delayBetweenStrokes: SPEED[speed].delay,
          charDataLoader: (_c: string, onComplete: (d: any) => void, onError: (e: any) => void) => {
            getStrokeData(character).then((d) => (d ? onComplete(d) : onError(new Error('no strokes')))).catch(onError);
          },
        });
        writerRef.current = writer;
        setStrokeCount(sd.strokes.length);
        setLoading(false);
        void runAnimation();
      })
      .catch(() => {
        if (disposed) return;
        setStatus('offline');
        setLoading(false);
      });

    return () => {
      disposed = true;
      const w = writerRef.current;
      writerRef.current = null;
      playingRef.current = false;
      if (w) {
        try { w.cancelQuiz(); } catch { /* noop */ }
      }
    };
  }, [character, size, speed, runAnimation]);

  /** 进入描红：交给 hanzi-writer 的 quiz 逐笔判分 */
  const startQuiz = useCallback(() => {
    const w = writerRef.current;
    if (!w) return;
    setLoop(false);
    loopRef.current = false;
    setMode('quiz');
    modeRef.current = 'quiz';
    setMsg(t('cmp.strokeOrder.traceHint', { n: 1, total: strokeCount }));
    w.quiz({
      onMistake: () => setMsg(t('cmp.strokeOrder.traceRetry')),
      onCorrectStroke: (d: { strokeNum?: number }) => {
        const next = Math.min((d?.strokeNum ?? 0) + 2, strokeCount);
        setMsg(
          next >= strokeCount
            ? t('cmp.strokeOrder.traceDone')
            : t('cmp.strokeOrder.traceHint', { n: next, total: strokeCount }),
        );
      },
      onComplete: () => setMsg(t('cmp.strokeOrder.traceDone')),
    });
  }, [strokeCount, t]);

  const exitQuiz = useCallback(() => {
    const w = writerRef.current;
    setMode('play');
    modeRef.current = 'play';
    setMsg('');
    if (w) {
      try { w.cancelQuiz(); } catch { /* noop */ }
      try { w.showCharacter(); } catch { /* noop */ }
    }
  }, []);

  const toggleLoop = () => {
    const next = !loop;
    setLoop(next);
    loopRef.current = next;
    if (next) { setMode('play'); modeRef.current = 'play'; void runAnimation(); }
  };

  const bgStyle = {
    backgroundImage:
      'linear-gradient(to right, rgba(196,162,101,0.12) 1px, transparent 1px), ' +
      'linear-gradient(to bottom, rgba(196,162,101,0.12) 1px, transparent 1px)',
    backgroundSize: `${size / 2}px ${size / 2}px, ${size / 2}px ${size / 2}px`,
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          width: size,
          height: size,
          background: '#FDFBF6',
          boxShadow: 'inset 0 0 20px rgba(139,105,20,0.06)',
          ...bgStyle,
        }}
      >
        <div ref={hostRef} className="absolute inset-0" />

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'rgba(245,240,232,0.5)' }}>
            <div
              className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: '#C23B2A', borderTopColor: 'transparent' }}
            />
            <span className="mt-2 text-xs" style={{ color: 'rgba(26,26,24,0.4)', fontFamily: 'Inter' }}>
              Loading strokes...
            </span>
          </div>
        )}

        {!loading && status !== 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center" style={{ background: 'rgba(245,240,232,0.7)' }}>
            <span className="text-4xl font-display-cn" style={{ color: 'rgba(26,26,24,0.2)' }}>
              {character}
            </span>
            <span className="mt-2 text-xs" style={{ color: 'rgba(26,26,24,0.5)', fontFamily: 'Inter' }}>
              {status === 'offline' ? t('cmp.strokeOrder.offline') : t('cmp.strokeOrder.noData')}
            </span>
          </div>
        )}
      </div>

      {mode === 'quiz' && status === 'ready' && (
        <p
          className="text-center text-xs font-medium"
          style={{ color: msg === t('cmp.strokeOrder.traceDone') ? '#6B7F5E' : '#8B6914', fontFamily: 'Inter' }}
        >
          {msg || t('cmp.strokeOrder.traceHint', { n: 1, total: strokeCount })}
        </p>
      )}

      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-medium" style={{ color: '#8B6914', fontFamily: 'Inter' }}>
            {t('cmp.strokeOrder.strokes', { n: strokeCount })}
          </span>
          <button
            onClick={() => { setMode('play'); modeRef.current = 'play'; void runAnimation(); }}
            disabled={loading || playing || status !== 'ready' || mode === 'quiz'}
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
            onClick={toggleLoop}
            disabled={loading || status !== 'ready' || mode === 'quiz'}
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
            onClick={mode === 'quiz' ? exitQuiz : startQuiz}
            disabled={loading || status !== 'ready'}
            className="rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
            style={{
              borderColor: mode === 'quiz' ? '#2D5F8A' : 'rgba(26,26,24,0.15)',
              background: mode === 'quiz' ? 'rgba(45,95,138,0.12)' : 'transparent',
              color: mode === 'quiz' ? '#2D5F8A' : '#8B6914',
              fontFamily: 'Inter',
            }}
          >
            {mode === 'quiz' ? t('cmp.strokeOrder.exitTrace') : t('cmp.strokeOrder.trace')}
          </button>
        </div>
        {mode === 'play' && (
          <div className="flex items-center gap-1 rounded-full p-0.5" style={{ background: 'rgba(26,26,24,0.05)' }}>
            {(['slow', 'normal', 'fast'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                disabled={playing || status !== 'ready'}
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
        <p className="text-center text-[0.625rem]" style={{ color: 'rgba(26,26,24,0.4)', fontFamily: 'Inter' }}>
          {t('cmp.strokeOrder.dataLicense')}
        </p>
      </div>
    </div>
  );
}
