export type EventCategory =
  | 'School'
  | 'Personal'
  | 'Work'
  | 'Health'
  | 'Important'
  | 'Other';

export type EventType = EventCategory | string;

export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface CalendarEvent {
  id: string;
  calendar_id: string;
  created_by?: string | null;
  owner_user_id?: string | null;
  title: string;
  event_type: EventType;
  course?: string;
  event_date: string; // YYYY-MM-DD
  start_time?: string | null; // HH:mm
  end_time?: string | null; // HH:mm
  is_all_day: boolean;
  location?: string;
  notes?: string;
  color: string;
  reminder_minutes?: number;
  repeat?: RepeatType;
  emoji?: string;
  is_completed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Calendar {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
  created_by?: string | null;
}

export interface CalendarMember {
  id: string;
  calendar_id: string;
  user_id: string;
  display_name: string;
  profile_color: string;
  joined_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  profile_color: string;
}

export type ViewMode = 'month' | 'week' | 'agenda';

export interface FilterState {
  search: string;
  personFilter: 'all' | 'me' | 'friend' | string;
  eventTypeFilter: EventType | 'all';
  courseFilter: string | 'all';
  tabFilter?: 'calendar' | 'upcoming' | 'important' | 'settings';
}

export const CATEGORY_COLORS: { label: EventCategory; color: string; emoji: string; symbol: string }[] = [
  { label: 'School', color: '#3B82F6', emoji: '📚', symbol: '🔵' },
  { label: 'Personal', color: '#10B981', emoji: '🌿', symbol: '🟢' },
  { label: 'Work', color: '#F59E0B', emoji: '💼', symbol: '🟠' },
  { label: 'Health', color: '#8B5CF6', emoji: '🏋️', symbol: '🟣' },
  { label: 'Important', color: '#EF4444', emoji: '🚨', symbol: '🔴' },
];

export const EVENT_TYPES = CATEGORY_COLORS.map(c => ({
  label: c.label,
  color: c.color,
  icon: c.emoji
}));

export const PROFILE_COLORS = [
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
];
