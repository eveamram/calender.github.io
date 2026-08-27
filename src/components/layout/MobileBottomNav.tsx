import React from 'react';
import { useStore } from '../../context/StoreContext';
import { AppTab } from '../../types';
import {
  Calendar,
  BookOpen,
  CheckSquare,
  Sparkles,
  BookMarked,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenAddModal?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = () => {
  const { activeTab, setActiveTab } = useStore();

  const navItems: { tab: AppTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'calendar', label: 'Calendar', icon: <Calendar className="w-5 h-5" /> },
    { tab: 'classes', label: 'Classes', icon: <BookOpen className="w-5 h-5" /> },
    { tab: 'todo', label: 'To-Do', icon: <CheckSquare className="w-5 h-5" /> },
    { tab: 'habits', label: 'Habits', icon: <Sparkles className="w-5 h-5" /> },
    { tab: 'books', label: 'Books', icon: <BookMarked className="w-5 h-5" /> },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-1.5 pt-2 shadow-2xl"
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => setActiveTab(item.tab)}
              className={`flex flex-col items-center justify-center py-1.5 px-1.5 sm:px-3 rounded-2xl min-w-[52px] min-h-[48px] transition-all cursor-pointer ${
                isActive
                  ? 'text-white bg-slate-900 shadow-sm scale-105 font-black'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-semibold'
              }`}
            >
              {item.icon}
              <span className="text-[10px] mt-0.5 tracking-tight leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
