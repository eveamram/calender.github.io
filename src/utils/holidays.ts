import { CalendarEvent } from '../types';

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

// Single uniform color for all holidays & long weekends
const UNIFORM_HOLIDAY_COLOR = '#f59e0b'; // Warm Amber

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, days: number): Date {
  const res = new Date(d);
  res.setDate(res.getDate() + days);
  return res;
}

/**
 * Returns the nth day-of-week in a month (1 = Mon, 7 = Sun)
 */
function getNthDayOfWeek(year: number, month: number, targetDayOfWeek: number, n: number): Date {
  const firstDay = new Date(year, month - 1, 1);
  let jsDay = firstDay.getDay();
  if (jsDay === 0) jsDay = 7;

  let offset = targetDayOfWeek - jsDay;
  if (offset < 0) offset += 7;

  const dayOfMonth = 1 + offset + (n - 1) * 7;
  return new Date(year, month - 1, dayOfMonth);
}

/**
 * Returns the last day-of-week in a month
 */
function getLastDayOfWeek(year: number, month: number, targetDayOfWeek: number): Date {
  const lastDay = new Date(year, month, 0);
  let jsDay = lastDay.getDay();
  if (jsDay === 0) jsDay = 7;

  let diff = jsDay - targetDayOfWeek;
  if (diff < 0) diff += 7;

  const dayOfMonth = lastDay.getDate() - diff;
  return new Date(year, month - 1, dayOfMonth);
}

export function getAnniversaryEvent(dateStr: string): CalendarEvent | null {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
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
 * Computes non-religious secular holidays & long weekends dynamically.
 */
export function getCommonHolidayEvent(dateStr: string): CalendarEvent | null {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  const monthDayKey = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // 1. Fixed Annual Secular Holidays
  const fixedHolidays: Record<string, string> = {
    '01-01': "New Year's Day 🎆",
    '02-14': "Valentine's Day ❤️",
    '03-17': "St. Patrick's Day ☘️",
    '04-22': 'Earth Day 🌍',
    '06-19': 'Juneteenth ✊🏽',
    '07-04': 'Independence Day 🎆',
    '10-31': 'Halloween 🎃',
    '11-11': 'Veterans Day 🎖️',
    '12-31': "New Year's Eve 🥂",
  };

  if (fixedHolidays[monthDayKey]) {
    return {
      id: `holiday-${dateStr}`,
      title: fixedHolidays[monthDayKey],
      event_type: 'task',
      event_date: dateStr,
      start_time: '09:00',
      end_time: '10:00',
      location: '',
      color: UNIFORM_HOLIDAY_COLOR,
      profile: 'Both',
    };
  }

  // 2. Dynamic Secular Movable Holidays & Long Weekends
  const dynamicMap: Record<string, string> = {};

  // A. MLK Day
  const mlkDay = getNthDayOfWeek(year, 1, 1, 3);
  dynamicMap[formatDateKey(addDays(mlkDay, -2))] = 'MLK Long Weekend (Sat) 🏖️';
  dynamicMap[formatDateKey(addDays(mlkDay, -1))] = 'MLK Long Weekend (Sun) 🏖️';
  dynamicMap[formatDateKey(mlkDay)] = 'Martin Luther King Jr. Day ✊ (Long Weekend)';

  // B. Presidents' Day
  const presDay = getNthDayOfWeek(year, 2, 1, 3);
  dynamicMap[formatDateKey(addDays(presDay, -2))] = "Presidents' Long Weekend (Sat) 🏖️";
  dynamicMap[formatDateKey(addDays(presDay, -1))] = "Presidents' Long Weekend (Sun) 🏖️";
  dynamicMap[formatDateKey(presDay)] = "Presidents' Day 🇺🇸 (Long Weekend)";

  // C. Mother's Day
  const mothersDay = getNthDayOfWeek(year, 5, 7, 2);
  dynamicMap[formatDateKey(mothersDay)] = "Mother's Day 💐";

  // D. Memorial Day
  const memorialDay = getLastDayOfWeek(year, 5, 1);
  dynamicMap[formatDateKey(addDays(memorialDay, -2))] = 'Memorial Day Long Weekend (Sat) 🏖️';
  dynamicMap[formatDateKey(addDays(memorialDay, -1))] = 'Memorial Day Long Weekend (Sun) 🏖️';
  dynamicMap[formatDateKey(memorialDay)] = 'Memorial Day 🎖️ (Long Weekend)';

  // E. Father's Day
  const fathersDay = getNthDayOfWeek(year, 6, 7, 3);
  dynamicMap[formatDateKey(fathersDay)] = "Father's Day 👔";

  // F. Labor Day
  const laborDay = getNthDayOfWeek(year, 9, 1, 1);
  dynamicMap[formatDateKey(addDays(laborDay, -2))] = 'Labor Day Long Weekend (Sat) 🏖️';
  dynamicMap[formatDateKey(addDays(laborDay, -1))] = 'Labor Day Long Weekend (Sun) 🏖️';
  dynamicMap[formatDateKey(laborDay)] = 'Labor Day 🛠️ (Long Weekend)';

  // G. Columbus Day / Indigenous Peoples' Day
  const columbusDay = getNthDayOfWeek(year, 10, 1, 2);
  dynamicMap[formatDateKey(addDays(columbusDay, -2))] = 'Indigenous Peoples Long Weekend (Sat) 🏖️';
  dynamicMap[formatDateKey(addDays(columbusDay, -1))] = 'Indigenous Peoples Long Weekend (Sun) 🏖️';
  dynamicMap[formatDateKey(columbusDay)] = "Indigenous Peoples' / Columbus Day 🌎 (Long Weekend)";

  // H. Thanksgiving Day
  const thanksgiving = getNthDayOfWeek(year, 11, 4, 4);
  dynamicMap[formatDateKey(thanksgiving)] = 'Thanksgiving Day 🦃 (Long Weekend)';
  dynamicMap[formatDateKey(addDays(thanksgiving, 1))] = 'Black Friday 🛍️ (Thanksgiving Long Weekend)';
  dynamicMap[formatDateKey(addDays(thanksgiving, 2))] = 'Thanksgiving Long Weekend (Sat) 🏖️';
  dynamicMap[formatDateKey(addDays(thanksgiving, 3))] = 'Thanksgiving Long Weekend (Sun) 🏖️';

  if (dynamicMap[dateStr]) {
    return {
      id: `holiday-${dateStr}`,
      title: dynamicMap[dateStr],
      event_type: 'task',
      event_date: dateStr,
      start_time: '09:00',
      end_time: '10:00',
      location: '',
      color: UNIFORM_HOLIDAY_COLOR,
      profile: 'Both',
    };
  }

  return null;
}
