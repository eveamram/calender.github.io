import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { AppTab } from '../../types';
import {
  Calendar,
  BookOpen,
  CheckSquare,
  Sparkles,
  MoreHorizontal,
  ShoppingBag,
  Utensils,
  BookMarked,
  X,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useStore();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const primaryTabs: { tab: AppTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'calendar', label: 'Calendar', icon: <Calendar className="w-5 h-5" /> },
    { tab: 'classes', label: 'Classes', icon: <BookOpen className="w-5 h-5" /> },
    { tab: 'todo', label: 'To-Do', icon: <CheckSquare className="w-5 h-5" /> },
    { tab: 'habits', label: 'Habits', icon: <Sparkles className="w-5 h-5" /> },
  ];

  const secondaryTabs: { tab: AppTab; label: string; desc: string; icon: React.ReactNode }[] = [
    { tab: 'grocery', label: 'Grocery', desc: 'Shared store checklist', icon: <ShoppingBag className="w-5 h-5 text-emerald-600" /> },
    { tab: 'meals', label: 'Meals', desc: 'Weekly meal planner', icon: <Utensils className="w-5 h-5 text-amber-600" /> },
    { tab: 'books', label: 'Books', desc: 'Reading & wishlist tracker', icon: <BookMarked className="w-5 h-5 text-indigo-600" /> },
  ];

  const isSecondaryActive = secondaryTabs.some((t) => t.tab === activeTab);

  return (
    <>
      {/* Fixed Bottom Bar on Mobile/Tablet */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1 shadow-lg shadow-slate-950/5 safe-bottom">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {primaryTabs.map((t) => {
            const isActive = activeTab === t.tab;
            return (
              <button
                key={t.tab}
                onClick={() => {
                  setActiveTab(t.tab);
                  setShowMoreMenu(false);
                }}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all touch-target ${
                  isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t.icon}
                <span className="text-[11px] mt-1">{t.label}</span>
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setShowMoreMenu((prev) => !prev)}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all touch-target ${
              isSecondaryActive || showMoreMenu ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[11px] mt-1">More</span>
          </button>
        </div>
      </nav>

      {/* More Menu Sheet */}
      {showMoreMenu && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setShowMoreMenu(false)}
          />
          <div className="relative bg-white rounded-t-3xl p-6 border-t border-slate-200 shadow-2xl animate-slide-up max-w-lg mx-auto w-full">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">More Tools</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 pb-4">
              {secondaryTabs.map((t) => {
                const isActive = activeTab === t.tab;
                return (
                  <button
                    key={t.tab}
                    onClick={() => {
                      setActiveTab(t.tab);
                      setShowMoreMenu(false);
                    }}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                      isActive
                        ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-xs'
                        : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-white shadow-xs border border-slate-200/50">
                      {t.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{t.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{t.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
