import React, { useState, useMemo } from 'react';
import { useStore, getTodayDateString } from '../../context/StoreContext';
import { HabitItem } from '../../types';
import { Plus, Check, Sparkles, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HabitsViewProps {
  onOpenAddModal: () => void;
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

  // Compute date strings for selected week (Mon..Sun)
  const currentWeekDates = useMemo(() => {
    const today = new Date();
    today.setDate(today.getDate() + weekOffset * 7);

    const currentDayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
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

  const handleToggleCheck = async (habit: HabitItem, dateStr: string, isCompleted: boolean) => {
    if (!isCompleted) {
      confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
    }
    await toggleHabitCompletion(habit.id, dateStr);
  };

  const handleResetThisWeek = async () => {
    const activeDates = currentWeekDates.map((w) => w.dateStr);
    if (window.confirm("Reset habit checkmarks for this week? (Habit templates will remain unchanged)")) {
      await clearWeeklyHabitProgress(activeDates);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-4 gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Daily & Weekly Habits</h1>
          <p className="text-xs text-slate-500 font-medium">Track your habits consistently every week. Habits auto-reset checkmarks weekly.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetThisWeek}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl text-xs transition-all cursor-pointer border border-slate-200/60"
            title="Reset checkmarks for active week"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
            <span>Reset This Week</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3.5 py-2 rounded-xl text-xs shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Habit</span>
          </button>
        </div>
      </div>

      {/* Week Navigation Row */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <span>{weekOffset === 0 ? 'This Week' : weekRangeLabel}</span>
          </div>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100"
            >
              Current Week
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
          <button
            onClick={() => setWeekOffset((prev) => prev - 1)}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev Week</span>
          </button>

          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {currentWeekDates.map((w) => (
              <div
                key={w.dateStr}
                className={`flex flex-col items-center justify-center px-2.5 py-1 rounded-xl text-xs font-bold transition-all min-w-[38px] ${
                  w.isToday ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 bg-slate-50'
                }`}
              >
                <span className="text-[10px] opacity-80">{w.label}</span>
                <span>{w.dateStr.split('-')[2]}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setWeekOffset((prev) => prev + 1)}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all"
          >
            <span>Next Week</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Habits List Header Column */}
      {filteredHabits.length > 0 && (
        <div className="hidden md:flex items-center justify-between px-4 text-xs font-bold text-slate-400">
          <span>Habit Name</span>
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
        <div className="bg-white rounded-2xl p-10 border border-slate-200/80 text-center space-y-3">
          <Sparkles className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
          <p className="text-sm font-medium text-slate-500">No habits created yet</p>
          <button
            onClick={onOpenAddModal}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            + Create your first daily habit for any day of the week
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHabits.map((h) => {
            const ownerName = h.profile || 'Eve';
            const badgeColor = profileColors[ownerName] || (ownerName === 'Eve' ? '#2563eb' : ownerName === 'Abbie' ? '#ec4899' : '#059669');
            const activeDays = h.active_days && h.active_days.length > 0 ? h.active_days : [1, 2, 3, 4, 5, 6, 7];

            return (
              <div
                key={h.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all group"
              >
                {/* Left Habit Title */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: `${h.color || '#2563eb'}15` }}
                  >
                    {h.emoji || '✨'}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{h.title}</h3>
                      {activeProfile === 'Both' && (
                        <span
                          className="text-[10px] font-bold text-white px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: badgeColor }}
                        >
                          {ownerName}
                        </span>
                      )}
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

                {/* Right: Weekly Completion Matrix (Mon..Sun) */}
                <div className="flex items-center gap-2 overflow-x-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  {currentWeekDates.map((w) => {
                    const isScheduledForDay = activeDays.includes(w.dayNum);
                    const completion = habitCompletions.find((hc) => hc.habit_id === h.id && hc.date === w.dateStr);
                    const isCompleted = completion?.completed || false;

                    return (
                      <button
                        key={w.dateStr}
                        onClick={() => handleToggleCheck(h, w.dateStr, isCompleted)}
                        disabled={!isScheduledForDay}
                        className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center transition-all shrink-0 cursor-pointer ${
                          !isScheduledForDay
                            ? 'bg-slate-50 text-slate-200 border border-dashed border-slate-200 cursor-not-allowed'
                            : isCompleted
                            ? 'bg-emerald-500 text-white shadow-xs scale-105'
                            : w.isToday
                            ? 'bg-blue-50 border-2 border-blue-400 text-blue-600 hover:bg-blue-100'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                        title={`${w.label} ${w.dateStr} ${isScheduledForDay ? (isCompleted ? '- Done' : '- Pending') : '- Off day'}`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <span className="text-[11px] font-bold">{w.label[0]}</span>
                        )}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => deleteHabit(h.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity p-2 ml-1"
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

