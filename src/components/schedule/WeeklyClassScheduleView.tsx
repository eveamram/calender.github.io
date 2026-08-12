import React, { useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { CalendarEvent } from '../../types';
import { GraduationCap, Plus, Clock, MapPin, User, Calendar as CalendarIcon } from 'lucide-react';

import { useIsMobile } from '../../hooks/useIsMobile';

interface WeeklyClassScheduleViewProps {
  onSelectEvent?: (event: CalendarEvent) => void;
  onOpenAddEvent?: () => void;
}

export const WeeklyClassScheduleView: React.FC<WeeklyClassScheduleViewProps> = ({
  onSelectEvent,
  onOpenAddEvent,
}) => {
  const isMobile = useIsMobile();
  const { filteredEvents, members, activePersonaFilter } = useCalendar();
  const [selectedMobileDayIdx, setSelectedMobileDayIdx] = useState<number>(0); // 0 = Mon, 1 = Tue...

  // Filter strictly for class events ONLY (exclude birthdays, tasks, exams, appointments, etc.)
  const classEvents = filteredEvents.filter(
    (e) => e.event_type === 'class' || e.event_type === 'School'
  );

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

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

  if (isMobile) {
    const selectedDayNumber = selectedMobileDayIdx + 1; // 1-indexed
    const dayClasses = classEvents.filter((c) => {
      if (c.recurrence_days && c.recurrence_days.length > 0) {
        return c.recurrence_days.includes(selectedDayNumber);
      }
      return true;
    });
    dayClasses.sort((a, b) => (a.start_time || '00:00').localeCompare(b.start_time || '00:00'));

    return (
      <div style={{ paddingBottom: '4.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Class Schedule
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Select day to view timeline
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAddEvent}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '10px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Plus size={15} /> Add Class
          </button>
        </div>

        {/* Horizontal Day Picker Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.35rem',
          overflowX: 'auto',
          backgroundColor: 'var(--bg-secondary)',
          padding: '6px',
          borderRadius: '999px',
          border: '1px solid var(--border-color)',
          marginBottom: '1.25rem',
        }}>
          {shortDays.map((d, idx) => {
            const isSelected = selectedMobileDayIdx === idx;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedMobileDayIdx(idx)}
                style={{
                  flex: 1,
                  minWidth: '40px',
                  padding: '0.45rem 0',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: isSelected ? '#2563EB' : 'transparent',
                  color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {d}
              </button>
            );
          })}
        </div>

        {/* Selected Day Class Timeline Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {dayClasses.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2.5rem 1rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
            }}>
              No classes scheduled for {shortDays[selectedMobileDayIdx]}.
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
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)',
                    borderLeft: `4px solid ${cls.color || '#3B82F6'}`,
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {cls.title}
                    </span>

                    {activePersonaFilter === 'all' && (
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '999px',
                        backgroundColor: ownerStyle.bg,
                        color: ownerStyle.color,
                      }}>
                        {ownerName}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                    <Clock size={13} color="var(--accent-primary)" /> {cls.start_time || '10:00'} – {cls.end_time || '11:00'}
                  </div>

                  {cls.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.775rem' }}>
                      <MapPin size={13} /> {cls.location}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

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
            className="btn btn-primary"
            onClick={onOpenAddEvent}
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.825rem' }}
          >
            <Plus size={15} /> Add Class
          </button>
        </div>
      </div>

      {/* Weekly Grid (5 Columns Mon - Fri) */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(170px, 1fr))',
          gap: '0.85rem',
          minWidth: '850px',
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
    </div>
  );
};
