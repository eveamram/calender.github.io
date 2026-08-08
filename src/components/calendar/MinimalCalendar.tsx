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
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const { currentDate, setCurrentDate, filteredEvents } = useCalendar();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredEvents.filter((e) => e.event_date === dateStr);
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      width: '100%',
      boxShadow: 'var(--shadow-subtle)',
    }}>
      {/* Month Navigation & Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.25rem',
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {format(currentDate, 'MMMM yyyy')}
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
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
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.825rem', fontWeight: 600 }}
          >
            Today
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            style={{ padding: '0.4rem 0.6rem' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Days of Week */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '4px',
        marginBottom: '0.5rem',
        textAlign: 'center',
      }}>
        {weekDays.map((day) => (
          <div
            key={day}
            style={{
              padding: '0.4rem 0',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Month Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '6px',
      }}>
        {days.map((day) => {
          const dayEvents = getEventsForDate(day);
          const isCurrMonth = isSameMonth(day, monthStart);
          const isTodayDay = isToday(day);
          const isSelected = isSameDay(day, selectedDate);

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
                opacity: isCurrMonth ? 1 : 0.3,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.12s ease',
              }}
              title="Click to view schedule • Double-click to add event"
            >
              {/* Date Number Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.35rem',
              }}>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: isTodayDay || isSelected ? 700 : 500,
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

              {/* Event Indicators / Labels */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, overflow: 'hidden' }}>
                {visibleEvents.map((evt) => (
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
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {evt.title}
                  </div>
                ))}

                {overflowCount > 0 && (
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '1px' }}>
                    +{overflowCount} more
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
