import { useMemo, useState } from 'react';
import QuizShell, { bigChar, type QuizQuestion } from './QuizShell';
import { getAllCharacters } from '../../data/hanziData';
import { COMMON_CHAR_SET } from '../../data/commonChars';
import { sample, shuffle } from '../../data/gameContent';

const COMMON = new Set(COMMON_CHAR_SET);

function buildQuestions(): QuizQuestion[] {
  const all = getAllCharacters().filter(e =>
    COMMON.has(e.character) &&
    e.etymology?.type === 'pictophonetic' &&
    !!e.etymology.semantic &&
    !!e.etymology.phonetic,
  );
  if (all.length === 0) return [];

  // 单字部件池（形旁或声旁），用于生成干扰项
  const compPool = Array.from(new Set(
    all.flatMap(e =>
      [e.etymology!.semantic, e.etymology!.phonetic].filter((s): s is string => !!s && [...s].length === 1),
    ),
  ));

  const qs: QuizQuestion[] = [];
  const picked = sample(all, 12);

  for (const entry of picked) {
    const ety = entry.etymology!;
    const semantic = ety.semantic!;
    const phonetic = ety.phonetic!;
    if ([...semantic].length !== 1 || [...phonetic].length !== 1) continue;
    if (semantic === phonetic) continue;

    const askSemantic = Math.random() < 0.5;
    const correct = askSemantic ? semantic : phonetic;
    const distractors = sample(compPool.filter(c => c !== correct && c !== semantic && c !== phonetic), 3);
    if (distractors.length < 3) continue;

    const options = shuffle([correct, ...distractors]);
    qs.push({
      prompt: bigChar(entry.character),
      hint: askSemantic ? '这是个形声字，找出它的「形旁」（表意的部件）' : '这是个形声字，找出它的「声旁」（表音的部件）',
      options,
      correctIndex: options.indexOf(correct),
      answerKey: correct,
      explain: `「${entry.character}」是形声字：${semantic} 表意（形旁），${phonetic} 表音（声旁）。`,
    });
  }
  return qs;
}

export default function PhonoSemanticGame() {
  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => buildQuestions(), [seed]);
  return <QuizShell key={seed} gameId="phono-semantic" questions={questions} bigOptions onReplay={() => setSeed(s => s + 1)} />;
}