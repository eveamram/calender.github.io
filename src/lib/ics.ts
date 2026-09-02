import { CalendarEvent, ProfilePersona } from '../types';
import { addDays, localDateString, localTimeString } from './googleCalendar';

interface IcsInstant {
  date?: string;
  dateTime?: Date;
}

interface IcsEvent {
  uid?: string;
  summary?: string;
  location?: string;
  status?: string;
  dtstart?: IcsInstant;
  dtend?: IcsInstant;
  rrule?: string;
  exdates: string[];
}

const WEEKDAY_INDEX: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

const LOOKBACK_MONTHS = 2;
const LOOKAHEAD_MONTHS = 14;
const MAX_OCCURRENCES = 400;

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

function parseIcsDate(value: string, params: string): IcsInstant | undefined {
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

function instantToDateStr(instant: IcsInstant): string | null {
  if (instant.date) return instant.date;
  if (instant.dateTime) return localDateString(instant.dateTime);
  return null;
}

function parseVEvent(block: string[]): IcsEvent | null {
  const evt: IcsEvent = { exdates: [] };
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
    else if (key === 'UID') evt.uid = unescapeIcs(value);
    else if (key === 'STATUS') evt.status = unescapeIcs(value).toUpperCase();
    else if (key === 'DTSTART') evt.dtstart = parseIcsDate(value, params);
    else if (key === 'DTEND') evt.dtend = parseIcsDate(value, params);
    else if (key === 'RRULE') evt.rrule = value;
    else if (key === 'EXDATE') {
      for (const part of value.split(',')) {
        const parsed = parseIcsDate(part.trim(), params);
        const dateStr = parsed ? instantToDateStr(parsed) : null;
        if (dateStr) evt.exdates.push(dateStr);
      }
    }
  }
  if (!evt.dtstart) return null;
  return evt;
}

function eachInclusiveDate(start: string, end: string): string[] {
  const dates: string[] = [];
  let cur = start;
  let guard = 0;
  while (cur <= end && guard < MAX_OCCURRENCES) {
    dates.push(cur);
    cur = addDays(cur, 1);
    guard += 1;
  }
  return dates.length > 0 ? dates : [start];
}

function addMonths(dateStr: string, months: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1 + months, 1);
  const lastDay = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate();
  dt.setDate(Math.min(d, lastDay));
  return localDateString(dt);
}

