import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProfilePersona } from '../../types';
import {
  Settings,
  X,
  Palette,
  RotateCcw,
  ShieldCheck,
  Heart,
  Sparkles,
  BookOpen,
  CheckSquare,
  ShoppingBag,
  Utensils,
  BookMarked,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

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

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    profileColors,
    setProfileColor,
    clearCalendarEventsExceptAnniversaries,
    clearAnniversariesOnly,
    clearAllEvents,
    clearClasses,
    clearTasks,
    clearWeeklyHabitProgress,
    clearAllHabitCompletions,
    clearAllHabits,
    clearGroceryItems,
    clearMealItems,
    clearBookItems,
    factoryResetAllData,
  } = useStore();

  const [colorPickerTarget, setColorPickerTarget] = useState<ProfilePersona | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isSettingsOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAction = async (title: string, actionFn: () => Promise<void>, confirmMsg?: string) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    await actionFn();
    showToast(`Successfully performed: ${title}`);
  };

  const profiles: ProfilePersona[] = ['Eve', 'Abbie', 'Both'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={() => setIsSettingsOpen(false)}
      />
      <div className="relative bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-6 animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">App Settings & Resets</h2>
              <p className="text-xs text-slate-500 font-medium">Manage persona themes and reset app modules</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs font-bold text-emerald-800 animate-slide-down">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Color Customization Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-blue-600" />
              Persona Badge Colors
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {profiles.map((p) => {
              const currentColor = profileColors[p] || (p === 'Eve' ? '#2563eb' : p === 'Abbie' ? '#ec4899' : '#059669');

              return (
                <div
                  key={p}
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-slate-50/60"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: currentColor }}
                    />
                    <span className="text-xs font-bold text-slate-900">{p}</span>
                  </div>

                  <button
                    onClick={() => setColorPickerTarget(p)}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    Change Color
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calendar Resets Section */}
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <RotateCcw className="w-4 h-4 text-blue-600" />
            Calendar Resets
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() =>
                handleAction(
                  'Reset Calendar (Keep Anniversaries)',
                  clearCalendarEventsExceptAnniversaries,
                  'Reset all calendar events? (Your anniversaries & birthdays will NOT be deleted)'
                )
              }
              className="flex flex-col items-start p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-left transition-all gap-1.5"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Keep Anniversaries</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Clear standard calendar events only</span>
            </button>

            <button
              onClick={() =>
                handleAction(
                  'Reset Anniversaries & Birthdays Only',
                  clearAnniversariesOnly,
                  'Are you sure you want to reset ONLY your anniversaries and birthdays?'
                )
              }
              className="flex flex-col items-start p-3.5 rounded-2xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50 text-rose-900 text-left transition-all gap-1.5"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
                <span>Anniversaries Only</span>
              </div>
              <span className="text-[11px] text-rose-600/80 font-medium">Reset birthdays & celebration events</span>
            </button>

            <button
              onClick={() =>
                handleAction(
                  'Reset All Calendar Events',
                  clearAllEvents,
                  'Delete ALL calendar events, including anniversaries?'
                )
              }
              className="flex flex-col items-start p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-left transition-all gap-1.5"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Trash2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Clear All Events</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Delete every single calendar entry</span>
            </button>
          </div>
        </div>

        {/* Habits & Progress Resets Section */}
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Habits & Weekly Progress Resets
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() =>
                handleAction(
                  'Reset Weekly Habit Progress',
                  clearWeeklyHabitProgress,
                  'Uncheck all completed habit checkmarks?'
                )
              }
              className="flex flex-col items-start p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-left transition-all gap-1.5"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Reset Week Checkmarks</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Uncheck active week completions</span>
            </button>

            <button
              onClick={() =>
                handleAction(
                  'Reset All Habit History',
                  clearAllHabitCompletions,
                  'Clear all recorded habit completion history?'
                )
              }
              className="flex flex-col items-start p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-left transition-all gap-1.5"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Trash2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Clear All Progress</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Clear entire habit checkmark history</span>
            </button>

            <button
              onClick={() =>
                handleAction(
                  'Reset Habits List',
                  clearAllHabits,
                  'Delete all habit items and tracking history?'
                )
              }
              className="flex flex-col items-start p-3.5 rounded-2xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50 text-rose-900 text-left transition-all gap-1.5"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Delete All Habits</span>
              </div>
              <span className="text-[11px] text-rose-600/80 font-medium">Remove habit definitions</span>
            </button>
          </div>
        </div>

        {/* Module Resets Section */}
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Module Resets
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() =>
                handleAction(
                  'Reset Class Schedule',
                  clearClasses,
                  'Clear all scheduled academic classes?'
                )
              }
              className="flex items-center gap-2 p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 transition-all"
            >
              <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Reset Classes</span>
            </button>

            <button
              onClick={() =>
                handleAction(
                  'Reset Completed Tasks',
                  () => clearTasks(true),
                  'Clear all completed tasks?'
                )
              }
              className="flex items-center gap-2 p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 transition-all"
            >
              <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Clear Done Tasks</span>
            </button>

            <button
              onClick={() =>
                handleAction(
                  'Reset Grocery List',
                  () => clearGroceryItems(false),
                  'Clear all items from your grocery list?'
                )
              }
              className="flex items-center gap-2 p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Reset Grocery</span>
            </button>

            <button
              onClick={() =>
                handleAction(
                  'Reset Weekly Meal Plan',
                  clearMealItems,
                  'Clear all planned meals?'
                )
              }
              className="flex items-center gap-2 p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 transition-all"
            >
              <Utensils className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Reset Meal Plan</span>
            </button>

            <button
              onClick={() =>
                handleAction(
                  'Reset Reading Shelf',
                  clearBookItems,
                  'Clear all books from your shelf?'
                )
              }
              className="flex items-center gap-2 p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 transition-all"
            >
              <BookMarked className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Reset Books</span>
            </button>
          </div>
        </div>

        {/* Factory Reset Section */}
        <div className="space-y-3 border-t border-rose-200/80 pt-4">
          <h3 className="text-xs font-extrabold text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Danger Zone & Factory Reset
          </h3>

          <button
            onClick={() =>
              handleAction(
                'Full Application Factory Reset',
                async () => {
                  await factoryResetAllData();
                  window.location.reload();
                },
                '⚠️ WARNING: Factory Reset will erase ALL events, tasks, habits, grocery items, meals, and books across the entire app. Are you completely sure?'
              )
            }
            className="w-full flex items-center justify-between p-4 rounded-2xl border border-rose-300 bg-rose-50/80 hover:bg-rose-100 text-rose-900 font-extrabold text-xs transition-all shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <div className="text-left">
                <div>Factory Reset All App Data</div>
                <div className="text-[11px] text-rose-600 font-medium">Clear all tables, storage, and start with clean app state</div>
              </div>
            </div>
            <Trash2 className="w-4 h-4 text-rose-600" />
          </button>
        </div>

      </div>

      {/* PERSONA COLOR PICKER MODAL OVERLAY */}
      {colorPickerTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-sm w-full space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Color for {colorPickerTarget}
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
              Choose a signature persona color for {colorPickerTarget}:
            </p>

            <div className="grid grid-cols-4 gap-2.5 pt-1">
              {PERSONA_COLORS.map((c) => (
                <button
                  key={c.label}
                  onClick={async () => {
                    await setProfileColor(colorPickerTarget, c.hex);
                    setColorPickerTarget(null);
                    showToast(`Updated color for ${colorPickerTarget}`);
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

    </div>
  );
};
