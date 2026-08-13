import React, { useState, useEffect } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { Utensils, Edit2, Check, RefreshCw, Sun, Sunset, Moon, Coffee, Grid, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfWeek } from 'date-fns';

interface MealSlot {
  breakfast: string;
  lunch: string;
  dinner: string;
  snack?: string;
}

type WeekMeals = Record<string, MealSlot>; // "Mon", "Tue", etc.

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DEFAULT_MEALS: WeekMeals = {
  Mon: { breakfast: 'Avocado Toast & Espresso', lunch: 'Quinoa Grain Bowl', dinner: 'Grilled Salmon & Asparagus', snack: 'Mixed Nuts & Apple' },
  Tue: { breakfast: 'Greek Yogurt & Berries', lunch: 'Chicken Caesar Wrap', dinner: 'Pasta Primavera', snack: 'Hummus & Carrots' },
  Wed: { breakfast: 'Oatmeal & Almonds', lunch: 'Turkey Sandwich', dinner: 'Tofu & Veggie Stir-fry', snack: 'Dark Chocolate' },
  Thu: { breakfast: 'Smoothie Bowl', lunch: 'Mediterranean Salad', dinner: 'Chicken Tacos', snack: 'Rice Cakes & Peanut Butter' },
  Fri: { breakfast: 'Eggs & Spinach Toast', lunch: 'Poke Bowl', dinner: 'Homemade Pizza', snack: 'Popcorn & Green Tea' },
  Sat: { breakfast: 'Pancakes & Fresh Fruit', lunch: 'Veggie Burger', dinner: 'Sushi Night', snack: 'Fruit Smoothie' },
  Sun: { breakfast: 'Brunch Scramble', lunch: 'Minestrone Soup', dinner: 'Roast Chicken & Vegetables', snack: 'Yogurt Parfait' },
};

