/**
 * useEvents – Real-time Firestore sync with version-based conflict resolution.
 *
 * KEY DESIGN:
 * • onSnapshot listener keeps local state perfectly in sync with Firestore.
 * • Creates use addDoc (no conflict possible – new document).
 * • Updates use a Firestore TRANSACTION that:
 *     1. Reads the latest doc
 *     2. Compares `version` to what the user loaded in the edit form
 *     3. If match → writes update + increments version
 *     4. If mismatch → throws ConflictError (caller shows conflict UI)
 * • Deletes also use a transaction with version check.
 * • Zero localStorage. Firestore is the only source of truth.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  runTransaction,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import {
  CalendarEvent,
  CreateEventPayload,
  EventCategory,
  CATEGORY_COLORS,
} from '../types/event';

// ---------------------------------------------------------------------------
// Custom error for version conflicts
// ---------------------------------------------------------------------------
export class ConflictError extends Error {
  constructor(public latestEvent: CalendarEvent) {
    super('This event was modified by someone else while you were editing.');
    this.name = 'ConflictError';
  }
}

// ---------------------------------------------------------------------------
// Firestore Timestamp → ISO string helper
// ---------------------------------------------------------------------------
function toISO(val: unknown): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (typeof (val as any)?.toDate === 'function') return (val as any).toDate().toISOString();
  if (typeof val === 'string') return val;
  return new Date(val as number).toISOString();
}

/** Convert a Firestore doc snapshot to our CalendarEvent type */
function docToEvent(id: string, data: Record<string, any>): CalendarEvent {
  return {
    id,
    title: data.title || 'Untitled',
    start: toISO(data.start),
    end: toISO(data.end || data.start),
    description: data.description || '',
    color: data.color || CATEGORY_COLORS[(data.category as EventCategory) || 'Other']?.hex || '#3B82F6',
    category: (data.category as EventCategory) || 'Other',
    createdBy: data.createdBy || 'Anonymous',
    lastEditedBy: data.lastEditedBy || data.createdBy || 'Anonymous',
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
    version: typeof data.version === 'number' ? data.version : 1,
  };
}

// ---------------------------------------------------------------------------
// Sample events for the seed button
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export interface UseEventsReturn {
  events: CalendarEvent[];
  filteredEvents: CalendarEvent[];
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  loading: boolean;
  error: string | null;
  createEvent: (payload: CreateEventPayload) => Promise<void>;
  /** Throws ConflictError if the version has changed since the user loaded the form */
  updateEvent: (id: string, expectedVersion: number, updates: Partial<CalendarEvent>, editedBy: string) => Promise<void>;
  /** Throws ConflictError if the version has changed since the user loaded the form */
  deleteEvent: (id: string, expectedVersion: number) => Promise<void>;
  seedSampleEvents: (createdBy: string) => Promise<void>;
}

export function useEvents(): UseEventsReturn {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // -------------------------------------------------------------------
  // Real-time listener
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      setError('Firebase is not configured. Add your credentials to .env and restart.');
      return;
    }

    const q = query(collection(db, 'events'), orderBy('start', 'asc'));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const evts = snap.docs.map((d) => docToEvent(d.id, d.data()));
        setEvents(evts);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('[useEvents] onSnapshot error:', err);
        setLoading(false);
        setError(`Firestore error: ${err.message}`);
      }
    );

    return () => unsub();
  }, []);

  // -------------------------------------------------------------------
  // CREATE — no conflict possible (new document)
  // -------------------------------------------------------------------
  const createEvent = useCallback(async (payload: CreateEventPayload) => {
    if (!isFirebaseConfigured) throw new Error('Firebase not configured');
    await addDoc(collection(db, 'events'), {
      title: payload.title,
      start: payload.start,
      end: payload.end,
      description: payload.description || '',
      color: payload.color,
      category: payload.category,
      createdBy: payload.createdBy,
      lastEditedBy: payload.createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      version: 1,
    });
  }, []);

  // -------------------------------------------------------------------
  // UPDATE — transactional with version check
  // -------------------------------------------------------------------
  const updateEvent = useCallback(
    async (id: string, expectedVersion: number, updates: Partial<CalendarEvent>, editedBy: string) => {
      if (!isFirebaseConfigured) throw new Error('Firebase not configured');

      const ref = doc(db, 'events', id);

      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new Error('Event no longer exists.');

        const data = snap.data();
        const currentVersion = typeof data.version === 'number' ? data.version : 1;

        if (currentVersion !== expectedVersion) {
          // Someone else changed this event since the user opened the edit form
          throw new ConflictError(docToEvent(snap.id, data));
        }

        // Version matches → safe to write
        const { id: _id, createdAt: _ca, version: _v, ...safeUpdates } = updates as any;
        tx.update(ref, {
          ...safeUpdates,
          lastEditedBy: editedBy,
          updatedAt: serverTimestamp(),
          version: currentVersion + 1,
        });
      });
    },
    []
  );

  // -------------------------------------------------------------------
  // DELETE — transactional with version check
  // -------------------------------------------------------------------
  const deleteEvent = useCallback(async (id: string, expectedVersion: number) => {
    if (!isFirebaseConfigured) throw new Error('Firebase not configured');

    const ref = doc(db, 'events', id);

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) return; // already deleted — fine

      const data = snap.data();
      const currentVersion = typeof data.version === 'number' ? data.version : 1;

      if (currentVersion !== expectedVersion) {
        throw new ConflictError(docToEvent(snap.id, data));
      }

      tx.delete(ref);
    });
  }, []);

  // -------------------------------------------------------------------
  // SEED
  // -------------------------------------------------------------------
  const seedSampleEvents = useCallback(
    async (createdBy: string) => {
      for (const s of makeSamples()) {
        await createEvent({ ...s, createdBy });
      }
    },
    [createEvent]
  );

  // -------------------------------------------------------------------
  // Filtering
  // -------------------------------------------------------------------
  const filteredEvents =
    selectedCategory === 'All' ? events : events.filter((e) => e.category === selectedCategory);

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
