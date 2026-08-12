import React, { useState } from 'react';
import { Plus, Calendar, GraduationCap, CheckSquare, Flame, ShoppingBag, Utensils } from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import { EventType } from '../../types';

interface FloatingAddButtonProps {
  onOpenAddEvent: (category: EventType) => void;
  onNavigateTab?: (tab: string) => void;
}

export const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ onOpenAddEvent }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSelectCategory = (cat: EventType) => {
    setIsSheetOpen(false);
    onOpenAddEvent(cat);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsSheetOpen(true)}
        aria-label="Add new item"
        style={{
          position: 'fixed',
          bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
          right: '18px',
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          backgroundColor: '#3B82F6',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 4px 18px rgba(59, 130, 246, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 900,
          cursor: 'pointer',
          transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="Create New Item"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', paddingBottom: '0.5rem' }}>
          <button
            type="button"
            onClick={() => handleSelectCategory('personal')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '1.1rem 0.75rem',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-hover)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
              <Calendar size={22} />
            </div>
            Event
          </button>

          <button
            type="button"
            onClick={() => handleSelectCategory('class')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '1.1rem 0.75rem',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-hover)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FDF2F8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EC4899' }}>
              <GraduationCap size={22} />
            </div>
            Class
          </button>

          <button
            type="button"
            onClick={() => handleSelectCategory('task')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '1.1rem 0.75rem',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-hover)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
              <CheckSquare size={22} />
            </div>
            Task
          </button>

          <button
            type="button"
            onClick={() => handleSelectCategory('personal')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '1.1rem 0.75rem',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-hover)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
              <Flame size={22} />
            </div>
            Habit / Reminder
          </button>
        </div>
      </BottomSheet>
    </>
  );
};
