import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import SpeakButton from './SpeakButton';
import { useLanguage } from '../contexts/LanguageContext';
import { IDIOM_STORIES } from '../data/idiomStories';
import type { WordFamilies as WordFamiliesData, WordEntry, IdiomEntry } from '../data/types';

const CATS: { key: 's2' | 'e2' | 's3' | 's4'; labelKey: string; accent: string }[] = [
  { key: 's2', labelKey: 'detail.wordTwoStart', accent: '#6B7F5E' },
  { key: 'e2', labelKey: 'detail.wordTwoEnd', accent: '#6B7F5E' },
  { key: 's3', labelKey: 'detail.wordThree', accent: '#2D5F8A' },
  { key: 's4', labelKey: 'detail.wordFour', accent: '#2D5F8A' },
];

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

export default function WordFamilies({ data }: { data: WordFamiliesData | null }) {
  const { t, lang } = useLanguage();
  if (!data) return null;

  const hasAny = CATS.some((c) => (data[c.key]?.length ?? 0) > 0) || (data.id?.length ?? 0) > 0;
  if (!hasAny) {
    return <p className="text-sm" style={{ color: '#9CA3AF' }}>{t('detail.wordsEmpty')}</p>;
  }

  const countBadge = (n: number) => (
    <span className="rounded-full px-1.5 py-0.5 text-[9px]" style={{ background: 'rgba(26,26,24,0.06)', color: '#8B6914' }}>
      {t('detail.wordCategoryCount', { n })}
    </span>
  );

  return (
    <div className="flex flex-col gap-5">
      {CATS.map((c) => {
        const list = data[c.key];
        if (!list?.length) return null;
        return (
          <div key={c.key}>
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-xs font-medium uppercase tracking-wider" style={{ color: c.accent }}>{t(c.labelKey)}</h3>
              {countBadge(list.length)}
            </div>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {list.map((e, i) => <WordRow key={`${c.key}-${i}`} entry={e} lang={lang} />)}
            </div>
          </div>
        );
      })}

      {data.id?.length ? (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-xs font-medium uppercase tracking-wider" style={{ color: '#C23B2A' }}>{t('detail.wordIdioms')}</h3>
            {countBadge(data.id.length)}
          </div>
          <div className="flex flex-col gap-1.5">
            {data.id.map((e, i) => <IdiomCard key={`id-${i}`} entry={e} index={i} />)}
          </div>
        </div>
      ) : null}
    </div>
  );
}