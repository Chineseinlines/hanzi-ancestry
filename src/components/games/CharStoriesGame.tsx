import { useMemo, useState } from 'react';
import QuizShell, { bigChar, type QuizQuestion } from './QuizShell';
import { CHAR_STORIES, sample } from '../../data/gameContent';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Locale } from '../../i18n';

function buildQuestions(lang: Locale): QuizQuestion[] {
  const qs: QuizQuestion[] = [];
  const isEn = lang === 'en';
  for (const item of sample(CHAR_STORIES, 10)) {
    qs.push({
      prompt: bigChar(item.char),
      hint: isEn ? item.questionEn : item.question,
      options: isEn ? item.optionsEn : item.options,
      correctIndex: item.correctIndex,
      answerKey: item.options[item.correctIndex],
      explain: isEn ? item.explainEn : item.explain,
    });
  }
  return qs;
}

export default function CharStoriesGame() {
  const { lang } = useLanguage();
  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => buildQuestions(lang), [seed, lang]);
  return <QuizShell key={seed} gameId="char-stories" questions={questions} onReplay={() => setSeed(s => s + 1)} />;
}