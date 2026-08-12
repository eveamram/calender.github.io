import React, { useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { BottomSheet } from '../ui/BottomSheet';
import { Check, User, Users } from 'lucide-react';
import { format } from 'date-fns';

interface MobileHeaderProps {
  activeTab: 'calendar' | 'schedule' | 'todo' | 'habits' | 'grocery' | 'meals' | 'notes';
  setActiveTab: (tab: 'calendar' | 'schedule' | 'todo' | 'habits' | 'grocery' | 'meals' | 'notes') => void;
  selectedDate: Date;
  onOpenAddModal: () => void;
  onOpenSettings?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedDate,
  onOpenAddModal,
  onOpenSettings,
}) => {
  const { activePersonaFilter, setActivePersonaFilter } = useCalendar();
  const [showPersonaSheet, setShowPersonaSheet] = useState(false);

  const getSubTitle = () => {
    switch (activeTab) {
      case 'calendar':
        return format(selectedDate, 'MMM d, yyyy');
      case 'schedule':
        return 'Classes';
      case 'todo':
        return 'To-Do List';
      case 'habits':
        return 'Habits';
      case 'grocery':
        return 'Grocery List';
      case 'meals':
        return 'Meal Planner';
      case 'notes':
        return 'Notes';
      default:
        return '';
    }
  };

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 90,
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.65rem 1rem',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        {/* Brand & View Title */}
        <div
          onClick={() => setActiveTab('calendar')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '9px',
            backgroundColor: '#FFFFFF',
            border: '1.5px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {activeTab === 'calendar' ? 'Calendar' : activeTab === 'schedule' ? 'Class Schedule' : activeTab === 'todo' ? 'To-Do' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </span>
            <span style={{ fontSize: '0.675rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {getSubTitle()}
            </span>
          </div>
        </div>

        {/* Persona Switcher Avatar Button & Add Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setShowPersonaSheet(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.6rem',
              borderRadius: '999px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-primary)',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              minHeight: '36px',
            }}
          >
            {activePersonaFilter === 'all' ? (
              <>
                <Users size={14} color="var(--accent-primary)" /> Both
              </>
            ) : (
              <>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: activePersonaFilter === 'Eve' ? '#EC4899' : '#3B82F6',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {activePersonaFilter.charAt(0)}
                </div>
                {activePersonaFilter}
              </>
            )}
          </button>
        </div>
      </header>

      {/* Profile Selector Bottom Sheet */}
      <BottomSheet
        isOpen={showPersonaSheet}
        onClose={() => setShowPersonaSheet(false)}
        title="Select Active Profile"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
            Filter calendar events, classes, to-dos, and habits by owner:
          </p>

          {(['Eve', 'Abbie', 'all'] as const).map((p) => {
            const isSelected = activePersonaFilter === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setActivePersonaFilter(p);
                  setShowPersonaSheet(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: '14px',
                  border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  backgroundColor: isSelected ? 'var(--accent-light)' : 'var(--bg-hover)',
                  color: 'var(--text-primary)',
                  fontWeight: 800,
                  fontSize: '0.925rem',
                  cursor: 'pointer',
                  minHeight: '52px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  {p === 'all' ? (
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-primary)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Users size={16} />
                    </div>
                  ) : (
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: p === 'Eve' ? '#EC4899' : '#3B82F6',
                      color: '#FFFFFF',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {p.charAt(0)}
                    </div>
                  )}
                  <span>{p === 'all' ? 'Both Eve & Abbie' : p}</span>
                </div>

                {isSelected && <Check size={18} color="var(--accent-primary)" />}
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </>
  );
};
