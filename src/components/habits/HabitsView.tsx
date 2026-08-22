import React, { useState, useMemo, useEffect } from 'react';
import { useStore, getTodayDateString } from '../../context/StoreContext';
import { HabitItem } from '../../types';
import { Plus, Check, Sparkles, Trash2, Pencil, Calendar as CalendarIcon, RotateCcw, Pin, EyeOff } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HabitsViewProps {
  onOpenAddModal: (habitToEdit?: HabitItem | null) => void;
}

const WEEK_DAYS = [
  { dayNum: 1, label: 'Mon' },
  { dayNum: 2, label: 'Tue' },
  { dayNum: 3, label: 'Wed' },
  { dayNum: 4, label: 'Thu' },
  { dayNum: 5, label: 'Fri' },
  { dayNum: 6, label: 'Sat' },
  { dayNum: 7, label: 'Sun' },
];

export const HabitsView: React.FC<HabitsViewProps> = ({ onOpenAddModal }) => {
  const {
    habits,
    habitCompletions,
    toggleHabitCompletion,
    deleteHabit,
    clearWeeklyHabitProgress,
    filterByProfile,
    activeProfile,
    profileColors,
  } = useStore();
  const todayStr = getTodayDateString();

  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Persistent state for which habits show on the calendar page
  const [visibleHabitIds, setVisibleHabitIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('calender_visible_habit_ids');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return habits.map((h) => h.id);
  });

  useEffect(() => {
    if (!localStorage.getItem('calender_visible_habit_ids')) {
      setVisibleHabitIds(habits.map((h) => h.id));
    }
  }, [habits]);

  const toggleHabitCalendarVisibility = (habitId: string) => {
    const isNowVisible = !visibleHabitIds.includes(habitId);
    if (isNowVisible) {
      confetti({ particleCount: 20, spread: 60, origin: { y: 0.8 } });
    }

    setVisibleHabitIds((prev) => {
      const updated = isNowVisible ? [...prev, habitId] : prev.filter((id) => id !== habitId);
      localStorage.setItem('calender_visible_habit_ids', JSON.stringify(updated));
      return updated;
    });
  };

  // Compute date strings for selected week (Mon..Sun)
  const currentWeekDates = useMemo(() => {
    const today = new Date();
    today.setDate(today.getDate() + weekOffset * 7);

    const currentDayOfWeek = today.getDay();
    const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    return WEEK_DAYS.map((w, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return {
        dayNum: w.dayNum,
        label: w.label,
        dateStr: `${y}-${m}-${day}`,
        isToday: `${y}-${m}-${day}` === todayStr,
      };
    });
  }, [todayStr, weekOffset]);

  const weekRangeLabel = useMemo(() => {
    if (currentWeekDates.length === 0) return '';
    const start = currentWeekDates[0].dateStr;
    const end = currentWeekDates[6].dateStr;
    return `${start} – ${end}`;
  }, [currentWeekDates]);

  const filteredHabits = useMemo(() => {
    return filterByProfile(habits);
  }, [habits, filterByProfile]);

  const [confirmResetWeek, setConfirmResetWeek] = useState(false);

  const handleToggleCheck = async (habit: HabitItem, dateStr: string, isCompleted: boolean) => {
    if (!isCompleted) {
      confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
    }
    await toggleHabitCompletion(habit.id, dateStr);
  };

  const handleResetThisWeek = async () => {
    if (!confirmResetWeek) {
      setConfirmResetWeek(true);
      setTimeout(() => setConfirmResetWeek(false), 4000);
      return;
    }

    const activeDates = currentWeekDates.map((w) => w.dateStr);
    await clearWeeklyHabitProgress(activeDates);
    setConfirmResetWeek(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 md:px-8 py-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-4 gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">1-Week Habit Tracker ✨</h1>
          <p className="text-xs text-slate-500 font-medium">
            Track your weekly habits! Click the colorful 📌 button on any habit to choose whether it appears on your daily calendar!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAddModal(null)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95 min-h-[44px]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Habit</span>
          </button>
        </div>
      </div>

      {/* Auto-Reset Explanation Banner */}
      <div className="bg-gradient-to-r from-purple-50/80 via-pink-50/50 to-amber-50/50 border border-purple-100/80 rounded-3xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
              <span>Automatic Weekly Checkmark Refresh</span>
              <span className="text-[9px] font-black bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Fresh Every Monday 🌟
              </span>
            </h4>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Habit templates stay saved forever. Your weekly checkmarks clear automatically every Monday morning!
            </p>
          </div>
        </div>
      </div>

      {/* Week Navigation & Weekly Reset Row */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800">
            <CalendarIcon className="w-4 h-4 text-rose-500" />
            <span>{weekOffset === 0 ? 'This Week (7 Days)' : weekRangeLabel}</span>
          </div>
          <button
            onClick={handleResetThisWeek}
            className={`flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs min-h-[44px] ${
              confirmResetWeek
                ? 'bg-rose-600 text-white animate-bounce'
                : 'text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/60'
            }`}
            title="Manually reset checkmarks for this week"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>
              {confirmResetWeek ? '⚠️ Are you sure? Click again to reset' : 'Clear Week Checkmarks'}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {currentWeekDates.map((w) => (
            <div
              key={w.dateStr}
              className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all min-w-[44px] min-h-[44px] ${
                w.isToday ? 'bg-gradient-to-r from-purple-900 to-slate-900 text-white shadow-xs scale-105' : 'text-slate-600 bg-slate-50'
              }`}
            >
              <span className="text-[10px] opacity-80">{w.label}</span>
              <span>{w.dateStr.split('-')[2]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Habits List Header Column */}
      {filteredHabits.length > 0 && (
        <div className="hidden md:flex items-center justify-between px-4 text-xs font-extrabold text-slate-400">
          <span>Habit Name & Calendar Visibility 📌</span>
          <div className="flex items-center gap-2 pr-8">
            {currentWeekDates.map((w) => (
              <div key={w.dateStr} className="w-9 text-center">
                <span>{w.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Habits List */}
      {filteredHabits.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200/80 text-center space-y-3">
          <Sparkles className="w-10 h-10 mx-auto text-purple-400 stroke-[1.5]" />
          <p className="text-sm font-extrabold text-slate-700">No habits created yet</p>
          <button
            onClick={() => onOpenAddModal(null)}
            className="text-xs font-black text-purple-600 hover:text-purple-800 bg-purple-50 px-4 py-2.5 rounded-2xl transition-all hover:scale-105 cursor-pointer min-h-[44px]"
          >
            + Create your first daily habit!
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHabits.map((h) => {
            const ownerName = h.profile || 'Eve';
            const badgeColor = profileColors[ownerName] || (ownerName === 'Eve' ? '#2563eb' : ownerName === 'Abbie' ? '#ec4899' : '#059669');
            const activeDays = h.active_days && h.active_days.length > 0 ? h.active_days : [1, 2, 3, 4, 5, 6, 7];
            const isShownOnCalendar = visibleHabitIds.includes(h.id);

            return (
              <div
                key={h.id}
                className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md hover:border-purple-200 group"
              >
                {/* Left Habit Title, Edit Button, & Calendar Pin Button */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-2xs group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${h.color || '#2563eb'}18` }}
                  >
                    {h.emoji || '✨'}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-black text-slate-900 truncate">{h.title}</h3>

                      {/* EDIT HABIT BUTTON */}
                      <button
                        onClick={() => onOpenAddModal(h)}
                        className="p-1 text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Habit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {activeProfile === 'Both' && (
                        <span
                          className="text-[10px] font-black text-white px-2 py-0.5 rounded-md shadow-2xs"
                          style={{ backgroundColor: badgeColor }}
                        >
                          {ownerName}
                        </span>
                      )}

                      {/* CALENDAR VISIBILITY TOGGLE BUTTON (CHOICE MADE HERE ON HABITS TAB) */}
                      <button
                        onClick={() => toggleHabitCalendarVisibility(h.id)}
                        className={`flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-xs border hover:scale-105 active:scale-95 min-h-[36px] ${
                          isShownOnCalendar
                            ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 text-white border-transparent shadow-purple-200 ring-2 ring-purple-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                        title={isShownOnCalendar ? 'Pinned to Daily Calendar! Click to hide.' : 'Hidden from Daily Calendar. Click to show!'}
                      >
                        {isShownOnCalendar ? (
                          <>
                            <Pin className="w-3.5 h-3.5 fill-white stroke-none" />
                            <span>Pinned to Daily Calendar 📌</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                            <span>Hidden from Daily Calendar</span>
                          </>
                        )}
                      </button>
                    </div>

                    {h.target_quantity && h.target_quantity > 1 ? (
                      <p className="text-xs font-medium text-slate-400">
                        Target: {h.target_quantity} {h.target_unit || 'times'}
                      </p>
                    ) : (
                      <p className="text-xs font-medium text-slate-400">
                        Active Days: {activeDays.length === 7 ? 'Every day' : `${activeDays.length} days/week`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Weekly Completion Matrix (Mon..Sun) & Always-Visible Trash Action */}
                <div className="flex items-center gap-2 overflow-x-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 shrink-0">
                  {currentWeekDates.map((w) => {
                    const isScheduledForDay = activeDays.includes(w.dayNum);
                    const completion = habitCompletions.find((hc) => hc.habit_id === h.id && hc.date === w.dateStr);
                    const isCompleted = completion?.completed || false;

                    return (
                      <button
                        key={w.dateStr}
                        onClick={() => handleToggleCheck(h, w.dateStr, isCompleted)}
                        disabled={!isScheduledForDay}
                        className={`w-10 h-10 rounded-2xl flex flex-col items-center justify-center transition-all shrink-0 cursor-pointer ${
                          !isScheduledForDay
                            ? 'bg-slate-50 text-slate-200 border border-dashed border-slate-200 cursor-not-allowed'
                            : isCompleted
                            ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md scale-105'
                            : w.isToday
                            ? 'bg-purple-50 border-2 border-purple-400 text-purple-700 hover:bg-purple-100 font-black'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                        title={`${w.label} ${w.dateStr} ${isScheduledForDay ? (isCompleted ? '- Done!' : '- Pending') : '- Off day'}`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <span className="text-[11px] font-black">{w.label[0]}</span>
                        )}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => deleteHabit(h.id)}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-rose-50 rounded-xl transition-all ml-1 cursor-pointer shrink-0"
                    title="Delete habit"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
