import { motion } from 'framer-motion';
import { fadeUp, viewportOnce } from './variants';

interface IDSOperator {
  operator: string;
  name: string;
  nameZh: string;
  structure: string;
  structureZh: string;
  example: string;
  result: string;
  example2: string;
  result2: string;
}

const operators: IDSOperator[] = [
  { operator: '⿰', name: 'Left-Right', nameZh: '左右结构', structure: 'A left, B right', structureZh: 'A在左，B在右', example: '⿰氵又', result: '汉', example2: '⿰亻尔', result2: '你' },
  { operator: '⿱', name: 'Top-Bottom', nameZh: '上下结构', structure: 'A above B (pure vertical stack)', structureZh: 'A在上，B在下（纯垂直堆叠）', example: '⿱日一', result: '旦', example2: '⿱木子', result2: '李' },
  { operator: '⿴', name: 'Surround', nameZh: '全包围结构', structure: 'A surrounds B', structureZh: 'A包围B', example: '⿴囗玉', result: '国', example2: '⿴囗员', result2: '圆' },
  { operator: '⿵', name: 'Surround from Above', nameZh: '上三包围', structure: 'A covers B from top', structureZh: 'A从上方覆盖B', example: '⿵冂人', result: '内', example2: '⿵门马', result2: '闯' },
  { operator: '⿶', name: 'Surround from Below', nameZh: '下三包围', structure: 'B under A (enclosed from below)', structureZh: 'B被A从下方包围', example: '⿶凵㐅', result: '凶', example2: '⿶凵氶', result2: '函' },
  { operator: '⿷', name: 'Surround from Left', nameZh: '左三包围', structure: 'A wraps B from left', structureZh: 'A从左侧包围B', example: '⿷匚矢', result: '医', example2: '⿷匚元', result2: '园' },
  { operator: '⿸', name: 'Surround from Upper Left', nameZh: '左上包围', structure: 'A covers B from top-left', structureZh: 'A从左上覆盖B', example: '⿸厂火', result: '厅', example2: '⿸尸毛', result2: '尾' },
  { operator: '⿹', name: 'Surround from Upper Right', nameZh: '右上包围', structure: 'A covers B from top-right', structureZh: 'A从右上覆盖B', example: '⿹勹口', result: '句', example2: '⿹弋工', result2: '式' },
  { operator: '⿺', name: 'Surround from Lower Left', nameZh: '左下包围', structure: 'A wraps B from bottom-left', structureZh: 'A从左下包围B', example: '⿺辶寸', result: '过', example2: '⿺走卜', result2: '赴' },
  { operator: '⿻', name: 'Overlay', nameZh: '镶嵌/覆盖结构', structure: 'A overlays B (components interpenetrate)', structureZh: 'A覆盖B（部件视觉交叠）', example: '⿻日土', result: '里', example2: '⿻大丶', result2: '太' },
  { operator: '⿳', name: 'Top-Middle-Bottom', nameZh: '上中下结构', structure: 'A/B/C stacked vertically', structureZh: 'A/B/C垂直堆叠', example: '⿳艹日十', result: '草', example2: '⿳亠口小', result2: '京' },
  { operator: '⿲', name: 'Left-Middle-Right', nameZh: '左中右结构', structure: 'A/B/C side by side', structureZh: 'A/B/C水平排列', example: '⿲辛讠辛', result: '辩', example2: '⿲氵舟刂', result2: '测' },
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
                    Example 1
                  </th>
                  <th className="px-6 py-3 text-center text-[0.8125rem] font-medium uppercase tracking-wider text-rice-paper">
                    Result
                  </th>
                  <th className="px-6 py-3 text-center text-[0.8125rem] font-medium uppercase tracking-wider text-rice-paper">
                    Example 2
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
                    <td className="px-6 py-3">
                      <span className="text-[0.9375rem] font-medium text-ink-black">
                        {op.name}
                      </span>
                      <br />
                      <span className="text-[0.8125rem] text-charcoal/70">
                        {op.nameZh}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-[0.875rem] text-charcoal">
                        {op.structure}
                      </span>
                      <br />
                      <span className="text-[0.75rem] text-charcoal/60">
                        {op.structureZh}
                      </span>
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
                    <td className="px-6 py-3 text-center">
                      <span className="font-mono text-[1.125rem] text-graph-node-component">
                        {op.example2}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="font-serif-cn text-[1.25rem] font-bold text-ink-black">
                        {op.result2}
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
                className={`flex items-center gap-3 px-4 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-bg-warm/50'}`}
                style={{ borderBottom: '1px solid var(--border-light)' }}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-ink-black font-mono text-[1.25rem] font-medium text-rice-paper">
                  {op.operator}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.875rem] font-medium text-ink-black">
                    {op.name}
                    <span className="ml-1 text-[0.75rem] font-normal text-charcoal/60">{op.nameZh}</span>
                  </p>
                  <p className="text-[0.75rem] text-charcoal">{op.structure}</p>
                  <p className="mt-0.5 text-[0.6875rem] text-charcoal/60">{op.structureZh}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div>
                    <span className="font-mono text-[0.75rem] text-graph-node-component">
                      {op.example}
                    </span>
                    <span className="mx-1 text-charcoal/40">→</span>
                    <span className="font-serif-cn text-[1rem] font-bold text-ink-black">
                      {op.result}
                    </span>
                  </div>
                  <div>
                    <span className="font-mono text-[0.75rem] text-graph-node-component">
                      {op.example2}
                    </span>
                    <span className="mx-1 text-charcoal/40">→</span>
                    <span className="font-serif-cn text-[1rem] font-bold text-ink-black">
                      {op.result2}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
