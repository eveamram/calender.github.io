-- ====================================================================
-- SUPABASE SCHEMA FOR CALENDER.GITHUB.IO
-- Multi-Device Shared Calendar, Habits, Tasks, & Reading Sanctuary
-- ====================================================================

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

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) & AUTHORIZATION POLICIES
-- Permissive policies for anon public key to allow Eve & Abbie shared CRUD
-- ====================================================================

-- Enable RLS on all 10 tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habitCompletions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groceryItems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mealItems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookItems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profileColors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dateColors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to prevent duplication errors
DROP POLICY IF EXISTS "Anon public access for events" ON public.events;
DROP POLICY IF EXISTS "Anon public access for classes" ON public.classes;
DROP POLICY IF EXISTS "Anon public access for tasks" ON public.tasks;
DROP POLICY IF EXISTS "Anon public access for habits" ON public.habits;
DROP POLICY IF EXISTS "Anon public access for habitCompletions" ON public.habitCompletions;
DROP POLICY IF EXISTS "Anon public access for groceryItems" ON public.groceryItems;
DROP POLICY IF EXISTS "Anon public access for mealItems" ON public.mealItems;
DROP POLICY IF EXISTS "Anon public access for bookItems" ON public.bookItems;
DROP POLICY IF EXISTS "Anon public access for profileColors" ON public.profileColors;
DROP POLICY IF EXISTS "Anon public access for dateColors" ON public.dateColors;

-- Create shared RLS policies for anonymous/public access
CREATE POLICY "Anon public access for events" ON public.events FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon public access for classes" ON public.classes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon public access for tasks" ON public.tasks FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon public access for habits" ON public.habits FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon public access for habitCompletions" ON public.habitCompletions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon public access for groceryItems" ON public.groceryItems FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon public access for mealItems" ON public.mealItems FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon public access for bookItems" ON public.bookItems FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon public access for profileColors" ON public.profileColors FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon public access for dateColors" ON public.dateColors FOR ALL TO anon USING (true) WITH CHECK (true);

-- Also allow authenticated role access if users authenticate in the future
CREATE POLICY "Authenticated access for events" ON public.events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access for classes" ON public.classes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access for tasks" ON public.tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access for habits" ON public.habits FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access for habitCompletions" ON public.habitCompletions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access for groceryItems" ON public.groceryItems FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access for mealItems" ON public.mealItems FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access for bookItems" ON public.bookItems FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access for profileColors" ON public.profileColors FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access for dateColors" ON public.dateColors FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ====================================================================
-- SUPABASE REALTIME REPLICATION PUBLICATION
-- Enable websocket change notifications for all 10 tables
-- ====================================================================

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
