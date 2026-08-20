import { CalendarEvent, CreateEventPayload } from '../types/event';

// Google Apps Script Web App URL
// This can be set in a .env file as VITE_GOOGLE_SCRIPT_URL or updated directly here.
export const GOOGLE_SCRIPT_URL =
  (import.meta.env.VITE_GOOGLE_SCRIPT_URL as string) || '';

export const isGoogleSheetsConfigured = (): boolean => {
  return (
    Boolean(GOOGLE_SCRIPT_URL) &&
    GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL' &&
    GOOGLE_SCRIPT_URL.startsWith('https://script.google.com/')
  );
};

/**
 * Fetch all events from Google Sheet
 */
export async function fetchSheetEvents(): Promise<CalendarEvent[]> {
  if (!isGoogleSheetsConfigured()) {
    console.warn('[googleSheets] Apps Script URL not configured yet.');
    return [];
  }

  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data = await res.json();
    if (Array.isArray(data)) {
      return data as CalendarEvent[];
    }
    return [];
  } catch (err) {
    console.error('[googleSheets] Error fetching events:', err);
    throw err;
  }
}

/**
 * Create a new event in Google Sheet
 */
export async function createSheetEvent(payload: CreateEventPayload & { id?: string }): Promise<CalendarEvent> {
  const newEvt: CalendarEvent = {
    id: payload.id || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: payload.title,
    start: payload.start,
    end: payload.end,
    description: payload.description || '',
    color: payload.color || '#3B82F6',
    category: payload.category || 'Other',
    createdBy: payload.createdBy || 'Anonymous',
    lastEditedBy: payload.createdBy || 'Anonymous',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  };

  if (!isGoogleSheetsConfigured()) {
    console.warn('[googleSheets] Apps Script URL not configured, returning local event');
    return newEvt;
  }

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Apps Script handles text/plain without CORS preflight issues
      body: JSON.stringify({
        action: 'create',
        event: newEvt,
      }),
    });
  } catch (err) {
    console.error('[googleSheets] Error creating event:', err);
  }

  return newEvt;
}

/**
 * Update an existing event in Google Sheet
 */
export async function updateSheetEvent(
  id: string,
  updates: Partial<CalendarEvent>,
  editedBy: string
): Promise<void> {
  if (!isGoogleSheetsConfigured()) return;

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'update',
        id,
        updates: {
          ...updates,
          lastEditedBy: editedBy,
          updatedAt: new Date().toISOString(),
        },
      }),
    });
  } catch (err) {
    console.error('[googleSheets] Error updating event:', err);
  }
}

/**
 * Delete an event in Google Sheet
 */
export async function deleteSheetEvent(id: string): Promise<void> {
  if (!isGoogleSheetsConfigured()) return;

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'delete',
        id,
      }),
    });
  } catch (err) {
    console.error('[googleSheets] Error deleting event:', err);
  }
}
