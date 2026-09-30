import { useMemo, useState } from 'react';
import QuizShell, { type QuizQuestion } from './QuizShell';
import { FUN_FACTS, sample } from '../../data/gameContent';

function buildQuestions(): QuizQuestion[] {
  const qs: QuizQuestion[] = [];
  for (const item of sample(FUN_FACTS, 10)) {
    qs.push({
      prompt: (
        <span className="inline-block px-2 text-lg font-medium leading-relaxed" style={{ color: '#1A1A18', fontFamily: '"Noto Serif SC", serif' }}>
          {item.question}
        </span>
      ),
      options: item.options,
      correctIndex: item.correctIndex,
      answerKey: item.options[item.correctIndex],
      explain: item.explain,
    });
  }
  return qs;
}

export default function FunFactsGame() {
  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => buildQuestions(), [seed]);
  return <QuizShell key={seed} gameId="fun-facts" questions={questions} onReplay={() => setSeed(s => s + 1)} />;
}