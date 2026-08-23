import React, { useState, useEffect } from 'react';
import { useStore, getTodayDateString } from '../../context/StoreContext';
import { BottomSheet } from '../ui/BottomSheet';
import { EventType, ProfilePersona, MealType, BookStatus, CalendarEvent, ClassItem, BookItem, HabitItem, CATEGORY_METAS, GroceryCategory } from '../../types';
import { ChevronDown, ChevronUp, Palette, Trash2, Calendar as CalendarIcon, Sparkles, Loader2, Plus } from 'lucide-react';

interface CreationModalContainerProps {
  modalType: 'event' | 'class' | 'task' | 'habit' | 'grocery' | 'meal' | 'book' | null;
  onClose: () => void;
  initialDate?: string;
  eventToEdit?: CalendarEvent | null;
  classToEdit?: ClassItem | null;
  bookToEdit?: BookItem | null;
  habitToEdit?: HabitItem | null;
  initialMealDay?: number;
  initialMealType?: MealType;
  initialClassDay?: number;
}

const COLOR_SWATCHES = [
  { label: 'Royal Blue', hex: '#2563eb' },
  { label: 'Soft Indigo', hex: '#6366f1' },
  { label: 'Purple', hex: '#7c3aed' },
  { label: 'Pink', hex: '#ec4899' },
  { label: 'Coral', hex: '#f43f5e' },
  { label: 'Orange', hex: '#f97316' },
  { label: 'Amber', hex: '#d97706' },
  { label: 'Emerald', hex: '#059669' },
  { label: 'Teal', hex: '#0d9488' },
  { label: 'Slate', hex: '#475569' },
];

const WEEK_DAYS = [
  { num: 1, label: 'M' },
  { num: 2, label: 'T' },
  { num: 3, label: 'W' },
  { num: 4, label: 'T' },
  { num: 5, label: 'F' },
  { num: 6, label: 'S' },
  { num: 7, label: 'S' },
];

