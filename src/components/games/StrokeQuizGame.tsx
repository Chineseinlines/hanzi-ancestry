import { useMemo, useState } from 'react';
import QuizShell, { bigChar, type QuizQuestion } from './QuizShell';
import { STROKE_COUNTS, sample, shuffle } from '../../data/gameContent';

function buildQuestions(): QuizQuestion[] {
  const countPool = Array.from(new Set(STROKE_COUNTS.map(s => s.count)));
  const qs: QuizQuestion[] = [];

  for (const item of sample(STROKE_COUNTS, 10)) {
    const correct = String(item.count);
    const distractors = sample(countPool.filter(c => c !== item.count), 3).map(String);
    if (distractors.length < 3) continue;
    const options = shuffle([correct, ...distractors]);
    qs.push({
      prompt: bigChar(item.char),
      hint: '这个汉字一共有几画？',
      options,
      correctIndex: options.indexOf(correct),
      answerKey: correct,
      explain: `「${item.char}」共 ${item.count} 画。`,
    });
  }
  return qs;
}

export default function StrokeQuizGame() {
  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => buildQuestions(), [seed]);
  return <QuizShell key={seed} gameId="stroke-quiz" questions={questions} onReplay={() => setSeed(s => s + 1)} />;
}