import { motion } from 'framer-motion';
import BuildingBlocks from '../components/about/BuildingBlocks';
import IDSReferenceTable from '../components/about/IDSReferenceTable';
import EtymologicalConnections from '../components/about/EtymologicalConnections';
import CTABanner from '../components/about/CTABanner';

export default function Learn() {
  return (
    <>
      {/* Learn hero */}
      <section
        className="relative overflow-hidden pb-16 pt-32 md:pt-40"
        style={{ backgroundColor: '#1A1A18' }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(194,59,42,0.06) 0%, transparent 60%)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-[800px] px-4 text-center sm:px-6">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[0.75rem] font-medium uppercase tracking-[0.15em]"
            style={{ color: 'rgba(245, 240, 232, 0.4)' }}
          >
            字里行间 · Learning Hub
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display font-bold leading-[1.2] tracking-[-0.01em] text-rice-paper"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: '0.75rem' }}
          >
            How Chinese Characters Work
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-4 text-base leading-[1.8]"
            style={{ color: 'rgba(245, 240, 232, 0.6)', maxWidth: '600px' }}
          >
            A structured guide to the building blocks, structural patterns, and
            etymological connections that form the foundation of the Chinese
            writing system.
          </motion.p>
        </div>
      </section>

      {/* Ink wash divider */}
      <div className="bg-rice-paper">
        <img
          src="./ink-wash-divider.svg"
          alt=""
          className="mx-auto w-[200px] opacity-40"
        />
      </div>

      {/* Building Blocks */}
      <BuildingBlocks />

      {/* Ink wash divider */}
      <div className="bg-bg-warm">
        <img
          src="./ink-wash-divider.svg"
          alt=""
          className="mx-auto w-[200px] opacity-40"
        />
      </div>

      {/* IDS Reference Table */}
      <IDSReferenceTable />

      {/* Ink wash divider */}
      <div className="bg-rice-paper">
        <img
          src="./ink-wash-divider.svg"
          alt=""
          className="mx-auto w-[200px] opacity-40"
        />
      </div>

      {/* Etymological Connections */}
      <EtymologicalConnections />

      {/* CTA Banner */}
      <CTABanner />
    </>
  );
}
