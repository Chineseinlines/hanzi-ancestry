import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import SpeakButton from './SpeakButton';
import { useLanguage } from '../contexts/LanguageContext';
import { IDIOM_STORIES } from '../data/idiomStories';
import type { WordFamilies as WordFamiliesData, WordEntry, IdiomEntry } from '../data/types';

type LenKey = 'two' | 'three' | 'four' | 'idiom';
type PosKey = 'all' | 'start' | 'end';

const LEN_LABEL: Record<LenKey, string> = {
  two: 'detail.wordLenTwo',
  three: 'detail.wordThree',
  four: 'detail.wordFour',
  idiom: 'detail.wordIdioms',
};

const POS_LABEL: Record<PosKey, string> = {
  all: 'detail.wordPosAll',
  start: 'detail.wordPosStart',
  end: 'detail.wordPosEnd',
};

const LEN_ORDER: LenKey[] = ['two', 'three', 'four', 'idiom'];
const POS_ORDER: PosKey[] = ['all', 'start', 'end'];

function WordRow({ entry, lang }: { entry: WordEntry; lang: string }) {
  const [word, pinyin, zh, en] = entry;
  const gloss = lang === 'en' ? en || zh : zh || en;
  return (
    <div className="rounded-lg px-2.5 py-1.5" style={{ background: 'rgba(107,127,94,0.08)' }}>
      <div className="flex items-center gap-1.5">
        <span className="font-serif-cn text-[0.95rem]" style={{ color: '#1A1A18' }}>{word}</span>
        <SpeakButton text={word} size={11} />
      </div>
      {(pinyin || gloss) && (
        <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
          {pinyin && <span className="font-mono text-[10px]" style={{ color: '#C23B2A' }}>{pinyin}</span>}
          {gloss && <span className="text-[10.5px] leading-snug" style={{ color: '#6B7F5E' }}>{gloss}</span>}
        </div>
      )}
    </div>
  );
}

