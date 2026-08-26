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
  Settings,
  X,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenAddModal?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = () => {
  const { activeTab, setActiveTab, setIsSettingsOpen } = useStore();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainNavItems: { tab: AppTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'calendar', label: 'Calendar', icon: <Calendar className="w-5 h-5" /> },
    { tab: 'classes', label: 'Classes', icon: <BookOpen className="w-5 h-5" /> },
    { tab: 'todo', label: 'To-Do', icon: <CheckSquare className="w-5 h-5" /> },
    { tab: 'habits', label: 'Habits', icon: <Sparkles className="w-5 h-5" /> },
  ];

  const moreNavItems: { tab: AppTab; label: string; desc: string; icon: React.ReactNode }[] = [
    { tab: 'meals', label: 'Meal Planner', desc: 'Weekly menu (Breakfast, Lunch, Dinner, Snacks)', icon: <Utensils className="w-5 h-5 text-amber-600" /> },
    { tab: 'books', label: 'Reading Shelf', desc: 'Book tracker & reading sanctuary', icon: <BookMarked className="w-5 h-5 text-purple-600" /> },
  ];

  const isMoreActive = moreNavItems.some((t) => t.tab === activeTab);

  return (
    <>
      {/* Fixed Bottom Nav Bar on Mobile/Tablet */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 pt-2 shadow-2xl"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {mainNavItems.map((item) => {
            const isActive = activeTab === item.tab && !showMoreMenu;
            return (
              <button
                key={item.tab}
                onClick={() => {
                  setActiveTab(item.tab);
                  setShowMoreMenu(false);
                }}
                className={`flex flex-col items-center justify-center py-1.5 px-2 sm:px-3 rounded-2xl min-w-[56px] min-h-[48px] transition-all cursor-pointer ${
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

          {/* 5th Tab: More */}
          <button
            onClick={() => setShowMoreMenu((prev) => !prev)}
            className={`flex flex-col items-center justify-center py-1.5 px-2 sm:px-3 rounded-2xl min-w-[56px] min-h-[48px] transition-all cursor-pointer ${
              isMoreActive || showMoreMenu
                ? 'text-white bg-slate-900 shadow-sm scale-105 font-black'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-semibold'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight leading-none">More</span>
          </button>
        </div>
      </nav>

      {/* More Menu Bottom Sheet Overlay */}
      {showMoreMenu && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          {/* Backdrop click to close */}
          <div className="fixed inset-0" onClick={() => setShowMoreMenu(false)} />

          <div
            className="relative bg-white rounded-t-[28px] p-5 border-t border-slate-200 shadow-2xl animate-slide-up max-w-lg mx-auto w-full space-y-4"
            style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-sm">✨</span>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">More Apps & Tools</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Meals, Books & Settings</p>
                </div>
              </div>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Menu List */}
            <div className="space-y-2.5">
              {moreNavItems.map((item) => {
                const isActive = activeTab === item.tab;
                return (
                  <button
                    key={item.tab}
                    onClick={() => {
                      setActiveTab(item.tab);
                      setShowMoreMenu(false);
                    }}
                    className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-50 border-2 border-slate-900 text-slate-900 font-bold shadow-xs ring-1 ring-slate-900/10'
                        : 'bg-slate-50/80 border border-slate-200/80 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className={`p-2 rounded-xl bg-white shadow-2xs border shrink-0 ${isActive ? 'border-slate-900' : 'border-slate-200/60'}`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-extrabold text-slate-900 flex items-center justify-between">
                        <span>{item.label}</span>
                        {isActive && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-900 bg-slate-200/80 px-2 py-0.5 rounded-full border border-slate-300">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-medium truncate text-slate-500">{item.desc}</div>
                    </div>
                  </button>
                );
              })}

              {/* Settings Option */}
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  setIsSettingsOpen(true);
                }}
                className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200 bg-slate-100/90 hover:bg-slate-200/80 text-left transition-all cursor-pointer"
              >
                <div className="p-2 rounded-xl bg-white shadow-2xs border border-slate-200/60 shrink-0">
                  <Settings className="w-5 h-5 text-slate-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-extrabold text-slate-900">App Settings & Data Reset</div>
                  <div className="text-[11px] text-slate-500 font-medium truncate">Customize persona colors & sync</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
