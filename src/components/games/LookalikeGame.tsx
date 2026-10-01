import { useMemo, useState } from 'react';
import QuizShell, { type QuizQuestion } from './QuizShell';
import { LOOKALIKES, sample, shuffle } from '../../data/gameContent';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Locale } from '../../i18n';

function blankWord(word: string): string {
  return word.replace('__', '□');
}

function buildQuestions(lang: Locale, t: (k: string, p?: Record<string, string | number>) => string): QuizQuestion[] {
  const qs: QuizQuestion[] = [];
  const isEn = lang === 'en';
  for (const item of sample(LOOKALIKES, 10)) {
    const options = shuffle([...item.options]);
    qs.push({
      prompt: (
        <span className="inline-block font-display-cn" style={{ fontSize: '3rem', lineHeight: 1.2, color: '#1A1A18', fontFamily: '"Ma Shan Zheng", cursive' }}>
          {blankWord(item.word)}
        </span>
      ),
      hint: t('game.pinyinHint', { pinyin: item.pinyin }),
      options,
      correctIndex: options.indexOf(item.correct),
      answerKey: item.correct,
      explain: isEn ? item.explainEn : item.explain,
    });
  }
  return qs;
}

export default function LookalikeGame() {
  const { lang, t } = useLanguage();
  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => buildQuestions(lang, t), [seed, lang, t]);
  return <QuizShell key={seed} gameId="lookalike" questions={questions} bigOptions onReplay={() => setSeed(s => s + 1)} />;
}