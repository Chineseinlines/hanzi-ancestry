/**
 * SM-2 间隔重复调度（生字本复习队列）。
 * 状态存于 localStorage，离线可用；登录用户的学习记录仍可跨设备通过 Supabase 同步。
 */

export type Grade = 'again' | 'hard' | 'good' | 'easy';

export interface SrsCard {
  char: string;
  /** 难度因子，初始 2.5，下限 1.3 */
  ease: number;
  /** 间隔天数；0 表示当日内重学 */
  interval: number;
  /** 连续答对次数 */
  reps: number;
  /** 遗忘次数 */
  lapses: number;
  /** 下次到期时间（epoch ms） */
  due: number;
  /** 上次复习时间；0 = 从未复习 */
  last: number;
}

export type SrsStore = Record<string, SrsCard>;

export type CardState = 'new' | 'due' | 'learning' | 'mastered';

const STORAGE_KEY = 'hanzi-srs-v1';
const DAY = 86_400_000;
const RELEARN_MS = 10 * 60 * 1000;

/** 间隔达到该天数即视为已掌握。 */
export const MASTERED_INTERVAL = 21;

/** 各评级对应的 SM-2 质量分（q）。 */
const GRADE_Q: Record<Grade, number> = { again: 1, hard: 3, good: 4, easy: 5 };

export function newCard(char: string): SrsCard {
  return { char, ease: 2.5, interval: 0, reps: 0, lapses: 0, due: 0, last: 0 };
}

/** 依 SM-2 计算下一次复习状态。 */
export function schedule(card: SrsCard, grade: Grade, now = Date.now()): SrsCard {
  const q = GRADE_Q[grade];
  let { ease, interval, reps, lapses } = card;

  if (q < 3) {
    reps = 0;
    lapses += 1;
    interval = 0;
  } else {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 6;
    else interval = Math.max(1, Math.round(interval * ease));
    ease = Math.min(3.2, Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))));
  }

  return {
    char: card.char,
    ease,
    interval,
    reps,
    lapses,
    due: now + (interval === 0 ? RELEARN_MS : interval * DAY),
    last: now,
  };
}

export function cardState(card: SrsCard | undefined, now = Date.now()): CardState {
  if (!card || card.last === 0) return 'new';
  if (card.due <= now) return 'due';
  if (card.interval >= MASTERED_INTERVAL) return 'mastered';
  return 'learning';
}

export function loadStore(): SrsStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as SrsStore;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveStore(store: SrsStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* localStorage 不可用时忽略 */
  }
}