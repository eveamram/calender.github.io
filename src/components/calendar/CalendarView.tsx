import React, { useState, useMemo } from 'react';
import { useStore, getTodayDateString } from '../../context/StoreContext';
import { CalendarEvent, CATEGORY_METAS, ClassItem, EventType, HabitItem, eventAccentColor } from '../../types';
import { asAllDayIfAnniversary, getAnniversaryEvent, getCommonHolidayEvent } from '../../utils/holidays';
import { celebrateComplete } from '../../utils/heartBurst';
import { eventOccursOn, eventRepeats, occurrenceEventId, resolveMasterEvent } from '../../utils/eventRepeat';
import { buildScheduleItemsForDate, shiftDate, weekDatesFrom, weekdayNumFromDate } from '../../utils/scheduleItems';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { compactTimeLabel, DayHourGrid, parseTimeToMinutes, ScheduleItem } from './DayHourGrid';
import { WeekView } from './WeekView';

type CalView = 'day' | 'week' | 'month';
const CAL_VIEW_KEY = 'calender_cal_view';

const isItemPastTime = (evt: { end_time?: string; start_time?: string; due_time?: string }, dateStr: string): boolean => {
  const todayStr = getTodayDateString();
  if (dateStr < todayStr) return true;
  if (dateStr > todayStr) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const mins = parseTimeToMinutes(evt.end_time || evt.start_time || evt.due_time);
  if (mins === null) return false;
  return currentMinutes >= mins;
};

const isClassScheduleItem = (evt: { is_class_item?: boolean; event_type?: string }) =>
  Boolean(evt.is_class_item || evt.event_type === 'class');


interface CalendarViewProps {
  onOpenAddModal: (initialDate?: string, eventToEdit?: CalendarEvent, initialStartTime?: string) => void;
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
  const [calView, setCalView] = useState<CalView>(() => {
    try {
      const saved = localStorage.getItem(CAL_VIEW_KEY);
      if (saved === 'day' || saved === 'week' || saved === 'month') return saved;
    } catch {
      /* ignore */
    }
    return 'week';
  });
  const chooseView = (view: CalView) => {
    setCalView(view);
    try {
      localStorage.setItem(CAL_VIEW_KEY, view);
    } catch {
      /* ignore */
    }
  };

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

  const weekDates = useMemo(() => weekDatesFrom(selectedDate), [selectedDate]);