export const MealsView: React.FC = () => {
  const { activePersonaFilter } = useCalendar();
  const todayDayName = DAYS[(new Date().getDay() + 6) % 7]; // Convert Sun=0 -> Mon=0
  const [selectedDay, setSelectedDay] = useState(todayDayName);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  const currentWeekStartStr = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  const [meals, setMeals] = useState<WeekMeals>(() => {
    try {
      const lastWeek = localStorage.getItem('calender_meals_last_week');
      const saved = localStorage.getItem('calender_meal_plan_v2');
      if (saved && lastWeek === currentWeekStartStr) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed parsing meal plan', e);
    }
    return DEFAULT_MEALS;
  });

  const [editingSlot, setEditingSlot] = useState<{ day: string; slot: keyof MealSlot } | null>(null);
  const [editValue, setEditValue] = useState('');

  // Weekly Refresh Check: Automatically refresh meal plan check/reset when a new week starts
  useEffect(() => {
    try {
      const lastWeek = localStorage.getItem('calender_meals_last_week');
      if (lastWeek !== currentWeekStartStr) {
        localStorage.setItem('calender_meals_last_week', currentWeekStartStr);
        localStorage.setItem('calender_meal_plan_v2', JSON.stringify(DEFAULT_MEALS));
        setMeals(DEFAULT_MEALS);
      }
    } catch {
      // LocalStorage catch
    }
  }, [currentWeekStartStr]);

  useEffect(() => {
    localStorage.setItem('calender_meal_plan_v2', JSON.stringify(meals));
    window.dispatchEvent(new Event('storage'));
  }, [meals]);

  const startEdit = (day: string, slot: keyof MealSlot) => {
    setEditingSlot({ day, slot });
    setEditValue(meals[day]?.[slot] || '');
  };

  const saveEdit = () => {
    if (!editingSlot) return;
    setMeals((prev) => ({
      ...prev,
      [editingSlot.day]: {
        ...prev[editingSlot.day],
        [editingSlot.slot]: editValue.trim(),
      },
    }));
    setEditingSlot(null);
  };

  const handleResetMeals = () => {
    if (window.confirm('Reset this week’s meal plan back to default template?')) {
      setMeals(DEFAULT_MEALS);
    }
  };

  const currentMealSlot = meals[selectedDay] || { breakfast: '', lunch: '', dinner: '', snack: '' };

  const SLOT_CONFIG: { key: keyof MealSlot; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
    { key: 'breakfast', label: 'Breakfast', icon: <Sun size={16} color="#F59E0B" />, color: '#B45309', bg: '#FEF3C7' },
    { key: 'lunch', label: 'Lunch', icon: <Utensils size={16} color="#10B981" />, color: '#047857', bg: '#D1FAE5' },
    { key: 'dinner', label: 'Dinner', icon: <Sunset size={16} color="#EC4899" />, color: '#BE185D', bg: '#FCE7F3' },
    { key: 'snack', label: 'Snack / Drink', icon: <Coffee size={16} color="#8B5CF6" />, color: '#6D28D9', bg: '#EDE9FE' },
  ];

  return (
    <div style={{
      maxWidth: '750px',
      margin: '0 auto',
      paddingBottom: '5rem',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Header & Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem',
        paddingBottom: '0.85rem',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div>
          <h2 style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}>
            Meal Prep & Planner <Utensils size={20} color="#EC4899" />
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {activePersonaFilter === 'all' ? 'Weekly meals for Eve & Abbie • Refreshes weekly' : `Meals for ${activePersonaFilter} • Refreshes weekly`}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Daily vs Weekly Toggle */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-hover)',
            padding: '2px',
            borderRadius: '999px',
            border: '1px solid var(--border-color)',
          }}>
            <button
              type="button"
              onClick={() => setViewMode('daily')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: viewMode === 'daily' ? 'var(--bg-secondary)' : 'transparent',
                color: viewMode === 'daily' ? '#EC4899' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: '0.775rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Day Detail
            </button>

            <button
              type="button"
              onClick={() => setViewMode('weekly')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: viewMode === 'weekly' ? 'var(--bg-secondary)' : 'transparent',
                color: viewMode === 'weekly' ? '#EC4899' : 'var(--text-secondary)',
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
            onClick={handleResetMeals}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '999px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}
            title="Reset meals for new week"
          >
            <RefreshCw size={12} /> Reset
          </button>
        </div>
      </div>

      {/* RENDER 1: DAILY DETAIL VIEW */}
      {viewMode === 'daily' && (
        <div>
          {/* Day Selector Pills */}
          <div style={{
            display: 'flex',
            gap: '0.4rem',
            marginBottom: '1.25rem',
            overflowX: 'auto',
            backgroundColor: 'var(--bg-hover)',
            padding: '5px',
            borderRadius: '999px',
            border: '1px solid var(--border-color)',
          }}>
            {DAYS.map((d) => {
              const isSelected = selectedDay === d;
              const isTodayDay = d === todayDayName;

              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setSelectedDay(d);
                    setEditingSlot(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.45rem 0',
                    minWidth: '42px',
                    borderRadius: '999px',
                    border: 'none',
                    backgroundColor: isSelected ? 'var(--bg-secondary)' : 'transparent',
                    color: isSelected ? '#EC4899' : isTodayDay ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: 800,
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {d} {isTodayDay && '•'}
                </button>
              );
            })}
          </div>

          {/* Meal Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {SLOT_CONFIG.map((conf) => {
              const val = currentMealSlot[conf.key];
              const isEditingThis = editingSlot?.day === selectedDay && editingSlot?.slot === conf.key;

              return (
                <div
                  key={conf.key}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    borderLeft: `4px solid ${conf.color}`,
                    padding: '1rem 1.1rem',
                    boxShadow: 'var(--shadow-subtle)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        backgroundColor: conf.bg,
                      }}>
                        {conf.icon}
                      </span>
                      <span style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {conf.label}
                      </span>
                    </div>

                    {!isEditingThis ? (
                      <button
                        type="button"
                        onClick={() => startEdit(selectedDay, conf.key)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '0.725rem',
                          fontWeight: 700,
                        }}
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={saveEdit}
                        style={{
                          padding: '0.2rem 0.65rem',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: '#EC4899',
                          color: '#FFFFFF',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <Check size={13} /> Save
                      </button>
                    )}
                  </div>

                  {isEditingThis ? (
                    <form onSubmit={(e) => { e.preventDefault(); saveEdit(); }}>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder={`Enter ${conf.label.toLowerCase()} menu...`}
                        autoFocus
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.85rem',
                          borderRadius: '8px',
                          border: '1.5px solid #EC4899',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          outline: 'none',
                        }}
                      />
                    </form>
                  ) : (
                    <div
                      onClick={() => startEdit(selectedDay, conf.key)}
                      style={{
                        fontSize: '0.925rem',
                        fontWeight: 700,
                        color: val ? 'var(--text-primary)' : 'var(--text-muted)',
                        fontStyle: val ? 'normal' : 'italic',
                        cursor: 'pointer',
                        padding: '0.2rem 0',
                      }}
                      title="Click to edit meal"
                    >
                      {val || `Tap to add ${conf.label.toLowerCase()}...`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RENDER 2: FULL WEEK GRID VIEW */}
      {viewMode === 'weekly' && (
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            minWidth: '600px',
          }}>
            {DAYS.map((dayName) => {
              const dayMeals = meals[dayName] || { breakfast: '', lunch: '', dinner: '', snack: '' };
              const isTodayDay = dayName === todayDayName;

              return (
                <div
                  key={dayName}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: isTodayDay ? '2px solid #EC4899' : '1px solid var(--border-color)',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    boxShadow: 'var(--shadow-subtle)',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--border-subtle)',
                    paddingBottom: '0.35rem',
                  }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: isTodayDay ? '#EC4899' : 'var(--text-primary)' }}>
                      {dayName} {isTodayDay && '(Today)'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDay(dayName);
                        setViewMode('daily');
                      }}
                      style={{
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        color: 'var(--accent-primary)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Edit Day →
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {SLOT_CONFIG.slice(0, 3).map((conf) => {
                      const mVal = dayMeals[conf.key];
                      return (
                        <div
                          key={conf.key}
                          onClick={() => {
                            setSelectedDay(dayName);
                            setViewMode('daily');
                            startEdit(dayName, conf.key);
                          }}
                          style={{
                            backgroundColor: 'var(--bg-primary)',
                            padding: '0.55rem 0.65rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ fontSize: '0.675rem', fontWeight: 800, color: conf.color, textTransform: 'uppercase' }}>
                            {conf.label}
                          </div>
                          <div style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: mVal ? 'var(--text-primary)' : 'var(--text-muted)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            marginTop: '2px',
                          }}>
                            {mVal || 'Empty'}
                          </div>
                        </div>
                      );
                    })}
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

