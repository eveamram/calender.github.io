import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ProfilePersona,
  AppTab,
  CalendarEvent,
  ClassItem,
  TaskItem,
  HabitItem,
  HabitCompletion,
  GroceryItem,
  MealItem,
  BookItem,
} from '../types';
import { syncEngine, SyncStatus } from '../lib/syncEngine';

interface StoreContextType {
  // Sync Status Feedback
  syncStatus: SyncStatus;

  // Profile & Tab Navigation
  activeProfile: ProfilePersona;
  setActiveProfile: (profile: ProfilePersona) => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;

  // Settings Modal State
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;

  // Selected Date for Calendar
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;

  // Persona Badge Colors: Eve, Abbie, Both
  profileColors: Record<ProfilePersona, string>;
  setProfileColor: (profile: ProfilePersona, color: string) => Promise<boolean>;

  // Clock Format Preference per Person: 12h vs 24h
  timeFormats: Record<ProfilePersona, '12h' | '24h'>;
  setTimeFormat: (profile: ProfilePersona, format: '12h' | '24h') => void;

  // Custom Calendar Day Colors: dateStr -> color hex
  dateColors: Record<string, string>;
  setDateColor: (dateStr: string, color: string) => Promise<boolean>;

  // Data Collections
  events: CalendarEvent[];
  classes: ClassItem[];
  tasks: TaskItem[];
  habits: HabitItem[];
  habitCompletions: HabitCompletion[];
  groceryItems: GroceryItem[];
  mealItems: MealItem[];
  bookItems: BookItem[];

  // Helper filter by profile
  filterByProfile: <T extends { profile?: ProfilePersona }>(items: T[]) => T[];

