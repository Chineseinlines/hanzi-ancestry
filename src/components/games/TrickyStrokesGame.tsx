import { useMemo, useState } from 'react';
import QuizShell, { bigChar, type QuizQuestion } from './QuizShell';
import { TRICKY_STROKES, sample, shuffle } from '../../data/gameContent';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Locale } from '../../i18n';

function buildQuestions(lang: Locale, t: (k: string, p?: Record<string, string | number>) => string): QuizQuestion[] {
  const countPool = Array.from(new Set(TRICKY_STROKES.map(s => s.count)));
  const isEn = lang === 'en';
  const qs: QuizQuestion[] = [];

  for (const item of sample(TRICKY_STROKES, 10)) {
    const correct = String(item.count);
    const distractors = sample(countPool.filter(c => c !== item.count), 3).map(String);
    if (distractors.length < 3) continue;
    const options = shuffle([correct, ...distractors]);
    const order = isEn ? item.orderEn : item.order;
    const tip = isEn ? item.tipEn : item.tip;
    const orderNote = order ? t('game.strokeOrderNote', { order }) : '';
    qs.push({
      prompt: bigChar(item.char),
      hint: t('game.trickyStrokeCount'),
      options,
      correctIndex: options.indexOf(correct),
      answerKey: correct,
      explain: `${t('game.charStrokeCount', { char: item.char, count: item.count })}${orderNote}${tip}`,
    });
  }
  return qs;
}

export default function TrickyStrokesGame() {
  const { lang, t } = useLanguage();
  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => buildQuestions(lang, t), [seed, lang, t]);
  return <QuizShell key={seed} gameId="tricky-strokes" questions={questions} onReplay={() => setSeed(s => s + 1)} />;
}