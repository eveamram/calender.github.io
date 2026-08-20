import React, { useState, useEffect } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Plus, Flame, Check, Sparkles, Trash2, User, Calendar as CalendarIcon, Circle, Pencil } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useIsMobile } from '../../hooks/useIsMobile';
import { subscribeToSync, syncInsertItem, syncUpdateItem, syncDeleteItem, fetchInitialData, startAutoPolling } from '../../lib/syncEngine';

export interface HabitItem {
  id: string;
  title: string;
  emoji: string;
  color: string;
  owner: 'Eve' | 'Abbie';
  daysOfWeek: number[]; // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 0=Sun
  created_at: string;
  completedDates: string[]; // Array of "YYYY-MM-DD" date strings
  showOnSchedule?: boolean;
}

const WEEKDAYS = [
  { label: 'Mon', value: 1, full: 'Monday' },
  { label: 'Tue', value: 2, full: 'Tuesday' },
  { label: 'Wed', value: 3, full: 'Wednesday' },
  { label: 'Thu', value: 4, full: 'Thursday' },
  { label: 'Fri', value: 5, full: 'Friday' },
  { label: 'Sat', value: 6, full: 'Saturday' },
  { label: 'Sun', value: 0, full: 'Sunday' },
];

const DEFAULT_HABITS: HabitItem[] = [
  {
    id: 'habit-1',
    title: '30m Gym / Morning Workout',
    emoji: '🏋️',
    color: '#3B82F6',
    owner: 'Eve',
    daysOfWeek: [1, 3, 5],
    created_at: new Date().toISOString(),
    completedDates: [],
  },
  {
    id: 'habit-2',
    title: 'Drink 2L Water',
    emoji: '💧',
    color: '#06B6D4',
    owner: 'Eve',
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
    created_at: new Date().toISOString(),
    completedDates: [],
  },
  {
    id: 'habit-3',
    title: 'Calculus & Physics Prep',
    emoji: '📖',
    color: '#EC4899',
    owner: 'Abbie',
    daysOfWeek: [2, 4],
    created_at: new Date().toISOString(),
    completedDates: [],
  },
  {
    id: 'habit-4',
    title: 'Weekend Reset & Planning',
    emoji: '🧘',
    color: '#10B981',
    owner: 'Abbie',
    daysOfWeek: [6, 0],
    created_at: new Date().toISOString(),
    completedDates: [],
  },
];

const HABIT_EMOJIS = ['🏋️', '💧', '📖', '🧘', '💻', '🏃', '🎨', '🍎', '💤', '✍️', '🎵', '☕'];
const HABIT_COLORS = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4'];

