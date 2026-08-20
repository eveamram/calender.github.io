import { supabase, isSupabaseConfigured } from './supabase';

export interface SyncPayload<T = any> {
  type: 'INSERT' | 'UPDATE' | 'DELETE' | 'RESET';
  table: string;
  id?: string;
  payload?: T;
  timestamp: number;
}

const syncChannelName = 'calender_live_sync_v1';
const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel(syncChannelName)
  : null;

type SyncCallback = (event: SyncPayload) => void;
const tableSubscribers = new Map<string, Set<SyncCallback>>();

// Master shared cloud store IDs (Public REST API shared across ALL devices worldwide)
const MASTER_SHARED_CLOUD_STORE_MAP: Record<string, string> = {
  events: 'ff8081819ff5b11001a020fe326b625b',
  habits: 'ff8081819ff5b11001a020fe33e5625c',
  grocery_items: 'ff8081819ff5b11001a020fe35bc625d',
  meal_plans: 'ff8081819ff5b11001a020fe3704625e',
  notes: 'ff8081819ff5b11001a020fe3a31625f',
  books: 'ff8081819ff5b11001a020fe3ba86260',
};

// Memory cache for cloud fallback
const memoryCache: Record<string, any[]> = {};

// Dispatch incoming payload to subscribers
const notifySubscribers = (event: SyncPayload) => {
  const listeners = tableSubscribers.get(event.table);
  if (listeners) {
    listeners.forEach((cb) => {
      try {
        cb(event);
      } catch (e) {
        console.error('Error in sync subscriber callback:', e);
      }
    });
  }
};

/**
 * Fetch remote database data for a table using Supabase or Master Shared Cloud Store.
 */
export const fetchInitialData = async <T = any>(table: string): Promise<T[] | null> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        console.warn(`Supabase fetch error for ${table}:`, error.message);
        return null;
      }
      if (data) {
        memoryCache[table] = data;
        return data as T[];
      }
    } catch (e) {
      console.error(`Failed fetching initial data from Supabase for ${table}:`, e);
    }
  }

  // Universal Master Shared Cloud Store Fallback (Guarantees same remote data for all devices)
  try {
    const storeId = MASTER_SHARED_CLOUD_STORE_MAP[table];
    if (storeId) {
      const res = await fetch(`https://api.restful-api.dev/objects/${storeId}`);
      if (res.ok) {
        const json = await res.json();
        const items = json?.data?.items;
        if (Array.isArray(items)) {
          memoryCache[table] = items;
          return items as T[];
        }
      }
    }
  } catch (e) {
    // Silent catch on network errors
  }

  return memoryCache[table] || null;
};

// Listen on BroadcastChannel for live multi-window / multi-tab cross-device sync
if (broadcastChannel) {
  broadcastChannel.onmessage = (msg: MessageEvent<SyncPayload>) => {
    if (msg && msg.data) {
      notifySubscribers(msg.data);
    }
  };
}

// Initialize Supabase Realtime Subscription if configured
if (isSupabaseConfigured()) {
  try {
    supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          const table = payload.table;
          const eventType = payload.eventType;

          let syncType: SyncPayload['type'] = 'UPDATE';
          if (eventType === 'INSERT') syncType = 'INSERT';
          if (eventType === 'DELETE') syncType = 'DELETE';

          const oldRecord = payload.old as Record<string, any> | undefined;
          const newRecord = payload.new as Record<string, any> | undefined;

          const syncData: SyncPayload = {
            type: syncType,
            table,
            id: oldRecord?.id || newRecord?.id,
            payload: syncType === 'DELETE' ? oldRecord : newRecord,
            timestamp: Date.now(),
          };

          notifySubscribers(syncData);

          if (broadcastChannel) {
            broadcastChannel.postMessage(syncData);
          }
        }
      )
      .subscribe();
  } catch (e) {
    console.error('Failed to setup Supabase Realtime:', e);
  }
}

/**
 * Register a listener for item-level real-time mutations on a specific table.
 */
