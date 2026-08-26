import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, Check, X, Calendar, Clock, Target, Tag, BookOpen, Layers, User, AlertCircle } from 'lucide-react';
import { formatTime12Hour } from '../../context/StoreContext';

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

// Helper to format HH:mm into "9:00 AM" (single conversion via formatTime12Hour)
export const formatTimeDisplay = (timeStr: string): string => {
  if (!timeStr) return 'Select Time';
  return formatTime12Hour(timeStr) || 'Select Time';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/30 sm:bg-slate-900/20 backdrop-blur-xs animate-fade-in overflow-y-auto">
      {/* Backdrop overlay click handler */}
      <div className="fixed inset-0 cursor-pointer" onClick={onClose} />

      {/* Floating Centered Container (Mobile Sheet / Desktop Modal) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-white rounded-[28px] sm:rounded-[24px] shadow-2xl border animate-slide-up flex flex-col z-10 overflow-hidden w-[calc(100%-32px)] max-w-[390px] sm:w-[540px] sm:max-w-[540px] mx-auto my-auto max-h-[90vh] shrink-0 ${
          isRedHeader ? 'border-red-200' : 'border-slate-100'
        }`}
        style={{ width: 'min(540px, calc(100vw - 32px))', paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
      >
        {/* Mobile Drag Handle Bar (HIDDEN ON DESKTOP) */}
        <div className="pt-2.5 pb-1 flex justify-center cursor-pointer shrink-0 sm:hidden" onClick={onClose}>
          <div className={`w-9 h-1 rounded-full transition-colors ${isRedHeader ? 'bg-red-300' : 'bg-slate-300/90'}`} />
        </div>

        {/* Sheet / Modal Header */}
        <div className={`flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 shrink-0 ${isRedHeader ? 'bg-red-50/40 border-b border-red-100/60' : 'border-b border-slate-100/80'}`}>
          <h3 className={`text-base sm:text-lg font-semibold tracking-tight truncate ${isRedHeader ? 'text-red-950' : 'text-[#182033]'}`}>
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
            title="Close"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 space-y-4 min-h-0 no-scrollbar">
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
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const activateField = () => {
    const input = inputRef.current;
    if (!input || disabled) return;

    input.focus();
    if ((type === 'date' || type === 'time') && 'showPicker' in input) {
      try {
        (input as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
      } catch {
      }
    }
  };

  return (
    <div className="space-y-1.5 w-full">
      <label htmlFor={inputId} className={`block text-xs font-semibold tracking-tight ${isRed ? 'text-red-800' : 'text-slate-700'}`}>
        {label}
      </label>
      <label
        htmlFor={inputId}
        onClick={activateField}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            activateField();
          }
        }}
        className={`relative block h-[52px] rounded-2xl border transition-all ${
          isRed
            ? 'bg-red-50/30 border-red-200 focus-within:bg-white focus-within:border-red-600'
            : 'bg-slate-50/80 border-slate-200/80 focus-within:bg-white focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-slate-900/10'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-text hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10'}`}
      >
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 flex items-center justify-center pointer-events-none">{icon}</div>}
        <input
          id={inputId}
          ref={inputRef}
          type={type}
          required={required}
          disabled={disabled}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          max={max}
          className={`absolute inset-0 box-border w-full rounded-2xl bg-transparent px-4 text-sm font-semibold placeholder:text-slate-400 focus:outline-none ${
            icon ? 'pl-11' : ''
          } ${
            isRed ? 'text-red-950' : 'text-slate-900'
          }`}
        />
      </label>
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

const HOURS_12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES_5 = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const parse12hParts = (timeStr: string): { hour: number; minute: number; ampm: 'AM' | 'PM' } => {
  const fallback = { hour: 9, minute: 0, ampm: 'AM' as const };
  if (!timeStr) return fallback;
  const trimmed = timeStr.trim();
  const parts = trimmed.split(':');
  if (parts.length < 2) return fallback;
  const rawHour = parseInt(parts[0], 10);
  const rawMinute = parseInt(parts[1], 10);
  if (isNaN(rawHour) || isNaN(rawMinute)) return fallback;
  const ampm: 'AM' | 'PM' = rawHour >= 12 ? 'PM' : 'AM';
  let hour = rawHour % 12;
  if (hour === 0) hour = 12;
  return { hour, minute: rawMinute, ampm };
};

