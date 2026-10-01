import { memo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LegendItem {
  color: string;
  label: string;
  shape?: 'circle' | 'diamond';
}

interface GraphLegendProps {
  items: LegendItem[];
  className?: string;
}

const GraphLegend = memo(function GraphLegend({ items, className = '' }: GraphLegendProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`absolute right-3 top-3 z-10 rounded-md bg-white/80 backdrop-blur-sm ${className}`}
      style={{ border: '1px solid var(--border-light)' }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left"
      >
        <span
          className="text-[0.6875rem] font-semibold uppercase tracking-wide text-charcoal"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {t('relations.legend')}
        </span>
        <ChevronDown
          size={14}
          className={`transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          style={{ color: '#8B6914' }}
        />
      </button>

      {open && (
        <div
          className="flex flex-col gap-1.5 border-t px-3 py-2"
          style={{ borderColor: 'var(--border-light)' }}
        >
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
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default GraphLegend;