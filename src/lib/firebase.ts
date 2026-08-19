/**
 * Firebase initialization.
 *
 * Reads config from VITE_FIREBASE_* environment variables.
 * If the variables are missing or still set to the placeholder values from
 * .env.example, `isFirebaseConfigured` will be false and the app will show
 * a setup screen instead of silently failing.
 */
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  Auth,
  User,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// ---------------------------------------------------------------------------
// 1. Read environment variables
// ---------------------------------------------------------------------------
const env = import.meta.env;

const firebaseConfig = {
  apiKey:            env.VITE_FIREBASE_API_KEY            ?? '',
  authDomain:        env.VITE_FIREBASE_AUTH_DOMAIN        ?? '',
  projectId:         env.VITE_FIREBASE_PROJECT_ID         ?? '',
  storageBucket:     env.VITE_FIREBASE_STORAGE_BUCKET     ?? '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId:             env.VITE_FIREBASE_APP_ID             ?? '',
};

// ---------------------------------------------------------------------------
// 2. Determine whether we have real credentials
// ---------------------------------------------------------------------------
export const isFirebaseConfigured: boolean = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'your_api_key_here' &&
    firebaseConfig.projectId !== 'your_project_id'
);

// ---------------------------------------------------------------------------
// 3. Initialize Firebase (safe even without real creds – the SDK won't crash,
//    but Firestore calls will fail, which is handled in useEvents)
// ---------------------------------------------------------------------------
let app: FirebaseApp;
if (getApps().length > 0) {
  app = getApp();
} else {
  app = initializeApp(
    isFirebaseConfigured
      ? firebaseConfig
      : { apiKey: 'demo', authDomain: 'demo', projectId: 'demo-project', appId: 'demo' }
  );
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// ---------------------------------------------------------------------------
// 4. Auth helpers
// ---------------------------------------------------------------------------
const googleProvider = new GoogleAuthProvider();

export async function signInAnon(): Promise<User | null> {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (err) {
    console.warn('[firebase] anonymous sign-in failed:', err);
    return null;
  }
}

export async function signInGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('[firebase] Google sign-in failed:', err);
    throw err;
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (err) {
    console.error('[firebase] sign-out failed:', err);
  }
}
