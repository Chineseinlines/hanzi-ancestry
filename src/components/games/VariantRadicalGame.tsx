import { useMemo, useState } from 'react';
import QuizShell, { bigChar, type QuizQuestion } from './QuizShell';
import { VARIANT_RADICALS, sample, shuffle } from '../../data/gameContent';

function buildQuestions(): QuizQuestion[] {
  const origins = VARIANT_RADICALS.map(v => v.origin);
  const variants = VARIANT_RADICALS.map(v => v.variant);
  const qs: QuizQuestion[] = [];
  const picked = sample(VARIANT_RADICALS, 10);

  for (const item of picked) {
    if (Math.random() < 0.5) {
      // 变形偏旁 → 本字
      const correct = item.origin;
      const distractors = sample(origins.filter(o => o !== correct), 3);
      if (distractors.length < 3) continue;
      const options = shuffle([correct, ...distractors]);
      qs.push({
        prompt: bigChar(item.variant),
        hint: `变形偏旁「${item.variant}」的本字（原字形）是？`,
        options,
        correctIndex: options.indexOf(correct),
        answerKey: correct,
        explain: `「${item.variant}」的本字是「${item.origin}」。${item.gloss}。`,
      });
    } else {
      // 本字 → 变形偏旁
      const correct = item.variant;
      const distractors = sample(variants.filter(v => v !== correct), 3);
      if (distractors.length < 3) continue;
      const options = shuffle([correct, ...distractors]);
      qs.push({
        prompt: bigChar(item.origin),
        hint: `本字「${item.origin}」作偏旁时变形为？`,
        options,
        correctIndex: options.indexOf(correct),
        answerKey: correct,
        explain: `「${item.origin}」作偏旁时变形为「${item.variant}」。${item.gloss}。`,
      });
    }
  }
  return qs;
}

export default function VariantRadicalGame() {
  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => buildQuestions(), [seed]);
  return <QuizShell key={seed} gameId="variant-radicals" questions={questions} bigOptions onReplay={() => setSeed(s => s + 1)} />;
}