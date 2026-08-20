import { useState, useEffect } from 'react';

export interface AuthState {
  user: { uid: string } | null;
  displayName: string;
  isAnonymous: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setCustomName: (name: string) => void;
}

export function useAuth(): AuthState {
  const [displayName, setDisplayName] = useState<string>(() => {
    return localStorage.getItem('shared_cal_display_name') || 'Eve';
  });

  useEffect(() => {
    localStorage.setItem('shared_cal_display_name', displayName);
  }, [displayName]);

  return {
    user: { uid: `user-${displayName.toLowerCase()}` },
    displayName,
    isAnonymous: false,
    loading: false,
    signInWithGoogle: async () => {
      // Not needed for Google Sheet shared calendar
    },
    signOut: async () => {
      // Toggle persona for testing/demonstration
      const nextName = displayName === 'Eve' ? 'Abbie' : 'Eve';
      setDisplayName(nextName);
    },
    setCustomName: (name: string) => {
      setDisplayName(name);
    },
  };
}
