import React, { useState, useEffect, useRef } from 'react';
import { CalendarEvent, EventType, EVENT_TYPES } from '../../types';
import { useCalendar } from '../../context/CalendarContext';
import { useAuth } from '../../context/AuthContext';
import { X, Calendar, Clock, MapPin, BookOpen, User, Tag, Check, Zap, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

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
  const { addEvent, updateEvent, members } = useCalendar();
  const { userProfile, user } = useAuth();
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<EventType>('Exam');
  const [course, setCourse] = useState('');
  const [eventDate, setEventDate] = useState(format(initialDate || new Date(), 'yyyy-MM-dd'));
  const [isAllDay, setIsAllDay] = useState(true);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:30');
  const [ownerUserId, setOwnerUserId] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('#EF4444');
  const [reminderMinutes, setReminderMinutes] = useState(60);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setEventType(eventToEdit.event_type);
      setCourse(eventToEdit.course || '');
      setEventDate(eventToEdit.event_date);
      setIsAllDay(eventToEdit.is_all_day);
      setStartTime(eventToEdit.start_time || '10:00');
      setEndTime(eventToEdit.end_time || '11:30');
      setOwnerUserId(eventToEdit.owner_user_id || '');
      setLocation(eventToEdit.location || '');
      setNotes(eventToEdit.notes || '');
      setColor(eventToEdit.color || '#EF4444');
      setReminderMinutes(eventToEdit.reminder_minutes || 0);
    } else {
      setTitle('');
      setEventType('Exam');
      setCourse('');
      setEventDate(format(initialDate || new Date(), 'yyyy-MM-dd'));
      setIsAllDay(true);
      setStartTime('10:00');
      setEndTime('11:30');
      setOwnerUserId(userProfile?.id || user?.id || (members[0]?.user_id || ''));
      setLocation('');
      setNotes('');
      setColor('#EF4444');
      setReminderMinutes(60);
    }
  }, [eventToEdit, initialDate, isOpen, userProfile, user, members]);

  // Quick Preset Handlers for instant 1-click creation!
  const applyPreset = (presetType: EventType, presetTitle: string, presetColor: string) => {
    setEventType(presetType);
    if (!title) setTitle(presetTitle);
    setColor(presetColor);
  };

  const handleEventTypeSelect = (type: EventType) => {
    setEventType(type);
    const found = EVENT_TYPES.find((t) => t.label === type);
    if (found) {
      setColor(found.color);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Event title is required.');
      return;
    }

    setLoading(true);

    const payload = {
      title: title.trim(),
      event_type: eventType,
      course: course.trim(),
      event_date: eventDate,
      start_time: isAllDay ? null : startTime,
      end_time: isAllDay ? null : endTime,
      is_all_day: isAllDay,
      owner_user_id: ownerUserId || userProfile?.id || user?.id || null,
      location: location.trim(),
      notes: notes.trim(),
      color,
      reminder_minutes: reminderMinutes,
    };

    let result;
    if (eventToEdit) {
      result = await updateEvent(eventToEdit.id, payload);
    } else {
      result = await addEvent(payload);
    }

    setLoading(false);

    if (result.error) {
      setErrorMsg(result.error.message);
    } else {
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
    }}>
      <div className="glass-modal animate-scale-in" style={{
        maxWidth: '580px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '2.25rem',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {eventToEdit ? 'Edit Shared Event' : 'Add Shared Event'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Keep your friend updated in real-time.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* ⚡ Quick Presets Bar */}
        {!eventToEdit && (
          <div style={{
            background: 'var(--bg-hover)',
            padding: '0.75rem 1rem',
            borderRadius: '14px',
            marginBottom: '1.25rem',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Zap size={14} style={{ color: '#F59E0B' }} /> 1-Click Quick Templates
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="badge"
                onClick={() => applyPreset('Exam', 'Midterm Exam', '#EF4444')}
                style={{ backgroundColor: '#EF4444', color: '#FFFFFF', cursor: 'pointer', border: 'none', padding: '0.35rem 0.75rem' }}
              >
                📝 Midterm Exam
              </button>
              <button
                type="button"
                className="badge"
                onClick={() => applyPreset('Quiz', 'Pop Quiz', '#F59E0B')}
                style={{ backgroundColor: '#F59E0B', color: '#FFFFFF', cursor: 'pointer', border: 'none', padding: '0.35rem 0.75rem' }}
              >
                ⚡ Pop Quiz
              </button>
              <button
                type="button"
                className="badge"
                onClick={() => applyPreset('Assignment', 'Lab Report', '#8B5CF6')}
                style={{ backgroundColor: '#8B5CF6', color: '#FFFFFF', cursor: 'pointer', border: 'none', padding: '0.35rem 0.75rem' }}
              >
                💻 Lab Report
              </button>
              <button
                type="button"
                className="badge"
                onClick={() => applyPreset('Trip', 'Weekend Trip', '#EC4899')}
                style={{ backgroundColor: '#EC4899', color: '#FFFFFF', cursor: 'pointer', border: 'none', padding: '0.35rem 0.75rem' }}
              >
                ✈️ Weekend Trip
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#EF4444',
            fontSize: '0.85rem',
            marginBottom: '1rem',
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Title with Quick Title Suggestions */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Event Title *
            </label>
            <input
              ref={titleInputRef}
              type="text"
              required
              placeholder="e.g. CS 101 Midterm Exam"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
            />
            {/* Quick Suggestions */}
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
              {['CS 101 Exam', 'Physics Lab Report', 'Calculus II Quiz', 'Flight to NYC'].map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setTitle(sug)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '0.75rem',
                    color: 'var(--accent-primary)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  +{sug}
                </button>
              ))}
            </div>
          </div>

          {/* Event Type Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Category
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {EVENT_TYPES.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => handleEventTypeSelect(t.label)}
                  style={{
                    padding: '0.5rem 0.95rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: eventType === t.label ? 800 : 600,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: eventType === t.label ? t.color : 'var(--bg-hover)',
                    color: eventType === t.label ? '#FFFFFF' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease',
                    boxShadow: eventType === t.label ? '0 4px 12px rgba(0,0,0,0.18)' : 'none',
                    transform: t.label === 'Exam' && eventType === 'Exam' ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {t.label === 'Exam' && '🚨 '}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date & All Day Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Event Date *
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="input-field"
              />
            </div>

            <div style={{ paddingTop: '1.4rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700 }}>
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={(e) => setIsAllDay(e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }}
                />
                All Day Event
              </label>
            </div>
          </div>

          {/* Start & End Time if not all day */}
          {!isAllDay && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          )}

          {/* Owner Assignment & Course */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Belongs To
              </label>
              <select
                value={ownerUserId}
                onChange={(e) => setOwnerUserId(e.target.value)}
                className="input-field"
              >
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.display_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Course / Subject
              </label>
              <input
                type="text"
                placeholder="e.g. CS 101"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Location / Online Link
            </label>
            <input
              type="text"
              placeholder="e.g. Science Hall 302 or Zoom link"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Study Notes / Instructions
            </label>
            <textarea
              rows={3}
              placeholder="Chapters 1-6 covered. Bring 2B pencils..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Color Swatches & Reminder */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Event Badge Color
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['#EF4444', '#F59E0B', '#8B5CF6', '#3B82F6', '#10B981', '#EC4899'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: c,
                      border: color === c ? '3px solid var(--text-primary)' : 'none',
                      cursor: 'pointer',
                      transform: color === c ? 'scale(1.15)' : 'scale(1)',
                      transition: 'transform 0.15s ease',
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Reminder Alert
              </label>
              <select
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(Number(e.target.value))}
                className="input-field"
              >
                <option value={0}>No Reminder</option>
                <option value={15}>15 Minutes Before</option>
                <option value={30}>30 Minutes Before</option>
                <option value={60}>1 Hour Before</option>
                <option value={120}>2 Hours Before</option>
                <option value={1440}>1 Day Before</option>
              </select>
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
              {loading ? 'Saving...' : eventToEdit ? 'Update Event' : 'Save Shared Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
