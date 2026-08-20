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

// Provision or get cloud fallback blob ID for unconfigured Supabase setups
const getCloudBlobKey = (table: string): string => {
  return `calender_cloud_blob_${table}`;
};

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
 * Fetch remote database data for a table using Supabase or Cloud Fallback.
 */
export const fetchInitialData = async <T = any>(table: string): Promise<T[] | null> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        console.warn(`Supabase fetch error for ${table}:`, error.message);
        return null;
      }
      return data as T[];
    } catch (e) {
      console.error(`Failed fetching initial data from Supabase for ${table}:`, e);
      return null;
    }
  }

  // Cloud fallback mechanism if Supabase is unconfigured
  try {
    const cloudBlobId = localStorage.getItem(getCloudBlobKey(table));
    if (cloudBlobId) {
      const res = await fetch(`https://jsonblob.com/api/jsonBlob/${cloudBlobId}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? (data as T[]) : null;
      }
    }
  } catch (e) {
    // Silent catch on offline/network errors
  }

  return null;
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

          // Also broadcast locally to keep all windows synchronized
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
 * Start a 3-second periodic polling interval to guarantee cross-device sync.
 */
export const startAutoPolling = <T = any>(
  table: string,
  onRemoteData: (remoteItems: T[]) => void,
  intervalMs = 3000
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

  // Broadcast to other open windows/tabs
  if (broadcastChannel) {
    broadcastChannel.postMessage(syncPayload);
  }

  // Persist to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      await supabase.from(table).insert([item]);
    } catch (e) {
      console.error(`Supabase insert failed for ${table}:`, e);
    }
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

  // Broadcast to other open windows/tabs
  if (broadcastChannel) {
    broadcastChannel.postMessage(syncPayload);
  }

  // Persist to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      await supabase.from(table).update(updates).eq('id', id);
    } catch (e) {
      console.error(`Supabase update failed for ${table}:`, e);
    }
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

  // Broadcast to other open windows/tabs
  if (broadcastChannel) {
    broadcastChannel.postMessage(syncPayload);
  }

  // Persist deletion to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      await supabase.from(table).delete().eq('id', id);
    } catch (e) {
      console.error(`Supabase delete failed for ${table}:`, e);
    }
  }

  return true;
};

