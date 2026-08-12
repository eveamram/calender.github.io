import React, { useState } from 'react';
import { Calendar, GraduationCap, CheckSquare, MoreHorizontal, Flame, ShoppingBag, Utensils, FileText, Settings, Plus } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';

interface MobileBottomNavProps {
  activeTab: 'calendar' | 'schedule' | 'todo' | 'habits' | 'grocery' | 'meals' | 'notes';
  setActiveTab: (tab: 'calendar' | 'schedule' | 'todo' | 'habits' | 'grocery' | 'meals' | 'notes') => void;
  onOpenAddModal: () => void;
  onOpenSettings?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenSettings,
}) => {
  const [showMoreSheet, setShowMoreSheet] = useState(false);

  const mainTabs = [
    { id: 'calendar' as const, label: 'Calendar', icon: Calendar },
    { id: 'schedule' as const, label: 'Classes', icon: GraduationCap },
    { id: 'todo' as const, label: 'To-Do', icon: CheckSquare },
  ];

  const moreItems = [
    { id: 'habits' as const, label: 'Daily Habits', icon: Flame, color: '#F59E0B' },
    { id: 'grocery' as const, label: 'Grocery List', icon: ShoppingBag, color: '#10B981' },
    { id: 'meals' as const, label: 'Meal Planner', icon: Utensils, color: '#EC4899' },
    { id: 'notes' as const, label: 'Notes & Docs', icon: FileText, color: '#8B5CF6' },
  ];

  const isMoreActive = moreItems.some((item) => item.id === activeTab);

  return (
    <>
      {/* Floating Action + Button on Mobile */}
      <button
        type="button"
        onClick={onOpenAddModal}
        style={{
          position: 'fixed',
          bottom: 'calc(4rem + env(safe-area-inset-bottom, 12px))',
          right: '1.25rem',
          zIndex: 95,
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: '#2563EB',
          color: '#FFFFFF',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 18px rgba(37, 99, 235, 0.35)',
          cursor: 'pointer',
          transition: 'transform 0.15s ease',
        }}
        title="Quick Add"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* Mobile Bottom Navigation Bar */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 90,
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '0.4rem',
        paddingBottom: 'calc(0.4rem + env(safe-area-inset-bottom, 0px))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        backdropFilter: 'blur(12px)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                background: 'transparent',
                border: 'none',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                minHeight: '44px',
                transition: 'color 0.15s ease',
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span style={{
                fontSize: '0.675rem',
                fontWeight: isActive ? 800 : 600,
                letterSpacing: '-0.01em',
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* More Tab Button */}
        <button
          type="button"
          onClick={() => setShowMoreSheet(true)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            background: 'transparent',
            border: 'none',
            color: isMoreActive ? 'var(--accent-primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            minHeight: '44px',
            transition: 'color 0.15s ease',
          }}
        >
          <MoreHorizontal size={20} strokeWidth={isMoreActive ? 2.5 : 1.8} />
          <span style={{
            fontSize: '0.675rem',
            fontWeight: isMoreActive ? 800 : 600,
            letterSpacing: '-0.01em',
          }}>
            {isMoreActive ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1) : 'More'}
          </span>
        </button>
      </nav>

      {/* More Options Bottom Sheet */}
      <BottomSheet
        isOpen={showMoreSheet}
        onClose={() => setShowMoreSheet(false)}
        title="More Sections"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {moreItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setShowMoreSheet(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '14px',
                  border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  backgroundColor: isSelected ? 'var(--accent-light)' : 'var(--bg-hover)',
                  color: 'var(--text-primary)',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  minHeight: '52px',
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  backgroundColor: item.color + '1A',
                  color: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={18} />
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}

          {onOpenSettings && (
            <button
              type="button"
              onClick={() => {
                setShowMoreSheet(false);
                onOpenSettings();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.85rem 1rem',
                borderRadius: '14px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-hover)',
                color: 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                marginTop: '0.5rem',
                minHeight: '52px',
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Settings size={18} />
              </div>
              <span>Settings & Sync</span>
            </button>
          )}
        </div>
      </BottomSheet>
    </>
  );
};
