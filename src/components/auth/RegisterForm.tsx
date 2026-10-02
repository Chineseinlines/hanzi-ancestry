import { useState, type FormEvent } from 'react';
import { User, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { AuthField } from './AuthField';
import { authErrorKey } from '../../lib/authErrors';

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

    try {
      const { error } = await signUp(email.trim(), password, displayName.trim() || undefined);
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
        id="auth-register-name"
        label={t('auth.displayName')}
        icon={<User size={16} />}
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        autoComplete="nickname"
        placeholder={t('auth.displayNamePlaceholder')}
      />
      <AuthField
        id="auth-register-email"
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
        id="auth-register-password"
        label={t('auth.password')}
        icon={<Lock size={16} />}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
        autoComplete="new-password"
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
            {t('auth.creatingAccount')}
          </>
        ) : (
          <>
            {t('auth.createAccount')}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      <p className="pt-1 text-center text-[13px]" style={{ color: '#8A8577' }}>
        {t('auth.hasAccount')}{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-medium underline-offset-4 hover:underline"
          style={{ color: '#C23B2A' }}
        >
          {t('auth.signIn')}
        </button>
      </p>
    </form>
  );
}