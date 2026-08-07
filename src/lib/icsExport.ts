import { CalendarEvent } from '../types';

export function exportEventsToICS(events: CalendarEvent[], filename = 'shared-calendar.ics') {
  if (events.length === 0) return;

  const formatDate = (dateStr: string, timeStr?: string | null) => {
    const cleanDate = dateStr.replace(/-/g, '');
    if (!timeStr) {
      return cleanDate;
    }
    const cleanTime = timeStr.replace(/:/g, '') + '00';
    return `${cleanDate}T${cleanTime}`;
  };

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Shared Student Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  events.forEach((evt) => {
    const dtStart = formatDate(evt.event_date, evt.is_all_day ? null : evt.start_time);
    const dtEnd = formatDate(evt.event_date, evt.is_all_day ? null : (evt.end_time || evt.start_time));
    
    icsContent.push('BEGIN:VEVENT');
    icsContent.push(`UID:${evt.id}@shared-student-calendar`);
    icsContent.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
    
    if (evt.is_all_day) {
      icsContent.push(`DTSTART;VALUE=DATE:${dtStart}`);
    } else {
      icsContent.push(`DTSTART:${dtStart}`);
      icsContent.push(`DTEND:${dtEnd}`);
    }

    icsContent.push(`SUMMARY:[${evt.event_type}] ${evt.title}`);
    
    let description = [];
    if (evt.course) description.push(`Course: ${evt.course}`);
    if (evt.notes) description.push(`Notes: ${evt.notes}`);
    if (description.length > 0) {
      icsContent.push(`DESCRIPTION:${description.join('\\n')}`);
    }

    if (evt.location) {
      icsContent.push(`LOCATION:${evt.location}`);
    }

    icsContent.push('END:VEVENT');
  });

  icsContent.push('END:VCALENDAR');

  const fileText = icsContent.join('\r\n');
  const blob = new Blob([fileText], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
