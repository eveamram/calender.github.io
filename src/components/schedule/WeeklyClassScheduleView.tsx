import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { CalendarEvent } from '../../types';
import { GraduationCap, Plus, Clock, MapPin, User } from 'lucide-react';

interface WeeklyClassScheduleViewProps {
  onSelectEvent?: (event: CalendarEvent) => void;
  onOpenAddEvent?: () => void;
}

export const WeeklyClassScheduleView: React.FC<WeeklyClassScheduleViewProps> = ({
  onSelectEvent,
  onOpenAddEvent,
}) => {
  const { filteredEvents, members, activePersonaFilter, setActivePersonaFilter } = useCalendar();

  // Filter strictly for class events
  const classEvents = filteredEvents.filter(
    (e) => e.event_type === 'class' || e.event_type === 'School'
  );

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

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
      {/* View Header */}
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
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#EFF6FF',
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <GraduationCap size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Class Schedule
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Weekly timetable of recurring classes
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Persona Switcher (Eve | Abbie | Both) */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-hover)',
            padding: '3px',
            borderRadius: '999px',
            border: '1px solid var(--border-color)',
          }}>
            {(['Eve', 'Abbie', 'all'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setActivePersonaFilter(p)}
                style={{
                  padding: '0.35rem 0.9rem',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: activePersonaFilter === p
                    ? (p === 'Eve' ? '#3B82F6' : p === 'Abbie' ? '#EC4899' : 'var(--text-primary)')
                    : 'transparent',
                  color: activePersonaFilter === p ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {p === 'all' ? 'Both' : p}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenAddEvent}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <Plus size={16} /> Add Class
          </button>
        </div>
      </div>

      {/* 5-Column Weekly Timetable Grid (Monday to Friday) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
      }}>
        {daysOfWeek.map((dayName, idx) => {
          // Find classes that fall on this weekday
          const dayClasses = classEvents.filter((c) => {
            if (c.recurrence_days && c.recurrence_days.includes(idx + 1)) return true;
            return true; // Display class in timetable
          });

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
                minHeight: '320px',
              }}
            >
              <div style={{
                textAlign: 'center',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid var(--border-color)',
                marginBottom: '0.75rem',
              }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {dayName}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
                {dayClasses.length === 0 ? (
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', marginTop: '1rem' }}>
                    No classes
                  </div>
                ) : (
                  dayClasses.map((cls) => {
                    const ownerName = getOwnerName(cls);
                    const ownerStyle = ownerName === 'Eve' ? { bg: '#EFF6FF', color: '#1E40AF' } : { bg: '#FDF2F8', color: '#9D174D' };

                    return (
                      <div
                        key={cls.id}
                        onClick={() => onSelectEvent && onSelectEvent(cls)}
                        style={{
                          padding: '0.65rem',
                          borderRadius: '8px',
                          backgroundColor: `${cls.color || '#3B82F6'}12`,
                          borderLeft: `3.5px solid ${cls.color || '#3B82F6'}`,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px',
                          transition: 'all 0.12s ease',
                        }}
                      >
                        <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {cls.title}
                        </div>

                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={11} /> {cls.start_time || '10:00'} – {cls.end_time || '11:15'}
                        </div>

                        {cls.location && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={11} /> {cls.location}
                          </div>
                        )}

                        {/* Owner Badge (Rendered ONLY when persona filter is set to "Both") */}
                        {activePersonaFilter === 'all' && (
                          <div style={{ marginTop: '4px' }}>
                            <span style={{
                              fontSize: '0.65rem',
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
