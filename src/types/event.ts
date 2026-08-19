export type EventCategory = 'Work' | 'Personal' | 'Meeting' | 'Other';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm)
  end: string;   // ISO date string
  description?: string;
  color: string;
  category: EventCategory;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NewCalendarEventPayload {
  title: string;
  start: string;
  end: string;
  description?: string;
  color: string;
  category: EventCategory;
  createdBy: string;
}

export const CATEGORY_COLORS: Record<EventCategory, { hex: string; bg: string; border: string; text: string }> = {
  Work: { hex: '#3B82F6', bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-700' },
  Personal: { hex: '#10B981', bg: 'bg-emerald-100', border: 'border-emerald-500', text: 'text-emerald-700' },
  Meeting: { hex: '#8B5CF6', bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-700' },
  Other: { hex: '#F59E0B', bg: 'bg-amber-100', border: 'border-amber-500', text: 'text-amber-700' },
};
