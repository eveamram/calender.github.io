import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { CalendarEvent } from '../../types';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
} from 'date-fns';
import { Clock, MapPin, BookOpen } from 'lucide-react';

interface WeekViewProps {
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectDate: (date: Date) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({ onSelectEvent, onSelectDate }) => {
  const { currentDate, filteredEvents, members } = useCalendar();

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredEvents.filter((e) => e.event_date === dateStr);
  };

  const getOwnerMember = (userId?: string | null) => {
    if (!userId) return null;
    return members.find((m) => m.user_id === userId);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', width: '100%' }}>
      {days.map((day) => {
        const dayEvents = getEventsForDate(day);
        const isCurrentDay = isToday(day);

        return (
          <div
            key={day.toISOString()}
            className="glass-card"
            style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              borderTop: isCurrentDay ? '4px solid var(--accent-primary)' : '1px solid var(--border-color)',
              backgroundColor: isCurrentDay ? 'var(--accent-light)' : 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '220px',
            }}
          >
            {/* Day Header */}
            <div
              onClick={() => onSelectDate(day)}
              style={{
                cursor: 'pointer',
                textAlign: 'center',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid var(--border-color)',
                marginBottom: '0.75rem',
              }}
            >
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                {format(day, 'EEE')}
              </div>
              <div style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                color: isCurrentDay ? 'var(--accent-primary)' : 'var(--text-primary)',
              }}>
                {format(day, 'd')}
              </div>
            </div>

            {/* Events for Day */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              {dayEvents.length === 0 ? (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>
                  No events
                </div>
              ) : (
                dayEvents.map((evt) => {
                  const owner = getOwnerMember(evt.owner_user_id || evt.created_by);
                  return (
                    <div
                      key={evt.id}
                      onClick={() => onSelectEvent(evt)}
                      style={{
                        padding: '0.6rem',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-secondary)',
                        borderLeft: `4px solid ${evt.color || '#3B82F6'}`,
                        boxShadow: 'var(--shadow-sm)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {evt.title}
                        </span>
                        {owner && (
                          <div
                            title={owner.display_name}
                            style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              backgroundColor: owner.profile_color,
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </div>

                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={12} />
                        {evt.is_all_day ? 'All Day' : `${evt.start_time || ''}`}
                      </div>

                      {evt.course && (
                        <div style={{ fontSize: '0.7rem', color: evt.color || '#3B82F6', fontWeight: 600, marginTop: '0.2rem' }}>
                          {evt.course}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
