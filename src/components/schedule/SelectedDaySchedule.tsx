import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { CalendarEvent } from '../../types';
import { format, isBefore, startOfDay, parseISO } from 'date-fns';
import { Plus, CheckCircle2, Circle, Clock, MapPin, User } from 'lucide-react';
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
  const { filteredEvents, members, toggleEventCompleted, activePersonaFilter, showTodosOnCalendar } = useCalendar();

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  // Filter all events/classes/tasks occurring on this selected date
  const dayEvents = filteredEvents.filter((e) => {
    const eventDate = e.event_date || e.due_date;
    if (eventDate !== selectedDateStr) return false;

    // Filter out tasks when task calendar sync is OFF, unless task explicitly has show_on_calendar === true
    if (e.event_type === 'task') {
      if (e.show_on_calendar === false) return false;
      if (!showTodosOnCalendar && e.show_on_calendar !== true) return false;
    }

    return true;
  });

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

  const todayStart = startOfDay(new Date());

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'class':
      case 'School':
        return { label: 'Class', bg: '#DBEAFE', color: '#1E40AF' };
      case 'task':
        return { label: 'Task', bg: '#FEF3C7', color: '#92400E' };
      case 'exam':
        return { label: 'Exam', bg: '#FEE2E2', color: '#991B1B' };
      case 'appointment':
        return { label: 'Appointment', bg: '#D1FAE5', color: '#065F46' };
      case 'birthday':
        return { label: 'Birthday', bg: '#FCE7F3', color: '#9D174D' };
      case 'trip':
        return { label: 'Trip', bg: '#EDE9FE', color: '#5B21B6' };
      default:
        return { label: type, bg: '#F3F4F6', color: '#374151' };
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.1rem',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 'var(--shadow-subtle)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.75rem',
        paddingBottom: '0.6rem',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div>
          <div style={{ fontSize: '0.675rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
            Daily Schedule
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '1px' }}>
            {format(selectedDate, 'EEEE, MMM d')}
          </h3>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onOpenAddEvent}
          style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
        >
          <Plus size={13} /> Add
        </button>
      </div>

      {/* Events List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', flex: 1 }}>
        {dayEvents.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem 0',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            fontStyle: 'italic',
          }}>
            Nothing scheduled.
          </div>
        ) : (
          dayEvents.map((evt) => {
            const eventDateStr = evt.event_date || evt.due_date;
            const eventDateObj = eventDateStr ? parseISO(eventDateStr) : new Date();
            const isPastDay = isBefore(eventDateObj, todayStart);
            const isCompleted = evt.is_completed || isPastDay;
            const ownerName = getOwnerName(evt);
            const typeBadge = getEventTypeLabel(evt.event_type);

            const ownerStyle =
              ownerName === 'Eve' ? { bg: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE' } :
              { bg: '#FDF2F8', color: '#9D174D', border: '1px solid #FBCFE8' };

            const itemColor = evt.color || '#3B82F6';
            const priority = evt.priority || 'normal';

            const priorityBadge =
              priority === 'high' ? { label: 'High', bg: '#FEE2E2', color: '#991B1B' } :
              priority === 'low' ? { label: 'Low', bg: '#D1FAE5', color: '#065F46' } :
              { label: 'Normal', bg: '#FEF3C7', color: '#92400E' };

            return (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '0.65rem',
                  cursor: 'pointer',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isCompleted ? 'var(--bg-hover)' : 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderLeft: `3.5px solid ${itemColor}`,
                  transition: 'background-color 0.12s ease',
                  opacity: isCompleted ? 0.6 : 1,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.675rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={10} /> {evt.start_time ? evt.start_time : 'All Day'} {evt.end_time ? `– ${evt.end_time}` : ''}
                  </div>

                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    textDecoration: isCompleted ? 'line-through' : 'none',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {evt.title}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '3px', flexWrap: 'wrap' }}>
                    {/* Category Type Badge */}
                    <span style={{
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.35rem',
                      borderRadius: '4px',
                      backgroundColor: typeBadge.bg,
                      color: typeBadge.color,
                    }}>
                      {typeBadge.label}
                    </span>

                    {/* Priority Badge */}
                    <span style={{
                      fontSize: '0.625rem',
                      fontWeight: 800,
                      padding: '0.1rem 0.35rem',
                      borderRadius: '4px',
                      backgroundColor: priorityBadge.bg,
                      color: priorityBadge.color,
                    }}>
                      {priorityBadge.label} Priority
                    </span>

                    {/* Owner Badge (Rendered ONLY when persona filter is set to "Both") */}
                    {activePersonaFilter === 'all' && (
                      <span style={{
                        fontSize: '0.625rem',
                        fontWeight: 800,
                        padding: '0.1rem 0.4rem',
                        borderRadius: '999px',
                        backgroundColor: ownerStyle.bg,
                        color: ownerStyle.color,
                        border: ownerStyle.border,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                      }}>
                        <User size={9} /> {ownerName}
                      </span>
                    )}

                    {evt.location && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <MapPin size={9} /> {evt.location}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleComplete(evt.id, evt.is_completed);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isCompleted ? '#10B981' : 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                >
                  {isCompleted ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
