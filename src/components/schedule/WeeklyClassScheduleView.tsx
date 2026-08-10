import React, { useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { CalendarEvent } from '../../types';
import { GraduationCap, Plus, Clock, MapPin, User, Calendar as CalendarIcon } from 'lucide-react';

interface WeeklyClassScheduleViewProps {
  onSelectEvent?: (event: CalendarEvent) => void;
  onOpenAddEvent?: () => void;
}

export const WeeklyClassScheduleView: React.FC<WeeklyClassScheduleViewProps> = ({
  onSelectEvent,
  onOpenAddEvent,
}) => {
  const { filteredEvents, members, activePersonaFilter } = useCalendar();
  const [viewWeekend, setViewWeekend] = useState(false);

  // Filter strictly for class events ONLY (exclude birthdays, tasks, exams, appointments, etc.)
  const classEvents = filteredEvents.filter(
    (e) => e.event_type === 'class' || e.event_type === 'School'
  );

  const daysOfWeek = viewWeekend
    ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

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

  const formatRecurringDays = (days?: number[]) => {
    if (!days || days.length === 0) return '';
    const dayMap: Record<number, string> = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun' };
    return days.map((d) => dayMap[d] || '').filter(Boolean).join(' + ');
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.75rem',
      width: '100%',
      boxShadow: 'var(--shadow-subtle)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: 'var(--accent-light)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <GraduationCap size={20} strokeWidth={2.2} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Class Schedule
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Weekly class timetable & recurring courses
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setViewWeekend(!viewWeekend)}
            style={{ fontSize: '0.775rem', padding: '0.4rem 0.75rem' }}
          >
            {viewWeekend ? '5-Day View' : '7-Day View'}
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenAddEvent}
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.825rem' }}
          >
            <Plus size={15} /> Add Class
          </button>
        </div>
      </div>

      {/* Weekly Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${viewWeekend ? '160px' : '210px'}, 1fr))`,
        gap: '1rem',
      }}>
        {daysOfWeek.map((dayName, idx) => {
          const dayNumber = idx + 1; // 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat, 7 = Sun

          // Filter classes for this day
          const dayClasses = classEvents.filter((c) => {
            if (c.recurrence_days && c.recurrence_days.length > 0) {
              return c.recurrence_days.includes(dayNumber);
            }
            // If no recurrence days specified, fall back to checking event_date weekday
            return true;
          });

          // Sort chronologically by start_time
          dayClasses.sort((a, b) => (a.start_time || '00:00').localeCompare(b.start_time || '00:00'));

          return (
            <div
              key={dayName}
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '340px',
              }}
            >
              <div style={{
                textAlign: 'center',
                paddingBottom: '0.65rem',
                borderBottom: '1px solid var(--border-color)',
                marginBottom: '0.75rem',
              }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {dayName}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
                {dayClasses.length === 0 ? (
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', marginTop: '1.5rem' }}>
                    No classes
                  </div>
                ) : (
                  dayClasses.map((cls) => {
                    const ownerName = getOwnerName(cls);
                    const ownerStyle = ownerName === 'Eve' ? { bg: '#EFF6FF', color: '#1E40AF' } : { bg: '#FDF2F8', color: '#9D174D' };
                    const recurringSummary = formatRecurringDays(cls.recurrence_days);

                    return (
                      <div
                        key={cls.id}
                        onClick={() => onSelectEvent && onSelectEvent(cls)}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '8px',
                          backgroundColor: `${cls.color || '#3B82F6'}10`,
                          borderLeft: `3.5px solid ${cls.color || '#3B82F6'}`,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                          {cls.title}
                        </div>

                        <div style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Clock size={11} /> {cls.start_time || '10:00'} – {cls.end_time || '11:00'}
                        </div>

                        {cls.location && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={11} /> {cls.location}
                          </div>
                        )}

                        {recurringSummary && (
                          <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CalendarIcon size={10} /> {recurringSummary}
                          </div>
                        )}

                        {/* Owner Badge (ONLY when persona filter is "Both") */}
                        {activePersonaFilter === 'all' && (
                          <div style={{ marginTop: '4px' }}>
                            <span style={{
                              fontSize: '0.625rem',
                              fontWeight: 800,
                              padding: '0.1rem 0.4rem',
                              borderRadius: '999px',
                              backgroundColor: ownerStyle.bg,
                              color: ownerStyle.color,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                            }}>
                              <User size={9} /> {ownerName}
                            </span>
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
    </div>
  );
};
