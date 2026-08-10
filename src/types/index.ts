export type UserRole = 'owner' | 'editor' | 'viewer';
export type ViewMode = 'month' | 'week' | 'day' | 'schedule' | 'agenda';

export type EventType =
  | 'class'
  | 'task'
  | 'exam'
  | 'appointment'
  | 'birthday'
  | 'trip'
  | 'personal'
  | 'meeting'
  | 'study'
  | 'School'
  | 'Event'
  | 'Personal'
  | 'Other';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  profile_color?: string;
  avatar_url?: string;
  is_admin?: boolean;
}

export type EventCategory = EventType;

export interface CategoryColor {
  label: string;
  type: EventType;
  color: string;
  textColor: string;
  emoji?: string;
}

export const CATEGORY_COLORS: CategoryColor[] = [
  { label: 'Class', type: 'class', color: '#3B82F6', textColor: '#FFFFFF', emoji: '📚' },
  { label: 'Task', type: 'task', color: '#F59E0B', textColor: '#FFFFFF', emoji: '📝' },
  { label: 'Exam', type: 'exam', color: '#EF4444', textColor: '#FFFFFF', emoji: '📝' },
  { label: 'Appointment', type: 'appointment', color: '#10B981', textColor: '#FFFFFF', emoji: '🩺' },
  { label: 'Birthday', type: 'birthday', color: '#EC4899', textColor: '#FFFFFF', emoji: '🎂' },
  { label: 'Trip', type: 'trip', color: '#8B5CF6', textColor: '#FFFFFF', emoji: '✈️' },
  { label: 'Personal', type: 'personal', color: '#06B6D4', textColor: '#FFFFFF', emoji: '☕' },
  { label: 'Study', type: 'study', color: '#6366F1', textColor: '#FFFFFF', emoji: '💡' },
];

export interface CalendarEvent {
  id: string;
  calendar_id?: string;
  owner_user_id?: string | null;
  created_by?: string;
  title: string;
  description?: string;
  event_type: EventType | string;
  event_date?: string;
  due_date?: string;
  start_time?: string;
  end_time?: string;
  is_all_day?: boolean;
  location?: string;
  color?: string;
  emoji?: string;
  course?: string;
  instructor?: string;
  is_completed?: boolean;
  show_on_calendar?: boolean; // Specific toggle per to-do item
  priority?: 'high' | 'normal' | 'low';
  recurrence_days?: number[]; // 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat, 7 = Sun
  term_start_date?: string; // e.g. "2026-08-24"
  term_end_date?: string; // e.g. "2026-12-04"
  notes?: string;
  image_url?: string;
  reminder_minutes?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SharedCalendar {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  invite_code?: string;
  created_at: string;
}

export type Calendar = SharedCalendar;

export interface CalendarMember {
  id: string;
  calendar_id: string;
  user_id: string;
  role?: UserRole;
  display_name: string;
  profile_color?: string;
  avatar_url?: string;
  joined_at?: string;
}

export interface FilterState {
  searchQuery?: string;
  search?: string;
  selectedCategories?: string[];
  selectedMembers?: string[];
  showCompleted?: boolean;
  tabFilter?: string;
  eventTypeFilter?: string;
  personFilter?: string;
  courseFilter?: string;
}
