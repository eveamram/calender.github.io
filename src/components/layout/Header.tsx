import React from 'react';
import { Calendar as CalendarIcon, GraduationCap, CheckSquare, Settings, Plus, Sparkles } from 'lucide-react';
import { useCalendar } from '../../context/CalendarContext';

interface HeaderProps {
  activeTab: 'calendar' | 'schedule' | 'todo';
  setActiveTab: (tab: 'calendar' | 'schedule' | 'todo') => void;
  onOpenAddEvent: () => void;
  onOpenPersonModal?: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddEvent,
  onOpenPersonModal,
  onOpenSettings,
}) => {
  const { activePersonaFilter, setActivePersonaFilter } = useCalendar();

  const handleOpenProfile = onOpenPersonModal || onOpenSettings || (() => {});

  return (
    <header style={{
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.85rem 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(8px)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        {/* Playful & Creative Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          cursor: 'pointer',
        }}>
          {/* Creative Calendar Tear-off Icon */}
          <div style={{
            position: 'relative',
            width: '38px',
            height: '38px',
            borderRadius: '11px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #EC4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 6px 16px rgba(236, 72, 153, 0.25)',
            transform: 'rotate(-3deg)',
            transition: 'transform 0.2s ease',
          }}>
            <span style={{ fontWeight: 900, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
              {new Date().getDate()}
            </span>
            <div style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#F59E0B',
              borderRadius: '50%',
              padding: '2px',
              color: '#FFFFFF',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            }}>
              <Sparkles size={10} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{
              fontSize: '1.3rem',
              fontWeight: 900,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
            }}>
              calender<span style={{ color: '#EC4899' }}>.</span>
            </span>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '2px' }}>
              Eve & Abbie
            </span>
          </div>
        </div>

        {/* 3 Core Connected Views: Calendar | Class Schedule | To-Do List */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-hover)',
          padding: '3px',
          borderRadius: '999px',
          border: '1px solid var(--border-color)',
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 1rem',
              borderRadius: '999px',
              border: 'none',
              backgroundColor: activeTab === 'calendar' ? 'var(--bg-secondary)' : 'transparent',
              color: activeTab === 'calendar' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <CalendarIcon size={15} /> Calendar
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 1rem',
              borderRadius: '999px',
              border: 'none',
              backgroundColor: activeTab === 'schedule' ? 'var(--bg-secondary)' : 'transparent',
              color: activeTab === 'schedule' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <GraduationCap size={15} /> Class Schedule
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('todo')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 1rem',
              borderRadius: '999px',
              border: 'none',
              backgroundColor: activeTab === 'todo' ? 'var(--bg-secondary)' : 'transparent',
              color: activeTab === 'todo' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <CheckSquare size={15} /> To-Do List
          </button>
        </nav>

        {/* Persona Switcher & Quick Add Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Persona Switcher */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-hover)',
            padding: '2px',
            borderRadius: '999px',
            border: '1px solid var(--border-color)',
          }}>
            {(['Eve', 'Abbie', 'all'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setActivePersonaFilter(p)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: activePersonaFilter === p
                    ? (p === 'Eve' ? '#3B82F6' : p === 'Abbie' ? '#EC4899' : 'var(--text-primary)')
                    : 'transparent',
                  color: activePersonaFilter === p ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                {p === 'all' ? 'Both' : p}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenAddEvent}
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.825rem' }}
          >
            <Plus size={15} />
            {activeTab === 'schedule' ? 'Add Class' : activeTab === 'todo' ? 'Add Task' : 'Add Event'}
          </button>

          <button
            type="button"
            onClick={handleOpenProfile}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
            title="Settings & Persona Profile"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
