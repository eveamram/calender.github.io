import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, PROFILE_COLORS } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  signUp: (email: string, pass: string, displayName: string, color: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (displayName: string, color: string) => Promise<void>;
  enableDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_A: UserProfile = {
  id: 'demo-user-1',
  email: 'alex@example.com',
  display_name: 'Alex (Friend A)',
  profile_color: '#3B82F6',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured());

  const fetchProfile = async (userId: string, emailStr?: string) => {
    if (!isSupabaseConfigured()) return;
    try {
      const { data, error } = await supabase
        .from('calendar_members')
        .select('display_name, profile_color')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      if (data) {
        setUserProfile({
          id: userId,
          email: emailStr || user?.email || '',
          display_name: data.display_name,
          profile_color: data.profile_color,
        });
      } else {
        // Default fallback metadata from auth user
        const meta = user?.user_metadata || {};
        setUserProfile({
          id: userId,
          email: emailStr || user?.email || '',
          display_name: meta.display_name || emailStr?.split('@')[0] || 'Student',
          profile_color: meta.profile_color || PROFILE_COLORS[0],
        });
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsDemoMode(true);
      setUserProfile(DEMO_USER_A);
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      }
      setLoading(false);
    });

    // Listen to Auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, pass: string, displayName: string, color: string) => {
    if (!isSupabaseConfigured()) {
      const demoProf: UserProfile = {
        id: 'demo-user-' + Date.now(),
        email,
        display_name: displayName,
        profile_color: color,
      };
      setUserProfile(demoProf);
      return { error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          display_name: displayName,
          profile_color: color,
        },
      },
    });

    if (!error && data.user) {
      setUserProfile({
        id: data.user.id,
        email: data.user.email || email,
        display_name: displayName,
        profile_color: color,
      });
    }

    return { error: error as Error | null };
  };

  const signIn = async (email: string, pass: string) => {
    if (!isSupabaseConfigured()) {
      setUserProfile({
        id: 'demo-user-1',
        email,
        display_name: email.split('@')[0] || 'Friend',
        profile_color: PROFILE_COLORS[0],
      });
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      setUserProfile(null);
      return;
    }
    await supabase.auth.signOut();
    setUserProfile(null);
  };

  const updateProfile = async (displayName: string, color: string) => {
    if (userProfile) {
      const updated = { ...userProfile, display_name: displayName, profile_color: color };
      setUserProfile(updated);

      if (isSupabaseConfigured() && user) {
        await supabase.from('calendar_members').update({
          display_name: displayName,
          profile_color: color,
        }).eq('user_id', user.id);

        await supabase.auth.updateUser({
          data: { display_name: displayName, profile_color: color },
        });
      }
    }
  };

  const enableDemoMode = () => {
    setIsDemoMode(true);
    setUserProfile(DEMO_USER_A);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userProfile,
        loading,
        isDemoMode,
        signUp,
        signIn,
        signOut,
        updateProfile,
        enableDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
