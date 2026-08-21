import React, { useState } from 'react';
import { useStore, getTodayDateString } from '../../context/StoreContext';
import { BottomSheet } from '../ui/BottomSheet';
import { EventType, ProfilePersona, MealType, BookStatus } from '../../types';

interface CreationModalContainerProps {
  modalType: 'event' | 'class' | 'task' | 'habit' | 'meal' | 'book' | null;
  onClose: () => void;
  initialDate?: string;
  initialMealDay?: number;
  initialMealType?: MealType;
}

export const CreationModalContainer: React.FC<CreationModalContainerProps> = ({
  modalType,
  onClose,
  initialDate,
  initialMealDay,
  initialMealType,
}) => {
  const {
    addEvent,
    addClass,
    addTask,
    addHabit,
    addMealItem,
    addBookItem,
    activeProfile,
  } = useStore();

  const defaultProfile: ProfilePersona = activeProfile === 'Both' ? 'Eve' : activeProfile;

  // Sync initialDate prop into state when passed
  React.useEffect(() => {
    if (initialDate) {
      setEvtDate(initialDate);
    }
  }, [initialDate]);

  // Event Form State
  const [evtTitle, setEvtTitle] = useState('');
  const [evtType, setEvtType] = useState<EventType>('personal');
  const [evtDate, setEvtDate] = useState(initialDate || getTodayDateString());
  const [evtStartTime, setEvtStartTime] = useState('09:00');
  const [evtEndTime, setEvtEndTime] = useState('10:00');
  const [evtLocation, setEvtLocation] = useState('');
  const [evtProfile, setEvtProfile] = useState<ProfilePersona>(defaultProfile);

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

  // Meal Form State
  const [melTitle, setMelTitle] = useState('');
  const [melDay, setMelDay] = useState<number>(initialMealDay || 1);
  const [melType, setMelType] = useState<MealType>(initialMealType || 'lunch');
  const [melNotes, setMelNotes] = useState('');
  const [melProfile, setMelProfile] = useState<ProfilePersona>(defaultProfile);

  // Book Form State
  const [bokTitle, setBokTitle] = useState('');
  const [bokAuthor, setBokAuthor] = useState('');
  const [bokStatus, setBokStatus] = useState<BookStatus>('reading');
  const [bokTotalPages, setBokTotalPages] = useState('');
  const [bokGenre, setBokGenre] = useState('');
  const [bokProfile, setBokProfile] = useState<ProfilePersona>(defaultProfile);

  if (!modalType) return null;

  const handleEvtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle.trim()) return;
    await addEvent({
      title: evtTitle.trim(),
      event_type: evtType,
      event_date: evtDate,
      start_time: evtStartTime,
      end_time: evtEndTime,
      location: evtLocation.trim() || undefined,
      profile: evtProfile,
    });
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
    await addMealItem({
      title: melTitle.trim(),
      day_of_week: melDay,
      meal_type: melType,
      notes: melNotes.trim() || undefined,
      profile: melProfile,
    });
    onClose();
  };

  const handleBokSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bokTitle.trim()) return;
    await addBookItem({
      title: bokTitle.trim(),
      author: bokAuthor.trim() || 'Unknown Author',
      status: bokStatus,
      total_pages: bokTotalPages ? Number(bokTotalPages) : undefined,
      current_page: 0,
      genre: bokGenre.trim() || undefined,
      profile: bokProfile,
    });
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
    <BottomSheet isOpen={Boolean(modalType)} onClose={onClose} title={`Create New ${modalType}`}>
      {/* Event Form */}
      {modalType === 'event' && (
        <form onSubmit={handleEvtSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Event Title</label>
            <input
              type="text"
              required
              value={evtTitle}
              onChange={(e) => setEvtTitle(e.target.value)}
              placeholder="e.g. Study Group Session"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Location / Room (Optional)</label>
            <input
              type="text"
              value={evtLocation}
              onChange={(e) => setEvtLocation(e.target.value)}
              placeholder="e.g. Science Library Room 102"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Profile Owner</label>
            <div className="flex gap-2">
              {(['Eve', 'Abbie', 'Both'] as ProfilePersona[]).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setEvtProfile(p)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    evtProfile === p
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm shadow-md shadow-blue-600/20 transition-all mt-4"
          >
            Save Event
          </button>
        </form>
      )}

      {/* Class Form */}
      {modalType === 'class' && (
        <form onSubmit={handleClsSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Course Name</label>
            <input
              type="text"
              required
              value={clsName}
              onChange={(e) => setClsName(e.target.value)}
              placeholder="e.g. Organic Chemistry II"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Instructor</label>
              <input
                type="text"
                value={clsInstructor}
                onChange={(e) => setClsInstructor(e.target.value)}
                placeholder="Dr. Smith"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Room / Building</label>
              <input
                type="text"
                value={clsRoom}
                onChange={(e) => setClsRoom(e.target.value)}
                placeholder="Hall 104"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                value={clsStartTime}
                onChange={(e) => setClsStartTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                value={clsEndTime}
                onChange={(e) => setClsEndTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Days of Week</label>
            <div className="flex justify-between gap-1">
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
                    className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${
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
                  onClick={() => setClsProfile(p)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    clsProfile === p
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Book Title</label>
            <input
              type="text"
              required
              value={bokTitle}
              onChange={(e) => setBokTitle(e.target.value)}
              placeholder="e.g. Deep Work"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Author</label>
            <input
              type="text"
              value={bokAuthor}
              onChange={(e) => setBokAuthor(e.target.value)}
              placeholder="Cal Newport"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <select
                value={bokStatus}
                onChange={(e) => setBokStatus(e.target.value as BookStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900"
              >
                <option value="reading">Currently Reading</option>
                <option value="want_to_read">Want to Read</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Pages</label>
              <input
                type="number"
                value={bokTotalPages}
                onChange={(e) => setBokTotalPages(e.target.value)}
                placeholder="300"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm shadow-md transition-all mt-4"
          >
            Save Book
          </button>
        </form>
      )}
    </BottomSheet>
  );
};
