import { memo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface LegendItem {
  color: string;
  /** i18n 字典键（如 'cmp.cognateGraph.targetChar'），渲染时经 t() 翻译 */
  label: string;
  shape?: 'circle' | 'diamond';
}

interface GraphLegendProps {
  items: LegendItem[];
  className?: string;
}

const GraphLegend = memo(function GraphLegend({ items, className = '' }: GraphLegendProps) {
  const { t } = useLanguage();
  return (
    <div
      className={`pointer-events-none absolute right-3 top-3 z-10 rounded-md bg-white/80 px-3 py-2 backdrop-blur-sm ${className}`}
      style={{ border: '1px solid var(--border-light)' }}
    >
      <div className="flex flex-col gap-1.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            {item.shape === 'diamond' ? (
              <span
                className="inline-block h-2.5 w-2.5"
                style={{
                  backgroundColor: item.color,
                  transform: 'rotate(45deg)',
                  borderRadius: '1px',
                }}
              />
            ) : (
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
            )}
            <span className="text-[0.6875rem] font-medium text-charcoal" style={{ fontFamily: 'Inter, sans-serif' }}>
              {t(item.label)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default GraphLegend;
