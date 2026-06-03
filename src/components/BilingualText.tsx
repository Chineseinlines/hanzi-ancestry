import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';

interface BilingualTextProps {
  /** Chinese text — always visible */
  zh: string;
  /** English text — collapsed by default */
  en: string;
  /** HTML tag to render the Chinese text as */
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'div';
  /** Additional class for the Chinese text */
  zhClassName?: string;
  /** Additional class for the English text */
  enClassName?: string;
  /** Start with English expanded? */
  defaultOpen?: boolean;
}

/**
 * Displays Chinese text prominently with English text in a collapsible
 * section below. Click the "EN" badge to toggle the English translation.
 */
export default function BilingualText({
  zh,
  en,
  as: Tag = 'span',
  zhClassName = '',
  enClassName = '',
  defaultOpen = false,
}: BilingualTextProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-1">
      <Tag className={zhClassName}>{zh}</Tag>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger
          className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-[0.6rem] font-medium uppercase tracking-wider transition-colors hover:opacity-80 cursor-pointer select-none align-middle"
          style={{
            backgroundColor: 'rgba(26,26,24,0.06)',
            color: 'rgba(26,26,24,0.4)',
          }}
          title="Toggle English"
        >
          EN
          <ChevronDown
            size={10}
            className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent
          className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
        >
          <span
            className={`block text-[0.75rem] leading-relaxed ${enClassName}`}
            style={{ color: 'rgba(26,26,24,0.45)' }}
          >
            {en}
          </span>
        </CollapsibleContent>
      </Collapsible>
    </span>
  );
}
