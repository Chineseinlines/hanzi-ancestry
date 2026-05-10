import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface GlyphEvolutionProps {
  character: string;
  traditional?: string;
}

interface ScriptStyle {
  key: string;
  label: string;
  en: string;
  period: string;
  font: string;
  /** Whether to use /glyph/{key}/{hex} local cache URL */
  useLocalGlyph: boolean;
}

const SCRIPT_STYLES: ScriptStyle[] = [
  { key: 'oracle',   label: '甲骨文', en: 'Oracle Bone',  period: 'c. 1250 BCE', font: '"Noto Serif SC", serif', useLocalGlyph: true },
  { key: 'bronze',   label: '金文',   en: 'Bronze',       period: 'c. 1046 BCE', font: '"Noto Serif SC", serif', useLocalGlyph: true },
  { key: 'seal',     label: '小篆',   en: 'Seal Script',  period: 'c. 221 BCE',  font: '"Noto Serif SC", serif', useLocalGlyph: true },
  { key: 'clerical', label: '隶书',   en: 'Clerical',     period: 'c. 200 CE',   font: '"LiSu", "隶书", "STLiti", "华文隶书", "Noto Serif SC", serif', useLocalGlyph: true },
  { key: 'regular',  label: '楷书',   en: 'Regular',      period: 'c. 400 CE',   font: '"Ma Shan Zheng", "Noto Serif SC", serif', useLocalGlyph: false },
];

/** Build image URL(s) for a script style. Returns an array to try in order. */
function buildImageUrls(_char: string, hex: string, hexUpper: string, style: ScriptStyle): string[] {
  if (style.useLocalGlyph) {
    return [`${import.meta.env.BASE_URL}glyphs/${style.key}/${hexUpper}.svg`];
  }
  // Regular script: GlyphWiki SVG (use proxy in dev, direct in production)
  const glyphwikiUrl = `https://glyphwiki.org/glyph/u${hex}.svg`;
  if (import.meta.env.DEV) {
    return [`/api/glyphwiki/glyph/u${hex}.svg`, glyphwikiUrl];
  }
  return [glyphwikiUrl];
}

