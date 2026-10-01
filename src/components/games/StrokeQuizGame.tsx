import { useMemo, useState } from 'react';
import QuizShell, { bigChar, type QuizQuestion } from './QuizShell';
import { STROKE_COUNTS, sample, shuffle } from '../../data/gameContent';
import { useLanguage } from '../../contexts/LanguageContext';

function buildQuestions(t: (k: string, p?: Record<string, string | number>) => string): QuizQuestion[] {
  const countPool = Array.from(new Set(STROKE_COUNTS.map(s => s.count)));
  const qs: QuizQuestion[] = [];

  for (const item of sample(STROKE_COUNTS, 10)) {
    const correct = String(item.count);
    const distractors = sample(countPool.filter(c => c !== item.count), 3).map(String);
    if (distractors.length < 3) continue;
    const options = shuffle([correct, ...distractors]);
    qs.push({
      prompt: bigChar(item.char),
      hint: t('game.strokeCount'),
      options,
      correctIndex: options.indexOf(correct),
      answerKey: correct,
      explain: t('game.charStrokeCount', { char: item.char, count: item.count }),
    });
  }
  return qs;
}

export default function StrokeQuizGame() {
  const { t } = useLanguage();
  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => buildQuestions(t), [seed, t]);
  return <QuizShell key={seed} gameId="stroke-quiz" questions={questions} onReplay={() => setSeed(s => s + 1)} />;
}