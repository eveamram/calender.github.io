import { CalendarEvent, ProfilePersona } from '../types';
import { addDays, localDateString, localTimeString } from './googleCalendar';

interface IcsEvent {
  summary?: string;
  location?: string;
  dtstart?: { date?: string; dateTime?: Date };
  dtend?: { date?: string; dateTime?: Date };
}

function unfoldIcs(text: string): string[] {
  const raw = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const lines: string[] = [];
  for (const line of raw) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && lines.length > 0) {
      lines[lines.length - 1] += line.slice(1);
    } else {
      lines.push(line);
    }
  }
  return lines;
}

function unescapeIcs(value: string): string {
  return value
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .trim();
}

function parseIcsDate(value: string, params: string): IcsEvent['dtstart'] {
  const isDate = params.includes('VALUE=DATE') || /^\d{8}$/.test(value);
  if (isDate) {
    const y = value.slice(0, 4);
    const m = value.slice(4, 6);
    const d = value.slice(6, 8);
    if (y && m && d) return { date: `${y}-${m}-${d}` };
    return undefined;
  }
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/);
  if (!match) {
    const fallback = new Date(value);
    if (!Number.isNaN(fallback.getTime())) return { dateTime: fallback };
    return undefined;
  }
  const [, ys, ms, ds, hs, mins, secs, z] = match;
  if (z) {
    return {
      dateTime: new Date(
        Date.UTC(
          Number(ys),
          Number(ms) - 1,
          Number(ds),
          Number(hs),
          Number(mins),
          Number(secs || '0')
        )
      ),
    };
  }
  return {
    dateTime: new Date(
      Number(ys),
      Number(ms) - 1,
      Number(ds),
      Number(hs),
      Number(mins),
      Number(secs || '0')
    ),
  };
}

function parseVEvent(block: string[]): IcsEvent | null {
  const evt: IcsEvent = {};
  for (const line of block) {
    const splitAt = line.indexOf(':');
    if (splitAt < 0) continue;
    const meta = line.slice(0, splitAt);
    const value = line.slice(splitAt + 1);
    const [name, ...paramParts] = meta.split(';');
    const params = paramParts.join(';').toUpperCase();
    const key = name.toUpperCase();
    if (key === 'SUMMARY') evt.summary = unescapeIcs(value);
    else if (key === 'LOCATION') evt.location = unescapeIcs(value);
    else if (key === 'DTSTART') evt.dtstart = parseIcsDate(value, params);
    else if (key === 'DTEND') evt.dtend = parseIcsDate(value, params);
  }
  if (!evt.dtstart) return null;
  return evt;
}

function eachInclusiveDate(start: string, end: string): string[] {
  const dates: string[] = [];
  let cur = start;
  let guard = 0;
  while (cur <= end && guard < 400) {
    dates.push(cur);
    cur = addDays(cur, 1);
    guard += 1;
  }
  return dates.length > 0 ? dates : [start];
}

export function parseIcsToEvents(icsText: string, profile: ProfilePersona): CalendarEvent[] {
  const lines = unfoldIcs(icsText);
  const events: CalendarEvent[] = [];
  let block: string[] | null = null;
  let index = 0;
  const stamp = Date.now();

  const flush = (raw: string[]) => {
    const parsed = parseVEvent(raw);
    if (!parsed?.dtstart) return;
    const title = parsed.summary || 'Imported event';
    const location = parsed.location || undefined;

    if (parsed.dtstart.date) {
      const start = parsed.dtstart.date;
      const endExclusive = parsed.dtend?.date || addDays(start, 1);
      const last = endExclusive > start ? addDays(endExclusive, -1) : start;
      for (const event_date of eachInclusiveDate(start, last)) {
        index += 1;
        events.push({
          id: `evt-${stamp}-${index}`,
          title,
          event_type: 'personal',
          event_date,
          location,
          color: '#4285F4',
          profile,
          source: 'ics',
        });
      }
      return;
    }

    if (!parsed.dtstart.dateTime) return;
    const startDt = parsed.dtstart.dateTime;
    const endDt = parsed.dtend?.dateTime || new Date(startDt.getTime() + 60 * 60 * 1000);
    const startDate = localDateString(startDt);
    const endDate = localDateString(endDt);
    const dates = eachInclusiveDate(startDate, endDate);
    dates.forEach((event_date, dayIndex) => {
      index += 1;
      events.push({
        id: `evt-${stamp}-${index}`,
        title,
        event_type: 'personal',
        event_date,
        start_time: dayIndex === 0 ? localTimeString(startDt) : '00:00',
        end_time: dayIndex === dates.length - 1 ? localTimeString(endDt) : '23:59',
        location,
        color: '#4285F4',
        profile,
        source: 'ics',
      });
    });
  };

  for (const line of lines) {
    if (line.toUpperCase() === 'BEGIN:VEVENT') {
      block = [];
    } else if (line.toUpperCase() === 'END:VEVENT') {
      if (block) flush(block);
      block = null;
    } else if (block) {
      block.push(line);
    }
  }

  return events;
}
