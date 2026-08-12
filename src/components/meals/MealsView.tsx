import React, { useState, useEffect } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { Utensils, Edit2, Check, Plus } from 'lucide-react';

interface MealSlot {
  breakfast: string;
  lunch: string;
  dinner: string;
}

type WeekMeals = Record<string, MealSlot>; // e.g. "Mon" -> { breakfast, lunch, dinner }

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DEFAULT_MEALS: WeekMeals = {
  Mon: { breakfast: 'Avocado Toast & Espresso', lunch: 'Quinoa Grain Bowl', dinner: 'Grilled Salmon & Asparagus' },
  Tue: { breakfast: 'Greek Yogurt & Berries', lunch: 'Chicken Caesar Wrap', dinner: 'Pasta Primavera' },
  Wed: { breakfast: 'Oatmeal & Almonds', lunch: 'Turkey Sandwich', dinner: 'Tofu Stir-fry' },
  Thu: { breakfast: 'Smoothie Bowl', lunch: 'Mediterranean Salad', dinner: 'Chicken Tacos' },
  Fri: { breakfast: 'Eggs & Spinach', lunch: 'Poke Bowl', dinner: 'Homemade Pizza' },
  Sat: { breakfast: 'Pancakes & Fruit', lunch: 'Veggie Burger', dinner: 'Sushi Night' },
  Sun: { breakfast: 'Brunch Scramble', lunch: 'Minestrone Soup', dinner: 'Roast Chicken' },
};

export const MealsView: React.FC = () => {
  const { activePersonaFilter } = useCalendar();
  const [selectedDay, setSelectedDay] = useState('Mon');

  const [meals, setMeals] = useState<WeekMeals>(() => {
    const saved = localStorage.getItem('calender_meal_plan_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed parsing meal plan', e);
      }
    }
    return DEFAULT_MEALS;
  });

  const [editingSlot, setEditingSlot] = useState<'breakfast' | 'lunch' | 'dinner' | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    localStorage.setItem('calender_meal_plan_v1', JSON.stringify(meals));
    window.dispatchEvent(new Event('storage'));
  }, [meals]);

  const currentMealSlot = meals[selectedDay] || { breakfast: '', lunch: '', dinner: '' };

  const startEdit = (slot: 'breakfast' | 'lunch' | 'dinner') => {
    setEditingSlot(slot);
    setEditValue(currentMealSlot[slot] || '');
  };

  const saveEdit = () => {
    if (!editingSlot) return;
    setMeals((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        [editingSlot]: editValue.trim(),
      },
    }));
    setEditingSlot(null);
  };

  return (
    <div style={{
      maxWidth: '650px',
      margin: '0 auto',
      paddingBottom: '5rem',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{
          fontSize: '1.35rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}>
          Meal Planner <Utensils size={20} color="#EC4899" />
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          {activePersonaFilter === 'all' ? 'Weekly meal menu for Eve & Abbie' : `Meal menu for ${activePersonaFilter}`}
        </p>
      </div>

      {/* Horizontal Day Selector */}
      <div style={{
        display: 'flex',
        gap: '0.4rem',
        marginBottom: '1.5rem',
        overflowX: 'auto',
        backgroundColor: 'var(--bg-hover)',
        padding: '5px',
        borderRadius: '999px',
        border: '1px solid var(--border-color)',
      }}>
        {DAYS.map((d) => {
          const isSelected = selectedDay === d;
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
                color: isSelected ? '#EC4899' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: '0.825rem',
                cursor: 'pointer',
                boxShadow: isSelected ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {d}
            </button>
          );
        })}
      </div>

      {/* Meal Slot Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {(['breakfast', 'lunch', 'dinner'] as const).map((slotKey) => {
          const label = slotKey.charAt(0).toUpperCase() + slotKey.slice(1);
          const val = currentMealSlot[slotKey];
          const isEditingThis = editingSlot === slotKey;

          return (
            <div
              key={slotKey}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                padding: '1.1rem',
                boxShadow: 'var(--shadow-subtle)',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.65rem',
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#EC4899', letterSpacing: '0.04em' }}>
                  {label}
                </span>

                {!isEditingThis ? (
                  <button
                    type="button"
                    onClick={() => startEdit(slotKey)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                  >
                    <Edit2 size={15} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={saveEdit}
                    style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '8px',
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
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={`Enter ${label.toLowerCase()} menu...`}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid #EC4899',
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              ) : (
                <div style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: val ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontStyle: val ? 'normal' : 'italic',
                }}>
                  {val || `No ${label.toLowerCase()} planned`}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
