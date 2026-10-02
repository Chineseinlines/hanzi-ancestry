import { Fragment, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { SCRIPT_STYLES, buildImageUrls, tryLoadImage } from './GlyphEvolution';

interface GlyphEvolutionTimelineProps {
  character: string;
  traditional?: string;
}

/**
 * 字形演变脉络图：一次性铺开全部书写阶段，无翻页。
 * 甲骨/金文/大篆/小篆/隶书取本地字形库 SVG；楷书以现行规范字体渲染。
 */
export default function GlyphEvolutionTimeline({ character, traditional }: GlyphEvolutionTimelineProps) {
  const { lang, t } = useLanguage();
  const displayChar = traditional || character;

  const hex = (() => {
    const cp = displayChar.codePointAt(0);
    return cp == null ? '' : cp.toString(16).toLowerCase();
  })();
  const hexUpper = hex.toUpperCase();

  const [images, setImages] = useState<Record<string, string | null>>({});

  useEffect(() => {
    let cancelled = false;
    setImages({});

    (async () => {
      for (const style of SCRIPT_STYLES) {
        if (cancelled) break;
        let found: string | null = null;
        if (style.useLocalGlyph) {
          for (const url of buildImageUrls(displayChar, hex, hexUpper, style)) {
            if (cancelled) break;
            if (await tryLoadImage(url, 4000)) {
              found = url;
              break;
            }
          }
        }
        if (!cancelled) setImages((prev) => ({ ...prev, [style.key]: found }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [displayChar, hex, hexUpper]);

  return (
    <div>
      <div className="flex items-stretch gap-1 overflow-x-auto pb-1">
        {SCRIPT_STYLES.map((style, i) => {
          const state = images[style.key];
          const isLoading = state === undefined;
          const url = typeof state === 'string' ? state : null;

          return (
            <Fragment key={style.key}>
              {i > 0 && (
                <div className="flex flex-shrink-0 items-center" aria-hidden>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M4 2.5L7.5 6L4 9.5"
                      stroke="#C4A265"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex w-[80px] flex-shrink-0 flex-col items-center rounded-xl px-1.5 py-2"
                style={{ background: 'rgba(245,240,232,0.8)', border: '1px solid rgba(139,105,20,0.14)' }}
              >
                <div className="flex h-[64px] w-full items-center justify-center">
                  {isLoading ? (
                    <div
                      className="h-5 w-5 animate-spin rounded-full border-2"
                      style={{ borderColor: 'rgba(139,105,20,0.2)', borderTopColor: '#8B6914' }}
                    />
                  ) : url ? (
                    <img
                      src={url}
                      alt={`${displayChar} ${style.en}`}
                      referrerPolicy="no-referrer"
                      className="max-h-[60px] max-w-[60px] object-contain"
                    />
                  ) : (
                    <span
                      style={{
                        fontFamily: style.font,
                        fontSize: '2.25rem',
                        lineHeight: 1,
                        color: '#1A1A18',
                        opacity: style.key === 'regular' ? 0.9 : 0.45,
                      }}
                    >
                      {displayChar}
                    </span>
                  )}
                </div>
                <div
                  className="mt-1.5 text-center text-[11px] font-medium leading-tight"
                  style={{ color: '#1A1A18', fontFamily: '"Noto Serif SC", serif' }}
                >
                  {lang === 'zh' ? style.label : style.en}
                </div>
                <div
                  className="mt-0.5 text-center text-[9px] leading-tight"
                  style={{ color: 'rgba(139,105,20,0.7)', fontFamily: 'Inter' }}
                >
                  {style.period}
                </div>
              </motion.div>
            </Fragment>
          );
        })}
      </div>

      <p className="mt-3 text-[10px] text-center" style={{ color: 'rgba(139,105,20,0.6)', fontFamily: 'Inter' }}>
        {t('cmp.glyphEvo.glyphSourceZdic')}
      </p>
    </div>
  );
}