import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { CalendarEvent } from '../../types';
import { BookOpen, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ExamCountdownCard: React.FC = () => {
  const { events, members } = useCalendar();

  const todayStr = new Date().toISOString().split('T')[0];

  // Find all future exams & quizzes sorted by date
  const upcomingExams = events
    .filter((e) => (e.event_type === 'Exam' || e.event_type === 'Quiz') && e.event_date >= todayStr)
    .sort((a, b) => a.event_date.localeCompare(b.event_date));

  if (upcomingExams.length === 0) {
    return null;
  }

  const nextExam = upcomingExams[0];

  const getDaysDiff = (targetDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDateStr + 'T00:00:00');
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysDiff(nextExam.event_date);

  const getOwnerName = (ownerId?: string | null) => {
    if (!ownerId) return 'Shared';
    const member = members.find((m) => m.user_id === ownerId);
    return member ? member.display_name : 'Friend';
  };

  const getOwnerColor = (ownerId?: string | null) => {
    if (!ownerId) return '#3B82F6';
    const member = members.find((m) => m.user_id === ownerId);
    return member ? member.profile_color : '#3B82F6';
  };

  const handleConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="glass-card animate-fade-in" style={{
      padding: '1.25rem',
      borderRadius: 'var(--radius-lg)',
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
      border: '1px solid rgba(239, 68, 68, 0.25)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.75rem',
      }}>
        <span className="badge" style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}>
          <AlertTriangle size={14} /> Next Major Exam
        </span>

        <button
          type="button"
          onClick={handleConfetti}
          title="Cheer for exam prep!"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.8rem',
            color: 'var(--accent-primary)',
            fontWeight: 600,
          }}
        >
          🎉 Good Luck!
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
            {nextExam.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {nextExam.course && (
              <span style={{ fontWeight: 600, color: '#EF4444' }}>
                <BookOpen size={14} style={{ display: 'inline', marginRight: '4px' }} />
                {nextExam.course}
              </span>
            )}
            <span>
              <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
              {nextExam.event_date} {nextExam.start_time ? `@ ${nextExam.start_time}` : ''}
            </span>
          </div>
        </div>

        {/* Countdown Badge Pill */}
        <div style={{
          backgroundColor: daysLeft === 0 ? '#EF4444' : daysLeft <= 2 ? '#F59E0B' : 'var(--accent-primary)',
          color: '#FFFFFF',
          padding: '0.6rem 1.2rem',
          borderRadius: '16px',
          fontWeight: 800,
          fontSize: '1rem',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {daysLeft === 0 ? (
            <span>EXAM TODAY!</span>
          ) : daysLeft === 1 ? (
            <span>TOMORROW!</span>
          ) : (
            <span>In {daysLeft} Days</span>
          )}
        </div>
      </div>

      {/* Owner Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <span>Assigned to:</span>
        <span className="badge" style={{ backgroundColor: getOwnerColor(nextExam.owner_user_id), color: '#FFFFFF' }}>
          {getOwnerName(nextExam.owner_user_id)}
        </span>
      </div>
    </div>
  );
};
