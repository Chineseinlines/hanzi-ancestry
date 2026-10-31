import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { AuthAlert } from './AuthAlert';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

type Mode = 'login' | 'register';
type Message = { type: 'success' | 'error'; text: string } | null;

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [message, setMessage] = useState<Message>(null);
  const { user, configured } = useAuth();
  const { t, lang } = useLanguage();

  // 打开时同步初始模式并清空上一次的消息
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setMessage(null);
    }
  }, [isOpen, initialMode]);

  // 登录成功后自动关闭
  useEffect(() => {
    if (user && isOpen) onClose();
  }, [user, isOpen, onClose]);

  // ESC 关闭，并在打开期间锁定页面滚动
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setMessage(null);
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 overflow-y-auto bg-[#1A1A18]/55 backdrop-blur-[3px]"
          style={{ zIndex: 9999 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        >
          <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-[420px] overflow-hidden rounded-[26px] border border-[#E7DFCE] shadow-[0_28px_70px_-18px_rgba(26,26,24,0.5)]"
            style={{ background: 'linear-gradient(180deg,#FFFDF9 0%,#F8F3E9 100%)' }}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#C23B2A,#E85D4A 45%,#C4A265)' }} />

            <button
              onClick={onClose}
              aria-label={lang === 'zh' ? '关闭' : 'Close'}
              className="absolute right-3.5 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#9A9384] transition-colors hover:bg-[#EFE8DA] hover:text-[#3D3D3B]"
            >
              <X size={17} />
            </button>

            <div className="px-6 pb-6 pt-5 sm:px-8">
              {/* 品牌标识 */}
              <div className="mb-5 flex items-center gap-2.5">
                <img
                  src={`${import.meta.env.BASE_URL}lines-logo.jpg`}
                  alt="字里行间 LINES"
                  className="h-10 w-auto rounded-lg bg-white object-contain px-1.5 py-0.5 shadow-sm"
                />
              </div>

              {!configured ? (
                <div className="py-4 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: '#F6F2E8', color: '#C4A265' }}>
                    <Settings2 size={26} />
                  </div>
                  <h2 className="mb-1.5 text-base font-semibold" style={{ color: '#1A1A18' }}>
                    {t('auth.backendNotConfigured')}
                  </h2>
                  <p className="mx-auto max-w-[300px] text-[13px] leading-relaxed" style={{ color: '#8A8577' }}>
                    {t('auth.backendNotConfiguredDesc')}
                  </p>
                </div>
              ) : (
                <>
                  {/* 登录 / 注册 分段切换 */}
                  <div className="mb-4 grid grid-cols-2 rounded-2xl p-1" style={{ background: '#EFE9DC' }}>
                    {(['login', 'register'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => switchMode(m)}
                        className="relative rounded-xl py-2 text-sm font-medium transition-colors"
                        style={{ color: mode === m ? '#1A1A18' : '#8A8577' }}
                      >
                        {mode === m && (
                          <motion.span
                            layoutId="authTabPill"
                            className="absolute inset-0 rounded-xl bg-white shadow-[0_1px_3px_rgba(26,26,24,0.12)]"
                            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                          />
                        )}
                        <span className="relative">{m === 'login' ? t('auth.signIn') : t('auth.register')}</span>
                      </button>
                    ))}
                  </div>

                  <p className="mb-4 text-[13px] leading-relaxed" style={{ color: '#8A8577' }}>
                    {mode === 'login' ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
                  </p>

                  {message && (
                    <div className="mb-4">
                      <AuthAlert kind={message.type === 'success' ? 'success' : 'error'}>{message.text}</AuthAlert>
                    </div>
                  )}

                  {mode === 'login' ? (
                    <LoginForm
                      onSuccess={onClose}
                      onMessage={setMessage}
                      onSwitchToRegister={() => switchMode('register')}
                    />
                  ) : (
                    <RegisterForm
                      onSuccess={() => {
                        setMessage({ type: 'success', text: t('auth.accountCreated') });
                        setMode('login');
                      }}
                      onMessage={setMessage}
                      onSwitchToLogin={() => switchMode('login')}
                    />
                  )}
                </>
              )}
            </div>
          </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}