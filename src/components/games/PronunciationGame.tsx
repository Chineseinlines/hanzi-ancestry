import { useMemo, useState } from 'react';
import QuizShell, { bigChar, type QuizQuestion } from './QuizShell';
import { getAllCharacters, numberToMark } from '../../data/hanziData';
import { COMMON_CHAR_SET } from '../../data/commonChars';
import { sample, shuffle } from '../../data/gameContent';

const COMMON = new Set(COMMON_CHAR_SET);

function buildQuestions(): QuizQuestion[] {
  const entries = getAllCharacters().filter(e => COMMON.has(e.character) && e.pinyin.length > 0);
  if (entries.length === 0) return [];

  const pinyinPool = Array.from(new Set(entries.map(e => e.pinyin.map(numberToMark).join(' / '))));
  const qs: QuizQuestion[] = [];
  const picked = sample(entries, 12);

  for (const entry of picked) {
    const correct = entry.pinyin.map(numberToMark).join(' / ');
    const distractors = sample(pinyinPool.filter(p => p !== correct), 3);
    if (distractors.length < 3) continue;
    const options = shuffle([correct, ...distractors]);
    qs.push({
      prompt: bigChar(entry.character),
      hint: '请选出这个汉字正确的读音（多音字会列出多个读音）',
      options,
      correctIndex: options.indexOf(correct),
      answerKey: correct,
      explain: `「${entry.character}」读作 ${correct}`,
    });
  }
  return qs;
}

export default function PronunciationGame() {
  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => buildQuestions(), [seed]);
  return <QuizShell key={seed} gameId="pronunciation" questions={questions} onReplay={() => setSeed(s => s + 1)} />;
}