function IdiomCard({ entry, index }: { entry: IdiomEntry; index: number }) {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [word, pinyin, gloss, source, example] = entry;
  const story = IDIOM_STORIES[word];

  return (
    <div className="overflow-hidden rounded-xl" style={{ background: open ? 'rgba(194,59,42,0.07)' : 'rgba(26,26,24,0.03)' }}>
      <button onClick={() => setOpen(!open)} className="w-full p-3 text-left">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 text-sm font-medium" style={{ color: '#C23B2A' }}>{index + 1}.</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-serif-cn text-[0.95rem] font-medium" style={{ color: '#1A1A18' }}>{word}</span>
              {pinyin && <span className="font-mono text-[10px]" style={{ color: '#C23B2A' }}>{pinyin}</span>}
              <SpeakButton text={word} size={11} />
              {story && (
                <span className="rounded px-1.5 py-0.5 text-[9px]" style={{ background: 'rgba(139,105,20,0.14)', color: '#8B6914' }}>
                  {t('detail.idiomStory')}
                </span>
              )}
            </div>
            {gloss && (
              <p className="mt-1 text-[11.5px] leading-relaxed" style={{ color: '#3D3D3B' }}>{gloss}</p>
            )}
          </div>
          <ChevronDown
            size={14}
            className="mt-0.5 shrink-0 transition-transform"
            style={{ color: '#8B6914', transform: open ? 'rotate(180deg)' : 'none' }}
          />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 px-3 pb-3 pl-8">
              {story && (
                <div className="rounded-lg p-2.5" style={{ background: 'rgba(139,105,20,0.08)' }}>
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#8B6914' }}>
                    {t('detail.idiomStory')}
                  </div>
                  <p className="text-[11.5px] leading-[1.8]" style={{ color: '#3D3D3B' }}>
                    {lang === 'en' ? story.en : story.zh}
                  </p>
                </div>
              )}
              {source && (
                <div>
                  <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#8B6914' }}>
                    {t('detail.idiomSource')}
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: '#3D3D3B' }}>{source}</p>
                </div>
              )}
              {example && (
                <div>
                  <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#8B6914' }}>
                    {t('detail.idiomExample')}
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: '#3D3D3B' }}>{example}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function WordFamilies({ data, char }: { data: WordFamiliesData | null; char: string }) {
  const { t, lang } = useLanguage();

  const [len, setLen] = useState<LenKey>(() => {
    if (!data) return 'two';
    if ((data.s2?.length ?? 0) + (data.e2?.length ?? 0) > 0) return 'two';
    if (data.s3?.length) return 'three';
    if (data.s4?.length) return 'four';
    if (data.id?.length) return 'idiom';
    return 'two';
  });
  const [pos, setPos] = useState<PosKey>('all');

  /** 有数据的字数分类（不含位置筛选，保证筛选条稳定） */
  const availableLens = useMemo(() => {
    if (!data) return [] as LenKey[];
    const has: Record<LenKey, boolean> = {
      two: (data.s2?.length ?? 0) + (data.e2?.length ?? 0) > 0,
      three: (data.s3?.length ?? 0) > 0,
      four: (data.s4?.length ?? 0) > 0,
      idiom: (data.id?.length ?? 0) > 0,
    };
    return LEN_ORDER.filter((k) => has[k]);
  }, [data]);

  /** 当前「字数 + 位置」下的词语列表 */
  const words = useMemo<WordEntry[]>(() => {
    if (!data) return [];
    const byPos = (list?: WordEntry[]) =>
      (list ?? []).filter(([w]) =>
        pos === 'all' ? true : pos === 'start' ? w.startsWith(char) : w.endsWith(char),
      );
    if (len === 'two') {
      if (pos === 'all') return [...(data.s2 ?? []), ...(data.e2 ?? [])];
      return byPos(pos === 'start' ? data.s2 : data.e2);
    }
    if (len === 'three') return byPos(data.s3);
    if (len === 'four') return byPos(data.s4);
    return [];
  }, [data, len, pos, char]);

  if (!data) return null;

  const idioms = data.id ?? [];
  const total = availableLens.length;
  if (total === 0) {
    return <p className="text-sm" style={{ color: '#9CA3AF' }}>{t('detail.wordsEmpty')}</p>;
  }

  const activeCount = len === 'idiom' ? idioms.length : words.length;
  const showPosition = len !== 'idiom';

  return (
    <div className="flex flex-col gap-3.5">
      {/* 字数筛选 */}
      <div className="flex flex-wrap items-center gap-1.5">
        {availableLens.map((k) => {
          const active = len === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setLen(k)}
              className="rounded-full px-3 py-1.5 text-[12px] font-medium transition-all"
              style={{
                background: active ? '#1A1A18' : 'rgba(26,26,24,0.05)',
                color: active ? '#F5F0E8' : '#5A5548',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {t(LEN_LABEL[k])}
            </button>
          );
        })}
      </div>

      {/* 位置筛选 */}
      {showPosition && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px]" style={{ color: '#9A9384', fontFamily: 'Inter, sans-serif' }}>
            {t('detail.wordPosition')}
          </span>
          {POS_ORDER.map((p) => {
            const active = pos === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPos(p)}
                className="rounded-full px-2.5 py-1 text-[11px] font-medium transition-all"
                style={{
                  background: active ? 'rgba(194,59,42,0.12)' : 'transparent',
                  color: active ? '#C23B2A' : '#8A8577',
                  border: active ? '1px solid rgba(194,59,42,0.32)' : '1px solid rgba(26,26,24,0.09)',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {t(POS_LABEL[p])}
              </button>
            );
          })}
        </div>
      )}

      {/* 计数 */}
      <div className="flex items-center gap-2">
        <span
          className="rounded-full px-1.5 py-0.5 text-[9px]"
          style={{ background: 'rgba(26,26,24,0.06)', color: '#8B6914', fontFamily: 'Inter, sans-serif' }}
        >
          {t('detail.wordCategoryCount', { n: activeCount })}
        </span>
      </div>

      {/* 列表 */}
      {activeCount === 0 ? (
        <p className="text-sm" style={{ color: '#9CA3AF' }}>{t('detail.wordsFilterEmpty')}</p>
      ) : len === 'idiom' ? (
        <div className="flex flex-col gap-1.5">
          {idioms.map((e, i) => <IdiomCard key={`id-${i}`} entry={e} index={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {words.map((e, i) => <WordRow key={`${len}-${pos}-${i}`} entry={e} lang={lang} />)}
        </div>
      )}
    </div>
  );
}