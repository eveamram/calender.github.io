-- ====================================================================
-- HOUSEHOLD RLS LOCKDOWN
-- ====================================================================
-- Run this in the Supabase SQL editor AFTER login is live and at least
-- one household account exists (Eve has signed in on the deployed app).
--
-- Running this while the old unauthenticated client is still live will
-- break it: logged-out visitors will no longer be able to load data.
-- ====================================================================

-- Enable RLS on all 10 household tables (no-op if already enabled)
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

-- Drop legacy anonymous/public policies
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

-- Revoke anon; keep authenticated household access.
-- Authenticated policies remain USING (true) so existing Eve/Abbie/Both
-- rows continue to load for every signed-in household member.
REVOKE ALL ON TABLE public.events FROM anon;
REVOKE ALL ON TABLE public.classes FROM anon;
REVOKE ALL ON TABLE public.tasks FROM anon;
REVOKE ALL ON TABLE public.habits FROM anon;
REVOKE ALL ON TABLE public.habit_completions FROM anon;
REVOKE ALL ON TABLE public.grocery_items FROM anon;
REVOKE ALL ON TABLE public.meal_items FROM anon;
REVOKE ALL ON TABLE public.book_items FROM anon;
REVOKE ALL ON TABLE public.profile_colors FROM anon;
REVOKE ALL ON TABLE public.date_colors FROM anon;

GRANT ALL ON TABLE public.events TO authenticated;
GRANT ALL ON TABLE public.classes TO authenticated;
GRANT ALL ON TABLE public.tasks TO authenticated;
GRANT ALL ON TABLE public.habits TO authenticated;
GRANT ALL ON TABLE public.habit_completions TO authenticated;
GRANT ALL ON TABLE public.grocery_items TO authenticated;
GRANT ALL ON TABLE public.meal_items TO authenticated;
GRANT ALL ON TABLE public.book_items TO authenticated;
GRANT ALL ON TABLE public.profile_colors TO authenticated;
GRANT ALL ON TABLE public.date_colors TO authenticated;
