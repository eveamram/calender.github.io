import React, { useState, useMemo } from 'react';
import { useStore, getTodayDateString, formatTime12Hour } from '../../context/StoreContext';
import { ClassItem } from '../../types';
import { Plus, BookOpen, Clock, MapPin, User, Trash2, Edit3, AlertCircle } from 'lucide-react';

interface ClassesViewProps {
  onOpenAddClassModal: (day?: number, classToEdit?: ClassItem) => void;
  onOpenAddExamModal?: () => void;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const getTodayDayNum = () => {
  const d = new Date().getDay();
  if (d === 0 || d === 6) return 1; // Default to Monday if today is Saturday or Sunday
  return d;
};

export const ClassesView: React.FC<ClassesViewProps> = ({ onOpenAddClassModal, onOpenAddExamModal }) => {
  const { classes, events, deleteClass, deleteEvent, filterByProfile, activeProfile, profileColors } = useStore();
  const [selectedMobileDay, setSelectedMobileDay] = useState<number>(getTodayDayNum()); // 1 = Mon, ..., 5 = Fri

  const filteredClasses = useMemo(() => {
    return filterByProfile(classes);
  }, [classes, filterByProfile]);

  const filteredExams = useMemo(() => {
    const today = getTodayDateString();
    const allExams = events.filter((e) => e.event_type === 'exam' && e.event_date >= today);
    const result = filterByProfile(allExams);
    return [...result].sort((a, b) => a.event_date.localeCompare(b.event_date));
  }, [events, filterByProfile]);

  // Map classes by day of week (1=Mon ... 5=Fri)
  const classesByDay = useMemo(() => {
    const map = new Map<number, ClassItem[]>();
    for (let i = 1; i <= 5; i++) map.set(i, []);

    filteredClasses.forEach((cls) => {
      cls.days_of_week.forEach((dayNum) => {
        if (dayNum >= 1 && dayNum <= 5 && map.has(dayNum)) {
          map.get(dayNum)!.push(cls);
        }
      });
    });

    map.forEach((list) => {
      list.sort((a, b) => a.start_time.localeCompare(b.start_time));
    });

    return map;
  }, [filteredClasses]);

  const selectedMobileClasses = classesByDay.get(selectedMobileDay) || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-8 py-6">
      {/* View Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Class Schedule</h1>
          <p className="text-xs text-slate-500 font-medium">Academic courses timetable and exam tracker</p>
        </div>
        <button
          onClick={() => onOpenAddClassModal(selectedMobileDay)}
          className="p-2 sm:px-4 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
          title="Add Class"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Add Class</span>
        </button>
      </div>

      {/* MOBILE LAYOUT: Horizontal 5-Day Selector + Vertical Day Schedule */}
      <div className="lg:hidden space-y-4">
        {/* Day Selector Bar — 5 equal skinny columns that fit the screen */}
        <div className="grid grid-cols-5 gap-1.5 pb-1">
          {DAY_NAMES.map((name, idx) => {
            const dayNum = idx + 1;
            const isSelected = selectedMobileDay === dayNum;
            const count = (classesByDay.get(dayNum) || []).length;

            return (
              <button
                key={dayNum}
                onClick={() => setSelectedMobileDay(dayNum)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs scale-[1.02]'
                    : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs font-black">{name}</span>
                <span
                  className={`text-[10px] mt-0.5 font-semibold ${
                    isSelected ? 'text-blue-100' : 'text-slate-400'
                  }`}
                >
                  {count} {count === 1 ? 'class' : 'cls'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Day's Class Cards */}
        {selectedMobileClasses.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
            <p className="text-sm font-medium text-slate-500">No classes scheduled for {DAY_NAMES[selectedMobileDay - 1]}</p>
            <button
              onClick={() => onOpenAddClassModal(selectedMobileDay)}
              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              + Add a new class
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedMobileClasses.map((cls) => {
              const ownerName = cls.profile || 'Eve';
              const badgeColor = profileColors[ownerName] || '#2563eb';
              const cardColor = profileColors[ownerName] || badgeColor;

              return (
                <div
                  key={cls.id}
                  className="bg-white rounded-2xl p-4 border-l-4 border border-slate-200/80 shadow-xs space-y-2.5 relative group hover:shadow-md transition-all"
                  style={{
                    borderLeftColor: cardColor,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-xs font-semibold text-white px-2.5 py-0.5 rounded-lg shadow-2xs"
                          style={{ backgroundColor: cardColor }}
                        >
                          {formatTime12Hour(cls.start_time)} - {formatTime12Hour(cls.end_time)}
                        </span>
                        <h3 className="text-base font-semibold text-slate-900 tracking-tight break-words">{cls.name}</h3>
                        {activeProfile === 'Both' && (
                          <span
                            className="text-[10px] font-bold text-white px-2 py-0.5 rounded-md shrink-0"
                            style={{ backgroundColor: badgeColor }}
                          >
                            {ownerName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onOpenAddClassModal(selectedMobileDay, cls)}
                        className="text-slate-400 hover:text-blue-600 p-1 transition-colors cursor-pointer"
                        title="Edit Class"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteClass(cls.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        title="Delete Class"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {(cls.room || cls.instructor) && (
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700 pt-0.5">
                      {cls.room && (
                        <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-xl break-words">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          {cls.room}
                        </span>
                      )}

                      {cls.instructor && (
                        <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-xl break-words">
                          <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          {cls.instructor}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DESKTOP LAYOUT: Clean Mon–Fri Weekly Timetable */}
      <div className="hidden lg:grid grid-cols-5 gap-2.5">
        {DAY_NAMES.slice(0, 5).map((name, idx) => {
          const dayNum = idx + 1;
          const dayClasses = classesByDay.get(dayNum) || [];

          return (
            <div
              key={dayNum}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden min-h-[380px]"
            >
              <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-3 text-center flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900">{name}</span>
                  <span className="block text-[11px] font-semibold text-slate-400">
                    {dayClasses.length} {dayClasses.length === 1 ? 'class' : 'classes'}
                  </span>
                </div>
                <button
                  onClick={() => onOpenAddClassModal(dayNum)}
                  className="w-6 h-6 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-all cursor-pointer"
                  title={`Add class to ${name}`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>

              <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                {dayClasses.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium py-10">
                    No classes
                  </div>
                ) : (
                  dayClasses.map((cls) => {
                    const ownerName = cls.profile || 'Eve';
                    const badgeColor = profileColors[ownerName] || '#2563eb';
                    const cardColor = profileColors[ownerName] || badgeColor;

                    return (
                      <div
                        key={cls.id}
                        className="p-3.5 rounded-2xl border-l-4 border border-slate-200/80 shadow-xs transition-all space-y-2 relative group hover:shadow-md"
                        style={{
                          borderLeftColor: cardColor,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-[11px] font-medium text-white px-2 py-0.5 rounded-md shadow-2xs"
                            style={{ backgroundColor: cardColor }}
                          >
                            {formatTime12Hour(cls.start_time)}
                          </span>

                          <div className="flex items-center gap-1">
                            {activeProfile === 'Both' && (
                              <span
                                className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-md"
                                style={{ backgroundColor: badgeColor }}
                              >
                                {ownerName}
                              </span>
                            )}
                            <button
                              onClick={() => onOpenAddClassModal(dayNum, cls)}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity cursor-pointer p-0.5"
                              title="Edit Class"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteClass(cls.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity cursor-pointer p-0.5"
                              title="Delete Class"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h4 className="text-sm font-semibold text-slate-900 tracking-tight break-words">{cls.name}</h4>

                        <div className="text-[11px] font-semibold text-slate-600 space-y-1">
                          {cls.room && <div className="break-words flex items-center gap-1">📍 {cls.room}</div>}
                          {cls.instructor && <div className="break-words flex items-center gap-1">👤 {cls.instructor}</div>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* UPCOMING EXAMS SECTION */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <AlertCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Upcoming Exams</h2>
              <p className="text-xs text-slate-500 font-medium">Scheduled tests and midterm examinations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
              {filteredExams.length} {filteredExams.length === 1 ? 'Exam' : 'Exams'}
            </span>
            {onOpenAddExamModal && (
              <button
                onClick={onOpenAddExamModal}
                className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white font-black px-3.5 py-2 rounded-xl text-xs shadow-md shadow-red-500/20 transition-all cursor-pointer active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Exam</span>
              </button>
            )}
          </div>
        </div>

        {filteredExams.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 font-medium">
            No upcoming exams scheduled. Great job staying ahead!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredExams.map((exam) => {
              const ownerName = exam.profile || 'Eve';
              const badgeColor = profileColors[ownerName] || '#2563eb';

              // Calculate Days Remaining
              const todayObj = new Date();
              todayObj.setHours(0, 0, 0, 0);
              const examDateObj = new Date(exam.event_date + 'T00:00:00');
              const diffTime = examDateObj.getTime() - todayObj.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              let countdownLabel = `In ${diffDays} days`;
              if (diffDays === 0) countdownLabel = 'Today!';
              else if (diffDays === 1) countdownLabel = 'Tomorrow';

              return (
                <div
                  key={exam.id}
                  className="p-4 rounded-xl border border-red-100 bg-red-50/30 hover:bg-red-50/60 transition-all space-y-2 relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-extrabold text-red-600 bg-red-100 px-2.5 py-0.5 rounded-md">
                        {exam.event_date}
                      </span>
                      <span className="text-[10px] font-black text-white bg-red-500 px-2 py-0.5 rounded-md shadow-xs animate-pulse">
                        {countdownLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeProfile === 'Both' && (
                        <span
                          className="text-[10px] font-bold text-white px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: badgeColor }}
                        >
                          {ownerName}
                        </span>
                      )}
                      <button
                        onClick={() => deleteEvent(exam.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-900">{exam.title}</h4>

                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 pt-1">
                    {exam.start_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-red-500" />
                        {formatTime12Hour(exam.start_time)} {exam.end_time ? `- ${formatTime12Hour(exam.end_time)}` : ''}
                      </span>
                    )}
                    {exam.location && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {exam.location}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
