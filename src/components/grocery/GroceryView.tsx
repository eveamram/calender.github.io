import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { GroceryCategory, GroceryItem } from '../../types';
import { CheckSquare, Square, Plus, Trash2, ShoppingBag } from 'lucide-react';

const CATEGORIES: GroceryCategory[] = ['Produce', 'Dairy', 'Bakery', 'Pantry', 'Household', 'Other'];

export const GroceryView: React.FC = () => {
  const { groceryItems, addGroceryItem, toggleGroceryComplete, deleteGroceryItem, filterByProfile, activeProfile, profileColors } =
    useStore();

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState<GroceryCategory>('Produce');

  const filteredItems = useMemo(() => {
    return filterByProfile(groceryItems);
  }, [groceryItems, filterByProfile]);

  const itemsByCategory = useMemo(() => {
    const map = new Map<GroceryCategory, GroceryItem[]>();
    CATEGORIES.forEach((cat) => map.set(cat, []));

    filteredItems.forEach((item) => {
      if (map.has(item.category)) {
        map.get(item.category)!.push(item);
      } else {
        map.get('Other')!.push(item);
      }
    });

    return map;
  }, [filteredItems]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addGroceryItem({
      name: name.trim(),
      quantity: quantity.trim() || undefined,
      category,
      is_completed: false,
      profile: activeProfile === 'Both' ? 'Eve' : activeProfile,
    });

    setName('');
    setQuantity('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 md:px-8 py-6">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Grocery List</h1>
          <p className="text-xs text-slate-500 font-medium">Shared store checklist synced across all devices</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Item name (e.g. Milk, Bananas)"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Qty (optional)"
            className="w-full sm:w-32 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as GroceryCategory)}
            className="w-full sm:w-36 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 shrink-0 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </form>

      <div className="space-y-6">
        {CATEGORIES.map((cat) => {
          const items = itemsByCategory.get(cat) || [];
          if (items.length === 0) return null;

          return (
            <div key={cat} className="space-y-2.5">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                {cat} ({items.length})
              </h2>

              <div className="space-y-2">
                {items.map((item) => {
                  const ownerName = item.profile || 'Eve';
                  const badgeColor = profileColors[ownerName] || '#2563eb';

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        item.is_completed
                          ? 'bg-slate-50/50 border-slate-100 opacity-60'
                          : 'bg-white border-slate-200/80 shadow-xs'
                      }`}
                    >
                      <button
                        onClick={() => toggleGroceryComplete(item.id)}
                        className="flex items-center gap-3 text-left flex-1 min-w-0 touch-target"
                      >
                        {item.is_completed ? (
                          <CheckSquare className="w-5 h-5 text-emerald-500 shrink-0" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300 shrink-0" />
                        )}
                        <span
                          className={`text-sm font-semibold text-slate-900 truncate ${
                            item.is_completed ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {item.name}
                        </span>
                        {item.quantity && (
                          <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                            {item.quantity}
                          </span>
                        )}
                      </button>

                      <div className="flex items-center gap-2">
                        {activeProfile === 'Both' && (
                          <span
                            className="text-[10px] font-bold text-white px-2 py-0.5 rounded-md"
                            style={{ backgroundColor: badgeColor }}
                          >
                            {ownerName}
                          </span>
                        )}
                        <button
                          onClick={() => deleteGroceryItem(item.id)}
                          className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="bg-white rounded-2xl p-10 border border-slate-200/80 text-center space-y-2">
            <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
            <p className="text-sm font-medium text-slate-500">Your grocery list is empty</p>
          </div>
        )}
      </div>
    </div>
  );
};
