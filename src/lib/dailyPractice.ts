export interface DailyPracticeState {
  date: string;
  xpToday: number;
  answersToday: number;
  streakDays: number;
  lastActiveDate: string | null;
}

export const DAILY_GOAL_XP = 50;
export const XP_PER_CORRECT_ANSWER = 10;

const STORAGE_KEY = 'lines-daily-practice-v1';
const UPDATE_EVENT = 'lines-daily-practice-updated';

function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function yesterdayKey(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return localDateKey(date);
}

function emptyState(): DailyPracticeState {
  return {
    date: localDateKey(),
    xpToday: 0,
    answersToday: 0,
    streakDays: 0,
    lastActiveDate: null,
  };
}

function normalize(raw: unknown): DailyPracticeState {
  const fallback = emptyState();
  if (!raw || typeof raw !== 'object') return fallback;
  const state = raw as Partial<DailyPracticeState>;
  return {
    date: typeof state.date === 'string' ? state.date : fallback.date,
    xpToday: Number.isFinite(state.xpToday) ? Number(state.xpToday) : 0,
    answersToday: Number.isFinite(state.answersToday) ? Number(state.answersToday) : 0,
    streakDays: Number.isFinite(state.streakDays) ? Number(state.streakDays) : 0,
    lastActiveDate: typeof state.lastActiveDate === 'string' ? state.lastActiveDate : null,
  };
}

function save(state: DailyPracticeState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent<DailyPracticeState>(UPDATE_EVENT, { detail: state }));
  } catch {
    // 隐私模式或存储不可用时静默降级；练习功能本身不受影响。
  }
}

/** 读取本地每日练习状态；跨天时只重置当日数据，首次作答时再延长连续天数。 */
export function getDailyPractice(): DailyPracticeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const state = normalize(raw ? JSON.parse(raw) : null);
    const today = localDateKey();
    if (state.date !== today) {
      return {
        ...state,
        date: today,
        xpToday: 0,
        answersToday: 0,
      };
    }
    return state;
  } catch {
    return emptyState();
  }
}

/** 游戏答对一题记 10 XP；首次作答会创建或延续连续学习天数。 */
export function recordPracticeAnswer(isCorrect: boolean): DailyPracticeState {
  const today = localDateKey();
  const previous = getDailyPractice();
  const isFirstAnswerToday = previous.lastActiveDate !== today;
  const state: DailyPracticeState = {
    date: today,
    xpToday: previous.xpToday + (isCorrect ? XP_PER_CORRECT_ANSWER : 0),
    answersToday: previous.answersToday + 1,
    streakDays: isFirstAnswerToday
      ? previous.lastActiveDate === yesterdayKey()
        ? previous.streakDays + 1
        : 1
      : previous.streakDays,
    lastActiveDate: today,
  };
  save(state);
  return state;
}

export function onDailyPracticeUpdate(listener: (state: DailyPracticeState) => void): () => void {
  const handler = (event: Event) => {
    const custom = event as CustomEvent<DailyPracticeState>;
    if (custom.detail) listener(custom.detail);
  };
  window.addEventListener(UPDATE_EVENT, handler);
  return () => window.removeEventListener(UPDATE_EVENT, handler);
}
