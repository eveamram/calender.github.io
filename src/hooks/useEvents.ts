import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { CalendarEvent, NewCalendarEventPayload, EventCategory, CATEGORY_COLORS } from '../types/event';

// Initial fallback sample events for local testing or when Firebase env is connecting
const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: 'sample-1',
    title: '🚀 Team Sprint Planning',
    start: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    end: new Date(Date.now() + 86400000 + 3600000 * 2).toISOString().slice(0, 16),
    description: 'Quarterly roadmap discussion and sprint task allocations.',
    category: 'Work',
    color: CATEGORY_COLORS.Work.hex,
    createdBy: 'Sarah Jenkins',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    title: '☕ Coffee & Catchup',
    start: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16),
    end: new Date(Date.now() + 86400000 * 2 + 3600000).toISOString().slice(0, 16),
    description: 'Informal sync on project design.',
    category: 'Meeting',
    color: CATEGORY_COLORS.Meeting.hex,
    createdBy: 'Alex Rivera',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    title: '🏃‍♂️ Morning Gym & Run',
    start: new Date(Date.now() + 86400000 * 3 + 3600000 * 8).toISOString().slice(0, 16),
    end: new Date(Date.now() + 86400000 * 3 + 3600000 * 9.5).toISOString().slice(0, 16),
    description: 'Leg day workout and 5km cardio run.',
    category: 'Personal',
    color: CATEGORY_COLORS.Personal.hex,
    createdBy: 'Anonymous',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-4',
    title: '🛒 Weekly Grocery Run',
    start: new Date(Date.now() + 86400000 * 4 + 3600000 * 14).toISOString().slice(0, 16),
    end: new Date(Date.now() + 86400000 * 4 + 3600000 * 15.5).toISOString().slice(0, 16),
    description: 'Buy fresh produce, milk, and household essentials.',
    category: 'Other',
    color: CATEGORY_COLORS.Other.hex,
    createdBy: 'Eve',
    createdAt: new Date().toISOString(),
  },
];

export interface UseEventsReturn {
  events: CalendarEvent[];
  filteredEvents: CalendarEvent[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  loading: boolean;
  error: string | null;
  createEvent: (payload: NewCalendarEventPayload) => Promise<void>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  seedSampleEvents: () => Promise<void>;
}

export function useEvents(): UseEventsReturn {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Firestore Collection reference
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, orderBy('start', 'asc'));

    // Set up real-time listener using onSnapshot
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedEvents: CalendarEvent[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();

          // Safely parse Firestore Timestamps or ISO strings
          const parseTime = (val: any): string => {
            if (!val) return new Date().toISOString();
            if (val instanceof Timestamp) return val.toDate().toISOString();
            if (typeof val?.toDate === 'function') return val.toDate().toISOString();
            if (typeof val === 'string') return val;
            return new Date(val).toISOString();
          };

          return {
            id: docSnap.id,
            title: data.title || 'Untitled Event',
            start: parseTime(data.start),
            end: parseTime(data.end || data.start),
            description: data.description || '',
            color: data.color || CATEGORY_COLORS[(data.category as EventCategory) || 'Other']?.hex || '#3B82F6',
            category: (data.category as EventCategory) || 'Other',
            createdBy: data.createdBy || 'Anonymous',
            createdAt: parseTime(data.createdAt),
            updatedAt: parseTime(data.updatedAt),
          };
        });

        setEvents(fetchedEvents);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Firestore onSnapshot listener notice:', err);
        // Fallback to initial state if Firestore is not yet created in Console
        setEvents((prev) => (prev.length === 0 ? SAMPLE_EVENTS : prev));
        setLoading(false);
        setError('Firestore is running in local fallback mode until project credentials connect.');
      }
    );

    return () => unsubscribe();
  }, []);

  const createEvent = async (payload: NewCalendarEventPayload): Promise<void> => {
    try {
      if (isFirebaseConfigured) {
        const eventsRef = collection(db, 'events');
        await addDoc(eventsRef, {
          title: payload.title,
          start: payload.start,
          end: payload.end,
          description: payload.description || '',
          color: payload.color || CATEGORY_COLORS[payload.category]?.hex || '#3B82F6',
          category: payload.category,
          createdBy: payload.createdBy || 'Anonymous',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        // Fallback local memory addition for immediate interactive demo
        const newEvt: CalendarEvent = {
          id: `local-${Date.now()}`,
          ...payload,
          createdAt: new Date().toISOString(),
        };
        setEvents((prev) => [...prev, newEvt]);
      }
    } catch (err: any) {
      console.error('Error creating event in Firestore:', err);
      throw new Error(err.message || 'Failed to create event');
    }
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>): Promise<void> => {
    try {
      if (isFirebaseConfigured && !id.startsWith('sample-') && !id.startsWith('local-')) {
        const docRef = doc(db, 'events', id);
        await updateDoc(docRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });
      } else {
        setEvents((prev) =>
          prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
        );
      }
    } catch (err: any) {
      console.error('Error updating event in Firestore:', err);
      throw new Error(err.message || 'Failed to update event');
    }
  };

  const deleteEvent = async (id: string): Promise<void> => {
    try {
      if (isFirebaseConfigured && !id.startsWith('sample-') && !id.startsWith('local-')) {
        const docRef = doc(db, 'events', id);
        await deleteDoc(docRef);
      } else {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err: any) {
      console.error('Error deleting event from Firestore:', err);
      throw new Error(err.message || 'Failed to delete event');
    }
  };

  const seedSampleEvents = async (): Promise<void> => {
    try {
      setLoading(true);
      for (const sample of SAMPLE_EVENTS) {
        await createEvent({
          title: sample.title,
          start: sample.start,
          end: sample.end,
          description: sample.description,
          category: sample.category,
          color: sample.color,
          createdBy: sample.createdBy,
        });
      }
    } catch (err) {
      console.error('Error seeding sample events:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((e) => {
    if (selectedCategory === 'All') return true;
    return e.category === selectedCategory;
  });

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