const to24HourValue = (hour: number, minute: number, ampm: 'AM' | 'PM'): string => {
  let hour24 = hour % 12;
  if (ampm === 'PM') hour24 += 12;
  return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const emitTimeChange = (
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void,
  hhmm: string
) => {
  onChange({ target: { value: hhmm } } as React.ChangeEvent<HTMLInputElement>);
};

interface PickerColumnProps<T extends string | number> {
  items: T[];
  selected: T;
  onSelect: (item: T) => void;
  format?: (item: T) => string;
  ariaLabel: string;
  isRed?: boolean;
}

const PickerColumn = <T extends string | number>({
  items,
  selected,
  onSelect,
  format = (item: T) => String(item),
  ariaLabel,
  isRed,
}: PickerColumnProps<T>) => {
  const colRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const col = colRef.current;
    if (!col) return;
    const el = col.querySelector('[data-selected="true"]') as HTMLElement | null;
    if (!el) return;
    col.scrollTop = el.offsetTop - col.clientHeight / 2 + el.clientHeight / 2;
  }, []);

  return (
    <div
      ref={colRef}
      role="listbox"
      aria-label={ariaLabel}
      className="h-[200px] overflow-y-auto no-scrollbar py-2 snap-y snap-mandatory"
    >
      {items.map((item) => {
        const isSelected = item === selected;
        return (
          <button
            type="button"
            key={String(item)}
            role="option"
            aria-selected={isSelected}
            data-selected={isSelected ? 'true' : undefined}
            onClick={() => onSelect(item)}
            className={`w-full h-10 snap-start rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
              isSelected
                ? isRed
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-[#0f172a] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {format(item)}
          </button>
        );
      })}
    </div>
  );
};

interface TimePickerDialogProps {
  label: string;
  value: string;
  isRed?: boolean;
  onChange: (hhmm: string) => void;
  onClose: () => void;
}

const TimePickerDialog: React.FC<TimePickerDialogProps> = ({
  label,
  value,
  isRed,
  onChange,
  onClose,
}) => {
  const initial = parse12hParts(value);
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const [ampm, setAmpm] = useState<'AM' | 'PM'>(initial.ampm);
  const dialogRef = useRef<HTMLDivElement>(null);

  const commit = (nextHour: number, nextMinute: number, nextAmpm: 'AM' | 'PM') => {
    onChange(to24HourValue(nextHour, nextMinute, nextAmpm));
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    dialogRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const minuteItems = MINUTES_5.includes(minute)
    ? MINUTES_5
    : [...MINUTES_5, minute].sort((a, b) => a - b);

  const handleDone = () => {
    commit(hour, minute, ampm);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-fade-in">
      <div className="fixed inset-0 cursor-pointer" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-white rounded-[28px] sm:rounded-[24px] shadow-2xl border animate-slide-up z-10 overflow-hidden w-full max-w-[340px] mx-auto outline-none ${
          isRed ? 'border-red-200' : 'border-slate-100'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
      >
        <div className="pt-2.5 pb-1 flex justify-center sm:hidden">
          <div className={`w-9 h-1 rounded-full ${isRed ? 'bg-red-300' : 'bg-slate-300/90'}`} />
        </div>
        <div className={`flex items-center justify-between px-5 py-3.5 shrink-0 ${isRed ? 'bg-red-50/40 border-b border-red-100/60' : 'border-b border-slate-100/80'}`}>
          <h3 className={`text-base font-semibold tracking-tight ${isRed ? 'text-red-950' : 'text-[#182033]'}`}>
            {label}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
            title="Close"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        <div className="px-4 py-4">
          <div className="grid grid-cols-3 gap-2 bg-slate-50/80 border border-slate-200/80 rounded-2xl p-2">
            <PickerColumn
              ariaLabel="Hour"
              items={HOURS_12}
              selected={hour}
              onSelect={(next) => {
                setHour(next);
                commit(next, minute, ampm);
              }}
              isRed={isRed}
            />
            <PickerColumn
              ariaLabel="Minute"
              items={minuteItems}
              selected={minute}
              format={(m) => String(m).padStart(2, '0')}
              onSelect={(next) => {
                setMinute(next);
                commit(hour, next, ampm);
              }}
              isRed={isRed}
            />
            <div className="flex flex-col justify-center gap-2 px-1">
              {(['AM', 'PM'] as const).map((period) => {
                const isSelected = ampm === period;
                return (
                  <button
                    type="button"
                    key={period}
                    aria-pressed={isSelected}
                    onClick={() => {
                      setAmpm(period);
                      commit(hour, minute, period);
                    }}
                    className={`h-[48px] rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? isRed
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-[#0f172a] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {period}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={handleDone}
            className={`w-full h-[52px] rounded-2xl text-white text-sm font-semibold shadow-md transition-all flex items-center justify-center cursor-pointer active:scale-[0.98] ${
              isRed ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' : 'bg-[#0f172a] hover:bg-slate-800 shadow-slate-900/10'
            }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

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
  const fieldId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const openPicker = () => {
    if (disabled) return;
    setPickerOpen(true);
  };

  const closePicker = () => {
    setPickerOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const fieldClasses = `relative h-[52px] flex items-center justify-between px-4 rounded-2xl border transition-all ${
    isRed
      ? 'bg-red-50/30 border-red-200 hover:bg-red-50/50'
      : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/60'
  } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`;

  const fieldIcon = icon ? (
    <div className="shrink-0 flex items-center justify-center">{icon}</div>
  ) : type === 'date' ? (
    <Calendar className="w-4.5 h-4.5 text-rose-500 shrink-0" />
  ) : type === 'time' ? (
    <Clock className="w-4.5 h-4.5 text-rose-500 shrink-0" />
  ) : (
    <Target className="w-4.5 h-4.5 text-rose-500 shrink-0" />
  );

  return (
    <div className="space-y-1.5 w-full">
      <label htmlFor={fieldId} className={`block text-xs font-bold tracking-tight ${isRed ? 'text-red-800' : 'text-slate-900'}`}>
        {label}
      </label>

      {type === 'time' ? (
        <>
          <button
            type="button"
            id={fieldId}
            ref={triggerRef}
            disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={pickerOpen}
            aria-label={`${label}, ${displayValue}`}
            onClick={openPicker}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openPicker();
              }
            }}
            className={`${fieldClasses} w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/10`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {fieldIcon}
              <span className={`text-sm font-semibold truncate ${isRed ? 'text-red-950' : 'text-slate-900'}`}>
                {displayValue}
              </span>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-slate-400 shrink-0 ml-2" />
          </button>
          {pickerOpen && (
            <TimePickerDialog
              label={label}
              value={value}
              isRed={isRed}
              onChange={(hhmm) => emitTimeChange(onChange, hhmm)}
              onClose={closePicker}
            />
          )}
        </>
      ) : (
        <div className={fieldClasses}>
          <div className="flex items-center gap-3 min-w-0 flex-1 pointer-events-none">
            {fieldIcon}
            <span className={`text-sm font-semibold truncate ${isRed ? 'text-red-950' : 'text-slate-900'}`}>
              {displayValue}
            </span>
          </div>
          <ChevronRight className="w-4.5 h-4.5 text-slate-400 shrink-0 ml-2 pointer-events-none" />
          {!disabled && (
            <>
              {type === 'select' ? (
                <select
                  id={fieldId}
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
                  id={fieldId}
                  type={type}
                  value={value}
                  onChange={onChange as any}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10 text-base"
                />
              )}
            </>
          )}
        </div>
      )}
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
  onCancel?: () => void;
  type?: 'submit' | 'button';
  isSaving?: boolean;
  isRed?: boolean;
}

export const MobileFormAction: React.FC<MobileFormActionProps> = ({
  label,
  onClick,
  onCancel,
  type = 'submit',
  isSaving = false,
  isRed = false,
}) => {
  return (
    <div className="pt-3 w-full flex items-center gap-3">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="hidden sm:flex flex-1 h-[48px] rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-all items-center justify-center cursor-pointer border border-slate-200/80 active:scale-[0.98]"
        >
          Cancel
        </button>
      )}
      <button
        type={type}
        onClick={onClick}
        disabled={isSaving}
        className={`w-full ${onCancel ? 'sm:flex-1' : ''} h-[52px] sm:h-[48px] rounded-2xl text-white text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98] ${
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
