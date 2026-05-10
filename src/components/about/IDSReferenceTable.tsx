import { motion } from 'framer-motion';
import { fadeUp, viewportOnce } from './variants';

interface IDSOperator {
  operator: string;
  name: string;
  structure: string;
  example: string;
  result: string;
}

const operators: IDSOperator[] = [
  { operator: '⿰', name: 'Left-Right', structure: 'A left, B right', example: '⿰氵又', result: '汉' },
  { operator: '⿱', name: 'Top-Bottom', structure: 'A above B', example: '⿱日木', result: '杳' },
  { operator: '⿴', name: 'Surround', structure: 'A surrounds B', example: '⿴囗玉', result: '国' },
  { operator: '⿵', name: 'Surround from Above', structure: 'A covers B', example: '⿵冂人', result: '内' },
  { operator: '⿶', name: 'Surround from Below', structure: 'B under A', example: '⿶凵㐅', result: '凶' },
  { operator: '⿷', name: 'Surround from Left', structure: 'A wraps B left', example: '⿷匚矢', result: '医' },
  { operator: '⿸', name: 'Surround from Upper Left', structure: 'A covers B top-left', example: '⿸厂火', result: '厅' },
  { operator: '⿹', name: 'Surround from Upper Right', structure: 'A covers B top-right', example: '⿹勹口', result: '句' },
  { operator: '⿺', name: 'Surround from Lower Left', structure: 'A wraps B bottom-left', example: '⿺辶寸', result: '过' },
  { operator: '⿻', name: 'Overlay', structure: 'A overlays B', example: '⿻木日', result: '杳' },
  { operator: '⿳', name: 'Top-Middle-Bottom', structure: 'A/B/C stacked', example: '⿳艹日十', result: '草' },
  { operator: '⿲', name: 'Left-Middle-Right', structure: 'A/B/C side by side', example: '⿲辛讠辛', result: '辩' },
];

export default function IDSReferenceTable() {
  return (
    <section className="bg-bg-warm py-16 md:py-24">
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
            Ideographic Description Sequences
          </h2>
          <p className="mt-3 text-base text-charcoal">
            The structural language of Chinese characters
          </p>
        </motion.div>

        {/* Explanation text */}
        <motion.div
          className="mx-auto mb-10 max-w-[700px] space-y-4 text-center text-base leading-[1.8] text-charcoal"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          custom={0.15}
        >
          <p>
            IDS is a formal notation system that describes the spatial arrangement of
            components within a Chinese character. Each decomposition starts with a special
            operator symbol that indicates the structural relationship, followed by the
            components.
          </p>
          <p>
            For example, the character <span className="font-serif-cn text-lg font-semibold text-ink-black">国</span>{' '}
            (country) is described as{' '}
            <span className="font-mono text-base text-cinnabar">⿴囗玉</span> — meaning
            &ldquo;enclosure (囗) surrounding jade (玉)&rdquo;. This tells us both what the
            character contains and how those pieces are arranged.
          </p>
        </motion.div>

        {/* Table container */}
        <motion.div
          className="overflow-hidden rounded-lg bg-white shadow-md"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          custom={0.3}
        >
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-ink-black">
                  <th className="px-6 py-3 text-left text-[0.8125rem] font-medium uppercase tracking-wider text-rice-paper">
                    Operator
                  </th>
                  <th className="px-6 py-3 text-left text-[0.8125rem] font-medium uppercase tracking-wider text-rice-paper">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-[0.8125rem] font-medium uppercase tracking-wider text-rice-paper">
                    Structure
                  </th>
                  <th className="px-6 py-3 text-center text-[0.8125rem] font-medium uppercase tracking-wider text-rice-paper">
                    Example
                  </th>
                  <th className="px-6 py-3 text-center text-[0.8125rem] font-medium uppercase tracking-wider text-rice-paper">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody>
                {operators.map((op, i) => (
                  <motion.tr
                    key={op.operator}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                    custom={0.05 * i}
                    className={i % 2 === 0 ? 'bg-white' : 'bg-bg-warm/50'}
                    style={{ borderBottom: '1px solid var(--border-light)' }}
                  >
                    <td className="px-6 py-3 text-center">
                      <span className="font-mono text-[1.5rem] font-medium text-cinnabar">
                        {op.operator}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-[0.9375rem] font-medium text-ink-black">
                      {op.name}
                    </td>
                    <td className="px-6 py-3 text-[0.875rem] text-charcoal">
                      {op.structure}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="font-mono text-[1.125rem] text-graph-node-component">
                        {op.example}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="font-serif-cn text-[1.25rem] font-bold text-ink-black">
                        {op.result}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden">
            {operators.map((op, i) => (
              <motion.div
                key={op.operator}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                custom={0.05 * i}
                className={`flex items-center gap-4 px-4 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-bg-warm/50'}`}
                style={{ borderBottom: '1px solid var(--border-light)' }}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-ink-black font-mono text-[1.25rem] font-medium text-rice-paper">
                  {op.operator}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.875rem] font-medium text-ink-black">{op.name}</p>
                  <p className="text-[0.75rem] text-charcoal">{op.structure}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="font-mono text-[0.875rem] text-graph-node-component">
                    {op.example}
                  </span>
                  <span className="mx-1 text-charcoal/40">→</span>
                  <span className="font-serif-cn text-[1.125rem] font-bold text-ink-black">
                    {op.result}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
