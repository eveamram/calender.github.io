import React, { useState, useMemo } from 'react';
import { useStore, getTodayDateString } from '../../context/StoreContext';
import { HabitItem } from '../../types';
import { Plus, Check, Sparkles, Trash2, Pencil, Calendar as CalendarIcon, RotateCcw, Calendar } from 'lucide-react';
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
    updateHabit,
    clearWeeklyHabitProgress,
    filterByProfile,
    activeProfile,
    profileColors,
  } = useStore();
  const todayStr = getTodayDateString();

  const [weekOffset, setWeekOffset] = useState<number>(0);

  const toggleHabitDailySchedule = async (h: HabitItem) => {
    const isNowOn = !h.show_in_daily_schedule;
    if (isNowOn) {
      confetti({ particleCount: 15, spread: 50, origin: { y: 0.8 } });
    }
    await updateHabit(h.id, { show_in_daily_schedule: isNowOn });
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
      confetti({ particleCount: 20, spread: 45, origin: { y: 0.8 } });
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Habit Tracker</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Track your weekly habits and choose which ones appear on your Daily Schedule.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAddModal(null)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-all cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Habit</span>
          </button>
        </div>
      </div>

      {/* Clean Info Banner */}
      <div className="bg-slate-100/80 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-slate-700" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Weekly Progress Refresh</h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Checkmarks refresh every Monday. Toggle "Show in Daily Schedule" on any habit to see it on your calendar!
            </p>
          </div>
        </div>
      </div>

      {/* Week Navigation & Reset */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <CalendarIcon className="w-4 h-4 text-slate-700" />
            <span>{weekOffset === 0 ? 'This Week' : weekRangeLabel}</span>
          </div>
          <button
            onClick={handleResetThisWeek}
            className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer border min-h-[44px] ${
              confirmResetWeek
                ? 'bg-rose-600 text-white border-rose-600'
                : 'text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{confirmResetWeek ? 'Click again to confirm' : 'Reset Checkmarks'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {currentWeekDates.map((w) => (
            <div
              key={w.dateStr}
              className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl text-xs font-bold transition-all min-w-[44px] min-h-[44px] ${
                w.isToday ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 bg-slate-50'
              }`}
            >
              <span className="text-[10px] opacity-80">{w.label}</span>
              <span>{w.dateStr.split('-')[2]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Habits List Header */}
      {filteredHabits.length > 0 && (
        <div className="hidden md:flex items-center justify-between px-4 text-xs font-bold text-slate-400">
          <span>Habit Name & Daily Schedule Setting</span>
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
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
          <Sparkles className="w-8 h-8 mx-auto text-slate-400" />
          <p className="text-sm font-bold text-slate-700">No habits added yet</p>
          <button
            onClick={() => onOpenAddModal(null)}
            className="text-xs font-bold text-slate-900 bg-slate-100 px-4 py-2 rounded-xl transition-all cursor-pointer min-h-[44px]"
          >
            + Add a habit
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHabits.map((h) => {
            const ownerName = h.profile || 'Eve';
            const badgeColor = profileColors[ownerName] || (ownerName === 'Both' ? '#059669' : '#2563eb');
            const activeDays = h.active_days && h.active_days.length > 0 ? h.active_days : [1, 2, 3, 4, 5, 6, 7];
            const isShownInDailySchedule = Boolean(h.show_in_daily_schedule);

            return (
              <div
                key={h.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-slate-300"
              >
                {/* Left: Habit Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg shrink-0">
                    {h.emoji || '✨'}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{h.title}</h3>

                      {/* EDIT HABIT BUTTON */}
                      <button
                        onClick={() => onOpenAddModal(h)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Habit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {activeProfile === 'Both' && (
                        <span
                          className="text-[10px] font-bold text-white px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: badgeColor }}
                        >
                          {ownerName}
                        </span>
                      )}

                      {/* PERSISTENT SUPABASE DAILY SCHEDULE TOGGLE BUTTON */}
                      <button
                        onClick={() => toggleHabitDailySchedule(h)}
                        className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer border min-h-[36px] ${
                          isShownInDailySchedule
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                        title={
                          isShownInDailySchedule
                            ? 'Showing in Daily Schedule. Click to hide.'
                            : 'Hidden from Daily Schedule. Click to show.'
                        }
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Show in Daily Schedule {isShownInDailySchedule ? '✓' : '○'}</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 font-medium">
                      {h.target_quantity && h.target_quantity > 1
                        ? `Target: ${h.target_quantity} ${h.target_unit || 'times'}`
                        : activeDays.length === 7
                        ? 'Every day'
                        : `${activeDays.length} days/week`}
                    </p>
                  </div>
                </div>

                {/* Right: Mon..Sun Checkmark Buttons */}
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
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                          !isScheduledForDay
                            ? 'bg-slate-50 text-slate-200 border border-dashed border-slate-200 cursor-not-allowed'
                            : isCompleted
                            ? 'bg-slate-900 text-white font-bold shadow-xs scale-105'
                            : w.isToday
                            ? 'bg-slate-50 text-slate-900 border-2 border-slate-400 font-bold'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title={`${w.label} ${w.dateStr}`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        ) : (
                          <span className="text-xs font-bold">{w.label[0]}</span>
                        )}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => deleteHabit(h.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all ml-1 cursor-pointer shrink-0"
                    title="Delete habit"
                  >
                    <Trash2 className="w-4 h-4" />
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
