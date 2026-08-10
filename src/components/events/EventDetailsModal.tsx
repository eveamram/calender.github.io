import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { CalendarEvent } from '../../types';
import { format, parseISO } from 'date-fns';
import { X, Calendar as CalendarIcon, Clock, MapPin, Trash2, CheckCircle2, Circle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface EventDetailsModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDeleteRequest?: (eventId: string) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  isOpen,
  onClose,
  onEdit,
  onDeleteRequest,
}) => {
  const { members, toggleEventCompleted, deleteEvent } = useCalendar();

  if (!isOpen || !event) return null;

  const eventDateStr = event.event_date || event.due_date || format(new Date(), 'yyyy-MM-dd');
  const formattedDate = format(parseISO(eventDateStr), 'EEEE, MMMM d, yyyy');

  const owner = members.find((m) => m.user_id === event.owner_user_id || m.id === event.owner_user_id);
  const ownerName = owner ? owner.display_name : 'Eve';

  const handleDelete = async () => {
    if (onDeleteRequest) {
      onDeleteRequest(event.id);
    } else {
      await deleteEvent(event.id);
    }
    onClose();
  };

  const handleToggle = async () => {
    if (!event.is_completed) {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    }
    await toggleEventCompleted(event.id);
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
        maxWidth: '420px',
        padding: '1.5rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span style={{
            fontSize: '0.725rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            padding: '0.2rem 0.6rem',
            borderRadius: '999px',
            backgroundColor: `${event.color || '#3B82F6'}15`,
            color: event.color || '#3B82F6',
          }}>
            {event.event_type}
          </span>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
          >
            <X size={18} />
          </button>
        </div>

        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          {event.title}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarIcon size={15} color="var(--text-muted)" /> {formattedDate}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={15} color="var(--text-muted)" /> {event.start_time || 'All Day'} {event.end_time ? `– ${event.end_time}` : ''}
          </div>

          {event.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={15} color="var(--text-muted)" /> {event.location}
            </div>
          )}

          <div style={{ fontSize: '0.775rem', fontWeight: 700, color: ownerName === 'Eve' ? '#1E40AF' : '#9D174D', marginTop: '4px' }}>
            Added by {ownerName}
          </div>

          {event.image_url && (
            <div style={{ marginTop: '0.75rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', maxHeight: '180px' }}>
              <img src={event.image_url} alt="Attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <button
            type="button"
            onClick={handleToggle}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {event.is_completed ? <CheckCircle2 size={16} color="#10B981" /> : <Circle size={16} />}
            {event.is_completed ? 'Completed' : 'Mark Complete'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleDelete}
              style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.4rem' }}
              title="Delete"
            >
              <Trash2 size={16} />
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onEdit(event);
              }}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
