export type ProfilePersona = 'Eve' | 'Abbie' | 'Both';

export type AppTab =
  | 'calendar'
  | 'classes'
  | 'todo'
  | 'habits'
  | 'grocery'
  | 'meals'
  | 'books';

export type EventType =
  | 'class'
  | 'exam'
  | 'assignment'
  | 'appointment'
  | 'birthday'
  | 'trip'
  | 'personal'
  | 'meeting'
  | 'work'
  | 'study'
  | 'task';

export interface CalendarEvent {
  id: string;
  title: string;
  event_type: EventType;
  event_date: string; // YYYY-MM-DD
  start_time?: string; // HH:MM
  end_time?: string;   // HH:MM
  location?: string;
  color?: string;
  task_id?: string;
  profile?: ProfilePersona;
  created_at?: string;
  updated_at?: string;
}

export interface ClassItem {
  id: string;
  name: string;
  instructor?: string;
  room?: string;
  start_time: string; // HH:MM
  end_time: string;   // HH:MM
  days_of_week: number[]; // 1=Mon, 2=Tue, ..., 7=Sun
  color?: string;
  profile?: ProfilePersona;
  created_at?: string;
  updated_at?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  is_completed: boolean;
  due_date?: string; // YYYY-MM-DD
  due_time?: string; // HH:MM
  priority?: 'low' | 'normal' | 'high';
  profile?: ProfilePersona;
  created_at?: string;
  updated_at?: string;
}

export interface HabitItem {
  id: string;
  title: string;
  emoji?: string;
  target_quantity?: number;
  target_unit?: string;
  active_days?: number[]; // 1..7
  color?: string;
  profile?: ProfilePersona;
  created_at?: string;
  updated_at?: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  current_quantity?: number;
  created_at?: string;
}

export type GroceryCategory =
  | 'Produce'
  | 'Dairy'
  | 'Bakery'
  | 'Pantry'
  | 'Household'
  | 'Other';

export interface GroceryItem {
  id: string;
  name: string;
  quantity?: string;
  category: GroceryCategory;
  is_completed: boolean;
  profile?: ProfilePersona;
  created_at?: string;
  updated_at?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealItem {
  id: string;
  title: string;
  day_of_week: number; // 1=Mon, ..., 7=Sun
  meal_type: MealType;
  notes?: string;
  profile?: ProfilePersona;
  created_at?: string;
  updated_at?: string;
}

export type BookStatus = 'reading' | 'want_to_read' | 'completed';

export interface BookItem {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  current_page?: number;
  total_pages?: number;
  rating?: number; // 1-5
  genre?: string;
  profile?: ProfilePersona;
  created_at?: string;
  updated_at?: string;
}

export const CATEGORY_METAS: Record<EventType, { label: string; color: string }> = {
  class: { label: 'Class', color: '#2563eb' },       // blue
  exam: { label: 'Exam', color: '#dc2626' },         // red
  assignment: { label: 'Assignment', color: '#ea580c' }, // orange
  appointment: { label: 'Appointment', color: '#7c3aed' }, // purple
  birthday: { label: 'Birthday', color: '#db2777' }, // pink
  trip: { label: 'Trip', color: '#059669' },         // emerald
  personal: { label: 'Personal', color: '#475569' }, // slate
  meeting: { label: 'Meeting', color: '#0284c7' },   // sky
  work: { label: 'Work', color: '#4f46e5' },         // indigo
  study: { label: 'Study', color: '#d97706' },       // amber
  task: { label: 'Task', color: '#2563eb' },         // blue
};
