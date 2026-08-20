import React from 'react';
import { Calendar as CalendarIcon, Plus, Sparkles, RefreshCw, GraduationCap } from 'lucide-react';

interface HeaderProps {
  displayName: string;
  isAnonymous: boolean;
  activeTab: 'calendar' | 'schedule';
  setActiveTab: (tab: 'calendar' | 'schedule') => void;
  onOpenNewEvent: () => void;
  onSeedData: () => void;
  isSeeding: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  displayName,
  isAnonymous,
  activeTab,
  setActiveTab,
  onOpenNewEvent,
  onSeedData,
  isSeeding,
}) => (
  <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <CalendarIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Shared Calendar
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-300/50 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
            </span>
          </h1>
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block">Google Sheets Sync · Shared across all devices</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'calendar'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5 text-blue-600" /> Calendar
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'schedule'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-rose-600" /> Class & Exams
        </button>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <button
          onClick={onSeedData}
          disabled={isSeeding}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 shadow-xs transition-colors disabled:opacity-50"
        >
          {isSeeding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
          <span className="hidden md:inline">Seed Data</span>
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <span className="max-w-[100px] truncate font-semibold">{displayName}</span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isAnonymous ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-700'}`}>
            {isAnonymous ? 'Anon' : '✓'}
          </span>
        </div>

        <button
          onClick={onOpenNewEvent}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" /> New Event
        </button>
      </div>
    </div>
  </header>
);
