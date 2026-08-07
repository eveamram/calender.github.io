import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { CalendarEvent } from '../../types';
import { Clock, MapPin, BookOpen, Calendar as CalendarIcon, Tag, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface AgendaViewProps {
  onSelectEvent: (event: CalendarEvent) => void;
  onOpenAddEvent: () => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ onSelectEvent, onOpenAddEvent }) => {
  const { filteredEvents, members } = useCalendar();

  const getOwnerMember = (userId?: string | null) => {
    if (!userId) return null;
    return members.find((m) => m.user_id === userId);
  };

  const getDaysCountdown = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today!';
    if (diffDays === 1) return 'Tomorrow!';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `In ${diffDays} days`;
  };

  if (filteredEvents.length === 0) {
    return (
      <div className="glass-card" style={{
        padding: '3rem 1.5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-hover)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
        }}>
          <AlertCircle size={32} />
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No Events Found</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '380px' }}>
          No scheduled events match your current filter criteria. Add a new exam or clear your filters to view events.
        </p>
        <button type="button" className="btn btn-primary" onClick={onOpenAddEvent}>
          + Add New Event
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%' }}>
      {filteredEvents.map((evt) => {
        const owner = getOwnerMember(evt.owner_user_id || evt.created_by);
        const countdown = getDaysCountdown(evt.event_date);

        return (
          <div
            key={evt.id}
            className="glass-card animate-fade-in"
            onClick={() => onSelectEvent(evt)}
            style={{
              padding: '1.1rem 1.35rem',
              borderRadius: 'var(--radius-lg)',
              borderLeft: `6px solid ${evt.color || '#3B82F6'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
          >
            {/* Left Info Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <span className="badge" style={{ backgroundColor: evt.color || '#3B82F6', color: '#FFFFFF' }}>
                  {evt.event_type}
                </span>

                {evt.course && (
                  <span className="badge" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                    <BookOpen size={12} /> {evt.course}
                  </span>
                )}

                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                  {countdown}
                </span>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {evt.title}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.825rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CalendarIcon size={14} /> {evt.event_date}
                </span>

                {!evt.is_all_day && evt.start_time && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={14} /> {evt.start_time} {evt.end_time ? `- ${evt.end_time}` : ''}
                  </span>
                )}

                {evt.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={14} /> {evt.location}
                  </span>
                )}
              </div>
            </div>

            {/* Right Owner Avatar Badge */}
            {owner && (
              <div
                title={`Assigned to ${owner.display_name}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  backgroundColor: 'var(--bg-hover)',
                  border: '1px solid var(--border-color)',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: owner.profile_color,
                  color: '#FFFFFF',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {owner.display_name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {owner.display_name}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
