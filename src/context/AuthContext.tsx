import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: { id: string; email: string } | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  switchUserPersona: (name: 'Eve' | 'Abbie') => void;
  signOut: () => Promise<void>;
}

const DEFAULT_PROFILES: Record<'Eve' | 'Abbie', UserProfile> = {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePersona, setActivePersona] = useState<'Eve' | 'Abbie'>(() => {
    return (localStorage.getItem('calender_active_persona') as 'Eve' | 'Abbie') || 'Eve';
  });

  const userProfile = DEFAULT_PROFILES[activePersona];
  const user = { id: userProfile.id, email: userProfile.email };

  const switchUserPersona = (name: 'Eve' | 'Abbie') => {
    setActivePersona(name);
    localStorage.setItem('calender_active_persona', name);
  };

  const signOut = async () => {
    // Soft reset
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
