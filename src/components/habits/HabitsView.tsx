import React, { useState, useMemo } from 'react';
import { useStore, getTodayDateString } from '../../context/StoreContext';
import { HabitItem } from '../../types';
import { Plus, Check, Trash2, Pencil, Calendar as CalendarIcon, RotateCcw, Calendar, Sparkles, Minus } from 'lucide-react';
import confetti from 'canvas-confetti';
import { habitItemColor } from '../../utils/personaColor';
import { celebrateComplete } from '../../utils/heartBurst';

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

const MAX_HABIT_COUNT = 99;

const isNumberHabit = (h: HabitItem) =>
  h.tracking_mode === 'number' || h.target_unit === 'times';

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

  // Dynamic persona color for page-level controls (Add Habit, banner, today pill, week selector)
  const activePersonColor = useMemo(() => {
    return profileColors[activeProfile] || (activeProfile === 'Eve' ? '#8B7CF6' : activeProfile === 'Abbie' ? '#E98BAF' : '#83B79A');
  }, [activeProfile, profileColors]);

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

  const hasWeekHabits = filteredHabits.some((h) => !isNumberHabit(h));

  // Compute today's completed count
  const getHabitQuantity = (habitId: string, dateStr: string) => {
    const completion = habitCompletions.find((hc) => hc.habit_id === habitId && hc.date === dateStr);
    if (!completion) return 0;
    if (typeof completion.current_quantity === 'number') return Math.max(0, completion.current_quantity);
    return completion.completed ? 1 : 0;
  };

  const isHabitDoneOn = (habitId: string, dateStr: string, target = 1) =>
    getHabitQuantity(habitId, dateStr) >= Math.max(1, target);

  const todayDoneCount = useMemo(() => {
    return filteredHabits.filter((h) => isHabitDoneOn(h.id, todayStr, h.target_quantity || 1)).length;
  }, [filteredHabits, habitCompletions, todayStr]);

  const [confirmResetWeek, setConfirmResetWeek] = useState(false);

  const handleToggleCheck = async (habit: HabitItem, dateStr: string, isCompleted: boolean) => {
    if (!isCompleted) {
      celebrateComplete({ dateStr, fallbackConfetti: true });
    }
    await toggleHabitCompletion(habit.id, dateStr, isCompleted ? 0 : 1);
  };

  const handleCountChange = async (habit: HabitItem, dateStr: string, nextQty: number) => {
    const qty = Math.max(0, Math.min(MAX_HABIT_COUNT, nextQty));
    const prev = getHabitQuantity(habit.id, dateStr);
    const target = habit.target_quantity && habit.target_quantity > 0 ? habit.target_quantity : 1;
    if (qty > prev && ((prev < 1 && qty >= 1) || (prev < target && qty >= target))) {
      celebrateComplete({ dateStr, fallbackConfetti: true });
    }
    await toggleHabitCompletion(habit.id, dateStr, qty);
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
    <div className="space-y-6 max-w-5xl mx-auto px-4 md:px-8 py-6 pb-20 bg-[#FAFAFC] min-h-screen text-[#182238]">
      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E7EAF0] pb-4 gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-[#182238] tracking-tight">Habit Tracker</h1>
            <span
              style={{ backgroundColor: `${activePersonColor}18`, color: activePersonColor }}
              className="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs"
            >
              <span>{todayDoneCount} done today</span>
              <span>✨</span>
            </span>
          </div>
          <p className="text-xs text-[#68748A] font-medium">
            Pick Day grid or Numbers when you add a habit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAddModal(null)}
            style={{ backgroundColor: activePersonColor }}
            className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 hover:opacity-90"
            title="Add Habit"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Habit</span>
          </button>
        </div>
      </div>

      {/* Quiet Helpful Note Banner */}
      <div
        style={{ backgroundColor: `${activePersonColor}12`, borderColor: `${activePersonColor}30` }}
        className="border rounded-2xl p-3.5 flex items-center gap-3"
      >
        <div
          style={{ backgroundColor: `${activePersonColor}25`, color: activePersonColor }}
          className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <p className="text-xs text-[#182238] font-medium">
          Each habit uses the layout you chose when you created it. Toggle{' '}
          <span className="font-bold" style={{ color: activePersonColor }}>Schedule</span> to show it on your daily agenda.
        </p>
      </div>

      {hasWeekHabits && (
      <div className="bg-white rounded-2xl p-4 border border-[#E7EAF0] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-bold text-[#182238]">
            <CalendarIcon className="w-4 h-4" style={{ color: activePersonColor }} />
            <span>{weekOffset === 0 ? 'This Week' : weekRangeLabel}</span>
          </div>
          <button
            onClick={handleResetThisWeek}
            className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer border min-h-[38px] ${
              confirmResetWeek
                ? 'bg-rose-500 text-white border-rose-500'
                : 'text-[#182238] bg-[#F4F5F8] hover:bg-[#E7EAF0] border-[#E7EAF0]'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{confirmResetWeek ? 'Click to confirm' : 'Reset Checkmarks'}</span>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 w-full sm:flex sm:w-auto sm:items-center sm:gap-1.5">
          {currentWeekDates.map((w) => (
            <div
              key={w.dateStr}
              style={w.isToday ? { backgroundColor: activePersonColor, color: '#ffffff' } : undefined}
              className={`flex flex-col items-center justify-center px-1 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                w.isToday ? 'shadow-2xs' : 'text-[#68748A] bg-[#F4F5F8]'
              }`}
            >
              <span className="text-[10px] opacity-80">{w.label}</span>
              <span>{w.dateStr.split('-')[2]}</span>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Habits List Header */}
      {filteredHabits.length > 0 && hasWeekHabits && (
        <div className="hidden md:flex items-center justify-between px-4 text-xs font-bold text-[#68748A]">
          <span>Habit Name & Schedule Setting</span>
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
        <div className="bg-white rounded-2xl p-10 border border-[#E7EAF0] text-center space-y-3">
          <Sparkles className="w-8 h-8 mx-auto" style={{ color: `${activePersonColor}90` }} />
          <p className="text-sm font-bold text-[#182238]">No habits added yet</p>
          <button
            onClick={() => onOpenAddModal(null)}
            style={{ backgroundColor: activePersonColor }}
            className="text-xs font-bold text-white px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs hover:opacity-90"
          >
            + Add a habit
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredHabits.map((h) => {
            const ownerName = h.profile || 'Eve';
            const habitAccentColor = habitItemColor(h.color, h.profile, profileColors);
            const activeDays = h.active_days && h.active_days.length > 0 ? h.active_days : [1, 2, 3, 4, 5, 6, 7];
            const isShownInDailySchedule = Boolean(h.show_in_daily_schedule);

            // Compute completed count for this week
            const usesNumbers = isNumberHabit(h);
            const dailyTarget = h.target_quantity && h.target_quantity > 0 ? h.target_quantity : 1;
            const weekCompletedCount = currentWeekDates.filter((w) =>
              isHabitDoneOn(h.id, w.dateStr, usesNumbers ? dailyTarget : 1)
            ).length;
            const targetTotal = activeDays.length;
            const progressPercent = Math.min(100, Math.round((weekCompletedCount / (targetTotal || 1)) * 100));
            const selectedQty = getHabitQuantity(h.id, todayStr);

            return (
              <div
                key={h.id}
                style={{ borderLeftColor: habitAccentColor, borderLeftWidth: '4px' }}
                className="bg-white rounded-2xl p-4 border border-[#E7EAF0] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-xs hover:border-[#D0D5DD]"
              >
                {/* Left: Habit Info */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-2xs font-bold border"
                    style={{
                      backgroundColor: `${habitAccentColor}18`,
                      borderColor: `${habitAccentColor}40`,
                    }}
                  >
                    {h.emoji || '✨'}
                  </div>

                  <div className="min-w-0 space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-semibold text-[#182238] truncate tracking-tight">{h.title}</h3>
                      {usesNumbers && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F4F5F8] text-[#68748A]">
                          Numbers
                        </span>
                      )}

                      {/* EDIT HABIT BUTTON */}
                      <button
                        onClick={() => onOpenAddModal(h)}
                        className="p-1 text-[#68748A] hover:text-[#182238] hover:bg-[#F4F5F8] rounded-lg transition-colors cursor-pointer"
                        title="Edit Habit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* DELETE HABIT BUTTON */}
                      <button
                        onClick={() => deleteHabit(h.id)}
                        className="p-1 text-[#68748A] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Habit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Quiet Profile Badges */}
                      {activeProfile === 'Both' && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ownerName === 'Eve'
                              ? 'bg-[#FCEEF3] text-[#B0456E]'
                              : ownerName === 'Abbie'
                              ? 'bg-[#F1EEFF] text-[#5B4FC4]'
                              : 'bg-[#EDF7F1] text-[#2E6B4B]'
                          }`}
                        >
                          {ownerName}
                        </span>
                      )}

                      {/* Subtle Schedule Button */}
                      <button
                        onClick={() => toggleHabitDailySchedule(h)}
                        style={
                          isShownInDailySchedule
                            ? {
                                backgroundColor: `${habitAccentColor}18`,
                                color: habitAccentColor,
                                borderColor: `${habitAccentColor}50`,
                              }
                            : undefined
                        }
                        className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-xl transition-all cursor-pointer border min-h-[32px] ${
                          isShownInDailySchedule
                            ? 'shadow-2xs font-bold'
                            : 'bg-[#F4F5F8] text-[#68748A] border-[#E7EAF0] hover:bg-[#E7EAF0]'
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

                    {/* Progress Bar & Subtext */}
                    <div className="flex items-center gap-3 max-w-xs">
                      <div className="flex-1 bg-[#F4F5F8] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${progressPercent}%`,
                            backgroundColor: habitAccentColor,
                          }}
                        />
                      </div>
                      <span className="text-[11px] text-[#68748A] font-medium shrink-0">
                        {usesNumbers
                          ? `${selectedQty}${dailyTarget > 1 ? ` / ${dailyTarget}` : ''} today`
                          : `${weekCompletedCount} of ${targetTotal}`}
                      </span>
                    </div>
                  </div>
                </div>

                {usesNumbers ? (
                  <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-[#E7EAF0] shrink-0">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] font-bold text-[#68748A] uppercase tracking-wider">
                        Today
                      </p>
                      <p className="text-[11px] font-medium text-[#68748A]">
                        {dailyTarget > 1 ? `Goal ${dailyTarget}×` : 'Times today'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={selectedQty <= 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleCountChange(h, todayStr, selectedQty - 1);
                        }}
                        className="w-12 h-12 rounded-2xl bg-[#F4F5F8] border border-[#E7EAF0] flex items-center justify-center text-[#182238] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#E7EAF0] active:scale-95"
                        title="Remove one"
                      >
                        <Minus className="w-5 h-5 stroke-[2.5]" />
                      </button>
                      <span
                        className="min-w-[2.75rem] text-center text-2xl font-black tabular-nums"
                        style={{ color: selectedQty >= dailyTarget ? habitAccentColor : '#182238' }}
                      >
                        {selectedQty}
                      </span>
                      <button
                        type="button"
                        disabled={selectedQty >= MAX_HABIT_COUNT}
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleCountChange(h, todayStr, selectedQty + 1);
                        }}
                        className="w-12 h-12 rounded-2xl text-white flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
                        style={{ backgroundColor: habitAccentColor }}
                        title="Add one"
                      >
                        <Plus className="w-5 h-5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                ) : (
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-[#E7EAF0] shrink-0 justify-items-center">
                  {currentWeekDates.map((w) => {
                    const isScheduledForDay = activeDays.includes(w.dayNum);
                    const isCompleted = isHabitDoneOn(h.id, w.dateStr, 1);

                    return (
                      <button
                        key={w.dateStr}
                        onClick={() => handleToggleCheck(h, w.dateStr, isCompleted)}
                        disabled={!isScheduledForDay}
                        className={`w-10 h-10 sm:w-9 sm:h-9 min-w-[40px] min-h-[40px] sm:min-w-0 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                          !isScheduledForDay
                            ? 'bg-[#F9FAFB] text-[#D0D5DD] border border-dashed border-[#E7EAF0] cursor-not-allowed'
                            : isCompleted
                            ? 'text-white font-bold shadow-2xs scale-105'
                            : w.isToday
                            ? 'bg-[#F4F5F8] text-[#182238] border-2 font-bold'
                            : 'bg-[#F4F5F8] text-[#68748A] hover:bg-[#E7EAF0]'
                        }`}
                        style={{
                          ...(isCompleted ? { backgroundColor: habitAccentColor, borderColor: habitAccentColor } : {}),
                          ...(!isCompleted && w.isToday ? { borderColor: habitAccentColor } : {}),
                        }}
                        title={`${w.label} ${w.dateStr}`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        ) : (
                          <span className="text-[11px] font-semibold">{w.label[0]}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
