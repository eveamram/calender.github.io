import React, { useState, useMemo, useEffect } from 'react';
import { useStore, getTodayDateString } from '../../context/StoreContext';
import { CalendarEvent, CATEGORY_METAS, EventType, HabitItem } from '../../types';
import { getAnniversaryEvent, getCommonHolidayEvent } from '../../utils/holidays';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  CheckCircle,
  Circle,
  Calendar as CalendarIcon,
  Pencil,
  Trash2,
  Settings,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CalendarViewProps {
  onOpenAddModal: (initialDate?: string, eventToEdit?: CalendarEvent) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onOpenAddModal }) => {
  const {
    events,
    selectedDate,
    setSelectedDate,
    toggleTaskComplete,
    toggleEventComplete,
    deleteEvent,
    tasks,
    habits,
    habitCompletions,
    toggleHabitCompletion,
    filterByProfile,
    activeProfile,
    profileColors,
  } = useStore();

  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());
  const [showHabitSelectorModal, setShowHabitSelectorModal] = useState(false);

  // Filter habits for current active profile
  const filteredHabits = useMemo(() => filterByProfile(habits), [habits, filterByProfile]);

  // Persistent user preference for which habit IDs are enabled on calendar
  const [visibleHabitIds, setVisibleHabitIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('calender_visible_habit_ids');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return habits.map((h) => h.id);
  });

  // Sync visible habit IDs if new habits are created and user hasn't explicitly unselected them
  useEffect(() => {
    if (!localStorage.getItem('calender_visible_habit_ids')) {
      setVisibleHabitIds(habits.map((h) => h.id));
    }
  }, [habits]);

  const toggleHabitVisibility = (habitId: string) => {
    setVisibleHabitIds((prev) => {
      const updated = prev.includes(habitId) ? prev.filter((id) => id !== habitId) : [...prev, habitId];
      localStorage.setItem('calender_visible_habit_ids', JSON.stringify(updated));
      return updated;
    });
  };

  const selectedCalendarHabits = useMemo(() => {
    return filteredHabits.filter((h) => visibleHabitIds.includes(h.id));
  }, [filteredHabits, visibleHabitIds]);

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
      if (!map.has(evt.event_date)) {
        map.set(evt.event_date, []);
      }
      map.get(evt.event_date)!.push(evt);
    });

    calendarDays.forEach((dayObj) => {
      const list = map.get(dayObj.dateStr) || [];

      // Dynamic 30th Anniversary
      const annivEvt = getAnniversaryEvent(dayObj.dateStr);
      if (annivEvt) {
        const hasAnniv = list.some((e) => e.title.includes('Anniversary'));
        if (!hasAnniv) {
          if (!map.has(dayObj.dateStr)) map.set(dayObj.dateStr, []);
          map.get(dayObj.dateStr)!.push(annivEvt);
        }
      }

      // Dynamic Common & Christian Holidays
      const holidayEvt = getCommonHolidayEvent(dayObj.dateStr);
      if (holidayEvt) {
        const hasHoliday = list.some((e) => e.title === holidayEvt.title);
        if (!hasHoliday) {
          if (!map.has(dayObj.dateStr)) map.set(dayObj.dateStr, []);
          map.get(dayObj.dateStr)!.push(holidayEvt);
        }
      }
    });

    return map;
  }, [filteredEvents, calendarDays]);

  const selectedDayEvents = useMemo(() => {
    const list = eventsByDate.get(selectedDate) || [];
    return [...list].sort((a, b) => (a.start_time || '00:00').localeCompare(b.start_time || '00:00'));
  }, [eventsByDate, selectedDate]);

  const todayStr = useMemo(() => getTodayDateString(), []);

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
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

  const handleToggleHabitOnCalendar = async (habitId: string) => {
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 } });
    await toggleHabitCompletion(habitId, selectedDate);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-800 px-3 sm:px-6 md:px-8 py-4 sm:py-6 relative pb-20">
      {/* HABIT SELECTOR CONFIG MODAL */}
      {showHabitSelectorModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-extrabold text-slate-900">Choose Calendar Habits</h3>
              </div>
              <button
                onClick={() => setShowHabitSelectorModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Select which habits appear directly on your daily calendar schedule:
            </p>

            {filteredHabits.length === 0 ? (
              <div className="py-6 text-center text-xs font-semibold text-slate-400 bg-slate-50 rounded-2xl">
                No habits created yet. Go to Habits tab to create one!
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {filteredHabits.map((h) => {
                  const isChecked = visibleHabitIds.includes(h.id);
                  return (
                    <label
                      key={h.id}
                      onClick={() => toggleHabitVisibility(h.id)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-purple-50/80 border-purple-300 text-purple-950 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-base">{h.emoji || '✨'}</span>
                        <span>{h.title}</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                          isChecked
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => setShowHabitSelectorModal(false)}
              className="w-full py-2.5 rounded-2xl bg-purple-950 text-white font-extrabold text-xs shadow-xs hover:bg-purple-900 cursor-pointer"
            >
              Save Preference
            </button>
          </div>
        </div>
      )}

      {/* MOBILE LAYOUT (< lg screens) */}
      <div className="lg:hidden space-y-5">
        {/* 1. SELECTED DAY SCHEDULE FIRST */}
        <div id="daily-schedule-panel" className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {formattedSelectedDateHeader}
                </h2>
                {selectedDate === todayStr && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 uppercase tracking-wider">
                    Today
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Daily Schedule</p>
            </div>

            <button
              onClick={() => onOpenAddModal(selectedDate)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all cursor-pointer"
              title="Add Event"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Calendar Habits Section */}
          <div className="bg-purple-50/50 rounded-2xl p-3 border border-purple-100 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-purple-950">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Calendar Habits</span>
                <span className="text-[10px] text-purple-600 bg-purple-100 px-1.5 py-0.2 rounded-full">
                  {selectedCalendarHabits.length}
                </span>
              </div>

              <button
                onClick={() => setShowHabitSelectorModal(true)}
                className="flex items-center gap-1 text-[10px] font-extrabold text-purple-800 hover:text-purple-950 bg-white/80 px-2 py-1 rounded-xl border border-purple-200 cursor-pointer"
              >
                <Settings className="w-3 h-3" />
                <span>Choose Habits</span>
              </button>
            </div>

            {selectedCalendarHabits.length === 0 ? (
              <p className="text-[11px] text-purple-600 italic py-1">
                No habits chosen for calendar. Click "Choose Habits" to enable them!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {selectedCalendarHabits.map((h) => {
                  const isDone = habitCompletions.some(
                    (hc) => hc.habit_id === h.id && hc.date === selectedDate && hc.completed
                  );

                  return (
                    <div
                      key={h.id}
                      onClick={() => handleToggleHabitOnCalendar(h.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isDone
                          ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                          : 'bg-white border-purple-100 hover:border-purple-300 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold min-w-0">
                        <span className="text-sm">{h.emoji || '✨'}</span>
                        <span className={`truncate ${isDone ? 'line-through opacity-70' : ''}`}>{h.title}</span>
                      </div>

                      <button className="p-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-4 h-4 text-purple-300" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Agenda Vertical Timeline */}
          {selectedDayEvents.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs font-semibold text-slate-400">Your day is clear.</p>
              <button
                onClick={() => onOpenAddModal(selectedDate)}
                className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
              >
                + Add event
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {selectedDayEvents.map((evt) => {
                const meta = CATEGORY_METAS[evt.event_type as EventType] || CATEGORY_METAS.personal;
                const evtColor = evt.color || meta.color || '#3b82f6';
                const task = evt.task_id ? tasks.find((t) => t.id === evt.task_id) : null;
                const ownerName = evt.profile || 'Eve';
                const badgeColor = profileColors[ownerName] || '#2563eb';

                return (
                  <div
                    key={evt.id}
                    onClick={() => onOpenAddModal(evt.event_date, evt)}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-100/80 transition-all cursor-pointer group"
                  >
                    {/* Time Column */}
                    <div className="w-16 shrink-0 text-right text-xs font-bold text-slate-500 pt-0.5">
                      {evt.start_time || 'All Day'}
                    </div>

                    {/* Timeline Accent Dot & Line */}
                    <div className="flex flex-col items-center self-stretch shrink-0">
                      <div
                        className="w-3 h-3 rounded-full border-2 border-white shadow-xs shrink-0 mt-0.5"
                        style={{ backgroundColor: evtColor }}
                      />
                      <div
                        className="w-0.5 flex-1 mt-1 rounded-full opacity-30"
                        style={{ backgroundColor: evtColor }}
                      />
                    </div>

                    {/* Event Content */}
                    <div className="flex-1 min-w-0 pb-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors ${
                            evt.is_completed || task?.is_completed ? 'line-through text-slate-400 opacity-60' : ''
                          }`}
                        >
                          {evt.title}
                        </h4>
                        {activeProfile === 'Both' && (
                          <span
                            className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md text-white shrink-0"
                            style={{ backgroundColor: badgeColor }}
                          >
                            {ownerName}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                        {evt.end_time && (
                          <span className="font-semibold text-slate-500">Until {evt.end_time}</span>
                        )}
                        {evt.location && (
                          <span className="flex items-center gap-1 font-medium text-slate-400 truncate">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {evt.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAddModal(evt.event_date, evt);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                        title="Edit Event"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Delete this event?')) {
                            deleteEvent(evt.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete Event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleEventComplete(evt.id);
                        }}
                        className="text-slate-400 hover:text-blue-600 cursor-pointer ml-1 p-0.5"
                        title={evt.is_completed || task?.is_completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {evt.is_completed || task?.is_completed ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
                    setSelectedDate(dayObj.dateStr);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onDoubleClick={() => onOpenAddModal(dayObj.dateStr)}
                  className={`flex flex-col items-center justify-center h-10 sm:h-11 rounded-xl sm:rounded-2xl text-xs transition-all relative border cursor-pointer ${
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
                  className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
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

                    <button
                      onClick={(evt) => {
                        evt.stopPropagation();
                        onOpenAddModal(dayObj.dateStr);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-opacity cursor-pointer"
                      title="Add event on date"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1 mt-1 flex-1">
                    {dayEvts.slice(0, 2).map((e) => {
                      const meta = CATEGORY_METAS[e.event_type as EventType] || CATEGORY_METAS.personal;
                      const evtColor = e.color || meta.color || '#3b82f6';

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
                          className={`text-[11px] font-bold px-2 py-1 rounded-xl truncate flex items-center justify-between transition-all cursor-pointer text-slate-900 hover:scale-[1.02] shadow-2xs ${
                            e.is_completed ? 'line-through opacity-50' : ''
                          }`}
                          style={{ backgroundColor: `${evtColor}25`, borderLeft: `3.5px solid ${evtColor}` }}
                        >
                          <span className="truncate">{e.title}</span>
                        </div>
                      );
                    })}
                    {dayEvts.length > 2 && (
                      <div className="text-[10px] font-extrabold pl-1 text-blue-700">
                        +{dayEvts.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop Schedule Sidebar */}
        <div className="col-span-4 bg-white rounded-3xl p-6 border border-slate-200/70 shadow-xs space-y-5 sticky top-20">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900">{formattedSelectedDateHeader}</h3>
                {selectedDate === todayStr && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 uppercase tracking-wider">
                    Today
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Daily Schedule & Habits</p>
            </div>

            <button
              onClick={() => onOpenAddModal(selectedDate)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all cursor-pointer"
              title="Add Event"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Desktop Calendar Habits Widget */}
          <div className="bg-purple-50/60 rounded-2xl p-3.5 border border-purple-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-purple-950">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Calendar Habits</span>
                <span className="text-[10px] text-purple-700 bg-purple-100 font-black px-2 py-0.2 rounded-full">
                  {selectedCalendarHabits.length}
                </span>
              </div>

              <button
                onClick={() => setShowHabitSelectorModal(true)}
                className="flex items-center gap-1 text-[10px] font-extrabold text-purple-800 hover:text-purple-950 bg-white/90 px-2.5 py-1 rounded-xl border border-purple-200 shadow-2xs cursor-pointer transition-all hover:scale-105"
              >
                <Settings className="w-3 h-3" />
                <span>Choose Habits</span>
              </button>
            </div>

            {selectedCalendarHabits.length === 0 ? (
              <p className="text-[11px] text-purple-600 italic py-1">
                No habits chosen for calendar. Click "Choose Habits" to select which habits show up!
              </p>
            ) : (
              <div className="space-y-2">
                {selectedCalendarHabits.map((h) => {
                  const isDone = habitCompletions.some(
                    (hc) => hc.habit_id === h.id && hc.date === selectedDate && hc.completed
                  );

                  return (
                    <div
                      key={h.id}
                      onClick={() => handleToggleHabitOnCalendar(h.id)}
                      className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
                        isDone
                          ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-2xs'
                          : 'bg-white border-purple-100 hover:border-purple-300 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold min-w-0">
                        <span className="text-sm">{h.emoji || '✨'}</span>
                        <span className={`truncate ${isDone ? 'line-through opacity-70' : ''}`}>{h.title}</span>
                      </div>

                      <button className="p-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-4 h-4 text-purple-300" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Agenda Timeline List */}
          {selectedDayEvents.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-xs font-semibold text-slate-400">Your day is clear.</p>
              <button
                onClick={() => onOpenAddModal(selectedDate)}
                className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
              >
                + Add event
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {selectedDayEvents.map((evt) => {
                const meta = CATEGORY_METAS[evt.event_type as EventType] || CATEGORY_METAS.personal;
                const evtColor = evt.color || meta.color || '#3b82f6';
                const task = evt.task_id ? tasks.find((t) => t.id === evt.task_id) : null;
                const ownerName = evt.profile || 'Eve';
                const badgeColor = profileColors[ownerName] || '#2563eb';

                return (
                  <div
                    key={evt.id}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      onOpenAddModal(evt.event_date, evt);
                    }}
                    onClick={() => onOpenAddModal(evt.event_date, evt)}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-100/80 transition-all cursor-pointer group"
                  >
                    {/* Time Column */}
                    <div className="w-16 shrink-0 text-right text-xs font-bold text-slate-500 pt-0.5">
                      {evt.start_time || 'All Day'}
                    </div>

                    {/* Timeline Accent Dot & Line */}
                    <div className="flex flex-col items-center self-stretch shrink-0">
                      <div
                        className="w-3 h-3 rounded-full border-2 border-white shadow-xs shrink-0 mt-0.5"
                        style={{ backgroundColor: evtColor }}
                      />
                      <div
                        className="w-0.5 flex-1 mt-1 rounded-full opacity-30"
                        style={{ backgroundColor: evtColor }}
                      />
                    </div>

                    {/* Event Content */}
                    <div className="flex-1 min-w-0 pb-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors ${
                            evt.is_completed || task?.is_completed ? 'line-through text-slate-400 opacity-60' : ''
                          }`}
                        >
                          {evt.title}
                        </h4>
                        {activeProfile === 'Both' && (
                          <span
                            className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md text-white shrink-0"
                            style={{ backgroundColor: badgeColor }}
                          >
                            {ownerName}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                        {evt.end_time && (
                          <span className="font-semibold text-slate-500">Until {evt.end_time}</span>
                        )}
                        {evt.location && (
                          <span className="flex items-center gap-1 font-medium text-slate-400 truncate">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {evt.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAddModal(evt.event_date, evt);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                        title="Edit Event"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Delete this event?')) {
                            deleteEvent(evt.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete Event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleEventComplete(evt.id);
                        }}
                        className="text-slate-400 hover:text-blue-600 cursor-pointer ml-1 p-0.5"
                        title={evt.is_completed || task?.is_completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {evt.is_completed || task?.is_completed ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
