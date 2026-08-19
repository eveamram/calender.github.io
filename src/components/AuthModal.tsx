import React, { useState } from 'react';
import { X, User, LogIn, ShieldCheck, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  displayName: string;
  isAnonymous: boolean;
  onSignInGoogle: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onUpdateCustomName: (name: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  displayName,
  isAnonymous,
  onSignInGoogle,
  onSignOut,
  onUpdateCustomName,
}) => {
  const [nameInput, setNameInput] = useState(displayName);
  const [isSavingName, setIsSavingName] = useState(false);
  const [authError, setAuthError] = useState('');

  if (!isOpen) return null;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onUpdateCustomName(nameInput.trim());
      setIsSavingName(true);
      setTimeout(() => {
        setIsSavingName(false);
        onClose();
      }, 300);
    }
  };

  const handleGoogleClick = async () => {
    try {
      setAuthError('');
      await onSignInGoogle();
      onClose();
    } catch (err: any) {
      setAuthError(err.message || 'Google Sign-In failed or was closed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-modal-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            User Identity & Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {authError}
            </div>
          )}

          {/* Current Status Pill */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-base">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-xs text-slate-500 font-bold">Active Account</div>
              <div className="text-sm font-extrabold text-slate-900">{displayName}</div>
              <div className="text-[11px] font-semibold text-slate-500">
                {isAnonymous ? 'Firebase Anonymous Session' : 'Firebase Authenticated Account'}
              </div>
            </div>
          </div>

          {/* Customize Display Name */}
          <form onSubmit={handleSaveName} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Display Name for Created Events
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Alex, Sarah, Abbie..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold text-slate-800"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1"
              >
                {isSavingName ? <Check className="w-3.5 h-3.5" /> : 'Save'}
              </button>
            </div>
          </form>

          {/* Google Sign-In */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-3 font-medium">
              Optionally sign in with your Google account to sync identity across browsers:
            </p>

            <button
              type="button"
              onClick={handleGoogleClick}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition-all hover:border-slate-400"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
