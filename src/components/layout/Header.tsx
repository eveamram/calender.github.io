import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { AppTab, ProfilePersona } from '../../types';
import {
  Calendar,
  BookOpen,
  CheckSquare,
  Sparkles,
  ShoppingBag,
  Utensils,
  BookMarked,
  User,
  Users,
  Plus,
  Palette,
  X,
  Settings,
  RotateCcw,
  Heart,
  ShieldCheck,
} from 'lucide-react';

interface HeaderProps {
  onOpenAddModal: () => void;
}

const PERSONA_COLORS = [
  { label: 'Royal Blue', hex: '#2563eb' },
  { label: 'Vibrant Pink', hex: '#ec4899' },
  { label: 'Purple', hex: '#7c3aed' },
  { label: 'Emerald', hex: '#059669' },
  { label: 'Rose', hex: '#e11d48' },
  { label: 'Amber', hex: '#d97706' },
  { label: 'Cyan', hex: '#0891b2' },
  { label: 'Indigo', hex: '#4f46e5' },
];

export const Header: React.FC<HeaderProps> = ({ onOpenAddModal }) => {
  const {
    activeProfile,
    setActiveProfile,
    activeTab,
    setActiveTab,
    profileColors,
    setProfileColor,
    setIsSettingsOpen,
  } = useStore();

  const [colorPickerTarget, setColorPickerTarget] = useState<ProfilePersona | null>(null);

  const navItems: { tab: AppTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { tab: 'classes', label: 'Classes', icon: <BookOpen className="w-4 h-4" /> },
    { tab: 'todo', label: 'To-Do', icon: <CheckSquare className="w-4 h-4" /> },
    { tab: 'habits', label: 'Habits', icon: <Sparkles className="w-4 h-4" /> },
    { tab: 'grocery', label: 'Grocery', icon: <ShoppingBag className="w-4 h-4" /> },
    { tab: 'meals', label: 'Meals', icon: <Utensils className="w-4 h-4" /> },
    { tab: 'books', label: 'Books', icon: <BookMarked className="w-4 h-4" /> },
  ];

  const profiles: ProfilePersona[] = ['Eve', 'Abbie', 'Both'];

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: White Logo Badge & Desktop Navigation */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('calendar')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center text-blue-600 shadow-sm group-hover:border-blue-300 transition-colors">
              <Calendar className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              calender<span className="text-blue-600">.</span>
            </span>
          </button>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
            {navItems.map((item) => {
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Center: Prominent Add Button (Positioned in Middle) */}
        <div className="flex-1 flex justify-center max-w-xs">
          <button
            onClick={onOpenAddModal}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-5 py-2 rounded-xl text-sm shadow-md shadow-blue-500/25 transition-all w-full sm:w-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Item</span>
          </button>
        </div>

        {/* Right: Persona Switcher & Settings Button */}
        <div className="flex items-center gap-2">
          {/* Persona Picker */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60">
            {profiles.map((p) => {
              const isSelected = activeProfile === p;
              const currentColor = profileColors[p] || (p === 'Eve' ? '#2563eb' : p === 'Abbie' ? '#ec4899' : '#059669');

              return (
                <div key={p} className="flex items-center">
                  <button
                    onClick={() => setActiveProfile(p)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected ? 'text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                    style={isSelected ? { backgroundColor: currentColor } : undefined}
                  >
                    {p === 'Both' ? <Users className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    <span>{p}</span>
                  </button>
                  <button
                    onClick={() => setColorPickerTarget(p)}
                    className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                    title={`Change color for ${p}`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block border border-black/10"
                      style={{ backgroundColor: currentColor }}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl bg-slate-100/90 hover:bg-slate-200 text-slate-700 border border-slate-200/60 transition-all cursor-pointer"
            title="App Settings & Resets"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PERSONA COLOR PICKER MODAL */}
      {colorPickerTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-sm w-full space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Customize Color for {colorPickerTarget}
                </h3>
              </div>
              <button
                onClick={() => setColorPickerTarget(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Choose a unique persona color for {colorPickerTarget} so Eve and Abbie are visually distinct:
            </p>

            <div className="grid grid-cols-4 gap-2.5 pt-1">
              {PERSONA_COLORS.map((c) => (
                <button
                  key={c.label}
                  onClick={async () => {
                    await setProfileColor(colorPickerTarget, c.hex);
                    setColorPickerTarget(null);
                  }}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:border-slate-400 transition-all gap-1.5 text-xs font-semibold"
                >
                  <div
                    className="w-6 h-6 rounded-full border border-slate-300/50 shadow-xs"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-[11px] text-slate-700">{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

