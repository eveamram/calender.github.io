import { CalendarEvent } from '../types';

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

/**
 * Calculates the exact anniversary title for the 30th of any given year and month.
 * Base reference: August 2026 on the 30th is the 14th Month Anniversary.
 * For multiples of 12 months (e.g. 12, 24, 36), it displays in years (e.g. "1 Year Anniversary 💕").
 */
export function getAnniversaryEvent(dateStr: string): CalendarEvent | null {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const year = Number(parts[0]);
  const month = Number(parts[1]); // 1-indexed (1-12)
  const day = Number(parts[2]);

  if (day !== 30) return null;

  const totalMonths = 14 + (year - 2026) * 12 + (month - 8);
  if (totalMonths <= 0) return null;

  let title = '';
  if (totalMonths % 12 === 0) {
    const years = totalMonths / 12;
    title = `${years} ${years === 1 ? 'Year' : 'Years'} Anniversary 💕`;
  } else {
    const suffix = getOrdinalSuffix(totalMonths);
    title = `${totalMonths}${suffix} Month Anniversary 💕`;
  }

  return {
    id: `anniv-${dateStr}`,
    title,
    event_type: 'task',
    event_date: dateStr,
    start_time: '18:00',
    end_time: '21:00',
    location: '',
    color: '#ec4899',
    profile: 'Both',
  };
}

/**
 * Returns common holidays for any year/date string.
 */
export function getCommonHolidayEvent(dateStr: string): CalendarEvent | null {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const year = Number(parts[0]);
  const month = Number(parts[1]); // 1-12
  const day = Number(parts[2]);

  const key = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const fixedHolidays: Record<string, string> = {
    '01-01': "New Year's Day 🎆",
    '02-14': "Valentine's Day ❤️",
    '03-17': "St. Patrick's Day ☘️",
    '04-22': 'Earth Day 🌍',
    '06-19': 'Juneteenth ✊🏽',
    '07-04': 'Independence Day 🎆',
    '10-31': 'Halloween 🎃',
    '11-11': "Veterans Day 🎖️",
    '12-24': 'Christmas Eve 🎄',
    '12-25': 'Christmas Day 🎁',
    '12-31': "New Year's Eve 🥂",
  };

  if (fixedHolidays[key]) {
    return {
      id: `holiday-${dateStr}`,
      title: fixedHolidays[key],
      event_type: 'task',
      event_date: dateStr,
      start_time: '09:00',
      end_time: '10:00',
      location: '',
      color: '#8b5cf6',
      profile: 'Both',
    };
  }

  // Dynamic & Jewish Holidays for 2026
  if (year === 2026) {
    const dynamic2026: Record<string, string> = {
      '01-19': 'Martin Luther King Jr. Day ✊',
      '02-16': "Presidents' Day 🇺🇸",
      '03-03': 'Purim 🎭',
      '04-02': 'Passover (Pesach) 🍷',
      '04-05': 'Easter Sunday 🐣',
      '04-09': 'Passover Ends 🍷',
      '05-10': "Mother's Day 💐",
      '05-22': 'Shavuot 🌾',
      '05-25': 'Memorial Day 🎖️',
      '06-21': "Father's Day 👔",
      '07-23': "Tisha B'Av 🕯️",
      '09-07': 'Labor Day 🛠️',
      '09-12': 'Rosh Hashanah 🍎🍯',
      '09-21': 'Yom Kippur 🕯️',
      '09-26': 'Sukkot 🌿',
      '10-03': 'Simchat Torah 📜',
      '11-26': 'Thanksgiving Day 🦃',
      '12-05': 'Hanukkah (Chanukah) 🕎',
    };

    if (dynamic2026[key]) {
      return {
        id: `holiday-${dateStr}`,
        title: dynamic2026[key],
        event_type: 'task',
        event_date: dateStr,
        start_time: '09:00',
        end_time: '10:00',
        location: '',
        color: '#8b5cf6',
        profile: 'Both',
      };
    }
  }

  return null;
}
