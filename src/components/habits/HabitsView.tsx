import React, { useState, useEffect } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Plus, Flame, Check, Sparkles, Trash2, User, Calendar as CalendarIcon, Circle } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface HabitItem {
  id: string;
  title: string;
  emoji: string;
  color: string;
  owner: 'Eve' | 'Abbie';
  daysOfWeek: number[]; // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 0=Sun
  created_at: string;
  completedDates: string[]; // Array of "YYYY-MM-DD" date strings
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
    completedDates: [format(new Date(), 'yyyy-MM-dd')],
  },
  {
    id: 'habit-2',
    title: 'Drink 2L Water',
    emoji: '💧',
    color: '#06B6D4',
    owner: 'Eve',
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
    created_at: new Date().toISOString(),
    completedDates: [format(new Date(), 'yyyy-MM-dd')],
  },
  {
    id: 'habit-3',
    title: 'Calculus & Physics Prep',
    emoji: '📖',
    color: '#EC4899',
    owner: 'Abbie',
    daysOfWeek: [2, 4],
    created_at: new Date().toISOString(),
    completedDates: [format(new Date(), 'yyyy-MM-dd')],
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
  const { activePersonaFilter } = useCalendar();

  const [habits, setHabits] = useState<HabitItem[]>(() => {
    try {
      const stored = localStorage.getItem('calender_daily_habits_v2');
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
    return DEFAULT_HABITS;
  });

  // Mode: Daily List vs Full Week Grid
  const [viewType, setViewType] = useState<'daily' | 'weekly'>('daily');

  const todayDayNum = new Date().getDay(); // 0=Sun, 1=Mon...
  const [selectedDayVal, setSelectedDayVal] = useState<number>(todayDayNum);

  const [newTitle, setNewTitle] = useState('');
  const [newEmoji, setNewEmoji] = useState('🏋️');
  const [newColor, setNewColor] = useState('#3B82F6');
  const [newOwner, setNewOwner] = useState<'Eve' | 'Abbie'>('Eve');
  const [newSelectedDays, setNewSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    localStorage.setItem('calender_daily_habits_v2', JSON.stringify(habits));
  }, [habits]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');

  // Automatic Weekly Refresh: prune completed dates older than 14 days to keep checkmarks fresh every week while maintaining streaks
  useEffect(() => {
    try {
      const lastRefreshedWeek = localStorage.getItem('calender_habits_last_week');
      if (lastRefreshedWeek !== weekStartStr) {
        localStorage.setItem('calender_habits_last_week', weekStartStr);
        setHabits((prev) =>
          prev.map((h) => ({
            ...h,
            // Keep only completed dates from the last 14 days for streak calculation
            completedDates: h.completedDates.filter((d) => {
              const diffDays = (new Date(todayStr).getTime() - new Date(d).getTime()) / (1000 * 3600 * 24);
              return diffDays <= 14;
            }),
          }))
        );
      }
    } catch {
      // LocalStorage error catch
    }
  }, [weekStartStr, todayStr]);

  // Get active day date string
  const activeDayDateObj = weekDays.find((d) => d.getDay() === selectedDayVal) || new Date();
  const activeDayDateStr = format(activeDayDateObj, 'yyyy-MM-dd');
  const activeDayLabel = WEEKDAYS.find((w) => w.value === selectedDayVal)?.full || 'Today';

  // Filter habits by persona
  const personaHabits = habits.filter((h) => {
    if (activePersonaFilter === 'all') return true;
    return h.owner === activePersonaFilter;
  });

  // Filter for single day view
  const singleDayHabits = personaHabits.filter((h) => {
    const days = h.daysOfWeek || [1, 2, 3, 4, 5, 6, 0];
    return days.includes(selectedDayVal);
  });

  const handleToggleHabit = (habitId: string, dateStr: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const isDone = h.completedDates.includes(dateStr);
        const newDates = isDone
          ? h.completedDates.filter((d) => d !== dateStr)
          : [...h.completedDates, dateStr];

        if (!isDone && dateStr === todayStr) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: [h.color, '#3B82F6', '#EC4899', '#10B981'],
          });
        }

        return { ...h, completedDates: newDates };
      })
    );
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
    setNewTitle('');
    setShowAddForm(false);
  };

  const handleDeleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
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
      padding: '1.75rem',
      width: '100%',
      maxWidth: '820px',
      margin: '0 auto',
      boxShadow: 'var(--shadow-subtle)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Top Header & Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}>
            Daily Habits <Flame size={20} color="#F59E0B" />
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {activePersonaFilter === 'all' ? 'Habits for Eve & Abbie' : `Habits for ${activePersonaFilter}`}
          </p>
        </div>

        {/* View Switcher: Daily vs Weekly Grid */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
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
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: viewType === 'daily' ? 'var(--bg-secondary)' : 'transparent',
                color: viewType === 'daily' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: '0.775rem',
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
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: viewType === 'weekly' ? 'var(--bg-secondary)' : 'transparent',
                color: viewType === 'weekly' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: '0.775rem',
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
            style={{ padding: '0.5rem 0.85rem', fontSize: '0.825rem' }}
          >
            <Plus size={15} /> Add Habit
          </button>
        </div>
      </div>

      {/* Day Selector (for Daily View) */}
      {viewType === 'daily' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          marginBottom: '1.5rem',
          backgroundColor: 'var(--bg-hover)',
          padding: '4px',
          borderRadius: '999px',
          border: '1px solid var(--border-color)',
          overflowX: 'auto',
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
                  flex: 1,
                  padding: '0.45rem 0.75rem',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: isSelected ? (isTodayWd ? 'var(--accent-primary)' : 'var(--bg-secondary)') : 'transparent',
                  color: isSelected ? (isTodayWd ? '#FFFFFF' : 'var(--accent-primary)') : (isTodayWd ? 'var(--accent-primary)' : 'var(--text-secondary)'),
                  fontWeight: 800,
                  fontSize: '0.8rem',
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

              {/* Custom Color Wheel / Input */}
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  backgroundColor: 'transparent',
                }}
                title="Choose any custom color"
              />

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
              {activeDayLabel}'s Habits ({singleDayHabits.length})
            </h3>
          </div>

          {singleDayHabits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <Sparkles size={24} style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>No habits scheduled for {activeDayLabel}!</p>
              <p style={{ fontSize: '0.8rem', marginTop: '3px' }}>Click "Add Habit" to customize your day!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {singleDayHabits.map((habit) => {
                const isDone = habit.completedDates.includes(activeDayDateStr);
                const streak = calculateStreak(habit);

                return (
                  <div
                    key={habit.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.85rem',
                      padding: '0.8rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isDone ? 'var(--bg-hover)' : 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      borderLeft: `4px solid ${habit.color}`,
                      opacity: isDone ? 0.75 : 1,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
                      <button
                        type="button"
                        onClick={() => handleToggleHabit(habit.id, activeDayDateStr)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isDone ? (
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: habit.color,
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 2px 6px ${habit.color}40`,
                          }}>
                            <Check size={15} strokeWidth={3} />
                          </div>
                        ) : (
                          <Circle size={24} strokeWidth={1.8} color="var(--text-muted)" />
                        )}
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1.1rem' }}>{habit.emoji}</span>
                        <span style={{
                          fontSize: '0.925rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          textDecoration: isDone ? 'line-through' : 'none',
                        }}>
                          {habit.title}
                        </span>

                        {activePersonaFilter === 'all' && (
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            padding: '0.1rem 0.45rem',
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: streak > 0 ? '#B45309' : 'var(--text-muted)',
                        backgroundColor: 'var(--bg-hover)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '999px',
                        border: '1px solid var(--border-color)',
                      }}>
                        🔥 {streak}
                      </span>

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
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* RENDER 2: FULL WEEK GRID VIEW */}
      {viewType === 'weekly' && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(200px, 1fr) repeat(7, 44px) 40px',
            gap: '0.5rem',
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
                      gridTemplateColumns: 'minmax(200px, 1fr) repeat(7, 44px) 40px',
                      gap: '0.5rem',
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
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: streak > 0 ? '#B45309' : 'var(--text-muted)' }}>
                        {streak}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteHabit(habit.id)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
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
      )}
    </div>
  );
};
