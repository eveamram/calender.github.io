import React, { useState } from 'react';
import { CalendarEvent } from '../../types/event';
import { GraduationCap, Plus, Clock, MapPin, User, Calendar as CalendarIcon, FileText, AlertCircle } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useEvents } from '../../hooks/useEvents';

interface WeeklyClassScheduleViewProps {
  events?: CalendarEvent[];
  onSelectEvent?: (event: CalendarEvent) => void;
  onOpenAddEvent?: () => void;
}

export const WeeklyClassScheduleView: React.FC<WeeklyClassScheduleViewProps> = ({
  events: propEvents,
  onSelectEvent,
  onOpenAddEvent,
}) => {
  const isMobile = useIsMobile();
  const hookEvents = useEvents();
  const allEvents = propEvents || hookEvents.events || [];
  const [selectedMobileDayIdx, setSelectedMobileDayIdx] = useState<number>(0); // 0 = Mon, 1 = Tue...

  // Filter strictly for class events
  const classEvents = allEvents.filter(
    (e) => e.event_type === 'class' || e.event_type === 'School' || e.category === 'Work'
  );

  // Filter exam events (by category, event_type, or title keyword like Exam, Quiz, Test, Midterm, Final)
  const examEvents = allEvents.filter(
    (e) =>
      e.category === 'Exam' ||
      e.event_type === 'exam' ||
      e.event_type === 'Exam' ||
      /exam|quiz|test|midterm|final/i.test(e.title || '')
  );

  examEvents.sort((a, b) => {
    const dateA = a.start || a.event_date || a.due_date || '';
    const dateB = b.start || b.event_date || b.due_date || '';
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    const timeA = a.start_time || (a.start ? a.start.slice(11, 16) : '00:00');
    const timeB = b.start_time || (b.start ? b.start.slice(11, 16) : '00:00');
    return timeA.localeCompare(timeB);
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    const clean = dateStr.slice(0, 10);
    try {
      const parts = clean.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch {
      /* ignore */
    }
    return clean;
  };

  const formatTimeDisplay = (evt: CalendarEvent) => {
    if (evt.start_time) {
      return `${evt.start_time}${evt.end_time ? ` – ${evt.end_time}` : ''}`;
    }
    if (evt.start && evt.start.length >= 16) {
      return `${evt.start.slice(11, 16)}${evt.end && evt.end.length >= 16 ? ` – ${evt.end.slice(11, 16)}` : ''}`;
    }
    return 'All Day';
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ========================================================================= */}
      {/* CLASS SCHEDULE SECTION                                                   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Class Schedule</h2>
              <p className="text-xs text-slate-500 font-medium">Weekly class timetable & recurring courses</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenAddEvent}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" /> Add Class
          </button>
        </div>

        {/* Responsive Grid / Mobile Tabs */}
        {isMobile ? (
          <div>
            <div className="flex gap-1 overflow-x-auto bg-slate-100 p-1 rounded-xl mb-4">
              {shortDays.map((d, idx) => (
                <button
                  key={d}
                  onClick={() => setSelectedMobileDayIdx(idx)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    selectedMobileDayIdx === idx ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {classEvents.filter((c) => (c.recurrence_days || [1, 2, 3, 4, 5]).includes(selectedMobileDayIdx + 1)).length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-400 font-medium">
                  No classes scheduled for {shortDays[selectedMobileDayIdx]}.
                </div>
              ) : (
                classEvents
                  .filter((c) => (c.recurrence_days || [1, 2, 3, 4, 5]).includes(selectedMobileDayIdx + 1))
                  .map((cls) => {
                    // Match exams for this class
                    const matchingExams = examEvents.filter((ex) => {
                      const exTitle = (ex.title || '').toLowerCase();
                      const clsTitle = (cls.title || '').toLowerCase();
                      const clsKeywords = clsTitle.split(' ').filter((w) => w.length > 2);
                      return clsKeywords.some((kw) => exTitle.includes(kw)) || exTitle.includes(clsTitle);
                    });

                    return (
                      <div
                        key={cls.id}
                        onClick={() => onSelectEvent && onSelectEvent(cls)}
                        className="p-3.5 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200/80 border-l-4 border-l-blue-600 cursor-pointer transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-extrabold text-slate-800">{cls.title}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {cls.createdBy || 'Class'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-blue-600" /> {formatTimeDisplay(cls)}
                        </div>

                        {/* Upcoming exams under this class */}
                        {matchingExams.length > 0 && (
                          <div className="pt-2 border-t border-slate-200/60 space-y-1">
                            {matchingExams.map((ex) => (
                              <div
                                key={ex.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectEvent && onSelectEvent(ex);
                                }}
                                className="flex items-center justify-between text-[11px] font-bold bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-1 rounded-lg"
                              >
                                <span className="flex items-center gap-1.5">
                                  <FileText className="w-3 h-3 text-rose-600" /> Exam: {ex.title}
                                </span>
                                <span className="text-[10px] text-rose-600">
                                  {formatDateDisplay(ex.start || ex.event_date || ex.due_date || '')}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
            {daysOfWeek.map((dayName, idx) => {
              const dayNumber = idx + 1;
              const dayClasses = classEvents.filter((c) => (c.recurrence_days || [1, 2, 3, 4, 5]).includes(dayNumber));

              // Find exams falling on this specific day of week
              const dayExams = examEvents.filter((ex) => {
                const dateStr = ex.start || ex.event_date || ex.due_date || '';
                if (!dateStr) return false;
                const clean = dateStr.slice(0, 10);
                const parts = clean.split('-');
                if (parts.length === 3) {
                  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                  const dow = d.getDay(); // 0 = Sun, 1 = Mon ...
                  return dow === (dayNumber % 7);
                }
                return false;
              });

              return (
                <div key={dayName} className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 flex flex-col min-h-[240px]">
                  <div className="text-center pb-2 border-b border-slate-200/60 mb-2.5">
                    <span className="text-xs font-extrabold text-slate-800">{dayName}</span>
                  </div>

                  <div className="space-y-2 flex-1">
                    {dayClasses.length === 0 ? (
                      <div className="text-[11px] text-slate-400 font-medium italic text-center mt-3">No classes</div>
                    ) : (
                      dayClasses.map((cls) => {
                        const matchingExams = examEvents.filter((ex) => {
                          const exTitle = (ex.title || '').toLowerCase();
                          const clsTitle = (cls.title || '').toLowerCase();
                          const clsKeywords = clsTitle.split(' ').filter((w) => w.length > 2);
                          return clsKeywords.some((kw) => exTitle.includes(kw)) || exTitle.includes(clsTitle);
                        });

                        return (
                          <div
                            key={cls.id}
                            onClick={() => onSelectEvent && onSelectEvent(cls)}
                            className="p-2.5 bg-white hover:bg-blue-50/40 rounded-lg border border-slate-200 border-l-3 border-l-blue-600 cursor-pointer transition-all space-y-1.5 shadow-2xs"
                          >
                            <div className="text-xs font-extrabold text-slate-800 leading-tight">{cls.title}</div>
                            <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-blue-600" /> {formatTimeDisplay(cls)}
                            </div>

                            {/* Upcoming Exam pill under class */}
                            {matchingExams.length > 0 && (
                              <div className="pt-1.5 border-t border-slate-100 space-y-1">
                                {matchingExams.map((ex) => (
                                  <div
                                    key={ex.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectEvent && onSelectEvent(ex);
                                    }}
                                    className="p-1 bg-rose-50 border border-rose-200 rounded text-[9.5px] font-extrabold text-rose-700 flex items-center justify-between"
                                  >
                                    <span className="truncate">📝 {ex.title}</span>
                                    <span className="text-[9px] text-rose-600 shrink-0 ml-1">
                                      {formatDateDisplay(ex.start || ex.event_date || ex.due_date || '').slice(0, 6)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Day Column Upcoming Exams Section */}
                  {dayExams.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-dashed border-rose-200 space-y-1">
                      <div className="text-[10px] font-extrabold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                        <FileText className="w-3 h-3 text-rose-500" /> Upcoming Exams
                      </div>
                      {dayExams.map((ex) => (
                        <div
                          key={ex.id}
                          onClick={() => onSelectEvent && onSelectEvent(ex)}
                          className="p-1.5 bg-rose-50/90 hover:bg-rose-100/80 border border-rose-200/90 rounded-lg text-[10px] font-bold text-rose-800 cursor-pointer transition-all flex items-center justify-between"
                        >
                          <span className="truncate">{ex.title}</span>
                          <span className="text-[9px] text-rose-600 shrink-0 ml-1">
                            {formatTimeDisplay(ex)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* EXAM DATES SECTION (Chronologically ordered by time)                    */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Exam Dates
                <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                  {examEvents.length} Scheduled
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">Sorted chronologically by date and start time</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenAddEvent}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" /> Add Exam
          </button>
        </div>

        {examEvents.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 space-y-2">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No upcoming exams scheduled</p>
            <p className="text-[11px] text-slate-400 font-medium">Click "+ Add Exam" to create an exam date entry.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {examEvents.map((exam) => (
              <div
                key={exam.id}
                onClick={() => onSelectEvent && onSelectEvent(exam)}
                className="p-4 bg-slate-50/80 hover:bg-rose-50/40 rounded-xl border border-slate-200/80 border-l-4 border-l-rose-500 cursor-pointer transition-all space-y-2 shadow-2xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-900 group-hover:text-rose-700 transition-colors">
                    {exam.title}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    Exam
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-rose-500" />
                    <span>{formatDateDisplay(exam.start || exam.event_date || exam.due_date || '')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    <span>{formatTimeDisplay(exam)}</span>
                  </div>
                </div>

                {exam.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 italic">{exam.description}</p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 text-[10px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" /> {exam.createdBy || 'Eve'}
                  </span>
                  <span className="text-slate-400">Click to edit</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
