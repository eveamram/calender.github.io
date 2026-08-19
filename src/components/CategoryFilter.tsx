import React from 'react';
import { EventCategory, CATEGORY_COLORS } from '../types/event';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCounts: Record<string, number>;
}

const CATEGORIES: { label: string; value: string; colorHex?: string }[] = [
  { label: 'All Categories', value: 'All' },
  { label: 'Work', value: 'Work', colorHex: CATEGORY_COLORS.Work.hex },
  { label: 'Personal', value: 'Personal', colorHex: CATEGORY_COLORS.Personal.hex },
  { label: 'Meeting', value: 'Meeting', colorHex: CATEGORY_COLORS.Meeting.hex },
  { label: 'Other', value: 'Other', colorHex: CATEGORY_COLORS.Other.hex },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2 hidden sm:inline">
        Filter:
      </span>
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.value;
        const count = categoryCounts[cat.value] || 0;

        return (
          <button
            key={cat.value}
            type="button"
            onClick={() => onSelectCategory(cat.value)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
              isSelected
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {cat.colorHex && (
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: cat.colorHex }}
              />
            )}
            {cat.label}
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isSelected ? 'bg-slate-700 text-slate-100' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
