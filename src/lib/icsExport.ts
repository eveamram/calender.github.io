import { CalendarEvent } from '../types';

export function exportEventsToICS(events: CalendarEvent[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//calender//NONSGML v1.0//EN',
    'CALSCALE:GREGORIAN',
  ];

  events.forEach((evt) => {
    const eventDateStr = evt.event_date || evt.due_date || new Date().toISOString().split('T')[0];
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${evt.id}@calender.app`);
    lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
    lines.push(`SUMMARY:${evt.title}`);
    if (evt.description) lines.push(`DESCRIPTION:${evt.description}`);
    if (evt.location) lines.push(`LOCATION:${evt.location}`);
    lines.push(`DTSTART;VALUE=DATE:${eventDateStr.replace(/-/g, '')}`);
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
