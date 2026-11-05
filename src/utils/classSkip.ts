import { CalendarEvent, ClassItem } from '../types';

const SKIP_LOCATION_PREFIX = 'class-skip:';

export function classSkipEventId(classId: string, dateStr: string): string {
  return `skip-${classId}-${dateStr}`;
}

export function classSkipLocation(classId: string): string {
  return `${SKIP_LOCATION_PREFIX}${classId}`;
}

export function isClassSkipEvent(evt: { id?: string; location?: string }): boolean {
  return Boolean(evt.location && evt.location.startsWith(SKIP_LOCATION_PREFIX));
}

export function classIdFromSkipEvent(evt: { location?: string }): string | null {
  if (!evt.location || !evt.location.startsWith(SKIP_LOCATION_PREFIX)) return null;
  const classId = evt.location.slice(SKIP_LOCATION_PREFIX.length).trim();
  return classId || null;
}

export function isClassSkippedOn(events: CalendarEvent[], classId: string, dateStr: string): boolean {
  return events.some(
    (evt) => isClassSkipEvent(evt) && classIdFromSkipEvent(evt) === classId && evt.event_date === dateStr
  );
}

export function skippedDatesForClass(events: CalendarEvent[], classId: string): string[] {
  const dates = new Set<string>();
  for (const evt of events) {
    if (!isClassSkipEvent(evt) || classIdFromSkipEvent(evt) !== classId || !evt.event_date) continue;
    dates.add(evt.event_date);
  }
  return Array.from(dates).sort();
}

function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Upcoming dates this class meets. `onlyDayNum` limits the list to one weekday column (1=Mon … 7=Sun). */
export function upcomingClassMeetings(cls: ClassItem, fromDate: string, onlyDayNum?: number, count = 8): string[] {
  const meetingDays = (cls.days_of_week && cls.days_of_week.length > 0 ? cls.days_of_week : [1, 2, 3, 4, 5])
    .filter((day) => (onlyDayNum ? day === onlyDayNum : true));
  if (meetingDays.length === 0) return [];

  const start = new Date(`${fromDate}T00:00:00`);
  const found: string[] = [];
  for (let i = 0; i < 42 && found.length < count; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const jsDay = date.getDay();
    const dayNum = jsDay === 0 ? 7 : jsDay;
    if (!meetingDays.includes(dayNum)) continue;
    found.push(formatDateStr(date));
  }
  return found;
}

export function formatSkipDay(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' });
}
