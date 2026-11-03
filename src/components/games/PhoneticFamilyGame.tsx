import { useEffect, useMemo, useState } from 'react';
import QuizShell, { bigChar, type QuizQuestion } from './QuizShell';
import { getAllCharacters, getCharacter, loadData } from '../../data/hanziData';
import { TOP3500_SET } from '../../data/commonChars';
import { useLanguage } from '../../contexts/LanguageContext';

/** 字族至少要有这么多同声符字才拿来出题 */
const MIN_FAMILY = 4;
const TOTAL_QUESTIONS = 10;

type TFn = (
  key: 'game.phoneticFamilyHint' | 'game.phoneticFamilyExplain',
  params?: Record<string, string | number>,
) => string;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sample<T>(arr: T[], count: number): T[] {
  return shuffle(arr).slice(0, count);
}

/** 声符 → 同声符常用字。数据来自字典 etymology.phonetic（形声字声旁）。 */
function buildFamilies(): Map<string, string[]> {
  const families = new Map<string, string[]>();
  for (const entry of getAllCharacters()) {
    if (!TOP3500_SET.has(entry.character)) continue;
    const phonetic = entry.etymology?.phonetic;
    if (!phonetic || [...phonetic].length !== 1) continue;
    if (!/[\u4e00-\u9fa5]/.test(phonetic)) continue;
    if (entry.character === phonetic) continue;
    const list = families.get(phonetic);
    if (list) list.push(entry.character);
    else families.set(phonetic, [entry.character]);
  }
  return families;
}

function buildQuestions(t: TFn): QuizQuestion[] {
  const families = Array.from(buildFamilies().entries())
    .filter(([, members]) => members.length >= MIN_FAMILY);
  if (families.length < 4) return [];

  const qs: QuizQuestion[] = [];
  for (const [phonetic, members] of sample(families, TOTAL_QUESTIONS)) {
    const answer = sample(members, 1)[0];
    const own = new Set(members);
    const otherFamilies = families.filter(([p]) => p !== phonetic);
    const distractors: string[] = [];
    for (let i = 0; i < 80 && distractors.length < 3; i++) {
      const candidate = sample(otherFamilies[i % otherFamilies.length][1], 1)[0];
      if (candidate !== answer && !own.has(candidate) && !distractors.includes(candidate)) {
        distractors.push(candidate);
      }
    }
    if (distractors.length < 3) continue;

    const options = shuffle([answer, ...distractors]);
    const answerPinyin = getCharacter(answer)?.pinyin?.[0] ?? '';
    qs.push({
      prompt: bigChar(phonetic),
      hint: t('game.phoneticFamilyHint', { phonetic }),
      options,
      correctIndex: options.indexOf(answer),
      answerKey: answer,
      explain: t('game.phoneticFamilyExplain', {
        phonetic,
        members: members.slice(0, 10).join('、'),
        char: answer,
        pinyin: answerPinyin || '—',
      }),
    });
  }
  return qs;
}

export default function PhoneticFamilyGame() {
  const { t } = useLanguage();
  const [seed, setSeed] = useState(0);
  const [ready, setReady] = useState(false);

  // 直接进入游戏页时字典可能尚未加载，先确保数据就绪
  useEffect(() => {
    let alive = true;
    loadData().then(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, []);

  const questions = useMemo(() => (ready ? buildQuestions(t) : []), [seed, t, ready]);

  if (!ready) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
        <p className="text-charcoal/60" style={{ fontFamily: 'Inter' }}>{t('quiz.loading')}</p>
      </div>
    );
  }
  return <QuizShell key={seed} gameId="phonetic-family" questions={questions} bigOptions onReplay={() => setSeed(s => s + 1)} />;
}
