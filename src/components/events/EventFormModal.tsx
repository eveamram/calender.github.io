import React, { useState, useEffect } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { useAuth } from '../../context/AuthContext';
import { CalendarEvent, EventCategory, CATEGORY_COLORS } from '../../types';
import { format } from 'date-fns';
import { X } from 'lucide-react';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
  eventToEdit?: CalendarEvent | null;
}

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  eventToEdit,
}) => {
  const { addEvent, updateEvent } = useCalendar();
  const { userProfile } = useAuth();

  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [category, setCategory] = useState<EventCategory>('School');
  const [color, setColor] = useState('#3B82F6');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setEventDate(eventToEdit.event_date);
      setStartTime(eventToEdit.start_time || '10:00');
      setEndTime(eventToEdit.end_time || '11:00');
      setCategory((eventToEdit.event_type as EventCategory) || 'School');
      setColor(eventToEdit.color || '#3B82F6');
      setLocation(eventToEdit.location || '');
      setNotes(eventToEdit.notes || '');
    } else {
      setTitle('');
      setEventDate(format(initialDate || new Date(), 'yyyy-MM-dd'));
      setStartTime('10:00');
      setEndTime('11:00');
      setCategory('School');
      setColor('#3B82F6');
      setLocation('');
      setNotes('');
    }
  }, [eventToEdit, initialDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (eventToEdit) {
        await updateEvent(eventToEdit.id, {
          title: title.trim(),
          event_date: eventDate,
          start_time: startTime,
          end_time: endTime,
          event_type: category,
          color,
          location: location.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      } else {
        await addEvent({
          owner_user_id: userProfile?.id || null,
          title: title.trim(),
          event_type: category,
          event_date: eventDate,
          start_time: startTime,
          end_time: endTime,
          is_all_day: false,
          color,
          location: location.trim() || undefined,
          notes: notes.trim() || undefined,
        });
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
      backdropFilter: 'blur(3px)',
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
        boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
      }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
        }}>
          <h3 style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}>
            {eventToEdit ? 'Edit Event' : 'New Event'}
          </h3>

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

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Event Title Input */}
          <div>
            <input
              type="text"
              className="input-field"
              placeholder="Event title (e.g., CS 101 Lecture)..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
              style={{
                fontSize: '0.975rem',
                fontWeight: 700,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                padding: '0.75rem 1rem',
              }}
            />
          </div>

          {/* Date & Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Date
              </label>
              <input
                type="date"
                className="input-field"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                Start Time
              </label>
              <input
                type="time"
                className="input-field"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>

          {/* Category Color Swatches */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Category
            </label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {CATEGORY_COLORS.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => {
                    setCategory(cat.label);
                    setColor(cat.color);
                  }}
                  style={{
                    padding: '0.35rem 0.7rem',
                    borderRadius: '6px',
                    border: category === cat.label ? `2px solid ${cat.color}` : '1px solid var(--border-color)',
                    backgroundColor: category === cat.label ? `${cat.color}15` : 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: '0.775rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cat.color }} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location Input */}
          <div>
            <input
              type="text"
              className="input-field"
              placeholder="Location (optional)..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Actions */}
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
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
              }}
            >
              {isSubmitting ? 'Saving...' : eventToEdit ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
