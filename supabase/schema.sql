-- ====================================================================
-- Shared Student Calendar - Supabase Database Schema & RLS Policies
-- Execute this script in your Supabase SQL Editor (https://app.supabase.com)
-- ====================================================================

-- 1. Create Tables

-- Calendars Table
CREATE TABLE IF NOT EXISTS public.calendars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    invite_code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Calendar Members Table (Junction table linking users to calendars)
CREATE TABLE IF NOT EXISTS public.calendar_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calendar_id UUID NOT NULL REFERENCES public.calendars(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    profile_color TEXT NOT NULL DEFAULT '#3B82F6',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_calendar_user UNIQUE (calendar_id, user_id)
);

-- Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calendar_id UUID NOT NULL REFERENCES public.calendars(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    event_type TEXT NOT NULL DEFAULT 'Exam',
    course TEXT NOT NULL DEFAULT '',
    event_date DATE NOT NULL,
    start_time TEXT,
    end_time TEXT,
    is_all_day BOOLEAN NOT NULL DEFAULT true,
    location TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    color TEXT NOT NULL DEFAULT '#EF4444',
    reminder_minutes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_calendar_members_user ON public.calendar_members(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_members_calendar ON public.calendar_members(calendar_id);
CREATE INDEX IF NOT EXISTS idx_events_calendar ON public.events(calendar_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_owner ON public.events(owner_user_id);

-- 3. Row Level Security (RLS) Setup

ALTER TABLE public.calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Security Definer helper function to avoid recursion in RLS policies
CREATE OR REPLACE FUNCTION public.is_member_of_calendar(_calendar_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.calendar_members
        WHERE calendar_id = _calendar_id
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Calendars RLS Policies
CREATE POLICY "Users can view calendars they belong to or by invite code" ON public.calendars
    FOR SELECT USING (
        public.is_member_of_calendar(id) OR auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can create calendars" ON public.calendars
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Members can update their calendar" ON public.calendars
    FOR UPDATE USING (public.is_member_of_calendar(id));

CREATE POLICY "Creator can delete calendar" ON public.calendars
    FOR DELETE USING (created_by = auth.uid());

-- Calendar Members RLS Policies
CREATE POLICY "Members can view co-members of their calendars" ON public.calendar_members
    FOR SELECT USING (
        public.is_member_of_calendar(calendar_id) OR user_id = auth.uid()
    );

CREATE POLICY "Users can join calendars as member" ON public.calendar_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their member profile" ON public.calendar_members
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can leave or calendar creator can remove member" ON public.calendar_members
    FOR DELETE USING (user_id = auth.uid() OR public.is_member_of_calendar(calendar_id));

-- Events RLS Policies
CREATE POLICY "Members can view events in their calendar" ON public.events
    FOR SELECT USING (public.is_member_of_calendar(calendar_id));

CREATE POLICY "Members can insert events into their calendar" ON public.events
    FOR INSERT WITH CHECK (public.is_member_of_calendar(calendar_id));

CREATE POLICY "Members can update events in their calendar" ON public.events
    FOR UPDATE USING (public.is_member_of_calendar(calendar_id));

CREATE POLICY "Members can delete events in their calendar" ON public.events
    FOR DELETE USING (public.is_member_of_calendar(calendar_id));

-- 4. Enable Supabase Realtime for Events and Members
BEGIN;
  -- Drop publication if exists or alter publication
  DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.events, public.calendar_members;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Ignore if already added
    NULL;
  END $$;
COMMIT;
