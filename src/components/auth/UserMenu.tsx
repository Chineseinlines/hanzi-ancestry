import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { deleteAccount } from '../../lib/database';
import { AuthModal } from './AuthModal';
import { createPortal } from 'react-dom';

export function UserMenu() {
  const { user, profile, loading, configured, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />;
  }

  if (!configured || !user) {
    return (
      <>
        <button
          onClick={() => setShowAuth(true)}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
          style={{ background: '#C23B2A', color: '#fff' }}
        >
          Sign In
        </button>
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      </>
    );
  }

  const handleDeleteAccount = async () => {
    setDeleting(true);
    // Clear local data
    localStorage.removeItem('hanzi-favorites');
    localStorage.removeItem('hanzi-folders');
    // Delete from Supabase
    const { error } = await deleteAccount();
    if (error) {
      console.error('Delete account failed:', error);
      setDeleting(false);
      setShowDeleteConfirm(false);
      return;
    }
    // Sign out (account is already deleted on server)
    await signOut();
    setDeleting(false);
    setShowDeleteConfirm(false);
    setShowDropdown(false);
  };

  const initial = (profile?.display_name || user.email || '?')[0].toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm transition-all hover:opacity-80"
        style={{ background: '#2D5F8A' }}
      >
        {initial}
      </button>

      {showDropdown && (
        <div
          className="absolute right-0 top-11 w-56 rounded-xl shadow-xl border py-2 z-50 animate-in"
          style={{ background: '#fff', borderColor: '#E5E0D8' }}
        >
          <div className="px-4 py-2 border-b" style={{ borderColor: '#E5E0D8' }}>
            <p className="text-sm font-semibold truncate" style={{ color: '#1A1A18' }}>
              {profile?.display_name || user.email?.split('@')[0]}
            </p>
            <p className="text-xs truncate" style={{ color: '#9CA3AF' }}>{user.email}</p>
          </div>

          <a
            href="/#/profile"
            className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
            style={{ color: '#3D3D3B' }}
            onClick={() => setShowDropdown(false)}
          >
            📊 My Profile
          </a>

          {(profile?.role === 'teacher' || profile?.role === 'admin') && (
            <a
              href="/#/admin"
              className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
              style={{ color: '#3D3D3B' }}
              onClick={() => setShowDropdown(false)}
            >
              🏫 Admin Dashboard
            </a>
          )}

          <div className="border-t mt-1 pt-1" style={{ borderColor: '#E5E0D8' }}>
            <button
              onClick={() => { signOut(); setShowDropdown(false); }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
              style={{ color: '#C23B2A' }}
            >
              Sign Out
            </button>
          </div>

          <div className="border-t mt-1 pt-1" style={{ borderColor: '#E5E0D8' }}>
            <button
              onClick={() => { setShowDeleteConfirm(true); setShowDropdown(false); }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 transition-colors"
              style={{ color: '#9CA3AF' }}
            >
              🗑 Delete Account
            </button>
          </div>
        </div>
      )}

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 overflow-y-auto py-8"
          style={{ zIndex: 9999 }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-sm mx-4"
            style={{ fontFamily: 'Inter' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#1A1A18' }}>
              Delete Account?
            </h3>
            <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
              This will permanently delete your account, all learning records, favorites, and data. Your email will become available for a new account. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border"
                style={{ borderColor: '#E5E0D8', color: '#3D3D3B' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: '#C23B2A' }}
              >
                {deleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