function expandRRule(startDate: string, rruleRaw: string): string[] {
  const parts = rruleRaw.split(';');
  const map: Record<string, string> = {};
  for (const part of parts) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    map[part.slice(0, eq).toUpperCase()] = part.slice(eq + 1);
  }
  const freq = (map.FREQ || '').toUpperCase();
  if (!freq) return [startDate];

  const interval = Math.max(1, parseInt(map.INTERVAL || '1', 10) || 1);
  const count = map.COUNT ? Math.max(1, parseInt(map.COUNT, 10) || 1) : undefined;
  let until: string | undefined;
  if (map.UNTIL) {
    const parsed = parseIcsDate(map.UNTIL, map.UNTIL.length === 8 ? 'VALUE=DATE' : '');
    until = parsed ? instantToDateStr(parsed) || undefined : undefined;
  }

  const windowStart = addMonths(localDateString(new Date()), -LOOKBACK_MONTHS);
  const windowEnd = addMonths(localDateString(new Date()), LOOKAHEAD_MONTHS);
  const byday = map.BYDAY ? map.BYDAY.split(',').map((d) => d.replace(/^-?\d+/, '').toUpperCase()) : [];

  const dates: string[] = [];
  const push = (dateStr: string) => {
    if (dateStr < windowStart || dateStr > windowEnd) return;
    if (until && dateStr > until) return;
    dates.push(dateStr);
  };

  if (freq === 'YEARLY') {
    let cur = startDate;
    let n = 0;
    while (n < (count || MAX_OCCURRENCES) && cur <= windowEnd) {
      if (!until || cur <= until) {
        if (cur >= windowStart) dates.push(cur);
        n += 1;
      }
      const [y, m, d] = cur.split('-').map(Number);
      cur = `${y + interval}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    return dates;
  }

  if (freq === 'MONTHLY') {
    let cur = startDate;
    let n = 0;
    while (n < (count || MAX_OCCURRENCES) && cur <= windowEnd) {
      if (!until || cur <= until) {
        if (cur >= windowStart) dates.push(cur);
        n += 1;
      }
      cur = addMonths(cur, interval);
    }
    return dates;
  }

  if (freq === 'WEEKLY') {
    const wanted = new Set(
      byday.length > 0
        ? byday
        : [['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][new Date(`${startDate}T00:00:00`).getDay()]]
    );
    const startMs = new Date(`${startDate}T00:00:00`).getTime();
    let cursor = !count && startDate < windowStart ? windowStart : startDate;
    let n = 0;
    let guard = 0;
    while (n < (count || MAX_OCCURRENCES) && cursor <= windowEnd && guard < 2500) {
      const weekday = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][new Date(`${cursor}T00:00:00`).getDay()];
      const weeksFromStart = Math.floor(
        (new Date(`${cursor}T00:00:00`).getTime() - startMs) / (7 * 24 * 60 * 60 * 1000)
      );
      if (
        wanted.has(weekday) &&
        cursor >= startDate &&
        weeksFromStart % interval === 0 &&
        (!until || cursor <= until)
      ) {
        if (cursor >= windowStart) dates.push(cursor);
        n += 1;
      }
      cursor = addDays(cursor, 1);
      guard += 1;
    }
    return dates;
  }

  if (freq === 'DAILY') {
    let cur = !count && startDate < windowStart ? windowStart : startDate;
    let n = 0;
    while (n < (count || MAX_OCCURRENCES) && cur <= windowEnd) {
      push(cur);
      n += 1;
      cur = addDays(cur, interval);
    }
    return dates;
  }

  return [startDate];
}

function occurrenceDates(evt: IcsEvent): string[] {
  const start = instantToDateStr(evt.dtstart!);
  if (!start) return [];
  const excluded = new Set(evt.exdates);
  const raw = evt.rrule ? expandRRule(start, evt.rrule) : [start];
  return raw.filter((dateStr) => !excluded.has(dateStr));
}

function durationDays(evt: IcsEvent): number {
  if (!evt.dtstart?.date) return 0;
  const start = evt.dtstart.date;
  const endExclusive = evt.dtend?.date || addDays(start, 1);
  const last = endExclusive > start ? addDays(endExclusive, -1) : start;
  const dates = eachInclusiveDate(start, last);
  return Math.max(0, dates.length - 1);
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
    if (parsed.status === 'CANCELLED') return;
    const title = parsed.summary || 'Imported event';
    const location = parsed.location || undefined;
    const dates = occurrenceDates(parsed);
    const extraDays = durationDays(parsed);

    for (const occurrenceStart of dates) {
      if (parsed.dtstart.date) {
        const span = extraDays > 0 ? eachInclusiveDate(occurrenceStart, addDays(occurrenceStart, extraDays)) : [occurrenceStart];
        for (const event_date of span) {
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
        continue;
      }

      if (!parsed.dtstart.dateTime) continue;
      const startDt = parsed.dtstart.dateTime;
      const endDt = parsed.dtend?.dateTime || new Date(startDt.getTime() + 60 * 60 * 1000);
      index += 1;
      events.push({
        id: `evt-${stamp}-${index}`,
        title,
        event_type: 'personal',
        event_date: occurrenceStart,
        start_time: localTimeString(startDt),
        end_time: localTimeString(endDt),
        location,
        color: '#4285F4',
        profile,
        source: 'ics',
      });
    }
  };

  for (const line of lines) {
    const upper = line.toUpperCase();
    if (upper === 'BEGIN:VEVENT') block = [];
    else if (upper === 'END:VEVENT') {
      if (block) flush(block);
      block = null;
    } else if (block) {
      block.push(line);
    }
  }

  return events;
}
