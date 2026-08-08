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
} from 'date-fns';
import { Plus, CheckCircle2, Circle } from 'lucide-react';

interface MonthGridProps {
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectDate: (date: Date) => void;
}

export const MonthGrid: React.FC<MonthGridProps> = ({ onSelectEvent, onSelectDate }) => {
  const { currentDate, filteredEvents, members, toggleEventCompleted } = useCalendar();

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

  const getOwnerMember = (userId?: string | null) => {
    if (!userId) return null;
    return members.find((m) => m.user_id === userId);
  };

  return (
    <div className="glass-card" style={{ padding: '1.1rem', width: '100%', overflow: 'hidden' }}>
      {/* Day of Week Headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '6px',
        marginBottom: '0.6rem',
        textAlign: 'center',
      }}>
        {weekDays.map((day, idx) => (
          <div
            key={day}
            style={{
              padding: '0.5rem 0',
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: idx === 0 || idx === 6 ? 'var(--accent-primary)' : 'var(--text-muted)',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Monthly Days Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px',
      }}>
        {days.map((day) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isCurrentDay = isToday(day);
          const hasExam = dayEvents.some((e) => e.event_type === 'Exam');
          const primaryEventColor = dayEvents[0]?.color;

          return (
            <div
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              style={{
                minHeight: '125px',
                padding: '0.6rem 0.55rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isCurrentDay
                  ? 'var(--accent-light)'
                  : hasExam
                    ? 'rgba(239, 68, 68, 0.05)'
                    : primaryEventColor
                      ? `${primaryEventColor}0F`
                      : isCurrentMonth
                        ? 'var(--bg-secondary)'
                        : 'var(--bg-hover)',
                opacity: isCurrentMonth ? 1 : 0.4,
                border: isCurrentDay
                  ? '2px solid var(--accent-primary)'
                  : hasExam
                    ? '1.5px solid rgba(239, 68, 68, 0.4)'
                    : '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
              className="month-day-cell"
            >
              {/* Day Number Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.4rem',
              }}>
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: isCurrentDay ? 800 : 700,
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isCurrentDay ? 'var(--accent-primary)' : 'transparent',
                  color: isCurrentDay ? '#FFFFFF' : 'var(--text-primary)',
                }}>
                  {format(day, 'd')}
                </span>

                <div
                  className="quick-add-plus"
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  <Plus size={15} />
                </div>
              </div>

              {/* Day Events Container with Fun Color Pills */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                overflowY: 'auto',
                flex: 1,
                maxHeight: '100px',
              }}>
                {dayEvents.map((evt) => {
                  const owner = getOwnerMember(evt.owner_user_id || evt.created_by);
                  const pillBg = evt.is_completed ? 'var(--bg-hover)' : (evt.color || '#3B82F6');
                  const textColor = evt.is_completed ? 'var(--text-muted)' : '#FFFFFF';

                  return (
                    <div
                      key={evt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(evt);
                      }}
                      style={{
                        padding: '0.3rem 0.5rem',
                        borderRadius: '7px',
                        backgroundColor: pillBg,
                        color: textColor,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '4px',
                        cursor: 'pointer',
                        boxShadow: evt.is_completed ? 'none' : '0 2px 5px rgba(0, 0, 0, 0.12)',
                        border: evt.is_completed ? '1px dashed var(--border-color)' : 'none',
                        textDecoration: evt.is_completed ? 'line-through' : 'none',
                        opacity: evt.is_completed ? 0.65 : 1,
                        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.03)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                      title={`${evt.title} (${evt.event_type})${evt.course ? ` • ${evt.course}` : ''}`}
                    >
                      {/* Checkmark Completion Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleEventCompleted(evt.id);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: evt.is_completed ? '#10B981' : 'rgba(255,255,255,0.85)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: 0,
                        }}
                        title={evt.is_completed ? 'Mark pending' : 'Mark complete'}
                      >
                        {evt.is_completed ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                      </button>

                      <span style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flex: 1,
                      }}>
                        {evt.event_type === 'Exam' && '🚨 '}
                        {evt.event_type === 'Quiz' && '⚡ '}
                        {evt.event_type === 'Assignment' && '💻 '}
                        {evt.event_type === 'Trip' && '✈️ '}
                        {evt.title}
                      </span>

                      {owner && (
                        <div
                          title={`Assigned to ${owner.display_name}`}
                          style={{
                            width: '15px',
                            height: '15px',
                            borderRadius: '50%',
                            backgroundColor: owner.profile_color,
                            border: '1.5.px solid #FFFFFF',
                            fontSize: '0.55rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                            flexShrink: 0,
                          }}
                        >
                          {owner.display_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .month-day-cell:hover .quick-add-plus {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};
