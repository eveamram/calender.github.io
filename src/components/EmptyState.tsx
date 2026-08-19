import React from 'react';
import { CalendarX, Plus, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  category: string;
  onOpenCreate: () => void;
  onSeedData: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ category, onOpenCreate, onSeedData }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center my-4 shadow-2xs">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
        <CalendarX className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-extrabold text-slate-800 tracking-tight mb-1">
        No events found {category !== 'All' ? `in "${category}"` : 'on the calendar'}
      </h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6 font-medium">
        Get started by creating a new collaborative event or seeding sample items to see real-time synchronization in action.
      </p>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={onOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create First Event
        </button>

        <button
          type="button"
          onClick={onSeedData}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-200"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          Seed Sample Events
        </button>
      </div>
    </div>
  );
};
