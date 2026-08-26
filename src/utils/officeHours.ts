export interface OfficeHourSlot {
  time: string;
  location: string;
}

export const HIDDEN_OFFICE_HOURS = '__hidden__';

export function isOfficeHoursHidden(cls: {
  office_hours?: string | null;
}): boolean {
  return (cls.office_hours || '').trim() === HIDDEN_OFFICE_HOURS;
}

export function hiddenOfficeHoursPayload(): {
  office_hours: string;
  office_hours_location: string;
} {
  return { office_hours: HIDDEN_OFFICE_HOURS, office_hours_location: '' };
}

function asSlot(item: unknown, fallbackRoom: string): OfficeHourSlot | null {
  if (typeof item === 'string') {
    const time = item.trim();
    if (!time && !fallbackRoom) return null;
    return { time, location: fallbackRoom };
  }
  if (item && typeof item === 'object') {
    const rec = item as Record<string, unknown>;
    const time = String(rec.time ?? rec.hours ?? '').trim();
    const location = String(rec.location ?? rec.room ?? fallbackRoom).trim();
    if (!time && !location) return null;
    return { time, location };
  }
  return null;
}

export function parseOfficeHourSlots(
  officeHours?: string | null,
  officeLocation?: string | null
): OfficeHourSlot[] {
  const raw = (officeHours || '').trim();
  const fallbackRoom = (officeLocation || '').trim();
  if (!raw || raw === HIDDEN_OFFICE_HOURS) {
    return fallbackRoom ? [{ time: '', location: fallbackRoom }] : [];
  }

  if (raw.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => asSlot(item, fallbackRoom))
          .filter((slot): slot is OfficeHourSlot => Boolean(slot));
      }
    } catch {
      // Treat as plain text below.
    }
  }

  const lines = raw.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) {
    return fallbackRoom ? [{ time: '', location: fallbackRoom }] : [];
  }
  return lines.map((time) => ({ time, location: fallbackRoom }));
}

export function serializeOfficeHourSlots(slots: OfficeHourSlot[]): {
  office_hours: string;
  office_hours_location: string;
} {
  const cleaned = slots
    .map((slot) => ({
      time: (slot.time || '').trim(),
      location: (slot.location || '').trim(),
    }))
    .filter((slot) => slot.time || slot.location);

  if (cleaned.length === 0) {
    return { office_hours: '', office_hours_location: '' };
  }

  if (cleaned.length === 1) {
    return {
      office_hours: cleaned[0].time,
      office_hours_location: cleaned[0].location,
    };
  }

  const sharedRoom = cleaned.every((slot) => slot.location === cleaned[0].location)
    ? cleaned[0].location
    : '';
  return {
    office_hours: JSON.stringify(cleaned),
    office_hours_location: sharedRoom,
  };
}

export function classHasOfficeHours(cls: {
  office_hours?: string | null;
  office_hours_location?: string | null;
}): boolean {
  return parseOfficeHourSlots(cls.office_hours, cls.office_hours_location).length > 0;
}
