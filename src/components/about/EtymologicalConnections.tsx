import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, viewportOnce } from './variants';

const spearChars = [
  { char: '我', pinyin: 'wǒ', meaning: 'I, me' },
  { char: '战', pinyin: 'zhàn', meaning: 'war, battle' },
  { char: '武', pinyin: 'wǔ', meaning: 'military' },
  { char: '戏', pinyin: 'xì', meaning: 'play, drama' },
  { char: '戎', pinyin: 'róng', meaning: 'weapons' },
  { char: '戍', pinyin: 'shù', meaning: 'garrison' },
  { char: '戒', pinyin: 'jiè', meaning: 'guard against' },
  { char: '戮', pinyin: 'lù', meaning: 'kill' },
];

export default function EtymologicalConnections() {
  return (
    <section className="bg-rice-paper py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="mb-12 text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          custom={0}
        >
          <h2
            className="font-display font-bold leading-[1.25] tracking-[-0.01em] text-ink-black"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}
          >
            Hidden Connections
          </h2>
          <p className="mt-3 text-base text-charcoal">
            Characters that share components often share meaning — discover the
            etymological family tree
          </p>
        </motion.div>

        {/* Explanation text */}
        <motion.div
          className="mx-auto mb-12 max-w-[700px] space-y-4 text-base leading-[1.8] text-charcoal"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          custom={0.15}
        >
          <p>
            When two characters share a component, they are often etymologically
            related. This app discovers these hidden connections by analyzing the leaf
            components of any character and finding all other characters that contain
            those same building blocks.
          </p>
          <p>
            For example, the character{' '}
            <span className="font-serif-cn text-lg font-semibold text-ink-black">国</span>{' '}
            (country) contains the component{' '}
            <span className="font-serif-cn text-lg font-semibold text-cinnabar">戈</span>{' '}
            (halberd / spear). When we search for other characters containing{' '}
            <span className="font-serif-cn text-cinnabar">戈</span>, we find a family of
            related characters — all connected through the concept of warfare and defense
            that the <span className="font-serif-cn text-cinnabar">戈</span> component
            represents.
          </p>
          <p>
            These connections reveal the deep semantic networks embedded in the Chinese
            writing system — a living fossil of how ancient Chinese thinkers organized
            their understanding of the world.
          </p>
        </motion.div>

        {/* Character cards */}
        <motion.div
          className="mx-auto max-w-[800px]"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          custom={0.1}
        >
          {/* Center component badge */}
          <motion.div
            variants={fadeUp}
            className="mb-8 flex flex-col items-center"
          >
            <div className="flex items-center gap-3 rounded-full bg-ink-black px-5 py-2">
              <span className="font-serif-cn text-[1.25rem] font-bold text-cinnabar">戈</span>
              <span className="text-[0.8125rem] text-rice-paper/70">Spear / Halberd component</span>
            </div>
            <p className="mt-2 text-sm text-charcoal">
              Characters containing this component
            </p>
          </motion.div>

          {/* Character grid */}
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8 sm:gap-4">
            {spearChars.map((item) => (
              <motion.div
                key={item.char}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="group flex flex-col items-center rounded-lg bg-white p-3 shadow-md transition-all duration-300 hover:border hover:border-cinnabar hover:shadow-lg"
                style={{ border: '1px solid transparent' }}
              >
                <span className="font-display-cn text-[2rem] leading-none text-ink-black transition-colors duration-200 group-hover:text-cinnabar">
                  {item.char}
                </span>
                <span className="mt-1 font-mono text-[0.6875rem] text-cinnabar">
                  {item.pinyin}
                </span>
                <span className="mt-0.5 text-center text-[0.6875rem] leading-tight text-charcoal/70">
                  {item.meaning}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Explanation label */}
          <motion.p
            variants={fadeUp}
            className="mt-6 text-center text-sm text-charcoal"
          >
            These characters all relate to{' '}
            <span className="font-medium text-ink-black">weapons, warfare, or military</span>{' '}
            concepts because they share the{' '}
            <span className="font-serif-cn font-semibold text-cinnabar">戈</span> component.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
