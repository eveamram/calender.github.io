import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCalendar } from '../../context/CalendarContext';
import { Calendar as CalendarIcon, Plus, Moon, Sun, Settings } from 'lucide-react';

interface HeaderProps {
  onOpenAddEvent: () => void;
  onOpenCustomizeModal: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddEvent,
  onOpenCustomizeModal,
  isDarkMode,
  toggleDarkMode,
}) => {
  const { userProfile, switchUserPersona } = useAuth();
  const { setFilterState } = useCalendar();

  const activePersona = userProfile?.display_name || 'Eve';
  const profileColor = userProfile?.profile_color || (activePersona === 'Eve' ? '#3B82F6' : '#EC4899');
  const initial = activePersona.charAt(0).toUpperCase();

  return (
    <header style={{
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.75rem 1.5rem',
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
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            backgroundColor: 'var(--accent-primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <CalendarIcon size={19} />
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            calender
          </h1>
        </div>

        {/* Person Selector & Customizer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-hover)',
            padding: '3px',
            borderRadius: '999px',
            border: '1px solid var(--border-color)',
          }}>
            <button
              type="button"
              onClick={() => {
                switchUserPersona('Eve');
                setFilterState((prev) => ({ ...prev, personFilter: 'all' }));
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: activePersona === 'Eve' ? profileColor : 'transparent',
                color: activePersona === 'Eve' ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.825rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: activePersona === 'Eve' ? '#FFFFFF' : profileColor,
                color: activePersona === 'Eve' ? profileColor : '#FFFFFF',
                fontSize: '0.55rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                E
              </div>
              Eve
            </button>

            <button
              type="button"
              onClick={() => {
                switchUserPersona('Abbie');
                setFilterState((prev) => ({ ...prev, personFilter: 'all' }));
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: activePersona === 'Abbie' ? profileColor : 'transparent',
                color: activePersona === 'Abbie' ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.825rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: activePersona === 'Abbie' ? '#FFFFFF' : '#EC4899',
                color: activePersona === 'Abbie' ? '#EC4899' : '#FFFFFF',
                fontSize: '0.55rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                A
              </div>
              Abbie
            </button>
          </div>

          {/* Edit Person Icon / Color Button */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenCustomizeModal}
            title="Change Person Icon & Color"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', borderRadius: '10px' }}
          >
            <Settings size={14} /> Customize Icon
          </button>

          {/* Quick Add Button */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenAddEvent}
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem', borderRadius: '10px' }}
          >
            <Plus size={16} /> Add Event
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="btn btn-secondary"
            title="Toggle theme"
            style={{ padding: '0.45rem', borderRadius: '50%', width: '34px', height: '34px' }}
          >
            {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </header>
  );
};
