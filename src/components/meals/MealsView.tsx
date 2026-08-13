import React, { useState, useEffect } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { Utensils, Edit2, Check, RefreshCw, Sun, Sunset, Coffee, Trash2, Plus, X } from 'lucide-react';
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

  const removeMealSlot = (day: string, slot: keyof MealSlot) => {
    setMeals((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: '',
      },
    }));
    if (editingSlot?.day === day && editingSlot?.slot === slot) {
      setEditingSlot(null);
    }
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
      maxWidth: '100%',
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
            margin: 0,
          }}>
            Meal Prep & Planner <Utensils size={20} color="#EC4899" />
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}>
            {activePersonaFilter === 'all' ? 'Weekly meals for Eve & Abbie • Refreshes weekly' : `Meals for ${activePersonaFilter} • Refreshes weekly`}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
            <RefreshCw size={12} /> Reset Week
          </button>
        </div>
      </div>

      {/* Day Selector Pills - Full Width Row */}
      <div style={{
        display: 'flex',
        gap: '0.4rem',
        marginBottom: '1.25rem',
        overflowX: 'auto',
        backgroundColor: 'var(--bg-hover)',
        padding: '5px',
        borderRadius: '999px',
        border: '1px solid var(--border-color)',
        width: '100%',
        boxSizing: 'border-box',
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
                padding: '0.5rem 0',
                minWidth: '44px',
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

      {/* Meal Cards Grid - Fluidly adjusts 1 column on mobile, 2 columns on larger screens */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
        width: '100%',
      }}>
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {val && !isEditingThis && (
                        <button
                          type="button"
                          onClick={() => removeMealSlot(selectedDay, conf.key)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#EF4444',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            fontSize: '0.725rem',
                            fontWeight: 700,
                          }}
                          title={`Remove ${conf.label}`}
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      )}

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
                          <Edit2 size={13} /> {val ? 'Edit' : 'Add'}
                        </button>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          {val && (
                            <button
                              type="button"
                              onClick={() => removeMealSlot(selectedDay, conf.key)}
                              style={{
                                padding: '0.2rem 0.5rem',
                                borderRadius: '6px',
                                border: '1px solid #EF4444',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: '#EF4444',
                                fontSize: '0.725rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Clear
                            </button>
                          )}
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
                        </div>
                      )}
                    </div>
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
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                      title="Click to edit meal"
                    >
                      {val ? (
                        val
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-muted)' }}>
                          <Plus size={14} color="#EC4899" /> No {conf.label.toLowerCase()} planned (Tap to add)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
    </div>
  );
};


