import React from 'react';
import { Calendar as CalendarIcon, Plus, Sparkles, User as UserIcon, LogIn, LogOut, RefreshCw } from 'lucide-react';

interface HeaderProps {
  displayName: string;
  isAnonymous: boolean;
  onOpenNewEventModal: () => void;
  onOpenAuthModal: () => void;
  onSeedData: () => void;
  onSignOut: () => void;
  isSeeding?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  displayName,
  isAnonymous,
  onOpenNewEventModal,
  onOpenAuthModal,
  onSeedData,
  onSignOut,
  isSeeding,
}) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Shared Calendar
              <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-300/50 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Real-time collaborative scheduling powered by Firestore
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Seed Sample Events Button */}
          <button
            type="button"
            onClick={onSeedData}
            disabled={isSeeding}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors border border-slate-200 shadow-2xs disabled:opacity-50"
            title="Add sample events to Firestore for instant testing"
          >
            {isSeeding ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span className="hidden md:inline">Seed Sample Data</span>
          </button>

          {/* User Profile Badge */}
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all"
            title="Manage Identity & Sign-In"
          >
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-2xs">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="max-w-[120px] truncate font-semibold text-slate-800">
              {displayName}
            </span>
            {isAnonymous ? (
              <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                Anon
              </span>
            ) : (
              <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded">
                Verified
              </span>
            )}
          </button>

          {!isAnonymous && (
            <button
              type="button"
              onClick={onSignOut}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

          {/* Add New Event Button */}
          <button
            type="button"
            onClick={onOpenNewEventModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            New Event
          </button>
        </div>
      </div>
    </header>
  );
};
