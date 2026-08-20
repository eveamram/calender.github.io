export type EventCategory = 'Work' | 'Personal' | 'Meeting' | 'Exam' | 'Other';

/**
 * The core calendar event type as stored in Google Sheets and used in the UI.
 * `version` is used for optimistic tracking.
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;   // ISO date string e.g. 2026-08-25T10:00
  end: string;      // ISO date string e.g. 2026-08-25T12:00
  description: string;
  color: string;
  category: EventCategory;
  createdBy: string;
  lastEditedBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  event_type?: string;
  event_date?: string;
  due_date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  owner_user_id?: string | null;
  is_completed?: boolean;
  recurrence_days?: number[];
}

/** Payload for creating a new event */
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
  Exam:     { hex: '#EF4444', label: 'Red' },
  Other:    { hex: '#F59E0B', label: 'Amber' },
};
