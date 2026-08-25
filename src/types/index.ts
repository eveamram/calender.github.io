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
  is_completed?: boolean;
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
  office_hours?: string;
  office_hours_location?: string;
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
  show_in_daily_schedule?: boolean;
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
  meal_date?: string; // YYYY-MM-DD
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
  eve_page?: number;
  abbie_page?: number;
  rating?: number; // 1-5
  genre?: string;
  profile?: ProfilePersona;
  created_at?: string;
  updated_at?: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  emoji: string;
  gradient: string;
  accent: string;
  activeBorder: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'candy',
    name: 'Candy Pastel',
    emoji: '🍬',
    gradient: 'from-pink-100/70 via-purple-100/50 to-blue-100/70',
    accent: '#ec4899',
    activeBorder: 'border-pink-300',
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    emoji: '🌅',
    gradient: 'from-amber-100/70 via-rose-100/50 to-orange-100/70',
    accent: '#f97316',
    activeBorder: 'border-orange-300',
  },
  {
    id: 'aurora',
    name: 'Lavender Aurora',
    emoji: '🌌',
    gradient: 'from-indigo-100/70 via-purple-100/50 to-sky-100/70',
    accent: '#8b5cf6',
    activeBorder: 'border-indigo-300',
  },
  {
    id: 'emerald',
    name: 'Emerald Mint',
    emoji: '🌿',
    gradient: 'from-emerald-100/70 via-teal-100/50 to-cyan-100/70',
    accent: '#10b981',
    activeBorder: 'border-emerald-300',
  },
];

export const CATEGORY_METAS: Record<
  EventType,
  { label: string; color: string; emoji: string; bg: string }
> = {
  class: { label: 'Class', color: '#2563eb', emoji: '📚', bg: '#eff6ff' },
  exam: { label: 'Exam', color: '#ef4444', emoji: '✍️', bg: '#fef2f2' },
  assignment: { label: 'Assignment', color: '#f97316', emoji: '📝', bg: '#fff7ed' },
  appointment: { label: 'Coffee & Appt', color: '#8b5cf6', emoji: '☕', bg: '#f5f3ff' },
  birthday: { label: 'Birthday & Event', color: '#ec4899', emoji: '🎂', bg: '#fdf2f8' },
  trip: { label: 'Trip & Travel', color: '#10b981', emoji: '✈️', bg: '#ecfdf5' },
  personal: { label: 'Personal', color: '#6366f1', emoji: '🎯', bg: '#eef2ff' },
  meeting: { label: 'Meeting', color: '#06b6d4', emoji: '👥', bg: '#ecfeff' },
  work: { label: 'Work', color: '#4f46e5', emoji: '💼', bg: '#eef2ff' },
  study: { label: 'Study Session', color: '#d97706', emoji: '🧠', bg: '#fef3c7' },
  task: { label: 'Task', color: '#3b82f6', emoji: '✅', bg: '#eff6ff' },
};

