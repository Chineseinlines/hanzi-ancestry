import { useEffect, useState } from 'react';
import { Flame, Target, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  DAILY_GOAL_XP,
  getDailyPractice,
  onDailyPracticeUpdate,
  type DailyPracticeState,
} from '../lib/dailyPractice';

interface DailyPracticeCardProps {
  onDark?: boolean;
  compact?: boolean;
}

/** 本地每日目标卡：为访客也提供轻量的 XP、进度与连续学习反馈。 */
export default function DailyPracticeCard({ onDark = false, compact = false }: DailyPracticeCardProps) {
  const { t } = useLanguage();
  const [state, setState] = useState<DailyPracticeState>(() => getDailyPractice());

  useEffect(() => onDailyPracticeUpdate(setState), []);

  const progress = Math.min(100, Math.round((state.xpToday / DAILY_GOAL_XP) * 100));
  const completed = state.xpToday >= DAILY_GOAL_XP;
  const colors = onDark
    ? {
        panel: 'rgba(245,240,232,0.08)',
        border: 'rgba(245,240,232,0.16)',
        title: '#F5F0E8',
        muted: 'rgba(245,240,232,0.62)',
        track: 'rgba(245,240,232,0.14)',
      }
    : {
        panel: '#FDFBF6',
        border: 'rgba(26,26,24,0.08)',
        title: '#1A1A18',
        muted: '#8B6914',
        track: 'rgba(26,26,24,0.08)',
      };

  return (
    <section
      aria-label={t('practice.dailyGoal')}
      className={`rounded-2xl border text-left ${compact ? 'p-4' : 'w-full max-w-xl p-5'}`}
      style={{ background: colors.panel, borderColor: colors.border }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ background: completed ? 'rgba(107,127,94,0.18)' : 'rgba(194,59,42,0.14)', color: completed ? '#6B7F5E' : '#C23B2A' }}
          >
            <Target size={20} />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold" style={{ color: colors.title, fontFamily: 'Inter, sans-serif' }}>
              {t('practice.dailyGoal')}
            </h2>
            <p className="mt-0.5 text-xs" style={{ color: colors.muted, fontFamily: 'Inter, sans-serif' }}>
              {completed ? t('practice.completed') : t('practice.nextGame')}
            </p>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-3 text-xs font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
          <span className="inline-flex items-center gap-1" style={{ color: completed ? '#6B7F5E' : '#C23B2A' }}>
            <Zap size={14} /> {state.xpToday}/{DAILY_GOAL_XP} XP
          </span>
          <span className="inline-flex items-center gap-1" style={{ color: '#C4A265' }}>
            <Flame size={14} /> {t('practice.streak', { n: state.streakDays })}
          </span>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full" style={{ background: colors.track }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, background: completed ? '#6B7F5E' : 'linear-gradient(90deg, #C23B2A, #E8A87C)' }}
        />
      </div>
    </section>
  );
}
