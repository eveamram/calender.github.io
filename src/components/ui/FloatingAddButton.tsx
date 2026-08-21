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
      case 'grocery': return 'Item';
      case 'meals': return 'Meal';
      case 'books': return 'Book';
      default: return 'Item';
    }
  };

  return (
    <div className="fixed bottom-20 right-5 z-30 lg:hidden">
      <button
        onClick={onClick}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-3 rounded-full shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
        aria-label={`Add ${getButtonLabel()}`}
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span className="text-sm tracking-wide font-bold pr-1">{getButtonLabel()}</span>
      </button>
    </div>
  );
};
