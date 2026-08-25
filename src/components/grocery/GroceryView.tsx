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

  const handleCopyList = () => {
    const activeItems = filteredItems.filter((i) => !i.is_completed);
    if (activeItems.length === 0) return;
    const text = activeItems.map((i) => `• ${i.name}${i.quantity ? ` (${i.quantity})` : ''}`).join('\n');
    navigator.clipboard.writeText(`🛒 Shared Grocery List:\n${text}`);
    alert('Grocery list copied to clipboard!');
  };

  const handleClearChecked = async () => {
    const checked = filteredItems.filter((i) => i.is_completed);
    if (checked.length === 0) return;
    if (window.confirm('Clear all checked items from the grocery list?')) {
      for (const item of checked) {
        await deleteGroceryItem(item.id);
      }
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto px-4 md:px-8 py-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-3.5 gap-2.5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Grocery List</h1>
          <p className="text-xs text-slate-500 font-medium">Shared store checklist synced across all devices</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyList}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200/60 transition-all cursor-pointer"
            title="Copy uncompleted list to clipboard"
          >
            📋 Copy List
          </button>
          <button
            onClick={handleClearChecked}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl border border-rose-200/80 transition-all cursor-pointer"
            title="Clear checked items"
          >
            🗑️ Clear Checked
          </button>
        </div>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleAdd} className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Add grocery item..."
            className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
          />
          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Qty"
            className="w-14 sm:w-20 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all text-center"
          />
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1 shrink-0 transition-all cursor-pointer active:scale-95 shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>

        {/* Category Selector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-0.5">Category:</span>
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <button
                type="button"
                key={cat}
                onClick={() => setCategory(cat)}
                className={`py-1 px-2.5 rounded-lg text-[11px] font-semibold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </form>

      {/* Grocery Items grouped by Category */}
      <div className="space-y-4 pt-1">
        {CATEGORIES.map((cat) => {
          const items = itemsByCategory.get(cat) || [];
          if (items.length === 0) return null;

          return (
            <div key={cat} className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {cat}
                </h2>
                <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.2 rounded-full">
                  {items.length}
                </span>
              </div>

              {/* Single Category Card Container */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden divide-y divide-slate-100">
                {items.map((item) => {
                  const ownerName = item.profile || 'Eve';
                  const badgeColor = profileColors[ownerName] || '#2563eb';

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between px-3.5 py-3 transition-colors ${
                        item.is_completed ? 'bg-slate-50/60' : 'hover:bg-slate-50/40'
                      }`}
                    >
                      <button
                        onClick={() => toggleGroceryComplete(item.id)}
                        className="flex items-center gap-3 text-left flex-1 min-w-0 cursor-pointer"
                      >
                        {item.is_completed ? (
                          <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                        <span
                          className={`text-xs sm:text-sm font-medium leading-snug truncate ${
                            item.is_completed ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {item.name}
                        </span>
                        {item.quantity && (
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                            {item.quantity}
                          </span>
                        )}
                      </button>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {activeProfile === 'Both' && (
                          <span
                            className="text-[10px] font-bold text-white px-2 py-0.5 rounded-md shadow-2xs"
                            style={{ backgroundColor: badgeColor }}
                          >
                            {ownerName}
                          </span>
                        )}
                        <button
                          onClick={() => deleteGroceryItem(item.id)}
                          className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
