import React, { useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { AppLogo } from '../ui/AppLogo';
import { BottomSheet } from '../ui/BottomSheet';
import { Check, Users } from 'lucide-react';
import { format } from 'date-fns';

import { AppTab } from '../../types';

interface MobileHeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  selectedDate: Date;
  onOpenAddModal: () => void;
  onOpenSettings?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedDate,
}) => {
  const { activePersonaFilter, setActivePersonaFilter } = useCalendar();
  const [showPersonaSheet, setShowPersonaSheet] = useState(false);

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 90,
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        paddingTop: 'calc(0.55rem + env(safe-area-inset-top, 0px))',
        paddingBottom: '0.55rem',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        {/* Brand Logo & Wordmark */}
        <AppLogo
          size={30}
          fontSize="1.15rem"
          onClick={() => setActiveTab('calendar')}
        />

        {/* Profile / Persona Switcher */}
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
            minHeight: '34px',
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
