import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInAnonymouslyUser, signInWithGoogle, signOutUser } from '../lib/firebase';

export interface UseAuthReturn {
  user: User | null;
  displayName: string;
  isAnonymous: boolean;
  loading: boolean;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateCustomName: (name: string) => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [customName, setCustomName] = useState<string>(() => {
    return localStorage.getItem('shared_cal_user_name') || '';
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        // Auto sign in anonymously if not authenticated
        signInAnonymouslyUser()
          .then((anonUser) => {
            setUser(anonUser);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignInGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Failed to sign in with Google:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
  };

  const updateCustomName = (name: string) => {
    setCustomName(name);
    localStorage.setItem('shared_cal_user_name', name);
  };

  const resolvedDisplayName =
    customName ||
    user?.displayName ||
    (user?.isAnonymous ? `Guest (${user.uid.slice(0, 5)})` : user?.email || 'Anonymous');

  return {
    user,
    displayName: resolvedDisplayName,
    isAnonymous: user?.isAnonymous ?? true,
    loading,
    signInGoogle: handleSignInGoogle,
    signOut: handleSignOut,
    updateCustomName,
  };
}
