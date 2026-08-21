import React, { useState, useMemo } from 'react';
import { useStore, getTodayDateString } from '../../context/StoreContext';
import { CalendarEvent, CATEGORY_METAS, EventType } from '../../types';
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
} from 'lucide-react';

interface CalendarViewProps {
  onOpenAddModal: (initialDate?: string, eventToEdit?: CalendarEvent) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onOpenAddModal }) => {
  const {
    events,
    selectedDate,
    setSelectedDate,
    toggleTaskComplete,
    deleteEvent,
    tasks,
    filterByProfile,
    activeProfile,
    profileColors,
  } = useStore();

  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());

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

    // Automatically ensure dynamic Monthly Anniversary and Common Holidays
    calendarDays.forEach((dayObj) => {
      const list = map.get(dayObj.dateStr) || [];

      // 1. Dynamic 30th Anniversary calculation
      const annivEvt = getAnniversaryEvent(dayObj.dateStr);
      if (annivEvt) {
        const hasAnniv = list.some((e) => e.title.includes('Anniversary'));
        if (!hasAnniv) {
          if (!map.has(dayObj.dateStr)) map.set(dayObj.dateStr, []);
          map.get(dayObj.dateStr)!.push(annivEvt);
        }
      }

      // 2. Common Holidays
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

  const todayStr = getTodayDateString();

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

  const handleDesktopDayDoubleClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    onOpenAddModal(dateStr);
  };

  const formattedSelectedDateHeader = useMemo(() => {
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return selectedDate;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' });
  }, [selectedDate]);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-800 px-3 sm:px-6 md:px-8 py-4 sm:py-6 relative pb-28">
      {/* MOBILE LAYOUT (< lg screens) */}
      <div className="lg:hidden space-y-5">
        {/* 1. SELECTED DAY SCHEDULE FIRST */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-xs space-y-4">
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
                            task?.is_completed ? 'line-through text-slate-400' : ''
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

                      {task && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskComplete(task.id);
                          }}
                          className="text-slate-400 hover:text-blue-600 cursor-pointer ml-1"
                        >
                          {task.is_completed ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                      )}
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

          {/* True 7-column grid fitting 100% inside viewport width */}
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
                  onClick={() => setSelectedDate(dayObj.dateStr)}
                  onDoubleClick={() => onOpenAddModal(dayObj.dateStr)}
                  className={`flex flex-col items-center justify-center h-11 rounded-2xl text-xs transition-all relative border cursor-pointer ${
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

                  {/* Tiny Event Dots */}
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
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleDesktopDayDoubleClick(dayObj.dateStr);
                  }}
                  className={`min-h-[105px] p-2.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between group ${
                    !dayObj.isCurrentMonth
                      ? 'bg-slate-50/40 border-slate-100 text-slate-300'
                      : isSelected
                      ? 'bg-blue-50/60 border-2 border-blue-600 ring-2 ring-blue-500/20 text-slate-900 shadow-xs scale-[1.01]'
                      : isToday
                      ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-100 text-slate-900'
                      : isWeekend
                      ? 'bg-amber-50/20 border-slate-200/70 hover:border-slate-300 hover:shadow-xs'
                      : 'bg-white border-slate-200/70 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center ${
                        isSelected
                          ? 'bg-blue-600 text-white font-black shadow-2xs'
                          : isToday
                          ? 'bg-rose-500 text-white font-black'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayObj.dayNum}
                    </span>
                    {dayEvts.length > 0 && (
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {dayEvts.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1">
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
                          className={`text-[11px] font-bold px-2 py-1 rounded-xl truncate flex items-center gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-white/15 text-white hover:bg-white/25'
                              : 'text-slate-900 hover:scale-[1.02]'
                          }`}
                          style={
                            !isSelected
                              ? { backgroundColor: `${evtColor}20`, borderLeft: `3px solid ${evtColor}` }
                              : undefined
                          }
                        >
                          <span className="truncate">{e.title}</span>
                        </div>
                      );
                    })}
                    {dayEvts.length > 2 && (
                      <div
                        className={`text-[10px] font-extrabold pl-1 ${
                          isSelected ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
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
        <div className="col-span-4 bg-white rounded-3xl p-6 border border-slate-200/70 shadow-xs space-y-4 sticky top-20">
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
              <p className="text-xs text-slate-400 font-medium mt-0.5">Daily Timeline</p>
            </div>

            <button
              onClick={() => onOpenAddModal(selectedDate)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all cursor-pointer"
              title="Add Event"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

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
                            task?.is_completed ? 'line-through text-slate-400' : ''
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
