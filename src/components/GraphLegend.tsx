import { memo } from 'react';

interface LegendItem {
  color: string;
  label: string;
}

interface GraphLegendProps {
  items: LegendItem[];
  className?: string;
}

const GraphLegend = memo(function GraphLegend({ items, className = '' }: GraphLegendProps) {
  return (
    <div
      className={`pointer-events-none absolute right-3 top-3 z-10 rounded-md bg-white/80 px-3 py-2 backdrop-blur-sm ${className}`}
      style={{ border: '1px solid var(--border-light)' }}
    >
      <div className="flex flex-col gap-1.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[0.6875rem] font-medium text-charcoal" style={{ fontFamily: 'Inter, sans-serif' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default GraphLegend;
