import React from 'react';
import { CATEGORY_COLORS, EventCategory } from '../types/event';

interface Props {
  selected: string;
  onSelect: (cat: string) => void;
  counts: Record<string, number>;
}

const CATS: { label: string; value: string; hex?: string }[] = [
  { label: 'All', value: 'All' },
  ...Object.entries(CATEGORY_COLORS).map(([k, v]) => ({ label: k, value: k, hex: v.hex })),
];

export const CategoryFilter: React.FC<Props> = ({ selected, onSelect, counts }) => (
  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
    {CATS.map((c) => (
      <button key={c.value} onClick={() => onSelect(c.value)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${
          selected === c.value
            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
        }`}>
        {c.hex && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.hex }} />}
        {c.label}
        <span className={`px-1.5 rounded-full text-[10px] ${selected === c.value ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-500'}`}>
          {counts[c.value] ?? 0}
        </span>
      </button>
    ))}
  </div>
);
