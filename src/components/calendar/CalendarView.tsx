import React, { useEffect } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { MonthGrid } from './MonthGrid';
import { WeekView } from './WeekView';
import { AgendaView } from './AgendaView';
import { ScheduleView } from '../schedule/ScheduleView';
import { CalendarEvent } from '../../types';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
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
  const { viewMode, setViewMode, currentDate, setCurrentDate, filterState } = useCalendar();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenAddEvent();
      } else if (e.key.toLowerCase() === 't') {
        setCurrentDate(new Date());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenAddEvent, setCurrentDate]);

  const handlePrev = () => {
    if (viewMode === 'week') {
      setCurrentDate((prev) => subWeeks(prev, 1));
    } else {
      setCurrentDate((prev) => subMonths(prev, 1));
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

  const activeTab = filterState.tabFilter || 'calendar';

  if (activeTab === 'schedule') {
    return <ScheduleView onSelectEvent={onSelectEvent} onOpenAddEvent={onOpenAddEvent} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* Navigation & Controls Bar */}
      <div className="glass-card" style={{
        padding: '0.85rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        borderRadius: 'var(--radius-lg)',
      }}>
        {/* Date Title & Prev/Today/Next */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, minWidth: '170px', color: 'var(--text-primary)' }}>
            {format(currentDate, viewMode === 'week' ? "MMM yyyy 'Week' w" : 'MMMM yyyy')}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handlePrev}
              title="Previous"
              style={{ padding: '0.4rem 0.65rem', borderRadius: '10px' }}
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleToday}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', fontWeight: 700, borderRadius: '10px' }}
            >
              Today
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleNext}
              title="Next"
              style={{ padding: '0.4rem 0.65rem', borderRadius: '10px' }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Action Controls & View Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenAddEvent}
            style={{ padding: '0.5rem 1.15rem', fontSize: '0.875rem' }}
          >
            <Plus size={18} /> New Event
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
            padding: '3px',
            borderRadius: '12px',
          }}>
            {(['month', 'week', 'agenda'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                className="btn"
                onClick={() => setViewMode(mode)}
                style={{
                  borderRadius: '999px',
                  padding: '0.4rem 0.85rem',
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

      {/* Main View Display */}
      {activeTab === 'upcoming' || viewMode === 'agenda' ? (
        <AgendaView onSelectEvent={onSelectEvent} onOpenAddEvent={onOpenAddEvent} />
      ) : viewMode === 'week' ? (
        <WeekView onSelectEvent={onSelectEvent} onSelectDate={onSelectDate} />
      ) : (
        <MonthGrid onSelectEvent={onSelectEvent} onSelectDate={onSelectDate} />
      )}
    </div>
  );
};