export const CreationModalContainer: React.FC<CreationModalContainerProps> = ({
  modalType,
  onClose,
  initialDate,
  eventToEdit,
  classToEdit,
  bookToEdit,
  habitToEdit,
  initialMealDay,
  initialMealType,
  initialClassDay,
}) => {
  const {
    addEvent,
    updateEvent,
    deleteEvent,
    addClass,
    updateClass,
    addTask,
    addHabit,
    updateHabit,
    addGroceryItem,
    addMealItem,
    addBookItem,
    updateBookItem,
    activeProfile,
    profileColors,
  } = useStore();

  const defaultProfile: ProfilePersona = activeProfile === 'Both' ? 'Eve' : activeProfile;

  // Shared Form State
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Collapsible Secondary Options States
  const [showEvtMore, setShowEvtMore] = useState(false);
  const [showClsMore, setShowClsMore] = useState(false);
  const [showHbtMore, setShowHbtMore] = useState(false);
  const [showTskMore, setShowTskMore] = useState(false);
  const [showGrcMore, setShowGrcMore] = useState(false);
  const [showMelMore, setShowMelMore] = useState(false);
  const [showBokMore, setShowBokMore] = useState(false);

  // 1. EVENT FORM STATE
  const [evtTitle, setEvtTitle] = useState('');
  const [evtType, setEvtType] = useState<EventType>('personal');
  const [evtDate, setEvtDate] = useState(initialDate || getTodayDateString());
  const [evtStartTime, setEvtStartTime] = useState('09:00');
  const [evtEndTime, setEvtEndTime] = useState('10:00');
  const [evtLocation, setEvtLocation] = useState('');
  const [evtColor, setEvtColor] = useState('');
  const [evtProfile, setEvtProfile] = useState<ProfilePersona>(defaultProfile);

  useEffect(() => {
    if (modalType === 'event') {
      setIsSaving(false);
      setErrorMsg(null);
      setShowEvtMore(false);
      if (eventToEdit) {
        setEvtTitle(eventToEdit.title);
        setEvtType((eventToEdit.event_type as EventType) || 'personal');
        setEvtDate(eventToEdit.event_date);
        setEvtStartTime(eventToEdit.start_time || '09:00');
        setEvtEndTime(eventToEdit.end_time || '10:00');
        setEvtLocation(eventToEdit.location || '');
        setEvtColor(eventToEdit.color || '');
        setEvtProfile(eventToEdit.profile || defaultProfile);
      } else {
        setEvtDate(initialDate || getTodayDateString());
        setEvtTitle('');
        setEvtLocation('');
        setEvtColor('');
        setEvtStartTime('09:00');
        setEvtEndTime('10:00');
        setEvtProfile(defaultProfile);
      }
    }
  }, [modalType, initialDate, eventToEdit, defaultProfile]);

  // 2. CLASS FORM STATE
  const [clsName, setClsName] = useState('');
  const [clsInstructor, setClsInstructor] = useState('');
  const [clsRoom, setClsRoom] = useState('');
  const [clsStartTime, setClsStartTime] = useState('10:00');
  const [clsEndTime, setClsEndTime] = useState('11:15');
  const [clsDays, setClsDays] = useState<number[]>([1, 3]);
  const [clsProfile, setClsProfile] = useState<ProfilePersona>(defaultProfile);
  const [clsColor, setClsColor] = useState('');

  useEffect(() => {
    if (modalType === 'class') {
      setIsSaving(false);
      setErrorMsg(null);
      if (classToEdit) {
        setClsName(classToEdit.name);
        setClsInstructor(classToEdit.instructor || '');
        setClsRoom(classToEdit.room || '');
        setClsStartTime(classToEdit.start_time || '10:00');
        setClsEndTime(classToEdit.end_time || '11:15');
        setClsDays(classToEdit.days_of_week && classToEdit.days_of_week.length > 0 ? classToEdit.days_of_week : [1, 3]);
        setClsProfile(classToEdit.profile || defaultProfile);
        setClsColor(classToEdit.color || '');
        setShowClsMore(Boolean(classToEdit.room || classToEdit.instructor || classToEdit.color));
      } else {
        setShowClsMore(false);
        setClsName('');
        setClsInstructor('');
        setClsRoom('');
        setClsStartTime('10:00');
        setClsEndTime('11:15');
        setClsDays(initialClassDay ? [initialClassDay] : [1, 3]);
        setClsProfile(defaultProfile);
        setClsColor('');
      }
    }
  }, [modalType, classToEdit, initialClassDay, defaultProfile]);

  // 3. TASK FORM STATE
  const [tskTitle, setTskTitle] = useState('');
  const [tskDueDate, setTskDueDate] = useState(getTodayDateString());
  const [tskDueTime, setTskDueTime] = useState('');
  const [tskPriority, setTskPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [tskProfile, setTskProfile] = useState<ProfilePersona>(defaultProfile);

  useEffect(() => {
    if (modalType === 'task') {
      setIsSaving(false);
      setErrorMsg(null);
      setShowTskMore(false);
      setTskTitle('');
      setTskDueDate(getTodayDateString());
      setTskDueTime('');
      setTskPriority('normal');
      setTskProfile(defaultProfile);
    }
  }, [modalType, defaultProfile]);

  // 4. HABIT FORM STATE
  const [hbtTitle, setHbtTitle] = useState('');
  const [hbtEmoji, setHbtEmoji] = useState('💧');
  const [hbtQty, setHbtQty] = useState('');
  const [hbtDays, setHbtDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
  const [hbtProfile, setHbtProfile] = useState<ProfilePersona>(defaultProfile);
  const [hbtShowInDailySchedule, setHbtShowInDailySchedule] = useState<boolean>(false);

  useEffect(() => {
    if (modalType === 'habit') {
      setIsSaving(false);
      setErrorMsg(null);
      setShowHbtMore(false);
      if (habitToEdit) {
        setHbtTitle(habitToEdit.title);
        setHbtEmoji(habitToEdit.emoji || '✨');
        setHbtQty(habitToEdit.target_quantity ? String(habitToEdit.target_quantity) : '');
        setHbtDays(habitToEdit.active_days && habitToEdit.active_days.length > 0 ? habitToEdit.active_days : [1, 2, 3, 4, 5, 6, 7]);
        setHbtProfile(habitToEdit.profile || defaultProfile);
        setHbtShowInDailySchedule(habitToEdit.show_in_daily_schedule ?? false);
      } else {
        setHbtTitle('');
        setHbtEmoji('💧');
        setHbtQty('');
        setHbtDays([1, 2, 3, 4, 5, 6, 7]);
        setHbtProfile(defaultProfile);
        setHbtShowInDailySchedule(false);
      }
    }
  }, [modalType, habitToEdit, defaultProfile]);

  // 5. GROCERY FORM STATE
  const [grcTitle, setGrcTitle] = useState('');
  const [grcQty, setGrcQty] = useState('');
  const [grcCategory, setGrcCategory] = useState<GroceryCategory>('Produce');
  const [grcProfile, setGrcProfile] = useState<ProfilePersona>(defaultProfile);

  useEffect(() => {
    if (modalType === 'grocery') {
      setIsSaving(false);
      setErrorMsg(null);
      setShowGrcMore(false);
      setGrcTitle('');
      setGrcQty('');
      setGrcCategory('Produce');
      setGrcProfile(defaultProfile);
    }
  }, [modalType, defaultProfile]);

  // 6. MEAL FORM STATE
  const [melTitle, setMelTitle] = useState('');
  const [melDate, setMelDate] = useState<string>(initialDate || getTodayDateString());
  const [melDay, setMelDay] = useState<number>(initialMealDay || 1);
  const [melType, setMelType] = useState<MealType>(initialMealType || 'lunch');
  const [melNotes, setMelNotes] = useState('');
  const [melProfile, setMelProfile] = useState<ProfilePersona>(defaultProfile);

  useEffect(() => {
    if (modalType === 'meal') {
      setIsSaving(false);
      setErrorMsg(null);
      setShowMelMore(false);
      setMelTitle('');
      setMelDate(initialDate || getTodayDateString());
      setMelDay(initialMealDay || 1);
      setMelType(initialMealType || 'lunch');
      setMelNotes('');
      setMelProfile(defaultProfile);
    }
  }, [modalType, initialDate, initialMealDay, initialMealType, defaultProfile]);

  // 7. BOOK FORM STATE
  const [bokTitle, setBokTitle] = useState('');
  const [bokAuthor, setBokAuthor] = useState('');
  const [bokStatus, setBokStatus] = useState<BookStatus>('reading');
  const [bokTotalPages, setBokTotalPages] = useState('');
  const [bokGenre, setBokGenre] = useState('');
  const [bokProfile, setBokProfile] = useState<ProfilePersona>(defaultProfile);

  useEffect(() => {
    if (modalType === 'book') {
      setIsSaving(false);
      setErrorMsg(null);
      setShowBokMore(false);
      if (bookToEdit) {
        setBokTitle(bookToEdit.title);
        setBokAuthor(bookToEdit.author);
        setBokStatus(bookToEdit.status);
        setBokTotalPages(bookToEdit.total_pages ? String(bookToEdit.total_pages) : '');
        setBokGenre(bookToEdit.genre || '');
        setBokProfile(bookToEdit.profile || defaultProfile);
      } else {
        setBokTitle('');
        setBokAuthor('');
        setBokStatus('reading');
        setBokTotalPages('');
        setBokGenre('');
        setBokProfile(defaultProfile);
      }
    }
  }, [modalType, bookToEdit, defaultProfile]);

  if (!modalType) return null;

  const getDayOfWeekFromDateStr = (dateStr: string): number => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const day = d.getDay();
      return day === 0 ? 7 : day;
    }
    return 1;
  };

  // Helper Segmented Profile Selector UI Component
  const renderProfileSelector = (selected: ProfilePersona, setSelected: (p: ProfilePersona) => void) => (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1.5">Profile Owner</label>
      <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 min-h-[48px] items-center">
        {(['Eve', 'Abbie', 'Both'] as ProfilePersona[]).map((p) => {
          const isSelected = selected === p;
          return (
            <button
              type="button"
              key={p}
              onClick={() => setSelected(p)}
              className={`flex-1 min-h-[40px] rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {p}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Helper Color Swatches UI Component
  const renderColorPicker = (selectedColor: string, setSelectedColor: (c: string) => void) => (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
        <Palette className="w-3.5 h-3.5 text-slate-700" />
        <span>Color Theme</span>
      </label>
      <div className="flex items-center gap-2.5 overflow-x-auto py-1">
        {COLOR_SWATCHES.map((c) => {
          const isSelected = selectedColor === c.hex;
          return (
            <button
              type="button"
              key={c.hex}
              onClick={() => setSelectedColor(c.hex)}
              className={`w-9 h-9 min-w-[36px] rounded-full transition-all shrink-0 cursor-pointer border ${
                isSelected
                  ? 'ring-2 ring-slate-900 ring-offset-2 scale-110 shadow-xs border-transparent'
                  : 'border-slate-300 hover:scale-105'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.label}
            />
          );
        })}
      </div>
    </div>
  );

  // Helper Day Selector UI Component
  const renderDaySelector = (selectedDays: number[], toggleDay: (n: number) => void) => (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1.5">Active Days</label>
      <div className="grid grid-cols-7 gap-1.5">
        {WEEK_DAYS.map((d) => {
          const isSelected = selectedDays.includes(d.num);
          return (
            <button
              type="button"
              key={d.num}
              onClick={() => toggleDay(d.num)}
              className={`min-h-[44px] h-11 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs scale-105'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {d.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Submit Handlers
  const handleEvtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle.trim() || isSaving) return;
    setIsSaving(true);
    setErrorMsg(null);
    try {
      let ok = false;
      if (eventToEdit) {
        ok = await updateEvent(eventToEdit.id, {
          title: evtTitle.trim(),
          event_type: evtType,
          event_date: evtDate,
          start_time: evtStartTime,
          end_time: evtEndTime,
          location: evtLocation.trim() || undefined,
          color: evtColor || undefined,
          profile: evtProfile,
        });
      } else {
        ok = await addEvent({
          title: evtTitle.trim(),
          event_type: evtType,
          event_date: evtDate,
          start_time: evtStartTime,
          end_time: evtEndTime,
          location: evtLocation.trim() || undefined,
          color: evtColor || undefined,
          profile: evtProfile,
        });
      }
      if (ok) onClose();
      else setErrorMsg('Could not save event to Supabase. Please try again.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Save failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clsName.trim() || isSaving) return;
    if (clsDays.length === 0) {
      setErrorMsg('Please select at least one day of the week for this class.');
      return;
    }
    setIsSaving(true);
    setErrorMsg(null);
    try {
      let ok = false;
      if (classToEdit) {
        ok = await updateClass(classToEdit.id, {
          name: clsName.trim(),
          instructor: clsInstructor.trim() || undefined,
          room: clsRoom.trim() || undefined,
          start_time: clsStartTime,
          end_time: clsEndTime,
          days_of_week: clsDays,
          profile: clsProfile,
          color: clsColor || undefined,
        });
      } else {
        ok = await addClass({
          name: clsName.trim(),
          instructor: clsInstructor.trim() || undefined,
          room: clsRoom.trim() || undefined,
          start_time: clsStartTime,
          end_time: clsEndTime,
          days_of_week: clsDays,
          profile: clsProfile,
          color: clsColor || undefined,
        });
      }
      if (ok) onClose();
      else setErrorMsg('Could not save class to Supabase. Please try again.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Save failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tskTitle.trim() || isSaving) return;
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const ok = await addTask({
        title: tskTitle.trim(),
        is_completed: false,
        due_date: tskDueDate || undefined,
        due_time: tskDueTime || undefined,
        priority: tskPriority,
        profile: tskProfile,
      });
      if (ok) onClose();
      else setErrorMsg('Could not save task to Supabase. Please try again.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Save failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleHbtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hbtTitle.trim() || isSaving) return;
    setIsSaving(true);
    setErrorMsg(null);
    try {
      let ok = false;
      if (habitToEdit) {
        ok = await updateHabit(habitToEdit.id, {
          title: hbtTitle.trim(),
          emoji: hbtEmoji.trim() || '✨',
          target_quantity: hbtQty ? Number(hbtQty) : undefined,
          active_days: hbtDays,
          profile: hbtProfile,
          show_in_daily_schedule: hbtShowInDailySchedule,
        });
      } else {
        ok = await addHabit({
          title: hbtTitle.trim(),
          emoji: hbtEmoji.trim() || '✨',
          target_quantity: hbtQty ? Number(hbtQty) : undefined,
          active_days: hbtDays,
          profile: hbtProfile,
          show_in_daily_schedule: hbtShowInDailySchedule,
        });
      }
      if (ok) onClose();
      else setErrorMsg('Could not save habit to Supabase. Please try again.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Save failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGrcSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grcTitle.trim() || isSaving) return;
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const ok = await addGroceryItem({
        name: grcTitle.trim(),
        quantity: grcQty.trim() || '1',
        category: grcCategory,
        is_completed: false,
        profile: grcProfile,
      });
      if (ok) onClose();
      else setErrorMsg('Could not save grocery item. Please try again.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Save failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!melTitle.trim() || isSaving) return;
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const computedDay = melDate ? getDayOfWeekFromDateStr(melDate) : melDay;
      const ok = await addMealItem({
        title: melTitle.trim(),
        day_of_week: computedDay,
        meal_date: melDate || getTodayDateString(),
        meal_type: melType,
        notes: melNotes.trim() || undefined,
        profile: melProfile,
      });
      if (ok) onClose();
      else setErrorMsg('Could not save meal. Please try again.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Save failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBokSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bokTitle.trim() || isSaving) return;
    setIsSaving(true);
    setErrorMsg(null);
    try {
      let ok = false;
      if (bookToEdit) {
        ok = await updateBookItem(bookToEdit.id, {
          title: bokTitle.trim(),
          author: bokAuthor.trim() || 'Unknown Author',
          status: bokStatus,
          total_pages: bokTotalPages ? Number(bokTotalPages) : undefined,
          genre: bokGenre.trim() || undefined,
          profile: bokProfile,
        });
      } else {
        ok = await addBookItem({
          title: bokTitle.trim(),
          author: bokAuthor.trim() || 'Unknown Author',
          status: bokStatus,
          total_pages: bokTotalPages ? Number(bokTotalPages) : undefined,
          current_page: 0,
          genre: bokGenre.trim() || undefined,
          profile: bokProfile,
        });
      }
      if (ok) onClose();
      else setErrorMsg('Could not save book. Please try again.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Save failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const getModalMeta = () => {
    switch (modalType) {
      case 'event':
        return {
          title: eventToEdit ? 'Edit Event' : 'Add Event',
          subtitle: 'Schedule a calendar event or reminder',
          emoji: '📅',
        };
      case 'class':
        return {
          title: classToEdit ? 'Edit Class' : 'Add Class',
          subtitle: 'Add or update your course timetable',
          emoji: '📚',
        };
      case 'habit':
        return {
          title: habitToEdit ? 'Edit Habit' : 'Add Habit',
          subtitle: 'Build daily routines and track progress',
          emoji: '⚡',
        };
      case 'task':
        return {
          title: 'Add Task',
          subtitle: 'Create a new action item to complete',
          emoji: '✅',
        };
      case 'grocery':
        return {
          title: 'Add Grocery Item',
          subtitle: 'Keep your shopping list organized',
          emoji: '🛒',
        };
      case 'meal':
        return {
          title: 'Add Meal',
          subtitle: 'Plan your daily menu & recipes',
          emoji: '🍳',
        };
      case 'book':
        return {
          title: bookToEdit ? 'Edit Book' : 'Add to Reading List',
          subtitle: 'Log books and track reading status',
          emoji: '📖',
        };
      default:
        return { title: 'Add New Item', subtitle: '', emoji: '✨' };
    }
  };

  const renderFooterButtons = (saveLabel = 'Save') => (
    <div className="flex items-center gap-3 pt-2">
      <button
        type="button"
        onClick={onClose}
        disabled={isSaving}
        className="flex-1 min-h-[48px] py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-extrabold transition-all cursor-pointer active:scale-95"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSaving}
        className="flex-1 min-h-[48px] py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-extrabold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
      >
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveLabel}
      </button>
    </div>
  );

  const modalMeta = getModalMeta();

  return (
    <BottomSheet
      isOpen={Boolean(modalType)}
      onClose={onClose}
      title={modalMeta.title}
      subtitle={modalMeta.subtitle}
      badgeEmoji={modalMeta.emoji}
    >
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-bold mb-3">
          {errorMsg}
        </div>
      )}

      {/* 1. ADD / EDIT EVENT FORM */}
      {modalType === 'event' && (
        <form onSubmit={handleEvtSubmit} className="space-y-4 pb-2">
          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Event Title</label>
            <input
              type="text"
              required
              value={evtTitle}
              onChange={(e) => setEvtTitle(e.target.value)}
              placeholder="What's happening?"
              className="w-full min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={evtDate}
                onChange={(e) => setEvtDate(e.target.value)}
                className="w-full min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={evtType}
                onChange={(e) => setEvtType(e.target.value as EventType)}
                className="w-full min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 text-sm font-semibold text-slate-900 cursor-pointer focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
              >
                {(Object.keys(CATEGORY_METAS) as EventType[]).map((catKey) => {
                  const meta = CATEGORY_METAS[catKey];
                  return (
                    <option key={catKey} value={catKey}>
                      {meta.emoji} {meta.label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                value={evtStartTime}
                onChange={(e) => setEvtStartTime(e.target.value)}
                className="w-full min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                value={evtEndTime}
                onChange={(e) => setEvtEndTime(e.target.value)}
                className="w-full min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
              />
            </div>
          </div>

          {renderColorPicker(evtColor, setEvtColor)}
          {renderProfileSelector(evtProfile, setEvtProfile)}

          {/* Collapsible Secondary Fields */}
          <div>
            <button
              type="button"
              onClick={() => setShowEvtMore(!showEvtMore)}
              className="flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-slate-900 py-1 transition-colors cursor-pointer"
            >
              {showEvtMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showEvtMore ? 'Fewer options' : 'More options (Location, Link)'}</span>
            </button>

            {showEvtMore && (
              <div className="pt-2 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location / Link</label>
                  <input
                    type="text"
                    value={evtLocation}
                    onChange={(e) => setEvtLocation(e.target.value)}
                    placeholder="Room, building, or video link"
                    className="w-full min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {renderFooterButtons(eventToEdit ? 'Save Changes' : 'Add Event')}
        </form>
      )}

      {/* 2. ADD / EDIT CLASS FORM */}
      {modalType === 'class' && (
        <form onSubmit={handleClsSubmit} className="space-y-4 pb-2">
          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Class Name</label>
            <input
              type="text"
              required
              value={clsName}
              onChange={(e) => setClsName(e.target.value)}
              placeholder="e.g. Organic Chemistry"
              className="w-full min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
            />
          </div>

          {renderDaySelector(clsDays, (n) =>
            setClsDays((prev) => (prev.includes(n) ? prev.filter((d) => d !== n) : [...prev, n]))
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                value={clsStartTime}
                onChange={(e) => setClsStartTime(e.target.value)}
                className="w-full min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                value={clsEndTime}
                onChange={(e) => setClsEndTime(e.target.value)}
                className="w-full min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
              />
            </div>
          </div>

          {renderColorPicker(clsColor, setClsColor)}
          {renderProfileSelector(clsProfile, setClsProfile)}

          {/* Collapsible Room / Instructor */}
          <div>
            <button
              type="button"
              onClick={() => setShowClsMore(!showClsMore)}
              className="flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-slate-900 py-1 transition-colors cursor-pointer"
            >
              {showClsMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showClsMore ? 'Fewer options' : 'More options (Room, Instructor)'}</span>
            </button>

            {showClsMore && (
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Room / Hall</label>
                  <input
                    type="text"
                    value={clsRoom}
                    onChange={(e) => setClsRoom(e.target.value)}
                    placeholder="Science 101"
                    className="w-full min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Instructor</label>
                  <input
                    type="text"
                    value={clsInstructor}
                    onChange={(e) => setClsInstructor(e.target.value)}
                    placeholder="Prof. Smith"
                    className="w-full min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {renderFooterButtons(classToEdit ? 'Save Changes' : 'Add Class')}
        </form>
      )}

      {/* 3. ADD / EDIT HABIT FORM */}
      {modalType === 'habit' && (
        <form onSubmit={handleHbtSubmit} className="space-y-4 pb-2">
          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Habit Name & Emoji</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={hbtEmoji}
                onChange={(e) => setHbtEmoji(e.target.value)}
                className="w-14 min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl text-center text-xl font-bold focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                title="Emoji"
              />
              <input
                type="text"
                required
                value={hbtTitle}
                onChange={(e) => setHbtTitle(e.target.value)}
                placeholder="e.g. Drink Water"
                className="flex-1 min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
              />
            </div>

            {/* Quick Emoji Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 no-scrollbar">
              {['⚡', '💧', '🏋️', '📚', '🧘', '🍎', '💻', '🎨', '🏃', '😴'].map((em) => (
                <button
                  type="button"
                  key={em}
                  onClick={() => setHbtEmoji(em)}
                  className={`w-9 h-9 rounded-xl text-base flex items-center justify-center transition-all cursor-pointer ${
                    hbtEmoji === em ? 'bg-slate-900 text-white shadow-xs scale-105' : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {renderDaySelector(hbtDays, (n) =>
            setHbtDays((prev) => (prev.includes(n) ? prev.filter((d) => d !== n) : [...prev, n]))
          )}

          {/* Show in Daily Schedule Toggle */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between min-h-[48px]">
            <div className="space-y-0.5">
              <span className="text-xs font-extrabold text-slate-900">Show in Daily Schedule</span>
              <p className="text-[11px] text-slate-500 font-medium">Display on your daily calendar</p>
            </div>
            <button
              type="button"
              onClick={() => setHbtShowInDailySchedule(!hbtShowInDailySchedule)}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                hbtShowInDailySchedule
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {hbtShowInDailySchedule ? 'ON ✓' : 'OFF ○'}
            </button>
          </div>

          {renderProfileSelector(hbtProfile, setHbtProfile)}

          {/* Collapsible Quantity Goal */}
          <div>
            <button
              type="button"
              onClick={() => setShowHbtMore(!showHbtMore)}
              className="flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-slate-900 py-1 transition-colors cursor-pointer"
            >
              {showHbtMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showHbtMore ? 'Fewer options' : 'More options (Target Quantity Goal)'}</span>
            </button>

            {showHbtMore && (
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Daily Quantity Goal</label>
                <input
                  type="number"
                  value={hbtQty}
                  onChange={(e) => setHbtQty(e.target.value)}
                  placeholder="e.g. 8"
                  className="w-full min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                />
              </div>
            )}
          </div>

          {renderFooterButtons(habitToEdit ? 'Save Habit' : 'Add Habit')}
        </form>
      )}

      {/* 4. ADD TASK FORM */}
      {modalType === 'task' && (
        <form onSubmit={handleTskSubmit} className="space-y-4 pb-2">
          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5">What needs to be done?</label>
            <input
              type="text"
              required
              value={tskTitle}
              onChange={(e) => setTskTitle(e.target.value)}
              placeholder="e.g. Buy toothpaste"
              className="w-full min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
            />
          </div>

          {/* Priority Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Priority</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTskPriority('low')}
                className={`min-h-[44px] rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                  tskPriority === 'low'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-400/20 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                🟢 Low
              </button>
              <button
                type="button"
                onClick={() => setTskPriority('normal')}
                className={`min-h-[44px] rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                  tskPriority === 'normal'
                    ? 'bg-amber-50 text-amber-800 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                🟡 Normal
              </button>
              <button
                type="button"
                onClick={() => setTskPriority('high')}
                className={`min-h-[44px] rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                  tskPriority === 'high'
                    ? 'bg-rose-50 text-rose-800 border-rose-400 ring-2 ring-rose-400/20 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                🔴 High
              </button>
            </div>
          </div>

          {renderProfileSelector(tskProfile, setTskProfile)}

          {/* Collapsible Due Date / Time */}
          <div>
            <button
              type="button"
              onClick={() => setShowTskMore(!showTskMore)}
              className="flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-slate-900 py-1 transition-colors cursor-pointer"
            >
              {showTskMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showTskMore ? 'Fewer options' : 'More options (Due Date & Time)'}</span>
            </button>

            {showTskMore && (
              <div className="pt-2 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={tskDueDate}
                    onChange={(e) => setTskDueDate(e.target.value)}
                    className="w-full min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Time</label>
                  <input
                    type="time"
                    value={tskDueTime}
                    onChange={(e) => setTskDueTime(e.target.value)}
                    className="w-full min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {renderFooterButtons('Add Task')}
        </form>
      )}

      {/* 5. ADD GROCERY ITEM FORM */}
      {modalType === 'grocery' && (
        <form onSubmit={handleGrcSubmit} className="space-y-4 pb-2">
          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Grocery Item</label>
            <input
              type="text"
              required
              value={grcTitle}
              onChange={(e) => setGrcTitle(e.target.value)}
              placeholder="e.g. Organic Milk"
              className="w-full min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Category</label>
            <select
              value={grcCategory}
              onChange={(e) => setGrcCategory(e.target.value as GroceryCategory)}
              className="w-full min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 text-sm font-semibold text-slate-900 cursor-pointer focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
            >
              {[
                { label: 'Produce', emoji: '🥬' },
                { label: 'Dairy', emoji: '🧀' },
                { label: 'Pantry', emoji: '🌾' },
                { label: 'Bakery', emoji: '🍞' },
                { label: 'Meat', emoji: '🥩' },
                { label: 'Frozen', emoji: '🧊' },
                { label: 'Beverages', emoji: '🧃' },
                { label: 'Other', emoji: '📦' },
              ].map((c) => (
                <option key={c.label} value={c.label}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>

          {renderProfileSelector(grcProfile, setGrcProfile)}

          {/* Collapsible Quantity */}
          <div>
            <button
              type="button"
              onClick={() => setShowGrcMore(!showGrcMore)}
              className="flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-slate-900 py-1 transition-colors cursor-pointer"
            >
              {showGrcMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showGrcMore ? 'Fewer options' : 'More options (Quantity)'}</span>
            </button>

            {showGrcMore && (
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantity / Weight</label>
                <input
                  type="text"
                  value={grcQty}
                  onChange={(e) => setGrcQty(e.target.value)}
                  placeholder="e.g. 2 gal, 1 lb"
                  className="w-full min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                />
              </div>
            )}
          </div>

          {renderFooterButtons('Add Grocery Item')}
        </form>
      )}

      {/* 6. ADD MEAL FORM */}
      {modalType === 'meal' && (
        <form onSubmit={handleMelSubmit} className="space-y-4 pb-2">
          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Meal Title</label>
            <input
              type="text"
              required
              value={melTitle}
              onChange={(e) => setMelTitle(e.target.value)}
              placeholder="e.g. Avocado Toast"
              className="w-full min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
            />
          </div>

          {/* Meal Type Segmented Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Meal Type</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { type: 'breakfast', label: 'Breakfast', emoji: '🍳' },
                { type: 'lunch', label: 'Lunch', emoji: '🥗' },
                { type: 'dinner', label: 'Dinner', emoji: '🍲' },
                { type: 'snack', label: 'Snack', emoji: '🍎' },
              ].map((m) => {
                const isSelected = melType === m.type;
                return (
                  <button
                    type="button"
                    key={m.type}
                    onClick={() => setMelType(m.type as MealType)}
                    className={`min-h-[44px] rounded-xl text-xs font-extrabold transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs scale-105'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span className="text-sm">{m.emoji}</span>
                    <span className="text-[10px] capitalize">{m.type}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={melDate}
              onChange={(e) => setMelDate(e.target.value)}
              className="w-full min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
            />
          </div>

          {renderProfileSelector(melProfile, setMelProfile)}

          {/* Collapsible Notes */}
          <div>
            <button
              type="button"
              onClick={() => setShowMelMore(!showMelMore)}
              className="flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-slate-900 py-1 transition-colors cursor-pointer"
            >
              {showMelMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showMelMore ? 'Fewer options' : 'More options (Notes & Recipe)'}</span>
            </button>

            {showMelMore && (
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Recipe / Ingredients</label>
                <textarea
                  value={melNotes}
                  onChange={(e) => setMelNotes(e.target.value)}
                  placeholder="e.g. Add sourdough & poached eggs"
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                />
              </div>
            )}
          </div>

          {renderFooterButtons('Add Meal')}
        </form>
      )}

      {/* 7. ADD / EDIT BOOK FORM */}
      {modalType === 'book' && (
        <form onSubmit={handleBokSubmit} className="space-y-4 pb-2">
          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Book Title</label>
            <input
              type="text"
              required
              value={bokTitle}
              onChange={(e) => setBokTitle(e.target.value)}
              placeholder="e.g. Tomorrow, and Tomorrow, and Tomorrow"
              className="w-full min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Author</label>
            <input
              type="text"
              value={bokAuthor}
              onChange={(e) => setBokAuthor(e.target.value)}
              placeholder="Author name"
              className="w-full min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
            />
          </div>

          {/* Reading Status Segmented Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Reading Status</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { status: 'reading', label: 'Reading 📖' },
                { status: 'want_to_read', label: 'To Read 📝' },
                { status: 'completed', label: 'Finished 🎉' },
              ].map((s) => {
                const isSelected = bokStatus === s.status;
                return (
                  <button
                    type="button"
                    key={s.status}
                    onClick={() => setBokStatus(s.status as BookStatus)}
                    className={`min-h-[44px] rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center px-1.5 ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs scale-105'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {renderProfileSelector(bokProfile, setBokProfile)}

          {/* Collapsible Total Pages & Genre */}
          <div>
            <button
              type="button"
              onClick={() => setShowBokMore(!showBokMore)}
              className="flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-slate-900 py-1 transition-colors cursor-pointer"
            >
              {showBokMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showBokMore ? 'Fewer options' : 'More options (Total Pages, Genre)'}</span>
            </button>

            {showBokMore && (
              <div className="pt-2 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Pages</label>
                  <input
                    type="number"
                    value={bokTotalPages}
                    onChange={(e) => setBokTotalPages(e.target.value)}
                    placeholder="e.g. 384"
                    className="w-full min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Genre</label>
                  <input
                    type="text"
                    value={bokGenre}
                    onChange={(e) => setBokGenre(e.target.value)}
                    placeholder="e.g. Fiction"
                    className="w-full min-h-[48px] bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {renderFooterButtons(bookToEdit ? 'Save Book Changes' : 'Add to Shelf')}
        </form>
      )}
    </BottomSheet>
  );
};
