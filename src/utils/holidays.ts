import { CalendarEvent } from '../types';

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

/**
 * Meeus/Jones/Butcher algorithm to compute Easter Sunday for any Gregorian year.
 */
function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

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
  // targetDayOfWeek: 1 = Mon, 2 = Tue, ..., 7 = Sun
  const firstDay = new Date(year, month - 1, 1);
  let jsDay = firstDay.getDay(); // 0 = Sun, 1 = Mon, ...
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
  const lastDay = new Date(year, month, 0); // Last day of month
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
 * Computes common, Christian, and Long Weekend holidays for ANY year dynamically.
 */
export function getCommonHolidayEvent(dateStr: string): CalendarEvent | null {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  const monthDayKey = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // 1. Fixed Calendar Holidays & Christian Observances
  const fixedHolidays: Record<string, { title: string; color: string }> = {
    '01-01': { title: "New Year's Day 🎆", color: '#8b5cf6' },
    '01-06': { title: "Epiphany (Three Kings' Day) 👑", color: '#3b82f6' },
    '02-14': { title: "Valentine's Day ❤️", color: '#ec4899' },
    '03-17': { title: "St. Patrick's Day ☘️", color: '#10b981' },
    '03-25': { title: "Annunciation 🕊️", color: '#6366f1' },
    '04-22': { title: 'Earth Day 🌍', color: '#10b981' },
    '06-19': { title: 'Juneteenth ✊🏽', color: '#f59e0b' },
    '07-04': { title: 'Independence Day 🎆', color: '#ef4444' },
    '08-15': { title: 'Assumption of Mary 🌸', color: '#a855f7' },
    '10-31': { title: 'Halloween 🎃', color: '#f97316' },
    '11-01': { title: "All Saints' Day 😇", color: '#6366f1' },
    '11-02': { title: "All Souls' Day 🕯️", color: '#64748b' },
    '11-11': { title: 'Veterans Day 🎖️', color: '#3b82f6' },
    '12-06': { title: "St. Nicholas Day 🎅", color: '#ef4444' },
    '12-24': { title: 'Christmas Eve 🎄', color: '#10b981' },
    '12-25': { title: 'Christmas Day 🎁', color: '#ef4444' },
    '12-26': { title: "Boxing Day / St. Stephen's Day 🥊", color: '#3b82f6' },
    '12-31': { title: "New Year's Eve 🥂", color: '#8b5cf6' },
  };

  if (fixedHolidays[monthDayKey]) {
    return {
      id: `holiday-${dateStr}`,
      title: fixedHolidays[monthDayKey].title,
      event_type: 'task',
      event_date: dateStr,
      start_time: '09:00',
      end_time: '10:00',
      location: '',
      color: fixedHolidays[monthDayKey].color,
      profile: 'Both',
    };
  }

  // 2. Dynamic Movable Holidays & Long Weekends Map for the specified year
  const dynamicMap: Record<string, { title: string; color: string }> = {};

  // A. Martin Luther King Jr. Day: 3rd Monday of January
  const mlkDay = getNthDayOfWeek(year, 1, 1, 3);
  const mlkSat = addDays(mlkDay, -2);
  const mlkSun = addDays(mlkDay, -1);
  dynamicMap[formatDateKey(mlkSat)] = { title: 'MLK Long Weekend (Sat) 🏖️', color: '#f59e0b' };
  dynamicMap[formatDateKey(mlkSun)] = { title: 'MLK Long Weekend (Sun) 🏖️', color: '#f59e0b' };
  dynamicMap[formatDateKey(mlkDay)] = { title: 'Martin Luther King Jr. Day ✊ (Long Weekend)', color: '#f59e0b' };

  // B. Presidents' Day: 3rd Monday of February
  const presDay = getNthDayOfWeek(year, 2, 1, 3);
  const presSat = addDays(presDay, -2);
  const presSun = addDays(presDay, -1);
  dynamicMap[formatDateKey(presSat)] = { title: "Presidents' Long Weekend (Sat) 🏖️", color: '#3b82f6' };
  dynamicMap[formatDateKey(presSun)] = { title: "Presidents' Long Weekend (Sun) 🏖️", color: '#3b82f6' };
  dynamicMap[formatDateKey(presDay)] = { title: "Presidents' Day 🇺🇸 (Long Weekend)", color: '#3b82f6' };

  // C. Christian Movable Calendar based on Easter Sunday
  const easter = getEasterDate(year);
  const ashWednesday = addDays(easter, -46);
  const palmSunday = addDays(easter, -7);
  const maundyThursday = addDays(easter, -3);
  const goodFriday = addDays(easter, -2);
  const holySaturday = addDays(easter, -1);
  const easterMonday = addDays(easter, 1);
  const ascensionDay = addDays(easter, 39);
  const pentecost = addDays(easter, 49);
  const whitMonday = addDays(easter, 50);

  dynamicMap[formatDateKey(ashWednesday)] = { title: 'Ash Wednesday ✝️', color: '#6366f1' };
  dynamicMap[formatDateKey(palmSunday)] = { title: 'Palm Sunday 🌿', color: '#10b981' };
  dynamicMap[formatDateKey(maundyThursday)] = { title: 'Maundy Thursday 🍞', color: '#a855f7' };
  dynamicMap[formatDateKey(goodFriday)] = { title: 'Good Friday ✝️ (Easter Long Weekend)', color: '#6366f1' };
  dynamicMap[formatDateKey(holySaturday)] = { title: 'Holy Saturday 🕯️ (Easter Long Weekend)', color: '#6366f1' };
  dynamicMap[formatDateKey(easter)] = { title: 'Easter Sunday 🐣 (Long Weekend)', color: '#ec4899' };
  dynamicMap[formatDateKey(easterMonday)] = { title: 'Easter Monday 🐣 (Long Weekend)', color: '#ec4899' };
  dynamicMap[formatDateKey(ascensionDay)] = { title: 'Ascension Day ☁️', color: '#3b82f6' };
  dynamicMap[formatDateKey(pentecost)] = { title: 'Pentecost / Whit Sunday 🕊️', color: '#ef4444' };
  dynamicMap[formatDateKey(whitMonday)] = { title: 'Whit Monday 🕊️', color: '#ef4444' };

  // D. Mother's Day: 2nd Sunday of May
  const mothersDay = getNthDayOfWeek(year, 5, 7, 2);
  dynamicMap[formatDateKey(mothersDay)] = { title: "Mother's Day 💐", color: '#ec4899' };

  // E. Memorial Day: Last Monday of May
  const memorialDay = getLastDayOfWeek(year, 5, 1);
  const memSat = addDays(memorialDay, -2);
  const memSun = addDays(memorialDay, -1);
  dynamicMap[formatDateKey(memSat)] = { title: 'Memorial Day Long Weekend (Sat) 🏖️', color: '#ef4444' };
  dynamicMap[formatDateKey(memSun)] = { title: 'Memorial Day Long Weekend (Sun) 🏖️', color: '#ef4444' };
  dynamicMap[formatDateKey(memorialDay)] = { title: 'Memorial Day 🎖️ (Long Weekend)', color: '#ef4444' };

  // F. Father's Day: 3rd Sunday of June
  const fathersDay = getNthDayOfWeek(year, 6, 7, 3);
  dynamicMap[formatDateKey(fathersDay)] = { title: "Father's Day 👔", color: '#3b82f6' };

  // G. Labor Day: 1st Monday of September
  const laborDay = getNthDayOfWeek(year, 9, 1, 1);
  const labSat = addDays(laborDay, -2);
  const labSun = addDays(laborDay, -1);
  dynamicMap[formatDateKey(labSat)] = { title: 'Labor Day Long Weekend (Sat) 🏖️', color: '#f59e0b' };
  dynamicMap[formatDateKey(labSun)] = { title: 'Labor Day Long Weekend (Sun) 🏖️', color: '#f59e0b' };
  dynamicMap[formatDateKey(laborDay)] = { title: 'Labor Day 🛠️ (Long Weekend)', color: '#f59e0b' };

  // H. Columbus Day / Indigenous Peoples' Day: 2nd Monday of October
  const columbusDay = getNthDayOfWeek(year, 10, 1, 2);
  const colSat = addDays(columbusDay, -2);
  const colSun = addDays(columbusDay, -1);
  dynamicMap[formatDateKey(colSat)] = { title: 'Indigenous Peoples Long Weekend (Sat) 🏖️', color: '#f59e0b' };
  dynamicMap[formatDateKey(colSun)] = { title: 'Indigenous Peoples Long Weekend (Sun) 🏖️', color: '#f59e0b' };
  dynamicMap[formatDateKey(columbusDay)] = { title: "Indigenous Peoples' / Columbus Day 🌎 (Long Weekend)", color: '#f59e0b' };

  // I. Thanksgiving Day: 4th Thursday of November
  const thanksgiving = getNthDayOfWeek(year, 11, 4, 4);
  const blackFriday = addDays(thanksgiving, 1);
  const tgSat = addDays(thanksgiving, 2);
  const tgSun = addDays(thanksgiving, 3);
  dynamicMap[formatDateKey(thanksgiving)] = { title: 'Thanksgiving Day 🦃 (Long Weekend)', color: '#d97706' };
  dynamicMap[formatDateKey(blackFriday)] = { title: 'Black Friday 🛍️ (Thanksgiving Long Weekend)', color: '#d97706' };
  dynamicMap[formatDateKey(tgSat)] = { title: 'Thanksgiving Long Weekend (Sat) 🏖️', color: '#d97706' };
  dynamicMap[formatDateKey(tgSun)] = { title: 'Thanksgiving Long Weekend (Sun) 🏖️', color: '#d97706' };

  // J. Advent Sundays (4 Sundays preceding Christmas Day)
  const christmas = new Date(year, 11, 25);
  let jsDayXmas = christmas.getDay();
  if (jsDayXmas === 0) jsDayXmas = 7;
  const advent4 = addDays(christmas, -jsDayXmas); // Sunday before Xmas
  const advent3 = addDays(advent4, -7);
  const advent2 = addDays(advent4, -14);
  const advent1 = addDays(advent4, -21);

  dynamicMap[formatDateKey(advent1)] = { title: 'First Sunday of Advent 🕯️', color: '#6366f1' };
  dynamicMap[formatDateKey(advent2)] = { title: 'Second Sunday of Advent 🕯️', color: '#6366f1' };
  dynamicMap[formatDateKey(advent3)] = { title: 'Third Sunday of Advent 🕯️', color: '#6366f1' };
  dynamicMap[formatDateKey(advent4)] = { title: 'Fourth Sunday of Advent 🕯️', color: '#6366f1' };

  if (dynamicMap[dateStr]) {
    return {
      id: `holiday-${dateStr}`,
      title: dynamicMap[dateStr].title,
      event_type: 'task',
      event_date: dateStr,
      start_time: '09:00',
      end_time: '10:00',
      location: '',
      color: dynamicMap[dateStr].color,
      profile: 'Both',
    };
  }

  return null;
}
