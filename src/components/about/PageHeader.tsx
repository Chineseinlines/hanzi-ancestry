import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeUp, fadeIn, brushReveal } from './variants';

export default function PageHeader() {
  return (
    <section
      className="relative overflow-hidden pb-16 pt-32 md:pt-40"
      style={{ backgroundColor: '#1A1A18' }}
    >
      {/* Subtle radial gradient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(194,59,42,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-[800px] px-4 text-center sm:px-6">
        {/* Breadcrumb */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <p className="text-[0.75rem] font-normal" style={{ color: 'rgba(245, 240, 232, 0.4)' }}>
            <Link
              to="/"
              className="underline underline-offset-2 transition-colors duration-200 hover:text-rice-paper/60"
              style={{ color: 'rgba(245, 240, 232, 0.4)' }}
            >
              Home
            </Link>
            {' / '}
            <span>About</span>
          </p>
        </motion.div>

        {/* Chinese title */}
        <motion.h1
          className="mt-6 font-display-cn leading-[1.2] tracking-[0.02em] text-rice-paper"
          style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          variants={brushReveal}
          initial="hidden"
          animate="visible"
          custom={0.2}
        >
          关于字里行间
        </motion.h1>

        {/* English title */}
        <motion.h2
          className="mt-2 font-display font-bold leading-[1.2] tracking-[-0.01em] text-rice-paper"
          style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.5}
        >
          About LINES
        </motion.h2>

        {/* Description */}
        <motion.p
          className="mx-auto mt-4 max-w-[600px] text-[1.0625rem] font-normal leading-[1.7]"
          style={{ color: 'rgba(245, 240, 232, 0.6)' }}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.7}
        >
          Understanding how Chinese characters are built — from ancient
          pictographs to modern compound characters, and the hidden connections
          between them.
        </motion.p>
      </div>
    </section>
  );
}
