import { CalendarEvent } from '../types';

export type EventRepeat = 'none' | 'daily' | 'weekly';

const OCCURRENCE_SEP = '__occ__';

export function masterEventId(id: string): string {
  const at = id.indexOf(OCCURRENCE_SEP);
  return at >= 0 ? id.slice(0, at) : id;
}

export function occurrenceEventId(masterId: string, dateStr: string): string {
  return `${masterId}${OCCURRENCE_SEP}${dateStr}`;
}

export function eventRepeats(evt: { repeat?: string }): boolean {
  return evt.repeat === 'daily' || evt.repeat === 'weekly';
}

/** 1=Mon ... 7=Sun */
export function dateToDayNum(dateStr: string): number {
  const js = new Date(`${dateStr}T00:00:00`).getDay();
  return js === 0 ? 7 : js;
}

export function weeklyRepeatDays(evt: CalendarEvent): number[] {
  if (evt.repeat_days && evt.repeat_days.length > 0) return evt.repeat_days;
  return [dateToDayNum(evt.event_date)];
}

export function eventSpanEnd(evt: { event_date: string; end_date?: string }): string {
  if (evt.end_date && evt.end_date > evt.event_date) return evt.end_date;
  return evt.event_date;
}

export function addDaysToDateStr(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function eventOccursOn(evt: CalendarEvent, dateStr: string): boolean {
  if (!dateStr) return false;
  if (dateStr < evt.event_date) return false;
  if (eventRepeats(evt)) {
    if (evt.repeat_until && dateStr > evt.repeat_until) return false;
    if (evt.repeat === 'daily') return true;
    return weeklyRepeatDays(evt).includes(dateToDayNum(dateStr));
  }
  return dateStr <= eventSpanEnd(evt);
}

export function resolveMasterEvent(evt: CalendarEvent, events: CalendarEvent[]): CalendarEvent {
  const masterId = masterEventId(evt.id);
  return events.find((e) => e.id === masterId) || { ...evt, id: masterId };
}
