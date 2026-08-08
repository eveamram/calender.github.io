import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import {
  Calendar,
  CalendarEvent,
  CalendarMember,
  FilterState,
  ViewMode,
  EventType,
} from '../types';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface CalendarContextType {
  activeCalendar: Calendar | null;
  members: CalendarMember[];
  events: CalendarEvent[];
  filteredEvents: CalendarEvent[];
  loading: boolean;
  isOffline: boolean;
  syncError: string | null;
  toasts: Toast[];
  viewMode: ViewMode;
  currentDate: Date;
  filterState: FilterState;
  
  setViewMode: (mode: ViewMode) => void;
  setCurrentDate: (date: Date | ((prev: Date) => Date)) => void;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  
  createCalendar: (name: string) => Promise<{ calendar: Calendar | null; error: Error | null }>;
  joinCalendar: (inviteCode: string) => Promise<{ calendar: Calendar | null; error: Error | null }>;
  addEvent: (eventData: Omit<CalendarEvent, 'id' | 'calendar_id' | 'created_at' | 'updated_at'>) => Promise<{ error: Error | null }>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<{ error: Error | null }>;
  deleteEvent: (id: string) => Promise<{ error: Error | null }>;
  toggleEventCompleted: (id: string) => Promise<void>;
  updateMemberProfile: (userId: string, updates: Partial<CalendarMember>) => void;
  
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  leaveCalendar: () => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

// Initial Mock Calendar for unconfigured/demo state
const DEMO_CALENDAR: Calendar = {
  id: 'demo-cal-123',
  name: 'Study Duo 2026',
  invite_code: 'STUDY-2026-X89',
  created_at: new Date().toISOString(),
  created_by: 'demo-user-1',
};

const DEMO_MEMBERS: CalendarMember[] = [
  {
    id: 'mem-1',
    calendar_id: 'demo-cal-123',
    user_id: 'user-eve-1',
    display_name: 'Eve',
    profile_color: '#3B82F6',
    joined_at: new Date().toISOString(),
  },
  {
    id: 'mem-2',
    calendar_id: 'demo-cal-123',
    user_id: 'user-abbie-2',
    display_name: 'Abbie',
    profile_color: '#EC4899',
    joined_at: new Date().toISOString(),
  },
];

const generateInitialDemoEvents = (): CalendarEvent[] => {
  const today = new Date();
  const getISOString = (dayOffset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + dayOffset);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'evt-1',
      calendar_id: 'demo-cal-123',
      created_by: 'demo-user-1',
      owner_user_id: 'demo-user-1',
      title: 'CS 101 Midterm Exam',
      event_type: 'Exam',
      course: 'CS 101',
      event_date: getISOString(3),
      start_time: '10:00',
      end_time: '12:00',
      is_all_day: false,
      location: 'Science Hall 302',
      notes: 'Chapters 1-6 covered. Bring 2B pencils.',
      color: '#EF4444',
      reminder_minutes: 60,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'evt-2',
      calendar_id: 'demo-cal-123',
      created_by: 'demo-user-2',
      owner_user_id: 'demo-user-2',
      title: 'Physics Lab Report',
      event_type: 'Assignment',
      course: 'PHYS 201',
      event_date: getISOString(1),
      start_time: '23:59',
      end_time: '23:59',
      is_all_day: true,
      location: 'Canvas Upload',
      notes: 'Submit PDF with error calculations.',
      color: '#8B5CF6',
      reminder_minutes: 120,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'evt-3',
      calendar_id: 'demo-cal-123',
      created_by: 'demo-user-1',
      owner_user_id: 'demo-user-1',
      title: 'Calculus II Quiz',
      event_type: 'Quiz',
      course: 'MATH 152',
      event_date: getISOString(7),
      start_time: '14:00',
      end_time: '14:45',
      is_all_day: false,
      location: 'Math Annex B',
      notes: 'Integration by parts and trigonometric substitution.',
      color: '#F59E0B',
      reminder_minutes: 30,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'evt-4',
      calendar_id: 'demo-cal-123',
      created_by: 'demo-user-2',
      owner_user_id: 'demo-user-2',
      title: 'Weekend Study Trip',
      event_type: 'Trip',
      course: 'General',
      event_date: getISOString(12),
      start_time: '09:00',
      end_time: '18:00',
      is_all_day: true,
      location: 'Library Study Cabin',
      notes: 'Group study session for finals.',
      color: '#EC4899',
      reminder_minutes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
};

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile, isDemoMode } = useAuth();
  const [activeCalendar, setActiveCalendar] = useState<Calendar | null>(null);
  const [members, setMembers] = useState<CalendarMember[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [filterState, setFilterState] = useState<FilterState>({
    search: '',
    personFilter: 'all',
    eventTypeFilter: 'all',
    courseFilter: 'all',
  });

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Online / Offline monitor
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      addToast('Internet connection restored.', 'success');
    };
    const handleOffline = () => {
      setIsOffline(true);
      addToast('Working offline. Changes will sync when reconnected.', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addToast]);

  // Load user's primary calendar
  const loadUserCalendar = useCallback(async () => {
    // Check local storage cache first for instant load
    const cachedEvents = localStorage.getItem('calender_events_storage');
    const initialEvents = cachedEvents ? JSON.parse(cachedEvents) : generateInitialDemoEvents();

    if (!isSupabaseConfigured() || isDemoMode || !user) {
      setActiveCalendar(DEMO_CALENDAR);
      setMembers(DEMO_MEMBERS);
      setEvents(initialEvents);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setSyncError(null);

      // Find calendar membership
      const { data: memberRecords, error: memberErr } = await supabase
        .from('calendar_members')
        .select('calendar_id')
        .eq('user_id', user.id)
        .limit(1);

      if (memberErr) throw memberErr;

      if (!memberRecords || memberRecords.length === 0) {
        // No calendar joined yet
        setActiveCalendar(null);
        setMembers([]);
        setEvents([]);
        setLoading(false);
        return;
      }

      const calId = memberRecords[0].calendar_id;

      // Fetch Calendar details
      const { data: calData, error: calErr } = await supabase
        .from('calendars')
        .select('*')
        .eq('id', calId)
        .single();

      if (calErr) throw calErr;
      setActiveCalendar(calData);

      // Fetch Members
      const { data: membersData, error: membersErr } = await supabase
        .from('calendar_members')
        .select('*')
        .eq('calendar_id', calId);

      if (membersErr) throw membersErr;
      setMembers(membersData || []);

      // Fetch Events
      const { data: eventsData, error: eventsErr } = await supabase
        .from('events')
        .select('*')
        .eq('calendar_id', calId)
        .order('event_date', { ascending: true });

      if (eventsErr) throw eventsErr;
      setEvents(eventsData || []);

    } catch (e: any) {
      console.error('Error loading calendar:', e);
      setSyncError(e.message || 'Failed to sync with Supabase.');
    } finally {
      setLoading(false);
    }
  }, [user, isDemoMode]);

  useEffect(() => {
    loadUserCalendar();
  }, [loadUserCalendar]);

  // Persistent LocalStorage auto-save sync
  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('calender_events_storage', JSON.stringify(events));
    }
  }, [events]);

  // Supabase Realtime Subscription
  useEffect(() => {
    if (!isSupabaseConfigured() || isDemoMode || !activeCalendar) {
      return;
    }

    const calendarId = activeCalendar.id;

    const channel = supabase
      .channel(`realtime:calendar_${calendarId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `calendar_id=eq.${calendarId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newEvt = payload.new as CalendarEvent;
            setEvents((prev) => {
              if (prev.some((e) => e.id === newEvt.id)) return prev;
              return [...prev, newEvt].sort((a, b) => a.event_date.localeCompare(b.event_date));
            });
            addToast(`New event added: "${newEvt.title}"`, 'info');
          } else if (payload.eventType === 'UPDATE') {
            const updatedEvt = payload.new as CalendarEvent;
            setEvents((prev) =>
              prev.map((e) => (e.id === updatedEvt.id ? updatedEvt : e))
            );
            addToast(`Event updated: "${updatedEvt.title}"`, 'info');
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            setEvents((prev) => prev.filter((e) => e.id !== deletedId));
            addToast('An event was removed from calendar.', 'info');
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_members',
          filter: `calendar_id=eq.${calendarId}`,
        },
        async () => {
          // Refresh members list when someone joins/updates profile
          const { data } = await supabase
            .from('calendar_members')
            .select('*')
            .eq('calendar_id', calendarId);
          if (data) setMembers(data);
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          setSyncError('Realtime channel connection error.');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeCalendar, isDemoMode, addToast]);

  // Calendar Actions
  const createCalendar = async (name: string) => {
    const inviteCode = 'STUDY-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
    
    if (!isSupabaseConfigured() || isDemoMode || !user) {
      const newCal: Calendar = {
        id: 'demo-cal-' + Date.now(),
        name,
        invite_code: inviteCode,
        created_at: new Date().toISOString(),
        created_by: userProfile?.id || 'demo-user-1',
      };
      setActiveCalendar(newCal);
      addToast(`Created shared calendar "${name}"`, 'success');
      return { calendar: newCal, error: null };
    }

    try {
      const { data: cal, error: calErr } = await supabase
        .from('calendars')
        .insert({
          name,
          invite_code: inviteCode,
          created_by: user.id,
        })
        .select()
        .single();

      if (calErr) throw calErr;

      // Add user to calendar_members
      const { error: memErr } = await supabase
        .from('calendar_members')
        .insert({
          calendar_id: cal.id,
          user_id: user.id,
          display_name: userProfile?.display_name || user.email?.split('@')[0] || 'Friend',
          profile_color: userProfile?.profile_color || '#3B82F6',
        });

      if (memErr) throw memErr;

      setActiveCalendar(cal);
      await loadUserCalendar();
      addToast(`Shared calendar "${name}" created!`, 'success');
      return { calendar: cal, error: null };
    } catch (e: any) {
      return { calendar: null, error: e as Error };
    }
  };

  const joinCalendar = async (inviteCode: string) => {
    const cleanCode = inviteCode.trim().toUpperCase();

    if (!isSupabaseConfigured() || isDemoMode || !user) {
      if (cleanCode === DEMO_CALENDAR.invite_code || cleanCode.length > 3) {
        setActiveCalendar(DEMO_CALENDAR);
        addToast('Joined shared calendar!', 'success');
        return { calendar: DEMO_CALENDAR, error: null };
      }
      return { calendar: null, error: new Error('Invalid invite code.') };
    }

    try {
      const { data: cal, error: calErr } = await supabase
        .from('calendars')
        .select('*')
        .ilike('invite_code', cleanCode)
        .single();

      if (calErr || !cal) {
        return { calendar: null, error: new Error('Calendar not found with that invite code.') };
      }

      // Check if already member
      const { data: existing } = await supabase
        .from('calendar_members')
        .select('id')
        .eq('calendar_id', cal.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existing) {
        const { error: joinErr } = await supabase
          .from('calendar_members')
          .insert({
            calendar_id: cal.id,
            user_id: user.id,
            display_name: userProfile?.display_name || user.email?.split('@')[0] || 'Friend',
            profile_color: userProfile?.profile_color || '#3B82F6',
          });

        if (joinErr) throw joinErr;
      }

      setActiveCalendar(cal);
      await loadUserCalendar();
      addToast(`Joined "${cal.name}" successfully!`, 'success');
      return { calendar: cal, error: null };
    } catch (e: any) {
      return { calendar: null, error: e as Error };
    }
  };

  const addEvent = async (
    eventData: Omit<CalendarEvent, 'id' | 'calendar_id' | 'created_at' | 'updated_at'>
  ) => {
    if (!activeCalendar) {
      return { error: new Error('No active calendar selected.') };
    }

    const newEvt: CalendarEvent = {
      ...eventData,
      id: 'evt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      calendar_id: activeCalendar.id,
      created_by: userProfile?.id || 'demo-user-1',
      owner_user_id: eventData.owner_user_id || userProfile?.id || 'demo-user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured() || isDemoMode) {
      setEvents((prev) => [...prev, newEvt].sort((a, b) => a.event_date.localeCompare(b.event_date)));
      addToast(`Saved event "${eventData.title}"`, 'success');
      return { error: null };
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          calendar_id: activeCalendar.id,
          created_by: user?.id,
          owner_user_id: eventData.owner_user_id || user?.id,
          title: eventData.title,
          event_type: eventData.event_type,
          course: eventData.course,
          event_date: eventData.event_date,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          is_all_day: eventData.is_all_day,
          location: eventData.location,
          notes: eventData.notes,
          color: eventData.color,
          reminder_minutes: eventData.reminder_minutes,
        })
        .select()
        .single();

      if (error) throw error;

      // Local optimistic append (Realtime subscription will also confirm)
      setEvents((prev) => {
        if (prev.some((e) => e.id === data.id)) return prev;
        return [...prev, data as CalendarEvent].sort((a, b) => a.event_date.localeCompare(b.event_date));
      });

      addToast(`Event "${eventData.title}" added to calendar!`, 'success');
      return { error: null };
    } catch (e: any) {
      addToast('Failed to add event: ' + e.message, 'error');
      return { error: e as Error };
    }
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    if (!isSupabaseConfigured() || isDemoMode) {
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e))
      );
      addToast('Event updated successfully', 'success');
      return { error: null };
    }

    try {
      const { error } = await supabase
        .from('events')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e))
      );

      addToast('Event updated!', 'success');
      return { error: null };
    } catch (e: any) {
      addToast('Failed to update event: ' + e.message, 'error');
      return { error: e as Error };
    }
  };

  const deleteEvent = async (id: string) => {
    if (!isSupabaseConfigured() || isDemoMode) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
      addToast('Event deleted from shared calendar.', 'success');
      return { error: null };
    }

    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;

      setEvents((prev) => prev.filter((e) => e.id !== id));
      addToast('Event deleted.', 'success');
      return { error: null };
    } catch (e: any) {
      addToast('Failed to delete event: ' + e.message, 'error');
      return { error: e as Error };
    }
  };

  const toggleEventCompleted = async (id: string) => {
    const target = events.find((e) => e.id === id);
    if (!target) return;

    const nextState = !target.is_completed;
    if (nextState) {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.7 },
      });
      addToast(`🎉 Completed "${target.title}"!`, 'success');
    }

    await updateEvent(id, { is_completed: nextState });
  };

  const updateMemberProfile = (userId: string, updates: Partial<CalendarMember>) => {
    setMembers((prev) =>
      prev.map((m) => (m.user_id === userId ? { ...m, ...updates } : m))
    );
  };

  const leaveCalendar = () => {
    setActiveCalendar(null);
    setMembers([]);
    setEvents([]);
  };

  // Filter computation
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // Search text
      if (filterState.search) {
        const query = filterState.search.toLowerCase();
        const matchesTitle = evt.title.toLowerCase().includes(query);
        const matchesCourse = evt.course ? evt.course.toLowerCase().includes(query) : false;
        const matchesLocation = evt.location ? evt.location.toLowerCase().includes(query) : false;
        const matchesNotes = evt.notes ? evt.notes.toLowerCase().includes(query) : false;
        if (!matchesTitle && !matchesCourse && !matchesLocation && !matchesNotes) {
          return false;
        }
      }

      // Person filter
      if (filterState.personFilter === 'me') {
        const currentUserId = userProfile?.id || user?.id;
        if (evt.owner_user_id !== currentUserId && evt.created_by !== currentUserId) {
          return false;
        }
      } else if (filterState.personFilter === 'friend') {
        const currentUserId = userProfile?.id || user?.id;
        if (evt.owner_user_id === currentUserId && evt.created_by === currentUserId) {
          return false;
        }
      } else if (filterState.personFilter !== 'all') {
        if (evt.owner_user_id !== filterState.personFilter) {
          return false;
        }
      }

      // Event type filter
      if (filterState.eventTypeFilter !== 'all') {
        if (evt.event_type !== filterState.eventTypeFilter) {
          return false;
        }
      }

      // Course filter
      if (filterState.courseFilter !== 'all') {
        if (evt.course && evt.course.toLowerCase() !== filterState.courseFilter.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [events, filterState, userProfile, user]);

  return (
    <CalendarContext.Provider
      value={{
        activeCalendar,
        members,
        events,
        filteredEvents,
        loading,
        isOffline,
        syncError,
        toasts,
        viewMode,
        currentDate,
        filterState,
        setViewMode,
        setCurrentDate,
        setFilterState,
        createCalendar,
        joinCalendar,
        addEvent,
        updateEvent,
        deleteEvent,
        toggleEventCompleted,
        updateMemberProfile,
        addToast,
        removeToast,
        leaveCalendar,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};
