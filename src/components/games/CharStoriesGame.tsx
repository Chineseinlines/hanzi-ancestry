import { useMemo, useState } from 'react';
import QuizShell, { bigChar, type QuizQuestion } from './QuizShell';
import { CHAR_STORIES, sample } from '../../data/gameContent';

function buildQuestions(): QuizQuestion[] {
  const qs: QuizQuestion[] = [];
  for (const item of sample(CHAR_STORIES, 10)) {
    qs.push({
      prompt: bigChar(item.char),
      hint: item.question,
      options: item.options,
      correctIndex: item.correctIndex,
      answerKey: item.options[item.correctIndex],
      explain: item.explain,
    });
  }
  return qs;
}

export default function CharStoriesGame() {
  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => buildQuestions(), [seed]);
  return <QuizShell key={seed} gameId="char-stories" questions={questions} onReplay={() => setSeed(s => s + 1)} />;
}