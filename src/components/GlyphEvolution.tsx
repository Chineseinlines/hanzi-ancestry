import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { ShuowenEntry } from '../data/types';
import { getScriptBackground } from '../data/scriptBackground';
import { useLanguage } from '../contexts/LanguageContext';

interface GlyphEvolutionProps {
  character: string;
  traditional?: string;
  shuowen?: ShuowenEntry | null;
}

export interface ScriptStyle {
  key: string;
  label: string;
  en: string;
  period: string;
  font: string;
  useLocalGlyph: boolean;
  /** 无字形图片时的兜底说明 i18n key（缺省用通用文案） */
  fallbackNoteKey?: string;
}

export const SCRIPT_STYLES: ScriptStyle[] = [
  { key: 'oracle',     label: '甲骨文', en: 'Oracle Bone',  period: 'c. 1250 BCE', font: '"Noto Serif SC", serif', useLocalGlyph: true },
  { key: 'bronze',     label: '金文',   en: 'Bronze',       period: 'c. 1046 BCE', font: '"Noto Serif SC", serif', useLocalGlyph: true },
  { key: 'large-seal', label: '大篆',   en: 'Large Seal',   period: 'c. 700 BCE',  font: '"Noto Serif SC", serif', useLocalGlyph: true, fallbackNoteKey: 'cmp.glyphEvo.largeSealFallback' },
  { key: 'seal',       label: '小篆',   en: 'Seal Script',  period: 'c. 221 BCE',  font: '"Noto Serif SC", serif', useLocalGlyph: true },
  { key: 'clerical',   label: '隶书',   en: 'Clerical',     period: 'c. 200 CE',   font: '"LiSu", "隶书", "STLiti", "华文隶书", "Noto Serif SC", serif', useLocalGlyph: true, fallbackNoteKey: 'cmp.glyphEvo.clericalFallback' },
  { key: 'regular',    label: '楷书',   en: 'Regular',      period: 'c. 400 CE',   font: '"Ma Shan Zheng", "LXGW WenKai", "KaiTi", "楷体", "STKaiti", "Kaiti SC", "DFKai-SB", "TW-Kai", "AR PL UKai CN", serif', useLocalGlyph: false },
];

/** 默认展示的阶段（现行规范字形） */
const DEFAULT_STYLE_KEY = 'regular';

const EASING = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

function buildEnglishSummary(shuowen: ShuowenEntry): string {
  const parts: string[] = [];
  const sb = shuowen.sixBooks;
  if (sb === '象形') parts.push('Pictograph — depicts the object\'s form');
  else if (sb === '指事') parts.push('Ideogram — abstract symbol indicating a concept');
  else if (sb === '会意') parts.push('Compound ideograph — combines components for meaning');
  else if (sb === '形声') parts.push('Phono-semantic compound — semantic + phonetic');
  else if (sb === '转注') parts.push('Transferred cognate — shares meaning or sound');
  else if (sb === '假借') parts.push('Phonetic loan — borrowed for its sound');
  else if (sb) parts.push(sb);

  if (shuowen.structure && shuowen.structure !== sb) {
    parts.push(`Structure: ${shuowen.structure}`);
  }

  return parts.join('. ') + (parts.length > 0 ? '.' : '');
}

export function buildImageUrls(_char: string, hex: string, hexUpper: string, style: ScriptStyle): string[] {
  if (style.useLocalGlyph) {
    return [`${import.meta.env.BASE_URL}glyphs/${style.key}/${hexUpper}.svg`];
  }
  const glyphwikiUrl = `https://glyphwiki.org/glyph/u${hex}.svg`;
  if (import.meta.env.DEV) {
    return [`/api/glyphwiki/glyph/u${hex}.svg`, glyphwikiUrl];
  }
  return [glyphwikiUrl];
}

const SIX_BOOKS_LABEL_KEYS: Record<string, string> = {
  '象形': 'cmp.glyphEvo.sbXiangxing',
  '指事': 'cmp.glyphEvo.sbZhishi',
  '会意': 'cmp.glyphEvo.sbHuiyi',
  '形声': 'cmp.glyphEvo.sbXingsheng',
  '转注': 'cmp.glyphEvo.sbZhuanzhu',
  '假借': 'cmp.glyphEvo.sbJiajie',
};

