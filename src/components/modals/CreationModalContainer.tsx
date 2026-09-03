import React, { useState, useEffect } from 'react';
import { useStore, getTodayDateString } from '../../context/StoreContext';
import {
  EventType,
  ProfilePersona,
  BookStatus,
  CalendarEvent,
  ClassItem,
  BookItem,
  HabitItem,
  HabitTrackingMode,
  CATEGORY_METAS,
} from '../../types';
import {
  parseOfficeHourSlots,
  serializeOfficeHourSlots,
  hiddenOfficeHoursPayload,
  OfficeHourSlot,
} from '../../utils/officeHours';
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
  Plus,
  Minus,
  Trash2,
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
  modalType: 'event' | 'class' | 'task' | 'habit' | 'book' | null;
  onClose: () => void;
  initialDate?: string;
  initialEventType?: EventType;
  eventToEdit?: CalendarEvent | null;
  classToEdit?: ClassItem | null;
  bookToEdit?: BookItem | null;
  habitToEdit?: HabitItem | null;
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
  const [showBokMore, setShowBokMore] = useState(false);

  // 1. EVENT FORM STATE
  const [evtTitle, setEvtTitle] = useState('');
  const [evtType, setEvtType] = useState<EventType>(initialEventType || 'personal');
  const [evtDate, setEvtDate] = useState(initialDate || getTodayDateString());
  const [evtStartTime, setEvtStartTime] = useState('09:00');
  const [evtEndTime, setEvtEndTime] = useState('10:00');
  const [evtAllDay, setEvtAllDay] = useState(false);
  const [evtLocation, setEvtLocation] = useState('');
  const [evtColor, setEvtColor] = useState('');
  const [evtProfile, setEvtProfile] = useState<ProfilePersona>(defaultProfile);
  const [evtRepeat, setEvtRepeat] = useState<'none' | 'daily' | 'weekly'>('none');
  const [evtRepeatDays, setEvtRepeatDays] = useState<number[]>([]);

  useEffect(() => {
    if (modalType === 'event') {
      setIsSaving(false);
      setErrorMsg(null);
      setShowEvtMore(false);
      if (eventToEdit) {
        setEvtTitle(eventToEdit.title);
        setEvtType((eventToEdit.event_type as EventType) || initialEventType || 'personal');
        setEvtDate(eventToEdit.event_date);
        const start = (eventToEdit.start_time || '').trim();
        const end = (eventToEdit.end_time || '').trim();
        const isAllDay = !start || start.toLowerCase() === 'all day' || start.toLowerCase() === 'all-day';
        setEvtAllDay(isAllDay);
        setEvtStartTime(isAllDay ? '09:00' : start);
        setEvtEndTime(isAllDay ? '10:00' : end);
        setEvtLocation(eventToEdit.location || '');
        setEvtColor(eventToEdit.color || (eventToEdit.event_type === 'exam' ? CATEGORY_METAS.exam.color : DEFAULT_COLOR_SWATCHES[0].hex));
        setEvtProfile(eventToEdit.profile || defaultProfile);
        setEvtRepeat(eventToEdit.repeat === 'daily' || eventToEdit.repeat === 'weekly' ? eventToEdit.repeat : 'none');
        const jsDay = new Date(`${eventToEdit.event_date}T00:00:00`).getDay();
        const startDay = jsDay === 0 ? 7 : jsDay;
        setEvtRepeatDays(
          eventToEdit.repeat_days && eventToEdit.repeat_days.length > 0 ? eventToEdit.repeat_days : [startDay]
        );
      } else {
        setEvtDate(initialDate || getTodayDateString());
        setEvtTitle('');
        setEvtType(initialEventType || 'personal');
        setEvtLocation('');
        setEvtColor(initialEventType === 'exam' ? CATEGORY_METAS.exam.color : DEFAULT_COLOR_SWATCHES[0].hex);
        setEvtStartTime('09:00');
        setEvtEndTime('10:00');
        setEvtAllDay(false);
        setEvtProfile(defaultProfile);
        setEvtRepeat('none');
        const jsDay = new Date(`${(initialDate || getTodayDateString())}T00:00:00`).getDay();
        setEvtRepeatDays([jsDay === 0 ? 7 : jsDay]);
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
  const [clsOfficeSlots, setClsOfficeSlots] = useState<OfficeHourSlot[]>([]);

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
        setClsOfficeSlots(parseOfficeHourSlots(classToEdit.office_hours, classToEdit.office_hours_location));
        setShowClsMore(Boolean(classToEdit.room || classToEdit.instructor));
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
        setClsOfficeSlots([]);
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
  const [hbtTrackingMode, setHbtTrackingMode] = useState<HabitTrackingMode>('week');

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
        setHbtColor(habitToEdit.color || DEFAULT_COLOR_SWATCHES[0].hex);
        setHbtTrackingMode(habitToEdit.tracking_mode === 'number' || habitToEdit.target_unit === 'times' ? 'number' : 'week');
      } else {
        setHbtTitle('');
        setHbtEmoji('⚡');
        setHbtQty('');
        setHbtDays([1, 2, 3, 4, 5, 6, 7]);
        setHbtProfile(defaultProfile);
        setHbtShowInDailySchedule(true);
        setHbtColor(DEFAULT_COLOR_SWATCHES[0].hex);
        setHbtTrackingMode('week');
      }
    }
  }, [modalType, habitToEdit, defaultProfile]);



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

  useEffect(() => {
    if (!modalType) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalType, onClose]);

  if (!modalType) return null;

  // Day of Week Segmented Control
  const renderDaySelector = (
    selectedDays: number[],
    toggleDay: (n: number) => void,
    showWeekends = true,
    activeColor?: string,
    labelText?: string
  ) => {
    const days = showWeekends ? WEEK_DAYS : WEEK_DAYS.slice(0, 5);
    return (
      <div className="space-y-1.5 w-full">
        <label className="block text-xs font-bold text-slate-900 tracking-tight">
          {labelText || (showWeekends ? 'Active Days' : 'Days')}
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
      const finalColor = evtColor || (evtType === 'exam' ? CATEGORY_METAS.exam.color : undefined);
      const startTime = evtAllDay ? 'all day' : evtStartTime.trim();
      const endTime = evtAllDay ? '' : evtEndTime.trim();
      let ok = false;
      if (eventToEdit) {
        ok = await updateEvent(eventToEdit.id, {
          title: evtTitle.trim(),
          event_type: evtType,
          event_date: evtDate,
          start_time: startTime,
          end_time: endTime,
          location: evtLocation.trim() || undefined,
          color: finalColor,
          profile: evtProfile,
          repeat: evtRepeat,
          repeat_days: evtRepeat === 'weekly' ? (evtRepeatDays.length ? evtRepeatDays : undefined) : [],
        });
      } else {
        ok = await addEvent({
          title: evtTitle.trim(),
          event_type: evtType,
          event_date: evtDate,
          start_time: startTime || undefined,
          end_time: endTime || undefined,
          location: evtLocation.trim() || undefined,
          color: finalColor,
          profile: evtProfile,
          repeat: evtRepeat,
          repeat_days: evtRepeat === 'weekly' ? (evtRepeatDays.length ? evtRepeatDays : undefined) : [],
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
          ...serializeOfficeHourSlots(clsOfficeSlots),
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
          ...serializeOfficeHourSlots(clsOfficeSlots),
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
          target_quantity: hbtTrackingMode === 'number' ? (hbtQty ? Number(hbtQty) : 1) : (hbtQty ? Number(hbtQty) : undefined),
          target_unit: hbtTrackingMode === 'number' ? 'times' : '',
          active_days: hbtDays,
          profile: hbtProfile,
          color: hbtColor,
          show_in_daily_schedule: hbtShowInDailySchedule,
          tracking_mode: hbtTrackingMode,
        });
      } else {
        ok = await addHabit({
          title: hbtTitle.trim(),
          emoji: hbtEmoji.trim() || '⚡',
          target_quantity: hbtTrackingMode === 'number' ? (hbtQty ? Number(hbtQty) : 1) : (hbtQty ? Number(hbtQty) : undefined),
          target_unit: hbtTrackingMode === 'number' ? 'times' : '',
          active_days: hbtDays,
          profile: hbtProfile,
          color: hbtColor,
          show_in_daily_schedule: hbtShowInDailySchedule,
          tracking_mode: hbtTrackingMode,
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

          <div className="space-y-1.5 w-full">
            <label className={`block text-xs font-semibold tracking-tight ${isExamModal ? 'text-red-800' : 'text-slate-700'}`}>
              Time
            </label>
            <div className="grid grid-cols-2 bg-slate-100/90 p-1.5 rounded-2xl gap-1 items-center border border-slate-200/50 w-full">
              <button
                type="button"
                onClick={() => setEvtAllDay(false)}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[38px] ${
                  !evtAllDay ? 'bg-[#0f172a] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/50'
                }`}
              >
                Has times
              </button>
              <button
                type="button"
                onClick={() => setEvtAllDay(true)}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[38px] ${
                  evtAllDay ? 'bg-[#0f172a] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/50'
                }`}
              >
                All day
              </button>
            </div>
          </div>

          {!evtAllDay && (
            <div className="space-y-2">
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
                  displayValue={evtEndTime ? formatTimeDisplay(evtEndTime) : 'Not sure'}
                  value={evtEndTime}
                  onChange={(e) => setEvtEndTime(e.target.value)}
                  isRed={isExamModal}
                />
              </div>
              <button
                type="button"
                onClick={() => setEvtEndTime('')}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Clear end time — I don&apos;t know when it ends
              </button>
            </div>
          )}
          {evtAllDay && (
            <p className="text-[11px] font-medium text-slate-500 -mt-2">
              This event sits in All day at the top of the schedule, with no start or end time.
            </p>
          )}

          <div className="space-y-1.5 w-full">
            <label className={`block text-xs font-semibold tracking-tight ${isExamModal ? 'text-red-800' : 'text-slate-700'}`}>
              Repeat
            </label>
            <div className="grid grid-cols-3 bg-slate-100/90 p-1.5 rounded-2xl gap-1 items-center border border-slate-200/50 w-full">
              {([
                { id: 'none', label: 'Never' },
                { id: 'daily', label: 'Every day' },
                { id: 'weekly', label: 'Every week' },
              ] as const).map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => {
                    setEvtRepeat(opt.id);
                    if (opt.id === 'weekly' && evtRepeatDays.length === 0) {
                      const jsDay = new Date(`${evtDate}T00:00:00`).getDay();
                      setEvtRepeatDays([jsDay === 0 ? 7 : jsDay]);
                    }
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[38px] ${
                    evtRepeat === opt.id ? 'bg-[#0f172a] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {evtRepeat === 'weekly' && (
              <div className="pt-1">
                {renderDaySelector(
                  evtRepeatDays,
                  (n) =>
                    setEvtRepeatDays((prev) => {
                      const next = prev.includes(n) ? prev.filter((d) => d !== n) : [...prev, n];
                      return next.length > 0 ? next : prev;
                    }),
                  true,
                  undefined,
                  'Repeats on'
                )}
                <p className="text-[11px] font-medium text-slate-500 mt-1.5">
                  Pick every weekday this should show. You can choose more than one.
                </p>
              </div>
            )}
            {evtRepeat === 'daily' && (
              <p className="text-[11px] font-medium text-slate-500">
                Shows up every day starting from the date above.
              </p>
            )}
          </div>

          {/* Color & Persona */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:gap-4 items-start">
            <MobileColorGrid
              selectedColor={evtColor}
              onSelectColor={(hex) => setEvtColor(hex)}
            />
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
          <div className="sticky bottom-0 z-10 bg-white pt-2">
          <MobileFormAction
            label={eventToEdit ? (isExamModal ? 'Save Exam' : 'Save Changes') : (isExamModal ? 'Add Exam' : 'Add Event')}
            isSaving={isSaving}
            isRed={isExamModal}
            onCancel={onClose}
          />
          </div>
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

          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-600">Office hours</span>
              <button
                type="button"
                onClick={() =>
                  setClsOfficeSlots((prev) => [
                    ...prev,
                    { time: '', location: prev[prev.length - 1]?.location || clsRoom || '' },
                  ])
                }
                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg cursor-pointer border border-indigo-200/60"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                Add time
              </button>
            </div>
            {clsOfficeSlots.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium">No office hours yet. Add as many times as you need.</p>
            ) : (
              <div className="space-y-2.5">
                {clsOfficeSlots.map((slot, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-end">
                    <MobileFormField
                      label={clsOfficeSlots.length > 1 ? `Time ${index + 1}` : 'Time'}
                      value={slot.time}
                      onChange={(e) =>
                        setClsOfficeSlots((prev) =>
                          prev.map((row, i) => (i === index ? { ...row, time: e.target.value } : row))
                        )
                      }
                      placeholder="e.g. Mon 2:00 – 4:00 PM"
                    />
                    <MobileFormField
                      label={clsOfficeSlots.length > 1 ? `Room ${index + 1}` : 'Room'}
                      value={slot.location}
                      onChange={(e) =>
                        setClsOfficeSlots((prev) =>
                          prev.map((row, i) => (i === index ? { ...row, location: e.target.value } : row))
                        )
                      }
                      placeholder="e.g. Science 304"
                    />
                    <button
                      type="button"
                      onClick={() => setClsOfficeSlots((prev) => prev.filter((_, i) => i !== index))}
                      className="flex items-center justify-center min-h-[44px] min-w-[44px] text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove this time"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              </div>
            )}
          </div>

          {classToEdit && clsOfficeSlots.some((slot) => slot.time.trim() || slot.location.trim()) && (
            <button
              type="button"
              onClick={async () => {
                if (isSaving) return;
                setIsSaving(true);
                setErrorMsg(null);
                try {
                  const ok = await updateClass(classToEdit.id, hiddenOfficeHoursPayload());
                  if (ok) onClose();
                  else setErrorMsg('Could not remove office hours. Please try again.');
                } catch (err: any) {
                  setErrorMsg(err?.message || 'Save failed.');
                } finally {
                  setIsSaving(false);
                }
              }}
              className="w-full text-sm font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 min-h-[40px] rounded-xl transition-colors cursor-pointer"
            >
              Remove office hours
            </button>
          )}

          <div className="sticky bottom-0 z-10 bg-white pt-2">
          <MobileFormAction
            label={classToEdit ? 'Save Changes' : 'Add Class'}
            isSaving={isSaving}
            onCancel={onClose}
          />
          </div>
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
                onKeyDown={(e) => { if (e.key === ' ') e.stopPropagation(); }}
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

          <div className="space-y-1.5 w-full">
            <label className="block text-xs font-bold text-slate-900 tracking-tight">How do you track this?</label>
            <div className="grid grid-cols-2 bg-slate-100/90 p-1.5 rounded-2xl gap-1 items-center border border-slate-200/50 w-full">
              <button
                type="button"
                onClick={() => setHbtTrackingMode('week')}
                className={`py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer min-h-[42px] ${
                  hbtTrackingMode === 'week' ? 'bg-[#0f172a] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/50'
                }`}
              >
                Day grid
              </button>
              <button
                type="button"
                onClick={() => {
                  setHbtTrackingMode('number');
                  if (!hbtQty) setHbtQty('1');
                }}
                className={`py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer min-h-[42px] ${
                  hbtTrackingMode === 'number' ? 'bg-[#0f172a] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/50'
                }`}
              >
                Numbers
              </button>
            </div>
            <p className="text-[11px] font-medium text-slate-500">
              {hbtTrackingMode === 'number'
                ? 'Only a daily count with + and −. No weekday boxes.'
                : 'Check off days on a Mon–Sun grid.'}
            </p>
          </div>

          {hbtTrackingMode === 'week' && renderDaySelector(
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

          {hbtTrackingMode === 'number' && (
            <div className="space-y-1.5 w-full">
              <label className="block text-xs font-bold text-slate-900 tracking-tight">Times per day</label>
              <div className="flex items-center justify-between bg-slate-50/80 border border-slate-200/80 rounded-2xl px-3 py-2">
                <span className="text-xs font-medium text-slate-500">Daily goal</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={Number(hbtQty || '1') <= 1}
                    onClick={() => setHbtQty(String(Math.max(1, Number(hbtQty || '1') - 1)))}
                    className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center cursor-pointer disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  <span className="min-w-[2.5rem] text-center text-xl font-black tabular-nums text-slate-900">
                    {hbtQty || '1'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setHbtQty(String(Math.min(99, Number(hbtQty || '1') + 1)))}
                    className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="sticky bottom-0 z-10 bg-white pt-2">
          <MobileFormAction
            label={habitToEdit ? 'Save Habit' : 'Add Habit'}
            isSaving={isSaving}
            onCancel={onClose}
          />
          </div>
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

          <div className="sticky bottom-0 z-10 bg-white pt-2">
          <MobileFormAction
            label="Add Task"
            isSaving={isSaving}
            onCancel={onClose}
          />
          </div>
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

          <div className="sticky bottom-0 z-10 bg-white pt-2">
          <MobileFormAction
            label={bookToEdit ? 'Save Changes' : 'Add Book'}
            isSaving={isSaving}
            onCancel={onClose}
          />
          </div>
        </form>
      )}
    </MobileFormSheet>
  );
};
