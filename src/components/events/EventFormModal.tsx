import React, { useState, useEffect } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { useAuth } from '../../context/AuthContext';
import { CalendarEvent, EventType, CATEGORY_COLORS } from '../../types';
import { format } from 'date-fns';
import { X, Calendar as CalendarIcon, CheckSquare, GraduationCap, Image as ImageIcon, Check, Palette, Flame } from 'lucide-react';
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

  const [formMode, setFormMode] = useState<'class' | 'task' | 'event' | 'habit'>('event');

  // Form Fields
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [eventType, setEventType] = useState<EventType>('personal');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<'high' | 'normal' | 'low'>('normal');
  const [taskOwner, setTaskOwner] = useState<'Eve' | 'Abbie'>(activePersonaName);
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]); // All days by default for habit
  const [selectedColor, setSelectedColor] = useState<string>('#3B82F6');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [habitEmoji, setHabitEmoji] = useState<string>('✨');
  const [showHabitOnSchedule, setShowHabitOnSchedule] = useState<boolean>(true);
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
      setRecurrenceDays(eventToEdit.recurrence_days || [1, 3]);
      setSelectedColor(eventToEdit.color || '#3B82F6');
      setImageUrl(eventToEdit.image_url || '');
    } else {
      setTitle('');
      setEventDate(format(initialDate || new Date(), 'yyyy-MM-dd'));
      setStartTime('10:00');
      setEndTime('11:00');
      setLocation('');
      setPriority('normal');
      setRecurrenceDays([1, 3]);
      setSelectedColor('#3B82F6');
      setImageUrl('');
      if (defaultCategory === 'class' || defaultCategory === 'School') {
        setFormMode('class');
        setEventType('class');
        setSelectedColor('#3B82F6');
      } else if (defaultCategory === 'task') {
        setFormMode('task');
        setEventType('task');
        setSelectedColor('#F59E0B');
      } else {
        setFormMode('event');
        setEventType('personal');
        setSelectedColor('#8B5CF6');
      }
    }
  }, [eventToEdit, initialDate, isOpen, defaultCategory]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (formMode === 'habit') {
        const newHabit = {
          id: `habit-${Date.now()}`,
          title: title.trim(),
          emoji: habitEmoji,
          color: selectedColor,
          owner: taskOwner,
          daysOfWeek: recurrenceDays,
          created_at: new Date().toISOString(),
          completedDates: [],
          showOnSchedule: showHabitOnSchedule,
        };

        const existingStr = localStorage.getItem('calender_daily_habits_v2');
        const existing = existingStr ? JSON.parse(existingStr) : [];
        const updated = [newHabit, ...existing];
        localStorage.setItem('calender_daily_habits_v2', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));

        confetti({ particleCount: 35, spread: 55, origin: { y: 0.7 } });
        onClose();
        return;
      }

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
        recurrence_days: formMode === 'class' ? recurrenceDays : undefined,
        owner_user_id: ownerId,
        created_by: ownerId || undefined,
        color: selectedColor,
        image_url: imageUrl || undefined,
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

              <button
                type="button"
                onClick={() => { setFormMode('habit'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: formMode === 'habit' ? 'var(--bg-secondary)' : 'transparent',
                  color: formMode === 'habit' ? '#F59E0B' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.775rem',
                  cursor: 'pointer',
                }}
              >
                <Flame size={13} /> Habit
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
                placeholder="Location (e.g. Room 204 or Science Hall)..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          )}

          {/* Recurring Schedule Days (Class mode) */}
          {formMode === 'class' && (
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Recurring Days
              </label>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {[
                  { label: 'M', day: 1 },
                  { label: 'T', day: 2 },
                  { label: 'W', day: 3 },
                  { label: 'Th', day: 4 },
                  { label: 'F', day: 5 },
                  { label: 'S', day: 6 },
                  { label: 'Su', day: 7 },
                ].map(({ label, day }) => {
                  const isSelected = recurrenceDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setRecurrenceDays(recurrenceDays.filter((d) => d !== day));
                        } else {
                          setRecurrenceDays([...recurrenceDays, day].sort());
                        }
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? 'var(--accent-light)' : 'var(--bg-secondary)',
                        color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '0.775rem',
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
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

          {/* Show on Daily Schedule toggle (If Habit mode) */}
          {formMode === 'habit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Habit Icon Emoji
                </label>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {['✨', '🏋️', '💧', '📚', '🧘', '🍎', '🏃', '💤', '💊', '🎯'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setHabitEmoji(em)}
                      style={{
                        fontSize: '1rem',
                        padding: '0.3rem',
                        borderRadius: '6px',
                        border: habitEmoji === em ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        backgroundColor: habitEmoji === em ? 'var(--accent-light)' : 'var(--bg-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.825rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-hover)',
                border: '1px solid var(--border-subtle)',
              }}>
                <input
                  type="checkbox"
                  checked={showHabitOnSchedule}
                  onChange={(e) => setShowHabitOnSchedule(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />
                Show this Habit on Daily Schedule
              </label>
            </div>
          )}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Item Color (Choose any color)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {[
                { name: 'Blue', hex: '#3B82F6' },
                { name: 'Pink', hex: '#EC4899' },
                { name: 'Green', hex: '#10B981' },
                { name: 'Purple', hex: '#8B5CF6' },
                { name: 'Amber', hex: '#F59E0B' },
                { name: 'Red', hex: '#EF4444' },
                { name: 'Cyan', hex: '#06B6D4' },
                { name: 'Dark', hex: '#3F3F46' },
              ].map((col) => (
                <button
                  key={col.hex}
                  type="button"
                  onClick={() => setSelectedColor(col.hex)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: col.hex,
                    border: selectedColor === col.hex ? '2.5px solid var(--text-primary)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    transition: 'transform 0.12s ease',
                    transform: selectedColor === col.hex ? 'scale(1.1)' : 'scale(1)',
                  }}
                  title={col.name}
                >
                  {selectedColor === col.hex && <Check size={13} strokeWidth={3} />}
                </button>
              ))}

              {/* Custom Multi-Color Rainbow Picker Icon */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'conic-gradient(from 0deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #00C0FF, #0000FF, #8B00FF, #FF0000)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  cursor: 'pointer',
                  border: '1.5px solid var(--border-color)',
                }}
                title="Choose any custom color (Multi-color Wheel)"
              >
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                  }}
                />
              </div>
            </div>
          </div>

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
