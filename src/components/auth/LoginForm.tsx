import { useState, type FormEvent } from 'react';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { AuthField } from './AuthField';
import { authErrorKey } from '../../lib/authErrors';

interface LoginFormProps {
  onSuccess: () => void;
  onMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSuccess, onMessage, onSwitchToRegister }: LoginFormProps) {
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onMessage(null);

    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        onMessage({ type: 'error', text: t(authErrorKey(error)) });
      } else {
        onSuccess();
      }
    } catch (err) {
      onMessage({ type: 'error', text: t(authErrorKey(err instanceof Error ? err.message : String(err))) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <AuthField
        id="auth-login-email"
        label={t('auth.email')}
        icon={<Mail size={16} />}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
        placeholder={t('auth.emailPlaceholder')}
      />
      <AuthField
        id="auth-login-password"
        label={t('auth.password')}
        icon={<Lock size={16} />}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
        autoComplete="current-password"
        placeholder={t('auth.passwordPlaceholder')}
        revealLabels={{ show: t('auth.showPassword'), hide: t('auth.hidePassword') }}
      />

      <button
        type="submit"
        disabled={loading}
        className="group mt-1 flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-semibold text-white transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg,#C23B2A,#A62E1F)', boxShadow: '0 10px 22px -10px rgba(194,59,42,0.75)' }}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {t('auth.signingIn')}
          </>
        ) : (
          <>
            {t('auth.signIn')}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      <p className="pt-1 text-center text-[13px]" style={{ color: '#8A8577' }}>
        {t('auth.noAccount')}{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-medium underline-offset-4 hover:underline"
          style={{ color: '#C23B2A' }}
        >
          {t('auth.register')}
        </button>
      </p>
    </form>
  );
}