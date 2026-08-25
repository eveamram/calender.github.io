import React, { useState, useMemo } from 'react';
import { useStore, getTodayDateString } from '../../context/StoreContext';
import { HabitItem } from '../../types';
import { Plus, Check, Sparkles, Trash2, Pencil, Calendar as CalendarIcon, RotateCcw, Calendar, Flame, Trophy } from 'lucide-react';
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
      confetti({ particleCount: 25, spread: 55, origin: { y: 0.8 } });
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

  // Calculate today's completed count
  const completedTodayCount = useMemo(() => {
    return filteredHabits.filter((h) =>
      habitCompletions.some((hc) => hc.habit_id === h.id && hc.date === todayStr && hc.completed)
    ).length;
  }, [filteredHabits, habitCompletions, todayStr]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 md:px-8 py-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Habit Tracker</h1>
            {completedTodayCount > 0 && (
              <span className="bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current" /> {completedTodayCount} done today!
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Build consistency, track weekly goals, and sync daily habits to your calendar agenda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAddModal(null)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-pink-500/20 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
            title="Add Habit"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Habit</span>
          </button>
        </div>
      </div>

      {/* Colorful Info Banner */}
      <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 border border-pink-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5 fill-white/20" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900">Fun Habit Progress</h4>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Checkmarks reset every Monday. Toggle "Show in Daily Schedule" on any habit to view it on your daily timeline!
            </p>
          </div>
        </div>
      </div>

      {/* Week Navigation & Reset */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <CalendarIcon className="w-4 h-4 text-purple-600" />
            <span>{weekOffset === 0 ? 'This Week' : weekRangeLabel}</span>
          </div>
          <button
            onClick={handleResetThisWeek}
            className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer border min-h-[44px] ${
              confirmResetWeek
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
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
                w.isToday
                  ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xs scale-105'
                  : 'text-slate-600 bg-slate-50'
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
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3 shadow-xs">
          <Trophy className="w-10 h-10 mx-auto text-pink-400 stroke-[1.5]" />
          <p className="text-sm font-extrabold text-slate-800">No habits added yet!</p>
          <p className="text-xs text-slate-500">Create your first daily habit to start tracking your progress.</p>
          <button
            onClick={() => onOpenAddModal(null)}
            className="text-xs font-extrabold text-white bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md hover:scale-105"
          >
            + Add a habit
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHabits.map((h) => {
            const ownerName = h.profile || 'Eve';
            const badgeColor = h.color || profileColors[ownerName] || (ownerName === 'Both' ? '#059669' : '#2563eb');
            const activeDays = h.active_days && h.active_days.length > 0 ? h.active_days : [1, 2, 3, 4, 5, 6, 7];
            const isShownInDailySchedule = Boolean(h.show_in_daily_schedule);

            // Compute completed count for this week
            const weekCompletedCount = currentWeekDates.filter((w) =>
              habitCompletions.some((hc) => hc.habit_id === h.id && hc.date === w.dateStr && hc.completed)
            ).length;
            const targetTotal = activeDays.length;
            const isWeekFinished = weekCompletedCount >= targetTotal && targetTotal > 0;

            return (
              <div
                key={h.id}
                style={{ borderLeftColor: badgeColor, borderLeftWidth: '5px' }}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md hover:border-slate-300 relative overflow-hidden"
              >
                {/* Left: Habit Info */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-xs transition-transform hover:scale-110"
                    style={{ backgroundColor: `${badgeColor}18`, border: `1.5px solid ${badgeColor}30` }}
                  >
                    {h.emoji || '✨'}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black text-slate-900 truncate tracking-tight">{h.title}</h3>

                      {/* EDIT HABIT BUTTON */}
                      <button
                        onClick={() => onOpenAddModal(h)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Habit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* DELETE HABIT BUTTON */}
                      <button
                        onClick={() => deleteHabit(h.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Habit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {activeProfile === 'Both' && (
                        <span
                          className="text-[10px] font-extrabold text-white px-2 py-0.5 rounded-full shadow-2xs"
                          style={{ backgroundColor: badgeColor }}
                        >
                          {ownerName}
                        </span>
                      )}

                      {/* PERSISTENT SUPABASE DAILY SCHEDULE TOGGLE BUTTON */}
                      <button
                        onClick={() => toggleHabitDailySchedule(h)}
                        style={
                          isShownInDailySchedule
                            ? { backgroundColor: badgeColor, borderColor: badgeColor }
                            : undefined
                        }
                        className={`flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-xl transition-all cursor-pointer border min-h-[34px] ${
                          isShownInDailySchedule
                            ? 'text-white shadow-2xs scale-[1.02]'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                        title={
                          isShownInDailySchedule
                            ? 'Showing in Daily Schedule. Click to hide.'
                            : 'Hidden from Daily Schedule. Click to show.'
                        }
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Schedule {isShownInDailySchedule ? '✓' : '○'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <span>{weekCompletedCount} of {targetTotal} completed this week</span>
                      {isWeekFinished && (
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          ✨ 100% Done!
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-48 max-w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.round((weekCompletedCount / Math.max(1, targetTotal)) * 100))}%`,
                          backgroundColor: badgeColor,
                        }}
                      />
                    </div>
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
                        style={isCompleted ? { backgroundColor: badgeColor, borderColor: badgeColor } : undefined}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                          !isScheduledForDay
                            ? 'bg-slate-50 text-slate-200 border border-dashed border-slate-200 cursor-not-allowed'
                            : isCompleted
                            ? 'text-white font-black shadow-2xs scale-105 ring-2 ring-offset-1 ring-slate-900/10'
                            : w.isToday
                            ? 'bg-slate-50 text-slate-900 border-2 border-slate-400 font-bold'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title={`${w.label} ${w.dateStr}`}
                      >
                        {isCompleted ? (
                          <Check className="w-4.5 h-4.5 stroke-[3]" />
                        ) : (
                          <span className="text-xs font-bold">{w.label[0]}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
