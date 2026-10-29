import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Profile, UserRole } from '../types/crm.types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default mock profile for local UI development when Supabase is not yet connected
const DEMO_PROFILE: Profile = {
  id: '00000000-0000-0000-0000-000000000001',
  full_name: 'Admissions Counsellor (Demo)',
  role: 'counsellor',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(isSupabaseConfigured() ? null : DEMO_PROFILE);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured());
  const isConfigured = isSupabaseConfigured();

  const fetchProfile = useCallback(async (userId: string, defaultName?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Profile fetch warning (new profile or migration pending):', error.message);
      }

      if (data) {
        setProfile(data as Profile);
      } else {
        // Fallback default profile with least privileged role
        setProfile({
          id: userId,
          full_name: defaultName || 'Counsellor',
          role: 'counsellor',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }, []);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // 1. Check active session once on mount
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!isMounted) return;
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) {
        const name = initialSession.user.user_metadata?.full_name || initialSession.user.email?.split('@')[0];
        fetchProfile(initialSession.user.id, name);
      }
      setLoading(false);
    });

    // 2. Listen to auth state transitions
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        const name = currentSession.user.user_metadata?.full_name || currentSession.user.email?.split('@')[0];
        fetchProfile(currentSession.user.id, name);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isConfigured, fetchProfile]);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!isConfigured) {
      return { error: 'Supabase is not configured yet. Please configure your .env file.' };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        const name = data.user.user_metadata?.full_name || data.user.email?.split('@')[0];
        await fetchProfile(data.user.id, name);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'An unexpected error occurred during sign-in' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ error: string | null }> => {
    if (!isConfigured) {
      return { error: 'Supabase is not configured yet. Please configure your .env file.' };
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) return { error: error.message };
      if (data.user) {
        await fetchProfile(data.user.id);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'An unexpected error occurred during account creation' };
    }
  };

  const signOut = async (): Promise<void> => {
    if (!isConfigured) {
      setProfile(DEMO_PROFILE);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const refreshProfile = async (): Promise<void> => {
    if (user) {
      const name = user.user_metadata?.full_name || user.email?.split('@')[0];
      await fetchProfile(user.id, name);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isConfigured,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
