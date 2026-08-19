import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInAnon, signInGoogle, signOutUser, isFirebaseConfigured } from '../lib/firebase';

export interface AuthState {
  user: User | null;
  displayName: string;
  isAnonymous: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setCustomName: (name: string) => void;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [customName, setCustomNameState] = useState(() =>
    localStorage.getItem('shared_cal_display_name') || ''
  );

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setLoading(false);
      } else {
        // Auto-sign-in anonymously
        signInAnon().then((anon) => {
          setUser(anon);
          setLoading(false);
        });
      }
    });
    return () => unsub();
  }, []);

  const displayName =
    customName ||
    user?.displayName ||
    (user?.isAnonymous ? `Guest-${user.uid.slice(0, 5)}` : 'Anonymous');

  return {
    user,
    displayName,
    isAnonymous: user?.isAnonymous ?? true,
    loading,
    signInWithGoogle: async () => {
      await signInGoogle();
    },
    signOut: async () => {
      await signOutUser();
    },
    setCustomName: (name: string) => {
      setCustomNameState(name);
      localStorage.setItem('shared_cal_display_name', name);
    },
  };
}