export default function GlyphEvolution({ character, traditional, shuowen }: GlyphEvolutionProps) {
  const { lang, t } = useLanguage();
  const [active, setActive] = useState(() => {
    const i = SCRIPT_STYLES.findIndex((s) => s.key === DEFAULT_STYLE_KEY);
    return i >= 0 ? i : SCRIPT_STYLES.length - 1;
  });
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, string | null>>({});
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const [showShuowenDetail, setShowShuowenDetail] = useState(false);
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
    setShowShuowenDetail(false);

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
  const scriptBg = getScriptBackground(currentStyle.key);

  const handlePrev = useCallback(() => {
    setActive((a) => (a > 0 ? a - 1 : SCRIPT_STYLES.length - 1));
  }, []);

  const handleNext = useCallback(() => {
    setActive((a) => (a < SCRIPT_STYLES.length - 1 ? a + 1 : 0));
  }, []);

  const hasShuowen = shuowen && (shuowen.shuowen || shuowen.structure || shuowen.sixBooks);
  const sixBooksLabel = shuowen?.sixBooks && SIX_BOOKS_LABEL_KEYS[shuowen.sixBooks]
    ? t(SIX_BOOKS_LABEL_KEYS[shuowen.sixBooks])
    : undefined;

  return (
    <div className="w-full">
      {/* Main display: glyph + shuowen side panel */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        {/* Glyph image */}
        <div
          className="relative flex items-center justify-center rounded-2xl overflow-hidden flex-1"
          style={{
            height: 280,
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

          <div className="absolute top-3 right-12 z-10">
            <span
              className="text-[0.625rem] px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(139,105,20,0.12)', color: '#8B6914', fontFamily: 'Inter' }}
            >
              {currentStyle.period}
            </span>
          </div>

          {/* 逐阶段来源标注 */}
          <div className="absolute bottom-2 left-3 right-3 z-10 text-center pointer-events-none">
            <span
              className="text-[0.5625rem]"
              style={{ color: 'rgba(139,105,20,0.55)', fontFamily: 'Inter' }}
            >
              {currentStyle.key === 'regular'
                ? t('cmp.glyphEvo.glyphSourceFont')
                : t('cmp.glyphEvo.glyphSourceZdic')}
            </span>
          </div>

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
                {t('cmp.glyphEvo.loading')}
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
            const noteKey = currentStyle.fallbackNoteKey ?? 'cmp.glyphEvo.noGlyphImage';
            return (
            <div className="flex flex-col items-center px-6">
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
              {isAncient && (
                <span
                  className="text-[11px] mt-1 text-center"
                  style={{ color: 'rgba(26,26,24,0.25)', fontFamily: 'Inter' }}
                >
                  {t(noteKey)}
                </span>
              )}
            </div>
          )})()}
        </div>

        {/* Shuowen info panel */}
        {hasShuowen && (
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: EASING }}
            className="lg:w-72 flex-shrink-0 rounded-2xl p-5 flex flex-col gap-3"
            style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)', border: '1px solid rgba(26,26,24,0.06)' }}
          >
            <div className="flex items-center gap-2">
              <span
                className="text-[0.625rem] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider"
                style={{ background: 'rgba(194,59,42,0.1)', color: '#C23B2A', fontFamily: 'Inter' }}
              >
                {t('cmp.glyphEvo.shuowenTitle')}
              </span>
              <span className="text-[0.625rem] font-medium" style={{ color: 'rgba(139,105,20,0.5)', fontFamily: 'Inter' }}>
                Shuowen Jiezi
              </span>
            </div>

            {/* Structure & Six Books */}
            <div className="flex flex-wrap gap-2">
              {shuowen.structure && (
                <span
                  className="text-[0.6875rem] px-2.5 py-1 rounded-lg font-medium"
                  style={{ background: 'rgba(45,95,138,0.08)', color: '#2D5F8A', fontFamily: 'Inter', border: '1px solid rgba(45,95,138,0.15)' }}
                >
                  {t('cmp.glyphEvo.structureLabel')}: {shuowen.structure}
                </span>
              )}
              {shuowen.sixBooks && (
                <span
                  className="text-[0.6875rem] px-2.5 py-1 rounded-lg font-medium"
                  style={{ background: 'rgba(107,127,94,0.1)', color: '#6B7F5E', fontFamily: 'Inter', border: '1px solid rgba(107,127,94,0.2)' }}
                >
                  {t('cmp.glyphEvo.sixBooksLabel')}: {shuowen.sixBooks}
                </span>
              )}
            </div>

            {/* Six books explanation */}
            {sixBooksLabel && (
              <p className="text-[0.6875rem] leading-relaxed" style={{ color: '#8B6914', fontFamily: 'Inter' }}>
                {sixBooksLabel}
              </p>
            )}

            {/* Summary explanation (language-aware) */}
            {(lang === 'en' ? buildEnglishSummary(shuowen) : sixBooksLabel) && (
              <div className="rounded-xl p-3" style={{ background: 'rgba(245,240,232,0.6)' }}>
                <p className="text-[0.75rem] leading-relaxed" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>
                  {lang === 'en' ? buildEnglishSummary(shuowen) : sixBooksLabel}
                </p>
              </div>
            )}

            {/* Chinese原文 — always available when shuowen text exists */}
            {shuowen.shuowen && (
              <div>
                <button
                  onClick={() => setShowShuowenDetail(!showShuowenDetail)}
                  className="flex items-center gap-1 text-[0.6875rem] font-medium transition-colors hover:underline"
                  style={{ color: '#C23B2A', fontFamily: 'Inter' }}
                >
                  {t('cmp.glyphEvo.viewOriginal')}
                  <svg
                    width="10" height="10" viewBox="0 0 10 10" fill="none"
                    className={`transition-transform duration-200 ${showShuowenDetail ? 'rotate-180' : ''}`}
                  >
                    <path d="M2 3.5L5 6.5L8 3.5" stroke="#C23B2A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <AnimatePresence>
                  {showShuowenDetail && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p
                        className="mt-2 text-[0.6875rem] leading-relaxed max-h-40 overflow-y-auto rounded-lg p-2.5 font-serif-cn"
                        style={{ background: 'rgba(245,240,232,0.5)', color: '#5A5548' }}
                      >
                        {shuowen.shuowen}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* No data at all */}
            {!shuowen.shuowen && !shuowen.summary && !shuowen.sixBooks && (
              <p className="text-[0.6875rem] italic" style={{ color: 'rgba(139,105,20,0.4)', fontFamily: 'Inter' }}>
                {t('cmp.glyphEvo.noShuowen')}
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* Script-stage cultural background */}
      {scriptBg && (
        <motion.div
          key={currentStyle.key}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASING }}
          className="mb-4 rounded-2xl px-4 py-3"
          style={{ background: 'rgba(245,240,232,0.55)', border: '1px solid rgba(139,105,20,0.12)' }}
        >
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span
              className="text-[0.625rem] font-semibold uppercase tracking-wider"
              style={{ color: '#8B6914', fontFamily: 'Inter' }}
            >
              {t('cmp.glyphEvo.scriptBackground')}
            </span>
            <span className="text-[0.6875rem] font-medium font-serif-cn" style={{ color: '#1A1A18' }}>
              {lang === 'zh' ? currentStyle.label : currentStyle.en}
            </span>
            <span className="text-[0.625rem]" style={{ color: 'rgba(26,26,24,0.35)', fontFamily: 'Inter' }}>
              {lang === 'zh' ? currentStyle.en : currentStyle.label}
            </span>
            <span
              className="ml-auto text-[0.625rem]"
              style={{ color: 'rgba(139,105,20,0.7)', fontFamily: 'Inter' }}
            >
              {lang === 'zh' ? scriptBg.period : scriptBg.periodEn}
            </span>
          </div>
          <p className="text-[0.75rem] leading-relaxed" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>
            {lang === 'zh' ? scriptBg.background : scriptBg.backgroundEn}
          </p>
        </motion.div>
      )}

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
                  {lang === 'zh' ? style.label : style.en}
                </div>
                {hasImg && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: active === i ? '#6B7F5E' : '#C23B2A' }}
                    title={t('cmp.glyphEvo.hasImage')}
                  />
                )}
                {isPending && (
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: active === i ? 'rgba(255,255,255,0.3)' : 'rgba(26,26,24,0.15)' }}
                    title={t('cmp.glyphEvo.loading')}
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
                {lang === 'zh' ? style.en : style.label}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* External reference links */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <a
          href={`https://hanziyuan.net/#${encodeURIComponent(displayChar)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[0.6875rem] inline-flex items-center gap-1 rounded-full px-3 py-1 transition-colors hover:underline"
          style={{ background: 'rgba(45,95,138,0.06)', color: '#2D5F8A', fontFamily: 'Inter' }}
        >
          {t('cmp.glyphEvo.viewHanziyuan')}
        </a>
        <a
          href={`https://ctext.org/dictionary.pl?if=en&char=${encodeURIComponent(displayChar)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[0.6875rem] inline-flex items-center gap-1 rounded-full px-3 py-1 transition-colors hover:underline"
          style={{ background: 'rgba(107,127,94,0.08)', color: '#6B7F5E', fontFamily: 'Inter' }}
        >
          {t('cmp.glyphEvo.viewCtext')}
        </a>
        <Link
          to="/sources"
          className="text-[0.6875rem] inline-flex items-center gap-1 rounded-full px-3 py-1 transition-colors hover:underline"
          style={{ background: 'rgba(139,105,20,0.08)', color: '#8B6914', fontFamily: 'Inter' }}
        >
          {t('cmp.glyphEvo.allSources')}
        </Link>
      </div>

      {/* No shuowen data at all */}
      {!hasShuowen && (
        <p className="mt-3 text-[0.6875rem] text-center" style={{ color: 'rgba(139,105,20,0.35)', fontFamily: 'Inter' }}>
          {t('cmp.glyphEvo.noShuowen')}
        </p>
      )}
    </div>
  );
}

export function tryLoadImage(url: string, timeoutMs = 5000): Promise<boolean> {
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
        done(true);
      } else if (w >= 20 && h >= 20) {
        done(true);
      } else {
        done(false);
      }
    };
    img.onerror = () => done(false);

    const timer = setTimeout(() => done(false), timeoutMs);

    img.src = url;
  });
}
