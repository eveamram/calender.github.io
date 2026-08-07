import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { CalendarEvent, CalendarMember } from '../../types';
import { Calendar, UserCheck, Sparkles, ChevronRight } from 'lucide-react';

export const QuickDashboard: React.FC = () => {
  const { events, members } = useCalendar();

  const todayStr = new Date().toISOString().split('T')[0];
  const futureEvents = events.filter((e) => e.event_date >= todayStr);

  const getNextEventForMember = (member: CalendarMember): CalendarEvent | undefined => {
    return futureEvents.find(
      (e) => e.owner_user_id === member.user_id || e.created_by === member.user_id
    );
  };

  if (members.length === 0) return null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '1rem',
      marginBottom: '1rem',
    }}>
      {members.map((member) => {
        const nextEvt = getNextEventForMember(member);
        return (
          <div
            key={member.id}
            className="glass-card"
            style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              borderLeft: `4px solid ${member.profile_color}`,
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.4rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: member.profile_color,
                  color: '#FFFFFF',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {member.display_name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  {member.display_name}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Next Event</span>
            </div>

            {nextEvt ? (
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {nextEvt.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  {nextEvt.event_type} • {nextEvt.event_date} {nextEvt.start_time ? `@ ${nextEvt.start_time}` : ''}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No upcoming events scheduled
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
