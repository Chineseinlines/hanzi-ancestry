import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, Trophy, Sparkles } from 'lucide-react';
import type { GameMode, GameState, PuzzleRound } from '../data/types';
import { getCharacter, getCognates, getCharactersWithComponent } from '../data/hanziData';

interface CharPuzzleGameProps {
  targetChar: string;
  onNavigate?: (char: string) => void;
}

const TOTAL_ROUNDS = 10;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getRandomElements<T>(arr: T[], count: number): T[] {
  return shuffle(arr).slice(0, count);
}

function getComponents(char: string): string[] {
  const entry = getCharacter(char);
  if (!entry) return [];
  const comps: string[] = [];
  const ety = entry.etymology;
  if (ety) {
    if (ety.semantic) comps.push(ety.semantic);
    if (ety.phonetic) comps.push(ety.phonetic);
  }
  // Fallback: parse decomposition IDS for CJK chars
  if (comps.length === 0 && entry.decomposition) {
    for (let i = 0; i < entry.decomposition.length; i++) {
      const cp = entry.decomposition.codePointAt(i);
      if (cp && cp >= 0x4E00 && cp <= 0x9FFF) {
        const c = entry.decomposition[i];
        if (c !== char) comps.push(c);
      }
    }
  }
  return comps;
}

function generatePuzzle(targetChar: string, mode: GameMode): PuzzleRound | null {
  const entry = getCharacter(targetChar);
  if (!entry) return null;

  const components = getComponents(targetChar);
  if (components.length < 2 && mode !== 'assemble') return null;

  switch (mode) {
    case 'decompose': {
      // Show a character, player picks correct components from options
      const correct = components.slice(0, 4);
      // Generate distractors: random components that exist in other chars
      const allComps = new Set<string>();
      const cognates = getCognates(targetChar, 15);
      for (const c of cognates) {
        const comps = getComponents(c.character);
        comps.forEach((comp) => {
          if (!correct.includes(comp)) allComps.add(comp);
        });
      }
      const distractors = getRandomElements(Array.from(allComps), Math.min(4, allComps.size));
      const options = shuffle([...correct, ...distractors]);
      return {
        mode: 'decompose',
        targetChar,
        components: correct,
        options: options.slice(0, 8),
        correctAnswer: correct,
        points: 10,
      };
    }

    case 'assemble': {
      // Show components, pick which character they form
      const comps = components.slice(0, 3);
      // Find chars that contain these components
      const candidateChars = new Set<string>();
      for (const comp of comps) {
        const chars = getCharactersWithComponent(comp);
        chars.forEach((c) => candidateChars.add(c));
      }
      const candidates = Array.from(candidateChars).filter((c) => {
        const ceComps = getComponents(c);
        return comps.every((comp) => ceComps.includes(comp));
      });

      if (candidates.length === 0) {
        // Fallback: use targetChar + random unrelated chars
        const allCognates = getCognates(targetChar, 10).map((c) => c.character);
        const options = shuffle([targetChar, ...allCognates.filter((c) => c !== targetChar).slice(0, 3)]);
        return {
          mode: 'assemble',
          targetChar,
          components: comps,
          options,
          correctAnswer: targetChar,
          points: 10,
        };
      }

      const correct = candidates[0];
      // Distractors: chars that share some but not all components
      const distractors = new Set<string>();
      for (const comp of comps.slice(0, 1)) {
        const chars = getCharactersWithComponent(comp);
        chars.forEach((c) => {
          if (c !== correct) distractors.add(c);
        });
      }
      const distractorList = Array.from(distractors).filter((c) => !candidates.includes(c));
      const options = shuffle([correct, ...getRandomElements(distractorList, 3)]);

      return {
        mode: 'assemble',
        targetChar: correct,
        components: comps,
        options: options.slice(0, 4),
        correctAnswer: correct,
        points: 10,
      };
    }

    case 'match': {
      // Match components to characters that contain them
      const comps = components.slice(0, 3);
      const matched: { comp: string; char: string }[] = [];
      for (const comp of comps) {
        const chars = getCharactersWithComponent(comp);
        const valid = chars.filter((c) => c !== targetChar && getCharacter(c));
        if (valid.length > 0) {
          matched.push({ comp, char: valid[0] });
        }
      }
      if (matched.length < 2) return null;

      const shuffledChars = shuffle(matched.map((m) => m.char));
      return {
        mode: 'match',
        targetChar,
        components: matched.map((m) => m.comp),
        options: shuffledChars,
        correctAnswer: matched.map((m) => m.char),
        points: 15,
      };
    }
  }
}

