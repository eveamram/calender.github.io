import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { useAuth } from '../../context/AuthContext';
import { Calendar as CalendarIcon, GraduationCap, CheckSquare, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: 'calendar' | 'schedule' | 'todo';
  setActiveTab: (tab: 'calendar' | 'schedule' | 'todo') => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenSettings }) => {
  const { activePersonaFilter, setActivePersonaFilter } = useCalendar();

  return (
    <aside style={{
      width: '240px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      padding: '1.25rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100vh',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0 0.5rem' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '9px',
            backgroundColor: '#FFFFFF',
            border: '1.5px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="5.5" width="16" height="15" rx="3.5" stroke="#18181B" strokeWidth="1.8" fill="#FFFFFF" />
              <line x1="4" y1="9.5" x2="20" y2="9.5" stroke="#18181B" strokeWidth="1.5" />
              <line x1="8" y1="3" x2="8" y2="6" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
              <line x1="16" y1="3" x2="16" y2="6" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
              <circle cx="9" cy="13" r="1.3" fill="#CBD5E1" />
              <circle cx="15" cy="13" r="1.3" fill="#CBD5E1" />
              <circle cx="9" cy="17" r="1.3" fill="#CBD5E1" />
              <circle cx="15" cy="17" r="2.2" fill="#2563EB" />
            </svg>
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>calender</span>
        </div>

        {/* Persona Switcher */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-hover)',
          padding: '3px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
        }}>
          {(['Eve', 'Abbie', 'all'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setActivePersonaFilter(p)}
              style={{
                flex: 1,
                padding: '0.35rem 0',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activePersonaFilter === p ? 'var(--bg-secondary)' : 'transparent',
                color: activePersonaFilter === p ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              {p === 'all' ? 'Both' : p}
            </button>
          ))}
        </div>

        {/* Navigation items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'calendar' ? 'var(--accent-light)' : 'transparent',
              color: activeTab === 'calendar' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <CalendarIcon size={16} /> Calendar
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'schedule' ? 'var(--accent-light)' : 'transparent',
              color: activeTab === 'schedule' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <GraduationCap size={16} /> Class Schedule
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('todo')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'todo' ? 'var(--accent-light)' : 'transparent',
              color: activeTab === 'todo' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <CheckSquare size={16} /> To-Do List
          </button>
        </nav>
      </div>

      <button
        type="button"
        onClick={onOpenSettings}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.6rem 0.85rem',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: 'transparent',
          color: 'var(--text-muted)',
          fontWeight: 700,
          fontSize: '0.85rem',
          cursor: 'pointer',
        }}
      >
        <Settings size={16} /> Settings
      </button>
    </aside>
  );
};
