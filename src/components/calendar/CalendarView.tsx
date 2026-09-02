import React, { useState, useMemo } from 'react';
import { useStore, getTodayDateString } from '../../context/StoreContext';
import { CalendarEvent, CATEGORY_METAS, ClassItem, EventType, HabitItem } from '../../types';
import { getAnniversaryEvent, getCommonHolidayEvent } from '../../utils/holidays';
import { classPersonaColor, habitItemColor } from '../../utils/personaColor';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DayHourGrid, ScheduleItem } from './DayHourGrid';

const isItemPastTime = (evt: any, dateStr: string): boolean => {
  const todayStr = getTodayDateString();
  if (dateStr < todayStr) return true;
  if (dateStr > todayStr) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const targetTimeStr = evt.end_time || evt.start_time || evt.due_time;
  if (!targetTimeStr) return false;

  const parts = targetTimeStr.split(':');
  if (parts.length < 2) return false;
  const eventHours = parseInt(parts[0], 10);
  const eventMinutes = parseInt(parts[1], 10);
  if (isNaN(eventHours) || isNaN(eventMinutes)) return false;

  return currentMinutes >= (eventHours * 60 + eventMinutes);
};

const isClassScheduleItem = (evt: { is_class_item?: boolean; event_type?: string }) =>
  Boolean(evt.is_class_item || evt.event_type === 'class');


