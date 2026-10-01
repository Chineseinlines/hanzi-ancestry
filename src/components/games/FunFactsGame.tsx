import { useMemo, useState } from 'react';
import QuizShell, { type QuizQuestion } from './QuizShell';
import { FUN_FACTS, sample } from '../../data/gameContent';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Locale } from '../../i18n';

function buildQuestions(lang: Locale): QuizQuestion[] {
  const qs: QuizQuestion[] = [];
  const isEn = lang === 'en';
  for (const item of sample(FUN_FACTS, 10)) {
    qs.push({
      prompt: (
        <span className="inline-block px-2 text-lg font-medium leading-relaxed" style={{ color: '#1A1A18', fontFamily: '"Noto Serif SC", serif' }}>
          {isEn ? item.questionEn : item.question}
        </span>
      ),
      options: isEn ? item.optionsEn : item.options,
      correctIndex: item.correctIndex,
      answerKey: item.options[item.correctIndex],
      explain: isEn ? item.explainEn : item.explain,
    });
  }
  return qs;
}

export default function FunFactsGame() {
  const { lang } = useLanguage();
  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => buildQuestions(lang), [seed, lang]);
  return <QuizShell key={seed} gameId="fun-facts" questions={questions} onReplay={() => setSeed(s => s + 1)} />;
}