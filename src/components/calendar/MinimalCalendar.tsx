import React, { useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { CalendarEvent } from '../../types';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isBefore,
  startOfDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight, CheckSquare, User } from 'lucide-react';

interface MinimalCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onOpenAddEvent: () => void;
}

export const MinimalCalendar: React.FC<MinimalCalendarProps> = ({
  selectedDate,
  onSelectDate,
  onSelectEvent,
  onOpenAddEvent,
}) => {
  const {
    currentDate,
    setCurrentDate,
    filteredEvents,
    members,
    activePersonaFilter,
    setActivePersonaFilter,
    showTodosOnCalendar,
    setShowTodosOnCalendar,
  } = useCalendar();

  const [calendarMode, setCalendarMode] = useState<'month' | 'week'>('month');

  const todayStart = startOfDay(new Date());

  const getOwnerName = (evt: CalendarEvent) => {
    if (evt.owner_user_id) {
      const owner = members.find((m) => m.user_id === evt.owner_user_id || m.id === evt.owner_user_id);
      if (owner) return owner.display_name;
    }
    if (evt.created_by) {
      const creator = members.find((m) => m.user_id === evt.created_by || m.id === evt.created_by);
      if (creator) return creator.display_name;
    }
    return 'Eve';
  };

  // Helper to filter events for a given date
  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredEvents.filter((e) => {
      const eDate = e.event_date || e.due_date;
      if (eDate !== dateStr) return false;

      // Filter out task if global toggle is OFF OR if specific task item has show_on_calendar === false
      if (e.event_type === 'task') {
        if (!showTodosOnCalendar || e.show_on_calendar === false) {
          return false;
        }
      }
      return true;
    });
  };

  // Month calculations
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const monthStartDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const monthEndDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const monthDays = eachDayOfInterval({ start: monthStartDate, end: monthEndDate });

  // Week calculations
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
  const weekDaysList = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weekDaysHeader = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Navigation handlers
  const handlePrev = () => {
    if (calendarMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNext = () => {
    if (calendarMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else setCurrentDate(addWeeks(currentDate, 1));
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      width: '100%',
      boxShadow: 'var(--shadow-subtle)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Month Navigation & Control Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem',
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {calendarMode === 'month' && format(currentDate, 'MMMM yyyy')}
          {calendarMode === 'week' && `Week of ${format(weekStart, 'MMM d, yyyy')}`}
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Week / Month Mode Switcher */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-hover)',
            padding: '2px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
          }}>
            {(['week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setCalendarMode(mode)}
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: calendarMode === mode ? 'var(--bg-secondary)' : 'transparent',
                  color: calendarMode === mode ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Eve | Abbie | Both Persona Selector */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-hover)',
            padding: '2px',
            borderRadius: '999px',
            border: '1px solid var(--border-color)',
          }}>
            {(['Eve', 'Abbie', 'all'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setActivePersonaFilter(p)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: activePersonaFilter === p
                    ? (p === 'Eve' ? '#3B82F6' : p === 'Abbie' ? '#EC4899' : 'var(--text-primary)')
                    : 'transparent',
                  color: activePersonaFilter === p ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.775rem',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                {p === 'Eve' ? 'Eve' : p === 'Abbie' ? 'Abbie' : 'Both'}
              </button>
            ))}
          </div>

          {/* Toggle Tasks on Calendar */}
          <button
            type="button"
            onClick={() => setShowTodosOnCalendar(!showTodosOnCalendar)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: showTodosOnCalendar ? '1px solid #F59E0B' : '1px solid var(--border-color)',
              backgroundColor: showTodosOnCalendar ? '#FFFBEB' : 'transparent',
              color: showTodosOnCalendar ? '#B45309' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            title="Toggle whether To-Do Tasks appear on Calendar"
          >
            <CheckSquare size={13} /> {showTodosOnCalendar ? 'To-Dos: On' : 'To-Dos: Off'}
          </button>

          {/* Month/Week Steppers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handlePrev}
              style={{ padding: '0.4rem 0.6rem' }}
            >
              <ChevronLeft size={16} />
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                const now = new Date();
                setCurrentDate(now);
                onSelectDate(now);
              }}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.825rem', fontWeight: 700 }}
            >
              Today
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleNext}
              style={{ padding: '0.4rem 0.6rem' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '4px',
        marginBottom: '0.5rem',
        textAlign: 'center',
      }}>
        {weekDaysHeader.map((day) => (
          <div
            key={day}
            style={{
              padding: '0.4rem 0',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* MONTH VIEW */}
      {calendarMode === 'month' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '6px',
        }}>
          {monthDays.map((day) => {
            const dayEvents = getEventsForDate(day);
            const isCurrMonth = isSameMonth(day, monthStart);
            const isTodayDay = isToday(day);
            const isSelected = isSameDay(day, selectedDate);
            const isPastDay = isBefore(day, todayStart);

            const maxVisible = 2;
            const visibleEvents = dayEvents.slice(0, maxVisible);
            const overflowCount = dayEvents.length - maxVisible;

            return (
              <div
                key={day.toISOString()}
                onClick={() => onSelectDate(day)}
                onDoubleClick={() => {
                  onSelectDate(day);
                  onOpenAddEvent();
                }}
                style={{
                  minHeight: '105px',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected
                    ? 'var(--accent-light)'
                    : isCurrMonth
                    ? 'var(--bg-secondary)'
                    : 'transparent',
                  border: isSelected
                    ? '2px solid var(--accent-primary)'
                    : '1px solid var(--border-subtle)',
                  opacity: isCurrMonth ? (isPastDay ? 0.65 : 1) : 0.3,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.12s ease',
                }}
                title="Click to view schedule • Double-click to add event"
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.35rem',
                }}>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: isTodayDay || isSelected ? 800 : 600,
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isTodayDay ? 'var(--accent-primary)' : 'transparent',
                    color: isTodayDay ? '#FFFFFF' : 'var(--text-primary)',
                  }}>
                    {format(day, 'd')}
                  </span>

                  {dayEvents.length > 0 && (
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: dayEvents[0].color || 'var(--accent-primary)',
                    }} />
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, overflow: 'hidden' }}>
                  {visibleEvents.map((evt) => {
                    const isCompletedOrPast = evt.is_completed || isPastDay;
                    const ownerName = getOwnerName(evt);

                    return (
                      <div
                        key={evt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(evt);
                        }}
                        style={{
                          padding: '0.2rem 0.4rem',
                          borderRadius: '4px',
                          backgroundColor: `${evt.color || '#3B82F6'}15`,
                          borderLeft: `2.5px solid ${evt.color || '#3B82F6'}`,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          textDecoration: isCompletedOrPast ? 'line-through' : 'none',
                          opacity: isCompletedOrPast ? 0.6 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '2px',
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{evt.title}</span>
                        {/* Owner Badge rendered ONLY when persona filter is "Both" */}
                        {activePersonaFilter === 'all' && (
                          <span style={{
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            padding: '0 0.3rem',
                            borderRadius: '999px',
                            backgroundColor: ownerName === 'Eve' ? '#DBEAFE' : '#FCE7F3',
                            color: ownerName === 'Eve' ? '#1E40AF' : '#9D174D',
                            flexShrink: 0,
                          }}>
                            {ownerName[0]}
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {overflowCount > 0 && (
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '1px' }}>
                      +{overflowCount} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WEEK VIEW */}
      {calendarMode === 'week' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
        }}>
          {weekDaysList.map((day) => {
            const dayEvents = getEventsForDate(day);
            const isTodayDay = isToday(day);
            const isSelected = isSameDay(day, selectedDate);

            return (
              <div
                key={day.toISOString()}
                onClick={() => onSelectDate(day)}
                onDoubleClick={() => {
                  onSelectDate(day);
                  onOpenAddEvent();
                }}
                style={{
                  minHeight: '260px',
                  padding: '0.6rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isTodayDay ? 'var(--accent-light)' : 'var(--bg-primary)',
                  border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: isTodayDay ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                    {format(day, 'd')}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  {dayEvents.map((evt) => {
                    const ownerName = getOwnerName(evt);
                    return (
                      <div
                        key={evt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(evt);
                        }}
                        style={{
                          padding: '0.35rem 0.5rem',
                          borderRadius: '6px',
                          backgroundColor: `${evt.color || '#3B82F6'}15`,
                          borderLeft: `3px solid ${evt.color || '#3B82F6'}`,
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '2px',
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{evt.title}</span>
                        {/* Owner Badge rendered ONLY when persona filter is "Both" */}
                        {activePersonaFilter === 'all' && (
                          <span style={{
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            padding: '0.1rem 0.35rem',
                            borderRadius: '999px',
                            backgroundColor: ownerName === 'Eve' ? '#DBEAFE' : '#FCE7F3',
                            color: ownerName === 'Eve' ? '#1E40AF' : '#9D174D',
                            flexShrink: 0,
                          }}>
                            {ownerName}
                          </span>
                        )}
                      </div>
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
