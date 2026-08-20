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
import { subscribeToSync, syncInsertItem, syncUpdateItem, syncDeleteItem, fetchInitialData, startAutoPolling } from '../lib/syncEngine';

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

  // Device-Isolated Preferences
  const [activePersonaFilter, setActivePersonaFilterState] = useState<'Eve' | 'Abbie' | 'all'>(() => {
    try {
      const saved = localStorage.getItem('calender_pref_persona');
      return saved ? (saved as 'Eve' | 'Abbie' | 'all') : activePersonaName;
    } catch {
      return activePersonaName;
    }
  });

  const setActivePersonaFilter = (persona: 'Eve' | 'Abbie' | 'all') => {
    setActivePersonaFilterState(persona);
    try {
      localStorage.setItem('calender_pref_persona', persona);
    } catch (e) {
      // Ignore write errors
    }
  };

  const [themeColor, setThemeColorState] = useState<string>(() => {
    try {
      return localStorage.getItem('calender_theme_color') || '#3B82F6';
    } catch {
      return '#3B82F6';
    }
  });

  const setThemeColor = (color: string) => {
    setThemeColorState(color);
    try {
      localStorage.setItem('calender_theme_color', color);
    } catch (e) {
      // Ignore write errors
    }
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
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem('calender_pref_view');
      return (saved as ViewMode) || 'month';
    } catch {
      return 'month';
    }
  });

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem('calender_pref_view', mode);
    } catch (e) {
      // Ignore write errors
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('calender_show_todos', JSON.stringify(showTodosOnCalendar));
    } catch (e) {
      // Ignore write errors
    }
  }, [showTodosOnCalendar]);

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const initialList: CalendarEvent[] = INITIAL_SEED_EVENTS;
    const anniversaries = generateAnniversaryEvents();
    const anniversaryMap = new Map(anniversaries.map((a) => [a.id, a]));

    const updatedList = initialList.map((evt) => {
      if (evt.is_anniversary || evt.id.startsWith('anniversary-')) {
        const fresh = anniversaryMap.get(evt.id);
        if (fresh) return { ...evt, title: fresh.title };
      }
      return evt;
    });

    const existingIds = new Set(updatedList.map((e) => e.id));
    const missingAnniversaries = anniversaries.filter((a: CalendarEvent) => !existingIds.has(a.id));

    return [...updatedList, ...missingAnniversaries];
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

  // Merge incoming remote events while preserving anniversary milestones
  const mergeRemoteEvents = (remoteEvents: CalendarEvent[]) => {
    if (!remoteEvents || remoteEvents.length === 0) return;
    const anniversaries = generateAnniversaryEvents();
    const anniversaryMap = new Map(anniversaries.map((a) => [a.id, a]));
    const updatedList = remoteEvents.map((evt) => {
      if (evt.is_anniversary || evt.id.startsWith('anniversary-')) {
        const fresh = anniversaryMap.get(evt.id);
        if (fresh) return { ...evt, title: fresh.title };
      }
      return evt;
    });
    const existingIds = new Set(updatedList.map((e) => e.id));
    const missingAnniversaries = anniversaries.filter((a: CalendarEvent) => !existingIds.has(a.id));

    setEvents([...updatedList, ...missingAnniversaries]);
  };

  // Subscribe to Realtime changes & register background polling
  useEffect(() => {
    fetchInitialData<CalendarEvent>('events').then((remoteEvents) => {
      if (remoteEvents && remoteEvents.length > 0) {
        mergeRemoteEvents(remoteEvents);
      }
    });

    const stopPolling = startAutoPolling<CalendarEvent>('events', (remoteEvents) => {
      if (remoteEvents && remoteEvents.length > 0) {
        mergeRemoteEvents(remoteEvents);
      }
    }, 2500);

    const unsubscribe = subscribeToSync('events', (event) => {
      if (event.type === 'INSERT' && event.payload) {
        const item = event.payload as CalendarEvent;
        setEvents((prev) => (prev.some((e) => e.id === item.id) ? prev : [item, ...prev]));
      } else if (event.type === 'UPDATE' && event.id) {
        setEvents((prev) =>
          prev.map((e) => (e.id === event.id ? { ...e, ...event.payload } : e))
        );
      } else if (event.type === 'DELETE' && event.id) {
        setEvents((prev) => prev.filter((e) => e.id !== event.id));
      }
    });

    return () => {
      stopPolling();
      unsubscribe();
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
    await syncInsertItem('events', newEvent);
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
    await syncUpdateItem('events', id, updates);
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
    await syncDeleteItem('events', id);
    addToast('Deleted', 'info');
    return true;
  };

  const toggleEventCompleted = async (id: string): Promise<boolean> => {
    const targetEvt = events.find((e) => e.id === id);
    if (!targetEvt) return false;

    const nextVal = !targetEvt.is_completed;
    if (nextVal) {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    }

    setEvents((prev) =>
      prev.map((evt) => (evt.id === id ? { ...evt, is_completed: nextVal, updated_at: new Date().toISOString() } : evt))
    );
    await syncUpdateItem('events', id, { is_completed: nextVal, updated_at: new Date().toISOString() });
    return true;
  };

  const resetAllData = () => {
    // Preserve anniversary events when resetting normal user events
    const anniversaryList = events.filter((e) => e.is_anniversary || e.id.startsWith('anniversary-'));
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