interface CalendarViewProps {
  onOpenAddModal: (initialDate?: string, eventToEdit?: CalendarEvent) => void;
  onOpenEditClass?: (cls: ClassItem, day?: number) => void;
  onOpenEditHabit?: (habit: HabitItem) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onOpenAddModal,
  onOpenEditClass,
  onOpenEditHabit,
}) => {
  const {
    events,
    classes,
    selectedDate,
    setSelectedDate,
    toggleEventComplete,
    deleteEvent,
    tasks,
    habits,
    habitCompletions,
    toggleHabitCompletion,
    updateHabit,
    filterByProfile,
    activeProfile,
    profileColors,
  } = useStore();

  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());

  // Hidden and Completed IDs for auto-generated holidays & events
  const [hiddenEventIds, setHiddenEventIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('calender_hidden_event_ids');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [completedEventIds, setCompletedEventIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('calender_completed_event_ids');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Filter habits for current active profile
  const filteredHabits = useMemo(() => filterByProfile(habits), [habits, filterByProfile]);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthName = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const filteredEvents = useMemo(() => {
    return filterByProfile(events);
  }, [events, filterByProfile]);

  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    const prevPadding = firstDayIndex;
    for (let i = prevPadding - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, daysInPrevMonth - i);
      const y = prevDate.getFullYear();
      const m = String(prevDate.getMonth() + 1).padStart(2, '0');
      const d = String(prevDate.getDate()).padStart(2, '0');
      days.push({ dateStr: `${y}-${m}-${d}`, dayNum: daysInPrevMonth - i, isCurrentMonth: false });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const m = String(month + 1).padStart(2, '0');
      const d = String(day).padStart(2, '0');
      days.push({ dateStr: `${year}-${m}-${d}`, dayNum: day, isCurrentMonth: true });
    }

    const totalCells = days.length > 35 ? 42 : 35;
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const y = nextDate.getFullYear();
      const m = String(nextDate.getMonth() + 1).padStart(2, '0');
      const d = String(nextDate.getDate()).padStart(2, '0');
      days.push({ dateStr: `${y}-${m}-${d}`, dayNum: i, isCurrentMonth: false });
    }

    return days;
  }, [year, month]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    filteredEvents.forEach((evt) => {
      if (hiddenEventIds.includes(evt.id)) return;
      if (!map.has(evt.event_date)) {
        map.set(evt.event_date, []);
      }
      const isComp = evt.is_completed || completedEventIds.includes(evt.id);
      map.get(evt.event_date)!.push({ ...evt, is_completed: isComp });
    });

    calendarDays.forEach((dayObj) => {
      const list = map.get(dayObj.dateStr) || [];

      // Dynamic 30th Anniversary
      const annivEvt = getAnniversaryEvent(dayObj.dateStr);
      if (annivEvt && !hiddenEventIds.includes(annivEvt.id)) {
        const hasAnniv = list.some((e) => e.title.includes('Anniversary'));
        if (!hasAnniv) {
          if (!map.has(dayObj.dateStr)) map.set(dayObj.dateStr, []);
          const isComp = completedEventIds.includes(annivEvt.id);
          map.get(dayObj.dateStr)!.push({ ...annivEvt, is_completed: isComp });
        }
      }

      // Dynamic Common Secular Holidays
      const holidayEvt = getCommonHolidayEvent(dayObj.dateStr);
      if (holidayEvt && !hiddenEventIds.includes(holidayEvt.id)) {
        const hasHoliday = list.some((e) => e.title === holidayEvt.title);
        if (!hasHoliday) {
          if (!map.has(dayObj.dateStr)) map.set(dayObj.dateStr, []);
          const isComp = completedEventIds.includes(holidayEvt.id);
          map.get(dayObj.dateStr)!.push({ ...holidayEvt, is_completed: isComp });
        }
      }
    });

    return map;
  }, [filteredEvents, calendarDays, hiddenEventIds, completedEventIds]);

  const selectedDayItems = useMemo(() => {
    const eventList = eventsByDate.get(selectedDate) || [];
    const dateObj = new Date(selectedDate + 'T00:00:00');
    let jsDay = dateObj.getDay(); // 0=Sun, 1=Mon...
    const dayOfWeekNum = jsDay === 0 ? 7 : jsDay; // 1..7 (Mon..Sun)

    // Filter classes for the selected date's day of week (1=Mon ... 5=Fri)
    const filteredClasses = filterByProfile(classes);
    const classEvents: CalendarEvent[] = filteredClasses
      .filter((cls) => {
        const activeDays = cls.days_of_week && cls.days_of_week.length > 0 ? cls.days_of_week : [1, 2, 3, 4, 5];
        return activeDays.includes(dayOfWeekNum);
      })
      .map((cls) => {
        const ownerProf = cls.profile || 'Eve';
        const classColor = classPersonaColor(cls.profile, activeProfile, profileColors, cls.color);
        return {
          id: `class-item-${cls.id}`,
          title: `📚 ${cls.name}${cls.room ? ` (${cls.room})` : ''}`,
          event_type: 'class',
          event_date: selectedDate,
          start_time: cls.start_time,
          end_time: cls.end_time,
          location: cls.room || cls.instructor,
          color: classColor,
          profile: cls.profile || 'Both',
          is_completed: false,
          is_class_item: true,
          class_original_id: cls.id,
        } as CalendarEvent & { is_class_item?: boolean; class_original_id?: string };
      });

    // Filter habits enabled via Habits tab setting show_in_daily_schedule
    const habitEvents: CalendarEvent[] = filteredHabits
      .filter((h) => Boolean(h.show_in_daily_schedule))
      .filter((h) => {
        const activeDays = h.active_days && h.active_days.length > 0 ? h.active_days : [1, 2, 3, 4, 5, 6, 7];
        return activeDays.includes(dayOfWeekNum);
      })
      .map((h) => {
        const isDone = habitCompletions.some(
          (hc) => hc.habit_id === h.id && hc.date === selectedDate && hc.completed
        );
        const habitColor = habitItemColor(h.color, h.profile, profileColors);
        return {
          id: `habit-evt-${h.id}`,
          title: `${h.emoji || '✨'} ${h.title}`,
          event_type: 'personal',
          event_date: selectedDate,
          start_time: 'Habit',
          color: habitColor,
          profile: h.profile || 'Both',
          is_completed: isDone,
          is_habit_item: true,
          habit_original_id: h.id,
        } as CalendarEvent & { is_habit_item?: boolean; habit_original_id?: string };
      });

    const combined = [...eventList, ...classEvents, ...habitEvents];
    return combined.sort((a, b) => (a.start_time || '00:00').localeCompare(b.start_time || '00:00'));
  }, [eventsByDate, selectedDate, classes, filteredHabits, habitCompletions, filterByProfile, profileColors, activeProfile]);

  const todayStr = useMemo(() => getTodayDateString(), []);

  const selectMonth = (newMonthDate: Date) => {
    setCurrentMonthDate(newMonthDate);
    const now = new Date();
    if (newMonthDate.getFullYear() === now.getFullYear() && newMonthDate.getMonth() === now.getMonth()) {
      setSelectedDate(todayStr);
    } else {
      const y = newMonthDate.getFullYear();
      const m = String(newMonthDate.getMonth() + 1).padStart(2, '0');
      setSelectedDate(`${y}-${m}-01`);
    }
  };

  const handlePrevMonth = () => {
    selectMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    selectMonth(new Date(year, month + 1, 1));
  };

  const handleTodayClick = () => {
    const t = new Date();
    setCurrentMonthDate(t);
    setSelectedDate(todayStr);
  };

  const handleDayDoubleClick = (e: React.MouseEvent, dateStr: string) => {
    e.stopPropagation();
    setSelectedDate(dateStr);
    onOpenAddModal(dateStr);
  };

  const formattedSelectedDateHeader = useMemo(() => {
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return selectedDate;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' });
  }, [selectedDate]);

  const handleDeleteAnyEvent = async (evt: ScheduleItem) => {
    if (evt.is_habit_item && evt.habit_original_id) {
      await updateHabit(evt.habit_original_id, { show_in_daily_schedule: false });
      return;
    }

    setHiddenEventIds((prev) => {
      const updated = [...prev, evt.id];
      localStorage.setItem('calender_hidden_event_ids', JSON.stringify(updated));
      return updated;
    });

    if (events.some((e) => e.id === evt.id)) {
      await deleteEvent(evt.id);
    }
  };

  const handleToggleAnyEventComplete = async (evt: ScheduleItem) => {
    if (isClassScheduleItem(evt)) return;

    if (evt.is_habit_item && evt.habit_original_id) {
      if (!evt.is_completed) {
        confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
      }
      await toggleHabitCompletion(evt.habit_original_id, selectedDate);
      return;
    }

    const isCurrentlyDone = evt.is_completed || completedEventIds.includes(evt.id);

    setCompletedEventIds((prev) => {
      const updated = isCurrentlyDone ? prev.filter((id) => id !== evt.id) : [...prev, evt.id];
      localStorage.setItem('calender_completed_event_ids', JSON.stringify(updated));
      return updated;
    });

    if (events.some((e) => e.id === evt.id)) {
      await toggleEventComplete(evt.id);
    }
  };

  const weekdayNumFromDate = (dateStr: string) => {
    const dateObj = new Date(dateStr + 'T00:00:00');
    const jsDay = dateObj.getDay();
    return jsDay === 0 ? 7 : jsDay;
  };

  const handleOpenScheduleItem = (evt: ScheduleItem) => {
    const isSyntheticClass =
      Boolean(evt.is_class_item) ||
      (typeof evt.id === 'string' && evt.id.startsWith('class-item-'));

    if (isSyntheticClass) {
      const classId =
        evt.class_original_id ||
        (typeof evt.id === 'string' && evt.id.startsWith('class-item-')
          ? evt.id.slice('class-item-'.length)
          : undefined);
      const cls = classId ? classes.find((c) => c.id === classId) : undefined;
      if (cls && onOpenEditClass) {
        onOpenEditClass(cls, weekdayNumFromDate(selectedDate));
      }
      return;
    }

    if (evt.is_habit_item) {
      const habitId =
        evt.habit_original_id ||
        (typeof evt.id === 'string' && evt.id.startsWith('habit-evt-')
          ? evt.id.slice('habit-evt-'.length)
          : undefined);
      const habit = habitId ? habits.find((h) => h.id === habitId) : undefined;
      if (habit && onOpenEditHabit) {
        onOpenEditHabit(habit);
      }
      return;
    }

    onOpenAddModal(evt.event_date, evt);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-800 px-3 sm:px-6 md:px-8 py-4 sm:py-6 relative pb-20">
      {/* MOBILE LAYOUT (< lg screens) */}
      <div className="lg:hidden space-y-4">
        {/* 1. SELECTED DAY SCHEDULE FIRST */}
        <div id="daily-schedule-panel" className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {formattedSelectedDateHeader}
                </h2>
                {selectedDate === todayStr && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 uppercase tracking-wider">
                    Today
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">Daily Schedule</p>
            </div>

            <button
              onClick={() => onOpenAddModal(selectedDate)}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-2xs transition-all cursor-pointer"
              title="Add Event"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <DayHourGrid
            items={selectedDayItems as ScheduleItem[]}
            selectedDate={selectedDate}
            todayStr={todayStr}
            activeProfile={activeProfile}
            profileColors={profileColors}
            tasks={tasks}
            completedEventIds={completedEventIds}
            onOpenItem={handleOpenScheduleItem}
            onToggleComplete={handleToggleAnyEventComplete}
            onDelete={handleDeleteAnyEvent}
            onAddEvent={() => onOpenAddModal(selectedDate)}
            scrollMaxHeightClass="max-h-[min(52vh,28rem)]"
          />
        </div>

        {/* 2. COMPACT MONTHLY CALENDAR SECOND */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/70 shadow-xs space-y-3">
          {/* Month Header Nav */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">{monthName}</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleTodayClick}
                className="px-2.5 py-1 text-xs font-bold text-slate-900 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 7-Column Days Header */}
          <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 pb-1">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center w-full">
            {calendarDays.map((dayObj) => {
              const isSelected = dayObj.dateStr === selectedDate;
              const isToday = dayObj.dateStr === todayStr;
              const dayEvts = eventsByDate.get(dayObj.dateStr) || [];
              const hasEvents = dayEvts.length > 0;
              const d = new Date(dayObj.dateStr + 'T00:00:00');
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;

              return (
                <button
                  key={dayObj.dateStr}
                  onClick={() => {
                    if (isSelected) {
                      onOpenAddModal(dayObj.dateStr);
                      return;
                    }
                    setSelectedDate(dayObj.dateStr);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onDoubleClick={() => onOpenAddModal(dayObj.dateStr)}
                  className={`flex flex-col items-center justify-center min-h-[44px] h-11 sm:h-12 rounded-xl sm:rounded-2xl text-xs transition-all relative border cursor-pointer ${
                    !dayObj.isCurrentMonth
                      ? 'text-slate-300 border-transparent bg-slate-50/40'
                      : isSelected
                      ? 'bg-blue-50/80 border-2 border-blue-600 text-blue-700 font-black scale-105 shadow-xs'
                      : isToday
                      ? 'bg-rose-500 text-white font-black shadow-xs ring-2 ring-rose-300'
                      : isWeekend
                      ? 'text-slate-700 bg-amber-50/30 border-slate-100 hover:bg-slate-100'
                      : 'text-slate-700 bg-white border-slate-100 hover:bg-slate-100'
                  }`}
                >
                  <span>{dayObj.dayNum}</span>

                  {hasEvents && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {dayEvts.slice(0, 3).map((e, idx) => {
                        const meta = CATEGORY_METAS[e.event_type as EventType] || CATEGORY_METAS.personal;
                        const dotColor = e.color || meta.color || '#3b82f6';
                        return (
                          <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full ${
                              isToday ? 'bg-white' : ''
                            }`}
                            style={!isToday ? { backgroundColor: dotColor } : undefined}
                          />
                        );
                      })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* DESKTOP LAYOUT (Month Grid 8-cols | Agenda Sidebar 4-cols) */}
      <div className="hidden lg:grid grid-cols-12 gap-6 items-start">
        {/* Desktop Month Grid */}
        <div className="col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{monthName}</h2>
              <button
                onClick={handleTodayClick}
                className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                  className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  aria-label="Next month"
                  className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => onOpenAddModal(selectedDate)}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Event</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 py-2 border-b border-slate-100">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((dayObj) => {
              const isSelected = dayObj.dateStr === selectedDate;
              const isToday = dayObj.dateStr === todayStr;
              const dayEvts = eventsByDate.get(dayObj.dateStr) || [];
              const d = new Date(dayObj.dateStr + 'T00:00:00');
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;

              return (
                <div
                  key={dayObj.dateStr}
                  onClick={() => setSelectedDate(dayObj.dateStr)}
                  onDoubleClick={(e) => handleDayDoubleClick(e, dayObj.dateStr)}
                  className={`min-h-[105px] p-2 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer group ${
                    !dayObj.isCurrentMonth
                      ? 'bg-slate-50/40 border-slate-100 text-slate-300'
                      : isSelected
                      ? 'bg-blue-50/60 border-2 border-blue-500 shadow-xs'
                      : isToday
                      ? 'bg-rose-50/50 border-2 border-rose-400 shadow-xs'
                      : isWeekend
                      ? 'bg-amber-50/20 border-slate-100 hover:bg-slate-50'
                      : 'bg-white border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                        isToday
                          ? 'bg-rose-500 text-white shadow-2xs'
                          : isSelected
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayObj.dayNum}
                    </span>

                  </div>

                  <div className="space-y-1 mt-1 flex-1">
                    {dayEvts.slice(0, 3).map((e) => {
                      const meta = CATEGORY_METAS[e.event_type as EventType] || CATEGORY_METAS.personal;
                      const evtColor = e.color || meta.color || '#3b82f6';
                      const isClassChip = isClassScheduleItem(e);
                      const isCompleted = isClassChip
                        ? false
                        : Boolean(e.is_completed || completedEventIds.includes(e.id));
                      const isPastChip = isItemPastTime(e, dayObj.dateStr);
                      const isPastClass = isClassChip && isItemPastTime(e, dayObj.dateStr);

                      return (
                        <div
                          key={e.id}
                          onClick={(evt) => {
                            evt.stopPropagation();
                            setSelectedDate(e.event_date);
                          }}
                          onDoubleClick={(evt) => {
                            evt.stopPropagation();
                            onOpenAddModal(e.event_date, e);
                          }}
                          title={e.title}
                          aria-label={e.title}
                          className={`text-[11px] font-bold px-2 py-1 rounded-xl flex items-start justify-between transition-all cursor-pointer text-slate-900 hover:scale-[1.02] shadow-2xs ${
                            isClassChip
                              ? isPastClass
                                ? 'opacity-70'
                                : ''
                              : isCompleted
                                ? 'line-through opacity-50'
                                : isPastChip
                                  ? 'opacity-70'
                                  : ''
                          }`}
                          style={
                            e.event_type === 'exam'
                              ? {
                                  backgroundColor: isCompleted || isPastChip ? '#fef2f2' : '#fecaca',
                                  borderLeft: `3.5px solid ${CATEGORY_METAS.exam.color}`,
                                  color: isCompleted || isPastChip ? undefined : '#991b1b',
                                }
                              : { backgroundColor: `${evtColor}25`, borderLeft: `3.5px solid ${evtColor}` }
                          }
                        >
                          <span className="truncate leading-tight">{e.title}</span>
                        </div>
                      );
                    })}
                    {dayEvts.length > 3 && (
                      <div className="text-[10px] font-extrabold pl-1 text-blue-700">
                        +{dayEvts.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop Schedule Sidebar */}
        <div className="col-span-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4 sticky top-20">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{formattedSelectedDateHeader}</h3>
                {selectedDate === todayStr && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 uppercase tracking-wider">
                    Today
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Daily Schedule</p>
            </div>

            <button
              onClick={() => onOpenAddModal(selectedDate)}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-2xs transition-all cursor-pointer"
              title="Add Event"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <DayHourGrid
            items={selectedDayItems as ScheduleItem[]}
            selectedDate={selectedDate}
            todayStr={todayStr}
            activeProfile={activeProfile}
            profileColors={profileColors}
            tasks={tasks}
            completedEventIds={completedEventIds}
            onOpenItem={handleOpenScheduleItem}
            onToggleComplete={handleToggleAnyEventComplete}
            onDelete={handleDeleteAnyEvent}
            onAddEvent={() => onOpenAddModal(selectedDate)}
            scrollMaxHeightClass="max-h-[calc(100vh-12rem)]"
          />
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
