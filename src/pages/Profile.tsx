import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserStats } from '../lib/database';

interface Stats {
  totalAttempts: number;
  totalFavorites: number;
  uniqueCharsViewed: number;
  averageScore: number;
  recentAttempts: Array<{
    game_type: string;
    score: number;
    total: number;
    created_at: string;
  }>;
}

const GAME_LABELS: Record<string, string> = {
  quiz: '📝 Quiz',
  puzzle: '🧩 Puzzle',
  glyph: '🏺 Ancient Glyph',
};

export default function Profile() {
  const { user, profile, configured } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && configured) {
      getUserStats(user.id).then(s => {
        setStats(s);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user, configured]);

  if (!configured) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center p-8">
          <div className="text-5xl mb-4">⚙️</div>
          <h1 className="text-2xl font-display mb-2" style={{ color: '#1A1A18' }}>Backend Not Configured</h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>Set up Supabase to enable profiles and learning records.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center p-8">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-2xl font-display mb-2" style={{ color: '#1A1A18' }}>Sign in to view your profile</h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>Track your learning progress across devices.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-display mb-1" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>
          My Profile
        </h1>
        <p className="text-sm mb-3" style={{ color: '#6B7280' }}>
          {profile?.display_name || user.email}
        </p>
        <div className="flex gap-3">
          <a href="/#/wordbook" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all hover:shadow-sm"
            style={{ borderColor: '#2D5F8A', color: '#2D5F8A' }}>
            📖 Word Book
          </a>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatCard label="Total Attempts" value={stats.totalAttempts} icon="🎯" />
            <StatCard label="Avg Score" value={`${stats.averageScore}%`} icon="📈" />
            <StatCard label="Favorites" value={stats.totalFavorites} icon="⭐" />
            <StatCard label="Chars Viewed" value={stats.uniqueCharsViewed} icon="📖" />
          </div>

          {/* Recent Activity */}
          {stats.recentAttempts.length > 0 && (
            <div>
              <h2 className="text-xl font-display mb-4" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>
                Recent Activity
              </h2>
              <div className="space-y-3">
                {stats.recentAttempts.slice(0, 10).map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{ background: '#FDFBF6', border: '1px solid #E5E0D8' }}
                  >
                    <div>
                      <span className="text-sm font-medium" style={{ color: '#1A1A18' }}>
                        {GAME_LABELS[a.game_type] || a.game_type}
                      </span>
                      <span className="text-xs ml-2" style={{ color: '#9CA3AF' }}>
                        {new Date(a.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span
                      className="text-sm font-semibold px-2 py-0.5 rounded-lg"
                      style={{
                        color: a.score / a.total >= 0.7 ? '#4A7C59' : a.score / a.total >= 0.4 ? '#B8860B' : '#C23B2A',
                        background: a.score / a.total >= 0.7 ? 'rgba(74,124,89,0.1)' : a.score / a.total >= 0.4 ? 'rgba(184,134,11,0.1)' : 'rgba(194,59,42,0.1)',
                      }}
                    >
                      {a.score}/{a.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.recentAttempts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🎮</div>
              <p className="text-sm" style={{ color: '#6B7280' }}>
                No learning records yet. Try a quiz or game!
              </p>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div
      className="p-4 rounded-2xl"
      style={{ background: '#FDFBF6', border: '1px solid #E5E0D8' }}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold" style={{ color: '#1A1A18' }}>{value}</div>
      <div className="text-xs" style={{ color: '#9CA3AF' }}>{label}</div>
    </div>
  );
}
