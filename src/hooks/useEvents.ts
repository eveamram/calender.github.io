/**
 * useEvents – Real-time Google Sheets sync with 5-second polling interval.
 *
 * KEY DESIGN:
 * • Periodically polls Google Sheets API every 5 seconds to get latest events.
 * • Optimistically updates local React state immediately on create/update/delete for smooth UX.
 * • Caches state in localStorage so app works even offline or before URL is set.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  CalendarEvent,
  CreateEventPayload,
  EventCategory,
  CATEGORY_COLORS,
} from '../types/event';
import {
  fetchSheetEvents,
  createSheetEvent,
  updateSheetEvent,
  deleteSheetEvent,
  isGoogleSheetsConfigured,
} from '../lib/googleSheets';

const LOCAL_STORAGE_KEY = 'calender_sheet_events_cache';

// Sample events for initial seed if sheet is empty
function makeSamples(): CreateEventPayload[] {
  const now = Date.now();
  const day = 86_400_000;
  const hour = 3_600_000;
  return [
    {
      title: '🚀 Sprint Planning',
      start: new Date(now + day).toISOString().slice(0, 16),
      end: new Date(now + day + hour * 2).toISOString().slice(0, 16),
      description: 'Quarterly sprint planning session.',
      category: 'Work',
      color: CATEGORY_COLORS.Work.hex,
      createdBy: 'Eve',
    },
    {
      title: '☕ Coffee Chat',
      start: new Date(now + day * 2 + hour * 10).toISOString().slice(0, 16),
      end: new Date(now + day * 2 + hour * 11).toISOString().slice(0, 16),
      description: 'Catch up with the design team.',
      category: 'Meeting',
      color: CATEGORY_COLORS.Meeting.hex,
      createdBy: 'Abbie',
    },
    {
      title: '🏃 Morning Run',
      start: new Date(now + day * 3 + hour * 7).toISOString().slice(0, 16),
      end: new Date(now + day * 3 + hour * 8).toISOString().slice(0, 16),
      description: '5K around the park.',
      category: 'Personal',
      color: CATEGORY_COLORS.Personal.hex,
      createdBy: 'Eve',
    },
    {
      title: '🛒 Grocery Shopping',
      start: new Date(now + day * 4 + hour * 14).toISOString().slice(0, 16),
      end: new Date(now + day * 4 + hour * 15.5).toISOString().slice(0, 16),
      description: 'Weekly grocery run.',
      category: 'Other',
      color: CATEGORY_COLORS.Other.hex,
      createdBy: 'Abbie',
    },
  ];
}

export interface UseEventsReturn {
  events: CalendarEvent[];
  filteredEvents: CalendarEvent[];
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  loading: boolean;
  error: string | null;
  createEvent: (payload: CreateEventPayload) => Promise<void>;
  updateEvent: (id: string, expectedVersion: number, updates: Partial<CalendarEvent>, editedBy: string) => Promise<void>;
  deleteEvent: (id: string, expectedVersion: number) => Promise<void>;
  seedSampleEvents: (createdBy: string) => Promise<void>;
}

export function useEvents(): UseEventsReturn {
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  // Cache to localStorage whenever events change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.error('Failed to cache events:', e);
    }
  }, [events]);

  // Main sync function
  const syncWithSheet = useCallback(async () => {
    if (!isGoogleSheetsConfigured()) {
      setLoading(false);
      return;
    }

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const remoteEvents = await fetchSheetEvents();
      setEvents(remoteEvents);
      setError(null);
    } catch (err: any) {
      console.error('[useEvents] Polling sync error:', err);
      // Keep existing local cached events on error
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Initial load + 5-second polling interval
  useEffect(() => {
    syncWithSheet();

    if (!isGoogleSheetsConfigured()) {
      return;
    }

    const intervalId = setInterval(() => {
      syncWithSheet();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId);
  }, [syncWithSheet]);

  // Create
  const createEvent = useCallback(
    async (payload: CreateEventPayload) => {
      // Optimistic local update
      const tempEvt = await createSheetEvent(payload);
      setEvents((prev) => [tempEvt, ...prev.filter((e) => e.id !== tempEvt.id)]);

      // Background sync to ensure remote server has it
      setTimeout(syncWithSheet, 1000);
    },
    [syncWithSheet]
  );

  // Update
  const updateEvent = useCallback(
    async (id: string, _expectedVersion: number, updates: Partial<CalendarEvent>, editedBy: string) => {
      // Optimistic local update
      setEvents((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, ...updates, lastEditedBy: editedBy, updatedAt: new Date().toISOString() }
            : e
        )
      );

      await updateSheetEvent(id, updates, editedBy);
      setTimeout(syncWithSheet, 1000);
    },
    [syncWithSheet]
  );

  // Delete
  const deleteEvent = useCallback(
    async (id: string, _expectedVersion: number) => {
      // Optimistic local delete
      setEvents((prev) => prev.filter((e) => e.id !== id));

      await deleteSheetEvent(id);
      setTimeout(syncWithSheet, 1000);
    },
    [syncWithSheet]
  );

  // Seed sample data
  const seedSampleEvents = useCallback(
    async (createdBy: string) => {
      const samples = makeSamples();
      for (const s of samples) {
        await createEvent({ ...s, createdBy });
      }
    },
    [createEvent]
  );

  // Category filtering
  const filteredEvents =
    selectedCategory === 'All'
      ? events
      : events.filter((e) => e.category === selectedCategory);

  return {
    events,
    filteredEvents,
    selectedCategory,
    setSelectedCategory,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    seedSampleEvents,
  };
}
