-- ====================================================================
-- SUPABASE SCHEMA FOR CALENDER.GITHUB.IO
-- Multi-Device Shared Calendar, Habits, Tasks, & Reading Sanctuary
-- Standardized to PostgreSQL snake_case Table Names
-- ====================================================================

-- Safe Migration for Existing CamelCase Tables (if any exist in database)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'habitCompletions') THEN
    ALTER TABLE public."habitCompletions" RENAME TO habit_completions;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'groceryItems') THEN
    ALTER TABLE public."groceryItems" RENAME TO grocery_items;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'mealItems') THEN
    ALTER TABLE public."mealItems" RENAME TO meal_items;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bookItems') THEN
    ALTER TABLE public."bookItems" RENAME TO book_items;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profileColors') THEN
    ALTER TABLE public."profileColors" RENAME TO profile_colors;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'dateColors') THEN
    ALTER TABLE public."dateColors" RENAME TO date_colors;
  END IF;
END $$;

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
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;

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
  office_hours TEXT,
  office_hours_location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS office_hours TEXT;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS office_hours_location TEXT;

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
  show_in_daily_schedule BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS show_in_daily_schedule BOOLEAN DEFAULT FALSE;

-- 5. Habit Completions Table (snake_case)
CREATE TABLE IF NOT EXISTS public.habit_completions (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL,
  date TEXT NOT NULL,
  completed BOOLEAN DEFAULT TRUE,
  current_quantity INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Grocery Items Table (snake_case)
CREATE TABLE IF NOT EXISTS public.grocery_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  quantity TEXT,
  category TEXT DEFAULT 'Other',
  is_completed BOOLEAN DEFAULT FALSE,
  profile TEXT DEFAULT 'Eve',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Meal Items Table (snake_case with meal_date)
CREATE TABLE IF NOT EXISTS public.meal_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  day_of_week INT NOT NULL,
  meal_date TEXT,
  meal_type TEXT NOT NULL,
  notes TEXT,
  profile TEXT DEFAULT 'Eve',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure meal_date column exists if table was previously created
ALTER TABLE public.meal_items ADD COLUMN IF NOT EXISTS meal_date TEXT;

-- 8. Book Items Table (snake_case)
CREATE TABLE IF NOT EXISTS public.book_items (
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

-- 9. Profile Colors Table (snake_case)
CREATE TABLE IF NOT EXISTS public.profile_colors (
  id TEXT PRIMARY KEY,
  color TEXT NOT NULL
);

-- 10. Date Colors Table (snake_case)
CREATE TABLE IF NOT EXISTS public.date_colors (
  id TEXT PRIMARY KEY,
  color TEXT NOT NULL
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) & AUTHORIZATION POLICIES
-- ====================================================================

-- Enable RLS on all 10 tables
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_colors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to prevent duplication errors
DROP POLICY IF EXISTS "Anon public access for events" ON public.events;
DROP POLICY IF EXISTS "Anon public access for classes" ON public.classes;
DROP POLICY IF EXISTS "Anon public access for tasks" ON public.tasks;
DROP POLICY IF EXISTS "Anon public access for habits" ON public.habits;
DROP POLICY IF EXISTS "Anon public access for habit_completions" ON public.habit_completions;
DROP POLICY IF EXISTS "Anon public access for grocery_items" ON public.grocery_items;
DROP POLICY IF EXISTS "Anon public access for meal_items" ON public.meal_items;
DROP POLICY IF EXISTS "Anon public access for book_items" ON public.book_items;
DROP POLICY IF EXISTS "Anon public access for profile_colors" ON public.profile_colors;
DROP POLICY IF EXISTS "Anon public access for date_colors" ON public.date_colors;

-- Create shared RLS policies for anonymous/public access
CREATE POLICY "Anon public access for events" ON public.events FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon public access for classes" ON public.classes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon public access for tasks" ON public.tasks FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon public access for habits" ON public.habits FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon public access for habit_completions" ON public.habit_completions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon public access for grocery_items" ON public.grocery_items FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon public access for meal_items" ON public.meal_items FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon public access for book_items" ON public.book_items FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon public access for profile_colors" ON public.profile_colors FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon public access for date_colors" ON public.date_colors FOR ALL TO anon USING (true) WITH CHECK (true);

-- Also allow authenticated role access
CREATE POLICY "Authenticated access for events" ON public.events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access for classes" ON public.classes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access for tasks" ON public.tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access for habits" ON public.habits FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access for habit_completions" ON public.habit_completions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access for grocery_items" ON public.grocery_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access for meal_items" ON public.meal_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access for book_items" ON public.book_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access for profile_colors" ON public.profile_colors FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access for date_colors" ON public.date_colors FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ====================================================================
-- SUPABASE REALTIME REPLICATION PUBLICATION
-- Enable websocket change notifications for all 10 tables
-- ====================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.classes;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.habits;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.habit_completions;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.grocery_items;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.meal_items;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.book_items;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profile_colors;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.date_colors;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
