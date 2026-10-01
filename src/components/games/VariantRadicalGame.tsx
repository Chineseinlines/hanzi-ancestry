import { useMemo, useState } from 'react';
import QuizShell, { bigChar, type QuizQuestion } from './QuizShell';
import { VARIANT_RADICALS, sample, shuffle } from '../../data/gameContent';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Locale } from '../../i18n';

function buildQuestions(lang: Locale, t: (k: string, p?: Record<string, string | number>) => string): QuizQuestion[] {
  const origins = VARIANT_RADICALS.map(v => v.origin);
  const variants = VARIANT_RADICALS.map(v => v.variant);
  const isEn = lang === 'en';
  const qs: QuizQuestion[] = [];
  const picked = sample(VARIANT_RADICALS, 10);

  for (const item of picked) {
    const gloss = isEn ? item.glossEn : item.gloss;
    if (Math.random() < 0.5) {
      // 变形偏旁 → 本字
      const correct = item.origin;
      const distractors = sample(origins.filter(o => o !== correct), 3);
      if (distractors.length < 3) continue;
      const options = shuffle([correct, ...distractors]);
      qs.push({
        prompt: bigChar(item.variant),
        hint: t('game.variantToOrigin', { variant: item.variant }),
        options,
        correctIndex: options.indexOf(correct),
        answerKey: correct,
        explain: t('game.variantExplain', { variant: item.variant, origin: item.origin, gloss }),
      });
    } else {
      // 本字 → 变形偏旁
      const correct = item.variant;
      const distractors = sample(variants.filter(v => v !== correct), 3);
      if (distractors.length < 3) continue;
      const options = shuffle([correct, ...distractors]);
      qs.push({
        prompt: bigChar(item.origin),
        hint: t('game.originToVariant', { origin: item.origin }),
        options,
        correctIndex: options.indexOf(correct),
        answerKey: correct,
        explain: t('game.originExplain', { origin: item.origin, variant: item.variant, gloss }),
      });
    }
  }
  return qs;
}

export default function VariantRadicalGame() {
  const { lang, t } = useLanguage();
  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => buildQuestions(lang, t), [seed, lang, t]);
  return <QuizShell key={seed} gameId="variant-radicals" questions={questions} bigOptions onReplay={() => setSeed(s => s + 1)} />;
}