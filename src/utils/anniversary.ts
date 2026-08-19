import { CalendarEvent } from '../types';
import { format } from 'date-fns';

export const ANNIVERSARY_PASSWORD = 'MacLeod';

/**
 * Generates monthly anniversary events starting from June 30, 2025 (Month 0).
 * August 30, 2026 is Month 14 (14 Months Anniversary).
 */
export const generateAnniversaryEvents = (): CalendarEvent[] => {
  const anniversaryEvents: CalendarEvent[] = [];
  const startYear = 2025;
  const endYear = 2030;

  for (let year = startYear; year <= endYear; year++) {
    for (let month = 0; month < 12; month++) {
      // Calculate total months since June 2025 (year 2025, month 5)
      const totalMonths = (year - 2025) * 12 + (month - 5);

      if (totalMonths >= 1) {
        // Handle February (28/29) if shorter month, otherwise 30th
        let day = 30;
        if (month === 1) {
          const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
          day = isLeap ? 29 : 28;
        }

        const dateObj = new Date(year, month, day);
        const dateStr = format(dateObj, 'yyyy-MM-dd');

        const years = Math.floor(totalMonths / 12);
        const remMonths = totalMonths % 12;

        let titleText = `💖 ${totalMonths} Months Anniversary 💕`;
        if (totalMonths === 1) {
          titleText = `💖 1 Month Anniversary 💕`;
        } else if (totalMonths % 12 === 0) {
          const years = totalMonths / 12;
          titleText = `💖 ${years} Year${years > 1 ? 's' : ''} Anniversary! 🎉🥂`;
        } else if (totalMonths % 12 === 6 && totalMonths >= 18) {
          const yearsHalf = totalMonths / 12;
          titleText = `💖 ${yearsHalf} Years Anniversary! 💕`;
        }

        anniversaryEvents.push({
          id: `anniversary-${dateStr}`,
          title: titleText,
          event_type: 'event',
          event_date: dateStr,
          start_time: '00:00',
          end_time: '23:59',
          location: '💕 Eve & Abbie 💕',
          color: '#EC4899',
          description: `Celebrating ${totalMonths} months together! 💕`,
          is_completed: false,
          is_anniversary: true,
          created_by: 'eve-user-id',
          owner_user_id: 'eve-user-id',
        });
      }
    }
  }

  return anniversaryEvents;
};
