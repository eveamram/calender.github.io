import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { CalendarEvent } from '../../types';
import { format } from 'date-fns';
import { Plus, CheckCircle2, Circle, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SelectedDayScheduleProps {
  selectedDate: Date;
  onSelectEvent: (event: CalendarEvent) => void;
  onOpenAddEvent: () => void;
}

export const SelectedDaySchedule: React.FC<SelectedDayScheduleProps> = ({
  selectedDate,
  onSelectEvent,
  onOpenAddEvent,
}) => {
  const { filteredEvents, toggleEventCompleted } = useCalendar();

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayEvents = filteredEvents.filter((e) => e.event_date === selectedDateStr);

  // Sort events chronologically by start time
  dayEvents.sort((a, b) => {
    if (!a.start_time) return -1;
    if (!b.start_time) return 1;
    return a.start_time.localeCompare(b.start_time);
  });

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
      minHeight: '420px',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 'var(--shadow-subtle)',
    }}>
      {/* Schedule Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        paddingBottom: '0.85rem',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
            Daily Schedule
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            {format(selectedDate, 'EEEE, MMM d')}
          </h3>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onOpenAddEvent}
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Chronological Event List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
        {dayEvents.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            fontStyle: 'italic',
          }}>
            Nothing scheduled.
          </div>
        ) : (
          dayEvents.map((evt) => {
            const isCompleted = evt.is_completed;
            return (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  padding: '0.5rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isCompleted ? 'var(--bg-hover)' : 'transparent',
                  transition: 'background-color 0.12s ease',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={11} /> {evt.start_time ? evt.start_time : 'All Day'} {evt.end_time ? `- ${evt.end_time}` : ''}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    textDecoration: isCompleted ? 'line-through' : 'none',
                    opacity: isCompleted ? 0.5 : 1,
                  }}>
                    {evt.emoji ? `${evt.emoji} ` : ''}{evt.title}
                  </div>
                  {evt.location && (
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      📍 {evt.location}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleComplete(evt.id, isCompleted);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isCompleted ? '#10B981' : 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                >
                  {isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
