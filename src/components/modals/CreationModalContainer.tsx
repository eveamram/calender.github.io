import React, { useState, useEffect } from 'react';
import { useStore, getTodayDateString } from '../../context/StoreContext';
import { BottomSheet } from '../ui/BottomSheet';
import { EventType, ProfilePersona, MealType, BookStatus, CalendarEvent, BookItem, CATEGORY_METAS } from '../../types';
import { ChevronDown, ChevronUp, Palette } from 'lucide-react';

interface CreationModalContainerProps {
  modalType: 'event' | 'class' | 'task' | 'habit' | 'meal' | 'book' | null;
  onClose: () => void;
  initialDate?: string;
  eventToEdit?: CalendarEvent | null;
  bookToEdit?: BookItem | null;
  initialMealDay?: number;
  initialMealType?: MealType;
}

const EVENT_COLOR_OPTIONS = [
  { label: 'Soft Blue', hex: '#3b82f6' },
  { label: 'Cornflower', hex: '#6366f1' },
  { label: 'Lavender', hex: '#a855f7' },
  { label: 'Blush Pink', hex: '#f43f5e' },
  { label: 'Terracotta', hex: '#c2410c' },
  { label: 'Peach', hex: '#f97316' },
  { label: 'Butter Yellow', hex: '#eab308' },
  { label: 'Sage Green', hex: '#10b981' },
  { label: 'Teal', hex: '#14b8a6' },
  { label: 'Muted Gray', hex: '#64748b' },
];

