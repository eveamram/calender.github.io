-- ====================================================================
-- Shared Student Calendar - Complete Supabase Database Schema
-- Execute this script in your Supabase SQL Editor (https://app.supabase.com)
-- ====================================================================

-- 1. Create Tables with TEXT Primary Keys for real-time synchronization

CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    event_type TEXT NOT NULL DEFAULT 'personal',
    event_date DATE NOT NULL,
    start_time TEXT,
    end_time TEXT,
    location TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    color TEXT DEFAULT '#3b82f6',
    profile TEXT DEFAULT 'Eve',
    task_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    instructor TEXT DEFAULT '',
    room TEXT DEFAULT '',
    days_of_week JSONB DEFAULT '[]'::jsonb,
    start_time TEXT NOT NULL DEFAULT '09:00',
    end_time TEXT NOT NULL DEFAULT '10:00',
    color TEXT DEFAULT '#2563eb',
    profile TEXT DEFAULT 'Eve',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    due_date DATE,
    due_time TEXT,
    category TEXT DEFAULT 'school',
    profile TEXT DEFAULT 'Eve',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.habits (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    frequency TEXT DEFAULT 'daily',
    target_count INTEGER DEFAULT 1,
    unit TEXT DEFAULT 'times',
    color TEXT DEFAULT '#8b5cf6',
    profile TEXT DEFAULT 'Eve',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."habitCompletions" (
    id TEXT PRIMARY KEY,
    habit_id TEXT NOT NULL,
    date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT true,
    current_quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."groceryItems" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    is_completed BOOLEAN NOT NULL DEFAULT false,
    quantity TEXT DEFAULT '1',
    profile TEXT DEFAULT 'Eve',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."mealItems" (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    meal_type TEXT NOT NULL, -- breakfast, lunch, dinner, snack
    title TEXT NOT NULL,
    notes TEXT DEFAULT '',
    profile TEXT DEFAULT 'Eve',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."bookItems" (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT DEFAULT '',
    status TEXT DEFAULT 'want-to-read', -- want-to-read, reading, completed
    rating INTEGER DEFAULT 0,
    notes TEXT DEFAULT '',
    profile TEXT DEFAULT 'Eve',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."profileColors" (
    id TEXT PRIMARY KEY,
    color TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public."dateColors" (
    id TEXT PRIMARY KEY,
    color TEXT NOT NULL
);

-- 2. Row Level Security (RLS) - Public Read & Write Access for App Realtime
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."habitCompletions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."groceryItems" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."mealItems" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."bookItems" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."profileColors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."dateColors" ENABLE ROW LEVEL SECURITY;

-- Allow anonymous & authenticated access for public app operation
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'events', 'classes', 'tasks', 'habits', 'habitCompletions',
        'groceryItems', 'mealItems', 'bookItems', 'profileColors', 'dateColors'
    ]) LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public access on %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Public access on %I" ON public.%I FOR ALL USING (true) WITH CHECK (true)', tbl, tbl);
        -- Enable FULL Replica Identity to ensure DELETE events carry complete payload (including id)
        EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', tbl);
    END LOOP;
END $$;

-- 3. Enable Realtime Publications for Postgres Changes Listener
BEGIN;
  DO $$
  DECLARE
      tbl text;
  BEGIN
      IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
          FOR tbl IN SELECT unnest(ARRAY[
              'events', 'classes', 'tasks', 'habits', 'habitCompletions',
              'groceryItems', 'mealItems', 'bookItems', 'profileColors', 'dateColors'
          ]) LOOP
              BEGIN
                  EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
              EXCEPTION WHEN OTHERS THEN
                  -- Table already in publication
                  NULL;
              END;
          END LOOP;
      END IF;
  END $$;
COMMIT;
