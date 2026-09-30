import { useMemo, useState } from 'react';
import QuizShell, { type QuizQuestion } from './QuizShell';
import { LOOKALIKES, sample, shuffle } from '../../data/gameContent';

function blankWord(word: string): string {
  return word.replace('__', '□');
}

function buildQuestions(): QuizQuestion[] {
  const qs: QuizQuestion[] = [];
  for (const item of sample(LOOKALIKES, 10)) {
    const options = shuffle([...item.options]);
    qs.push({
      prompt: (
        <span className="inline-block font-display-cn" style={{ fontSize: '3rem', lineHeight: 1.2, color: '#1A1A18', fontFamily: '"Ma Shan Zheng", cursive' }}>
          {blankWord(item.word)}
        </span>
      ),
      hint: `读音提示：${item.pinyin} · 请选出应填入的字`,
      options,
      correctIndex: options.indexOf(item.correct),
      answerKey: item.correct,
      explain: item.explain,
    });
  }
  return qs;
}

export default function LookalikeGame() {
  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => buildQuestions(), [seed]);
  return <QuizShell key={seed} gameId="lookalike" questions={questions} bigOptions onReplay={() => setSeed(s => s + 1)} />;
}