import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeUp, scaleIn, viewportOnce } from './variants';

export default function CTABanner() {
  const navigate = useNavigate();

  return (
    <section
      className="py-20 md:py-24"
      style={{
        background:
          'radial-gradient(ellipse at center, rgba(194,59,42,0.08) 0%, transparent 70%), #1A1A18',
      }}
    >
      <div className="mx-auto max-w-[600px] px-4 text-center sm:px-6">
        <motion.h2
          className="font-display font-bold leading-[1.2] tracking-[-0.01em] text-rice-paper"
          style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          custom={0}
        >
          Start Exploring Characters
        </motion.h2>

        <motion.p
          className="mt-4 text-base leading-relaxed"
          style={{ color: 'rgba(245, 240, 232, 0.6)' }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          custom={0.15}
        >
          Discover the hidden structure and connections in every character
        </motion.p>

        <motion.div
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          custom={0.3}
        >
          <button
            onClick={() => navigate('/explore')}
            className="mt-8 inline-flex items-center rounded-full bg-cinnabar px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-vermilion-light hover:shadow-cinnabar"
          >
            Go to Explorer
          </button>
        </motion.div>
      </div>
    </section>
  );
}
