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
 * Returns common holidays, Christian holidays, and Long Weekends for any year/date string.
 */
export function getCommonHolidayEvent(dateStr: string): CalendarEvent | null {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const year = Number(parts[0]);
  const month = Number(parts[1]); // 1-12
  const day = Number(parts[2]);

  const key = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // Fixed Annual Holidays & Christian Observances across all years
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

  if (fixedHolidays[key]) {
    return {
      id: `holiday-${dateStr}`,
      title: fixedHolidays[key].title,
      event_type: 'task',
      event_date: dateStr,
      start_time: '09:00',
      end_time: '10:00',
      location: '',
      color: fixedHolidays[key].color,
      profile: 'Both',
    };
  }

  // Dynamic Holidays, Christian Calendar, & Long Weekends for 2026
  if (year === 2026) {
    const dynamic2026: Record<string, { title: string; color?: string }> = {
      // January
      '01-17': { title: 'MLK Long Weekend (Day 1) 🏖️', color: '#f59e0b' },
      '01-18': { title: 'MLK Long Weekend (Day 2) 🏖️', color: '#f59e0b' },
      '01-19': { title: 'Martin Luther King Jr. Day ✊ (Long Weekend)', color: '#f59e0b' },

      // February
      '02-14': { title: "Presidents' Long Weekend (Day 1) 🏖️", color: '#ec4899' },
      '02-15': { title: "Presidents' Long Weekend (Day 2) 🏖️", color: '#3b82f6' },
      '02-16': { title: "Presidents' Day 🇺🇸 (Long Weekend)", color: '#3b82f6' },
      '02-18': { title: 'Ash Wednesday ✝️', color: '#6366f1' },

      // March
      '03-03': { title: 'Purim 🎭', color: '#8b5cf6' },
      '03-29': { title: 'Palm Sunday 🌿', color: '#10b981' },

      // April
      '04-02': { title: 'Maundy Thursday 🍞', color: '#a855f7' },
      '04-03': { title: 'Good Friday ✝️ (Easter Long Weekend)', color: '#6366f1' },
      '04-04': { title: 'Holy Saturday 🕯️ (Easter Long Weekend)', color: '#6366f1' },
      '04-05': { title: 'Easter Sunday 🐣 (Long Weekend)', color: '#ec4899' },
      '04-06': { title: 'Easter Monday 🐣 (Long Weekend)', color: '#ec4899' },
      '04-09': { title: 'Passover Ends 🍷', color: '#8b5cf6' },

      // May
      '05-10': { title: "Mother's Day 💐", color: '#ec4899' },
      '05-14': { title: 'Ascension Day ☁️', color: '#3b82f6' },
      '05-22': { title: 'Shavuot 🌾', color: '#8b5cf6' },
      '05-23': { title: 'Memorial Day Long Weekend (Day 1) 🏖️', color: '#ef4444' },
      '05-24': { title: 'Pentecost / Whit Sunday 🕊️ (Memorial Long Weekend)', color: '#ef4444' },
      '05-25': { title: 'Memorial Day 🎖️ & Whit Monday 🕊️ (Long Weekend)', color: '#ef4444' },

      // June
      '06-21': { title: "Father's Day 👔", color: '#3b82f6' },

      // July
      '07-03': { title: 'Independence Day Long Weekend (Day 1) 🎆', color: '#ef4444' },
      '07-04': { title: 'Independence Day 🎆 (Long Weekend)', color: '#ef4444' },
      '07-05': { title: 'Independence Day Long Weekend (Day 3) 🏖️', color: '#ef4444' },
      '07-23': { title: "Tisha B'Av 🕯️", color: '#64748b' },

      // September
      '09-05': { title: 'Labor Day Long Weekend (Day 1) 🏖️', color: '#f59e0b' },
      '09-06': { title: 'Labor Day Long Weekend (Day 2) 🏖️', color: '#f59e0b' },
      '09-07': { title: 'Labor Day 🛠️ (Long Weekend)', color: '#f59e0b' },
      '09-12': { title: 'Rosh Hashanah 🍎🍯', color: '#8b5cf6' },
      '09-21': { title: 'Yom Kippur 🕯️', color: '#8b5cf6' },
      '09-26': { title: 'Sukkot 🌿', color: '#10b981' },

      // October
      '10-03': { title: 'Simchat Torah 📜', color: '#8b5cf6' },
      '10-10': { title: 'Indigenous Peoples Long Weekend (Day 1) 🏖️', color: '#f59e0b' },
      '10-11': { title: 'Indigenous Peoples Long Weekend (Day 2) 🏖️', color: '#f59e0b' },
      '10-12': { title: "Columbus Day / Indigenous Peoples' Day 🌎 (Long Weekend)", color: '#f59e0b' },

      // November
      '11-26': { title: 'Thanksgiving Day 🦃 (Long Weekend)', color: '#d97706' },
      '11-27': { title: 'Black Friday 🛍️ (Thanksgiving Long Weekend)', color: '#d97706' },
      '11-28': { title: 'Thanksgiving Long Weekend (Day 3) 🏖️', color: '#d97706' },
      '11-29': { title: 'First Sunday of Advent 🕯️ (Thanksgiving Long Weekend)', color: '#6366f1' },

      // December
      '12-05': { title: 'Hanukkah (Chanukah) 🕎', color: '#3b82f6' },
      '12-06': { title: 'Second Sunday of Advent 🕯️', color: '#6366f1' },
      '12-13': { title: 'Third Sunday of Advent 🕯️', color: '#6366f1' },
      '12-20': { title: 'Fourth Sunday of Advent 🕯️', color: '#6366f1' },
      '12-25': { title: 'Christmas Day 🎁 (Long Weekend)', color: '#ef4444' },
      '12-26': { title: 'Boxing Day 🥊 (Christmas Long Weekend)', color: '#ef4444' },
      '12-27': { title: 'Christmas Long Weekend (Day 3) 🏖️', color: '#ef4444' },
    };

    if (dynamic2026[key]) {
      return {
        id: `holiday-${dateStr}`,
        title: dynamic2026[key].title,
        event_type: 'task',
        event_date: dateStr,
        start_time: '09:00',
        end_time: '10:00',
        location: '',
        color: dynamic2026[key].color || '#8b5cf6',
        profile: 'Both',
      };
    }
  }

  return null;
}
