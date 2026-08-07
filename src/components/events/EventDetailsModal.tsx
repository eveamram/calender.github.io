import React from 'react';
import { CalendarEvent } from '../../types';
import { useCalendar } from '../../context/CalendarContext';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  BookOpen,
  User,
  Edit2,
  Trash2,
  Bell,
  CheckCircle2,
  Copy,
  Share2,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface EventDetailsModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDeleteRequest: (eventId: string) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  isOpen,
  onClose,
  onEdit,
  onDeleteRequest,
}) => {
  const { members, toggleEventCompleted, addToast } = useCalendar();
  const { userProfile, user } = useAuth();

  if (!isOpen || !event) return null;

  const owner = members.find(
    (m) => m.user_id === (event.owner_user_id || event.created_by)
  );

  const formattedDate = format(parseISO(event.event_date), 'EEEE, MMMM d, yyyy');

  const handleCopySummary = () => {
    const text = `📌 ${event.title}\n📅 ${formattedDate}${event.start_time ? ` at ${event.start_time}` : ''}\n📚 Course: ${event.course || 'N/A'}\n📍 Location: ${event.location || 'N/A'}\n📝 Notes: ${event.notes || 'None'}`;
    navigator.clipboard.writeText(text);
    addToast('Event details copied to clipboard!', 'success');
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
        maxWidth: '520px',
        width: '100%',
        padding: '2rem',
        position: 'relative',
      }}>
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span
                className="badge"
                style={{
                  backgroundColor: event.is_completed ? 'var(--bg-hover)' : event.color || '#3B82F6',
                  color: event.is_completed ? 'var(--text-muted)' : '#FFFFFF',
                }}
              >
                {event.event_type === 'Exam' && '🚨 '}
                {event.event_type}
              </span>

              {event.course && (
                <span className="badge" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                  {event.course}
                </span>
              )}
            </div>

            <h2 style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              textDecoration: event.is_completed ? 'line-through' : 'none',
            }}>
              {event.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Quick Complete Bar */}
        <div style={{
          backgroundColor: event.is_completed ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-hover)',
          padding: '0.75rem 1rem',
          borderRadius: '12px',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 700 }}>
            <CheckCircle2 size={18} style={{ color: event.is_completed ? '#10B981' : 'var(--text-muted)' }} />
            <span>{event.is_completed ? 'Task Completed! 🎉' : 'Mark as Completed'}</span>
          </div>

          <button
            type="button"
            className={event.is_completed ? 'btn btn-secondary' : 'btn btn-primary'}
            onClick={() => toggleEventCompleted(event.id)}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
          >
            {event.is_completed ? 'Undo' : 'Mark Done 🎉'}
          </button>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Date & Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CalendarIcon size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{formattedDate}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {event.is_all_day ? 'All Day Event' : `${event.start_time} - ${event.end_time}`}
              </div>
            </div>
          </div>

          {/* Owner */}
          {owner && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <User size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Belongs to</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 700 }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: owner.profile_color }} />
                  {owner.display_name}
                </div>
              </div>
            </div>
          )}

          {/* Location */}
          {event.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <MapPin size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{event.location}</div>
              </div>
            </div>
          )}

          {/* Notes */}
          {event.notes && (
            <div style={{
              backgroundColor: 'var(--bg-hover)',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>Notes & Instructions:</strong>
              {event.notes}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCopySummary}
            style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
          >
            <Copy size={15} /> Copy Info
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onEdit(event)}
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
            >
              <Edit2 size={15} /> Edit
            </button>

            <button
              type="button"
              className="btn btn-danger"
              onClick={() => onDeleteRequest(event.id)}
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
            >
              <Trash2 size={15} /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
