import React, { createContext, useContext, useState } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: { id: string; email: string } | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  switchUserPersona: (name: 'Eve' | 'Abbie') => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<Record<'Eve' | 'Abbie', UserProfile>>(() => {
    const saved = localStorage.getItem('calender_user_profiles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      Eve: {
        id: 'user-eve-1',
        email: 'eve@calender.app',
        display_name: 'Eve',
        profile_color: '#3B82F6',
      },
      Abbie: {
        id: 'user-abbie-2',
        email: 'abbie@calender.app',
        display_name: 'Abbie',
        profile_color: '#EC4899',
      },
    };
  });

  const [activePersona, setActivePersona] = useState<'Eve' | 'Abbie'>(() => {
    return (localStorage.getItem('calender_active_persona') as 'Eve' | 'Abbie') || 'Eve';
  });

  const userProfile = profiles[activePersona];
  const user = { id: userProfile.id, email: userProfile.email };

  const switchUserPersona = (name: 'Eve' | 'Abbie') => {
    setActivePersona(name);
    localStorage.setItem('calender_active_persona', name);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfiles((prev) => {
      const next = {
        ...prev,
        [activePersona]: {
          ...prev[activePersona],
          ...updates,
        },
      };
      localStorage.setItem('calender_user_profiles', JSON.stringify(next));
      return next;
    });
  };

  const signOut = async () => {
    switchUserPersona('Eve');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading: false,
        isDemoMode: true,
        switchUserPersona,
        updateProfile,
        signOut,
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
