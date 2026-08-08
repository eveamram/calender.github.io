import React, { useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { useAuth } from '../../context/AuthContext';
import { CalendarEvent } from '../../types';
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  BookOpen,
  MapPin,
  CheckCircle2,
  Circle,
  GraduationCap,
  Calendar as CalendarIcon,
} from 'lucide-react';

interface ScheduleViewProps {
  onSelectEvent: (event: CalendarEvent) => void;
  onOpenAddEvent: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  onSelectEvent,
  onOpenAddEvent,
}) => {
  const { events, members, currentDate, setCurrentDate, toggleEventCompleted } = useCalendar();
  const { userProfile } = useAuth();

  const [scheduleMode, setScheduleMode] = useState<'day' | 'week'>('week');
  const [selectedPerson, setSelectedPerson] = useState<'all' | 'Eve' | 'Abbie'>('all');

  const eveUser = members.find((m) => m.display_name.toLowerCase().includes('eve')) || members[0];
  const abbieUser = members.find((m) => m.display_name.toLowerCase().includes('abbie')) || members[1];

  // Filter events based on person selection
  const filteredScheduleEvents = events.filter((evt) => {
    if (selectedPerson === 'Eve' && eveUser) {
      return evt.owner_user_id === eveUser.user_id || evt.created_by === eveUser.user_id;
    }
    if (selectedPerson === 'Abbie' && abbieUser) {
      return evt.owner_user_id === abbieUser.user_id || evt.created_by === abbieUser.user_id;
    }
    return true;
  });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getOwnerMember = (userId?: string | null) => {
    if (!userId) return null;
    return members.find((m) => m.user_id === userId);
  };

  // Hours array for Day View (8 AM to 9 PM)
  const HOURS = Array.from({ length: 14 }, (_, i) => i + 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', width: '100%' }}>
      {/* Schedule Header & Controls */}
      <div className="glass-card" style={{
        padding: '1.1rem 1.4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        {/* Title & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GraduationCap size={24} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {scheduleMode === 'week' ? `Week of ${format(weekStart, 'MMM d, yyyy')}` : format(currentDate, 'EEEE, MMM d, yyyy')}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCurrentDate((prev) => (scheduleMode === 'week' ? subDays(prev, 7) : subDays(prev, 1)))}
              style={{ padding: '0.4rem 0.65rem', borderRadius: '10px' }}
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCurrentDate(new Date())}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', fontWeight: 700, borderRadius: '10px' }}
            >
              Today
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCurrentDate((prev) => (scheduleMode === 'week' ? addDays(prev, 7) : addDays(prev, 1)))}
              style={{ padding: '0.4rem 0.65rem', borderRadius: '10px' }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Person Selector & Day/Week View Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          {/* Eve vs Abbie vs Both Person Filter */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-hover)',
            padding: '3px',
            borderRadius: '999px',
            border: '1px solid var(--border-color)',
          }}>
            {(['all', 'Eve', 'Abbie'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setSelectedPerson(p)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: selectedPerson === p ? 'var(--accent-primary)' : 'transparent',
                  color: selectedPerson === p ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: selectedPerson === p ? 800 : 600,
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {p === 'all' ? '👥 Both' : p === 'Eve' ? '🔵 Eve' : '💗 Abbie'}
              </button>
            ))}
          </div>

          {/* Day / Week View Mode Switcher */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-hover)',
            padding: '3px',
            borderRadius: '12px',
          }}>
            {(['day', 'week'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setScheduleMode(mode)}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: '9px',
                  border: 'none',
                  backgroundColor: scheduleMode === mode ? 'var(--bg-card)' : 'transparent',
                  color: scheduleMode === mode ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: scheduleMode === mode ? 800 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  boxShadow: scheduleMode === mode ? 'var(--shadow-sm)' : 'none',
                }}
              >
                {mode === 'day' ? 'Full Day Plan' : 'Weekly Timetable'}
              </button>
            ))}
          </div>

          {/* Add Class / Plan Button */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenAddEvent}
            style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}
          >
            <Plus size={16} /> Add Class / Plan
          </button>
        </div>
      </div>

      {/* WEEKLY TIMETABLE GRID */}
      {scheduleMode === 'week' ? (
        <div className="glass-card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(130px, 1fr))',
            gap: '10px',
          }}>
            {weekDays.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const isTodayDay = isToday(day);
              const dayEvents = filteredScheduleEvents.filter((e) => e.event_date === dayStr);

              return (
                <div
                  key={day.toISOString()}
                  style={{
                    backgroundColor: isTodayDay ? 'var(--accent-light)' : 'var(--bg-secondary)',
                    border: isTodayDay ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem',
                    minHeight: '420px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                  }}
                >
                  {/* Day Title Header */}
                  <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      {format(day, 'EEE')}
                    </div>
                    <div style={{
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: isTodayDay ? 'var(--accent-primary)' : 'var(--text-primary)',
                    }}>
                      {format(day, 'MMM d')}
                    </div>
                  </div>

                  {/* Day Events List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {dayEvents.length === 0 ? (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem', fontStyle: 'italic' }}>
                        No classes scheduled
                      </div>
                    ) : (
                      dayEvents.map((evt) => {
                        const owner = getOwnerMember(evt.owner_user_id || evt.created_by);
                        const isCompleted = evt.is_completed;

                        return (
                          <div
                            key={evt.id}
                            onClick={() => onSelectEvent(evt)}
                            style={{
                              padding: '0.6rem 0.65rem',
                              borderRadius: '10px',
                              backgroundColor: isCompleted ? 'var(--bg-hover)' : `${evt.color || '#3B82F6'}15`,
                              borderLeft: `4px solid ${evt.color || '#3B82F6'}`,
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.25rem',
                              opacity: isCompleted ? 0.6 : 1,
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                              <span style={{
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                color: 'var(--text-primary)',
                                textDecoration: isCompleted ? 'line-through' : 'none',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}>
                                {evt.emoji || '📚'} {evt.title}
                              </span>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleEventCompleted(evt.id);
                                }}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isCompleted ? '#10B981' : 'var(--text-muted)', padding: 0 }}
                              >
                                {isCompleted ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                              </button>
                            </div>

                            {/* Time & Location */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {evt.start_time ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                  <Clock size={11} /> {evt.start_time} {evt.end_time ? `- ${evt.end_time}` : ''}
                                </span>
                              ) : (
                                <span>All Day</span>
                              )}
                            </div>

                            {/* Owner Badge */}
                            {owner && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
                                <div style={{
                                  width: '14px',
                                  height: '14px',
                                  borderRadius: '50%',
                                  backgroundColor: owner.profile_color,
                                  color: '#FFFFFF',
                                  fontSize: '0.55rem',
                                  fontWeight: 800,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                  {owner.display_name.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontSize: '0.675rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                  {owner.display_name}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* FULL DAY PLAN TIMELINE */
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {HOURS.map((hour) => {
              const timeString = `${hour < 10 ? '0' : ''}${hour}:00`;
              const formattedHour = format(new Date().setHours(hour, 0), 'h:00 a');

              const dayStr = format(currentDate, 'yyyy-MM-dd');
              const matchingEvents = filteredScheduleEvents.filter((e) => {
                if (e.event_date !== dayStr) return false;
                if (!e.start_time) return hour === 9; // default all day to 9am slot
                const eventHour = parseInt(e.start_time.split(':')[0], 10);
                return eventHour === hour;
              });

              return (
                <div
                  key={hour}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr',
                    gap: '1rem',
                    alignItems: 'flex-start',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '0.85rem',
                  }}
                >
                  {/* Time Label */}
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', paddingTop: '4px' }}>
                    {formattedHour}
                  </div>

                  {/* Class / Plan Slots */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {matchingEvents.length === 0 ? (
                      <div
                        onClick={onOpenAddEvent}
                        style={{
                          height: '36px',
                          borderRadius: '8px',
                          border: '1px dashed var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '0.75rem',
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          opacity: 0.6,
                        }}
                      >
                        + Add plan for {formattedHour}
                      </div>
                    ) : (
                      matchingEvents.map((evt) => {
                        const owner = getOwnerMember(evt.owner_user_id || evt.created_by);
                        const isCompleted = evt.is_completed;

                        return (
                          <div
                            key={evt.id}
                            onClick={() => onSelectEvent(evt)}
                            style={{
                              padding: '0.75rem 1rem',
                              borderRadius: '12px',
                              backgroundColor: isCompleted ? 'var(--bg-hover)' : `${evt.color || '#3B82F6'}18`,
                              borderLeft: `5px solid ${evt.color || '#3B82F6'}`,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <span style={{ fontSize: '1.2rem' }}>{evt.emoji || '📚'}</span>
                              <div>
                                <div style={{
                                  fontSize: '0.95rem',
                                  fontWeight: 800,
                                  color: 'var(--text-primary)',
                                  textDecoration: isCompleted ? 'line-through' : 'none',
                                }}>
                                  {evt.title}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', marginTop: '2px' }}>
                                  <span>⏰ {evt.start_time || 'All Day'} {evt.end_time ? `- ${evt.end_time}` : ''}</span>
                                  {evt.location && <span>📍 {evt.location}</span>}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              {owner && (
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  backgroundColor: 'var(--bg-card)',
                                  padding: '0.25rem 0.6rem',
                                  borderRadius: '999px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  border: '1px solid var(--border-color)',
                                }}>
                                  <div style={{
                                    width: '14px',
                                    height: '14px',
                                    borderRadius: '50%',
                                    backgroundColor: owner.profile_color,
                                    color: '#FFFFFF',
                                    fontSize: '0.55rem',
                                    fontWeight: 800,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}>
                                    {owner.display_name.charAt(0).toUpperCase()}
                                  </div>
                                  {owner.display_name}
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleEventCompleted(evt.id);
                                }}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isCompleted ? '#10B981' : 'var(--text-muted)' }}
                              >
                                {isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
