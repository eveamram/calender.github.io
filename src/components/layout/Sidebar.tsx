import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { useAuth } from '../../context/AuthContext';
import { CATEGORY_COLORS } from '../../types';
import {
  Calendar as CalendarIcon,
  ClipboardList,
  Star,
  Settings as SettingsIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { exportEventsToICS } from '../../lib/icsExport';

interface SidebarProps {
  onOpenAddEvent?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenAddEvent }) => {
  const {
    filterState,
    setFilterState,
    activeCalendar,
    members,
    events,
    filteredEvents,
    currentDate,
    setCurrentDate,
    addToast,
  } = useCalendar();
  const { userProfile } = useAuth();
  const [copiedCode, setCopiedCode] = React.useState(false);

  const activeTab = filterState.tabFilter || 'calendar';

  const handleCopyInviteCode = () => {
    if (activeCalendar?.invite_code) {
      navigator.clipboard.writeText(activeCalendar.invite_code);
      setCopiedCode(true);
      addToast('Invite code copied!', 'success');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleExport = () => {
    exportEventsToICS(filteredEvents, `${activeCalendar?.name || 'calender'}.ics`);
    addToast('Calendar exported to .ics file', 'success');
  };

  // Mini Calendar Generation
  const miniMonthStart = startOfMonth(currentDate);
  const miniMonthEnd = endOfMonth(miniMonthStart);
  const miniStartDate = startOfWeek(miniMonthStart);
  const miniEndDate = endOfWeek(miniMonthEnd);
  const miniDays = eachDayOfInterval({ start: miniStartDate, end: miniEndDate });

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', width: '100%' }}>
      {/* Quick Add Button */}
      {onOpenAddEvent && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenAddEvent}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            fontSize: '0.95rem',
            borderRadius: '14px',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <Plus size={18} /> New Event
        </button>
      )}

      {/* Navigation Links */}
      <div className="glass-card" style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {[
          { id: 'calendar', label: 'Calendar', icon: CalendarIcon, color: '#4F46E5' },
          { id: 'upcoming', label: 'Upcoming', icon: ClipboardList, color: '#10B981' },
          { id: 'important', label: 'Important', icon: Star, color: '#EF4444' },
          { id: 'settings', label: 'Settings', icon: SettingsIcon, color: '#64748B' },
        ].map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setFilterState((prev) => ({
                  ...prev,
                  tabFilter: item.id as any,
                  eventTypeFilter: item.id === 'important' ? 'Important' : 'all',
                }));
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: isActive ? 'var(--accent-light)' : 'transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <IconComponent size={18} style={{ color: isActive ? 'var(--accent-primary)' : item.color }} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Mini Monthly Calendar Widget */}
      <div className="glass-card" style={{ padding: '0.85rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <div style={{ display: 'flex', gap: '2px' }}>
            <button
              type="button"
              onClick={() => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
            <div key={idx}>{d}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
          {miniDays.map((d) => {
            const isCurrMonth = isSameMonth(d, miniMonthStart);
            const isTodayDate = isToday(d);
            const dateStr = format(d, 'yyyy-MM-dd');
            const hasEvent = events.some((e) => e.event_date === dateStr);

            return (
              <div
                key={d.toISOString()}
                onClick={() => setCurrentDate(d)}
                style={{
                  padding: '4px 0',
                  fontSize: '0.725rem',
                  fontWeight: isTodayDate ? 800 : 500,
                  borderRadius: '6px',
                  backgroundColor: isTodayDate ? 'var(--accent-primary)' : 'transparent',
                  color: isTodayDate ? '#FFFFFF' : isCurrMonth ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  opacity: isCurrMonth ? 1 : 0.4,
                  position: 'relative',
                }}
              >
                {format(d, 'd')}
                {hasEvent && !isTodayDate && (
                  <div style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Color Legend & Category Filter */}
      <div className="glass-card" style={{ padding: '0.85rem 1rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.6rem', letterSpacing: '0.04em' }}>
          Color Categories
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {CATEGORY_COLORS.map((cat) => {
            const isSelected = filterState.eventTypeFilter === cat.label;
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => {
                  setFilterState((prev) => ({
                    ...prev,
                    eventTypeFilter: prev.eventTypeFilter === cat.label ? 'all' : cat.label,
                  }));
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isSelected ? `${cat.color}1E` : 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.825rem',
                  fontWeight: isSelected ? 800 : 600,
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: cat.color }} />
                  <span>{cat.emoji} {cat.label}</span>
                </div>
                {isSelected && <Check size={14} style={{ color: cat.color }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Shared Calendar Invite Code */}
      {activeCalendar?.invite_code && (
        <div className="glass-card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Code: <strong style={{ color: 'var(--text-primary)' }}>{activeCalendar.invite_code}</strong></span>
          <button
            type="button"
            onClick={handleCopyInviteCode}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: 0 }}
          >
            {copiedCode ? <Check size={14} style={{ color: '#10B981' }} /> : <Copy size={14} />}
          </button>
        </div>
      )}
    </aside>
  );
};
