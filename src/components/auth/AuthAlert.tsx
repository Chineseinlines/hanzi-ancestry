import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

type AlertKind = 'error' | 'success' | 'info';

const STYLES: Record<AlertKind, { bg: string; border: string; color: string; Icon: typeof Info }> = {
  error: { bg: '#FDF1EF', border: '#F3D3CC', color: '#A62E1F', Icon: AlertCircle },
  success: { bg: '#F0F7F1', border: '#CFE6D4', color: '#3E6B47', Icon: CheckCircle2 },
  info: { bg: '#F6F2E8', border: '#E4DDCC', color: '#6B6558', Icon: Info },
};

export function AuthAlert({ kind, children }: { kind: AlertKind; children: ReactNode }) {
  const s = STYLES[kind];
  const Icon = s.Icon;
  return (
    <motion.div
      role={kind === 'error' ? 'alert' : 'status'}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="flex items-start gap-2.5 rounded-2xl border px-3.5 py-3 text-[13px] leading-relaxed"
      style={{ background: s.bg, borderColor: s.border, color: s.color }}
    >
      <Icon size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </motion.div>
  );
}