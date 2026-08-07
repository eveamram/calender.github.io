import React, { useState, useEffect, useRef } from 'react';
import { CalendarEvent, CATEGORY_COLORS, PROFILE_COLORS, RepeatType } from '../../types';
import { useCalendar } from '../../context/CalendarContext';
import { useAuth } from '../../context/AuthContext';
import { parseNaturalLanguageInput } from '../../lib/naturalLanguageParser';
import { X, Sparkles, Zap, Calendar as CalendarIcon, Clock, Tag, Palette } from 'lucide-react';
import { format } from 'date-fns';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
  eventToEdit?: CalendarEvent | null;
}

const CUSTOM_COLOR_PALETTE = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#F43F5E', // Rose
  '#84CC16', // Lime
  '#64748B', // Slate
];

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  eventToEdit,
}) => {
  const { addEvent, updateEvent } = useCalendar();
  const { userProfile, user } = useAuth();
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [naturalInput, setNaturalInput] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('School');
  const [eventDate, setEventDate] = useState(format(initialDate || new Date(), 'yyyy-MM-dd'));
  const [isAllDay, setIsAllDay] = useState(true);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [color, setColor] = useState('#3B82F6');
  const [repeat, setRepeat] = useState<RepeatType>('none');
  const [notes, setNotes] = useState('');
  const [emoji, setEmoji] = useState('📚');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 60);
    }
  }, [isOpen]);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setCategory(eventToEdit.event_type || 'School');
      setEventDate(eventToEdit.event_date);
      setIsAllDay(eventToEdit.is_all_day);
      setStartTime(eventToEdit.start_time || '10:00');
      setEndTime(eventToEdit.end_time || '11:00');
      setColor(eventToEdit.color || '#3B82F6');
      setRepeat(eventToEdit.repeat || 'none');
      setNotes(eventToEdit.notes || '');
      setEmoji(eventToEdit.emoji || '📝');
    } else {
      setTitle('');
      setCategory('School');
      setEventDate(format(initialDate || new Date(), 'yyyy-MM-dd'));
      setIsAllDay(true);
      setStartTime('10:00');
      setEndTime('11:00');
      setColor('#3B82F6');
      setRepeat('none');
      setNotes('');
      setEmoji('📚');
      setNaturalInput('');
    }
  }, [eventToEdit, initialDate, isOpen]);

  if (!isOpen) return null;

  const handleNaturalParse = () => {
    if (!naturalInput.trim()) return;
    const parsed = parseNaturalLanguageInput(naturalInput);
    setTitle(parsed.title);
    setEventDate(parsed.dateStr);
    if (parsed.timeStr) {
      setStartTime(parsed.timeStr);
      setIsAllDay(false);
    }
  };

  const handleCategorySelect = (label: string, catColor: string, catEmoji: string) => {
    setCategory(label);
    setColor(catColor);
    setEmoji(catEmoji);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);

    const payload = {
      title: title.trim(),
      event_type: category,
      event_date: eventDate,
      start_time: isAllDay ? null : startTime,
      end_time: isAllDay ? null : endTime,
      is_all_day: isAllDay,
      owner_user_id: userProfile?.id || user?.id || null,
      location: '',
      notes: notes.trim(),
      color,
      reminder_minutes: 30,
      repeat,
      emoji,
    };

    if (eventToEdit) {
      await updateEvent(eventToEdit.id, payload);
    } else {
      await addEvent(payload);
    }

    setLoading(false);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
    }}>
      <div className="glass-modal animate-scale-in" style={{
        maxWidth: '500px',
        width: '100%',
        padding: '1.75rem',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
            {eventToEdit ? 'Edit Event' : 'New Event'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Quick Natural Language Bar */}
        {!eventToEdit && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="⚡ Quick Add: e.g. Lunch tomorrow at 1 PM"
                value={naturalInput}
                onChange={(e) => setNaturalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleNaturalParse();
                  }
                }}
                className="input-field"
                style={{ fontSize: '0.85rem', paddingRight: '4rem', backgroundColor: 'var(--accent-light)' }}
              />
              <button
                type="button"
                onClick={handleNaturalParse}
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'var(--accent-primary)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Parse
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
              Event Title *
            </label>
            <input
              ref={titleInputRef}
              type="text"
              required
              placeholder="e.g. Design Sync with Sarah"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Category Chips */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Category Preset
            </label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {CATEGORY_COLORS.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => handleCategorySelect(cat.label, cat.color, cat.emoji)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '10px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: category === cat.label ? 800 : 600,
                    backgroundColor: category === cat.label ? cat.color : 'var(--bg-hover)',
                    color: category === cat.label ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Choose Custom Event Color
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {CUSTOM_COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: c,
                    border: color === c ? '3px solid var(--text-primary)' : '2px solid transparent',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'transform 0.12s ease',
                  }}
                />
              ))}

              {/* Native Color Wheel Input */}
              <label style={{
                position: 'relative',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-hover)',
                border: '1px solid var(--border-color)',
              }} title="Custom Color Picker">
                <Palette size={14} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer',
                  }}
                />
              </label>
            </div>
          </div>

          {/* Date & Repeat */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                Date *
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                Repeat
              </label>
              <select
                value={repeat}
                onChange={(e) => setRepeat(e.target.value as RepeatType)}
                className="input-field"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Every day</option>
                <option value="weekly">Every week</option>
                <option value="monthly">Every month</option>
              </select>
            </div>
          </div>

          {/* Time controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>
              <input
                type="checkbox"
                checked={isAllDay}
                onChange={(e) => setIsAllDay(e.target.checked)}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              All Day Event
            </label>

            {!isAllDay && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="input-field"
                  style={{ width: '100px', padding: '0.4rem' }}
                />
                <span>-</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="input-field"
                  style={{ width: '100px', padding: '0.4rem' }}
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add extra details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              style={{ resize: 'none' }}
            />
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
              {loading ? 'Saving...' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
