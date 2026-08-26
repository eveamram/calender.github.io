import React from 'react';
import { Plus } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface FloatingAddButtonProps {
  onClick: () => void;
}

export const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ onClick }) => {
  const { activeTab } = useStore();

  const getButtonLabel = () => {
    switch (activeTab) {
      case 'calendar': return 'Event';
      case 'classes': return 'Class';
      case 'todo': return 'Task';
      case 'habits': return 'Habit';
      case 'meals': return 'Meal';
      case 'books': return 'Book';
      default: return 'Item';
    }
  };

  return (
    <div className="fixed right-4 z-30 lg:hidden" style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}>
      <button
        onClick={onClick}
        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-3 min-h-[48px] rounded-full shadow-lg shadow-slate-900/25 active:scale-95 transition-all"
        aria-label={`Add ${getButtonLabel()}`}
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span className="text-sm tracking-wide font-bold pr-1">{getButtonLabel()}</span>
      </button>
    </div>
  );
};
