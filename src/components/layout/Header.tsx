import React, { useState } from 'react';
import { AppLogo } from '../ui/AppLogo';
import { Calendar as CalendarIcon, GraduationCap, CheckSquare, Settings, Plus, Palette, Check, Sparkles, Flame, MoreHorizontal, ShoppingBag, Utensils, FileText, ChevronDown } from 'lucide-react';
import { useCalendar } from '../../context/CalendarContext';

type AppTab = 'calendar' | 'schedule' | 'todo' | 'habits' | 'grocery' | 'meals';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
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
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleOpenProfile = onOpenPersonModal || onOpenSettings || (() => {});

  const isMoreActive = activeTab === 'grocery' || activeTab === 'meals';

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
        {/* Custom Apple-Style Calendar Logo matching image */}
        <AppLogo
          size={36}
          fontSize="1.25rem"
          onClick={() => setActiveTab('calendar')}
        />

        {/* Core Connected Views: Calendar | Class Schedule | To-Do List | Habits | More... */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-hover)',
          padding: '3px',
          borderRadius: '999px',
          border: '1px solid var(--border-color)',
          position: 'relative',
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.9rem',
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
              padding: '0.45rem 0.9rem',
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
              padding: '0.45rem 0.9rem',
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

          <button
            type="button"
            onClick={() => setActiveTab('habits')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.9rem',
              borderRadius: '999px',
              border: 'none',
              backgroundColor: activeTab === 'habits' ? 'var(--bg-secondary)' : 'transparent',
              color: activeTab === 'habits' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Flame size={15} /> Habits
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('meals')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.9rem',
              borderRadius: '999px',
              border: 'none',
              backgroundColor: activeTab === 'meals' ? 'var(--bg-secondary)' : 'transparent',
              color: activeTab === 'meals' ? '#EC4899' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Utensils size={15} color="#EC4899" /> Meals
          </button>

          {/* Desktop More Options Dropdown Button */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: activeTab === 'grocery' ? 'var(--bg-secondary)' : 'transparent',
                color: activeTab === 'grocery' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.825rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <MoreHorizontal size={15} />
              <span>
                {activeTab === 'grocery' ? 'Grocery' : 'More'}
              </span>
              <ChevronDown size={12} style={{ transform: showMoreMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
            </button>

            {/* More Popover Dropdown Menu */}
            {showMoreMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                  padding: '0.5rem',
                  minWidth: '200px',
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('grocery');
                    setShowMoreMenu(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: activeTab === 'grocery' ? 'var(--accent-light)' : 'transparent',
                    color: activeTab === 'grocery' ? '#10B981' : 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  <ShoppingBag size={16} color="#10B981" /> Grocery List
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('meals');
                    setShowMoreMenu(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: activeTab === 'meals' ? 'var(--accent-light)' : 'transparent',
                    color: activeTab === 'meals' ? '#EC4899' : 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  <Utensils size={16} color="#EC4899" /> Meal Planner
                </button>

                <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0.25rem 0' }} />

                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    handleOpenProfile();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  <Settings size={16} /> Settings & Sync
                </button>
              </div>
            )}
          </div>
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
                backgroundColor: themeColor || '#3B82F6',
                border: '2px solid var(--border-color)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: `0 2px 8px ${themeColor || '#3B82F6'}50`,
              }}
              title="Choose Theme Accent Color"
            >
              <Palette size={15} />
            </button>

            {showColorPicker && (
              <div style={{
                position: 'absolute',
                top: '42px',
                right: 0,
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                zIndex: 200,
                minWidth: '180px',
              }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Choose Theme Color
                </span>
                <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                  {THEME_ACCENT_COLORS.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => {
                        setThemeColor(col.hex);
                        setShowColorPicker(false);
                      }}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: col.hex,
                        border: themeColor === col.hex ? '2.5px solid var(--text-primary)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                      title={col.name}
                    >
                      {themeColor === col.hex && <Check size={13} strokeWidth={3} />}
                    </button>
                  ))}

                  {/* Custom Multi-Color Rainbow Picker Icon */}
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'conic-gradient(from 0deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #00C0FF, #0000FF, #8B00FF, #FF0000)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      cursor: 'pointer',
                      border: '1.5px solid var(--border-color)',
                    }}
                    title="Choose any custom color (Multi-color Wheel)"
                  >
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer',
                      }}
                    />
                  </div>
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
            <Plus size={15} /> Add
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
