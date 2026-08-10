import React, { useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { useAuth } from '../../context/AuthContext';
import { CalendarEvent } from '../../types';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  addDays,
  subDays,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Clock, CheckCircle2, Circle, GraduationCap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WeeklyClassScheduleViewProps {
  onSelectEvent: (event: CalendarEvent) => void;
  onOpenAddEvent: () => void;
}

export const WeeklyClassScheduleView: React.FC<WeeklyClassScheduleViewProps> = ({
  onSelectEvent,
  onOpenAddEvent,
}) => {
  const { events, members, currentDate, setCurrentDate, toggleEventCompleted } = useCalendar();
  const { userProfile } = useAuth();
  const [selectedPerson, setSelectedPerson] = useState<'Eve' | 'Abbie' | 'all'>('Eve');

  const eveUser = members.find((m) => m.display_name.toLowerCase().includes('eve')) || members[0];
  const abbieUser = members.find((m) => m.display_name.toLowerCase().includes('abbie')) || members[1];

  // Filter events for Class Schedule
  const classEvents = events.filter((evt) => {
    const isClass = evt.event_type === 'School' || evt.course || evt.title.toLowerCase().includes('class');
    if (!isClass && events.length > 5) return false;

    if (selectedPerson === 'Eve' && eveUser) {
      return evt.owner_user_id === eveUser.user_id || evt.created_by === eveUser.user_id;
    }
    if (selectedPerson === 'Abbie' && abbieUser) {
      return evt.owner_user_id === abbieUser.user_id || evt.created_by === abbieUser.user_id;
    }
    return true;
  });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getOwnerMember = (userId?: string | null) => {
    if (!userId) return null;
    return members.find((m) => m.user_id === userId);
  };

  const handleToggleComplete = (eventId: string, currentCompleted?: boolean) => {
    if (!currentCompleted) {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    }
    toggleEventCompleted(eventId);
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
      {/* Controls & Navigation Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)' }}>
            <GraduationCap size={18} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Class Schedule
            </span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            Week of {format(weekStart, 'MMM d, yyyy')}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Sleek Person Selector (Eve -> Abbie -> Both) */}
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
                onClick={() => setSelectedPerson(p)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: selectedPerson === p
                    ? (p === 'Eve' ? '#3B82F6' : p === 'Abbie' ? '#EC4899' : 'var(--text-primary)')
                    : 'transparent',
                  color: selectedPerson === p ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {p === 'Eve' ? '🔵 Eve' : p === 'Abbie' ? '💗 Abbie' : '👥 Both'}
              </button>
            ))}
          </div>

          {/* Week Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCurrentDate(subDays(currentDate, 7))}
              style={{ padding: '0.35rem 0.55rem' }}
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCurrentDate(new Date())}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', fontWeight: 700 }}
            >
              Today
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCurrentDate(addDays(currentDate, 7))}
              style={{ padding: '0.35rem 0.55rem' }}
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenAddEvent}
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
          >
            <Plus size={14} /> Add Class
          </button>
        </div>
      </div>

      {/* Weekly Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(130px, 1fr))',
        gap: '10px',
        overflowX: 'auto',
      }}>
        {weekDays.map((day) => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const isTodayDay = isToday(day);
          const dayClasses = classEvents.filter((e) => e.event_date === dayStr);

          return (
            <div
              key={day.toISOString()}
              style={{
                backgroundColor: isTodayDay ? 'var(--accent-light)' : 'var(--bg-primary)',
                border: isTodayDay ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                minHeight: '380px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
              }}
            >
              <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  {format(day, 'EEE')}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: isTodayDay ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                  {format(day, 'MMM d')}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1 }}>
                {dayClasses.length === 0 ? (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem', fontStyle: 'italic' }}>
                    No classes
                  </div>
                ) : (
                  dayClasses.map((evt) => {
                    const owner = getOwnerMember(evt.owner_user_id || evt.created_by);
                    const isCompleted = evt.is_completed;

                    return (
                      <div
                        key={evt.id}
                        onClick={() => onSelectEvent(evt)}
                        style={{
                          padding: '0.55rem',
                          borderRadius: '8px',
                          backgroundColor: isCompleted ? 'var(--bg-hover)' : `${evt.color || '#3B82F6'}15`,
                          borderLeft: `3px solid ${evt.color || '#3B82F6'}`,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem',
                          opacity: isCompleted ? 0.55 : 1,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                          <span style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            textDecoration: isCompleted ? 'line-through' : 'none',
                          }}>
                            {evt.emoji ? `${evt.emoji} ` : ''}{evt.title}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleComplete(evt.id, isCompleted);
                            }}
                            style={{ background: 'transparent', border: 'none', color: isCompleted ? '#10B981' : 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                          >
                            {isCompleted ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                          </button>
                        </div>

                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={10} /> {evt.start_time || 'All Day'} {evt.end_time ? `- ${evt.end_time}` : ''}
                        </div>

                        {owner && (
                          <div style={{ fontSize: '0.675rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {owner.display_name}
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
