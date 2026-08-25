import React from 'react';
import { ChevronRight, Check, X, Calendar, Clock, Target, Tag, BookOpen, Layers, User, AlertCircle } from 'lucide-react';

// Helper to format YYYY-MM-DD date into "Aug 24, 2026"
export const formatDateDisplay = (dateStr: string): string => {
  if (!dateStr) return 'Select Date';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;
  const d = new Date(year, month, day);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Helper to format HH:mm into "9:00 AM"
export const formatTimeDisplay = (timeStr: string): string => {
  if (!timeStr) return 'Select Time';
  const trimmed = timeStr.trim();
  if (trimmed.toUpperCase().includes('AM') || trimmed.toUpperCase().includes('PM')) {
    return trimmed;
  }
  const parts = trimmed.split(':');
  if (parts.length < 2) return trimmed;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return trimmed;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${ampm}`;
};

// 1. MOBILE FORM SHEET CONTAINER
interface MobileFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isRedHeader?: boolean;
  children: React.ReactNode;
}

export const MobileFormSheet: React.FC<MobileFormSheetProps> = ({
  isOpen,
  onClose,
  title,
  isRedHeader,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/20 sm:bg-slate-900/10 sm:backdrop-blur-none backdrop-blur-xs animate-fade-in overflow-y-auto">
      {/* Backdrop overlay click handler */}
      <div className="fixed inset-0 cursor-pointer" onClick={onClose} />

      {/* Floating Centered Narrow Sheet */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-white rounded-[32px] shadow-2xl border animate-slide-up flex flex-col z-10 overflow-hidden w-[calc(100%-40px)] sm:w-[350px] max-w-[350px] mx-auto my-auto max-h-[90vh] shrink-0 ${
          isRedHeader ? 'border-red-200' : 'border-slate-100'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
      >
        {/* Mobile Drag Handle Bar */}
        <div className="pt-2.5 pb-1 flex justify-center cursor-pointer shrink-0" onClick={onClose}>
          <div className={`w-9 h-1 rounded-full transition-colors ${isRedHeader ? 'bg-red-300' : 'bg-slate-300/90'}`} />
        </div>

        {/* Sheet Header */}
        <div className={`flex items-center justify-between px-5 pt-1 pb-3 shrink-0 ${isRedHeader ? 'bg-red-50/40 border-b border-red-100/60' : ''}`}>
          <h3 className={`text-xl font-bold tracking-tight truncate ${isRedHeader ? 'text-red-950' : 'text-slate-900'}`}>
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
            title="Close"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0 no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

// 2. MOBILE FORM INPUT FIELD (Single Column Full-Width inside Sheet)
interface MobileFormFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  isRed?: boolean;
  min?: string;
  max?: string;
}

export const MobileFormField: React.FC<MobileFormFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  icon,
  isRed,
  min,
  max,
}) => {
  return (
    <div className="space-y-1.5 w-full">
      <label className={`block text-xs font-bold tracking-tight ${isRed ? 'text-red-800' : 'text-slate-900'}`}>
        {label}
      </label>
      <div
        className={`relative h-[52px] flex items-center gap-3 px-4 rounded-2xl border transition-all ${
          isRed
            ? 'bg-red-50/30 border-red-200 focus-within:bg-white focus-within:border-red-600'
            : 'bg-slate-50/80 border-slate-200/80 focus-within:bg-white focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-slate-900/10'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {icon && <div className="text-slate-400 shrink-0 flex items-center justify-center">{icon}</div>}
        <input
          type={type}
          required={required}
          disabled={disabled}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          max={max}
          className={`w-full bg-transparent text-sm font-semibold placeholder:text-slate-400 focus:outline-none h-full ${
            isRed ? 'text-red-950' : 'text-slate-900'
          }`}
        />
      </div>
    </div>
  );
};

// 3. MOBILE SELECT / PICKER FIELD (Date, Time, Dropdown with Left Icon & Right Chevron)
interface MobileSelectFieldProps {
  label: string;
  displayValue: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: 'date' | 'time' | 'select';
  options?: { value: string; label: string; emoji?: string }[];
  icon?: React.ReactNode;
  disabled?: boolean;
  isRed?: boolean;
}

export const MobileSelectField: React.FC<MobileSelectFieldProps> = ({
  label,
  displayValue,
  value,
  onChange,
  type = 'select',
  options = [],
  icon,
  disabled = false,
  isRed,
}) => {
  return (
    <div className="space-y-1.5 w-full">
      <label className={`block text-xs font-bold tracking-tight ${isRed ? 'text-red-800' : 'text-slate-900'}`}>
        {label}
      </label>
      <div
        className={`relative h-[52px] flex items-center justify-between px-4 rounded-2xl border transition-all cursor-pointer ${
          isRed
            ? 'bg-red-50/30 border-red-200 hover:bg-red-50/50'
            : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/60'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {/* Left Side: Icon & Display Value */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {icon ? (
            <div className="shrink-0 flex items-center justify-center">{icon}</div>
          ) : type === 'date' ? (
            <Calendar className="w-4.5 h-4.5 text-rose-500 shrink-0" />
          ) : type === 'time' ? (
            <Clock className="w-4.5 h-4.5 text-rose-500 shrink-0" />
          ) : (
            <Target className="w-4.5 h-4.5 text-rose-500 shrink-0" />
          )}
          <span className={`text-sm font-semibold truncate ${isRed ? 'text-red-950' : 'text-slate-900'}`}>
            {displayValue}
          </span>
        </div>

        {/* Right Side: Chevron Icon */}
        <ChevronRight className="w-4.5 h-4.5 text-slate-400 shrink-0 ml-2" />

        {/* Invisible Overlay Input / Select triggering native dialogs on click */}
        {!disabled && (
          <>
            {type === 'select' ? (
              <select
                value={value}
                onChange={onChange as any}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10 text-base"
              >
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.emoji ? `${opt.emoji} ${opt.label}` : opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={type}
                value={value}
                onChange={onChange as any}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10 text-base"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

// 4. MOBILE COLOR GRID (Expanded 5-per-row circular swatches + Custom Color Picker)
export const DEFAULT_COLOR_SWATCHES = [
  { label: 'Vibrant Purple', hex: '#8B5CF6' },
  { label: 'Bright Pink', hex: '#EC4899' },
  { label: 'Fresh Green', hex: '#10B981' },
  { label: 'Bright Orange', hex: '#F97316' },
  { label: 'Sunny Yellow', hex: '#F59E0B' },
  { label: 'Bright Blue', hex: '#3B82F6' },
  { label: 'Vibrant Teal', hex: '#14B8A6' },
  { label: 'Electric Violet', hex: '#A855F7' },
  { label: 'Coral Red', hex: '#F43F5E' },
  { label: 'Golden Amber', hex: '#D97706' },
  { label: 'Sky Cyan', hex: '#06B6D4' },
  { label: 'Mint Green', hex: '#34D399' },
  { label: 'Vibrant Magenta', hex: '#D946EF' },
  { label: 'Indigo', hex: '#6366F1' },
  { label: 'Royal Blue', hex: '#2563EB' },
];

interface MobileColorGridProps {
  selectedColor: string;
  onSelectColor: (colorHex: string) => void;
  swatches?: { label: string; hex: string }[];
}

export const MobileColorGrid: React.FC<MobileColorGridProps> = ({
  selectedColor,
  onSelectColor,
  swatches = DEFAULT_COLOR_SWATCHES,
}) => {
  const activeColor = selectedColor || swatches[0].hex;
  const isCustomColor = !swatches.some((s) => s.hex.toLowerCase() === activeColor.toLowerCase());

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-900 tracking-tight">Color</label>
        <span className="text-[11px] font-semibold text-slate-400">15 Preset Swatches</span>
      </div>

      <div className="grid grid-cols-5 gap-3 justify-items-center w-full py-1">
        {swatches.map((c) => {
          const isSelected = activeColor.toLowerCase() === c.hex.toLowerCase();
          return (
            <button
              type="button"
              key={c.hex}
              onClick={() => onSelectColor(c.hex)}
              className={`w-8 h-8 rounded-full transition-all cursor-pointer flex items-center justify-center relative active:scale-95 ${
                isSelected
                  ? 'ring-2 ring-slate-900 ring-offset-2 scale-105 shadow-xs'
                  : 'hover:scale-105'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.label}
            >
              {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
            </button>
          );
        })}

        {/* Custom Color Picker Swatch Button */}
        <div className="relative w-8 h-8">
          <button
            type="button"
            className={`w-8 h-8 rounded-full transition-all cursor-pointer flex items-center justify-center relative active:scale-95 ${
              isCustomColor
                ? 'ring-2 ring-slate-900 ring-offset-2 scale-105 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:scale-105'
            }`}
            style={isCustomColor ? { backgroundColor: activeColor } : undefined}
            title="Custom Color"
          >
            {isCustomColor ? (
              <Check className="w-4 h-4 text-white stroke-[3]" />
            ) : (
              <span className="text-white text-xs font-extrabold">+</span>
            )}
          </button>
          <input
            type="color"
            value={activeColor}
            onChange={(e) => onSelectColor(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
            title="Choose custom color"
          />
        </div>
      </div>
    </div>
  );
};


// 5. MOBILE SEGMENTED CONTROL (Profile "For")
interface MobileSegmentedControlProps {
  label?: string;
  options: { id: string; label: string }[];
  value: string;
  onChange: (val: any) => void;
}

export const MobileSegmentedControl: React.FC<MobileSegmentedControlProps> = ({
  label = 'For',
  options,
  value,
  onChange,
}) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="block text-xs font-bold text-slate-900 tracking-tight">{label}</label>}
      <div className="grid grid-cols-3 bg-slate-100/90 p-1.5 rounded-2xl gap-1 items-center border border-slate-200/50 w-full box-border">
        {options.map((opt) => {
          const isSelected = value === opt.id;
          return (
            <button
              type="button"
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[38px] flex items-center justify-center ${
                isSelected
                  ? 'bg-[#0f172a] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// 6. MOBILE FORM ACTION (Primary Bottom Add Button)
interface MobileFormActionProps {
  label: string;
  onClick?: () => void;
  type?: 'submit' | 'button';
  isSaving?: boolean;
  isRed?: boolean;
}

export const MobileFormAction: React.FC<MobileFormActionProps> = ({
  label,
  onClick,
  type = 'submit',
  isSaving = false,
  isRed = false,
}) => {
  return (
    <div className="pt-2 w-full">
      <button
        type={type}
        onClick={onClick}
        disabled={isSaving}
        className={`w-full h-[52px] rounded-2xl text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98] ${
          isRed
            ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
            : 'bg-[#0f172a] hover:bg-slate-800 shadow-slate-900/10'
        }`}
      >
        {isSaving ? (
          <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          label
        )}
      </button>
    </div>
  );
};
