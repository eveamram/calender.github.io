export type EventType =
  | 'Exam'
  | 'Quiz'
  | 'Assignment'
  | 'Presentation'
  | 'Appointment'
  | 'Trip'
  | 'Birthday'
  | 'Other';

export interface CalendarEvent {
  id: string;
  calendar_id: string;
  created_by?: string | null;
  owner_user_id?: string | null;
  title: string;
  event_type: EventType;
  course: string;
  event_date: string; // YYYY-MM-DD
  start_time?: string | null; // HH:mm
  end_time?: string | null; // HH:mm
  is_all_day: boolean;
  location: string;
  notes: string;
  color: string;
  reminder_minutes: number;
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
}

export const EVENT_TYPES: { label: EventType; color: string; icon: string }[] = [
  { label: 'Exam', color: '#EF4444', icon: 'BookOpen' },
  { label: 'Quiz', color: '#F59E0B', icon: 'FileText' },
  { label: 'Assignment', color: '#8B5CF6', icon: 'CheckSquare' },
  { label: 'Presentation', color: '#3B82F6', icon: 'Presentation' },
  { label: 'Appointment', color: '#10B981', icon: 'CalendarPin' },
  { label: 'Trip', color: '#EC4899', icon: 'Plane' },
  { label: 'Birthday', color: '#F43F5E', icon: 'Cake' },
  { label: 'Other', color: '#6B7280', icon: 'Tag' },
];

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