export default function GlyphEvolution({ character, traditional }: GlyphEvolutionProps) {
  const [active, setActive] = useState(4);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, string | null>>({});
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const displayChar = traditional || character;

  const hex = (() => {
    const cp = displayChar.codePointAt(0);
    if (cp == null) return '';
    return cp.toString(16).toLowerCase();
  })();
  const hexUpper = hex.toUpperCase();

  useEffect(() => {
    setImagesLoaded({});
    setLoadingKeys(new Set(SCRIPT_STYLES.map((s) => s.key)));
    setImgErrors(new Set());

    let cancelled = false;

    const loadAll = async () => {
      for (const style of SCRIPT_STYLES) {
        if (cancelled) break;

        const urls = buildImageUrls(displayChar, hex, hexUpper, style);
        let loadedUrl: string | null = null;

        for (const url of urls) {
          if (cancelled) break;
          try {
            const ok = await tryLoadImage(url);
            if (ok) {
              loadedUrl = url;
              break;
            }
          } catch {
            // continue
          }
        }

        if (!cancelled) {
          setImagesLoaded((prev) => ({ ...prev, [style.key]: loadedUrl }));
          setLoadingKeys((prev) => {
            const next = new Set(prev);
            next.delete(style.key);
            return next;
          });
        }
      }
    };

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [displayChar, hex, hexUpper]);

  const currentStyle = SCRIPT_STYLES[active];
  const currentImageUrl = imagesLoaded[currentStyle.key];
  const hasImage = currentImageUrl !== undefined && currentImageUrl !== null;
  const isLoading = loadingKeys.has(currentStyle.key);
  const isAncient = currentStyle.key !== 'regular';
  const imgErrored = imgErrors.has(currentStyle.key);

  const handlePrev = useCallback(() => {
    setActive((a) => (a > 0 ? a - 1 : SCRIPT_STYLES.length - 1));
  }, []);

  const handleNext = useCallback(() => {
    setActive((a) => (a < SCRIPT_STYLES.length - 1 ? a + 1 : 0));
  }, []);

  return (
    <div className="w-full">
      {/* Main display */}
      <div
        className="relative flex items-center justify-center rounded-2xl overflow-hidden mb-4"
        style={{
          height: 200,
          background: 'linear-gradient(135deg, #F5F0E8 0%, #EDE6D8 100%)',
          boxShadow: 'inset 0 0 30px rgba(139,105,20,0.08)',
        }}
      >
        <button
          onClick={handlePrev}
          className="absolute left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/80"
          style={{ background: 'rgba(255,255,255,0.5)' }}
          aria-label="Previous"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4L6 8L10 12" stroke="#8B6914" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={handleNext}
          className="absolute right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/80"
          style={{ background: 'rgba(255,255,255,0.5)' }}
          aria-label="Next"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="#8B6914" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{
                borderColor: 'rgba(139,105,20,0.2)',
                borderTopColor: '#8B6914',
              }}
            />
            <span className="text-xs" style={{ color: 'rgba(26,26,24,0.35)', fontFamily: 'Inter' }}>
              加载中...
            </span>
          </div>
        ) : hasImage && !imgErrored ? (
          <img
            src={currentImageUrl!}
            alt={`${displayChar} - ${currentStyle.en}`}
            referrerPolicy="no-referrer"
            className="max-h-full max-w-full object-contain p-4"
            onError={() => {
              setImgErrors((prev) => new Set(prev).add(currentStyle.key));
            }}
          />
        ) : (() => {
          const isClerical = currentStyle.key === 'clerical';
          return (
          <div className="flex flex-col items-center">
            <span
              className="font-display-cn leading-none"
              style={{
                fontSize: isAncient && !isClerical ? '4rem' : '5rem',
                color: '#1A1A18',
                fontFamily: currentStyle.font,
                opacity: isAncient && !isClerical ? 0.6 : 0.85,
              }}
            >
              {displayChar}
            </span>
            {isAncient && !isClerical && (
              <span
                className="text-xs mt-1"
                style={{ color: 'rgba(26,26,24,0.25)', fontFamily: 'Inter' }}
              >
                暂无字形图片
              </span>
            )}
            {isClerical && (
              <span
                className="text-[11px] mt-1"
                style={{ color: 'rgba(26,26,24,0.25)', fontFamily: 'Inter' }}
              >
                未找到真实隶书图片，为您显示的是现代仿隶书字体
              </span>
            )}
          </div>
        )})()}
      </div>

      {/* Timeline selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {SCRIPT_STYLES.map((style, i) => {
          const imgState = imagesLoaded[style.key];
          const hasImg = typeof imgState === 'string';
          const isPending = imgState === undefined;
          return (
            <motion.button
              key={style.key}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActive(i)}
              className="flex-shrink-0 rounded-xl px-3 py-2 text-center transition-all"
              style={{
                background: active === i ? '#1A1A18' : '#F5F0E8',
                border: active === i ? 'none' : '1px solid rgba(26,26,24,0.1)',
                minWidth: 72,
              }}
            >
              <div className="flex items-center justify-center gap-1">
                <div
                  className="font-serif-cn text-lg leading-none"
                  style={{
                    color: active === i ? '#F5F0E8' : '#1A1A18',
                    fontFamily: '"Noto Serif SC", serif',
                  }}
                >
                  {style.label}
                </div>
                {hasImg && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: active === i ? '#6B7F5E' : '#C23B2A' }}
                    title="有字形图片"
                  />
                )}
                {isPending && (
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: active === i ? 'rgba(255,255,255,0.3)' : 'rgba(26,26,24,0.15)' }}
                    title="加载中"
                  />
                )}
              </div>
              <div
                className="text-[10px] leading-none"
                style={{
                  color: active === i ? 'rgba(245,240,232,0.7)' : '#8B6914',
                  fontFamily: 'Inter',
                }}
              >
                {style.en}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Try loading an image URL with a timeout.
 * - No crossOrigin: servers don't return CORS headers — would break loading.
 * - referrerPolicy no-referrer: helps bypass hotlink protection.
 * - SVG files (natural 0×0) are accepted as valid.
 * - Tiny raster images (< 20px) treated as placeholder/error images.
 */
function tryLoadImage(url: string, timeoutMs = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.referrerPolicy = 'no-referrer';
    let settled = false;

    const done = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(ok);
    };

    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (w === 0 && h === 0) {
        done(true); // SVG
      } else if (w >= 20 && h >= 20) {
        done(true);
      } else {
        done(false); // tiny placeholder
      }
    };
    img.onerror = () => done(false);

    const timer = setTimeout(() => done(false), timeoutMs);

    img.src = url;
  });
}
