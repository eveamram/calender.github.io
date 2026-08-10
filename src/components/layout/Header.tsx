import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Moon, Sun, Settings, Calendar as CalendarIcon, GraduationCap, CheckSquare, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenAddEvent: () => void;
  onOpenCustomizeModal: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  activeTab: 'calendar' | 'schedule' | 'todo';
  setActiveTab: (tab: 'calendar' | 'schedule' | 'todo') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddEvent,
  onOpenCustomizeModal,
  isDarkMode,
  toggleDarkMode,
  activeTab,
  setActiveTab,
}) => {
  const { userProfile, switchUserPersona } = useAuth();
  const activePersona = userProfile?.display_name || 'Eve';
  const profileColor = userProfile?.profile_color || (activePersona === 'Eve' ? '#3B82F6' : '#EC4899');

  return (
    <header style={{
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.75rem 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        {/* Brand Logo & Section View Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Logo Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => setActiveTab('calendar')}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #3B82F6 0%, #EC4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            }}>
              <Sparkles size={16} />
            </div>
            <h1 style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              calender
            </h1>
          </div>

          {/* Section View Switcher */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-hover)',
            padding: '2px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.3rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === 'calendar' ? 'var(--bg-secondary)' : 'transparent',
                color: activeTab === 'calendar' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'calendar' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              <CalendarIcon size={14} /> Important Dates
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.3rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === 'schedule' ? 'var(--bg-secondary)' : 'transparent',
                color: activeTab === 'schedule' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'schedule' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              <GraduationCap size={14} /> Class Schedule
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('todo')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.3rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === 'todo' ? 'var(--bg-secondary)' : 'transparent',
                color: activeTab === 'todo' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'todo' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              <CheckSquare size={14} /> To-Do List
            </button>
          </div>
        </div>

        {/* Persona Switcher & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Persona Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-hover)',
            padding: '2px',
            borderRadius: '999px',
            border: '1px solid var(--border-color)',
          }}>
            <button
              type="button"
              onClick={() => switchUserPersona('Eve')}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: activePersona === 'Eve' ? profileColor : 'transparent',
                color: activePersona === 'Eve' ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              Eve
            </button>

            <button
              type="button"
              onClick={() => switchUserPersona('Abbie')}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: activePersona === 'Abbie' ? profileColor : 'transparent',
                color: activePersona === 'Abbie' ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              Abbie
            </button>
          </div>

          {/* Customize Options */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenCustomizeModal}
            title="Profile Options"
            style={{ padding: '0.4rem 0.6rem' }}
          >
            <Settings size={14} />
          </button>

          {/* Add Event Button */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenAddEvent}
          >
            <Plus size={15} /> Add Event
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="btn btn-secondary"
            title="Toggle theme"
            style={{ padding: '0.4rem', borderRadius: '50%', width: '32px', height: '32px' }}
          >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>
    </header>
  );
};
