import { supabase, isSupabaseConfigured } from './supabase';

// ── Types ────────────────────────────────────────────────────

export interface QuizAttempt {
  id?: number;
  user_id: string;
  game_type: 'quiz' | 'puzzle' | 'glyph';
  score: number;
  total: number;
  max_streak?: number;
  modes?: string[];
  duration_ms?: number;
  created_at?: string;
}

export interface QuizAnswer {
  id?: number;
  attempt_id: number;
  question_index: number;
  question_type?: string;
  prompt?: string;
  correct_char: string;
  user_answer?: string;
  is_correct: boolean;
  time_spent_ms?: number;
}

export interface Favorite {
  user_id: string;
  char: string;
  folder: string;
  added_at?: string;
}

// ── Quiz Attempts ────────────────────────────────────────────

export async function saveQuizAttempt(
  userId: string,
  gameType: QuizAttempt['game_type'],
  score: number,
  total: number,
  answers: Array<{ questionIndex: number; questionType: string; prompt: string; correctChar: string; userAnswer: string; isCorrect: boolean }>,
  extra?: { max_streak?: number; modes?: string[]; duration_ms?: number }
): Promise<number | null> {
  if (!isSupabaseConfigured()) return null;

  // Insert attempt
  console.log('[saveQuizAttempt] Saving:', { userId, gameType, score, total, answersCount: answers.length });

  const { data: attempt, error: attemptError } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id: userId,
      game_type: gameType,
      score,
      total,
      max_streak: extra?.max_streak,
      modes: extra?.modes,
      duration_ms: extra?.duration_ms,
    })
    .select('id')
    .single();

  if (attemptError || !attempt) {
    console.error('[saveQuizAttempt] Failed to save attempt:', attemptError);
    return null;
  }

  console.log('[saveQuizAttempt] Attempt saved, id:', attempt.id);

  // Insert per-question answers (convert camelCase → snake_case for DB)
  const answersWithAttemptId = answers.map(a => ({
    attempt_id: attempt.id,
    question_index: a.questionIndex,
    question_type: a.questionType,
    prompt: a.prompt,
    correct_char: a.correctChar,
    user_answer: a.userAnswer,
    is_correct: a.isCorrect,
  }));

  const { error: answersError } = await supabase
    .from('quiz_answers')
    .insert(answersWithAttemptId);

  if (answersError) {
    console.error('Failed to save quiz answers:', answersError);
  }

  return attempt.id;
}

// ── Favorites ────────────────────────────────────────────────

export async function fetchFavorites(userId: string): Promise<Favorite[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch favorites:', error);
    return [];
  }
  return data as Favorite[];
}

export async function addFavoriteToCloud(userId: string, char: string, folder = '默认') {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from('favorites')
    .upsert({ user_id: userId, char, folder, added_at: new Date().toISOString() });

  if (error) console.error('Failed to add favorite:', error);
}

export async function removeFavoriteFromCloud(userId: string, char: string) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('char', char);

  if (error) console.error('Failed to remove favorite:', error);
}

export async function syncFavoritesToCloud(userId: string, favorites: { char: string; folder: string; addedAt: number }[]) {
  if (!isSupabaseConfigured() || favorites.length === 0) return;
  const rows = favorites.map(f => ({
    user_id: userId,
    char: f.char,
    folder: f.folder,
    added_at: new Date(f.addedAt).toISOString(),
  }));
  const { error } = await supabase.from('favorites').upsert(rows);
  if (error) console.error('Failed to sync favorites:', error);
}

// ── Character Views ──────────────────────────────────────────

export async function recordCharView(userId: string, char: string) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from('char_views')
    .insert({ user_id: userId, char, viewed_at: new Date().toISOString() });

  if (error) console.error('Failed to record char view:', error);
}

// ── Stats ────────────────────────────────────────────────────

export interface GameTypeStats {
  label: string;
  icon: string;
  attempts: number;
  averageScore: number;
  bestScore: number;
  lastPlayed: string | null;
}

export interface UserStats {
  totalFavorites: number;
  uniqueCharsViewed: number;
  totalAttempts: number;
  byType: Record<string, GameTypeStats>;
  recentAttempts: Array<{ game_type: string; score: number; total: number; created_at: string }>;
}

const GAME_CONFIG: Record<string, { label: string; icon: string }> = {
  'quiz': { label: '汉字题库', icon: '📝' },
  'puzzle': { label: '部件拼字', icon: '🧩' },
  'glyph': { label: '古字形猜字', icon: '🏺' },
};

export async function getUserStats(userId: string): Promise<UserStats | null> {
  if (!isSupabaseConfigured()) return null;
  const [attempts, favCount, viewCount] = await Promise.all([
    supabase.from('quiz_attempts').select('game_type,score,total,created_at').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('char_views').select('char').eq('user_id', userId),
  ]);

  const allAttempts = (attempts.data || []) as Array<{ game_type: string; score: number; total: number; created_at: string }>;
  const uniqueChars = new Set((viewCount.data || []).map((v: { char: string }) => v.char));

  // Group by game type
  const byType: Record<string, GameTypeStats> = {};
  for (const [key, config] of Object.entries(GAME_CONFIG)) {
    const typeAttempts = allAttempts.filter(a => a.game_type === key);
    if (typeAttempts.length > 0) {
      const scores = typeAttempts.map(a => Math.round((a.score / a.total) * 100));
      byType[key] = {
        label: config.label,
        icon: config.icon,
        attempts: typeAttempts.length,
        averageScore: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
        bestScore: Math.max(...scores),
        lastPlayed: typeAttempts[0].created_at,
      };
    } else {
      byType[key] = {
        label: config.label,
        icon: config.icon,
        attempts: 0,
        averageScore: 0,
        bestScore: 0,
        lastPlayed: null,
      };
    }
  }

  return {
    totalFavorites: favCount.count || 0,
    uniqueCharsViewed: uniqueChars.size,
    totalAttempts: allAttempts.length,
    byType,
    recentAttempts: allAttempts.slice(0, 10),
  };
}

// ── Word Book (生字本) ───────────────────────────────────────

export async function fetchWordBook(userId: string): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase
    .from('wordbook')
    .select('char')
    .eq('user_id', userId)
    .order('added_at', { ascending: false });
  return (data || []).map(r => r.char);
}

export async function addToWordBook(userId: string, char: string) {
  if (!isSupabaseConfigured()) return;
  await supabase.from('wordbook').upsert({ user_id: userId, char, added_at: new Date().toISOString() });
}

export async function removeFromWordBook(userId: string, char: string) {
  if (!isSupabaseConfigured()) return;
  await supabase.from('wordbook').delete().eq('user_id', userId).eq('char', char);
}

// ── Account Deletion ─────────────────────────────────────────

export async function deleteAccount(): Promise<{ error?: string }> {
  if (!isSupabaseConfigured()) return { error: 'Backend not configured' };
  const { error } = await supabase.rpc('delete_my_account');
  return { error: error?.message };
}

// ── Admin ────────────────────────────────────────────────────

export async function getAllStudents() {
  if (!isSupabaseConfigured()) return [];
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('created_at', { ascending: false });
  return (data || []) as import('./auth').UserProfile[];
}

export async function getStudentStats(userId: string) {
  return getUserStats(userId);
}
