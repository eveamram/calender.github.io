import React, { useEffect } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { MonthGrid } from './MonthGrid';
import { WeekView } from './WeekView';
import { AgendaView } from './AgendaView';
import { CalendarEvent, EVENT_TYPES } from '../../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Sparkles, Filter } from 'lucide-react';
import { format, addMonths, subMonths, addWeeks, subWeeks } from 'date-fns';

interface CalendarViewProps {
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectDate: (date: Date) => void;
  onOpenAddEvent: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onSelectEvent,
  onSelectDate,
  onOpenAddEvent,
}) => {
  const { viewMode, setViewMode, currentDate, setCurrentDate, filterState, setFilterState } = useCalendar();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenAddEvent();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenAddEvent]);

  const handlePrev = () => {
    if (viewMode === 'week') {
      setCurrentDate((prev) => subWeeks(prev, 1));
    } else {
      setCurrentDate((prev) => addMonths(prev, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      setCurrentDate((prev) => addWeeks(prev, 1));
    } else {
      setCurrentDate((prev) => addMonths(prev, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', width: '100%' }}>
      {/* Date Control & Toolbar */}
      <div className="glass-card" style={{
        padding: '0.85rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        borderRadius: 'var(--radius-lg)',
      }}>
        {/* Month Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, minWidth: '180px', color: 'var(--text-primary)' }}>
            {format(currentDate, viewMode === 'week' ? "MMM yyyy 'Week' w" : 'MMMM yyyy')}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handlePrev}
              title="Previous"
              style={{ padding: '0.45rem 0.65rem', borderRadius: '10px' }}
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleToday}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', fontWeight: 700, borderRadius: '10px' }}
            >
              Today
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleNext}
              title="Next"
              style={{ padding: '0.45rem 0.65rem', borderRadius: '10px' }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Action & View Mode Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Quick Add Button with Keyboard Shortcut Badge */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenAddEvent}
            style={{ padding: '0.5rem 1.15rem', fontSize: '0.875rem' }}
          >
            <Plus size={18} /> Add Event
            <span style={{
              fontSize: '0.7rem',
              backgroundColor: 'rgba(255,255,255,0.25)',
              padding: '1px 6px',
              borderRadius: '4px',
              marginLeft: '4px',
            }}>
              ⌘K
            </span>
          </button>

          {/* View Switcher Tabs */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-hover)',
            padding: '4px',
            borderRadius: '12px',
          }}>
            {(['month', 'week', 'agenda'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                className="btn"
                onClick={() => setViewMode(mode)}
                style={{
                  borderRadius: '9px',
                  padding: '0.45rem 0.95rem',
                  fontSize: '0.85rem',
                  textTransform: 'capitalize',
                  backgroundColor: viewMode === mode ? 'var(--bg-card)' : 'transparent',
                  color: viewMode === mode ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: viewMode === mode ? 'var(--shadow-sm)' : 'none',
                  fontWeight: viewMode === mode ? 800 : 500,
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Colorful Quick Category Pills Strip */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.2rem',
      }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}>
          <Filter size={13} /> Quick Filter:
        </span>

        <button
          type="button"
          onClick={() => setFilterState((prev) => ({ ...prev, eventTypeFilter: 'all' }))}
          style={{
            padding: '0.3rem 0.75rem',
            borderRadius: '999px',
            border: 'none',
            fontSize: '0.775rem',
            fontWeight: filterState.eventTypeFilter === 'all' ? 800 : 600,
            backgroundColor: filterState.eventTypeFilter === 'all' ? 'var(--accent-primary)' : 'var(--bg-card)',
            color: filterState.eventTypeFilter === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          All Categories
        </button>

        {EVENT_TYPES.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => setFilterState((prev) => ({
              ...prev,
              eventTypeFilter: prev.eventTypeFilter === t.label ? 'all' : t.label,
            }))}
            style={{
              padding: '0.3rem 0.75rem',
              borderRadius: '999px',
              border: 'none',
              fontSize: '0.775rem',
              fontWeight: filterState.eventTypeFilter === t.label ? 800 : 600,
              backgroundColor: filterState.eventTypeFilter === t.label ? t.color : 'var(--bg-card)',
              color: filterState.eventTypeFilter === t.label ? '#FFFFFF' : 'var(--text-secondary)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: filterState.eventTypeFilter === t.label ? '#FFFFFF' : t.color }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Render Main View Component */}
      {viewMode === 'month' && (
        <MonthGrid onSelectEvent={onSelectEvent} onSelectDate={onSelectDate} />
      )}

      {viewMode === 'week' && (
        <WeekView onSelectEvent={onSelectEvent} onSelectDate={onSelectDate} />
      )}

      {viewMode === 'agenda' && (
        <AgendaView onSelectEvent={onSelectEvent} onOpenAddEvent={onOpenAddEvent} />
      )}
    </div>
  );
};
