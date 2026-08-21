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
import { syncEngine } from '../lib/syncEngine';

interface StoreContextType {
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
  setProfileColor: (profile: ProfilePersona, color: string) => Promise<void>;

  // Clock Format Preference per Person: 12h vs 24h
  timeFormats: Record<ProfilePersona, '12h' | '24h'>;
  setTimeFormat: (profile: ProfilePersona, format: '12h' | '24h') => void;

  // Custom Calendar Day Colors: dateStr -> color hex
  dateColors: Record<string, string>;
  setDateColor: (dateStr: string, color: string) => Promise<void>;

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
  addEvent: (evt: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  clearCalendarEventsExceptAnniversaries: () => Promise<void>;
  clearAnniversariesOnly: () => Promise<void>;
  clearAllEvents: () => Promise<void>;

  addClass: (cls: Omit<ClassItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateClass: (id: string, updates: Partial<ClassItem>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  clearClasses: () => Promise<void>;

  addTask: (tsk: Omit<TaskItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  clearTasks: (onlyCompleted?: boolean) => Promise<void>;

  addHabit: (hbt: Omit<HabitItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  toggleHabitCompletion: (habitId: string, date: string, quantity?: number) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  clearWeeklyHabitProgress: (dateStrs?: string[]) => Promise<void>;
  clearAllHabitCompletions: () => Promise<void>;
  clearAllHabits: () => Promise<void>;

  addGroceryItem: (item: Omit<GroceryItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  toggleGroceryComplete: (id: string) => Promise<void>;
  deleteGroceryItem: (id: string) => Promise<void>;
  clearGroceryItems: (onlyCompleted?: boolean) => Promise<void>;

  addMealItem: (meal: Omit<MealItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  deleteMealItem: (id: string) => Promise<void>;
  clearMealItems: () => Promise<void>;

  addBookItem: (book: Omit<BookItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateBookItem: (id: string, updates: Partial<BookItem>) => Promise<void>;
  deleteBookItem: (id: string) => Promise<void>;
  clearBookItems: () => Promise<void>;

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

  // Persona Colors Configuration
  const [profileColors, setProfileColors] = useState<Record<ProfilePersona, string>>(() => {
    try {
      const saved = localStorage.getItem('calender_profile_colors');
      return saved ? JSON.parse(saved) : { Eve: '#2563eb', Abbie: '#7c3aed', Both: '#059669' };
    } catch (e) {
      return { Eve: '#2563eb', Abbie: '#7c3aed', Both: '#059669' };
    }
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

  // Date Highlight Colors map
  const [dateColors, setDateColors] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('calender_date_colors');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
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
    const updated = { ...profileColors, [profile]: color };
    setProfileColors(updated);
    localStorage.setItem('calender_profile_colors', JSON.stringify(updated));
    await syncEngine.upsertItem('profileColors', { id: profile, color });
  };

  const setDateColor = async (dateStr: string, color: string) => {
    const updated = { ...dateColors, [dateStr]: color };
    setDateColors(updated);
    localStorage.setItem('calender_date_colors', JSON.stringify(updated));
    await syncEngine.upsertItem('dateColors', { id: dateStr, color });
  };

  // Sync Engine Listener Setup
  useEffect(() => {
    const unsub = syncEngine.subscribeToSync((storeData) => {
      setEvents(storeData.events || []);
      setClasses(storeData.classes || []);
      setTasks(storeData.tasks || []);
      setHabits(storeData.habits || []);
      setHabitCompletions(storeData.habitCompletions || []);
      setGroceryItems(storeData.groceryItems || []);
      setMealItems(storeData.mealItems || []);
      setBookItems(storeData.bookItems || []);

      if (storeData.dateColors && Array.isArray(storeData.dateColors)) {
        const colorMap: Record<string, string> = {};
        storeData.dateColors.forEach((dc: { id: string; color: string }) => {
          if (dc.id && dc.color) colorMap[dc.id] = dc.color;
        });
        setDateColors(colorMap);
      }

      if (storeData.profileColors && Array.isArray(storeData.profileColors)) {
        const pMap: Record<ProfilePersona, string> = { Eve: '#2563eb', Abbie: '#7c3aed', Both: '#059669' };
        storeData.profileColors.forEach((pc: { id: ProfilePersona; color: string }) => {
          if (pc.id && pc.color) pMap[pc.id] = pc.color;
        });
        setProfileColors(pMap);
      }
    });

    syncEngine.fetchAll();

    return () => unsub();
  }, []);

  // Filter Helper
  const filterByProfile = <T extends { profile?: ProfilePersona }>(items: T[]): T[] => {
    if (activeProfile === 'Both') return items;
    return items.filter((item) => !item.profile || item.profile === activeProfile || item.profile === 'Both');
  };

  // CRUD & Reset Implementations
  const addEvent = async (evt: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) => {
    const newEvt: CalendarEvent = {
      ...evt,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    await syncEngine.upsertItem('events', newEvt);
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    const existing = events.find((e) => e.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
    await syncEngine.upsertItem('events', updated);
  };

  const deleteEvent = async (id: string) => {
    await syncEngine.deleteItem('events', id);
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

  const clearAllEvents = async () => {
    await syncEngine.clearTable('events');
  };

  const addClass = async (cls: Omit<ClassItem, 'id' | 'created_at' | 'updated_at'>) => {
    const newClass: ClassItem = {
      ...cls,
      id: `cls-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    await syncEngine.upsertItem('classes', newClass);
  };

  const updateClass = async (id: string, updates: Partial<ClassItem>) => {
    const existing = classes.find((c) => c.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
    await syncEngine.upsertItem('classes', updated);
  };

  const deleteClass = async (id: string) => {
    await syncEngine.deleteItem('classes', id);
  };

  const clearClasses = async () => {
    await syncEngine.clearTable('classes');
  };

  const addTask = async (tsk: Omit<TaskItem, 'id' | 'created_at' | 'updated_at'>) => {
    const newTask: TaskItem = {
      ...tsk,
      id: `tsk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    await syncEngine.upsertItem('tasks', newTask);

    if (tsk.due_date) {
      await addEvent({
        title: tsk.title,
        event_type: 'task',
        event_date: tsk.due_date,
        start_time: tsk.due_time || '09:00',
        task_id: newTask.id,
        profile: tsk.profile,
      });
    }
  };

  const toggleTaskComplete = async (id: string) => {
    const existing = tasks.find((t) => t.id === id);
    if (!existing) return;
    const nextVal = !existing.is_completed;
    await syncEngine.upsertItem('tasks', { ...existing, is_completed: nextVal });
  };

  const deleteTask = async (id: string) => {
    await syncEngine.deleteItem('tasks', id);
    const relatedEvt = events.find((e) => e.task_id === id);
    if (relatedEvt) {
      await syncEngine.deleteItem('events', relatedEvt.id);
    }
  };

  const clearTasks = async (onlyCompleted = false) => {
    const toDelete = onlyCompleted ? tasks.filter((t) => t.is_completed) : tasks;
    for (const t of toDelete) {
      await deleteTask(t.id);
    }
  };

  const addHabit = async (hbt: Omit<HabitItem, 'id' | 'created_at' | 'updated_at'>) => {
    const newHabit: HabitItem = {
      ...hbt,
      id: `hbt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    await syncEngine.upsertItem('habits', newHabit);
  };

  const toggleHabitCompletion = async (habitId: string, date: string, quantity?: number) => {
    const existingIndex = habitCompletions.findIndex((hc) => hc.habit_id === habitId && hc.date === date);
    if (existingIndex >= 0) {
      const existing = habitCompletions[existingIndex];
      const isCompleted = quantity !== undefined ? quantity > 0 : !existing.completed;
      const updated: HabitCompletion = {
        ...existing,
        completed: isCompleted,
        current_quantity: quantity !== undefined ? quantity : isCompleted ? 1 : 0,
      };
      await syncEngine.upsertItem('habitCompletions', updated);
    } else {
      const newhc: HabitCompletion = {
        id: `hc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        habit_id: habitId,
        date,
        completed: true,
        current_quantity: quantity !== undefined ? quantity : 1,
        created_at: new Date().toISOString(),
      };
      await syncEngine.upsertItem('habitCompletions', newhc);
    }
  };

  const deleteHabit = async (id: string) => {
    await syncEngine.deleteItem('habits', id);
    const completionsToDelete = habitCompletions.filter((hc) => hc.habit_id === id);
    for (const hc of completionsToDelete) {
      await syncEngine.deleteItem('habitCompletions', hc.id);
    }
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

  const clearAllHabitCompletions = async () => {
    await syncEngine.clearTable('habitCompletions');
  };

  const clearAllHabits = async () => {
    await syncEngine.clearTable('habits');
    await syncEngine.clearTable('habitCompletions');
  };

  const addGroceryItem = async (item: Omit<GroceryItem, 'id' | 'created_at' | 'updated_at'>) => {
    const newItem: GroceryItem = {
      ...item,
      id: `gro-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    await syncEngine.upsertItem('groceryItems', newItem);
  };

  const toggleGroceryComplete = async (id: string) => {
    const existing = groceryItems.find((g) => g.id === id);
    if (!existing) return;
    await syncEngine.upsertItem('groceryItems', { ...existing, is_completed: !existing.is_completed });
  };

  const deleteGroceryItem = async (id: string) => {
    await syncEngine.deleteItem('groceryItems', id);
  };

  const clearGroceryItems = async (onlyCompleted = false) => {
    if (!onlyCompleted) {
      await syncEngine.clearTable('groceryItems');
    } else {
      const completed = groceryItems.filter((g) => g.is_completed);
      for (const g of completed) {
        await syncEngine.deleteItem('groceryItems', g.id);
      }
    }
  };

  const addMealItem = async (meal: Omit<MealItem, 'id' | 'created_at' | 'updated_at'>) => {
    const newMeal: MealItem = {
      ...meal,
      id: `mel-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    await syncEngine.upsertItem('mealItems', newMeal);
  };

  const deleteMealItem = async (id: string) => {
    await syncEngine.deleteItem('mealItems', id);
  };

  const clearMealItems = async () => {
    await syncEngine.clearTable('mealItems');
  };

  const addBookItem = async (book: Omit<BookItem, 'id' | 'created_at' | 'updated_at'>) => {
    const newBook: BookItem = {
      ...book,
      id: `bok-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: new Date().toISOString(),
    };
    await syncEngine.upsertItem('bookItems', newBook);
  };

  const updateBookItem = async (id: string, updates: Partial<BookItem>) => {
    const existing = bookItems.find((b) => b.id === id);
    if (!existing) return;
    await syncEngine.upsertItem('bookItems', { ...existing, ...updates, updated_at: new Date().toISOString() });
  };

  const deleteBookItem = async (id: string) => {
    await syncEngine.deleteItem('bookItems', id);
  };

  const clearBookItems = async () => {
    await syncEngine.clearTable('bookItems');
  };

  const factoryResetAllData = async () => {
    const tables = ['events', 'classes', 'tasks', 'habits', 'habitCompletions', 'groceryItems', 'mealItems', 'bookItems'];
    for (const table of tables) {
      await syncEngine.clearTable(table);
      localStorage.removeItem(`calender_sync_${table}`);
    }
    localStorage.removeItem('calender_profile');
    localStorage.removeItem('calender_tab');
    localStorage.removeItem('calender_profile_colors');
    localStorage.removeItem('calender_date_colors');
  };

  return (
    <StoreContext.Provider
      value={{
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

