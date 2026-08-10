import React, { useState, useEffect } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { useAuth } from '../../context/AuthContext';
import { CalendarEvent, EventType, CATEGORY_COLORS } from '../../types';
import { format } from 'date-fns';
import { X, Calendar as CalendarIcon, CheckSquare, GraduationCap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
  eventToEdit?: CalendarEvent | null;
  defaultCategory?: EventType;
}

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  eventToEdit,
  defaultCategory = 'event',
}) => {
  const { addEvent, updateEvent, members } = useCalendar();
  const { userProfile } = useAuth();
  const activePersonaName = (userProfile?.display_name as 'Eve' | 'Abbie') || 'Eve';

  const [formMode, setFormMode] = useState<'class' | 'task' | 'event'>('event');

  // Form Fields
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [eventType, setEventType] = useState<EventType>('personal');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<'high' | 'normal' | 'low'>('normal');
  const [taskOwner, setTaskOwner] = useState<'Eve' | 'Abbie'>(activePersonaName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTaskOwner(activePersonaName);
  }, [activePersonaName]);

  useEffect(() => {
    if (eventToEdit) {
      if (eventToEdit.event_type === 'class' || eventToEdit.event_type === 'School') {
        setFormMode('class');
      } else if (eventToEdit.event_type === 'task') {
        setFormMode('task');
      } else {
        setFormMode('event');
      }
      setTitle(eventToEdit.title);
      setEventDate(eventToEdit.event_date || eventToEdit.due_date || format(new Date(), 'yyyy-MM-dd'));
      setStartTime(eventToEdit.start_time || '10:00');
      setEndTime(eventToEdit.end_time || '11:00');
      setEventType(eventToEdit.event_type as EventType);
      setLocation(eventToEdit.location || '');
      setPriority(eventToEdit.priority || 'normal');
    } else {
      setTitle('');
      setEventDate(format(initialDate || new Date(), 'yyyy-MM-dd'));
      setStartTime('10:00');
      setEndTime('11:00');
      setLocation('');
      setPriority('normal');
      if (defaultCategory === 'class' || defaultCategory === 'School') {
        setFormMode('class');
        setEventType('class');
      } else if (defaultCategory === 'task') {
        setFormMode('task');
        setEventType('task');
      } else {
        setFormMode('event');
        setEventType('personal');
      }
    }
  }, [eventToEdit, initialDate, isOpen, defaultCategory]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const ownerUser = members.find((m) => m.display_name === taskOwner);
      const ownerId = ownerUser ? ownerUser.user_id : userProfile?.id || null;

      let finalType: EventType = eventType;
      if (formMode === 'class') finalType = 'class';
      if (formMode === 'task') finalType = 'task';

      const eventPayload: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'> = {
        title: title.trim(),
        event_type: finalType,
        event_date: eventDate || undefined,
        due_date: formMode === 'task' ? eventDate || undefined : undefined,
        start_time: startTime || undefined,
        end_time: endTime || undefined,
        location: location.trim() || undefined,
        priority: formMode === 'task' ? priority : undefined,
        owner_user_id: ownerId,
        created_by: ownerId || undefined,
        color:
          finalType === 'class' ? '#3B82F6' :
          finalType === 'task' ? '#F59E0B' :
          finalType === 'exam' ? '#EF4444' :
          finalType === 'appointment' ? '#10B981' :
          finalType === 'birthday' ? '#EC4899' :
          finalType === 'trip' ? '#8B5CF6' : '#3B82F6',
        is_completed: false,
      };

      if (eventToEdit) {
        await updateEvent(eventToEdit.id, eventPayload);
      } else {
        await addEvent(eventPayload);
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
      }

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(9, 9, 11, 0.45)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '1rem',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '440px',
        padding: '1.5rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
        }}>
          {!eventToEdit ? (
            <div style={{
              display: 'flex',
              backgroundColor: 'var(--bg-hover)',
              padding: '2px',
              borderRadius: '999px',
              border: '1px solid var(--border-color)',
            }}>
              <button
                type="button"
                onClick={() => { setFormMode('event'); setEventType('personal'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: formMode === 'event' ? 'var(--bg-secondary)' : 'transparent',
                  color: formMode === 'event' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.775rem',
                  cursor: 'pointer',
                }}
              >
                <CalendarIcon size={13} /> Event
              </button>

              <button
                type="button"
                onClick={() => { setFormMode('class'); setEventType('class'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: formMode === 'class' ? 'var(--bg-secondary)' : 'transparent',
                  color: formMode === 'class' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.775rem',
                  cursor: 'pointer',
                }}
              >
                <GraduationCap size={13} /> Class
              </button>

              <button
                type="button"
                onClick={() => { setFormMode('task'); setEventType('task'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: formMode === 'task' ? 'var(--bg-secondary)' : 'transparent',
                  color: formMode === 'task' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.775rem',
                  cursor: 'pointer',
                }}
              >
                <CheckSquare size={13} /> Task
              </button>
            </div>
          ) : (
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Edit Entry
            </h3>
          )}

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Title */}
          <div>
            <input
              type="text"
              className="input-field"
              placeholder={
                formMode === 'class' ? "Class Title (e.g. Calculus II)..." :
                formMode === 'task' ? "Task description..." : "Event title..."
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
              style={{ fontSize: '0.975rem', fontWeight: 700, padding: '0.75rem 1rem' }}
            />
          </div>

          {/* Date & Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                {formMode === 'task' ? 'Due Date (Optional)' : 'Date'}
              </label>
              <input
                type="date"
                className="input-field"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required={formMode !== 'task'}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Owner
              </label>
              <select
                className="input-field"
                value={taskOwner}
                onChange={(e) => setTaskOwner(e.target.value as 'Eve' | 'Abbie')}
              >
                <option value="Eve">Eve</option>
                <option value="Abbie">Abbie</option>
              </select>
            </div>
          </div>

          {/* Start & End Time (for Class or Event) */}
          {formMode !== 'task' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                  Start Time
                </label>
                <input
                  type="time"
                  className="input-field"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                  End Time
                </label>
                <input
                  type="time"
                  className="input-field"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Event Category (If Event mode) */}
          {formMode === 'event' && (
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Event Category
              </label>
              <select
                className="input-field"
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
              >
                <option value="personal">☕ Personal</option>
                <option value="exam">📝 Exam</option>
                <option value="appointment">🩺 Appointment</option>
                <option value="birthday">🎂 Birthday</option>
                <option value="trip">✈️ Trip</option>
                <option value="study">💡 Study Session</option>
                <option value="meeting">🤝 Meeting</option>
              </select>
            </div>
          )}

          {/* Location Input (Class or Event) */}
          {formMode !== 'task' && (
            <div>
              <input
                type="text"
                className="input-field"
                placeholder="Location (e.g. Room 204 or Cafe)..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          )}

          {/* Priority (If Task mode) */}
          {formMode === 'task' && (
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Priority
              </label>
              <select
                className="input-field"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'high' | 'normal' | 'low')}
              >
                <option value="high">High Priority</option>
                <option value="normal">Normal Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.6rem',
            marginTop: '0.5rem',
          }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !title.trim()}
              style={{ fontWeight: 800 }}
            >
              {isSubmitting ? 'Saving...' : formMode === 'class' ? 'Add Class' : formMode === 'task' ? 'Add Task' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
