import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  CalendarEvent,
  SharedCalendar,
  CalendarMember,
  FilterState,
  ViewMode,
} from '../types';
import { format, addDays } from 'date-fns';
import confetti from 'canvas-confetti';
import { generateAnniversaryEvents, ANNIVERSARY_PASSWORD } from '../utils/anniversary';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface CalendarContextType {
  events: CalendarEvent[];
  filteredEvents: CalendarEvent[];
  activeCalendar: SharedCalendar | null;
  members: CalendarMember[];
  loading: boolean;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;

  addEvent: (eventData: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) => Promise<CalendarEvent | null>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;
  toggleEventCompleted: (id: string) => Promise<boolean>;

  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  activePersonaFilter: 'Eve' | 'Abbie' | 'all';
  setActivePersonaFilter: (persona: 'Eve' | 'Abbie' | 'all') => void;

  themeColor: string;
  setThemeColor: (color: string) => void;

  showTodosOnCalendar: boolean;
  setShowTodosOnCalendar: (show: boolean) => void;
  resetAllData: () => void;
  resetAnniversaryWithPassword: () => boolean;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

const DEMO_CALENDAR: SharedCalendar = {
  id: 'cal-shared-1',
  name: 'Eve & Abbie Shared OS',
  description: 'Shared academic calendar and task system',
  created_by: 'eve-user-id',
  invite_code: 'EVE-ABBIE-2026',
  created_at: new Date().toISOString(),
};

const DEFAULT_MEMBERS: CalendarMember[] = [
  {
    id: 'mem-1',
    calendar_id: 'cal-shared-1',
    user_id: 'eve-user-id',
    role: 'owner',
    display_name: 'Eve',
    profile_color: '#3B82F6',
    joined_at: new Date().toISOString(),
  },
  {
    id: 'mem-2',
    calendar_id: 'cal-shared-1',
    user_id: 'abbie-user-id',
    role: 'editor',
    display_name: 'Abbie',
    profile_color: '#EC4899',
    joined_at: new Date().toISOString(),
  },
];

const INITIAL_SEED_EVENTS: CalendarEvent[] = [
  {
    id: 'seed-1',
    title: 'Calculus II',
    event_type: 'class',
    event_date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '10:00',
    end_time: '11:15',
    location: 'Room 204',
    owner_user_id: 'eve-user-id',
    created_by: 'eve-user-id',
    color: '#3B82F6',
    is_completed: false,
  },
  {
    id: 'seed-2',
    title: 'Physics Lab',
    event_type: 'class',
    event_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    start_time: '13:00',
    end_time: '14:30',
    location: 'Science Hall 102',
    owner_user_id: 'abbie-user-id',
    created_by: 'abbie-user-id',
    color: '#EC4899',
    is_completed: false,
  },
  {
    id: 'seed-3',
    title: 'Submit Chemistry Homework',
    event_type: 'task',
    event_date: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    due_date: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    start_time: '23:59',
    priority: 'high',
    owner_user_id: 'eve-user-id',
    created_by: 'eve-user-id',
    color: '#F59E0B',
    is_completed: false,
  },
  {
    id: 'seed-4',
    title: 'Buy groceries',
    event_type: 'task',
    event_date: format(new Date(), 'yyyy-MM-dd'),
    priority: 'normal',
    owner_user_id: 'abbie-user-id',
    created_by: 'abbie-user-id',
    color: '#F59E0B',
    is_completed: false,
  },
  {
    id: 'seed-5',
    title: 'Dentist Appointment',
    event_type: 'appointment',
    event_date: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    start_time: '14:00',
    end_time: '15:00',
    location: 'Dental Clinic',
    owner_user_id: 'eve-user-id',
    created_by: 'eve-user-id',
    color: '#10B981',
    is_completed: false,
  },
];

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();
  const activePersonaName = (userProfile?.display_name as 'Eve' | 'Abbie') || 'Eve';

  const [activePersonaFilter, setActivePersonaFilter] = useState<'Eve' | 'Abbie' | 'all'>(activePersonaName);
  const [themeColor, setThemeColorState] = useState<string>(() => {
    try {
      return localStorage.getItem('calender_theme_color') || '#3B82F6';
    } catch {
      return '#3B82F6';
    }
  });

  const setThemeColor = (color: string) => {
    setThemeColorState(color);
    localStorage.setItem('calender_theme_color', color);
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-primary', themeColor);
    document.documentElement.style.setProperty('--accent-light', `${themeColor}15`);
  }, [themeColor]);

  const [showTodosOnCalendar, setShowTodosOnCalendar] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('calender_show_todos');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  useEffect(() => {
    if (activePersonaName === 'Eve' || activePersonaName === 'Abbie') {
      setActivePersonaFilter(activePersonaName);
    }
  }, [activePersonaName]);

  useEffect(() => {
    localStorage.setItem('calender_show_todos', JSON.stringify(showTodosOnCalendar));
  }, [showTodosOnCalendar]);

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    let initialList: CalendarEvent[] = INITIAL_SEED_EVENTS;
    try {
      const stored = localStorage.getItem('calender_unified_events');
      if (stored) initialList = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse local events:', e);
    }

    // Automatically seed/merge monthly anniversary events starting from 13th month (August 30, 2026)
    const anniversaries = generateAnniversaryEvents();
    const existingIds = new Set(initialList.map((e) => e.id));
    const missingAnniversaries = anniversaries.filter((a: CalendarEvent) => !existingIds.has(a.id));

    return [...initialList, ...missingAnniversaries];
  });

  const [activeCalendar] = useState<SharedCalendar>(DEMO_CALENDAR);
  const [members] = useState<CalendarMember[]>(DEFAULT_MEMBERS);
  const [loading] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  const [filterState, setFilterState] = useState<FilterState>({
    search: '',
    selectedCategories: [],
    selectedMembers: [],
    showCompleted: true,
    tabFilter: 'calendar',
    personFilter: 'all',
  });

  useEffect(() => {
    localStorage.setItem('calender_unified_events', JSON.stringify(events));
  }, [events]);

  // Sync state automatically when storage changes or window regains focus
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedEvents = localStorage.getItem('calender_unified_events');
        if (storedEvents) {
          const parsed: CalendarEvent[] = JSON.parse(storedEvents);
          const anniversaries = generateAnniversaryEvents();
          const existingIds = new Set(parsed.map((e) => e.id));
          const missingAnniversaries = anniversaries.filter((a: CalendarEvent) => !existingIds.has(a.id));
          setEvents([...parsed, ...missingAnniversaries]);
        }
      } catch (e) {
        console.error('Storage sync error:', e);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredEvents = events.filter((evt) => {
    if (activePersonaFilter === 'all') return true;
    
    const eveUser = members.find((m) => m.display_name === 'Eve');
    const abbieUser = members.find((m) => m.display_name === 'Abbie');

    if (activePersonaFilter === 'Eve' && eveUser) {
      return evt.owner_user_id === eveUser.user_id || evt.created_by === eveUser.user_id || !evt.owner_user_id || evt.is_anniversary;
    }
    if (activePersonaFilter === 'Abbie' && abbieUser) {
      return evt.owner_user_id === abbieUser.user_id || evt.created_by === abbieUser.user_id || evt.is_anniversary;
    }

    return true;
  });

  const addEvent = async (eventData: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<CalendarEvent | null> => {
    const ownerUserId = eventData.owner_user_id || (activePersonaName === 'Abbie' ? 'abbie-user-id' : 'eve-user-id');
    const fallbackDate = format(new Date(), 'yyyy-MM-dd');

    const newEvent: CalendarEvent = {
      ...eventData,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      event_date: eventData.event_date || eventData.due_date || fallbackDate,
      owner_user_id: ownerUserId,
      created_by: ownerUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setEvents((prev) => [newEvent, ...prev]);
    addToast('Saved successfully', 'success');
    return newEvent;
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>): Promise<boolean> => {
    const targetEvt = events.find((evt) => evt.id === id);
    if (targetEvt?.is_anniversary || id.startsWith('anniversary-')) {
      const pass = window.prompt('🔒 Password required to edit Anniversary event (MacLeod):');
      if (pass !== 'MacLeod') {
        addToast('Incorrect password. Anniversary is protected!', 'error');
        return false;
      }
    }

    setEvents((prev) =>
      prev.map((evt) => (evt.id === id ? { ...evt, ...updates, updated_at: new Date().toISOString() } : evt))
    );
    addToast('Updated', 'info');
    return true;
  };

  const deleteEvent = async (id: string): Promise<boolean> => {
    const targetEvt = events.find((evt) => evt.id === id);
    if (targetEvt?.is_anniversary || id.startsWith('anniversary-')) {
      const pass = window.prompt('🔒 Password required to delete Anniversary event (MacLeod):');
      if (pass !== 'MacLeod') {
        addToast('Incorrect password. Anniversary is protected!', 'error');
        return false;
      }
    }

    setEvents((prev) => prev.filter((evt) => evt.id !== id));
    addToast('Deleted', 'info');
    return true;
  };

  const toggleEventCompleted = async (id: string): Promise<boolean> => {
    setEvents((prev) =>
      prev.map((evt) => {
        if (evt.id === id) {
          const nextVal = !evt.is_completed;
          if (nextVal) {
            confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
          }
          return { ...evt, is_completed: nextVal, updated_at: new Date().toISOString() };
        }
        return evt;
      })
    );
    return true;
  };

  const resetAllData = () => {
    // Preserve anniversary events when resetting normal user events
    const anniversaryList = events.filter((e) => e.is_anniversary || e.id.startsWith('anniversary-'));
    localStorage.setItem('calender_unified_events', JSON.stringify(anniversaryList));
    localStorage.removeItem('calender_daily_habits_v2');
    localStorage.removeItem('calender_weekly_meals');
    localStorage.removeItem('calender_habits_last_week');
    setEvents(anniversaryList);
    addToast('Events, classes, tasks & habits reset! (Anniversaries preserved)', 'info');
    window.location.reload();
  };

  const resetAnniversaryWithPassword = (): boolean => {
    const pass = window.prompt('🔒 Password required to reset Anniversary milestones (MacLeod):');
    if (pass === 'MacLeod') {
      const nonAnniversaries = events.filter((e) => !e.is_anniversary && !e.id.startsWith('anniversary-'));
      const freshAnniversaries = generateAnniversaryEvents();
      const updated = [...nonAnniversaries, ...freshAnniversaries];
      setEvents(updated);
      localStorage.setItem('calender_unified_events', JSON.stringify(updated));
      addToast('Anniversary milestones reset successfully! 💕', 'success');
      return true;
    } else {
      addToast('Incorrect password. Anniversary reset cancelled!', 'error');
      return false;
    }
  };

  return (
    <CalendarContext.Provider
      value={{
        events,
        filteredEvents,
        activeCalendar,
        members,
        loading,
        viewMode,
        setViewMode,
        currentDate,
        setCurrentDate,
        filterState,
        setFilterState,
        addEvent,
        updateEvent,
        deleteEvent,
        toggleEventCompleted,
        toasts,
        addToast,
        removeToast,
        activePersonaFilter,
        setActivePersonaFilter,
        themeColor,
        setThemeColor,
        showTodosOnCalendar,
        setShowTodosOnCalendar,
        resetAllData,
        resetAnniversaryWithPassword,
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
