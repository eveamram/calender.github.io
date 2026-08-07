import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCalendar } from '../../context/CalendarContext';
import {
  Calendar as CalendarIcon,
  Plus,
  Moon,
  Sun,
  LogOut,
  WifiOff,
  User,
  Users,
} from 'lucide-react';

interface HeaderProps {
  onOpenAddEvent: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddEvent,
  isDarkMode,
  toggleDarkMode,
}) => {
  const { userProfile, signOut } = useAuth();
  const { activeCalendar, members, isOffline } = useCalendar();

  return (
    <header style={{
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.85rem 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}>
        {/* Brand Logo & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: 'var(--accent-primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <CalendarIcon size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.1, color: 'var(--text-primary)' }}>
              calender
            </h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {activeCalendar ? activeCalendar.name : 'Shared Student App'}
            </span>
          </div>
        </div>

        {/* Member Avatars & Sync Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isOffline && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#EF4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              padding: '0.3rem 0.65rem',
              borderRadius: '999px',
            }}>
              <WifiOff size={13} /> Offline
            </div>
          )}

          {/* Connected Members Pills */}
          {members.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {members.map((m) => (
                <div
                  key={m.user_id}
                  title={`${m.display_name} (${m.user_id === userProfile?.id ? 'You' : 'Friend'})`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '999px',
                    backgroundColor: 'var(--bg-hover)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: m.profile_color,
                  }} />
                  <span style={{ color: 'var(--text-primary)' }}>{m.display_name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Quick Add Event Primary Button */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenAddEvent}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <Plus size={16} /> Add Event
          </button>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="btn btn-secondary"
            title="Toggle theme"
            style={{ padding: '0.5rem', borderRadius: '50%', width: '36px', height: '36px' }}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Sign Out */}
          {userProfile && (
            <button
              type="button"
              onClick={signOut}
              className="btn btn-secondary"
              title="Sign Out"
              style={{ padding: '0.5rem', borderRadius: '50%', width: '36px', height: '36px' }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
