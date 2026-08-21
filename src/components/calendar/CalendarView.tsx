import React, { useState, useMemo } from 'react';
import { useStore, getTodayDateString } from '../../context/StoreContext';
import { CalendarEvent, CATEGORY_METAS, EventType, THEME_PRESETS, ThemePreset } from '../../types';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  CheckCircle,
  Circle,
  Calendar as CalendarIcon,
  Sparkles,
  Edit2,
  Palette,
  Check,
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
    dateColors,
    setDateColor,
  } = useStore();

  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());
  const [mobileTab, setMobileTab] = useState<'schedule' | 'month'>('schedule');

  // Theme Preset state
  const [activeThemeId, setActiveThemeId] = useState<string>(() => {
    return localStorage.getItem('calender_vibe_theme') || 'candy';
  });

  const activeTheme = useMemo<ThemePreset>(() => {
    return THEME_PRESETS.find((t) => t.id === activeThemeId) || THEME_PRESETS[0];
  }, [activeThemeId]);

  const handleSelectTheme = (id: string) => {
    setActiveThemeId(id);
    localStorage.setItem('calender_vibe_theme', id);
  };

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
    <div className="space-y-6 max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6">
      {/* FUN VIBE THEME SELECTOR BAR */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-slate-200/70 shadow-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-500 animate-bounce-subtle" />
          <span className="text-xs font-extrabold text-slate-800 tracking-tight">Calendar Theme Vibe:</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {THEME_PRESETS.map((t) => {
            const isSelected = t.id === activeThemeId;
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTheme(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                <span>{t.emoji}</span>
                <span>{t.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-pink-400 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* MOBILE LAYOUT (< lg screens) */}
      <div className="lg:hidden space-y-4">
        {/* Mobile Header & View Switcher */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Calendar</span>
              <span className="text-lg">{activeTheme.emoji}</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">Your fun & organized schedule</p>
          </div>

          {/* Segmented Mobile View Toggle */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setMobileTab('schedule')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mobileTab === 'schedule'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Schedule
            </button>
            <button
              onClick={() => setMobileTab('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mobileTab === 'month'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month Grid
            </button>
          </div>
        </div>

        {/* MOBILE VIEW: DAY SCHEDULE */}
        {mobileTab === 'schedule' && (
          <div className="space-y-4">
            {/* Quick Mini Month Navigator Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">{monthName}</h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleTodayClick}
                    className="px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 cursor-pointer"
                  >
                    Today
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Horizontal Scrollable Days Bar for Mobile */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {calendarDays.map((dayObj) => {
                  const isSelected = dayObj.dateStr === selectedDate;
                  const isToday = dayObj.dateStr === todayStr;
                  const dayEvts = eventsByDate.get(dayObj.dateStr) || [];
                  const hasEvents = dayEvts.length > 0;
                  const customBg = dateColors[dayObj.dateStr];

                  return (
                    <button
                      key={dayObj.dateStr}
                      onClick={() => setSelectedDate(dayObj.dateStr)}
                      className={`flex flex-col items-center justify-center py-2.5 rounded-xl text-xs transition-all relative cursor-pointer border ${
                        !dayObj.isCurrentMonth
                          ? 'text-slate-300 border-transparent'
                          : isSelected
                          ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold shadow-md scale-105 border-transparent'
                          : isToday
                          ? 'bg-blue-50 text-blue-600 font-bold border-blue-400 ring-2 ring-blue-100'
                          : 'text-slate-700 hover:bg-slate-100 border-slate-100'
                      }`}
                      style={!isSelected && customBg ? { backgroundColor: `${customBg}20` } : undefined}
                    >
                      <span className="text-[10px] uppercase text-slate-400 font-semibold mb-0.5">
                        {new Date(dayObj.dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'narrow' })}
                      </span>
                      <span className="font-bold text-xs">{dayObj.dayNum}</span>

                      {hasEvents && (
                        <div className="flex items-center gap-0.5 mt-1">
                          {dayEvts.slice(0, 3).map((e, idx) => (
                            <div
                              key={idx}
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected ? 'bg-white' : 'bg-pink-500'
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

            {/* Selected Day Event List */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-bold text-pink-600 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {selectedDate === todayStr ? "Today's Schedule" : 'Day Schedule'}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">{formattedSelectedDateHeader}</h2>
                </div>
                <button
                  onClick={() => onOpenAddModal(selectedDate)}
                  className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-3 py-1.5 rounded-xl text-xs shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Event</span>
                </button>
              </div>

              {selectedDayEvents.length === 0 ? (
                <div className="py-10 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <CalendarIcon className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
                  <p className="text-sm font-semibold text-slate-600">No events scheduled for this day</p>
                  <button
                    onClick={() => onOpenAddModal(selectedDate)}
                    className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    + Add Class, Exam, or Task
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
                        onClick={() => onOpenAddModal(evt.event_date, evt)}
                        className="flex items-start gap-3 p-4 rounded-2xl border border-slate-100 shadow-2xs transition-all cursor-pointer group"
                        style={{ backgroundColor: evt.color ? `${evt.color}10` : meta.bg }}
                      >
                        <div className="text-xl shrink-0 mt-0.5">{meta.emoji}</div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4
                              className={`text-sm font-bold text-slate-900 truncate ${
                                task?.is_completed ? 'line-through text-slate-400' : ''
                              }`}
                            >
                              {evt.title}
                            </h4>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {activeProfile === 'Both' && (
                                <span
                                  className="text-[10px] font-extrabold px-2 py-0.5 rounded-md text-white shadow-2xs"
                                  style={{ backgroundColor: badgeColor }}
                                >
                                  {ownerName}
                                </span>
                              )}
                              <span
                                className="text-[10px] font-extrabold px-2 py-0.5 rounded-md"
                                style={{
                                  backgroundColor: `${evt.color || meta.color}25`,
                                  color: evt.color || meta.color,
                                }}
                              >
                                {meta.label}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5">
                            {evt.start_time && (
                              <span className="flex items-center gap-1 font-semibold text-slate-600">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {evt.start_time} {evt.end_time ? `- ${evt.end_time}` : ''}
                              </span>
                            )}
                            {evt.location && (
                              <span className="flex items-center gap-1 truncate font-medium text-slate-500">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {evt.location}
                              </span>
                            )}
                          </div>
                        </div>

                        {task && (
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
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MOBILE VIEW: FULL MONTH GRID */}
        {mobileTab === 'month' && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">{monthName}</h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 pb-1">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
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
                    onClick={() => {
                      setSelectedDate(dayObj.dateStr);
                      setMobileTab('schedule');
                    }}
                    className={`flex flex-col items-center justify-center min-h-[50px] p-1 rounded-xl text-xs transition-all relative border ${
                      !dayObj.isCurrentMonth
                        ? 'text-slate-300 border-transparent bg-slate-50/40'
                        : isSelected
                        ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold shadow-md border-transparent'
                        : isToday
                        ? 'bg-blue-50 text-blue-600 font-bold border-blue-300 ring-2 ring-blue-100'
                        : 'text-slate-700 bg-white border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <span>{dayObj.dayNum}</span>
                    {hasEvents && (
                      <div className="flex items-center gap-0.5 mt-1">
                        {dayEvts.slice(0, 2).map((e, idx) => {
                          const meta = CATEGORY_METAS[e.event_type as EventType] || CATEGORY_METAS.personal;
                          return (
                            <div
                              key={idx}
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected ? 'bg-white' : ''
                              }`}
                              style={!isSelected ? { backgroundColor: e.color || meta.color } : undefined}
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
        )}
      </div>

      {/* DESKTOP LAYOUT (Full Grid + Selected Day Schedule Sidebar) */}
      <div className="hidden lg:grid grid-cols-12 gap-8 items-start">
        {/* Desktop Main Grid */}
        <div className={`col-span-8 bg-gradient-to-br ${activeTheme.gradient} p-0.5 rounded-3xl shadow-sm`}>
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-white/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>{monthName}</span>
                  <span className="text-xl">{activeTheme.emoji}</span>
                </h2>
                <button
                  onClick={handleTodayClick}
                  className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
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
                  className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
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

            {/* Desktop Month Grid with Fun Styling */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((dayObj) => {
                const isSelected = dayObj.dateStr === selectedDate;
                const isToday = dayObj.dateStr === todayStr;
                const dayEvts = eventsByDate.get(dayObj.dateStr) || [];
                const customBg = dateColors[dayObj.dateStr];

                return (
                  <div
                    key={dayObj.dateStr}
                    onClick={() => setSelectedDate(dayObj.dateStr)}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleDesktopDayDoubleClick(dayObj.dateStr);
                    }}
                    className={`min-h-[110px] p-2.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between group ${
                      !dayObj.isCurrentMonth
                        ? 'bg-slate-50/40 border-slate-100 text-slate-300'
                        : isSelected
                        ? 'bg-blue-50/80 border-blue-400 shadow-md ring-2 ring-blue-300 scale-[1.02]'
                        : isToday
                        ? 'bg-white border-blue-400 ring-2 ring-blue-100 shadow-xs'
                        : 'bg-white/80 border-slate-200/80 hover:border-blue-300 hover:shadow-xs hover:scale-[1.01]'
                    }`}
                    style={!isSelected && customBg ? { backgroundColor: `${customBg}15` } : undefined}
                    title="Single-click to view schedule • Double-click to create event"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xs'
                            : isToday
                            ? 'bg-blue-100 text-blue-700 font-black'
                            : 'text-slate-700'
                        }`}
                      >
                        {dayObj.dayNum}
                      </span>
                      {dayEvts.length > 0 && (
                        <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                          {dayEvts.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 mt-1.5">
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
                            className="text-[11px] font-bold px-2 py-1 rounded-xl truncate text-slate-800 flex items-center justify-between hover:scale-[1.02] transition-transform cursor-pointer shadow-2xs"
                            style={{ backgroundColor: `${e.color || meta.color}20` }}
                            title="Double-click to edit event"
                          >
                            <span className="truncate flex items-center gap-1">
                              <span className="text-xs">{meta.emoji}</span>
                              <span className="truncate">{e.title}</span>
                            </span>
                            {activeProfile === 'Both' && (
                              <span
                                className="text-[9px] font-black text-white px-1 rounded-xs ml-1 shrink-0"
                                style={{ backgroundColor: badgeColor }}
                              >
                                {ownerName}
                              </span>
                            )}
                          </div>
                        );
                      })}
                      {dayEvts.length > 2 && (
                        <div className="text-[10px] font-extrabold text-slate-400 pl-1">
                          +{dayEvts.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Day Schedule Sidebar */}
        <div className="col-span-4 bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5 sticky top-24">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-black text-pink-600 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {selectedDate === todayStr ? "Today's Schedule" : 'Day Overview'}
              </span>
              <h3 className="text-xl font-black text-slate-900">{formattedSelectedDateHeader}</h3>
            </div>
            <button
              onClick={() => onOpenAddModal(selectedDate)}
              className="p-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-md transition-all cursor-pointer"
              title="Add event"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {selectedDayEvents.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <CalendarIcon className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-600">No events scheduled for this day</p>
              <button
                onClick={() => onOpenAddModal(selectedDate)}
                className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
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
                    className="flex items-start gap-3 p-4 rounded-2xl border border-slate-100 shadow-2xs transition-all group cursor-pointer hover:shadow-md"
                    style={{ backgroundColor: evt.color ? `${evt.color}10` : meta.bg }}
                    title="Double-click to edit event"
                  >
                    <div className="text-2xl shrink-0 mt-0.5">{meta.emoji}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-sm font-bold text-slate-900 truncate ${
                            task?.is_completed ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {evt.title}
                        </h4>
                        <div className="flex items-center gap-1.5">
                          {activeProfile === 'Both' && (
                            <span
                              className="text-[10px] font-extrabold px-2 py-0.5 rounded-md text-white"
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

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5">
                        {evt.start_time && (
                          <span className="flex items-center gap-1 font-semibold text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {evt.start_time} {evt.end_time ? `- ${evt.end_time}` : ''}
                          </span>
                        )}
                        {evt.location && (
                          <span className="flex items-center gap-1 truncate font-medium text-slate-500">
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