export const HabitsView: React.FC = () => {
  const isMobile = useIsMobile();
  const { activePersonaFilter } = useCalendar();

  const [habits, setHabits] = useState<HabitItem[]>(DEFAULT_HABITS);

  // Mode: Daily List vs Full Week Grid (Always daily list on mobile!)
  const [viewType, setViewType] = useState<'daily' | 'weekly'>(isMobile ? 'daily' : 'daily');

  const todayDayNum = new Date().getDay(); // 0=Sun, 1=Mon...
  const [selectedDayVal, setSelectedDayVal] = useState<number>(todayDayNum);

  const [newTitle, setNewTitle] = useState('');
  const [newEmoji, setNewEmoji] = useState('🏋️');
  const [newColor, setNewColor] = useState('#3B82F6');
  const [newOwner, setNewOwner] = useState<'Eve' | 'Abbie'>('Eve');
  const [newSelectedDays, setNewSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitItem | null>(null);

  useEffect(() => {
    fetchInitialData<HabitItem>('habits').then((remoteHabits) => {
      if (remoteHabits && remoteHabits.length > 0) {
        setHabits(remoteHabits);
      }
    });

    const stopPolling = startAutoPolling<HabitItem>('habits', (remoteHabits) => {
      if (remoteHabits && remoteHabits.length > 0) {
        setHabits(remoteHabits);
      }
    }, 2500);

    const unsubscribe = subscribeToSync('habits', (event) => {
      if (event.type === 'INSERT' && event.payload) {
        const item = event.payload as HabitItem;
        setHabits((prev) => (prev.some((h) => h.id === item.id) ? prev : [item, ...prev]));
      } else if (event.type === 'UPDATE' && event.id) {
        setHabits((prev) =>
          prev.map((h) => (h.id === event.id ? { ...h, ...event.payload } : h))
        );
      } else if (event.type === 'DELETE' && event.id) {
        setHabits((prev) => prev.filter((h) => h.id !== event.id));
      }
    });
    return () => {
      stopPolling();
      unsubscribe();
    };
  }, []);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');

  // Automatic Weekly Refresh: clear checkmarks when a new week starts so habits start fresh without checks
  useEffect(() => {
    try {
      const lastRefreshedWeek = localStorage.getItem('calender_habits_last_week');
      if (lastRefreshedWeek !== weekStartStr) {
        localStorage.setItem('calender_habits_last_week', weekStartStr);
        setHabits((prev) =>
          prev.map((h) => ({
            ...h,
            // Keep only completion checkmarks that belong to the current week (>= weekStartStr)
            completedDates: (h.completedDates || []).filter((d) => d >= weekStartStr),
          }))
        );
      }
    } catch {
      // LocalStorage error catch
    }
  }, [weekStartStr]);

  // Get active day date string
  const activeDayDateObj = weekDays.find((d) => d.getDay() === selectedDayVal) || new Date();
  const activeDayDateStr = format(activeDayDateObj, 'yyyy-MM-dd');
  const activeDayLabel = WEEKDAYS.find((w) => w.value === selectedDayVal)?.full || 'Today';

  // Filter habits by persona
  const personaHabits = habits.filter((h) => {
    if (activePersonaFilter === 'all') return true;
    return h.owner === activePersonaFilter;
  });

  // Filter for single day view with fallback to all persona habits
  const singleDayHabits = personaHabits.filter((h) => {
    const days = h.daysOfWeek || [1, 2, 3, 4, 5, 6, 0];
    return days.includes(selectedDayVal);
  });
  const displayHabits = singleDayHabits.length > 0 ? singleDayHabits : personaHabits;

  const handleToggleHabit = (habitId: string, dateStr: string) => {
    const targetHabit = habits.find((h) => h.id === habitId);
    if (!targetHabit) return;

    const completed = targetHabit.completedDates || [];
    const isDone = completed.includes(dateStr);
    const newDates = isDone
      ? completed.filter((d) => d !== dateStr)
      : [...completed, dateStr];

    if (!isDone) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: [targetHabit.color, '#3B82F6', '#EC4899', '#10B981'],
      });
    }

    setHabits((prev) =>
      prev.map((h) => (h.id === habitId ? { ...h, completedDates: newDates } : h))
    );

    syncUpdateItem('habits', habitId, { completedDates: newDates });
  };

  const toggleDaySelection = (dayVal: number) => {
    if (newSelectedDays.includes(dayVal)) {
      if (newSelectedDays.length === 1) return;
      setNewSelectedDays(newSelectedDays.filter((d) => d !== dayVal));
    } else {
      setNewSelectedDays([...newSelectedDays, dayVal]);
    }
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const habit: HabitItem = {
      id: `habit-${Date.now()}`,
      title: newTitle.trim(),
      emoji: newEmoji,
      color: newColor,
      owner: newOwner,
      daysOfWeek: newSelectedDays,
      created_at: new Date().toISOString(),
      completedDates: [],
    };

    setHabits((prev) => [habit, ...prev]);
    syncInsertItem('habits', habit);
    setNewTitle('');
    setShowAddForm(false);
  };

  const handleDeleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    syncDeleteItem('habits', id);
  };

  const calculateStreak = (habit: HabitItem) => {
    let streak = 0;
    let checkDate = new Date();

    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      const dayNum = checkDate.getDay();
      const habitDays = habit.daysOfWeek || [1, 2, 3, 4, 5, 6, 0];

      if (habitDays.includes(dayNum)) {
        if (habit.completedDates.includes(dateStr)) {
          streak++;
          checkDate = addDays(checkDate, -1);
        } else {
          if (dateStr === todayStr && streak === 0) {
            checkDate = addDays(checkDate, -1);
            continue;
          }
          break;
        }
      } else {
        checkDate = addDays(checkDate, -1);
      }
    }
    return streak;
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      padding: isMobile ? '0.85rem 0.65rem' : '1.75rem',
      width: '100%',
      maxWidth: '820px',
      margin: '0 auto',
      boxShadow: 'var(--shadow-subtle)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      boxSizing: 'border-box',
    }}>
      {/* Top Header & Controls */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem',
        marginBottom: '1.25rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div>
          <h2 style={{
            fontSize: isMobile ? '1.25rem' : '1.5rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}>
            Daily Habits <Flame size={18} color="#F59E0B" />
          </h2>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {activePersonaFilter === 'all' ? 'Habits for Eve & Abbie' : `Habits for ${activePersonaFilter}`}
          </p>
        </div>

        {/* View Switcher: Daily vs Weekly Grid */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isMobile ? 'space-between' : 'flex-end',
          gap: '0.5rem',
          width: isMobile ? '100%' : 'auto',
          flexWrap: 'wrap',
        }}>
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-hover)',
            padding: '2px',
            borderRadius: '999px',
            border: '1px solid var(--border-color)',
          }}>
            <button
              type="button"
              onClick={() => setViewType('daily')}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: viewType === 'daily' ? 'var(--bg-secondary)' : 'transparent',
                color: viewType === 'daily' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Daily View
            </button>

            <button
              type="button"
              onClick={() => setViewType('weekly')}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: viewType === 'weekly' ? 'var(--bg-secondary)' : 'transparent',
                color: viewType === 'weekly' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Full Week Grid
            </button>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
          >
            <Plus size={14} /> Add Habit
          </button>
        </div>
      </div>

      {/* Day Selector (for Daily View) */}
      {viewType === 'daily' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '0.25rem' : '0.4rem',
          marginBottom: '1.25rem',
          backgroundColor: 'var(--bg-hover)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          width: '100%',
          boxSizing: 'border-box',
        }}>
          {WEEKDAYS.map((wd) => {
            const isSelected = selectedDayVal === wd.value;
            const isTodayWd = todayDayNum === wd.value;

            return (
              <button
                key={wd.value}
                type="button"
                onClick={() => setSelectedDayVal(wd.value)}
                style={{
                  flex: isMobile ? '1 0 auto' : 1,
                  padding: isMobile ? '0.35rem 0.55rem' : '0.45rem 0.75rem',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: isSelected ? (isTodayWd ? 'var(--accent-primary)' : 'var(--bg-secondary)') : 'transparent',
                  color: isSelected ? (isTodayWd ? '#FFFFFF' : 'var(--accent-primary)') : (isTodayWd ? 'var(--accent-primary)' : 'var(--text-secondary)'),
                  fontWeight: 800,
                  fontSize: isMobile ? '0.75rem' : '0.8rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                  transition: 'all 0.12s ease',
                }}
              >
                {wd.label} {isTodayWd && '•'}
              </button>
            );
          })}
        </div>
      )}

      {/* Add Habit Form */}
      {showAddForm && (
        <form onSubmit={handleAddHabit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          backgroundColor: 'var(--bg-primary)',
          padding: '1.1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Habit title (e.g. Leg Day Gym, Calculus Prep, Water 2L)..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{ flex: 1, minWidth: '220px' }}
              autoFocus
              required
            />

            <select
              className="input-field"
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value as 'Eve' | 'Abbie')}
              style={{ width: 'auto' }}
            >
              <option value="Eve">Eve</option>
              <option value="Abbie">Abbie</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Schedule Days:
            </label>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {WEEKDAYS.map((wd) => {
                const active = newSelectedDays.includes(wd.value);
                return (
                  <button
                    key={wd.value}
                    type="button"
                    onClick={() => toggleDaySelection(wd.value)}
                    style={{
                      padding: '0.3rem 0.65rem',
                      borderRadius: '6px',
                      border: active ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      backgroundColor: active ? 'var(--accent-light)' : 'var(--bg-secondary)',
                      color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    {wd.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {HABIT_EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setNewEmoji(em)}
                  style={{
                    fontSize: '1rem',
                    padding: '0.3rem',
                    borderRadius: '6px',
                    border: newEmoji === em ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    backgroundColor: newEmoji === em ? 'var(--accent-light)' : 'var(--bg-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {em}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              {HABIT_COLORS.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setNewColor(col)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: col,
                    border: newColor === col ? '2.5px solid var(--text-primary)' : 'none',
                    cursor: 'pointer',
                  }}
                />
              ))}

              {/* Custom Multi-Color Rainbow Picker Icon */}
              <div
                style={{
                  width: '26px',
                  height: '26px',
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
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
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

              <button
                type="submit"
                className="btn btn-primary"
                style={{ marginLeft: '0.5rem', padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
              >
                Save Habit
              </button>
            </div>
          </div>
        </form>
      )}

      {/* RENDER 1: CLEAN SINGLE DAY VIEW */}
      {viewType === 'daily' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {activeDayLabel}'s Habits ({displayHabits.length})
            </h3>
          </div>

          {displayHabits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <Sparkles size={24} style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>No habits added yet!</p>
              <p style={{ fontSize: '0.8rem', marginTop: '3px' }}>Click "Add Habit" to customize your day!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {displayHabits.map((habit) => {
                const isDone = habit.completedDates.includes(activeDayDateStr);
                const streak = calculateStreak(habit);

                return (
                  <div
                    key={habit.id}
                    style={{
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      alignItems: isMobile ? 'stretch' : 'center',
                      justifyContent: 'space-between',
                      gap: isMobile ? '0.55rem' : '0.85rem',
                      padding: isMobile ? '0.75rem 0.85rem' : '0.8rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isDone ? 'var(--bg-hover)' : 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      borderLeft: `4px solid ${habit.color}`,
                      opacity: isDone ? 0.75 : 1,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                      <button
                        type="button"
                        onClick={() => handleToggleHabit(habit.id, activeDayDateStr)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {isDone ? (
                          <div style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            backgroundColor: habit.color,
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 2px 6px ${habit.color}40`,
                          }}>
                            <Check size={16} strokeWidth={3} />
                          </div>
                        ) : (
                          <Circle size={26} strokeWidth={1.8} color="var(--text-muted)" />
                        )}
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flex: 1, minWidth: 0, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1.15rem' }}>{habit.emoji}</span>
                        <span style={{
                          fontSize: '0.925rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          textDecoration: isDone ? 'line-through' : 'none',
                          wordBreak: 'break-word',
                        }}>
                          {habit.title}
                        </span>

                        {activePersonaFilter === 'all' && (
                          <span style={{
                            fontSize: '0.625rem',
                            fontWeight: 800,
                            padding: '0.08rem 0.4rem',
                            borderRadius: '999px',
                            backgroundColor: habit.owner === 'Eve' ? '#EFF6FF' : '#FDF2F8',
                            color: habit.owner === 'Eve' ? '#1E40AF' : '#9D174D',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px',
                          }}>
                            <User size={9} /> {habit.owner}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isMobile ? 'space-between' : 'flex-end',
                      gap: '0.5rem',
                      paddingTop: isMobile ? '0.4rem' : '0',
                      borderTop: isMobile ? '1px solid var(--border-subtle)' : 'none',
                    }}>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedStatus = habit.showOnSchedule === false ? true : false;
                          setHabits((prev) => {
                            const list = prev.map((h) => (h.id === habit.id ? { ...h, showOnSchedule: updatedStatus } : h));
                            localStorage.setItem('calender_daily_habits_v2', JSON.stringify(list));
                            return list;
                          });
                          window.dispatchEvent(new Event('storage'));
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '0.675rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '999px',
                          border: habit.showOnSchedule !== false ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                          backgroundColor: habit.showOnSchedule !== false ? 'var(--accent-light)' : 'transparent',
                          color: habit.showOnSchedule !== false ? 'var(--accent-primary)' : 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'all 0.12s ease',
                        }}
                        title="Toggle whether this habit appears on the Daily Schedule"
                      >
                        <CalendarIcon size={11} /> {habit.showOnSchedule !== false ? 'On Schedule' : 'Schedule Off'}
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{
                          fontSize: '0.725rem',
                          fontWeight: 800,
                          color: streak > 0 ? '#B45309' : 'var(--text-muted)',
                          backgroundColor: 'var(--bg-hover)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '999px',
                          border: '1px solid var(--border-color)',
                        }}>
                          🔥 {streak}
                        </span>

                        <button
                          type="button"
                          onClick={() => setEditingHabit(habit)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '3px',
                          }}
                          title="Edit Habit"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteHabit(habit.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '3px',
                          }}
                          title="Delete Habit"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* RENDER 2: FULL WEEK GRID VIEW */}
      {viewType === 'weekly' && (
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
          <div style={{ minWidth: '540px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(180px, 1fr) repeat(7, 42px) 40px',
              gap: '0.4rem',
              alignItems: 'center',
              padding: '0.5rem 0.75rem',
              borderBottom: '1px solid var(--border-color)',
              marginBottom: '0.75rem',
              fontSize: '0.725rem',
              fontWeight: 800,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
            }}>
              <span>Habit ({personaHabits.length})</span>
              {weekDays.map((d) => {
                const isTodayDay = isSameDay(d, new Date());
                return (
                  <div key={d.toISOString()} style={{ textAlign: 'center', color: isTodayDay ? 'var(--accent-primary)' : 'inherit' }}>
                    <div>{format(d, 'EEE')[0]}</div>
                    <div style={{ fontSize: '0.675rem', fontWeight: isTodayDay ? 900 : 600 }}>{format(d, 'd')}</div>
                  </div>
                );
              })}
              <span style={{ textAlign: 'center' }}>🔥</span>
            </div>

            {personaHabits.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <Sparkles size={28} style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>No habits added yet!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {personaHabits.map((habit) => {
                  const streak = calculateStreak(habit);
                  const isTodayDone = habit.completedDates.includes(todayStr);
                  const habitDays = habit.daysOfWeek || [1, 2, 3, 4, 5, 6, 0];

                  return (
                    <div
                      key={habit.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(180px, 1fr) repeat(7, 42px) 40px',
                        gap: '0.4rem',
                        alignItems: 'center',
                        padding: '0.65rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isTodayDone ? 'var(--bg-hover)' : 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        borderLeft: `4px solid ${habit.color}`,
                        transition: 'all 0.15s ease',
                      }}
                    >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                      <span style={{ fontSize: '1.1rem' }}>{habit.emoji}</span>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {habit.title}
                        </span>
                        {activePersonaFilter === 'all' && (
                          <span style={{
                            fontSize: '0.625rem',
                            fontWeight: 800,
                            color: habit.owner === 'Eve' ? '#1E40AF' : '#9D174D',
                          }}>
                            {habit.owner}
                          </span>
                        )}
                      </div>
                    </div>

                    {weekDays.map((d) => {
                      const dateStr = format(d, 'yyyy-MM-dd');
                      const dayNum = d.getDay();
                      const isDone = habit.completedDates.includes(dateStr);
                      const isTodayDay = isSameDay(d, new Date());
                      const isActiveDay = habitDays.includes(dayNum);

                      return (
                        <button
                          key={dateStr}
                          type="button"
                          disabled={!isActiveDay}
                          onClick={() => handleToggleHabit(habit.id, dateStr)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: isDone ? 'none' : isTodayDay ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                            backgroundColor: isDone ? habit.color : isActiveDay ? 'transparent' : 'var(--bg-hover)',
                            color: isDone ? '#FFFFFF' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto',
                            cursor: isActiveDay ? 'pointer' : 'default',
                            opacity: isActiveDay ? 1 : 0.25,
                            transition: 'all 0.12s ease',
                          }}
                          title={!isActiveDay ? 'Habit not scheduled on this day' : isDone ? `Completed on ${dateStr}` : `Mark completed for ${dateStr}`}
                        >
                          {isDone && <Check size={14} strokeWidth={3} />}
                        </button>
                      );
                    })}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                      <button
                        type="button"
                        onClick={() => setEditingHabit(habit)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                        title="Edit Habit"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteHabit(habit.id)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                        title="Delete Habit"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    )}

      {/* EDIT HABIT MODAL OVERLAY */}
      {editingHabit && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(9, 9, 11, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem',
        }} onClick={() => setEditingHabit(null)}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '420px',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.1rem',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>Edit Habit</h3>
              <button
                type="button"
                onClick={() => setEditingHabit(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="input-field"
                value={editingHabit.title}
                onChange={(e) => setEditingHabit({ ...editingHabit, title: e.target.value })}
                style={{ flex: 1 }}
                placeholder="Habit title..."
                required
              />
              <select
                className="input-field"
                value={editingHabit.owner}
                onChange={(e) => setEditingHabit({ ...editingHabit, owner: e.target.value as 'Eve' | 'Abbie' })}
                style={{ width: 'auto' }}
              >
                <option value="Eve">Eve</option>
                <option value="Abbie">Abbie</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Schedule Days:
              </label>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {WEEKDAYS.map((wd) => {
                  const active = (editingHabit.daysOfWeek || []).includes(wd.value);
                  return (
                    <button
                      key={wd.value}
                      type="button"
                      onClick={() => {
                        const days = editingHabit.daysOfWeek || [];
                        const newDays = active ? days.filter((d) => d !== wd.value) : [...days, wd.value];
                        setEditingHabit({ ...editingHabit, daysOfWeek: newDays });
                      }}
                      style={{
                        padding: '0.3rem 0.65rem',
                        borderRadius: '6px',
                        border: active ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        backgroundColor: active ? 'var(--accent-light)' : 'var(--bg-secondary)',
                        color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      {wd.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.825rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-hover)',
              border: '1px solid var(--border-subtle)',
            }}>
              <input
                type="checkbox"
                checked={editingHabit.showOnSchedule !== false}
                onChange={(e) => setEditingHabit({ ...editingHabit, showOnSchedule: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
              Show this Habit on Daily Schedule
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditingHabit(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setHabits((prev) => {
                    const list = prev.map((h) => (h.id === editingHabit.id ? editingHabit : h));
                    localStorage.setItem('calender_daily_habits_v2', JSON.stringify(list));
                    return list;
                  });
                  setEditingHabit(null);
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
