import { useMemo, useState } from 'react';
import QuizShell, { bigChar, type QuizQuestion } from './QuizShell';
import { TRICKY_STROKES, sample, shuffle } from '../../data/gameContent';

function buildQuestions(): QuizQuestion[] {
  const countPool = Array.from(new Set(TRICKY_STROKES.map(s => s.count)));
  const qs: QuizQuestion[] = [];

  for (const item of sample(TRICKY_STROKES, 10)) {
    const correct = String(item.count);
    const distractors = sample(countPool.filter(c => c !== item.count), 3).map(String);
    if (distractors.length < 3) continue;
    const options = shuffle([correct, ...distractors]);
    const orderNote = item.order ? ` 笔顺：${item.order}。` : '';
    qs.push({
      prompt: bigChar(item.char),
      hint: '这个易错字一共有几画？',
      options,
      correctIndex: options.indexOf(correct),
      answerKey: correct,
      explain: `「${item.char}」共 ${item.count} 画。${orderNote}${item.tip}`,
    });
  }
  return qs;
}

export default function TrickyStrokesGame() {
  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => buildQuestions(), [seed]);
  return <QuizShell key={seed} gameId="tricky-strokes" questions={questions} onReplay={() => setSeed(s => s + 1)} />;
}