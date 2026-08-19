export type EventCategory = 'Work' | 'Personal' | 'Meeting' | 'Other';

/**
 * The core calendar event type as stored in Firestore and used in the UI.
 * `version` is critical for optimistic concurrency control.
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;   // ISO date string
  end: string;      // ISO date string
  description: string;
  color: string;
  category: EventCategory;
  createdBy: string;
  lastEditedBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;  // Incremented on every write; used for conflict detection
}

/** Payload for creating a new event (id, timestamps, version assigned server-side) */
export interface CreateEventPayload {
  title: string;
  start: string;
  end: string;
  description?: string;
  color: string;
  category: EventCategory;
  createdBy: string;
}

/** Category → color mapping */
export const CATEGORY_COLORS: Record<EventCategory, { hex: string; label: string }> = {
  Work:     { hex: '#3B82F6', label: 'Blue' },
  Personal: { hex: '#10B981', label: 'Emerald' },
  Meeting:  { hex: '#8B5CF6', label: 'Purple' },
  Other:    { hex: '#F59E0B', label: 'Amber' },
};