export default function CharPuzzleGame({ targetChar, onNavigate: _onNavigate }: CharPuzzleGameProps) {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    streak: 0,
    round: 0,
    totalRounds: TOTAL_ROUNDS,
    mode: null,
    feedback: null,
    correctAnswer: null,
  });
  const [puzzle, setPuzzle] = useState<PuzzleRound | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [matchSelections, setMatchSelections] = useState<Record<string, string>>({});
  const [gameOver, setGameOver] = useState(false);
  const [generating, setGenerating] = useState(false);

  const modes: GameMode[] = ['decompose', 'assemble', 'match'];

  const nextRound = useCallback(() => {
    if (gameState.round >= TOTAL_ROUNDS) {
      setGameOver(true);
      return;
    }
    setGenerating(true);
    // Try modes until one generates a valid puzzle
    setTimeout(() => {
      const shuffledModes = shuffle([...modes]);
      let newPuzzle: PuzzleRound | null = null;
      for (const mode of shuffledModes) {
        newPuzzle = generatePuzzle(targetChar, mode);
        if (newPuzzle) break;
      }
      if (!newPuzzle) {
        // Ultimate fallback: simple decompose
        const comps = getComponents(targetChar);
        newPuzzle = {
          mode: 'decompose',
          targetChar,
          components: comps.slice(0, 4),
          options: shuffle([...comps.slice(0, 4), '火', '山', '水', '木']).slice(0, 6),
          correctAnswer: comps.slice(0, 4),
          points: 10,
        };
      }
      setPuzzle(newPuzzle);
      setSelectedOptions(new Set());
      setMatchSelections({});
      setGameState((prev) => ({
        ...prev,
        mode: newPuzzle!.mode,
        feedback: null,
        correctAnswer: null,
        round: prev.round + 1,
      }));
      setGenerating(false);
    }, 200);
  }, [gameState.round]);

  // Start first round
  useEffect(() => {
    if (!puzzle && !gameOver) {
      nextRound();
    }
  }, []);

  const handleDecomposeSelect = (opt: string) => {
    setSelectedOptions((prev) => {
      const next = new Set(prev);
      if (next.has(opt)) next.delete(opt);
      else next.add(opt);
      return next;
    });
  };

  const handleDecomposeSubmit = () => {
    if (!puzzle) return;
    const correct = Array.isArray(puzzle.correctAnswer) ? puzzle.correctAnswer : [puzzle.correctAnswer];
    const selected = Array.from(selectedOptions);
    const isCorrect =
      correct.length === selected.length &&
      correct.every((c) => selected.includes(c));

    if (isCorrect) {
      const streakBonus = gameState.streak >= 3 ? gameState.streak * 2 : 0;
      setGameState((prev) => ({
        ...prev,
        score: prev.score + puzzle.points + streakBonus,
        streak: prev.streak + 1,
        feedback: 'correct',
        correctAnswer: null,
      }));
    } else {
      setGameState((prev) => ({
        ...prev,
        streak: 0,
        feedback: 'wrong',
        correctAnswer: correct.join(' + '),
      }));
    }
  };

  const handleAssembleSelect = (char: string) => {
    if (gameState.feedback) return;
    const correct = puzzle?.correctAnswer as string;
    const isCorrect = char === correct;
    if (isCorrect) {
      const streakBonus = gameState.streak >= 3 ? gameState.streak * 2 : 0;
      setGameState((prev) => ({
        ...prev,
        score: prev.score + (puzzle?.points || 10) + streakBonus,
        streak: prev.streak + 1,
        feedback: 'correct',
        correctAnswer: null,
      }));
    } else {
      setGameState((prev) => ({
        ...prev,
        streak: 0,
        feedback: 'wrong',
        correctAnswer: correct,
      }));
    }
  };

  const handleMatchSelect = (comp: string, char: string) => {
    if (gameState.feedback) return;
    setMatchSelections((prev) => {
      const next = { ...prev };
      // Remove this char from any other comp
      Object.keys(next).forEach((k) => {
        if (next[k] === char) delete next[k];
      });
      next[comp] = char;
      return next;
    });
  };

  const handleMatchSubmit = () => {
    if (!puzzle) return;
    const correct = puzzle.correctAnswer as string[];
    const comps = puzzle.components;
    const allMatched = comps.every((c) => matchSelections[c]);
    if (!allMatched) return;

    const allCorrect = comps.every((c, i) => matchSelections[c] === correct[i]);
    if (allCorrect) {
      const streakBonus = gameState.streak >= 3 ? gameState.streak * 2 : 0;
      setGameState((prev) => ({
        ...prev,
        score: prev.score + (puzzle.points || 15) + streakBonus,
        streak: prev.streak + 1,
        feedback: 'correct',
        correctAnswer: null,
      }));
    } else {
      setGameState((prev) => ({
        ...prev,
        streak: 0,
        feedback: 'wrong',
        correctAnswer: comps.map((c, i) => `${c} → ${correct[i]}`).join(', '),
      }));
    }
  };

  const handleContinue = () => {
    if (gameState.round >= TOTAL_ROUNDS) {
      setGameOver(true);
      return;
    }
    nextRound();
  };

  const handleRestart = () => {
    setGameState({
      score: 0,
      streak: 0,
      round: 0,
      totalRounds: TOTAL_ROUNDS,
      mode: null,
      feedback: null,
      correctAnswer: null,
    });
    setPuzzle(null);
    setSelectedOptions(new Set());
    setMatchSelections({});
    setGameOver(false);
  };

  if (gameOver) {
    return (
      <div className="rounded-2xl p-6 text-center" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
        <Trophy size={40} className="mx-auto mb-3" style={{ color: '#C4A265' }} />
        <h2 className="text-xl font-display mb-2" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>
          Game Complete!
        </h2>
        <p className="text-3xl font-bold mb-1" style={{ color: '#C23B2A' }}>
          {gameState.score} pts
        </p>
        <p className="text-sm mb-4" style={{ color: '#8B6914', fontFamily: 'Inter' }}>
          Max streak: {gameState.streak} · {TOTAL_ROUNDS} rounds
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleRestart}
            className="rounded-full px-5 py-2 text-sm font-medium transition-all hover:scale-105"
            style={{ background: '#C23B2A', color: '#F5F0E8', fontFamily: 'Inter' }}
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  if (generating || !puzzle) {
    return (
      <div className="rounded-2xl p-6 flex items-center justify-center" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)', minHeight: 300 }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#C23B2A', borderTopColor: 'transparent' }} />
          <span className="text-sm" style={{ color: '#8B6914', fontFamily: 'Inter' }}>Generating puzzle...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#FDFBF6', boxShadow: '0 4px 20px rgba(26,26,24,0.06)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(194,59,42,0.12)' }}>
            <Sparkles size={16} style={{ color: '#C23B2A' }} />
          </div>
          <div>
            <h2 className="text-lg font-display" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>
              汉字拼拆工坊
            </h2>
            <p className="text-xs" style={{ color: '#8B6914', fontFamily: 'Inter' }}>
              Round {gameState.round}/{TOTAL_ROUNDS}
              {gameState.streak >= 3 && (
                <span className="ml-2" style={{ color: '#C23B2A' }}>
                  🔥 {gameState.streak}x streak!
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold" style={{ color: '#C23B2A' }}>{gameState.score}</div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: '#8B6914', fontFamily: 'Inter' }}>Points</div>
        </div>
      </div>

      <div className="px-5 pb-5">
        {/* Mode label */}
        <div className="mb-4 flex items-center gap-2">
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{ background: 'rgba(107,127,94,0.15)', color: '#6B7F5E', fontFamily: 'Inter' }}
          >
            {puzzle.mode === 'decompose' ? '拆字挑战' : puzzle.mode === 'assemble' ? '拼字挑战' : '连连看'}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {/* DECOMPOSE MODE */}
          {puzzle.mode === 'decompose' && (
            <motion.div
              key={`decompose-${gameState.round}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <p className="text-xs mb-3" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>
                Select the correct components of this character:
              </p>
              <div className="text-center mb-4">
                <span
                  className="inline-block font-display-cn"
                  style={{ fontSize: '4rem', color: '#1A1A18', fontFamily: '"Ma Shan Zheng", cursive' }}
                >
                  {puzzle.targetChar}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {puzzle.options.map((opt) => {
                  const selected = selectedOptions.has(opt);
                  const isCorrectAnswer = gameState.feedback && Array.isArray(puzzle.correctAnswer) && puzzle.correctAnswer.includes(opt);
                  let bg = selected ? '#2D5F8A' : '#F5F0E8';
                  let color = selected ? '#FFFFFF' : '#1A1A18';
                  let border = selected ? '2px solid #2D5F8A' : '1px solid rgba(26,26,24,0.1)';

                  if (gameState.feedback === 'correct' && isCorrectAnswer) {
                    bg = '#6B7F5E';
                    color = '#FFFFFF';
                    border = '2px solid #6B7F5E';
                  } else if (gameState.feedback === 'wrong') {
                    if (isCorrectAnswer) {
                      bg = '#6B7F5E';
                      color = '#FFFFFF';
                      border = '2px solid #6B7F5E';
                    } else if (selected) {
                      bg = '#C23B2A';
                      color = '#FFFFFF';
                      border = '2px solid #C23B2A';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => !gameState.feedback && handleDecomposeSelect(opt)}
                      disabled={!!gameState.feedback}
                      className="rounded-xl px-4 py-3 text-2xl font-display-cn transition-all hover:scale-105 active:scale-95"
                      style={{ background: bg, color, border, fontFamily: '"Noto Serif SC", serif' }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {!gameState.feedback && (
                <div className="flex justify-center gap-2">
                  <button
                    onClick={handleDecomposeSubmit}
                    disabled={selectedOptions.size === 0}
                    className="rounded-full px-5 py-2 text-sm font-medium transition-all hover:scale-105 disabled:opacity-40"
                    style={{ background: '#C23B2A', color: '#F5F0E8', fontFamily: 'Inter' }}
                  >
                    Check Answer
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ASSEMBLE MODE */}
          {puzzle.mode === 'assemble' && (
            <motion.div
              key={`assemble-${gameState.round}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <p className="text-xs mb-3" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>
                Which character is made from these components?
              </p>
              <div className="flex gap-3 justify-center mb-4">
                {puzzle.components.map((comp) => (
                  <span
                    key={comp}
                    className="rounded-xl px-4 py-2 text-2xl font-display-cn"
                    style={{
                      background: '#F5F0E8',
                      color: '#1A1A18',
                      border: '1px solid rgba(26,26,24,0.1)',
                      fontFamily: '"Noto Serif SC", serif',
                    }}
                  >
                    {comp}
                  </span>
                ))}
                <span className="text-2xl flex items-center" style={{ color: '#A39E93' }}>= ?</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {puzzle.options.map((opt) => {
                  const isCorrectAnswer = opt === puzzle.correctAnswer;
                  let bg = '#F5F0E8';
                  let border = '1px solid rgba(26,26,24,0.1)';
                  if (gameState.feedback === 'correct' && isCorrectAnswer) {
                    bg = '#6B7F5E';
                    border = '2px solid #6B7F5E';
                  } else if (gameState.feedback === 'wrong' && isCorrectAnswer) {
                    bg = '#6B7F5E';
                    border = '2px solid #6B7F5E';
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleAssembleSelect(opt)}
                      disabled={!!gameState.feedback}
                      className="rounded-xl py-3 text-center transition-all hover:scale-105 active:scale-95"
                      style={{ background: bg, border }}
                    >
                      <span
                        className="text-3xl font-display-cn"
                        style={{ color: gameState.feedback && isCorrectAnswer ? '#FFFFFF' : '#1A1A18', fontFamily: '"Ma Shan Zheng", cursive' }}
                      >
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* MATCH MODE */}
          {puzzle.mode === 'match' && (
            <motion.div
              key={`match-${gameState.round}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <p className="text-xs mb-3" style={{ color: '#3D3D3B', fontFamily: 'Inter' }}>
                Match each component to a character that contains it:
              </p>

              <div className="flex gap-6 justify-center mb-4">
                {/* Components column */}
                <div className="flex flex-col gap-3">
                  {puzzle.components.map((comp) => (
                    <div key={comp} className="flex items-center gap-2">
                      <span
                        className="rounded-lg px-3 py-2 text-xl font-display-cn"
                        style={{
                          background: '#2D5F8A',
                          color: '#FFFFFF',
                          fontFamily: '"Noto Serif SC", serif',
                          minWidth: 48,
                          textAlign: 'center',
                        }}
                      >
                        {comp}
                      </span>
                      <span style={{ color: '#A39E93' }}>→</span>
                      {matchSelections[comp] ? (
                        <span
                          className="rounded-lg px-3 py-2 text-xl font-display-cn cursor-pointer"
                          style={{
                            background: '#F5F0E8',
                            color: '#1A1A18',
                            border: '1px solid #C23B2A',
                            fontFamily: '"Ma Shan Zheng", cursive',
                          }}
                        >
                          {matchSelections[comp]}
                        </span>
                      ) : (
                        <span
                          className="rounded-lg px-3 py-2 text-sm"
                          style={{
                            background: 'rgba(26,26,24,0.03)',
                            color: '#A39E93',
                            border: '1px dashed rgba(26,26,24,0.15)',
                            fontFamily: 'Inter',
                          }}
                        >
                          ?
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Character options */}
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {puzzle.options.map((opt) => {
                  const alreadyUsed = Object.values(matchSelections).includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => {
                        if (gameState.feedback) return;
                        // Find the first unmatched component and assign
                        const unmatched = puzzle.components.find((c) => !matchSelections[c]);
                        if (unmatched) handleMatchSelect(unmatched, opt);
                      }}
                      disabled={alreadyUsed || !!gameState.feedback}
                      className="rounded-lg px-3 py-2 text-xl font-display-cn transition-all hover:scale-105"
                      style={{
                        background: alreadyUsed ? 'rgba(26,26,24,0.05)' : '#F5F0E8',
                        color: alreadyUsed ? '#A39E93' : '#1A1A18',
                        border: alreadyUsed ? '1px solid rgba(26,26,24,0.06)' : '1px solid rgba(26,26,24,0.1)',
                        fontFamily: '"Ma Shan Zheng", cursive',
                        opacity: alreadyUsed ? 0.4 : 1,
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center gap-2">
                <button
                  onClick={() => { setMatchSelections({}); }}
                  className="rounded-full px-4 py-1.5 text-xs font-medium transition-all"
                  style={{ background: 'rgba(26,26,24,0.05)', color: '#3D3D3B', fontFamily: 'Inter' }}
                >
                  Clear
                </button>
                {!gameState.feedback && (
                  <button
                    onClick={handleMatchSubmit}
                    disabled={puzzle.components.some((c) => !matchSelections[c])}
                    className="rounded-full px-5 py-2 text-sm font-medium transition-all hover:scale-105 disabled:opacity-40"
                    style={{ background: '#C23B2A', color: '#F5F0E8', fontFamily: 'Inter' }}
                  >
                    Check Answer
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback */}
        <AnimatePresence>
          {gameState.feedback && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex items-center justify-between rounded-xl px-4 py-3"
              style={{
                background: gameState.feedback === 'correct' ? 'rgba(107,127,94,0.1)' : 'rgba(194,59,42,0.08)',
              }}
            >
              <div className="flex items-center gap-2">
                {gameState.feedback === 'correct' ? (
                  <Check size={18} style={{ color: '#6B7F5E' }} />
                ) : (
                  <X size={18} style={{ color: '#C23B2A' }} />
                )}
                <span
                  className="text-sm font-medium"
                  style={{
                    color: gameState.feedback === 'correct' ? '#6B7F5E' : '#C23B2A',
                    fontFamily: 'Inter',
                  }}
                >
                  {gameState.feedback === 'correct'
                    ? `Correct! +${puzzle.points + (gameState.streak >= 3 ? (gameState.streak - 1) * 2 : 0)}`
                    : `Nope! Answer: ${gameState.correctAnswer}`}
                </span>
              </div>
              <button
                onClick={handleContinue}
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all hover:scale-105"
                style={{ background: '#1A1A18', color: '#F5F0E8', fontFamily: 'Inter' }}
              >
                {gameState.round >= TOTAL_ROUNDS ? 'View Results' : 'Next'}
                <ArrowRight size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
