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

// In-memory store per table with LocalStorage persistence backup
const memoryStore = new Map<string, Map<string, any>>();

function loadFromLocalStorage(table: string) {
  try {
    const raw = localStorage.getItem(`calender_sync_${table}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        if (!memoryStore.has(table)) memoryStore.set(table, new Map());
        const map = memoryStore.get(table)!;
        map.clear();
        parsed.forEach((item) => {
          if (item && item.id) map.set(item.id, item);
        });
      }
    }
  } catch (err) {
    console.warn(`LocalStorage load failed for ${table}:`, err);
  }
}

function saveToLocalStorage(table: string) {
  try {
    const map = memoryStore.get(table);
    if (map) {
      const arr = Array.from(map.values());
      localStorage.setItem(`calender_sync_${table}`, JSON.stringify(arr));
    } else {
      localStorage.removeItem(`calender_sync_${table}`);
    }
  } catch (err) {
    console.warn(`LocalStorage save failed for ${table}:`, err);
  }
}

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
  } else if (event.type === 'RESET') {
    tableMap.clear();
  }

  saveToLocalStorage(event.table);
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
    const tables = ['events', 'classes', 'tasks', 'habits', 'habitCompletions', 'groceryItems', 'mealItems', 'bookItems', 'profileColors', 'dateColors'];

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
              saveToLocalStorage(table);
            } else {
              loadFromLocalStorage(table);
            }
          } catch (e) {
            console.warn(`Supabase fetch failed for ${table}:`, e);
            loadFromLocalStorage(table);
          }
        })
      );
    } else {
      tables.forEach((table) => loadFromLocalStorage(table));
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

  clearTable: async (table: string): Promise<boolean> => {
    const syncPayload: SyncPayload = {
      type: 'RESET',
      table,
      timestamp: Date.now(),
    };

    updateMemoryCache(syncPayload);
    notifyGlobalListeners();

    if (broadcastChannel) {
      broadcastChannel.postMessage(syncPayload);
    }

    if (isSupabaseConfigured()) {
      try {
        // Delete all records in table
        const { error } = await supabase.from(table).delete().neq('id', '___impossible_id___');
        if (error) console.error(`Supabase clear table error [${table}]:`, error.message);
      } catch (err) {
        console.error(`Supabase clear table exception [${table}]:`, err);
      }
    }

    return true;
  },
};

