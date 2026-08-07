import { useState, type FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterFormProps {
  onSuccess: () => void;
  onMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSuccess, onMessage, onSwitchToLogin }: RegisterFormProps) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      onMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    setLoading(true);
    onMessage(null);

    const { error } = await signUp(email, password, displayName || undefined);
    if (error) {
      onMessage({ type: 'error', text: error });
    } else {
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#3D3D3B' }}>Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all"
          style={{ borderColor: '#E5E0D8', background: '#FDFBF6' }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#3D3D3B' }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all"
          style={{ borderColor: '#E5E0D8', background: '#FDFBF6' }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#3D3D3B' }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          placeholder="At least 6 characters"
          className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all"
          style={{ borderColor: '#E5E0D8', background: '#FDFBF6' }}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
        style={{ background: '#2D5F8A' }}
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
      <p className="text-center text-xs" style={{ color: '#9CA3AF' }}>
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin} className="underline hover:text-current" style={{ color: '#2D5F8A' }}>
          Sign In
        </button>
      </p>
    </form>
  );
}
