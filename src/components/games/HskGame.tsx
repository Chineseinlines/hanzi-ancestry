import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import QuizShell, { bigChar, type QuizQuestion } from './QuizShell';
import { getAllCharacters, getCharacter, numberToMark } from '../../data/hanziData';
import { HSK_LEVELS, sample, shuffle } from '../../data/gameContent';

function buildQuestions(levelChars: string[]): QuizQuestion[] {
  const allEntries = getAllCharacters();
  const pinyinPool = Array.from(new Set(
    allEntries.map(e => e.pinyin.map(numberToMark).join(' / ')).filter(p => p.length > 0),
  ));
  const qs: QuizQuestion[] = [];

  for (const ch of shuffle(levelChars)) {
    const entry = getCharacter(ch);
    if (!entry || entry.pinyin.length === 0) continue;
    const correct = entry.pinyin.map(numberToMark).join(' / ');
    const distractors = sample(pinyinPool.filter(p => p !== correct), 3);
    if (distractors.length < 3) continue;
    const options = shuffle([correct, ...distractors]);
    qs.push({
      prompt: bigChar(ch),
      hint: '请选出这个汉字的正确读音',
      options,
      correctIndex: options.indexOf(correct),
      answerKey: correct,
      explain: `「${ch}」读作 ${correct}${entry.zhDefinition ? `，意为「${entry.zhDefinition}」` : ''}`,
    });
    if (qs.length >= 8) break;
  }
  return qs;
}

export default function HskGame() {
  const [levelIndex, setLevelIndex] = useState<number | null>(null);
  const [seed, setSeed] = useState(0);

  const level = levelIndex === null ? null : HSK_LEVELS[levelIndex];
  const questions = useMemo(() => (level ? buildQuestions(level.chars) : []), [level, seed]);

  if (!level) {
    return (
      <div className="rounded-2xl p-6" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
        <h3 className="text-center text-lg font-semibold mb-1" style={{ color: '#1A1A18' }}>选择 HSK 等级</h3>
        <p className="text-center text-sm mb-5" style={{ color: '#8B6914', fontFamily: 'Inter' }}>按等级梯度识字闯关，由易到难</p>
        <div className="grid grid-cols-2 gap-3">
          {HSK_LEVELS.map((lvl, i) => (
            <motion.button
              key={lvl.level}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setLevelIndex(i); setSeed(s => s + 1); }}
              className="rounded-xl px-4 py-4 text-left transition-all"
              style={{ background: '#F5F0E8', border: '1px solid rgba(194,59,42,0.2)' }}
            >
              <div className="font-display text-sm font-semibold" style={{ color: '#C23B2A' }}>{lvl.name}</div>
              <div className="mt-1 text-xs" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>示例字 {lvl.chars.length} 个</div>
            </motion.button>
          ))}
        </div>
        {levelIndex !== null && (
          <div className="mt-4">
            <button onClick={() => setLevelIndex(null)} className="mx-auto block rounded-full px-4 py-1.5 text-xs font-medium" style={{ background: 'rgba(26,26,24,0.05)', color: '#3D3D3B', fontFamily: 'Inter' }}>重新选择等级</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ color: '#C23B2A' }}>{level.name}</span>
        <button onClick={() => setLevelIndex(null)} className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: 'rgba(26,26,24,0.05)', color: '#3D3D3B', fontFamily: 'Inter' }}>切换等级</button>
      </div>
      <QuizShell key={seed} gameId="hsk-levels" questions={questions} onReplay={() => setSeed(s => s + 1)} />
    </div>
  );
}