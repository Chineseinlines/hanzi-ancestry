import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserStats, type UserStats, type GameTypeStats } from '../lib/database';

export default function Profile() {
  const { user, profile, configured } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && configured) {
      getUserStats(user.id).then(s => { setStats(s); setLoading(false); });
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
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-display mb-1" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>
          Learning Dashboard
        </h1>
        <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
          {profile?.display_name || user.email}
        </p>
        <Link to="/wordbook" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all hover:shadow-sm"
          style={{ borderColor: '#2D5F8A', color: '#2D5F8A' }}>
          📖 Word Book
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[...Array(4)].map((_, i) => (<div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />))}
        </div>
      ) : stats ? (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatCard label="Total Exercises" value={stats.totalAttempts} icon="🎯" />
            <StatCard label="Favorites" value={stats.totalFavorites} icon="⭐" />
            <StatCard label="Characters Viewed" value={stats.uniqueCharsViewed} icon="📖" />
            <StatCard label="Overall Avg" value={stats.totalAttempts > 0
              ? `${Math.round(Object.values(stats.byType).filter(t => t.attempts > 0).reduce((s, t) => s + t.averageScore, 0) / Math.max(1, Object.values(stats.byType).filter(t => t.attempts > 0).length))}%`
              : '—'} icon="📊" />
          </div>

          {/* Per Game Type */}
          <h2 className="text-xl font-display mb-4" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>
            By Exercise Type
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {Object.entries(stats.byType).map(([key, t]) => (
              <GameCard key={key} gameKey={key} data={t} />
            ))}
          </div>

          {/* Future: Video Learning Section */}
          <div className="rounded-2xl p-6 mb-6" style={{ background: '#FDFBF6', border: '1px dashed #E5E0D8' }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎬</span>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: '#9CA3AF' }}>Video Learning</h3>
                <p className="text-xs" style={{ color: '#C4C4C4' }}>Coming soon — track your video learning progress</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          {stats.recentAttempts.length > 0 && (
            <div>
              <h2 className="text-xl font-display mb-4" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>
                Recent Activity
              </h2>
              <div className="space-y-2">
                {stats.recentAttempts.slice(0, 8).map((a, i) => {
                  const cfg = { quiz: '📝', puzzle: '🧩', glyph: '🏺' }[a.game_type] || '🎯';
                  const label = { quiz: 'Quiz', puzzle: 'Puzzle', glyph: 'Glyph' }[a.game_type] || a.game_type;
                  const pct = Math.round((a.score / a.total) * 100);
                  return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: '#FDFBF6', border: '1px solid #E5E0D8' }}>
                      <div className="flex items-center gap-2">
                        <span>{cfg}</span>
                        <span className="text-sm font-medium" style={{ color: '#1A1A18' }}>{label}</span>
                        <span className="text-xs" style={{ color: '#9CA3AF' }}>{new Date(a.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className="text-sm font-semibold px-2 py-0.5 rounded-lg"
                        style={{
                          color: pct >= 70 ? '#4A7C59' : pct >= 40 ? '#B8860B' : '#C23B2A',
                          background: pct >= 70 ? 'rgba(74,124,89,0.1)' : pct >= 40 ? 'rgba(184,134,11,0.1)' : 'rgba(194,59,42,0.1)',
                        }}>
                        {a.score}/{a.total} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🎮</div>
          <p className="text-sm" style={{ color: '#6B7280' }}>Complete a quiz or game to see your stats here.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="p-4 rounded-2xl" style={{ background: '#FDFBF6', border: '1px solid #E5E0D8' }}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold" style={{ color: '#1A1A18' }}>{value}</div>
      <div className="text-xs" style={{ color: '#9CA3AF' }}>{label}</div>
    </div>
  );
}

function GameCard({ gameKey, data }: { gameKey: string; data: GameTypeStats }) {
  return (
    <div className="p-5 rounded-2xl" style={{ background: '#FDFBF6', border: '1px solid #E5E0D8' }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{data.icon}</span>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: '#1A1A18' }}>{data.label}</h3>
          <span className="text-xs" style={{ color: '#9CA3AF' }}>
            {data.attempts > 0 ? `${data.attempts} attempt${data.attempts > 1 ? 's' : ''}` : 'Not started'}
          </span>
        </div>
      </div>
      {data.attempts > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(45,95,138,0.06)' }}>
            <div className="text-lg font-bold" style={{ color: '#2D5F8A' }}>{data.averageScore}%</div>
            <div className="text-[0.6rem]" style={{ color: '#9CA3AF' }}>Average</div>
          </div>
          <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(74,124,89,0.06)' }}>
            <div className="text-lg font-bold" style={{ color: '#4A7C59' }}>{data.bestScore}%</div>
            <div className="text-[0.6rem]" style={{ color: '#9CA3AF' }}>Best</div>
          </div>
        </div>
      ) : (
        <Link
          to={gameKey === 'quiz' ? '/quiz' : '/games'}
          className="block text-center py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80"
          style={{ background: '#2D5F8A', color: '#fff' }}
        >
          Start →
        </Link>
      )}
    </div>
  );
}
