import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAllStudents, getStudentStats } from '../lib/database';
import type { UserProfile } from '../lib/auth';

interface StudentWithStats extends UserProfile {
  totalAttempts?: number;
  avgScore?: number;
  totalFavorites?: number;
  quizAvg?: number;
  puzzleAvg?: number;
  glyphAvg?: number;
}

export default function Admin() {
  const { user, profile, loading: authLoading, configured } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || (profile && profile.role !== 'teacher' && profile.role !== 'admin'))) {
      navigate('/');
      return;
    }
    if (user && configured) {
      loadStudents();
    }
  }, [user, profile, authLoading, configured]);

  async function loadStudents() {
    const all = await getAllStudents();
    const withStats = await Promise.all(
      all.map(async (s) => {
        const stats = await getStudentStats(s.id);
        // Calculate overall average from per-type data
        const typeStats = stats?.byType ? Object.values(stats.byType).filter(t => t.attempts > 0) : [];
        const overallAvg = typeStats.length > 0
          ? Math.round(typeStats.reduce((sum, t) => sum + t.averageScore, 0) / typeStats.length)
          : 0;
        return {
          ...s,
          totalAttempts: stats?.totalAttempts || 0,
          avgScore: overallAvg,
          totalFavorites: stats?.totalFavorites || 0,
          quizAvg: stats?.byType?.quiz?.averageScore || 0,
          puzzleAvg: stats?.byType?.puzzle?.averageScore || 0,
          glyphAvg: stats?.byType?.glyph?.averageScore || 0,
        };
      })
    );
    setStudents(withStats);
    setLoading(false);
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-full animate-bounce" style={{ background: '#C23B2A', animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!user || !configured) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-display mb-1" style={{ color: '#1A1A18', fontFamily: '"Playfair Display", serif' }}>
          Admin Dashboard
        </h1>
        <p className="text-sm" style={{ color: '#6B7280' }}>
          {students.length} student{students.length !== 1 ? 's' : ''} registered
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Students" value={students.length} icon="👥" />
        <StatCard
          label="Active Learners"
          value={students.filter(s => (s.totalAttempts || 0) > 0).length}
          icon="🎯"
        />
        <StatCard
          label="Avg Score"
          value={`${students.length > 0 ? Math.round(students.reduce((s, st) => s + (st.avgScore || 0), 0) / students.length) : 0}%`}
          icon="📊"
        />
        <StatCard
          label="Collection Size"
          value={students.reduce((s, st) => s + (st.totalFavorites || 0), 0)}
          icon="⭐"
        />
      </div>

      {/* Students Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E5E0D8' }}>
        <table className="w-full text-sm">
          <thead style={{ background: '#FDFBF6' }}>
            <tr>
              <th className="text-left px-3 py-3 font-medium text-xs" style={{ color: '#3D3D3B' }}>Student</th>
              <th className="text-center px-2 py-3 font-medium text-xs" style={{ color: '#3D3D3B' }}>📝 Quiz</th>
              <th className="text-center px-2 py-3 font-medium text-xs" style={{ color: '#3D3D3B' }}>🧩 Puzzle</th>
              <th className="text-center px-2 py-3 font-medium text-xs" style={{ color: '#3D3D3B' }}>🏺 Glyph</th>
              <th className="text-center px-2 py-3 font-medium text-xs" style={{ color: '#3D3D3B' }}>⭐ Fav</th>
              <th className="text-right px-3 py-3 font-medium text-xs" style={{ color: '#3D3D3B' }}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} className="border-t" style={{ borderColor: '#E5E0D8' }}>
                <td className="px-3 py-3">
                  <span className="font-medium text-sm" style={{ color: '#1A1A18' }}>
                    {s.display_name || s.username || s.id.slice(0, 8)}
                  </span>
                </td>
                <td className="text-center px-2 py-3 text-xs" style={{ color: s.quizAvg! > 0 ? '#3D3D3B' : '#C4C4C4' }}>
                  {s.quizAvg! > 0 ? `${s.quizAvg}%` : '—'}
                </td>
                <td className="text-center px-2 py-3 text-xs" style={{ color: s.puzzleAvg! > 0 ? '#3D3D3B' : '#C4C4C4' }}>
                  {s.puzzleAvg! > 0 ? `${s.puzzleAvg}%` : '—'}
                </td>
                <td className="text-center px-2 py-3 text-xs" style={{ color: s.glyphAvg! > 0 ? '#3D3D3B' : '#C4C4C4' }}>
                  {s.glyphAvg! > 0 ? `${s.glyphAvg}%` : '—'}
                </td>
                <td className="text-center px-2 py-3 text-xs" style={{ color: '#3D3D3B' }}>{s.totalFavorites}</td>
                <td className="text-right px-3 py-3 text-xs" style={{ color: '#9CA3AF' }}>
                  {new Date(s.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8" style={{ color: '#9CA3AF' }}>
                  No students registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
