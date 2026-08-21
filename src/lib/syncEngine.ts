import { supabase, isSupabaseConfigured } from './supabase';

export interface SyncPayload<T = any> {
  type: 'INSERT' | 'UPDATE' | 'DELETE' | 'RESET';
  table: string;
  id?: string;
  payload?: T;
  timestamp: number;
}

const SYNC_CHANNEL_NAME = 'calender_live_sync_v2';
const broadcastChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel(SYNC_CHANNEL_NAME)
    : null;

type GlobalSyncListener = (store: Record<string, any[]>) => void;
const globalSyncListeners = new Set<GlobalSyncListener>();

// In-memory store per table
const memoryStore = new Map<string, Map<string, any>>();

function getStoreSnapshot(): Record<string, any[]> {
  const result: Record<string, any[]> = {};
  memoryStore.forEach((map, table) => {
    result[table] = Array.from(map.values());
  });
  return result;
}

function notifyGlobalListeners() {
  const snapshot = getStoreSnapshot();
  globalSyncListeners.forEach((cb) => {
    try {
      cb(snapshot);
    } catch (err) {
      console.error('Sync listener error:', err);
    }
  });
}

function updateMemoryCache(event: SyncPayload) {
  if (!memoryStore.has(event.table)) {
    memoryStore.set(event.table, new Map());
  }
  const tableMap = memoryStore.get(event.table)!;

  if (event.type === 'INSERT' || event.type === 'UPDATE') {
    if (event.id && event.payload) {
      tableMap.set(event.id, { ...tableMap.get(event.id), ...event.payload });
    }
  } else if (event.type === 'DELETE') {
    if (event.id) {
      tableMap.delete(event.id);
    }
  }
}

// Multi-tab broadcast channel listener
if (broadcastChannel) {
  broadcastChannel.onmessage = (msg: MessageEvent<SyncPayload>) => {
    if (msg && msg.data) {
      updateMemoryCache(msg.data);
      notifyGlobalListeners();
    }
  };
}

// Supabase Realtime Postgres Changes listener
if (isSupabaseConfigured()) {
  try {
    supabase
      .channel('calender-realtime-schema')
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
            id: (newRecord?.id || oldRecord?.id) as string | undefined,
            payload: syncType === 'DELETE' ? oldRecord : newRecord,
            timestamp: Date.now(),
          };

          updateMemoryCache(syncData);
          notifyGlobalListeners();

          if (broadcastChannel) {
            broadcastChannel.postMessage(syncData);
          }
        }
      )
      .subscribe();
  } catch (err) {
    console.warn('Supabase Realtime subscription error:', err);
  }
}

export const syncEngine = {
  subscribeToSync: (listener: GlobalSyncListener) => {
    globalSyncListeners.add(listener);
    return () => {
      globalSyncListeners.delete(listener);
    };
  },

  fetchAll: async (): Promise<Record<string, any[]>> => {
    const tables = ['events', 'classes', 'tasks', 'habits', 'habitCompletions', 'groceryItems', 'mealItems', 'bookItems'];

    if (isSupabaseConfigured()) {
      await Promise.all(
        tables.map(async (table) => {
          try {
            const { data, error } = await supabase.from(table).select('*');
            if (!error && Array.isArray(data)) {
              if (!memoryStore.has(table)) memoryStore.set(table, new Map());
              const tableMap = memoryStore.get(table)!;
              tableMap.clear();
              data.forEach((item) => {
                if (item && item.id) tableMap.set(item.id, item);
              });
            }
          } catch (e) {
            console.warn(`Supabase fetch failed for ${table}:`, e);
          }
        })
      );
    }

    notifyGlobalListeners();
    return getStoreSnapshot();
  },

  upsertItem: async <T extends { id: string }>(table: string, item: T): Promise<T> => {
    const syncPayload: SyncPayload<T> = {
      type: 'UPDATE',
      table,
      id: item.id,
      payload: item,
      timestamp: Date.now(),
    };

    updateMemoryCache(syncPayload);
    notifyGlobalListeners();

    if (broadcastChannel) {
      broadcastChannel.postMessage(syncPayload);
    }

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from(table).upsert([item]);
        if (error) console.error(`Supabase upsert error [${table}]:`, error.message);
      } catch (err) {
        console.error(`Supabase upsert exception [${table}]:`, err);
      }
    }

    return item;
  },

  deleteItem: async (table: string, id: string): Promise<boolean> => {
    const syncPayload: SyncPayload = {
      type: 'DELETE',
      table,
      id,
      timestamp: Date.now(),
    };

    updateMemoryCache(syncPayload);
    notifyGlobalListeners();

    if (broadcastChannel) {
      broadcastChannel.postMessage(syncPayload);
    }

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) console.error(`Supabase delete error [${table}]:`, error.message);
      } catch (err) {
        console.error(`Supabase delete exception [${table}]:`, err);
      }
    }

    return true;
  },
};
