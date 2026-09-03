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

function weekdayIndex(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00`).getDay();
}

export function eventOccursOn(evt: CalendarEvent, dateStr: string): boolean {
  if (!dateStr) return false;
  if (dateStr < evt.event_date) return false;
  if (evt.repeat_until && dateStr > evt.repeat_until) return false;
  if (!eventRepeats(evt)) return dateStr === evt.event_date;
  if (evt.repeat === 'daily') return true;
  return weekdayIndex(dateStr) === weekdayIndex(evt.event_date);
}

export function resolveMasterEvent(evt: CalendarEvent, events: CalendarEvent[]): CalendarEvent {
  const masterId = masterEventId(evt.id);
  return events.find((e) => e.id === masterId) || { ...evt, id: masterId };
}
