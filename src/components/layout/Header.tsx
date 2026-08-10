import React, { useState } from 'react';
import { Calendar as CalendarIcon, GraduationCap, CheckSquare, Settings, Plus, Palette, Check, Sparkles } from 'lucide-react';
import { useCalendar } from '../../context/CalendarContext';

interface HeaderProps {
  activeTab: 'calendar' | 'schedule' | 'todo';
  setActiveTab: (tab: 'calendar' | 'schedule' | 'todo') => void;
  onOpenAddEvent: () => void;
  onOpenPersonModal?: () => void;
  onOpenSettings?: () => void;
}

const THEME_ACCENT_COLORS = [
  { name: 'Sapphire Blue', hex: '#3B82F6' },
  { name: 'Rose Pink', hex: '#EC4899' },
  { name: 'Emerald Green', hex: '#10B981' },
  { name: 'Royal Violet', hex: '#8B5CF6' },
  { name: 'Sunset Amber', hex: '#F59E0B' },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddEvent,
  onOpenPersonModal,
  onOpenSettings,
}) => {
  const { activePersonaFilter, setActivePersonaFilter, themeColor, setThemeColor } = useCalendar();
  const [showColorPicker, setShowColorPicker] = useState(false);

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
        {/* Simple & Sleek Black Logo */}
        <div
          onClick={() => setActiveTab('calendar')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            cursor: 'pointer',
          }}
        >
          {/* Simple Black Emblem */}
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '9px',
            backgroundColor: '#18181B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
            transition: 'transform 0.15s ease',
          }}>
            <CalendarIcon size={18} strokeWidth={2.2} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
            }}>
              calender<span style={{ color: 'var(--accent-primary)' }}>.</span>
            </span>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
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

        {/* Persona Switcher, Color Theme Picker & Controls */}
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

          {/* Color Theme Selector Popover */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: themeColor || 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
              title="Change Theme Accent Color"
            >
              <Palette size={16} />
            </button>

            {showColorPicker && (
              <div style={{
                position: 'absolute',
                top: '42px',
                right: 0,
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                zIndex: 200,
                minWidth: '160px',
              }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Theme Colors
                </span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {THEME_ACCENT_COLORS.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => {
                        setThemeColor(col.hex);
                        setShowColorPicker(false);
                      }}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: col.hex,
                        border: themeColor === col.hex ? '2px solid var(--text-primary)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                      }}
                      title={col.name}
                    >
                      {themeColor === col.hex && <Check size={12} strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
