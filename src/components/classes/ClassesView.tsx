import React, { useState, useMemo } from 'react';
import { useStore, getTodayDateString, formatTime12Hour } from '../../context/StoreContext';
import { ClassItem } from '../../types';
import { classPersonaColor } from '../../utils/personaColor';
import { Plus, Clock, MapPin, Trash2, Edit3, UserCheck } from 'lucide-react';

interface ClassesViewProps {
  onOpenAddClassModal: (day?: number, classToEdit?: ClassItem) => void;
  onOpenAddExamModal?: () => void;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const CARD = 'bg-white rounded-3xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.045)]';

const formatExamDate = (iso: string) => {
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return d.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' });
};

const getTodayDayNum = () => {
  const d = new Date().getDay();
  if (d === 0 || d === 6) return 1; // Default to Monday if Saturday or Sunday
  return d;
};

interface ClassCardProps {
  cls: ClassItem;
  dayNum?: number;
  ownerName: string;
  ownerColor: string;
  cardColor: string;
  activeProfile: string;
  onEdit: () => void;
  onDelete: () => void;
}

const ClassCardItem: React.FC<ClassCardProps> = ({
  cls,
  ownerName,
  ownerColor,
  cardColor,
  activeProfile,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className="group relative bg-white rounded-2xl p-3.5 border border-slate-200/80 hover:bg-slate-50/60 transition-colors space-y-2.5 overflow-hidden cursor-pointer"
      style={{
        borderColor: `${cardColor}28`,
      }}
      onClick={onEdit}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEdit();
        }
      }}
    >
      {/* Top Accent Line */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: cardColor }}
      />

      {/* Header: Class Name + Action Buttons */}
      <div className="flex items-start justify-between gap-2 pt-0.5">
        <h3 className="font-class-title text-[15px] font-semibold text-slate-900 leading-snug break-words">
          {cls.name}
        </h3>

        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0 text-slate-400">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            title="Edit Class"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
            title="Delete Class"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Time Badge (Matching Class Accent Color) */}
      <div>
        <div
          className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg border tabular-nums"
          style={{
            backgroundColor: `${cardColor}10`,
            color: cardColor,
            borderColor: `${cardColor}25`,
          }}
        >
          <Clock className="w-3 h-3 stroke-[2] shrink-0" style={{ color: cardColor }} />
          <span className="tracking-tight">
            {formatTime12Hour(cls.start_time)} – {formatTime12Hour(cls.end_time)}
          </span>
        </div>
      </div>

      {/* Meta Details: Room & Instructor */}
      {(cls.room || cls.instructor || activeProfile === 'Both') && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1.5 text-[11px] font-normal text-slate-500 border-t border-slate-100">
          {activeProfile === 'Both' && (
            <span
              className="text-[10px] font-semibold text-white px-2 py-0.5 rounded-md shrink-0 shadow-2xs"
              style={{ backgroundColor: ownerColor }}
            >
              {ownerName}
            </span>
          )}
          {cls.room && (
            <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md text-slate-600 border border-slate-200/50">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{cls.room}</span>
            </span>
          )}
          {cls.instructor && (
            <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md text-slate-600 border border-slate-200/50 truncate max-w-[150px]">
              <UserCheck className="w-3 h-3 text-slate-400" />
              <span className="truncate">{cls.instructor}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export const ClassesView: React.FC<ClassesViewProps> = ({ onOpenAddClassModal, onOpenAddExamModal }) => {
  const { classes, events, deleteClass, deleteEvent, filterByProfile, activeProfile, profileColors } = useStore();
  const [selectedMobileDay, setSelectedMobileDay] = useState<number>(getTodayDayNum());

  const todayDayNum = getTodayDayNum();

  const filteredClasses = useMemo(() => {
    return filterByProfile(classes);
  }, [classes, filterByProfile]);

  const officeHoursClasses = useMemo(
    () => [...filteredClasses].sort((a, b) => a.name.localeCompare(b.name)),
    [filteredClasses]
  );

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
    <div className="min-h-screen bg-[#faf9f6] text-slate-800 space-y-6 max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 pb-28">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 font-class-title">Classes</h1>
        </div>
        <button
          onClick={() => onOpenAddClassModal(selectedMobileDay)}
          className="px-4 min-h-[40px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 self-start sm:self-auto"
          title="Add Class"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add class</span>
        </button>
      </div>

      {/* MOBILE ONLY (< sm): Mon–Fri Day Selector Bar & Single Day List */}
      <div className="sm:hidden space-y-4">
        {/* Day Selector Bar — Mon–Fri */}
        <div className="grid grid-cols-5 gap-1.5">
          {DAY_NAMES.map((name, idx) => {
            const dayNum = idx + 1;
            const isSelected = selectedMobileDay === dayNum;
            const count = (classesByDay.get(dayNum) || []).length;

            return (
              <button
                key={dayNum}
                onClick={() => setSelectedMobileDay(dayNum)}
                className={`flex flex-col items-center justify-center min-h-[48px] px-1 py-1.5 rounded-2xl text-xs font-semibold transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white'
                    : dayNum === todayDayNum
                    ? 'bg-white text-slate-900 ring-2 ring-slate-900 ring-inset'
                    : 'text-slate-600 bg-white border border-slate-200/80'
                }`}
              >
                <span>{name}</span>
                {count > 0 && (
                  <span className={`text-[10px] font-medium tabular-nums ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Day's Class Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-semibold text-slate-900 tracking-tight font-class-title">
              {DAY_NAMES[(selectedMobileDay > 0 ? selectedMobileDay : 1) - 1]}
            </h2>
            <span className="text-xs font-medium text-slate-500">
              {selectedMobileClasses.length} {selectedMobileClasses.length === 1 ? 'class' : 'classes'}
            </span>
          </div>

          {selectedMobileClasses.length === 0 ? (
            <div className={`${CARD} p-8 text-center`}>
              <p className="text-sm font-medium text-slate-500">No classes this day</p>
              <button
                onClick={() => onOpenAddClassModal(selectedMobileDay > 0 ? selectedMobileDay : 1)}
                className="mt-4 inline-flex items-center justify-center min-h-[40px] px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors cursor-pointer gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" /> Add class
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedMobileClasses.map((cls) => {
                const ownerName = cls.profile || 'Eve';
                const ownerColor = profileColors[ownerName] || cls.color || '#2563eb';
                const cardColor = classPersonaColor(cls.profile, activeProfile, profileColors, cls.color);

                return (
                  <ClassCardItem
                    key={cls.id}
                    cls={cls}
                    dayNum={selectedMobileDay}
                    ownerName={ownerName}
                    ownerColor={ownerColor}
                    cardColor={cardColor}
                    activeProfile={activeProfile}
                    onEdit={() => onOpenAddClassModal(selectedMobileDay, cls)}
                    onDelete={() => deleteClass(cls.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* COMPUTER ONLY (>= sm): Refined 5-Column Weekly Planner */}
      <div className="hidden sm:block space-y-4">
        <div className="grid grid-cols-5 gap-3 items-start">
          {DAY_NAMES.slice(0, 5).map((name, idx) => {
            const dayNum = idx + 1;
            const dayClasses = classesByDay.get(dayNum) || [];
            const isToday = dayNum === todayDayNum;

            return (
              <div
                key={dayNum}
                className={`rounded-2xl border flex flex-col p-3 min-h-[180px] ${
                  isToday
                    ? 'bg-white border-transparent ring-2 ring-slate-900 ring-inset'
                    : 'bg-white border-slate-200/80'
                }`}
              >
                {/* Simplified Day Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-900 tracking-wide uppercase">{name}</span>
                    {isToday && (
                      <span className="text-[10px] font-semibold text-white bg-slate-900 px-1.5 py-0.5 rounded-full">
                        Today
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onOpenAddClassModal(dayNum)}
                    className="flex items-center justify-center min-h-[32px] min-w-[32px] rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                    title={`Add class to ${name}`}
                    aria-label={`Add class to ${name}`}
                  >
                    <Plus className="w-4 h-4 stroke-[2]" />
                  </button>
                </div>

                {/* Class List or Compact Empty State */}
                <div className="space-y-2.5">
                  {dayClasses.length === 0 ? (
                    <div className="py-8 text-center">
                      <span className="text-xs font-medium text-slate-400">Free</span>
                    </div>
                  ) : (
                    dayClasses.map((cls) => {
                      const ownerName = cls.profile || 'Eve';
                      const ownerColor = profileColors[ownerName] || cls.color || '#2563eb';
                      const cardColor = classPersonaColor(cls.profile, activeProfile, profileColors, cls.color);

                      return (
                        <ClassCardItem
                          key={cls.id}
                          cls={cls}
                          dayNum={dayNum}
                          ownerName={ownerName}
                          ownerColor={ownerColor}
                          cardColor={cardColor}
                          activeProfile={activeProfile}
                          onEdit={() => onOpenAddClassModal(dayNum, cls)}
                          onDelete={() => deleteClass(cls.id)}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* UPCOMING EXAMS SECTION */}
      <div className={`${CARD} p-4 sm:p-6 space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 font-class-title">Exams</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onOpenAddExamModal && (
              <button
                onClick={onOpenAddExamModal}
                className="inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3.5 min-h-[40px] rounded-xl text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add exam</span>
              </button>
            )}
          </div>
        </div>

        {filteredExams.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm font-medium text-slate-500">No upcoming exams</p>
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
                  className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2 relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-medium text-slate-600 tabular-nums">
                        {formatExamDate(exam.event_date)}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        diffDays <= 1 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
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
                        className="flex items-center justify-center min-h-[36px] min-w-[36px] text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete exam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 break-words">{exam.title}</h4>

                  <div className="flex items-center gap-3 text-xs font-medium text-slate-500 pt-1 flex-wrap">
                    {exam.start_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
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

      {/* PROFESSOR OFFICE HOURS SCHEDULE SECTION */}
      <div className={`${CARD} p-4 sm:p-6 space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 font-class-title">Office hours</h2>
        </div>

        {officeHoursClasses.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-sm font-medium text-slate-500">Add a class and it will show up here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {officeHoursClasses.map((cls) => {
              const ownerName = cls.profile || 'Eve';
              const ownerColor = profileColors[ownerName] || cls.color || '#2563eb';
              const cardColor = classPersonaColor(cls.profile, activeProfile, profileColors, cls.color);
              const hasHours = Boolean(cls.office_hours);

              return (
                <div
                  key={cls.id}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:bg-slate-50/70 transition-colors space-y-2.5 relative group cursor-pointer"
                  style={{ borderLeft: `3px solid ${cardColor}` }}
                  onClick={() => onOpenAddClassModal(cls.days_of_week[0] || 1, cls)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpenAddClassModal(cls.days_of_week[0] || 1, cls);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 leading-snug break-words">{cls.name}</h4>
                      {cls.instructor ? (
                        <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>{cls.instructor}</span>
                        </p>
                      ) : (
                        <p className="text-xs font-medium text-slate-400 italic">No instructor specified</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {activeProfile === 'Both' && (
                        <span
                          className="text-[10px] font-bold text-white px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: ownerColor }}
                        >
                          {ownerName}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAddClassModal(cls.days_of_week[0] || 1, cls);
                        }}
                        className="flex items-center justify-center min-h-[36px] min-w-[36px] text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                        title="Edit Office Hours"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {hasHours ? (
                    <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-medium">
                          {cls.office_hours}
                        </span>
                      </div>
                      {cls.office_hours_location && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{cls.office_hours_location}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">No office hours set</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAddClassModal(cls.days_of_week[0] || 1, cls);
                        }}
                        className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        + Set Hours
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