export const subscribeToSync = (table: string, callback: SyncCallback) => {
  if (!tableSubscribers.has(table)) {
    tableSubscribers.set(table, new Set());
  }
  tableSubscribers.get(table)!.add(callback);

  return () => {
    const subscribers = tableSubscribers.get(table);
    if (subscribers) {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        tableSubscribers.delete(table);
      }
    }
  };
};

/**
 * Start a 2-second periodic polling interval to guarantee cross-device sync across all clients.
 */
export const startAutoPolling = <T = any>(
  table: string,
  onRemoteData: (remoteItems: T[]) => void,
  intervalMs = 2500
) => {
  let isPolling = false;
  const timer = setInterval(async () => {
    if (isPolling) return;
    isPolling = true;
    try {
      const data = await fetchInitialData<T>(table);
      if (data && Array.isArray(data)) {
        onRemoteData(data);
      }
    } catch (e) {
      // Ignore background network errors
    } finally {
      isPolling = false;
    }
  }, intervalMs);

  return () => clearInterval(timer);
};

/**
 * Update cloud backup array for fallback store
 */
const persistToSharedCloudStore = async (table: string, items: any[]) => {
  const storeId = MASTER_SHARED_CLOUD_STORE_MAP[table];
  if (!storeId) return;
  try {
    await fetch(`https://api.restful-api.dev/objects/${storeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Atlas_OS_Shared_${table}_v1`,
        data: { items },
      }),
    });
  } catch (e) {
    console.error(`Failed to persist shared cloud store for ${table}:`, e);
  }
};

/**
 * Item-Level Insert Mutation
 */
export const syncInsertItem = async <T extends { id: string }>(table: string, item: T): Promise<T> => {
  const syncPayload: SyncPayload<T> = {
    type: 'INSERT',
    table,
    id: item.id,
    payload: item,
    timestamp: Date.now(),
  };

  // Broadcast to local windows/tabs
  if (broadcastChannel) {
    broadcastChannel.postMessage(syncPayload);
  }

  // Update memory cache
  const existing = memoryCache[table] || [];
  memoryCache[table] = [item, ...existing.filter((x) => x.id !== item.id)];

  // Persist to Supabase or Shared Cloud Store
  if (isSupabaseConfigured()) {
    try {
      await supabase.from(table).insert([item]);
    } catch (e) {
      console.error(`Supabase insert failed for ${table}:`, e);
    }
  } else {
    await persistToSharedCloudStore(table, memoryCache[table]);
  }

  return item;
};

/**
 * Item-Level Update Mutation
 */
export const syncUpdateItem = async (
  table: string,
  id: string,
  updates: Record<string, any>
): Promise<boolean> => {
  const syncPayload: SyncPayload = {
    type: 'UPDATE',
    table,
    id,
    payload: updates,
    timestamp: Date.now(),
  };

  if (broadcastChannel) {
    broadcastChannel.postMessage(syncPayload);
  }

  // Update memory cache
  const existing = memoryCache[table] || [];
  memoryCache[table] = existing.map((x) => (x.id === id ? { ...x, ...updates } : x));

  if (isSupabaseConfigured()) {
    try {
      await supabase.from(table).update(updates).eq('id', id);
    } catch (e) {
      console.error(`Supabase update failed for ${table}:`, e);
    }
  } else {
    await persistToSharedCloudStore(table, memoryCache[table]);
  }

  return true;
};

/**
 * Item-Level Delete Mutation
 */
export const syncDeleteItem = async (table: string, id: string): Promise<boolean> => {
  const syncPayload: SyncPayload = {
    type: 'DELETE',
    table,
    id,
    timestamp: Date.now(),
  };

  if (broadcastChannel) {
    broadcastChannel.postMessage(syncPayload);
  }

  // Update memory cache
  const existing = memoryCache[table] || [];
  memoryCache[table] = existing.filter((x) => x.id !== id);

  if (isSupabaseConfigured()) {
    try {
      await supabase.from(table).delete().eq('id', id);
    } catch (e) {
      console.error(`Supabase delete failed for ${table}:`, e);
    }
  } else {
    await persistToSharedCloudStore(table, memoryCache[table]);
  }

  return true;
};


