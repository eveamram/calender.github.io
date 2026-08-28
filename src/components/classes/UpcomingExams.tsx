import React, { useMemo, useState } from 'react';
import { useStore, getTodayDateString, formatTime12Hour } from '../../context/StoreContext';
import { CalendarEvent, ProfilePersona } from '../../types';
import { Plus, Clock, MapPin, Trash2, Edit3 } from 'lucide-react';

interface UpcomingExamsProps {
  onOpenAddExamModal?: (examToEdit?: CalendarEvent) => void;
}

const COURSE_CODE_RE = /^([A-Z]{2,4}\s?\d{3,4}[A-Z]?)$/i;
const COURSE_TITLE_RE = /^([A-Z]{2,4}\s?\d{3,4}[A-Z]?)\s+(.+)$/i;

function normalizeCourseCode(value: string): string {
  return value.replace(/\s+/g, '').toUpperCase();
}

function parseExamTitle(title: string): { course: string | null; rest: string } {
  const trimmed = title.trim();
  const withRest = trimmed.match(COURSE_TITLE_RE);
  if (withRest) {
    return { course: normalizeCourseCode(withRest[1]), rest: withRest[2].trim() };
  }
  const codeOnly = trimmed.match(COURSE_CODE_RE);
  if (codeOnly) {
    return { course: normalizeCourseCode(codeOnly[1]), rest: '' };
  }
  return { course: null, rest: trimmed };
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const examDate = new Date(`${dateStr}T00:00:00`);
  return Math.round((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatExamDate(dateStr: string): { primary: string; hint: string } {
  const d = new Date(`${dateStr}T00:00:00`);
  const primary = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const hourHint = d.toLocaleDateString('en-US', { weekday: 'long' });
  return { primary, hint: hourHint };
}

function timeHint(start?: string): string {
  const mins = (() => {
    if (!start) return null;
    const parts = start.trim().split(':');
    if (parts.length < 2) return null;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  })();
  if (mins === null) return '';
  if (mins < 12 * 60) return 'morning';
  if (mins < 17 * 60) return 'afternoon';
  return 'evening';
}

function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

function monthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long' });
}

function hexWithAlpha(hex: string, alphaHex: string): string {
  const raw = hex.replace('#', '');
  if (raw.length === 3 || raw.length === 6) return `#${raw}${alphaHex}`;
  return hex;
}

type PreparedExam = {
  exam: CalendarEvent;
  course: string;
  examName: string;
  color: string;
  diffDays: number;
  dateLabel: string;
  dateHint: string;
  timeLabel: string;
  location: string;
};

function prepareExams(exams: CalendarEvent[]): PreparedExam[] {
  const inferredCourse = new Map<string, string>();
  exams.forEach((exam) => {
    const { course } = parseExamTitle(exam.title);
    if (course && exam.color) inferredCourse.set(exam.color.toLowerCase(), course);
  });

  const withCourse = exams.map((exam) => {
    const parsed = parseExamTitle(exam.title);
    const course =
      parsed.course ||
      (exam.color ? inferredCourse.get(exam.color.toLowerCase()) : undefined) ||
      'Other';
    return { exam, course, rest: parsed.rest };
  });

  const byCourse = new Map<string, CalendarEvent[]>();
  withCourse.forEach(({ exam, course }) => {
    if (!byCourse.has(course)) byCourse.set(course, []);
    byCourse.get(course)!.push(exam);
  });

  return withCourse.map(({ exam, course, rest }) => {
    let examName = rest;
    if (/final/i.test(exam.title) || /final/i.test(rest)) {
      examName = 'Final';
    } else if (/exam\s*\d+/i.test(rest)) {
      examName = rest.replace(/^exam/i, 'Exam');
    } else if (!rest || rest.toLowerCase() === 'exam') {
      const numbered = (byCourse.get(course) || [])
        .filter((e) => !/final/i.test(e.title))
        .sort((a, b) => a.event_date.localeCompare(b.event_date));
      const idx = numbered.findIndex((e) => e.id === exam.id);
      examName = idx >= 0 ? `Exam ${idx + 1}` : 'Exam';
    }

    const diffDays = daysUntil(exam.event_date);
    const date = formatExamDate(exam.event_date);
    const start = exam.start_time ? formatTime12Hour(exam.start_time) : '';
    const end = exam.end_time ? formatTime12Hour(exam.end_time) : '';
    const timeLabel = start && end ? `${start} – ${end}` : start || '—';
    const hint = timeHint(exam.start_time);
    return {
      exam,
      course,
      examName,
      color: exam.color || '#ef4444',
      diffDays,
      dateLabel: date.primary,
      dateHint: hint || date.hint,
      timeLabel,
      location: (exam.location || '').trim() || '—',
    };
  });
}

function countdownText(diffDays: number): string {
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return `${diffDays} days`;
}

export const UpcomingExams: React.FC<UpcomingExamsProps> = ({ onOpenAddExamModal }) => {
  const { events, deleteEvent, filterByProfile, activeProfile, profileColors } = useStore();
  const [courseFilter, setCourseFilter] = useState<string>('all');

  const prepared = useMemo(() => {
    const today = getTodayDateString();
    const upcoming = filterByProfile(events.filter((e) => e.event_type === 'exam' && e.event_date >= today));
    return prepareExams([...upcoming].sort((a, b) => a.event_date.localeCompare(b.event_date) || (a.start_time || '').localeCompare(b.start_time || '')));
  }, [events, filterByProfile]);

  const courses = useMemo(() => {
    const seen = new Map<string, string>();
    prepared.forEach((item) => {
      if (item.course !== 'Other' && !seen.has(item.course)) seen.set(item.course, item.color);
    });
    return Array.from(seen.entries()).map(([code, color]) => ({ code, color }));
  }, [prepared]);

  const visible = useMemo(() => {
    if (courseFilter === 'all') return prepared;
    return prepared.filter((item) => item.course === courseFilter);
  }, [prepared, courseFilter]);

  const nextExam = visible[0];

  const byMonth = useMemo(() => {
    const groups: { key: string; label: string; items: PreparedExam[] }[] = [];
    const index = new Map<string, number>();
    visible.forEach((item) => {
      const key = monthKey(item.exam.event_date);
      if (!index.has(key)) {
        index.set(key, groups.length);
        groups.push({ key, label: monthLabel(key), items: [] });
      }
      groups[index.get(key)!].items.push(item);
    });
    return groups;
  }, [visible]);

  const openExam = (exam?: CalendarEvent) => {
    onOpenAddExamModal?.(exam);
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Upcoming Exams</h2>
          <p className="text-xs text-slate-500 font-medium hidden sm:block">Your tests in order, labeled by class</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg whitespace-nowrap">
            {visible.length} {visible.length === 1 ? 'Exam' : 'Exams'}
          </span>
          {onOpenAddExamModal && (
            <button
              type="button"
              onClick={() => openExam()}
              className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 min-h-[44px] rounded-xl text-xs shadow-xs transition-all cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Exam</span>
            </button>
          )}
        </div>
      </div>

      {prepared.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400 font-medium">
          No upcoming exams scheduled. Great job staying ahead!
        </div>
      ) : (
        <>
          {nextExam && (
            <div
              className="flex items-stretch gap-3 sm:gap-4 rounded-2xl border border-slate-200/80 overflow-hidden cursor-pointer"
              style={{ background: `linear-gradient(90deg, ${hexWithAlpha(nextExam.color, '18')} 0%, #ffffff 55%)` }}
              onClick={() => openExam(nextExam.exam)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openExam(nextExam.exam);
                }
              }}
            >
              <div className="w-1.5 shrink-0" style={{ backgroundColor: nextExam.color }} />
              <div className="flex-1 min-w-0 py-3 pr-2">
                <div className="text-[10px] font-extrabold tracking-[0.08em] uppercase" style={{ color: nextExam.color }}>
                  Next exam
                </div>
                <div className="font-class-title text-base font-extrabold text-slate-900 tracking-tight">
                  {nextExam.course} · {nextExam.examName}
                </div>
                <div className="text-xs font-medium text-slate-500 mt-0.5">
                  {nextExam.dateLabel} · {nextExam.timeLabel}
                  {nextExam.location !== '—' ? ` · ${nextExam.location}` : ''}
                </div>
              </div>
              <div className="shrink-0 text-right pr-4 py-3">
                <div className="text-2xl font-black leading-none tracking-tight" style={{ color: nextExam.color }}>
                  {nextExam.diffDays <= 0 ? '0' : nextExam.diffDays}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                  {nextExam.diffDays === 1 ? 'day' : 'days'}
                </div>
              </div>
            </div>
          )}

          {courses.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <FilterChip
                label="All classes"
                active={courseFilter === 'all'}
                onClick={() => setCourseFilter('all')}
              />
              {courses.map((course) => (
                <FilterChip
                  key={course.code}
                  label={course.code}
                  color={course.color}
                  active={courseFilter === course.code}
                  onClick={() => setCourseFilter(course.code)}
                />
              ))}
            </div>
          )}

          <div className="space-y-5">
            {byMonth.map((group) => (
              <div key={group.key} className="space-y-2">
                <div className="flex items-baseline gap-2 px-0.5">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{group.label}</h3>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {group.items.length}{' '}
                    {group.items.every((i) => i.examName === 'Final')
                      ? group.items.length === 1
                        ? 'final'
                        : 'finals'
                      : group.items.length === 1
                        ? 'exam'
                        : 'exams'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {group.items.map((item) => (
                    <ExamRow
                      key={item.exam.id}
                      item={item}
                      activeProfile={activeProfile}
                      profileColors={profileColors}
                      onOpen={() => openExam(item.exam)}
                      onDelete={() => deleteEvent(item.exam.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const FilterChip: React.FC<{
  label: string;
  color?: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, color, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-3 py-1.5 min-h-[36px] border transition-all cursor-pointer ${
      active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
    }`}
  >
    {color && !active && (
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
    )}
    {label}
  </button>
);

const ExamRow: React.FC<{
  item: PreparedExam;
  activeProfile: ProfilePersona;
  profileColors: Record<ProfilePersona, string>;
  onOpen: () => void;
  onDelete: () => void;
}> = ({ item, activeProfile, profileColors, onOpen, onDelete }) => {
  const ownerName = (item.exam.profile || 'Eve') as ProfilePersona;
  const badgeColor = profileColors[ownerName] || '#2563eb';
  const soon = item.diffDays <= 1;

  return (
    <div
      className="group flex items-stretch gap-0 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/80 transition-all cursor-pointer overflow-hidden"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <div className="w-1.5 shrink-0" style={{ backgroundColor: item.color }} />

      <div className="flex-1 min-w-0 px-3 py-2.5 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[11px] font-extrabold tracking-wide px-2 py-0.5 rounded-md"
              style={{ backgroundColor: hexWithAlpha(item.color, '22'), color: item.color }}
            >
              {item.course}
            </span>
            <span className="text-sm font-bold text-slate-900">{item.examName}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] sm:text-xs font-semibold text-slate-500">
            <span className="text-slate-800 font-bold">{item.dateLabel}</span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3 shrink-0 hidden sm:inline" style={{ color: item.color }} />
              {item.timeLabel}
            </span>
            {item.location !== '—' && (
              <>
                <span className="text-slate-300 hidden sm:inline">·</span>
                <span className="hidden sm:inline-flex items-center gap-1 min-w-0">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </span>
              </>
            )}
            <span className="text-slate-300 sm:hidden">·</span>
            <span className={`sm:hidden font-extrabold ${soon ? 'text-rose-600' : 'text-slate-700'}`}>
              {countdownText(item.diffDays)}
            </span>
          </div>
        </div>

        <div className="hidden sm:block text-xs font-extrabold whitespace-nowrap text-right min-w-[4.5rem]" >
          <span className={soon ? 'text-rose-600' : 'text-slate-700'}>{countdownText(item.diffDays)}</span>
        </div>

        <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {activeProfile === 'Both' && (
            <span
              className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-md mr-1"
              style={{ backgroundColor: badgeColor }}
            >
              {ownerName}
            </span>
          )}
          <button
            type="button"
            onClick={onOpen}
            className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            title="Edit Exam"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
            title="Delete Exam"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpcomingExams;
