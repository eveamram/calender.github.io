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
    const channel = supabase
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