  // CRUD & Reset Operations
  addEvent: (evt: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;
  clearCalendarEventsExceptAnniversaries: () => Promise<void>;
  clearAnniversariesOnly: () => Promise<void>;
  clearAllEvents: () => Promise<boolean>;

  addClass: (cls: Omit<ClassItem, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateClass: (id: string, updates: Partial<ClassItem>) => Promise<boolean>;
  deleteClass: (id: string) => Promise<boolean>;
  clearClasses: () => Promise<boolean>;

  addTask: (tsk: Omit<TaskItem, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  toggleTaskComplete: (id: string) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  clearTasks: (onlyCompleted?: boolean) => Promise<void>;

  addHabit: (hbt: Omit<HabitItem, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  toggleHabitCompletion: (habitId: string, date: string, quantity?: number) => Promise<boolean>;
  deleteHabit: (id: string) => Promise<boolean>;
  clearWeeklyHabitProgress: (dateStrs?: string[]) => Promise<void>;
  clearAllHabitCompletions: () => Promise<boolean>;
  clearAllHabits: () => Promise<boolean>;

  addGroceryItem: (item: Omit<GroceryItem, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  toggleGroceryComplete: (id: string) => Promise<boolean>;
  deleteGroceryItem: (id: string) => Promise<boolean>;
  clearGroceryItems: (onlyCompleted?: boolean) => Promise<boolean>;

  addMealItem: (meal: Omit<MealItem, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  deleteMealItem: (id: string) => Promise<boolean>;
  clearMealItems: () => Promise<boolean>;

  addBookItem: (book: Omit<BookItem, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateBookItem: (id: string, updates: Partial<BookItem>) => Promise<boolean>;
  deleteBookItem: (id: string) => Promise<boolean>;
  clearBookItems: () => Promise<boolean>;

  factoryResetAllData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isAnniversaryEvent = (evt: CalendarEvent): boolean => {
  if (evt.event_type === 'birthday') return true;
  const titleLower = evt.title.toLowerCase();
  return titleLower.includes('anniversary') || titleLower.includes('birthday');
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeProfile, setActiveProfileState] = useState<ProfilePersona>(() => {
    return (localStorage.getItem('calender_profile') as ProfilePersona) || 'Eve';
  });

  const [activeTab, setActiveTabState] = useState<AppTab>(() => {
    return (localStorage.getItem('calender_tab') as AppTab) || 'calendar';
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => syncEngine.getSyncStatus());

  // Persona Colors Configuration (Server-Synced with Local Fallback)
  const [profileColors, setProfileColors] = useState<Record<ProfilePersona, string>>(() => {
    try {
      const saved = localStorage.getItem('calender_profile_colors');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { Eve: '#2563eb', Abbie: '#7c3aed', Both: '#059669' };
  });

  // Clock Format Preference map per profile (Eve, Abbie, Both)
  const [timeFormats, setTimeFormatsState] = useState<Record<ProfilePersona, '12h' | '24h'>>(() => {
    try {
      const saved = localStorage.getItem('calender_time_formats');
      return saved ? JSON.parse(saved) : { Eve: '12h', Abbie: '12h', Both: '12h' };
    } catch (e) {
      return { Eve: '12h', Abbie: '12h', Both: '12h' };
    }
  });

  const setTimeFormat = (profile: ProfilePersona, format: '12h' | '24h') => {
    const updated = { ...timeFormats, [profile]: format };
    setTimeFormatsState(updated);
    localStorage.setItem('calender_time_formats', JSON.stringify(updated));
  };

  // Date Highlight Colors map (Server-Synced with Local Fallback)
  const [dateColors, setDateColors] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('calender_date_colors');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  // Reactive State Collections
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [habitCompletions, setHabitCompletions] = useState<HabitCompletion[]>([]);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [mealItems, setMealItems] = useState<MealItem[]>([]);
  const [bookItems, setBookItems] = useState<BookItem[]>([]);

  const setActiveProfile = (profile: ProfilePersona) => {
    setActiveProfileState(profile);
    localStorage.setItem('calender_profile', profile);
  };

  const setActiveTab = (tab: AppTab) => {
    setActiveTabState(tab);
    localStorage.setItem('calender_tab', tab);
  };

  const setProfileColor = async (profile: ProfilePersona, color: string) => {
    setProfileColors((prev) => {
      const updated = { ...prev, [profile]: color };
      try {
        localStorage.setItem('calender_profile_colors', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    return await syncEngine.upsertItem('profileColors', { id: profile, color });
  };

  const setDateColor = async (dateStr: string, color: string) => {
    setDateColors((prev) => {
      const updated = { ...prev, [dateStr]: color };
      try {
        localStorage.setItem('calender_date_colors', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    return await syncEngine.upsertItem('dateColors', { id: dateStr, color });
  };

  // Sync Engine Listener Setup
  useEffect(() => {
    const unsubStatus = syncEngine.subscribeSyncStatus((status) => {
      setSyncStatus(status);
    });

    const unsubSync = syncEngine.subscribeToSync((storeData) => {
      setEvents(storeData.events || []);
      setClasses(storeData.classes || []);
      setTasks(storeData.tasks || []);
      setHabits(storeData.habits || []);
      setHabitCompletions(storeData.habitCompletions || []);
      setGroceryItems(storeData.groceryItems || []);
      setMealItems(storeData.mealItems || []);
      setBookItems(storeData.bookItems || []);

      if (storeData.dateColors && Array.isArray(storeData.dateColors) && storeData.dateColors.length > 0) {
        const colorMap: Record<string, string> = {};
        storeData.dateColors.forEach((dc: { id: string; color: string }) => {
          if (dc.id && dc.color) colorMap[dc.id] = dc.color;
        });
        setDateColors((prev) => ({ ...prev, ...colorMap }));
      }

      if (storeData.profileColors && Array.isArray(storeData.profileColors) && storeData.profileColors.length > 0) {
        const pMap: Partial<Record<ProfilePersona, string>> = {};
        storeData.profileColors.forEach((pc: { id: ProfilePersona; color: string }) => {
          if (pc.id && pc.color) pMap[pc.id] = pc.color;
        });
        setProfileColors((prev) => ({ ...prev, ...pMap }));
      }
    });

    syncEngine.fetchAll();

    return () => {
      unsubStatus();
      unsubSync();
    };
  }, []);


  // Filter Helper
  const filterByProfile = <T extends { profile?: ProfilePersona }>(items: T[]): T[] => {
    if (activeProfile === 'Both') return items;
    return items.filter((item) => !item.profile || item.profile === activeProfile || item.profile === 'Both');
  };

  // CRUD & Reset Implementations
  const addEvent = async (evt: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    const newEvt: CalendarEvent = {
      ...evt,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    return await syncEngine.upsertItem('events', newEvt);
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>): Promise<boolean> => {
    const existing = events.find((e) => e.id === id);
    if (!existing) return false;
    const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
    return await syncEngine.upsertItem('events', updated);
  };

  const deleteEvent = async (id: string): Promise<boolean> => {
    return await syncEngine.deleteItem('events', id);
  };

  const clearCalendarEventsExceptAnniversaries = async () => {
    const toDelete = events.filter((e) => !isAnniversaryEvent(e));
    for (const evt of toDelete) {
      await syncEngine.deleteItem('events', evt.id);
    }
  };

  const clearAnniversariesOnly = async () => {
    const toDelete = events.filter((e) => isAnniversaryEvent(e));
    for (const evt of toDelete) {
      await syncEngine.deleteItem('events', evt.id);
    }
  };

  const clearAllEvents = async (): Promise<boolean> => {
    return await syncEngine.clearTable('events');
  };

  const addClass = async (cls: Omit<ClassItem, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    const newClass: ClassItem = {
      ...cls,
      id: `cls-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    return await syncEngine.upsertItem('classes', newClass);
  };

  const updateClass = async (id: string, updates: Partial<ClassItem>): Promise<boolean> => {
    const existing = classes.find((c) => c.id === id);
    if (!existing) return false;
    const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
    return await syncEngine.upsertItem('classes', updated);
  };

  const deleteClass = async (id: string): Promise<boolean> => {
    return await syncEngine.deleteItem('classes', id);
  };

  const clearClasses = async (): Promise<boolean> => {
    return await syncEngine.clearTable('classes');
  };

  const addTask = async (tsk: Omit<TaskItem, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    const newTask: TaskItem = {
      ...tsk,
      id: `tsk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    const res = await syncEngine.upsertItem('tasks', newTask);

    if (res && tsk.due_date) {
      await addEvent({
        title: tsk.title,
        event_type: 'task',
        event_date: tsk.due_date,
        start_time: tsk.due_time || '09:00',
        task_id: newTask.id,
        profile: tsk.profile,
      });
    }
    return res;
  };

  const toggleTaskComplete = async (id: string): Promise<boolean> => {
    const existing = tasks.find((t) => t.id === id);
    if (!existing) return false;
    const nextVal = !existing.is_completed;
    return await syncEngine.upsertItem('tasks', { ...existing, is_completed: nextVal });
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    const res = await syncEngine.deleteItem('tasks', id);
    const relatedEvt = events.find((e) => e.task_id === id);
    if (relatedEvt) {
      await syncEngine.deleteItem('events', relatedEvt.id);
    }
    return res;
  };

  const clearTasks = async (onlyCompleted = false) => {
    const toDelete = onlyCompleted ? tasks.filter((t) => t.is_completed) : tasks;
    for (const t of toDelete) {
      await deleteTask(t.id);
    }
  };

  const addHabit = async (hbt: Omit<HabitItem, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    const newHabit: HabitItem = {
      ...hbt,
      id: `hbt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    return await syncEngine.upsertItem('habits', newHabit);
  };

  const toggleHabitCompletion = async (habitId: string, date: string, quantity?: number): Promise<boolean> => {
    const existingIndex = habitCompletions.findIndex((hc) => hc.habit_id === habitId && hc.date === date);
    if (existingIndex >= 0) {
      const existing = habitCompletions[existingIndex];
      const isCompleted = quantity !== undefined ? quantity > 0 : !existing.completed;
      const updated: HabitCompletion = {
        ...existing,
        completed: isCompleted,
        current_quantity: quantity !== undefined ? quantity : isCompleted ? 1 : 0,
      };
      return await syncEngine.upsertItem('habitCompletions', updated);
    } else {
      const newhc: HabitCompletion = {
        id: `hc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        habit_id: habitId,
        date,
        completed: true,
        current_quantity: quantity !== undefined ? quantity : 1,
        created_at: new Date().toISOString(),
      };
      return await syncEngine.upsertItem('habitCompletions', newhc);
    }
  };

  const deleteHabit = async (id: string): Promise<boolean> => {
    const res = await syncEngine.deleteItem('habits', id);
    const completionsToDelete = habitCompletions.filter((hc) => hc.habit_id === id);
    for (const hc of completionsToDelete) {
      await syncEngine.deleteItem('habitCompletions', hc.id);
    }
    return res;
  };

  const clearWeeklyHabitProgress = async (dateStrs?: string[]) => {
    let toDelete = habitCompletions;
    if (dateStrs && dateStrs.length > 0) {
      toDelete = habitCompletions.filter((hc) => dateStrs.includes(hc.date));
    }
    for (const hc of toDelete) {
      await syncEngine.deleteItem('habitCompletions', hc.id);
    }
  };

  const clearAllHabitCompletions = async (): Promise<boolean> => {
    return await syncEngine.clearTable('habitCompletions');
  };

  const clearAllHabits = async (): Promise<boolean> => {
    const r1 = await syncEngine.clearTable('habits');
    const r2 = await syncEngine.clearTable('habitCompletions');
    return r1 && r2;
  };

  const addGroceryItem = async (item: Omit<GroceryItem, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    const newItem: GroceryItem = {
      ...item,
      id: `gro-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    return await syncEngine.upsertItem('groceryItems', newItem);
  };

  const toggleGroceryComplete = async (id: string): Promise<boolean> => {
    const existing = groceryItems.find((g) => g.id === id);
    if (!existing) return false;
    return await syncEngine.upsertItem('groceryItems', { ...existing, is_completed: !existing.is_completed });
  };

  const deleteGroceryItem = async (id: string): Promise<boolean> => {
    return await syncEngine.deleteItem('groceryItems', id);
  };

  const clearGroceryItems = async (onlyCompleted = false): Promise<boolean> => {
    if (!onlyCompleted) {
      return await syncEngine.clearTable('groceryItems');
    } else {
      const completed = groceryItems.filter((g) => g.is_completed);
      let success = true;
      for (const g of completed) {
        const res = await syncEngine.deleteItem('groceryItems', g.id);
        if (!res) success = false;
      }
      return success;
    }
  };

  const addMealItem = async (meal: Omit<MealItem, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    const newMeal: MealItem = {
      ...meal,
      id: `mel-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    return await syncEngine.upsertItem('mealItems', newMeal);
  };

  const deleteMealItem = async (id: string): Promise<boolean> => {
    return await syncEngine.deleteItem('mealItems', id);
  };

  const clearMealItems = async (): Promise<boolean> => {
    return await syncEngine.clearTable('mealItems');
  };

  const addBookItem = async (book: Omit<BookItem, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    const newBook: BookItem = {
      ...book,
      id: `bok-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    return await syncEngine.upsertItem('bookItems', newBook);
  };

  const updateBookItem = async (id: string, updates: Partial<BookItem>): Promise<boolean> => {
    const existing = bookItems.find((b) => b.id === id);
    if (!existing) return false;
    return await syncEngine.upsertItem('bookItems', { ...existing, ...updates, updated_at: new Date().toISOString() });
  };

  const deleteBookItem = async (id: string): Promise<boolean> => {
    return await syncEngine.deleteItem('bookItems', id);
  };

  const clearBookItems = async (): Promise<boolean> => {
    return await syncEngine.clearTable('bookItems');
  };

  const factoryResetAllData = async () => {
    const tables = ['events', 'classes', 'tasks', 'habits', 'habitCompletions', 'groceryItems', 'mealItems', 'bookItems', 'profileColors', 'dateColors'];
    for (const table of tables) {
      await syncEngine.clearTable(table);
      localStorage.removeItem(`calender_sync_${table}`);
    }
    localStorage.removeItem('calender_profile');
    localStorage.removeItem('calender_tab');
    localStorage.removeItem('calender_time_formats');
  };

  return (
    <StoreContext.Provider
      value={{
        syncStatus,
        activeProfile,
        setActiveProfile,
        activeTab,
        setActiveTab,
        isSettingsOpen,
        setIsSettingsOpen,
        selectedDate,
        setSelectedDate,
        profileColors,
        setProfileColor,
        timeFormats,
        setTimeFormat,
        dateColors,
        setDateColor,
        events,
        classes,
        tasks,
        habits,
        habitCompletions,
        groceryItems,
        mealItems,
        bookItems,
        filterByProfile,
        addEvent,
        updateEvent,
        deleteEvent,
        clearCalendarEventsExceptAnniversaries,
        clearAnniversariesOnly,
        clearAllEvents,
        addClass,
        updateClass,
        deleteClass,
        clearClasses,
        addTask,
        toggleTaskComplete,
        deleteTask,
        clearTasks,
        addHabit,
        toggleHabitCompletion,
        deleteHabit,
        clearWeeklyHabitProgress,
        clearAllHabitCompletions,
        clearAllHabits,
        addGroceryItem,
        toggleGroceryComplete,
        deleteGroceryItem,
        clearGroceryItems,
        addMealItem,
        deleteMealItem,
        clearMealItems,
        addBookItem,
        updateBookItem,
        deleteBookItem,
        clearBookItems,
        factoryResetAllData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

