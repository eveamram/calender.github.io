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
import { useIsMobile } from '../../hooks/useIsMobile';

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
  const isMobile = useIsMobile();
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
      padding: isMobile ? '0.75rem 0.4rem' : '1.5rem',
      width: '100%',
      boxShadow: 'var(--shadow-subtle)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      boxSizing: 'border-box',
    }}>
      {/* Month Navigation & Control Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.6rem',
        marginBottom: isMobile ? '0.85rem' : '1.25rem',
      }}>
        <h2 style={{ fontSize: isMobile ? '1.15rem' : '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
          {calendarMode === 'month' && format(currentDate, 'MMMM yyyy')}
          {calendarMode === 'week' && `Week of ${format(weekStart, 'MMM d')}`}
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
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
                  padding: '0.25rem 0.55rem',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: calendarMode === mode ? 'var(--bg-secondary)' : 'transparent',
                  color: calendarMode === mode ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.725rem',
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
                  padding: '0.25rem 0.55rem',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: activePersonaFilter === p
                    ? (p === 'Eve' ? '#3B82F6' : p === 'Abbie' ? '#EC4899' : 'var(--text-primary)')
                    : 'transparent',
                  color: activePersonaFilter === p ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.725rem',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                {p === 'Eve' ? 'Eve' : p === 'Abbie' ? 'Abbie' : 'Both'}
              </button>
            ))}
          </div>

          {/* Month/Week Steppers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handlePrev}
              style={{ padding: '0.35rem 0.5rem' }}
            >
              <ChevronLeft size={15} />
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                const now = new Date();
                setCurrentDate(now);
                onSelectDate(now);
              }}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.775rem', fontWeight: 700 }}
            >
              Today
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleNext}
              style={{ padding: '0.35rem 0.5rem' }}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        gap: isMobile ? '2px' : '4px',
        marginBottom: '0.5rem',
        textAlign: 'center',
      }}>
        {weekDaysHeader.map((day) => (
          <div
            key={day}
            style={{
              padding: '0.4rem 0',
              fontSize: isMobile ? '0.7rem' : '0.75rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              minWidth: 0,
              overflow: 'hidden',
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
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: isMobile ? '3px' : '6px',
        }}>
          {monthDays.map((day) => {
            const dayEvents = getEventsForDate(day);
            const isCurrMonth = isSameMonth(day, monthStart);
            const isTodayDay = isToday(day);
            const isSelected = isSameDay(day, selectedDate);
            const isPastDay = isBefore(day, todayStart);

            const maxVisible = 3;
            const visibleEvents = dayEvents.slice(0, maxVisible);
            const overflowCount = dayEvents.length - maxVisible;

            const primaryColor = dayEvents[0]?.color || '#3B82F6';
            const hasEvents = dayEvents.length > 0;

            if (isMobile) {
              return (
                <div
                  key={day.toISOString()}
                  onClick={() => onSelectDate(day)}
                  style={{
                    height: '48px',
                    padding: '0.25rem 0.1rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSelected
                      ? 'var(--accent-light)'
                      : isTodayDay
                      ? '#EFF6FF'
                      : isCurrMonth
                      ? '#FFFFFF'
                      : 'var(--bg-hover)',
                    border: isSelected
                      ? '2px solid #3B82F6'
                      : isTodayDay
                      ? '1.5px solid #3B82F6'
                      : '1px solid var(--border-subtle)',
                    opacity: isCurrMonth ? (isPastDay ? 0.75 : 1) : 0.35,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px',
                    transition: 'all 0.12s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: isTodayDay || isSelected || hasEvents ? 800 : 600,
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isTodayDay ? '#3B82F6' : 'transparent',
                    color: isTodayDay ? '#FFFFFF' : 'var(--text-primary)',
                  }}>
                    {format(day, 'd')}
                  </span>

                  {/* Clean Subtle Event Dots for Mobile Month Grid */}
                  {hasEvents && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      {dayEvents.slice(0, 4).map((evt, idx) => (
                        <div
                          key={evt.id || idx}
                          style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            backgroundColor: evt.color || '#3B82F6',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div
                key={day.toISOString()}
                onClick={() => onSelectDate(day)}
                onDoubleClick={() => {
                  onSelectDate(day);
                  onOpenAddEvent();
                }}
                style={{
                  minHeight: '115px',
                  padding: '0.6rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected
                    ? 'var(--accent-light)'
                    : isTodayDay
                    ? '#EFF6FF'
                    : isCurrMonth
                    ? '#FFFFFF'
                    : 'var(--bg-hover)',
                  border: isSelected
                    ? '2px solid #3B82F6'
                    : isTodayDay
                    ? '1.5px solid #3B82F6'
                    : '1px solid var(--border-subtle)',
                  opacity: isCurrMonth ? (isPastDay ? 0.75 : 1) : 0.35,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.12s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                }}
                title="Click to view schedule • Double-click to add event"
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.4rem',
                }}>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: isTodayDay || isSelected || hasEvents ? 800 : 600,
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isTodayDay ? '#3B82F6' : 'transparent',
                    color: isTodayDay ? '#FFFFFF' : 'var(--text-primary)',
                  }}>
                    {format(day, 'd')}
                  </span>

                  {/* Vibrant Dot Indicators for Desktop Month View */}
                  {hasEvents && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      {dayEvents.slice(0, 4).map((evt, idx) => (
                        <div
                          key={evt.id || idx}
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: evt.color || '#3B82F6',
                            boxShadow: `0 1px 4px ${(evt.color || '#3B82F6')}90`,
                          }}
                        />
                      ))}
                    </div>
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
                          padding: '0.25rem 0.45rem',
                          borderRadius: '5px',
                          backgroundColor: `${evt.color || '#3B82F6'}28`,
                          borderLeft: `3.5px solid ${evt.color || '#3B82F6'}`,
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
                          boxShadow: `0 1px 3px ${(evt.color || '#3B82F6')}18`,
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
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: isMobile ? '3px' : '8px',
        }}>
          {weekDaysList.map((day) => {
            const dayEvents = getEventsForDate(day);
            const isTodayDay = isToday(day);
            const isSelected = isSameDay(day, selectedDate);
            const primaryColor = dayEvents[0]?.color || '#3B82F6';
            const hasEvents = dayEvents.length > 0;

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
                  backgroundColor: isTodayDay ? 'var(--accent-light)' : hasEvents ? `${primaryColor}12` : 'var(--bg-primary)',
                  border: isSelected ? '2px solid var(--accent-primary)' : hasEvents ? `1.5px solid ${primaryColor}50` : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: isTodayDay ? 'var(--accent-primary)' : hasEvents ? primaryColor : 'var(--text-primary)' }}>
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
                          backgroundColor: `${evt.color || '#3B82F6'}28`,
                          borderLeft: `3.5px solid ${evt.color || '#3B82F6'}`,
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '2px',
                          boxShadow: `0 1px 3px ${(evt.color || '#3B82F6')}20`,
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
