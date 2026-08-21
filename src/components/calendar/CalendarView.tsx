import React, { useState, useMemo } from 'react';
import { useStore, getTodayDateString } from '../../context/StoreContext';
import { CalendarEvent, CATEGORY_METAS, EventType } from '../../types';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  CheckCircle,
  Circle,
  Calendar as CalendarIcon,
  RotateCcw,
  Heart,
  Edit2,
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
    tasks,
    filterByProfile,
    activeProfile,
    profileColors,
    clearCalendarEventsExceptAnniversaries,
    clearAnniversariesOnly,
  } = useStore();

  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthName = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const filteredEvents = useMemo(() => {
    return filterByProfile(events);
  }, [events, filterByProfile]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    filteredEvents.forEach((evt) => {
      if (!map.has(evt.event_date)) {
        map.set(evt.event_date, []);
      }
      map.get(evt.event_date)!.push(evt);
    });
    return map;
  }, [filteredEvents]);

  const selectedDayEvents = useMemo(() => {
    const list = eventsByDate.get(selectedDate) || [];
    return [...list].sort((a, b) => (a.start_time || '00:00').localeCompare(b.start_time || '00:00'));
  }, [eventsByDate, selectedDate]);

  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    const prevPadding = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
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

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const y = nextDate.getFullYear();
      const m = String(nextDate.getMonth() + 1).padStart(2, '0');
      const d = String(nextDate.getDate()).padStart(2, '0');
      days.push({ dateStr: `${y}-${m}-${d}`, dayNum: i, isCurrentMonth: false });
    }

    return days;
  }, [year, month]);

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

  // Double Click Handler specifically for Desktop - Opens Create Event Modal
  const handleDesktopDayDoubleClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    onOpenAddModal(dateStr);
  };

  const handleResetCalendarEvents = async () => {
    if (window.confirm('Reset all calendar events? (Your anniversaries & birthdays will NOT be deleted)')) {
      await clearCalendarEventsExceptAnniversaries();
    }
  };

  const handleResetAnniversariesOnly = async () => {
    if (window.confirm('Are you sure you want to reset ONLY your anniversaries and birthdays?')) {
      await clearAnniversariesOnly();
    }
  };

  const formattedSelectedDateHeader = useMemo(() => {
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return selectedDate;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' });
  }, [selectedDate]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-8 py-6">

      {/* MOBILE LAYOUT (Single Tap Navigation) */}
      <div className="lg:hidden space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Calendar</h1>
            <p className="text-xs text-slate-500 font-medium">Single source of truth for dated schedule</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAddModal(selectedDate)}
              className="flex items-center gap-1 bg-blue-600 text-white font-semibold px-3 py-1.5 rounded-xl text-xs shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          </div>
        </div>

        {/* Mobile Daily Schedule */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                {selectedDate === todayStr ? "Today's Schedule" : 'Day Schedule'}
              </span>
              <h2 className="text-lg font-bold text-slate-900">{formattedSelectedDateHeader}</h2>
            </div>
            <div className="flex items-center gap-2">
              {selectedDate !== todayStr && (
                <button
                  onClick={handleTodayClick}
                  className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100"
                >
                  Go to Today
                </button>
              )}
            </div>
          </div>

          {selectedDayEvents.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <CalendarIcon className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="text-sm font-medium text-slate-500">No events scheduled for this day</p>
              <button
                onClick={() => onOpenAddModal(selectedDate)}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                + Add event or assignment
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {selectedDayEvents.map((evt) => {
                const meta = CATEGORY_METAS[evt.event_type as EventType] || CATEGORY_METAS.personal;
                const task = evt.task_id ? tasks.find((t) => t.id === evt.task_id) : null;
                const ownerName = evt.profile || 'Eve';
                const badgeColor = profileColors[ownerName] || '#2563eb';

                return (
                  <div
                    key={evt.id}
                    onClick={() => onOpenAddModal(evt.event_date, evt)}
                    className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 transition-all cursor-pointer"
                  >
                    {task ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTaskComplete(task.id);
                        }}
                        className="mt-0.5 text-slate-400 hover:text-blue-600"
                      >
                        {task.is_completed ? (
                          <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                    ) : (
                      <div
                        className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: evt.color || meta.color }}
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-sm font-semibold text-slate-900 truncate ${
                            task?.is_completed ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {evt.title}
                        </h4>
                        <div className="flex items-center gap-1.5">
                          {activeProfile === 'Both' && (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                              style={{ backgroundColor: badgeColor }}
                            >
                              {ownerName}
                            </span>
                          )}
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                            style={{
                              backgroundColor: `${evt.color || meta.color}15`,
                              color: evt.color || meta.color,
                            }}
                          >
                            {meta.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        {evt.start_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {evt.start_time} {evt.end_time ? `- ${evt.end_time}` : ''}
                          </span>
                        )}
                        {evt.location && (
                          <span className="flex items-center gap-1 truncate">
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

        {/* Mobile Month Grid */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">{monthName}</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400 pb-1">
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
            <span>S</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((dayObj) => {
              const isSelected = dayObj.dateStr === selectedDate;
              const isToday = dayObj.dateStr === todayStr;
              const dayEvts = eventsByDate.get(dayObj.dateStr) || [];
              const hasEvents = dayEvts.length > 0;

              return (
                <button
                  key={dayObj.dateStr}
                  onClick={() => setSelectedDate(dayObj.dateStr)}
                  className={`flex flex-col items-center justify-center py-2 rounded-xl text-xs transition-all relative border border-transparent ${
                    !dayObj.isCurrentMonth
                      ? 'text-slate-300'
                      : isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : isToday
                      ? 'bg-blue-50 text-blue-600 font-bold border-blue-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{dayObj.dayNum}</span>
                  {hasEvents && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {dayEvts.slice(0, 3).map((e, idx) => (
                        <div
                          key={idx}
                          className={`w-1 h-1 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-blue-500'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* DESKTOP LAYOUT (Full Grid + Double Click to Add Event) */}
      <div className="hidden lg:grid grid-cols-12 gap-8 items-start">
        <div className="col-span-8 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{monthName}</h2>
              <button
                onClick={handleTodayClick}
                className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors"
              >
                Today
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg hover:bg-white text-slate-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg hover:bg-white text-slate-600 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => onOpenAddModal(selectedDate)}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Event</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 py-2 border-b border-slate-100">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Desktop Grid with Interactive Hover & Double-Click */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((dayObj) => {
              const isSelected = dayObj.dateStr === selectedDate;
              const isToday = dayObj.dateStr === todayStr;
              const dayEvts = eventsByDate.get(dayObj.dateStr) || [];

              return (
                <div
                  key={dayObj.dateStr}
                  onClick={() => setSelectedDate(dayObj.dateStr)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleDesktopDayDoubleClick(dayObj.dateStr);
                  }}
                  className={`min-h-[105px] p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between group ${
                    !dayObj.isCurrentMonth
                      ? 'bg-slate-50/40 border-slate-100 text-slate-300'
                      : isSelected
                      ? 'bg-blue-50/60 border-blue-400 shadow-xs ring-1 ring-blue-300'
                      : isToday
                      ? 'bg-white border-blue-300 ring-2 ring-blue-100 hover:border-blue-400'
                      : 'bg-white border-slate-200/80 hover:border-blue-300 hover:shadow-xs hover:scale-[1.01]'
                  }`}
                  title="Single-click to view schedule • Double-click to create event"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : isToday
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayObj.dayNum}
                    </span>
                    <div className="flex items-center gap-1">
                      {dayEvts.length > 0 && (
                        <span className="text-[10px] font-semibold text-slate-400">
                          {dayEvts.length}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 mt-1">
                    {dayEvts.slice(0, 2).map((e) => {
                      const meta = CATEGORY_METAS[e.event_type as EventType] || CATEGORY_METAS.personal;
                      const ownerName = e.profile || 'Eve';
                      const badgeColor = profileColors[ownerName] || '#2563eb';

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
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-md truncate text-slate-800 flex items-center justify-between hover:scale-[1.02] transition-transform cursor-pointer"
                          style={{ backgroundColor: `${e.color || meta.color}18` }}
                          title="Double-click to edit event"
                        >
                          <span className="truncate">
                            <span
                              className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                              style={{ backgroundColor: e.color || meta.color }}
                            />
                            {e.title}
                          </span>
                          {activeProfile === 'Both' && (
                            <span
                              className="text-[9px] font-bold text-white px-1 rounded-xs ml-1 shrink-0"
                              style={{ backgroundColor: badgeColor }}
                            >
                              {ownerName}
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {dayEvts.length > 2 && (
                      <div className="text-[10px] font-semibold text-slate-400 pl-1">
                        +{dayEvts.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Schedule Panel */}
        <div className="col-span-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5 sticky top-24">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                {selectedDate === todayStr ? "Today's Schedule" : 'Day Overview'}
              </span>
              <h3 className="text-lg font-bold text-slate-900">{formattedSelectedDateHeader}</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenAddModal(selectedDate)}
                className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                title="Add event"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {selectedDayEvents.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <CalendarIcon className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="text-sm font-medium text-slate-500">No events scheduled for this day</p>
              <button
                onClick={() => onOpenAddModal(selectedDate)}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                + Add event or assignment
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDayEvents.map((evt) => {
                const meta = CATEGORY_METAS[evt.event_type as EventType] || CATEGORY_METAS.personal;
                const task = evt.task_id ? tasks.find((t) => t.id === evt.task_id) : null;
                const ownerName = evt.profile || 'Eve';
                const badgeColor = profileColors[ownerName] || '#2563eb';

                return (
                  <div
                    key={evt.id}
                    onDoubleClick={() => onOpenAddModal(evt.event_date, evt)}
                    className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/80 transition-all group cursor-pointer"
                    title="Double-click to edit event"
                  >
                    {task ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTaskComplete(task.id);
                        }}
                        className="mt-0.5 text-slate-400 hover:text-blue-600"
                      >
                        {task.is_completed ? (
                          <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                    ) : (
                      <div
                        className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: evt.color || meta.color }}
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-sm font-semibold text-slate-900 truncate ${
                            task?.is_completed ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {evt.title}
                        </h4>
                        <div className="flex items-center gap-1.5">
                          {activeProfile === 'Both' && (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                              style={{ backgroundColor: badgeColor }}
                            >
                              {ownerName}
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenAddModal(evt.event_date, evt);
                            }}
                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                            title="Edit event"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        {evt.start_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {evt.start_time} {evt.end_time ? `- ${evt.end_time}` : ''}
                          </span>
                        )}
                        {evt.location && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
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
