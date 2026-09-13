import { useState, type FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface RegisterFormProps {
  onSuccess: () => void;
  onMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSuccess, onMessage, onSwitchToLogin }: RegisterFormProps) {
  const { signUp } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      onMessage({ type: 'error', text: t('auth.passwordTooShort') });
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
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#3D3D3B' }}>{t('auth.displayName')}</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={t('auth.displayNamePlaceholder')}
          className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all"
          style={{ borderColor: '#E5E0D8', background: '#FDFBF6' }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#3D3D3B' }}>{t('auth.email')}</label>
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
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#3D3D3B' }}>{t('auth.password')}</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          placeholder={t('auth.passwordPlaceholder')}
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
        {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
      </button>
      <p className="text-center text-xs" style={{ color: '#9CA3AF' }}>
        {t('auth.hasAccount')}{' '}
        <button type="button" onClick={onSwitchToLogin} className="underline hover:text-current" style={{ color: '#2D5F8A' }}>
          {t('auth.signIn')}
        </button>
      </p>
    </form>
  );
}
