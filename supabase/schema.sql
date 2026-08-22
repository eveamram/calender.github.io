-- Supabase PostgreSQL Schema for calender.github.io
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  location TEXT,
  color TEXT,
  task_id TEXT,
  profile TEXT DEFAULT 'Eve',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Classes Table
CREATE TABLE IF NOT EXISTS public.classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  instructor TEXT,
  room TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  days_of_week INT[] NOT NULL,
  color TEXT,
  profile TEXT DEFAULT 'Eve',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  due_date TEXT,
  due_time TEXT,
  priority TEXT DEFAULT 'normal',
  profile TEXT DEFAULT 'Eve',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Habits Table
CREATE TABLE IF NOT EXISTS public.habits (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  emoji TEXT,
  target_quantity INT DEFAULT 1,
  target_unit TEXT,
  active_days INT[],
  color TEXT,
  profile TEXT DEFAULT 'Eve',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Habit Completions Table
CREATE TABLE IF NOT EXISTS public.habitCompletions (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL,
  date TEXT NOT NULL,
  completed BOOLEAN DEFAULT TRUE,
  current_quantity INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Grocery Items Table
CREATE TABLE IF NOT EXISTS public.groceryItems (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  quantity TEXT,
  category TEXT DEFAULT 'Other',
  is_completed BOOLEAN DEFAULT FALSE,
  profile TEXT DEFAULT 'Eve',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Meal Items Table
CREATE TABLE IF NOT EXISTS public.mealItems (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  day_of_week INT NOT NULL,
  meal_type TEXT NOT NULL,
  notes TEXT,
  profile TEXT DEFAULT 'Eve',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Book Items Table
CREATE TABLE IF NOT EXISTS public.bookItems (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  status TEXT DEFAULT 'reading',
  current_page INT DEFAULT 0,
  total_pages INT DEFAULT 300,
  eve_page INT DEFAULT 0,
  abbie_page INT DEFAULT 0,
  rating INT DEFAULT 0,
  genre TEXT,
  profile TEXT DEFAULT 'Eve',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Profile Colors Table
CREATE TABLE IF NOT EXISTS public.profileColors (
  id TEXT PRIMARY KEY,
  color TEXT NOT NULL
);

-- 10. Date Colors Table
CREATE TABLE IF NOT EXISTS public.dateColors (
  id TEXT PRIMARY KEY,
  color TEXT NOT NULL
);

-- Disable Row Level Security (RLS) or enable public read/write policies for anonymous access
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.habitCompletions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.groceryItems DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mealItems DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookItems DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profileColors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dateColors DISABLE ROW LEVEL SECURITY;

-- Enable Realtime replication for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.classes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.habits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.habitCompletions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.groceryItems;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mealItems;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookItems;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profileColors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dateColors;
