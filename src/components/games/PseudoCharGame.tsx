import { useEffect, useMemo, useState } from 'react';
import QuizShell, { type QuizQuestion } from './QuizShell';
import ComposedGlyph from '../ComposedGlyph';
import {
  SEMANTIC_COMPONENTS,
  PHONETIC_COMPONENTS,
  type SemanticComponent,
  type PhoneticComponent,
} from '../../data/pseudoChars';
import { buildIds, isRealComposition } from '../../data/composedGlyphs';
import { loadData } from '../../data/hanziData';
import { sample, shuffle } from '../../data/gameContent';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Locale } from '../../i18n';

interface PseudoChar {
  semantic: SemanticComponent;
  phonetic: PhoneticComponent;
  ids: string;
}

type Translator = (key: string, params?: Record<string, string | number>) => string;

/**
 * Generate pseudo-characters: a semantic component on the left and a phonetic
 * component on the right, rejecting any combination that already exists as a
 * real character in the dictionary.
 */
function generatePseudoChars(count: number): PseudoChar[] {
  const out: PseudoChar[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (out.length < count && guard < count * 80) {
    guard += 1;
    const semantic = SEMANTIC_COMPONENTS[Math.floor(Math.random() * SEMANTIC_COMPONENTS.length)];
    const phonetic = PHONETIC_COMPONENTS[Math.floor(Math.random() * PHONETIC_COMPONENTS.length)];
    const ids = buildIds('left-right', [semantic.left, phonetic.char]);
    if (seen.has(ids) || isRealComposition(ids)) continue;
    seen.add(ids);
    out.push({ semantic, phonetic, ids });
  }
  return out;
}

function buildQuestions(lang: Locale, t: Translator, items: PseudoChar[]): QuizQuestion[] {
  const isEn = lang === 'en';
  const qs: QuizQuestion[] = [];
  const allCategories = SEMANTIC_COMPONENTS.map(s => (isEn ? s.categoryEn : s.category));

  for (const item of items) {
    const { semantic, phonetic, ids } = item;
    const askMeaning = Math.random() < 0.5;

    const prompt = (
      <div className="flex flex-col items-center gap-2">
        <div
          className="flex items-center justify-center rounded-xl"
          style={{ width: 120, height: 120, background: '#F5F0E8', border: '1px solid rgba(26,26,24,0.08)' }}
        >
          <ComposedGlyph parts={[semantic.left, phonetic.char]} template="left-right" size={96} />
        </div>
        <span
          className="rounded-full px-2.5 py-0.5 text-[0.625rem] font-medium"
          style={{ background: 'rgba(139,105,20,0.12)', color: '#8B6914', fontFamily: 'Inter' }}
        >
          {t('game.pseudoBadge')}
        </span>
      </div>
    );

    if (askMeaning) {
      const correct = isEn ? semantic.categoryEn : semantic.category;
      const distractors = sample(
        allCategories.filter(c => c !== correct),
        3,
      );
      if (distractors.length < 3) continue;
      const options = shuffle([correct, ...distractors]);
      qs.push({
        prompt,
        hint: t('game.pseudoFindMeaning'),
        options,
        correctIndex: options.indexOf(correct),
        answerKey: correct,
        explain: t('game.pseudoExplainMeaning', {
          ids,
          left: semantic.left,
          phonetic: phonetic.char,
          category: isEn ? semantic.categoryEn : semantic.category,
        }),
      });
    } else {
      const correct = phonetic.pinyin;
      const distractors = sample(
        PHONETIC_COMPONENTS.map(p => p.pinyin).filter(p => p !== correct),
        3,
      );
      if (distractors.length < 3) continue;
      const options = shuffle([correct, ...distractors]);
      qs.push({
        prompt,
        hint: t('game.pseudoFindSound'),
        options,
        correctIndex: options.indexOf(correct),
        answerKey: correct,
        explain: t('game.pseudoExplainSound', {
          ids,
          left: semantic.left,
          phonetic: phonetic.char,
          pinyin: correct,
        }),
      });
    }
  }
  return qs;
}

export default function PseudoCharGame() {
  const { lang, t } = useLanguage();
  const [seed, setSeed] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    loadData().then(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, []);

  const questions = useMemo(
    () => (ready ? buildQuestions(lang, t, generatePseudoChars(10)) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ready, seed, lang, t],
  );

  if (!ready) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
        <p className="text-charcoal/60" style={{ fontFamily: 'Inter' }}>{t('quiz.loading')}</p>
      </div>
    );
  }

  return <QuizShell key={`${seed}-${ready}`} gameId="pseudo-char" questions={questions} onReplay={() => setSeed(s => s + 1)} />;
}