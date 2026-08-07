import { addDays, format } from 'date-fns';

export interface ParsedEventData {
  title: string;
  dateStr: string;
  timeStr: string | null;
}

/**
 * Super fast natural language event parser
 * Parses strings like "Lunch with Sarah tomorrow at 1 PM" or "Physics exam next Friday"
 */
export function parseNaturalLanguageInput(input: string): ParsedEventData {
  const text = input.trim();
  if (!text) {
    return { title: '', dateStr: format(new Date(), 'yyyy-MM-dd'), timeStr: null };
  }

  let targetDate = new Date();
  let cleanTitle = text;
  let timeStr: string | null = null;

  const lower = text.toLowerCase();

  // Parse relative date words
  if (lower.includes('today')) {
    cleanTitle = cleanTitle.replace(/today/gi, '');
  } else if (lower.includes('tomorrow')) {
    targetDate = addDays(new Date(), 1);
    cleanTitle = cleanTitle.replace(/tomorrow/gi, '');
  } else if (lower.includes('next week')) {
    targetDate = addDays(new Date(), 7);
    cleanTitle = cleanTitle.replace(/next week/gi, '');
  }

  // Parse time (e.g. at 1 pm, at 14:00, 3pm, 10am)
  const timeRegex = /(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
  const timeMatch = lower.match(timeRegex);

  if (timeMatch && (timeMatch[3] || lower.includes('at '))) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const meridiem = timeMatch[3];

    if (meridiem === 'pm' && hours < 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;

    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    timeStr = `${formattedHours}:${formattedMinutes}`;

    cleanTitle = cleanTitle.replace(timeMatch[0], '');
  }

  // Clean up title
  cleanTitle = cleanTitle
    .replace(/\s+at\s*$/i, '')
    .replace(/\s+on\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    title: cleanTitle || text,
    dateStr: format(targetDate, 'yyyy-MM-dd'),
    timeStr,
  };
}
