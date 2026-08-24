import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { MealItem, MealType } from '../../types';
import { Plus, Trash2, Copy, ShoppingBag } from 'lucide-react';

interface MealsViewProps {
  onOpenAddMealModal: (dayOfWeek?: number, mealType?: MealType) => void;
}

const DAYS = [
  { num: 1, name: 'Monday' },
  { num: 2, name: 'Tuesday' },
  { num: 3, name: 'Wednesday' },
  { num: 4, name: 'Thursday' },
  { num: 5, name: 'Friday' },
  { num: 6, name: 'Saturday' },
  { num: 7, name: 'Sunday' },
];

const MEAL_TYPES: { type: MealType; label: string; emoji: string }[] = [
  { type: 'breakfast', label: 'Breakfast', emoji: '🍳' },
  { type: 'lunch', label: 'Lunch', emoji: '🥗' },
  { type: 'dinner', label: 'Dinner', emoji: '🍲' },
  { type: 'snack', label: 'Snacks', emoji: '🍏' },
];

export const MealsView: React.FC<MealsViewProps> = ({ onOpenAddMealModal }) => {
  const { mealItems, addMealItem, deleteMealItem, addGroceryItem, filterByProfile, activeProfile, profileColors } = useStore();
  const [selectedMobileDay, setSelectedMobileDay] = useState<number>(1); // 1 = Mon

  const handleDuplicateToNextDay = async (meal: MealItem) => {
    const nextDay = meal.day_of_week === 7 ? 1 : meal.day_of_week + 1;
    let nextDate: string | undefined = undefined;
    if (meal.meal_date) {
      const parts = meal.meal_date.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        d.setDate(d.getDate() + 1);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        nextDate = `${yyyy}-${mm}-${dd}`;
      }
    }
    await addMealItem({
      title: meal.title,
      meal_type: meal.meal_type,
      day_of_week: nextDay,
      meal_date: nextDate,
      notes: meal.notes,
      profile: meal.profile,
    });
    alert(`Duplicated "${meal.title}" to ${DAYS.find((d) => d.num === nextDay)?.name}!`);
  };

  const handleSendToGrocery = async (meal: MealItem) => {
    await addGroceryItem({
      name: meal.title,
      category: 'Pantry',
      is_completed: false,
      profile: meal.profile,
    });
    alert(`Added "${meal.title}" to your Grocery List!`);
  };

  const filteredMeals = useMemo(() => {
    return filterByProfile(mealItems);
  }, [mealItems, filterByProfile]);

  // Group meals by day & type
  const mealsByDay = useMemo(() => {
    const map = new Map<number, Map<MealType, MealItem[]>>();
    for (let d = 1; d <= 7; d++) {
      const typeMap = new Map<MealType, MealItem[]>();
      MEAL_TYPES.forEach((m) => typeMap.set(m.type, []));
      map.set(d, typeMap);
    }

    filteredMeals.forEach((meal) => {
      const dayMap = map.get(meal.day_of_week);
      if (dayMap && dayMap.has(meal.meal_type)) {
        dayMap.get(meal.meal_type)!.push(meal);
      }
    });

    return map;
  }, [filteredMeals]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Meal Planner</h1>
          <p className="text-xs text-slate-500 font-medium">Weekly meals schedule (Breakfast, Lunch, Dinner, Snacks)</p>
        </div>
        <button
          onClick={() => onOpenAddMealModal()}
          className="p-2 sm:px-4 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
          title="Add Meal"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Add Meal</span>
        </button>
      </div>

      {/* MOBILE LAYOUT: Day Selector Tabs + Daily Meal List */}
      <div className="lg:hidden space-y-5">
        {/* Horizontal Day Picker */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {DAYS.map((day) => {
            const isSelected = selectedMobileDay === day.num;
            return (
              <button
                key={day.num}
                onClick={() => setSelectedMobileDay(day.num)}
                className={`py-2 px-4 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {day.name.slice(0, 3)}
              </button>
            );
          })}
        </div>

        {/* Selected Day Meals List */}
        <div className="space-y-4">
          {MEAL_TYPES.map((mType) => {
            const list = mealsByDay.get(selectedMobileDay)?.get(mType.type) || [];

            return (
              <div key={mType.type} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{mType.emoji}</span>
                    <h3 className="text-sm font-bold text-slate-900">{mType.label}</h3>
                  </div>
                  <button
                    onClick={() => onOpenAddMealModal(selectedMobileDay, mType.type)}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    + Add
                  </button>
                </div>

                {list.length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium italic">No meal planned</p>
                ) : (
                  <div className="space-y-2">
                    {list.map((item) => {
                      const ownerName = item.profile || 'Eve';
                      const badgeColor = profileColors[ownerName] || '#2563eb';

                      return (
                        <div key={item.id} className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-slate-50">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-slate-900">{item.title}</p>
                              {activeProfile === 'Both' && (
                                <span
                                  className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded-md"
                                  style={{ backgroundColor: badgeColor }}
                                >
                                  {ownerName}
                                </span>
                              )}
                            </div>
                            {item.notes && <p className="text-[11px] text-slate-500 mt-0.5">{item.notes}</p>}
                          </div>
                          <button
                            onClick={() => deleteMealItem(item.id)}
                            className="text-slate-300 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* DESKTOP LAYOUT: Weekly Meal Grid (7 cols) */}
      <div className="hidden lg:grid grid-cols-7 gap-3">
        {DAYS.map((day) => {
          const dayMap = mealsByDay.get(day.num);

          return (
            <div key={day.num} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col min-h-[420px]">
              <div className="bg-slate-50 border-b border-slate-200/80 p-3 text-center">
                <span className="text-xs font-bold text-slate-900">{day.name}</span>
              </div>

              <div className="p-2 space-y-3 flex-1 overflow-y-auto">
                {MEAL_TYPES.map((mType) => {
                  const items = dayMap?.get(mType.type) || [];

                  return (
                    <div key={mType.type} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                        <span>{mType.emoji} {mType.label}</span>
                        <button
                          onClick={() => onOpenAddMealModal(day.num, mType.type)}
                          className="hover:text-blue-600"
                        >
                          +
                        </button>
                      </div>

                      {items.map((item) => {
                        const ownerName = item.profile || 'Eve';
                        const badgeColor = profileColors[ownerName] || '#2563eb';

                        return (
                          <div key={item.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800 flex justify-between items-start group">
                            <div>
                              <span>{item.title}</span>
                              {activeProfile === 'Both' && (
                                <span
                                  className="text-[9px] font-bold text-white px-1.5 py-0.2 rounded-xs ml-1 block mt-0.5"
                                  style={{ backgroundColor: badgeColor }}
                                >
                                  {ownerName}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleSendToGrocery(item)}
                                className="text-slate-400 hover:text-emerald-600"
                                title="Add to Grocery List"
                              >
                                <ShoppingBag className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDuplicateToNextDay(item)}
                                className="text-slate-400 hover:text-blue-600"
                                title="Duplicate to next day"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => deleteMealItem(item.id)}
                                className="text-slate-300 hover:text-red-500"
                                title="Delete meal"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
