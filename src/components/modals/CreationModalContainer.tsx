import React, { useState, useEffect } from 'react';
import { useStore, getTodayDateString } from '../../context/StoreContext';
import {
  EventType,
  ProfilePersona,
  MealType,
  BookStatus,
  CalendarEvent,
  ClassItem,
  BookItem,
  HabitItem,
  CATEGORY_METAS,
} from '../../types';
import {
  ChevronDown,
  ChevronUp,
  Palette,
  Calendar as CalendarIcon,
  Clock,
  Target,
  BookOpen,
  Check,
  Tag,
  Smile,
  ListTodo,
  Utensils,
  Plus,
} from 'lucide-react';
import {
  MobileFormSheet,
  MobileFormField,
  MobileSelectField,
  MobileColorGrid,
  MobileSegmentedControl,
  MobileFormAction,
  formatDateDisplay,
  formatTimeDisplay,
  DEFAULT_COLOR_SWATCHES,
} from '../ui/MobileFormComponents';

interface CreationModalContainerProps {
  modalType: 'event' | 'class' | 'task' | 'habit' | 'meal' | 'book' | null;
  onClose: () => void;
  initialDate?: string;
  initialEventType?: EventType;
  eventToEdit?: CalendarEvent | null;
  classToEdit?: ClassItem | null;
  bookToEdit?: BookItem | null;
  habitToEdit?: HabitItem | null;
  initialMealDay?: number;
  initialMealType?: MealType;
  initialClassDay?: number;
}

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
  initialEventType,
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
    addClass,
    updateClass,
    addTask,
    addHabit,
    updateHabit,
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
  const [showMelMore, setShowMelMore] = useState(false);
  const [showBokMore, setShowBokMore] = useState(false);

  // 1. EVENT FORM STATE
  const [evtTitle, setEvtTitle] = useState('');
  const [evtType, setEvtType] = useState<EventType>(initialEventType || 'personal');
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
        setEvtType((eventToEdit.event_type as EventType) || initialEventType || 'personal');
        setEvtDate(eventToEdit.event_date);
        setEvtStartTime(eventToEdit.start_time || '09:00');
        setEvtEndTime(eventToEdit.end_time || '10:00');
        setEvtLocation(eventToEdit.location || '');
        setEvtColor(eventToEdit.color || DEFAULT_COLOR_SWATCHES[0].hex);
        setEvtProfile(eventToEdit.profile || defaultProfile);
      } else {
        setEvtDate(initialDate || getTodayDateString());
        setEvtTitle('');
        setEvtType(initialEventType || 'personal');
        setEvtLocation('');
        setEvtColor(DEFAULT_COLOR_SWATCHES[0].hex);
        setEvtStartTime('09:00');
        setEvtEndTime('10:00');
        setEvtProfile(defaultProfile);
      }
    }
  }, [modalType, initialDate, initialEventType, eventToEdit, defaultProfile]);

  // 2. CLASS FORM STATE
  const [clsName, setClsName] = useState('');
  const [clsInstructor, setClsInstructor] = useState('');
  const [clsRoom, setClsRoom] = useState('');
  const [clsStartTime, setClsStartTime] = useState('10:00');
  const [clsEndTime, setClsEndTime] = useState('11:15');
  const [clsDays, setClsDays] = useState<number[]>([1, 3]);
  const [clsProfile, setClsProfile] = useState<ProfilePersona>(defaultProfile);
  const [clsColor, setClsColor] = useState(DEFAULT_COLOR_SWATCHES[0].hex);
  const [clsOfficeHours, setClsOfficeHours] = useState('');
  const [clsOfficeHoursLocation, setClsOfficeHoursLocation] = useState('');

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
        setClsColor(classToEdit.color || DEFAULT_COLOR_SWATCHES[0].hex);
        setClsOfficeHours(classToEdit.office_hours || '');
        setClsOfficeHoursLocation(classToEdit.office_hours_location || '');
        setShowClsMore(Boolean(classToEdit.room || classToEdit.instructor || classToEdit.office_hours || classToEdit.office_hours_location));
      } else {
        setShowClsMore(false);
        setClsName('');
        setClsInstructor('');
        setClsRoom('');
        setClsStartTime('10:00');
        setClsEndTime('11:15');
        setClsDays(initialClassDay ? [initialClassDay] : [1, 3]);
        setClsProfile(defaultProfile);
        setClsColor(DEFAULT_COLOR_SWATCHES[0].hex);
        setClsOfficeHours('');
        setClsOfficeHoursLocation('');
      }
    }
  }, [modalType, classToEdit, initialClassDay, defaultProfile]);

  // 3. TASK FORM STATE
  const [tskTitle, setTskTitle] = useState('');
  const [tskDueDate, setTskDueDate] = useState(getTodayDateString());
  const [tskDueTime, setTskDueTime] = useState('17:00');
  const [tskPriority, setTskPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [tskProfile, setTskProfile] = useState<ProfilePersona>(defaultProfile);

  useEffect(() => {
    if (modalType === 'task') {
      setIsSaving(false);
      setErrorMsg(null);
      setShowTskMore(false);
      setTskTitle('');
      setTskDueDate(getTodayDateString());
      setTskDueTime('17:00');
      setTskPriority('normal');
      setTskProfile(defaultProfile);
    }
  }, [modalType, defaultProfile]);

  // 4. HABIT FORM STATE
  const [hbtTitle, setHbtTitle] = useState('');
  const [hbtEmoji, setHbtEmoji] = useState('⚡');
  const [hbtQty, setHbtQty] = useState('');
  const [hbtDays, setHbtDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
  const [hbtProfile, setHbtProfile] = useState<ProfilePersona>(defaultProfile);
  const [hbtShowInDailySchedule, setHbtShowInDailySchedule] = useState<boolean>(true);
  const [hbtColor, setHbtColor] = useState(DEFAULT_COLOR_SWATCHES[0].hex);

  useEffect(() => {
    if (modalType === 'habit') {
      setIsSaving(false);
      setErrorMsg(null);
      setShowHbtMore(false);
      if (habitToEdit) {
        setHbtTitle(habitToEdit.title);
        setHbtEmoji(habitToEdit.emoji || '⚡');
        setHbtQty(habitToEdit.target_quantity ? String(habitToEdit.target_quantity) : '');
        setHbtDays(habitToEdit.active_days && habitToEdit.active_days.length > 0 ? habitToEdit.active_days : [1, 2, 3, 4, 5, 6, 7]);
        setHbtProfile(habitToEdit.profile || defaultProfile);
        setHbtShowInDailySchedule(habitToEdit.show_in_daily_schedule ?? true);
        setHbtColor(DEFAULT_COLOR_SWATCHES[0].hex);
      } else {
        setHbtTitle('');
        setHbtEmoji('⚡');
        setHbtQty('');
        setHbtDays([1, 2, 3, 4, 5, 6, 7]);
        setHbtProfile(defaultProfile);
        setHbtShowInDailySchedule(true);
        setHbtColor(DEFAULT_COLOR_SWATCHES[0].hex);
      }
    }
  }, [modalType, habitToEdit, defaultProfile]);



  // 6. MEAL FORM STATE
  const [melTitle, setMelTitle] = useState('');
  const [melDay, setMelDay] = useState<number>(initialMealDay || 1);
  const [melDate, setMelDate] = useState<string>(initialDate || getTodayDateString());
  const [melType, setMelType] = useState<MealType>(initialMealType || 'lunch');
  const [melNotes, setMelNotes] = useState('');
  const [melProfile, setMelProfile] = useState<ProfilePersona>(defaultProfile);

  useEffect(() => {
    if (modalType === 'meal') {
      setIsSaving(false);
      setErrorMsg(null);
      setShowMelMore(false);
      setMelTitle('');
      setMelDay(initialMealDay || 1);
      setMelDate(initialDate || getTodayDateString());
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

  // Day of Week Segmented Control
  const renderDaySelector = (
    selectedDays: number[],
    toggleDay: (n: number) => void,
    showWeekends = true,
    activeColor?: string
  ) => {
    const days = showWeekends ? WEEK_DAYS : WEEK_DAYS.slice(0, 5);
    return (
      <div className="space-y-1.5 w-full">
        <label className="block text-xs font-bold text-slate-900 tracking-tight">
          {showWeekends ? 'Active Days' : 'Days'}
        </label>
        <div className={`grid gap-1 w-full box-border ${showWeekends ? 'grid-cols-7' : 'grid-cols-5'}`}>
          {days.map((d) => {
            const isSelected = selectedDays.includes(d.num);
            return (
              <button
                type="button"
                key={d.num}
                onClick={() => toggleDay(d.num)}
                style={isSelected && activeColor ? { backgroundColor: activeColor } : undefined}
                className={`h-10 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center cursor-pointer ${
                  isSelected
                    ? activeColor ? 'text-white shadow-sm scale-[1.02]' : 'bg-[#0f172a] text-white shadow-xs'
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
  };

  // Submit Handlers
  const handleEvtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle.trim() || isSaving) return;
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const finalColor = evtType === 'exam' ? '#f43f5e' : (evtColor || undefined);
      let ok = false;
      if (eventToEdit) {
        ok = await updateEvent(eventToEdit.id, {
          title: evtTitle.trim(),
          event_type: evtType,
          event_date: evtDate,
          start_time: evtStartTime,
          end_time: evtEndTime,
          location: evtLocation.trim() || undefined,
          color: finalColor,
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
          color: finalColor,
          profile: evtProfile,
        });
      }
      if (ok) onClose();
      else setErrorMsg('Could not save event. Please try again.');
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
      const personaColor = clsColor || profileColors[clsProfile] || (clsProfile === 'Abbie' ? '#ec4899' : '#2563eb');
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
          color: personaColor,
          office_hours: clsOfficeHours.trim() || undefined,
          office_hours_location: clsOfficeHoursLocation.trim() || undefined,
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
          color: personaColor,
          office_hours: clsOfficeHours.trim() || undefined,
          office_hours_location: clsOfficeHoursLocation.trim() || undefined,
        });
      }
      if (ok) onClose();
      else setErrorMsg('Could not save class. Please try again.');
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
        due_date: tskDueDate || undefined,
        due_time: tskDueTime || undefined,
        priority: tskPriority,
        is_completed: false,
        profile: tskProfile,
      });
      if (ok) onClose();
      else setErrorMsg('Could not save task. Please try again.');
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
          emoji: hbtEmoji.trim() || '⚡',
          target_quantity: hbtQty ? Number(hbtQty) : undefined,
          active_days: hbtDays,
          profile: hbtProfile,
          show_in_daily_schedule: hbtShowInDailySchedule,
        });
      } else {
        ok = await addHabit({
          title: hbtTitle.trim(),
          emoji: hbtEmoji.trim() || '⚡',
          target_quantity: hbtQty ? Number(hbtQty) : undefined,
          active_days: hbtDays,
          profile: hbtProfile,
          show_in_daily_schedule: hbtShowInDailySchedule,
        });
      }
      if (ok) onClose();
      else setErrorMsg('Could not save habit. Please try again.');
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

  const getSheetTitle = () => {
    switch (modalType) {
      case 'event':
        if (evtType === 'exam' || initialEventType === 'exam') {
          return eventToEdit ? 'Edit Exam' : 'Add Exam';
        }
        return eventToEdit ? 'Edit Event' : 'Add Event';
      case 'class':
        return classToEdit ? 'Edit Class' : 'Add Class';
      case 'habit':
        return habitToEdit ? 'Edit Habit' : 'Add Habit';
      case 'task':
        return 'Add Task';
      case 'meal':
        return 'Add Meal';
      case 'book':
        return bookToEdit ? 'Edit Book' : 'Add Book';
      default:
        return 'Add Item';
    }
  };

  const isExamModal = modalType === 'event' && (evtType === 'exam' || initialEventType === 'exam');

  const profileOptions = [
    { id: 'Eve', label: 'Eve' },
    { id: 'Abbie', label: 'Abbie' },
    { id: 'Both', label: 'Both' },
  ];

  return (
    <MobileFormSheet
      isOpen={Boolean(modalType)}
      onClose={onClose}
      title={getSheetTitle()}
      isRedHeader={isExamModal}
    >
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-2xl text-xs font-bold mb-2">
          {errorMsg}
        </div>
      )}

      {/* 1. ADD / EDIT EVENT FORM */}
      {modalType === 'event' && (
        <form onSubmit={handleEvtSubmit} className="space-y-4 md:space-y-5 w-full">
          {/* Event Title */}
          <MobileFormField
            label={isExamModal ? 'Exam Title' : 'Event Title'}
            value={evtTitle}
            onChange={(e) => setEvtTitle(e.target.value)}
            placeholder={isExamModal ? 'e.g. Midterm 1, Final Exam' : "What's happening?"}
            required
            isRed={isExamModal}
          />

          {/* Date & Category Grid on Desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:gap-4">
            <MobileSelectField
              label="Date"
              type="date"
              displayValue={formatDateDisplay(evtDate)}
              value={evtDate}
              onChange={(e) => setEvtDate(e.target.value)}
              isRed={isExamModal}
            />
            <MobileSelectField
              label="Category"
              type="select"
              displayValue={`${CATEGORY_METAS[evtType]?.emoji || '🎯'} ${CATEGORY_METAS[evtType]?.label || 'Personal'}`}
              value={evtType}
              onChange={(e) => setEvtType(e.target.value as EventType)}
              disabled={isExamModal}
              options={(Object.keys(CATEGORY_METAS) as EventType[]).map((catKey) => ({
                value: catKey,
                label: CATEGORY_METAS[catKey].label,
                emoji: CATEGORY_METAS[catKey].emoji,
              }))}
              isRed={isExamModal}
            />
          </div>

          {/* Start Time & End Time Grid on Desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:gap-4">
            <MobileSelectField
              label="Start Time"
              type="time"
              displayValue={formatTimeDisplay(evtStartTime)}
              value={evtStartTime}
              onChange={(e) => setEvtStartTime(e.target.value)}
              isRed={isExamModal}
            />
            <MobileSelectField
              label="End Time"
              type="time"
              displayValue={formatTimeDisplay(evtEndTime)}
              value={evtEndTime}
              onChange={(e) => setEvtEndTime(e.target.value)}
              isRed={isExamModal}
            />
          </div>

          {/* Color & Persona */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:gap-4 items-start">
            {!isExamModal ? (
              <MobileColorGrid
                selectedColor={evtColor}
                onSelectColor={(hex) => setEvtColor(hex)}
              />
            ) : <div />}
            <MobileSegmentedControl
              label="For"
              options={profileOptions}
              value={evtProfile}
              onChange={(val) => setEvtProfile(val as ProfilePersona)}
            />
          </div>

          {/* More options ⌄ */}
          <div>
            <button
              type="button"
              onClick={() => setShowEvtMore(!showEvtMore)}
              className="flex items-center justify-center gap-1.5 w-full text-xs font-bold text-slate-600 hover:text-slate-900 py-1 transition-colors cursor-pointer"
            >
              <span>{showEvtMore ? 'Fewer options' : 'More options'}</span>
              {showEvtMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showEvtMore && (
              <div className="pt-2">
                <MobileFormField
                  label="Location / Link"
                  value={evtLocation}
                  onChange={(e) => setEvtLocation(e.target.value)}
                  placeholder="Room, building, or exam link"
                  isRed={isExamModal}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <MobileFormAction
            label={eventToEdit ? (isExamModal ? 'Save Exam' : 'Save Changes') : (isExamModal ? 'Add Exam' : 'Add Event')}
            isSaving={isSaving}
            isRed={isExamModal}
            onCancel={onClose}
          />
        </form>
      )}

      {/* 2. ADD CLASS FORM */}
      {modalType === 'class' && (
        <form onSubmit={handleClsSubmit} className="space-y-4 md:space-y-5 w-full">
          <MobileFormField
            label="Class Name"
            value={clsName}
            onChange={(e) => setClsName(e.target.value)}
            placeholder="e.g. Organic Chemistry"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:gap-4">
            <MobileSelectField
              label="Start Time"
              type="time"
              displayValue={formatTimeDisplay(clsStartTime)}
              value={clsStartTime}
              onChange={(e) => setClsStartTime(e.target.value)}
            />
            <MobileSelectField
              label="End Time"
              type="time"
              displayValue={formatTimeDisplay(clsEndTime)}
              value={clsEndTime}
              onChange={(e) => setClsEndTime(e.target.value)}
            />
          </div>

          {renderDaySelector(
            clsDays,
            (n) => setClsDays((prev) => (prev.includes(n) ? prev.filter((d) => d !== n) : [...prev, n])),
            false
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:gap-4 items-start">
            <MobileColorGrid
              selectedColor={clsColor}
              onSelectColor={(hex) => setClsColor(hex)}
            />
            <MobileSegmentedControl
              label="For"
              options={profileOptions}
              value={clsProfile}
              onChange={(val) => setClsProfile(val as ProfilePersona)}
            />
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowClsMore(!showClsMore)}
              className="flex items-center justify-center gap-1.5 w-full text-xs font-bold text-slate-600 hover:text-slate-900 py-1 transition-colors cursor-pointer"
            >
              <span>{showClsMore ? 'Fewer options' : 'More options'}</span>
              {showClsMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showClsMore && (
              <div className="pt-2 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:gap-4">
                  <MobileFormField
                    label="Room / Hall"
                    value={clsRoom}
                    onChange={(e) => setClsRoom(e.target.value)}
                    placeholder="Science 101"
                  />
                  <MobileFormField
                    label="Instructor"
                    value={clsInstructor}
                    onChange={(e) => setClsInstructor(e.target.value)}
                    placeholder="Prof. Smith"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:gap-4">
                  <MobileFormField
                    label="Office Hours Schedule"
                    value={clsOfficeHours}
                    onChange={(e) => setClsOfficeHours(e.target.value)}
                    placeholder="e.g. Mon & Wed 2:00 - 4:00 PM"
                  />
                  <MobileFormField
                    label="Office Hours Location"
                    value={clsOfficeHoursLocation}
                    onChange={(e) => setClsOfficeHoursLocation(e.target.value)}
                    placeholder="e.g. Science 304 or Zoom"
                  />
                </div>
              </div>
            )}
          </div>

          <MobileFormAction
            label={classToEdit ? 'Save Changes' : 'Add Class'}
            isSaving={isSaving}
            onCancel={onClose}
          />
        </form>
      )}

      {/* 3. ADD HABIT FORM */}
      {modalType === 'habit' && (
        <form onSubmit={handleHbtSubmit} className="space-y-3.5 md:space-y-4.5 w-full">
          {/* Title & Emoji Header */}
          <div className="space-y-2 w-full">
            <label className="block text-xs font-bold text-slate-900 tracking-tight">Habit Name & Icon</label>
            <div className="flex gap-2.5 items-center w-full">
              <div
                style={{ backgroundColor: `${hbtColor || '#ec4899'}20`, border: `2px solid ${hbtColor || '#ec4899'}` }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-2xs font-extrabold"
              >
                {hbtEmoji || '✨'}
              </div>
              <input
                type="text"
                required
                value={hbtTitle}
                onChange={(e) => setHbtTitle(e.target.value)}
                placeholder="e.g. Drink Water"
                className="flex-1 h-[48px] bg-slate-50/80 border border-slate-200/80 rounded-2xl px-4 text-sm font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
              />
            </div>

            {/* Quick Emoji Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
              {['⚡', '💧', '🏋️', '📚', '🧘', '🍎', '💻', '🎨', '🏃', '😴', '✨', '🎯'].map((em) => {
                const isSelected = hbtEmoji === em;
                return (
                  <button
                    type="button"
                    key={em}
                    onClick={() => setHbtEmoji(em)}
                    style={isSelected ? { backgroundColor: hbtColor || '#ec4899' } : undefined}
                    className={`w-8 h-8 rounded-xl text-base flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95 ${
                      isSelected
                        ? 'text-white shadow-xs scale-105'
                        : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    {em}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Days Selector */}
          {renderDaySelector(
            hbtDays,
            (n) => setHbtDays((prev) => (prev.includes(n) ? prev.filter((d) => d !== n) : [...prev, n])),
            true,
            hbtColor || '#ec4899'
          )}

          {/* Color & Profile Grid on Desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:gap-4 items-start">
            <MobileColorGrid
              selectedColor={hbtColor}
              onSelectColor={(hex) => setHbtColor(hex)}
            />
            <MobileSegmentedControl
              label="For"
              options={profileOptions}
              value={hbtProfile}
              onChange={(val) => setHbtProfile(val as ProfilePersona)}
            />
          </div>

          {/* Show in Daily Schedule Toggle */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between gap-2 w-full">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 block">Show in Daily Schedule</span>
              <p className="text-[10px] md:text-xs text-slate-500 font-medium">Display on daily calendar agenda</p>
            </div>
            <button
              type="button"
              onClick={() => setHbtShowInDailySchedule(!hbtShowInDailySchedule)}
              style={hbtShowInDailySchedule ? { backgroundColor: hbtColor || '#ec4899', borderColor: hbtColor || '#ec4899' } : undefined}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border shrink-0 ${
                hbtShowInDailySchedule
                  ? 'text-white shadow-2xs'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {hbtShowInDailySchedule ? 'ON ✓' : 'OFF ○'}
            </button>
          </div>

          {/* Target Goal (More options) */}
          <div>
            <button
              type="button"
              onClick={() => setShowHbtMore(!showHbtMore)}
              className="flex items-center justify-center gap-1.5 w-full text-xs font-bold text-slate-600 hover:text-slate-900 py-1 transition-colors cursor-pointer"
            >
              <span>{showHbtMore ? 'Fewer options' : 'More options'}</span>
              {showHbtMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showHbtMore && (
              <div className="pt-2">
                <MobileFormField
                  label="Daily Target Goal"
                  type="number"
                  value={hbtQty}
                  onChange={(e) => setHbtQty(e.target.value)}
                  placeholder="e.g. 8 (glasses, pages)"
                />
              </div>
            )}
          </div>

          {/* Submit Action */}
          <MobileFormAction
            label={habitToEdit ? 'Save Habit' : 'Add Habit'}
            isSaving={isSaving}
            onCancel={onClose}
          />
        </form>
      )}

      {/* 4. ADD TASK FORM */}
      {modalType === 'task' && (
        <form onSubmit={handleTskSubmit} className="space-y-4 md:space-y-5 w-full">
          <MobileFormField
            label="Task"
            value={tskTitle}
            onChange={(e) => setTskTitle(e.target.value)}
            placeholder="What needs to be done?"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:gap-4">
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 min-w-0">
                <MobileSelectField
                  label="Due Date"
                  type="date"
                  displayValue={tskDueDate ? formatDateDisplay(tskDueDate) : 'N/A (No Due Date)'}
                  value={tskDueDate}
                  onChange={(e) => setTskDueDate(e.target.value)}
                />
              </div>
              {tskDueDate ? (
                <button
                  type="button"
                  onClick={() => setTskDueDate('')}
                  className="text-xs font-bold text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 px-3 py-2.5 rounded-xl transition-all cursor-pointer mt-5 shrink-0"
                >
                  Clear
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setTskDueDate(getTodayDateString())}
                  className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2.5 rounded-xl transition-all cursor-pointer mt-5 shrink-0"
                >
                  Today
                </button>
              )}
            </div>

            <MobileSelectField
              label="Due Time"
              type="time"
              displayValue={formatTimeDisplay(tskDueTime)}
              value={tskDueTime}
              onChange={(e) => setTskDueTime(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:gap-4 items-start">
            <div className="space-y-1.5 w-full">
              <label className="block text-xs font-bold text-slate-900 tracking-tight">Priority</label>
              <div className="grid grid-cols-3 gap-1.5 w-full">
                {[
                  { key: 'low', label: '🟢 Low' },
                  { key: 'normal', label: '🟡 Normal' },
                  { key: 'high', label: '🔴 High' },
                ].map((p) => (
                  <button
                    type="button"
                    key={p.key}
                    onClick={() => setTskPriority(p.key as any)}
                    className={`h-[48px] rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      tskPriority === p.key
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <MobileSegmentedControl
              label="For"
              options={profileOptions}
              value={tskProfile}
              onChange={(val) => setTskProfile(val as ProfilePersona)}
            />
          </div>

          <MobileFormAction
            label="Add Task"
            isSaving={isSaving}
            onCancel={onClose}
          />
        </form>
      )}

      {/* 5. ADD MEAL FORM */}
      {modalType === 'meal' && (
        <form onSubmit={handleMelSubmit} className="space-y-4 md:space-y-5 w-full">
          <MobileFormField
            label="Meal Name"
            value={melTitle}
            onChange={(e) => setMelTitle(e.target.value)}
            placeholder="e.g. Avocado Toast"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:gap-4">
            <MobileSelectField
              label="Day/Date"
              type="date"
              displayValue={formatDateDisplay(melDate)}
              value={melDate}
              onChange={(e) => setMelDate(e.target.value)}
            />
            <div className="space-y-1.5 w-full">
              <label className="block text-xs font-bold text-slate-900 tracking-tight">Meal Type</label>
              <div className="grid grid-cols-4 gap-1 w-full box-border">
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
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center min-h-[48px] ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span className="text-xs">{m.emoji}</span>
                      <span className="text-[9px] capitalize leading-none mt-0.5">{m.type}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <MobileSegmentedControl
            label="For"
            options={profileOptions}
            value={melProfile}
            onChange={(val) => setMelProfile(val as ProfilePersona)}
          />

          <div>
            <button
              type="button"
              onClick={() => setShowMelMore(!showMelMore)}
              className="flex items-center justify-center gap-1.5 w-full text-xs font-bold text-slate-600 hover:text-slate-900 py-1 transition-colors cursor-pointer"
            >
              <span>{showMelMore ? 'Fewer options' : 'More options'}</span>
              {showMelMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showMelMore && (
              <div className="pt-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-900 tracking-tight">Recipe / Notes</label>
                <textarea
                  value={melNotes}
                  onChange={(e) => setMelNotes(e.target.value)}
                  placeholder="Ingredients or instructions..."
                  rows={2}
                  className="w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all box-border"
                />
              </div>
            )}
          </div>

          <MobileFormAction
            label="Add Meal"
            isSaving={isSaving}
            onCancel={onClose}
          />
        </form>
      )}

      {/* 6. ADD BOOK FORM */}
      {modalType === 'book' && (
        <form onSubmit={handleBokSubmit} className="space-y-4 md:space-y-5 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:gap-4">
            <MobileFormField
              label="Title"
              value={bokTitle}
              onChange={(e) => setBokTitle(e.target.value)}
              placeholder="e.g. Tomorrow, and Tomorrow..."
              required
            />
            <MobileFormField
              label="Author"
              value={bokAuthor}
              onChange={(e) => setBokAuthor(e.target.value)}
              placeholder="Author name"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:gap-4">
            <div className="space-y-1.5 w-full">
              <label className="block text-xs font-bold text-slate-900 tracking-tight">Status</label>
              <div className="grid grid-cols-3 gap-1 w-full box-border">
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
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center px-1 min-h-[48px] ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <MobileFormField
              label="Total Pages"
              type="number"
              value={bokTotalPages}
              onChange={(e) => setBokTotalPages(e.target.value)}
              placeholder="e.g. 384"
            />
          </div>

          <MobileSegmentedControl
            label="For"
            options={profileOptions}
            value={bokProfile}
            onChange={(val) => setBokProfile(val as ProfilePersona)}
          />

          <div>
            <button
              type="button"
              onClick={() => setShowBokMore(!showBokMore)}
              className="flex items-center justify-center gap-1.5 w-full text-xs font-bold text-slate-600 hover:text-slate-900 py-1 transition-colors cursor-pointer"
            >
              <span>{showBokMore ? 'Fewer options' : 'More options'}</span>
              {showBokMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showBokMore && (
              <div className="pt-2">
                <MobileFormField
                  label="Genre"
                  value={bokGenre}
                  onChange={(e) => setBokGenre(e.target.value)}
                  placeholder="e.g. Fiction"
                />
              </div>
            )}
          </div>

          <MobileFormAction
            label={bookToEdit ? 'Save Changes' : 'Add Book'}
            isSaving={isSaving}
            onCancel={onClose}
          />
        </form>
      )}
    </MobileFormSheet>
  );
};