export const CreationModalContainer: React.FC<CreationModalContainerProps> = ({
  modalType,
  onClose,
  initialDate,
  eventToEdit,
  bookToEdit,
  initialMealDay,
  initialMealType,
}) => {
  const {
    addEvent,
    updateEvent,
    addClass,
    addTask,
    addHabit,
    addMealItem,
    addBookItem,
    updateBookItem,
    activeProfile,
    profileColors,
  } = useStore();

  const defaultProfile: ProfilePersona = activeProfile === 'Both' ? 'Eve' : activeProfile;

  // Event Form State
  const [evtTitle, setEvtTitle] = useState('');
  const [evtType, setEvtType] = useState<EventType>('personal');
  const [evtDate, setEvtDate] = useState(initialDate || getTodayDateString());
  const [evtStartTime, setEvtStartTime] = useState('09:00');
  const [evtEndTime, setEvtEndTime] = useState('10:00');
  const [evtLocation, setEvtLocation] = useState('');
  const [evtColor, setEvtColor] = useState('');
  const [evtProfile, setEvtProfile] = useState<ProfilePersona>(defaultProfile);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Sync initial values / eventToEdit into state whenever modal is opened
  useEffect(() => {
    if (modalType === 'event') {
      if (eventToEdit) {
        setEvtTitle(eventToEdit.title);
        setEvtType(eventToEdit.event_type as EventType);
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

  // Book Form State
  const [bokTitle, setBokTitle] = useState('');
  const [bokAuthor, setBokAuthor] = useState('');
  const [bokStatus, setBokStatus] = useState<BookStatus>('reading');
  const [bokTotalPages, setBokTotalPages] = useState('');
  const [bokGenre, setBokGenre] = useState('');
  const [bokProfile, setBokProfile] = useState<ProfilePersona>(defaultProfile);

  useEffect(() => {
    if (modalType === 'book') {
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

  // Class Form State
  const [clsName, setClsName] = useState('');
  const [clsInstructor, setClsInstructor] = useState('');
  const [clsRoom, setClsRoom] = useState('');
  const [clsStartTime, setClsStartTime] = useState('10:00');
  const [clsEndTime, setClsEndTime] = useState('11:15');
  const [clsDays, setClsDays] = useState<number[]>([1, 3]);
  const [clsProfile, setClsProfile] = useState<ProfilePersona>(defaultProfile);

  // Task Form State
  const [tskTitle, setTskTitle] = useState('');
  const [tskDueDate, setTskDueDate] = useState(getTodayDateString());
  const [tskDueTime, setTskDueTime] = useState('');
  const [tskPriority, setTskPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [tskProfile, setTskProfile] = useState<ProfilePersona>(defaultProfile);

  // Habit Form State
  const [hbtTitle, setHbtTitle] = useState('');
  const [hbtEmoji, setHbtEmoji] = useState('💧');
  const [hbtQty, setHbtQty] = useState('');
  const [hbtDays, setHbtDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
  const [hbtProfile, setHbtProfile] = useState<ProfilePersona>(defaultProfile);

const getDayOfWeekFromDateStr = (dateStr: string): number => {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const day = d.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    return day === 0 ? 7 : day;
  }
  return 1;
};

  // Meal Form State
  const [melTitle, setMelTitle] = useState('');
  const [melDate, setMelDate] = useState<string>(initialDate || getTodayDateString());
  const [melDay, setMelDay] = useState<number>(initialMealDay || 1);
  const [melType, setMelType] = useState<MealType>(initialMealType || 'lunch');
  const [melNotes, setMelNotes] = useState('');
  const [melProfile, setMelProfile] = useState<ProfilePersona>(defaultProfile);

  if (!modalType) return null;

  const formattedDateLabel = (() => {
    if (!evtDate) return '';
    const parts = evtDate.split('-');
    if (parts.length !== 3) return evtDate;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' });
  })();

  const handleEvtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle.trim()) return;

    if (eventToEdit) {
      await updateEvent(eventToEdit.id, {
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
      await addEvent({
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
    onClose();
  };

  const handleClsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clsName.trim()) return;
    await addClass({
      name: clsName.trim(),
      instructor: clsInstructor.trim() || undefined,
      room: clsRoom.trim() || undefined,
      start_time: clsStartTime,
      end_time: clsEndTime,
      days_of_week: clsDays,
      profile: clsProfile,
    });
    onClose();
  };

  const handleTskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tskTitle.trim()) return;
    await addTask({
      title: tskTitle.trim(),
      is_completed: false,
      due_date: tskDueDate || undefined,
      due_time: tskDueTime || undefined,
      priority: tskPriority,
      profile: tskProfile,
    });
    onClose();
  };

  const handleHbtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hbtTitle.trim()) return;
    await addHabit({
      title: hbtTitle.trim(),
      emoji: hbtEmoji.trim() || '✨',
      target_quantity: hbtQty ? Number(hbtQty) : undefined,
      active_days: hbtDays,
      profile: hbtProfile,
    });
    onClose();
  };

  const handleMelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!melTitle.trim()) return;
    const computedDay = melDate ? getDayOfWeekFromDateStr(melDate) : melDay;
    await addMealItem({
      title: melTitle.trim(),
      day_of_week: computedDay,
      meal_date: melDate || getTodayDateString(),
      meal_type: melType,
      notes: melNotes.trim() || undefined,
      profile: melProfile,
    });
    onClose();
  };

  const handleBokSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bokTitle.trim()) return;

    if (bookToEdit) {
      await updateBookItem(bookToEdit.id, {
        title: bokTitle.trim(),
        author: bokAuthor.trim() || 'Unknown Author',
        status: bokStatus,
        total_pages: bokTotalPages ? Number(bokTotalPages) : undefined,
        genre: bokGenre.trim() || undefined,
        profile: bokProfile,
      });
    } else {
      await addBookItem({
        title: bokTitle.trim(),
        author: bokAuthor.trim() || 'Unknown Author',
        status: bokStatus,
        total_pages: bokTotalPages ? Number(bokTotalPages) : undefined,
        current_page: 0,
        genre: bokGenre.trim() || undefined,
        profile: bokProfile,
      });
    }
    onClose();
  };

  const toggleClsDay = (dayNum: number) => {
    setClsDays((prev) =>
      prev.includes(dayNum) ? prev.filter((d) => d !== dayNum) : [...prev, dayNum]
    );
  };

  const toggleHbtDay = (dayNum: number) => {
    setHbtDays((prev) =>
      prev.includes(dayNum) ? prev.filter((d) => d !== dayNum) : [...prev, dayNum]
    );
  };

  return (
    <BottomSheet
      isOpen={Boolean(modalType)}
      onClose={onClose}
      title={eventToEdit ? 'Edit Event' : bookToEdit ? 'Edit Book' : `Create New ${modalType}`}
    >
      {/* Streamlined Event Form */}
      {modalType === 'event' && (
        <form onSubmit={handleEvtSubmit} className="space-y-4">
          {/* Pre-filled Date Banner */}
          <div className="bg-slate-100/80 border border-slate-200/70 rounded-2xl p-3 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">Selected Date:</span>
            <span className="font-extrabold text-slate-900 bg-white px-2.5 py-1 rounded-xl shadow-2xs">{formattedDateLabel}</span>
          </div>

          {/* 1. Event Name */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Event Name</label>
            <input
              type="text"
              required
              autoFocus
              value={evtTitle}
              onChange={(e) => setEvtTitle(e.target.value)}
              placeholder="e.g. Coffee with Sarah"
              className="w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
            />
          </div>

          {/* 2. Start Time & End Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                value={evtStartTime}
                onChange={(e) => setEvtStartTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                value={evtEndTime}
                onChange={(e) => setEvtEndTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
              />
            </div>
          </div>

          {/* Category & Type Dropdown */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Category & Type</label>
            <select
              value={evtType}
              onChange={(e) => setEvtType(e.target.value as EventType)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3.5 text-base sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer shadow-xs"
            >
              {(Object.keys(CATEGORY_METAS) as EventType[]).map((catKey) => {
                const meta = CATEGORY_METAS[catKey];
                return (
                  <option key={catKey} value={catKey} className="py-2 text-sm font-bold text-slate-900">
                    {meta.emoji} {meta.label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* 3. Event Color Palette Swatches */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-blue-600" />
              <span>Custom Color (Optional)</span>
            </label>
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {EVENT_COLOR_OPTIONS.map((c) => {
                const isSelected = evtColor === c.hex;
                return (
                  <button
                    type="button"
                    key={c.label}
                    onClick={() => setEvtColor(c.hex)}
                    className={`w-7 h-7 rounded-full border transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-blue-500 ring-offset-2 scale-110'
                        : 'border-slate-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex || '#ffffff' }}
                    title={c.label}
                  >
                    {isSelected && (
                      <div className={`w-2 h-2 rounded-full ${c.hex ? 'bg-white' : 'bg-blue-600'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Profile Owner */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Profile Owner</label>
            <div className="flex gap-2">
              {(['Eve', 'Abbie', 'Both'] as ProfilePersona[]).map((p) => {
                const pColor = profileColors[p] || (p === 'Eve' ? '#2563eb' : p === 'Abbie' ? '#ec4899' : '#059669');
                const isSelected = evtProfile === p;

                return (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setEvtProfile(p)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    style={isSelected ? { backgroundColor: pColor } : undefined}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. More Options Collapsible */}
          <div className="border-t border-slate-100 pt-2">
            <button
              type="button"
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 py-1"
            >
              <span>{showMoreOptions ? 'Hide More Options' : 'More Options'}</span>
              {showMoreOptions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showMoreOptions && (
              <div className="space-y-3 pt-2 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={evtType}
                    onChange={(e) => setEvtType(e.target.value as EventType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
                  >
                    <option value="personal">Personal</option>
                    <option value="class">Class</option>
                    <option value="exam">Exam</option>
                    <option value="assignment">Assignment</option>
                    <option value="appointment">Appointment</option>
                    <option value="birthday">Birthday</option>
                    <option value="trip">Trip</option>
                    <option value="meeting">Meeting</option>
                    <option value="work">Work</option>
                    <option value="study">Study</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location / Room</label>
                  <input
                    type="text"
                    value={evtLocation}
                    onChange={(e) => setEvtLocation(e.target.value)}
                    placeholder="e.g. Starbucks, Main St."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={evtDate}
                    onChange={(e) => setEvtDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-3 rounded-xl text-sm shadow-md shadow-blue-600/20 transition-all mt-4 cursor-pointer"
          >
            {eventToEdit ? 'Save Changes' : 'Create Event'}
          </button>
        </form>
      )}

      {/* Class Form */}
      {modalType === 'class' && (
        <form onSubmit={handleClsSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Course Name</label>
            <input
              type="text"
              required
              value={clsName}
              onChange={(e) => setClsName(e.target.value)}
              placeholder="e.g. Organic Chemistry II"
              className="w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Instructor</label>
              <input
                type="text"
                value={clsInstructor}
                onChange={(e) => setClsInstructor(e.target.value)}
                placeholder="Dr. Smith"
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-slate-900 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Room / Building</label>
              <input
                type="text"
                value={clsRoom}
                onChange={(e) => setClsRoom(e.target.value)}
                placeholder="Hall 104"
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-slate-900 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Start Time</label>
              <input
                type="time"
                value={clsStartTime}
                onChange={(e) => setClsStartTime(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-slate-900 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">End Time</label>
              <input
                type="time"
                value={clsEndTime}
                onChange={(e) => setClsEndTime(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-slate-900 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Days of Week</label>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { num: 1, label: 'M' },
                { num: 2, label: 'T' },
                { num: 3, label: 'W' },
                { num: 4, label: 'T' },
                { num: 5, label: 'F' },
              ].map((d) => {
                const isSelected = clsDays.includes(d.num);
                return (
                  <button
                    type="button"
                    key={d.num}
                    onClick={() => toggleClsDay(d.num)}
                    className={`py-2.5 rounded-2xl font-black text-xs transition-all cursor-pointer text-center ${
                      isSelected ? 'bg-slate-900 text-white shadow-xs scale-105' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Profile Owner</label>
            <div className="flex gap-2">
              {(['Eve', 'Abbie', 'Both'] as ProfilePersona[]).map((p) => {
                const pColor = profileColors[p] || (p === 'Eve' ? '#2563eb' : p === 'Abbie' ? '#ec4899' : '#059669');
                const isSelected = clsProfile === p;
                return (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setClsProfile(p)}
                    className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected ? 'text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    style={isSelected ? { backgroundColor: pColor } : undefined}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-md transition-all mt-4 cursor-pointer"
          >
            Save Class
          </button>
        </form>
      )}

      {/* Task Form */}
      {modalType === 'task' && (
        <form onSubmit={handleTskSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Task Title</label>
            <input
              type="text"
              required
              value={tskTitle}
              onChange={(e) => setTskTitle(e.target.value)}
              placeholder="e.g. Complete Problem Set #3"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={tskDueDate}
                onChange={(e) => setTskDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
              <select
                value={tskPriority}
                onChange={(e) => setTskPriority(e.target.value as 'low' | 'normal' | 'high')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Profile Owner</label>
            <div className="flex gap-2">
              {(['Eve', 'Abbie', 'Both'] as ProfilePersona[]).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setTskProfile(p)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    tskProfile === p
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm shadow-md transition-all mt-4"
          >
            Save Task
          </button>
        </form>
      )}

      {/* Habit Form */}
      {modalType === 'habit' && (
        <form onSubmit={handleHbtSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Habit Title</label>
            <input
              type="text"
              required
              value={hbtTitle}
              onChange={(e) => setHbtTitle(e.target.value)}
              placeholder="e.g. Drink 8 cups of water"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Emoji / Icon</label>
              <input
                type="text"
                value={hbtEmoji}
                onChange={(e) => setHbtEmoji(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Daily Target Qty (Optional)</label>
              <input
                type="number"
                value={hbtQty}
                onChange={(e) => setHbtQty(e.target.value)}
                placeholder="e.g. 8"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Repeat Days of Week</label>
            <div className="flex justify-between gap-1">
              {[
                { num: 1, label: 'Mon' },
                { num: 2, label: 'Tue' },
                { num: 3, label: 'Wed' },
                { num: 4, label: 'Thu' },
                { num: 5, label: 'Fri' },
                { num: 6, label: 'Sat' },
                { num: 7, label: 'Sun' },
              ].map((d) => {
                const isSelected = hbtDays.includes(d.num);
                return (
                  <button
                    type="button"
                    key={d.num}
                    onClick={() => toggleHbtDay(d.num)}
                    className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Profile Owner</label>
            <div className="flex gap-2">
              {(['Eve', 'Abbie', 'Both'] as ProfilePersona[]).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setHbtProfile(p)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    hbtProfile === p
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm shadow-md transition-all mt-4"
          >
            Save Habit
          </button>
        </form>
      )}

      {/* Meal Form */}
      {modalType === 'meal' && (
        <form onSubmit={handleMelSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Meal Dish Title</label>
            <input
              type="text"
              required
              value={melTitle}
              onChange={(e) => setMelTitle(e.target.value)}
              placeholder="e.g. Grilled Chicken Bowl"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Meal Date</label>
            <input
              type="date"
              value={melDate}
              onChange={(e) => {
                setMelDate(e.target.value);
                if (e.target.value) setMelDay(getDayOfWeekFromDateStr(e.target.value));
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Day of Week</label>
              <select
                value={melDay}
                onChange={(e) => setMelDay(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
              >
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
                <option value={7}>Sunday</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Meal Type</label>
              <select
                value={melType}
                onChange={(e) => setMelType(e.target.value as MealType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm shadow-md transition-all mt-4"
          >
            Save Meal
          </button>
        </form>
      )}

      {/* Book Form */}
      {modalType === 'book' && (
        <form onSubmit={handleBokSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Book Title</label>
            <input
              type="text"
              required
              value={bokTitle}
              onChange={(e) => setBokTitle(e.target.value)}
              placeholder="e.g. Deep Work"
              className="w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Author</label>
            <input
              type="text"
              value={bokAuthor}
              onChange={(e) => setBokAuthor(e.target.value)}
              placeholder="Cal Newport"
              className="w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Status</label>
              <select
                value={bokStatus}
                onChange={(e) => setBokStatus(e.target.value as BookStatus)}
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-slate-900 transition-all"
              >
                <option value="reading">Currently Reading</option>
                <option value="want_to_read">Want to Read</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Total Pages</label>
              <input
                type="number"
                value={bokTotalPages}
                onChange={(e) => setBokTotalPages(e.target.value)}
                placeholder="300"
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-slate-900 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Who is Reading?</label>
            <div className="flex gap-2">
              {(['Eve', 'Abbie', 'Both'] as ProfilePersona[]).map((p) => {
                const pColor = profileColors[p] || (p === 'Eve' ? '#2563eb' : p === 'Abbie' ? '#ec4899' : '#059669');
                const isSelected = bokProfile === p;
                return (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setBokProfile(p)}
                    className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected ? 'text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    style={isSelected ? { backgroundColor: pColor } : undefined}
                  >
                    {p === 'Both' ? 'Both (Eve & Abbie)' : p}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-md transition-all mt-4 cursor-pointer"
          >
            Save Book
          </button>
        </form>
      )}
    </BottomSheet>
  );
};
