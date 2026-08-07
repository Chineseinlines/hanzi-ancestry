import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { user, configured } = useAuth();

  // Auto-close when user becomes authenticated
  useEffect(() => {
    if (user && isOpen) {
      onClose();
    }
  }, [user]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/40 overflow-y-auto py-8"
          style={{ zIndex: 9999 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md mx-4 my-auto"
            style={{ fontFamily: 'Inter' }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
        {!configured ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-4">⚙️</div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: '#1A1A18' }}>Backend Not Configured</h2>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              Supabase connection is not set up yet. Please configure your environment variables.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setMode('login')}
                  className={`text-lg font-semibold pb-1 border-b-2 transition-colors ${
                    mode === 'login' ? 'border-current' : 'border-transparent'
                  }`}
                  style={{ color: mode === 'login' ? '#C23B2A' : '#9CA3AF' }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setMode('register')}
                  className={`text-lg font-semibold pb-1 border-b-2 transition-colors ${
                    mode === 'register' ? 'border-current' : 'border-transparent'
                  }`}
                  style={{ color: mode === 'register' ? '#C23B2A' : '#9CA3AF' }}
                >
                  Register
                </button>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`text-sm p-3 rounded-lg mb-4 ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Forms */}
            {mode === 'login' ? (
              <LoginForm
                onSuccess={() => onClose()}
                onMessage={setMessage}
                onSwitchToRegister={() => setMode('register')}
              />
            ) : (
              <RegisterForm
                onSuccess={() => { setMessage({ type: 'success', text: 'Account created! You can now sign in.' }); setMode('login'); }}
                onMessage={setMessage}
                onSwitchToLogin={() => setMode('login')}
              />
            )}
          </>
        )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
