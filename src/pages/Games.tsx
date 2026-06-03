import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Pencil, Puzzle, Eye, ScrollText, Brain, Trophy, ArrowLeft, Shuffle,
} from 'lucide-react';
import CharPuzzleGame from '../components/CharPuzzleGame';
import AncientGlyphGame from '../components/AncientGlyphGame';
import { getAllCharacters, hasCharacter } from '../data/hanziData';
import { COMMON_CHAR_SET } from '../data/commonChars';

const COMMON_6500 = new Set(COMMON_CHAR_SET);

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

const RANDOM_CHARS = ['家', '国', '朋', '友', '好', '明', '武', '森', '想', '语', '尊', '界', '汉', '休', '林', '信', '清', '湖', '花', '草', '海', '灯'];

function getRandomChar(): string {
  const all = getAllCharacters().filter(e => COMMON_6500.has(e.character));
  if (all.length > 0) {
    const common = all.filter(e => RANDOM_CHARS.includes(e.character) || (e.etymology?.type === 'pictophonetic'));
    if (common.length > 0) return common[Math.floor(Math.random() * common.length)].character;
    return all[Math.floor(Math.random() * all.length)].character;
  }
  return '国';
}

export default function Games() {
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [gameChar, setGameChar] = useState('国');
  const [charInput, setCharInput] = useState('');

  const categories = [
    {
      label: '基础书写巩固',
      en: 'Writing & Stroke Order',
      icon: <Pencil size={18} />,
      games: [
        {
          icon: <Pencil size={24} />,
          title: '笔画闯关',
          en: 'Stroke Quiz',
          category: '书写',
          desc: '单笔画识别、易错笔画区分、笔画数量判断，测试你的笔画基本功。',
          available: false,
        },
        {
          icon: <Pencil size={24} />,
          title: '笔顺模拟书写',
          en: 'Stroke Order',
          category: '书写',
          desc: '触屏或鼠标模拟书写汉字，系统实时纠错并打分，练就标准笔顺。',
          available: false,
        },
        {
          icon: <Trophy size={24} />,
          title: '易错字专项训练',
          en: 'Tricky Strokes',
          category: '书写',
          desc: '针对"火""乃""必"等笔顺易错字专项出题，攻克书写难点。',
          available: false,
        },
      ],
    },
    {
      label: '部件结构认知',
      en: 'Component Recognition',
      icon: <Puzzle size={18} />,
      games: [
        {
          icon: <Puzzle size={24} />,
          title: '部首连连看',
          en: 'Radical Match',
          category: '部件',
          desc: '匹配同源部首、同义部首，建立部件家族的概念网络。',
          available: true,
        },
        {
          icon: <Puzzle size={24} />,
          title: '部件拼字闯关',
          en: 'Component Builder',
          category: '部件',
          desc: '拖拽偏旁组成正确汉字，匹配字形结构，理解构字逻辑。',
          available: true,
        },
        {
          icon: <Brain size={24} />,
          title: '形声字专项',
          en: 'Phono-Semantic',
          category: '部件',
          desc: '区分形旁表意与声旁表音，强化形声字认知。',
          available: false,
        },
        {
          icon: <Eye size={24} />,
          title: '变形部件辨识',
          en: 'Variant Radicals',
          category: '部件',
          desc: '识别 忄=心、犭=犬 等变形关系，掌握偏旁本源。',
          available: false,
        },
      ],
    },
    {
      label: '认读辨析',
      en: 'Recognition & Reading',
      icon: <Eye size={18} />,
      games: [
        {
          icon: <Eye size={24} />,
          title: '形近字找茬',
          en: 'Lookalike Finder',
          category: '认读',
          desc: '分辨 辩/辨/瓣、末/未、土/士 等高频易错形近字。',
          available: false,
        },
        {
          icon: <Brain size={24} />,
          title: '读音闯关',
          en: 'Pronunciation Quiz',
          category: '认读',
          desc: '针对声旁失效字、多音字专项纠错，避免凭偏旁猜读。',
          available: false,
        },
        {
          icon: <Trophy size={24} />,
          title: 'HSK分级识字',
          en: 'HSK Levels',
          category: '认读',
          desc: '按HSK等级梯度识字闯关，适配留学生学习节奏。',
          available: false,
        },
      ],
    },
    {
      label: '文化溯源趣味',
      en: 'Cultural Origins',
      icon: <ScrollText size={18} />,
      games: [
        {
          icon: <ScrollText size={24} />,
          title: '古字形猜字',
          en: 'Ancient Glyph Guess',
          category: '文化',
          desc: '展示甲骨文、金文字形，猜测对应的现代汉字。',
          available: true,
        },
        {
          icon: <ScrollText size={24} />,
          title: '汉字故事答题',
          en: 'Character Stories',
          category: '文化',
          desc: '根据字形典故回答问题，了解汉字背后的历史文化。',
          available: false,
        },
        {
          icon: <Brain size={24} />,
          title: '汉字冷知识挑战',
          en: 'Fun Facts',
          category: '文化',
          desc: '解答古今字义颠倒、字形演变谜题，拓展汉字冷知识。',
          available: false,
        },
      ],
    },
  ];

  // ── Collect available games for bottom nav ─────────────────────
  const availableGames = categories.flatMap(cat => cat.games.filter(g => g.available));

  // ── Game play mode ──────────────────────────────────────────────
  if (activeGame) {
    const isGlyphGame = activeGame === '古字形猜字';
    const isRadicalMatch = activeGame === '部首连连看';
    const isComponentBuilder = activeGame === '部件拼字闯关';

    return (
      <div className="min-h-screen bg-bg-primary pb-20">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-border-light">
          <div className="mx-auto max-w-2xl flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => setActiveGame(null)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-charcoal/60 hover:text-ink-black hover:bg-bg-warm transition-colors"
            >
              <ArrowLeft size={16} />
              返回游戏列表
            </button>
            <span className="h-4 w-px bg-border-light" />
            <span className="text-sm font-medium text-ink-black">{activeGame}</span>

            {/* Character selector — only for puzzle games, not glyph game */}
            {!isGlyphGame && (
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-charcoal/50">当前汉字:</span>
                <span className="font-serif-cn text-lg font-bold text-ink-black">{gameChar}</span>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={charInput}
                    onChange={(e) => setCharInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const c = charInput.trim();
                        if (c && hasCharacter(c)) {
                          setGameChar(c);
                          setCharInput('');
                        }
                      }
                    }}
                    placeholder="换字"
                    className="w-16 rounded border border-border-light px-2 py-1 text-center font-serif-cn text-sm outline-none focus:border-cinnabar"
                  />
                  <button
                    onClick={() => {
                      setGameChar(getRandomChar());
                      setCharInput('');
                    }}
                    className="flex items-center justify-center rounded-lg p-1.5 text-charcoal/40 hover:text-cinnabar hover:bg-cinnabar/5 transition-colors"
                    title="随机换字"
                  >
                    <Shuffle size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Game area */}
        <div className="mx-auto max-w-2xl px-4 py-8">
          {isGlyphGame
            ? <AncientGlyphGame key={activeGame} />
            : isRadicalMatch
            ? <CharPuzzleGame key={gameChar} targetChar={gameChar} modes={['match']} title="部首连连看" />
            : isComponentBuilder
            ? <CharPuzzleGame key={gameChar} targetChar={gameChar} modes={['decompose', 'assemble']} title="部件拼字闯关" />
            : <CharPuzzleGame key={gameChar} targetChar={gameChar} />
          }
        </div>

        {/* Bottom navigation — jump between available games */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-t border-border-light">
          <div className="mx-auto max-w-2xl flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
            <span className="text-[0.625rem] font-medium text-charcoal/40 uppercase tracking-wider flex-shrink-0" style={{ fontFamily: 'Inter' }}>
              切换游戏
            </span>
            {availableGames.map((game) => (
              <button
                key={game.title}
                onClick={() => {
                  if (game.title === '古字形猜字') {
                    setActiveGame(game.title);
                  } else {
                    setGameChar(getRandomChar());
                    setActiveGame(game.title);
                  }
                }}
                className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  activeGame === game.title
                    ? 'bg-ink-black text-white'
                    : 'bg-bg-warm text-charcoal/70 hover:bg-cinnabar/10 hover:text-cinnabar'
                }`}
              >
                {game.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Game list mode ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Hero */}
      <section
        className="relative pt-24 pb-14"
        style={{ background: 'linear-gradient(180deg, #1A1A18 0%, #2D2D2B 100%)' }}
      >
        <div className="absolute inset-0 opacity-15" style={{ background: 'radial-gradient(circle at 50% 100%, #C47B2A 0%, transparent 60%)' }} />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="font-display-cn text-[clamp(3rem,6vw,5rem)] leading-tight text-rice-paper"
          >
            汉字游戏
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-3 text-base text-rice-paper/60"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            游戏即练习，练习即巩固 — Game-based learning
          </motion.p>
        </div>
      </section>

      {/* Category sections */}
      <div className="mx-auto max-w-5xl px-4 pt-12 sm:px-6 lg:px-8">
        {categories.map((cat, catIdx) => (
          <motion.section
            key={cat.label}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            custom={catIdx * 0.1}
            className="mb-12"
          >
            {/* Category header */}
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cinnabar/10 text-cinnabar">
                {cat.icon}
              </div>
              <div>
                <h2 className="font-serif-cn text-lg font-bold text-ink-black">{cat.label}</h2>
                <p className="text-xs text-charcoal/50" style={{ fontFamily: 'Inter, sans-serif' }}>{cat.en}</p>
              </div>
            </div>

            {/* Game cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cat.games.map((game, gi) => (
                <motion.div
                  key={game.title}
                  variants={fadeUp}
                  custom={gi * 0.08}
                  className={`group rounded-2xl transition-all duration-300 ${
                    game.available
                      ? 'cursor-pointer hover:-translate-y-1.5 p-6 min-h-[200px]'
                      : 'p-5'
                  }`}
                  style={{
                    background: '#FDFBF6',
                    boxShadow: game.available
                      ? '0 4px 24px rgba(194,59,42,0.08)'
                      : '0 2px 12px rgba(26,26,24,0.04)',
                    border: game.available
                      ? '1.5px solid rgba(194,59,42,0.25)'
                      : '1px solid rgba(26,26,24,0.06)',
                  }}
                  onClick={() => {
                    if (game.available) {
                      setGameChar(getRandomChar());
                      setActiveGame(game.title);
                    }
                  }}
                >
                  {/* Available indicator accent bar */}
                  {game.available && (
                    <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b" style={{ background: 'linear-gradient(90deg, #C23B2A, #E8A87C)' }} />
                  )}
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex flex-shrink-0 items-center justify-center rounded-xl ${game.available ? 'h-12 w-12' : 'h-11 w-11'}`}
                      style={{
                        background: game.available
                          ? 'rgba(194,59,42,0.12)'
                          : 'rgba(139,105,20,0.08)',
                        color: game.available ? '#C23B2A' : '#8B6914',
                      }}
                    >
                      <span className={game.available ? 'scale-110' : ''}>{game.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-serif-cn font-semibold text-ink-black ${game.available ? 'text-lg' : 'text-base'}`}>{game.title}</h3>
                        <span className="rounded-full px-1.5 py-px text-[0.625rem] font-medium text-charcoal/40" style={{ background: 'rgba(26,26,24,0.05)', fontFamily: 'Inter' }}>
                          {game.category}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[0.6875rem] text-charcoal/40" style={{ fontFamily: 'Inter' }}>{game.en}</p>
                      <p className={`leading-relaxed text-charcoal/60 ${game.available ? 'mt-3 text-sm' : 'mt-2 text-xs'}`} style={{ fontFamily: 'Inter' }}>
                        {game.desc}
                      </p>
                    </div>
                  </div>

                  {/* Badge */}
                  <div className="mt-4 pt-3 border-t border-border-light/50">
                    {game.available ? (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors group-hover:bg-cinnabar group-hover:text-white"
                        style={{
                          background: 'rgba(194,59,42,0.1)',
                          color: '#C23B2A',
                          fontFamily: 'Inter',
                        }}
                      >
                        开始游戏 <span className="text-base leading-none">&rarr;</span>
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.625rem] font-medium"
                        style={{
                          background: 'rgba(196,162,101,0.1)',
                          color: '#8B6914',
                          fontFamily: 'Inter',
                        }}
                      >
                        即将上线
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        ))}

        {/* CTA — Try the puzzle game */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-8 rounded-2xl p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, #1A1A18 0%, #2D2D2B 100%)',
            boxShadow: '0 8px 32px rgba(26,26,24,0.15)',
          }}
        >
          <Trophy size={36} className="mx-auto mb-3 text-cinnabar" />
          <h2 className="font-serif-cn text-xl font-bold text-rice-paper">试试已有的拆字游戏</h2>
          <p className="mt-2 text-sm text-rice-paper/60" style={{ fontFamily: 'Inter' }}>
            在汉字详情页的「趣味练习」标签中，已有部件拆解、部件组合和连连看三种模式等你挑战
          </p>
          <button
            onClick={() => navigate('/explore?char=国')}
            className="mt-5 inline-flex items-center rounded-full bg-cinnabar px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-vermilion-light"
          >
            去试试 &rarr;
          </button>
        </motion.div>

        <div className="h-12" />
      </div>
    </div>
  );
}
