import React from 'react';
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
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, Circle } from 'lucide-react';

interface MonthGridProps {
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectDate: (date: Date) => void;
}

export const MonthGrid: React.FC<MonthGridProps> = ({ onSelectEvent, onSelectDate }) => {
  const {
    currentDate,
    setCurrentDate,
    filteredEvents,
    members,
    toggleEventCompleted,
    viewMode,
    setViewMode,
    activePersonaFilter,
    setActivePersonaFilter,
  } = useCalendar();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredEvents.filter((e) => {
      const eventDate = e.event_date || e.due_date;
      if (eventDate === dateStr) return true;
      if (e.event_type === 'class' || e.event_type === 'School' || (e.recurrence_days && e.recurrence_days.length > 0)) {
        const dayNum = date.getDay();
        const normalizedDay = dayNum === 0 ? 7 : dayNum;
        const rec = e.recurrence_days || [1, 2, 3, 4, 5];
        return rec.includes(dayNum) || rec.includes(normalizedDay);
      }
      return false;
    });
  };

  const getOwnerMember = (userId?: string | null) => {
    if (!userId) return null;
    return members.find((m) => m.user_id === userId || m.id === userId);
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '20px',
        border: '1px solid var(--border-color)',
        padding: '1.25rem 1.5rem',
        width: '100%',
        boxSizing: 'border-box',
        boxShadow: 'var(--shadow-subtle)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Calendar Header with Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}
      >
        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
          {format(currentDate, 'MMMM yyyy')}
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Week / Month View Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-hover)',
              borderRadius: '999px',
              padding: '3px',
              border: '1px solid var(--border-color)',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('week')}
              style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: viewMode === 'week' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'week' ? '#3B82F6' : 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: viewMode === 'week' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setViewMode('month')}
              style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: viewMode === 'month' ? '#3B82F6' : 'transparent',
                color: viewMode === 'month' ? '#FFFFFF' : 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: viewMode === 'month' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Month
            </button>
          </div>

          {/* Persona Switcher Filter (Eve / Abbie / Both) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-hover)',
              borderRadius: '999px',
              padding: '3px',
              border: '1px solid var(--border-color)',
            }}
          >
            {(['Eve', 'Abbie', 'all'] as const).map((p) => {
              const active = activePersonaFilter === p;
              const label = p === 'all' ? 'Both' : p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setActivePersonaFilter(p)}
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '999px',
                    border: 'none',
                    backgroundColor: active ? '#3B82F6' : 'transparent',
                    color: active ? '#FFFFFF' : 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Navigation Controls (< Today >) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-hover)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              type="button"
              onClick={handleToday}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-hover)',
                color: 'var(--text-primary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Today
            </button>

            <button
              type="button"
              onClick={handleNextMonth}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-hover)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Day of Week Headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: '6px',
          marginBottom: '0.5rem',
          textAlign: 'center',
        }}
      >
        {weekDays.map((day, idx) => (
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

      {/* Monthly Grid Days */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: '8px',
        }}
      >
        {days.map((day) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isCurrentDay = isToday(day);
          const isSelected = format(day, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');

          return (
            <div
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              style={{
                minHeight: '105px',
                padding: '0.45rem',
                borderRadius: '14px',
                backgroundColor: isSelected
                  ? 'rgba(59, 130, 246, 0.08)'
                  : isCurrentMonth
                  ? '#FFFFFF'
                  : 'var(--bg-hover)',
                opacity: isCurrentMonth ? 1 : 0.45,
                border: isSelected
                  ? '2px solid #3B82F6'
                  : isCurrentDay
                  ? '2px solid var(--accent-primary)'
                  : '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
            >
              {/* Day Number Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.3rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: isSelected || isCurrentDay ? 800 : 600,
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isSelected || isCurrentDay ? '#3B82F6' : 'transparent',
                    color: isSelected || isCurrentDay ? '#FFFFFF' : 'var(--text-secondary)',
                  }}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Day Events Pills */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                  overflowY: 'auto',
                  flex: 1,
                  maxHeight: '75px',
                }}
              >
                {dayEvents.slice(0, 3).map((evt) => {
                  const pillBg = evt.is_anniversary
                    ? '#FCE7F3'
                    : evt.color
                    ? `${evt.color}20`
                    : '#EFF6FF';
                  const textColor = evt.is_anniversary
                    ? '#9D174D'
                    : evt.color
                    ? evt.color
                    : '#1E40AF';

                  return (
                    <div
                      key={evt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(evt);
                      }}
                      style={{
                        padding: '0.2rem 0.4rem',
                        borderRadius: '6px',
                        backgroundColor: pillBg,
                        color: textColor,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        cursor: 'pointer',
                      }}
                      title={evt.title}
                    >
                      {evt.emoji || (evt.is_anniversary ? '🌸 ' : '')}
                      {evt.title}
                    </div>
                  );
                })}

                {dayEvents.length > 3 && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
