import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProfile } from '../lib/auth';
import { getProfile, signIn as authSignIn, signUp as authSignUp, signOut as authSignOut } from '../lib/auth';
import { syncFavoritesToCloud, fetchFavorites } from '../lib/database';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  // Load profile for a user
  const loadProfile = useCallback(async (userId: string) => {
    const p = await getProfile(userId);
    setProfile(p);
  }, []);

  // Sync localStorage favorites to cloud on login
  const syncLocalFavorites = useCallback(async (userId: string) => {
    try {
      const raw = localStorage.getItem('hanzi-favorites');
      if (!raw) return;
      const local = JSON.parse(raw) as { char: string; addedAt: number; folder: string }[];
      if (local.length === 0) return;

      // Sync local → cloud
      await syncFavoritesToCloud(userId, local);

      // Merge cloud → local (cloud wins on duplicates)
      const cloud = await fetchFavorites(userId);
      if (cloud.length > 0) {
        const merged = new Map<string, { char: string; addedAt: number; folder: string }>();
        // Local first
        local.forEach(f => merged.set(f.char, f));
        // Cloud overrides (newer data)
        cloud.forEach(f => merged.set(f.char, {
          char: f.char,
          folder: f.folder,
          addedAt: new Date(f.added_at || Date.now()).getTime(),
        }));
        localStorage.setItem('hanzi-favorites', JSON.stringify([...merged.values()]));
      }
    } catch (e) {
      console.warn('Failed to sync local favorites:', e);
    }
  }, []);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadProfile(data.session.user.id);
        syncLocalFavorites(data.session.user.id);
      }
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        loadProfile(newSession.user.id);
        if (_event === 'SIGNED_IN') {
          syncLocalFavorites(newSession.user.id);
        }
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [configured, loadProfile, syncLocalFavorites]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await authSignIn(email, password);
    return { error: error?.message };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    const { error } = await authSignUp(email, password, displayName);
    return { error: error?.message };
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [user, loadProfile]);

  return (
    <AuthContext.Provider value={{
      user, profile, session, loading, configured,
      signIn, signUp, signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