  const formattedSelectedDateHeader = useMemo(() => {
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return selectedDate;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' });
  }, [selectedDate]);

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
      if (eventRepeats(evt)) return;
      if (hiddenEventIds.includes(evt.id)) return;
      if (!map.has(evt.event_date)) {
        map.set(evt.event_date, []);
      }
      const isComp = evt.is_completed || completedEventIds.includes(evt.id);
      map.get(evt.event_date)!.push(asAllDayIfAnniversary({ ...evt, is_completed: isComp }));
    });

    const datesToExpand = new Set(calendarDays.map((d) => d.dateStr));
    weekDates.forEach((d) => datesToExpand.add(d));

    datesToExpand.forEach((dateStr) => {
      const list = map.get(dateStr) || [];

      const annivEvt = getAnniversaryEvent(dateStr);
      if (annivEvt && !hiddenEventIds.includes(annivEvt.id)) {
        const hasAnniv = list.some((e) => e.title.includes('Anniversary'));
        if (!hasAnniv) {
          if (!map.has(dateStr)) map.set(dateStr, []);
          const isComp = completedEventIds.includes(annivEvt.id);
          map.get(dateStr)!.push(asAllDayIfAnniversary({ ...annivEvt, is_completed: isComp }));
        }
      }

      const holidayEvt = getCommonHolidayEvent(dateStr);
      if (holidayEvt && !hiddenEventIds.includes(holidayEvt.id)) {
        const hasHoliday = list.some((e) => e.title === holidayEvt.title);
        if (!hasHoliday) {
          if (!map.has(dateStr)) map.set(dateStr, []);
          const isComp = completedEventIds.includes(holidayEvt.id);
          map.get(dateStr)!.push({ ...holidayEvt, is_completed: isComp });
        }
      }

      filteredEvents.forEach((evt) => {
        if (!eventRepeats(evt)) return;
        if (!eventOccursOn(evt, dateStr)) return;
        const occId = occurrenceEventId(evt.id, dateStr);
        if (hiddenEventIds.includes(occId) || hiddenEventIds.includes(evt.id)) return;
        if (!map.has(dateStr)) map.set(dateStr, []);
        const isComp = completedEventIds.includes(occId);
        map.get(dateStr)!.push(
          asAllDayIfAnniversary({
            ...evt,
            id: occId,
            event_date: dateStr,
            is_completed: isComp,
          })
        );
      });
    });

    return map;
  }, [filteredEvents, calendarDays, weekDates, hiddenEventIds, completedEventIds]);

  const selectedDayItems = useMemo(() => {
    return buildScheduleItemsForDate({
      dateStr: selectedDate,
      eventList: eventsByDate.get(selectedDate) || [],
      classes: filterByProfile(classes),
      habits: filteredHabits,
      habitCompletions,
      activeProfile,
      profileColors,
    });
  }, [eventsByDate, selectedDate, classes, filteredHabits, habitCompletions, filterByProfile, profileColors, activeProfile]);

  const weekItemsByDate = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();
    const filteredClasses = filterByProfile(classes);
    weekDates.forEach((dateStr) => {
      map.set(
        dateStr,
        buildScheduleItemsForDate({
          dateStr,
          eventList: eventsByDate.get(dateStr) || [],
          classes: filteredClasses,
          habits: filteredHabits,
          habitCompletions,
          activeProfile,
          profileColors,
        })
      );
    });
    return map;
  }, [weekDates, eventsByDate, classes, filteredHabits, habitCompletions, filterByProfile, profileColors, activeProfile]);

  const monthItemsByDate = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();
    const filteredClasses = filterByProfile(classes);
    calendarDays.forEach((dayObj) => {
      map.set(
        dayObj.dateStr,
        buildScheduleItemsForDate({
          dateStr: dayObj.dateStr,
          eventList: eventsByDate.get(dayObj.dateStr) || [],
          classes: filteredClasses,
          habits: filteredHabits,
          habitCompletions,
          activeProfile,
          profileColors,
        })
      );
    });
    return map;
  }, [calendarDays, eventsByDate, classes, filteredHabits, habitCompletions, filterByProfile, profileColors, activeProfile]);

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

  const handlePrev = () => {
    if (calView === 'month') handlePrevMonth();
    else {
      const next = shiftDate(selectedDate, calView === 'week' ? -7 : -1);
      setSelectedDate(next);
      setCurrentMonthDate(new Date(next + 'T00:00:00'));
    }
  };

  const handleNext = () => {
    if (calView === 'month') handleNextMonth();
    else {
      const next = shiftDate(selectedDate, calView === 'week' ? 7 : 1);
      setSelectedDate(next);
      setCurrentMonthDate(new Date(next + 'T00:00:00'));
    }
  };

  const toolbarTitle = useMemo(() => {
    if (calView === 'month') return monthName;
    if (calView === 'week') {
      const start = new Date(weekDates[0] + 'T00:00:00');
      const end = new Date(weekDates[6] + 'T00:00:00');
      const sameMonth = start.getMonth() === end.getMonth();
      if (sameMonth) {
        return `${start.toLocaleString('default', { month: 'long' })} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`;
      }
      return `${start.toLocaleString('default', { month: 'short' })} ${start.getDate()} – ${end.toLocaleString('default', { month: 'short' })} ${end.getDate()}, ${end.getFullYear()}`;
    }
    return formattedSelectedDateHeader;
  }, [calView, monthName, weekDates, formattedSelectedDateHeader]);

  const handleDayDoubleClick = (e: React.MouseEvent, dateStr: string) => {
    e.stopPropagation();
    setSelectedDate(dateStr);
    onOpenAddModal(dateStr);
  };

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

    const master = resolveMasterEvent(evt, events);
    if (events.some((e) => e.id === master.id)) {
      await deleteEvent(master.id);
    }
  };

  const handleToggleAnyEventComplete = async (evt: ScheduleItem) => {
    if (isClassScheduleItem(evt)) return;

    if (evt.is_habit_item && evt.habit_original_id) {
      if (!evt.is_completed) {
        celebrateComplete({
          dateStr: evt.event_date || selectedDate,
          title: evt.title,
          fallbackConfetti: true,
        });
      }
      await toggleHabitCompletion(evt.habit_original_id, evt.event_date || selectedDate);
      return;
    }

    const isCurrentlyDone = evt.is_completed || completedEventIds.includes(evt.id);
    if (!isCurrentlyDone) {
      celebrateComplete({
        dateStr: evt.event_date || selectedDate,
        title: evt.title,
        fallbackConfetti: false,
      });
    }

    setCompletedEventIds((prev) => {
      const updated = isCurrentlyDone ? prev.filter((id) => id !== evt.id) : [...prev, evt.id];
      localStorage.setItem('calender_completed_event_ids', JSON.stringify(updated));
      return updated;
    });

    if (eventRepeats(evt) || evt.id.includes('__occ__')) return;

    if (events.some((e) => e.id === evt.id)) {
      await toggleEventComplete(evt.id);
    }
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
        onOpenEditClass(cls, weekdayNumFromDate(evt.event_date || selectedDate));
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

    onOpenAddModal(evt.event_date, resolveMasterEvent(evt, events));
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-800 px-3 sm:px-6 md:px-8 py-4 sm:py-6 relative pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{toolbarTitle}</h2>
          {selectedDate === todayStr && calView !== 'month' && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 uppercase tracking-wider">
              Today
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleTodayClick}
              className="px-2.5 py-1 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5">
            {(['day', 'week', 'month'] as CalView[]).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => chooseView(view)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold capitalize cursor-pointer ${
                  calView === view ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onOpenAddModal(selectedDate)}
            className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>

      {calView === 'week' && (
        <WeekView
          weekDates={weekDates}
          itemsByDate={weekItemsByDate}
          selectedDate={selectedDate}
          todayStr={todayStr}
          activeProfile={activeProfile}
          profileColors={profileColors}
          onSelectDate={setSelectedDate}
          onOpenDay={(dateStr) => {
            setSelectedDate(dateStr);
            chooseView('day');
          }}
          onOpenItem={handleOpenScheduleItem}
          onAddEvent={(dateStr, startTime) => onOpenAddModal(dateStr, undefined, startTime)}
        />
      )}

      {calView === 'day' && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
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
            onAddEvent={(startTime) => onOpenAddModal(selectedDate, undefined, startTime)}
            scrollMaxHeightClass="max-h-[calc(100vh-14rem)]"
          />
        </div>
      )}

      {calView === 'month' && (
        <div className="lg:grid lg:grid-cols-12 lg:gap-5 items-start">
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="grid grid-cols-7 border-b border-slate-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
                <div
                  key={label}
                  className="py-2 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400"
                >
                  {label}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarDays.map((dayObj) => {
                const isSelected = dayObj.dateStr === selectedDate;
                const isToday = dayObj.dateStr === todayStr;
                const dayItems = monthItemsByDate.get(dayObj.dateStr) || [];
                const d = new Date(dayObj.dateStr + 'T00:00:00');
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                const visible = dayItems.slice(0, 3);
                const extra = dayItems.length - visible.length;

                return (
                  <div
                    key={dayObj.dateStr}
                    onClick={() => setSelectedDate(dayObj.dateStr)}
                    onDoubleClick={(e) => handleDayDoubleClick(e, dayObj.dateStr)}
                    className={`min-h-[76px] lg:min-h-[112px] p-1 lg:p-1.5 border-r border-b border-slate-100 flex flex-col cursor-pointer ${
                      !dayObj.isCurrentMonth
                        ? 'bg-slate-50/50 text-slate-300'
                        : isSelected
                          ? 'bg-blue-50/70'
                          : isToday
                            ? 'bg-rose-50/40'
                            : isWeekend
                              ? 'bg-amber-50/20 hover:bg-slate-50'
                              : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDate(dayObj.dateStr);
                        chooseView('day');
                      }}
                      className={`mb-0.5 w-7 h-7 rounded-full text-xs font-extrabold cursor-pointer ${
                        isToday
                          ? 'bg-rose-500 text-white'
                          : isSelected
                            ? 'bg-blue-600 text-white'
                            : dayObj.isCurrentMonth
                              ? 'text-slate-800 hover:bg-slate-200/70'
                              : 'text-slate-300'
                      }`}
                      title="Open day"
                    >
                      {dayObj.dayNum}
                    </button>
                    <div className="space-y-0.5 flex-1 min-h-0 overflow-hidden">
                      {visible.map((e) => {
                        const meta = CATEGORY_METAS[e.event_type as EventType] || CATEGORY_METAS.personal;
                        const evtColor = eventAccentColor(e) || meta.color;
                        const isClassChip = isClassScheduleItem(e);
                        const isCompleted = isClassChip
                          ? false
                          : Boolean(e.is_completed || completedEventIds.includes(e.id));
                        const isPastChip = isItemPastTime(e, dayObj.dateStr);
                        const timeLabel = compactTimeLabel(e.start_time);
                        return (
                          <button
                            key={e.id}
                            type="button"
                            onClick={(evt) => {
                              evt.stopPropagation();
                              setSelectedDate(dayObj.dateStr);
                              handleOpenScheduleItem(e);
                            }}
                            title={e.title}
                            className={`w-full text-left text-[10px] lg:text-[11px] font-bold truncate px-1 py-0.5 rounded-md cursor-pointer ${
                              isCompleted || isPastChip ? 'opacity-60' : ''
                            } ${isCompleted ? 'line-through' : ''}`}
                            style={{
                              backgroundColor: `${evtColor}28`,
                              borderLeft: `3px solid ${evtColor}`,
                              color: '#0f172a',
                            }}
                          >
                            {timeLabel ? `${timeLabel} ` : ''}
                            {e.title}
                          </button>
                        );
                      })}
                      {extra > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDate(dayObj.dateStr);
                            chooseView('day');
                          }}
                          className="text-[10px] font-extrabold text-blue-700 pl-1 cursor-pointer"
                        >
                          +{extra} more
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            id="daily-schedule-panel"
            className="mt-4 lg:mt-0 lg:col-span-4 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs sticky top-20"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">{formattedSelectedDateHeader}</h3>
                  {selectedDate === todayStr && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 uppercase tracking-wider">
                      Today
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Daily schedule</p>
              </div>
              <button
                type="button"
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
              onAddEvent={(startTime) => onOpenAddModal(selectedDate, undefined, startTime)}
              scrollMaxHeightClass="max-h-[min(52vh,28rem)] lg:max-h-[calc(100vh-12rem)]"
            />
          </div>
        </div>
      )}
    </div>
  );
};


export default CalendarView;
