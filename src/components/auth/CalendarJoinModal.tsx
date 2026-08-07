import React, { useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { Users, Plus, KeyRound, ArrowRight, Sparkles } from 'lucide-react';

interface CalendarJoinModalProps {
  isOpen: boolean;
}

export const CalendarJoinModal: React.FC<CalendarJoinModalProps> = ({ isOpen }) => {
  const { createCalendar, joinCalendar } = useCalendar();
  const [tab, setTab] = useState<'create' | 'join'>('create');
  
  const [calendarName, setCalendarName] = useState('Study Duo 2026');
  const [inviteCode, setInviteCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!calendarName.trim()) {
      setErrorMsg('Please enter a calendar name.');
      return;
    }
    setLoading(true);
    const { error } = await createCalendar(calendarName.trim());
    setLoading(false);
    if (error) setErrorMsg(error.message);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!inviteCode.trim()) {
      setErrorMsg('Please enter an invite code.');
      return;
    }
    setLoading(true);
    const { error } = await joinCalendar(inviteCode.trim());
    setLoading(false);
    if (error) setErrorMsg(error.message);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
    }}>
      <div className="glass-modal animate-scale-in" style={{
        maxWidth: '480px',
        width: '100%',
        padding: '2.25rem',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
          }}>
            <Users size={32} />
          </div>
        </div>

        <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          Connect Shared Calendar
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Create a new calendar for you and your friend, or join an existing calendar using an invite code.
        </p>

        {/* Tab Buttons */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-hover)',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '1.5rem',
        }}>
          <button
            type="button"
            className="btn"
            onClick={() => { setTab('create'); setErrorMsg(null); }}
            style={{
              flex: 1,
              borderRadius: '8px',
              padding: '0.5rem',
              fontSize: '0.875rem',
              backgroundColor: tab === 'create' ? 'var(--bg-card)' : 'transparent',
              color: tab === 'create' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: tab === 'create' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <Plus size={16} /> Create Calendar
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => { setTab('join'); setErrorMsg(null); }}
            style={{
              flex: 1,
              borderRadius: '8px',
              padding: '0.5rem',
              fontSize: '0.875rem',
              backgroundColor: tab === 'join' ? 'var(--bg-card)' : 'transparent',
              color: tab === 'join' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: tab === 'join' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <KeyRound size={16} /> Join via Invite Code
          </button>
        </div>

        {errorMsg && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#EF4444',
            fontSize: '0.85rem',
            marginBottom: '1rem',
          }}>
            {errorMsg}
          </div>
        )}

        {tab === 'create' ? (
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Calendar Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alex & Sam's Exam Tracker"
                value={calendarName}
                onChange={(e) => setCalendarName(e.target.value)}
                className="input-field"
              />
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ✨ Creating a calendar will automatically generate a private Invite Code that you can share with your friend.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem' }}
            >
              {loading ? 'Creating...' : 'Create Shared Calendar'}
              <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Private Invite Code
              </label>
              <input
                type="text"
                required
                placeholder="e.g. STUDY-2026-X89"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="input-field"
                style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}
              />
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              🔑 Ask your friend for their calendar's invite code to start sharing exams & schedules.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem' }}
            >
              {loading ? 'Joining...' : 'Join Shared Calendar'}
              <ArrowRight size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
