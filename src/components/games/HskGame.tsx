import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import QuizShell, { bigChar, type QuizQuestion } from './QuizShell';
import { getAllCharacters, getCharacter, getLocalizedDefinition, numberToMark } from '../../data/hanziData';
import { HSK_LEVELS, sample, shuffle } from '../../data/gameContent';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Locale } from '../../i18n';

function buildQuestions(
  levelChars: string[],
  lang: Locale,
  t: (k: string, p?: Record<string, string | number>) => string,
): QuizQuestion[] {
  const allEntries = getAllCharacters();
  const pinyinPool = Array.from(new Set(
    allEntries.map(e => e.pinyin.map(numberToMark).join(' / ')).filter(p => p.length > 0),
  ));
  const qs: QuizQuestion[] = [];

  for (const ch of shuffle(levelChars)) {
    const entry = getCharacter(ch);
    if (!entry || entry.pinyin.length === 0) continue;
    const correct = entry.pinyin.map(numberToMark).join(' / ');
    const distractors = sample(pinyinPool.filter(p => p !== correct), 3);
    if (distractors.length < 3) continue;
    const options = shuffle([correct, ...distractors]);
    const meaning = getLocalizedDefinition(entry, lang);
    qs.push({
      prompt: bigChar(ch),
      hint: t('game.chooseReadingSimple'),
      options,
      correctIndex: options.indexOf(correct),
      answerKey: correct,
      explain: meaning ? t('game.readsAsMeaning', { char: ch, reading: correct, meaning }) : t('game.readsAs', { char: ch, reading: correct }),
    });
    if (qs.length >= 8) break;
  }
  return qs;
}

export default function HskGame() {
  const { lang, t } = useLanguage();
  const [levelIndex, setLevelIndex] = useState<number | null>(null);
  const [seed, setSeed] = useState(0);

  const level = levelIndex === null ? null : HSK_LEVELS[levelIndex];
  const questions = useMemo(() => (level ? buildQuestions(level.chars, lang, t) : []), [level, seed, lang, t]);

  if (!level) {
    return (
      <div className="rounded-2xl p-6" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
        <h3 className="text-center text-lg font-semibold mb-1" style={{ color: '#1A1A18' }}>{t('game.chooseHskLevel')}</h3>
        <p className="text-center text-sm mb-5" style={{ color: '#8B6914', fontFamily: 'Inter' }}>{t('game.hskSubtitle')}</p>
        <div className="grid grid-cols-2 gap-3">
          {HSK_LEVELS.map((lvl, i) => (
            <motion.button
              key={lvl.level}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setLevelIndex(i); setSeed(s => s + 1); }}
              className="rounded-xl px-4 py-4 text-left transition-all"
              style={{ background: '#F5F0E8', border: '1px solid rgba(194,59,42,0.2)' }}
            >
              <div className="font-display text-sm font-semibold" style={{ color: '#C23B2A' }}>{lang === 'en' ? lvl.nameEn : lvl.name}</div>
              <div className="mt-1 text-xs" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>{t('game.sampleChars', { n: lvl.chars.length })}</div>
            </motion.button>
          ))}
        </div>
        {levelIndex !== null && (
          <div className="mt-4">
            <button onClick={() => setLevelIndex(null)} className="mx-auto block rounded-full px-4 py-1.5 text-xs font-medium" style={{ background: 'rgba(26,26,24,0.05)', color: '#3D3D3B', fontFamily: 'Inter' }}>{t('game.chooseLevelAgain')}</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ color: '#C23B2A' }}>{lang === 'en' ? level.nameEn : level.name}</span>
        <button onClick={() => setLevelIndex(null)} className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: 'rgba(26,26,24,0.05)', color: '#3D3D3B', fontFamily: 'Inter' }}>{t('game.switchLevel')}</button>
      </div>
      <QuizShell key={seed} gameId="hsk-levels" questions={questions} onReplay={() => setSeed(s => s + 1)} />
    </div>
  );
}