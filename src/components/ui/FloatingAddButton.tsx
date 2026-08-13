import React from 'react';
import { Plus } from 'lucide-react';
import { EventType } from '../../types';

interface FloatingAddButtonProps {
  onOpenAddEvent: (category: EventType) => void;
  onNavigateTab?: (tab: string) => void;
}

export const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ onOpenAddEvent }) => {
  return (
    <button
      type="button"
      onClick={() => onOpenAddEvent('personal')}
      aria-label="Add new item"
      style={{
        position: 'fixed',
        bottom: 'calc(76px + env(safe-area-inset-bottom, 0px))',
        right: '20px',
        width: '54px',
        height: '54px',
        borderRadius: '50%',
        backgroundColor: '#3B82F6',
        color: '#FFFFFF',
        border: 'none',
        boxShadow: '0 4px 18px rgba(59, 130, 246, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 900,
        cursor: 'pointer',
        transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <Plus size={28} strokeWidth={2.5} />
    </button>
  );
};

