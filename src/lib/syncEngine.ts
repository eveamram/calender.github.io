import { supabase, isSupabaseConfigured } from './supabase';

export interface SyncPayload<T = any> {
  type: 'INSERT' | 'UPDATE' | 'DELETE' | 'RESET';
  table: string; // Logical app table name
  id?: string;
  payload?: T;
  timestamp: number;
}

export const APP_TABLES = [
  'events',
  'classes',
  'tasks',
  'habits',
  'habitCompletions',
  'groceryItems',
  'mealItems',
  'bookItems',
  'profileColors',
  'dateColors',
] as const;

export type AppTable = typeof APP_TABLES[number];

// Master 1:1 Authoritative Mapping: Logical App Table Key -> Supabase PostgreSQL Table Name
export const APP_TO_SUPABASE_TABLE_MAP: Record<string, string> = {
  events: 'events',
  classes: 'classes',
  tasks: 'tasks',
  habits: 'habits',
  habitCompletions: 'habitCompletions',
  groceryItems: 'groceryItems',
  mealItems: 'mealItems',
  bookItems: 'bookItems',
  profileColors: 'profileColors',
  dateColors: 'dateColors',
};

// Reverse Mapping: Supabase PostgreSQL Table Name -> Logical App Table Key
export const SUPABASE_TO_APP_TABLE_MAP: Record<string, string> = {
  events: 'events',
  classes: 'classes',
  tasks: 'tasks',
  habits: 'habits',
  habitCompletions: 'habitCompletions',
  groceryItems: 'groceryItems',
  mealItems: 'mealItems',
  bookItems: 'bookItems',
  profileColors: 'profileColors',
  dateColors: 'dateColors',
  // PostgreSQL snake_case aliases for backwards compatibility
  habit_completions: 'habitCompletions',
  grocery_items: 'groceryItems',
  meal_items: 'mealItems',
  book_items: 'bookItems',
  profile_colors: 'profileColors',
  date_colors: 'dateColors',
};

const SYNC_CHANNEL_NAME = 'calender_live_sync_v4';
const broadcastChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel(SYNC_CHANNEL_NAME)
    : null;

type GlobalSyncListener = (store: Record<string, any[]>) => void;
const globalSyncListeners = new Set<GlobalSyncListener>();

export interface SyncStatus {
  isConfigured: boolean;
  isSyncing: boolean;
  syncError: string | null;
  lastSyncedAt: number | null;
}

type SyncStatusListener = (status: SyncStatus) => void;
const syncStatusListeners = new Set<SyncStatusListener>();

let currentSyncStatus: SyncStatus = {
  isConfigured: isSupabaseConfigured(),
  isSyncing: false,
  syncError: isSupabaseConfigured()
    ? null
    : 'Supabase credentials missing or unconfigured. Please connect to shared Supabase Cloud database.',
  lastSyncedAt: null,
};

function updateSyncStatus(updates: Partial<SyncStatus>) {
  currentSyncStatus = { ...currentSyncStatus, ...updates };
  syncStatusListeners.forEach((cb) => {
    try {
      cb(currentSyncStatus);
    } catch (e) {
      console.error('Error in sync status listener:', e);
    }
  });
}

// Server-Authoritative In-Memory Store ONLY: Map<appTable, Map<itemId, itemObject>>
// No local storage content fallback is used. Supabase Cloud DB is the single source of truth.
const memoryStore = new Map<string, Map<string, any>>();
APP_TABLES.forEach((tbl) => memoryStore.set(tbl, new Map()));

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

function applyMemoryMutation(event: SyncPayload) {
  const table = event.table;
  if (!memoryStore.has(table)) {
    memoryStore.set(table, new Map());
  }
  const tableMap = memoryStore.get(table)!;

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
}

// Multi-tab BroadcastChannel listener for tabs on the same origin
if (broadcastChannel) {
  broadcastChannel.onmessage = (msg: MessageEvent<SyncPayload>) => {
    if (msg?.data) {
      applyMemoryMutation(msg.data);
      notifyGlobalListeners();
    }
  };
}

// Supabase Realtime Listener (Global WebSockets across all devices)
if (isSupabaseConfigured()) {
  try {
    supabase
      .channel('calender-realtime-global')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          const rawTable = payload.table;
          const appTable = SUPABASE_TO_APP_TABLE_MAP[rawTable] || rawTable;
          const eventType = payload.eventType;

          let syncType: SyncPayload['type'] = 'UPDATE';
          if (eventType === 'INSERT') syncType = 'INSERT';
          if (eventType === 'DELETE') syncType = 'DELETE';

          const oldRecord = payload.old as Record<string, any> | undefined;
          const newRecord = payload.new as Record<string, any> | undefined;
          const targetId = (newRecord?.id || oldRecord?.id) as string | undefined;

          const syncData: SyncPayload = {
            type: syncType,
            table: appTable,
            id: targetId,
            payload: syncType === 'DELETE' ? oldRecord : newRecord,
            timestamp: Date.now(),
          };

          applyMemoryMutation(syncData);
          notifyGlobalListeners();

          if (broadcastChannel) {
            broadcastChannel.postMessage(syncData);
          }
        }
      )
      .subscribe();
  } catch (err) {
    console.warn('Supabase Realtime global subscription error:', err);
  }
}

export const syncEngine = {
  subscribeToSync: (listener: GlobalSyncListener) => {
    globalSyncListeners.add(listener);
    listener(getStoreSnapshot());
    return () => {
      globalSyncListeners.delete(listener);
    };
  },

  subscribeSyncStatus: (listener: SyncStatusListener) => {
    syncStatusListeners.add(listener);
    listener(currentSyncStatus);
    return () => {
      syncStatusListeners.delete(listener);
    };
  },

  getSyncStatus: (): SyncStatus => currentSyncStatus,
  isConfigured: () => isSupabaseConfigured(),

  /**
   * SERVER-AUTHORITATIVE FETCH ALL (Supabase is single source of truth)
   */
  fetchAll: async (): Promise<Record<string, any[]>> => {
    if (!isSupabaseConfigured()) {
      updateSyncStatus({
        isSyncing: false,
        syncError: 'Supabase credentials missing or unconfigured.',
      });
      notifyGlobalListeners();
      return getStoreSnapshot();
    }

    updateSyncStatus({ isSyncing: true, syncError: null });
    let fetchErrors: string[] = [];

    await Promise.all(
      APP_TABLES.map(async (appTable) => {
        const dbTable = APP_TO_SUPABASE_TABLE_MAP[appTable] || appTable;
        try {
          const { data, error } = await supabase.from(dbTable).select('*');
          if (!error && Array.isArray(data)) {
            const tableMap = memoryStore.get(appTable)!;
            tableMap.clear();
            data.forEach((item) => {
              if (item && item.id) {
                tableMap.set(item.id, item);
              }
            });
          } else if (error) {
            const errMsg = `Fetch failed for ${appTable} (${dbTable}): ${error.message}`;
            console.error(errMsg, error);
            fetchErrors.push(errMsg);
          }
        } catch (e: any) {
          const errMsg = `Exception fetching ${appTable}: ${e?.message || e}`;
          console.error(errMsg, e);
          fetchErrors.push(errMsg);
        }
      })
    );

    if (fetchErrors.length > 0) {
      updateSyncStatus({
        isSyncing: false,
        syncError: fetchErrors.join('; '),
      });
    } else {
      updateSyncStatus({
        isSyncing: false,
        syncError: null,
        lastSyncedAt: Date.now(),
      });
    }

    notifyGlobalListeners();
    return getStoreSnapshot();
  },

  /**
   * Item-level upsert mutation with server rollback on failure.
   */
  upsertItem: async <T extends { id: string }>(appTable: string, item: T): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      updateSyncStatus({ syncError: 'Cannot write: Supabase unconfigured.' });
      return false;
    }

    const tableMap = memoryStore.get(appTable);
    const previousItem = tableMap ? tableMap.get(item.id) : undefined;
    const isNewItem = previousItem === undefined;

    const syncPayload: SyncPayload<T> = {
      type: 'UPDATE',
      table: appTable,
      id: item.id,
      payload: item,
      timestamp: Date.now(),
    };

    // Optimistic memory mutation
    applyMemoryMutation(syncPayload);
    notifyGlobalListeners();
    if (broadcastChannel) broadcastChannel.postMessage(syncPayload);

    const dbTable = APP_TO_SUPABASE_TABLE_MAP[appTable] || appTable;
    try {
      const { error } = await supabase.from(dbTable).upsert([item]);
      if (error) {
        console.error(`Supabase upsert error [${appTable} -> ${dbTable}]:`, error.message, error);
        // ROLLBACK OPTIMISTIC UPDATE ON SERVER REJECTION
        if (tableMap) {
          if (isNewItem) {
            tableMap.delete(item.id);
          } else {
            tableMap.set(item.id, previousItem);
          }
          notifyGlobalListeners();
        }
        updateSyncStatus({ syncError: `Write rejected by server [${appTable}]: ${error.message}` });
        return false;
      }
    } catch (err: any) {
      console.error(`Supabase upsert exception [${appTable} -> ${dbTable}]:`, err);
      // ROLLBACK OPTIMISTIC UPDATE ON EXCEPTION
      if (tableMap) {
        if (isNewItem) {
          tableMap.delete(item.id);
        } else {
          tableMap.set(item.id, previousItem);
        }
        notifyGlobalListeners();
      }
      updateSyncStatus({ syncError: `Write exception [${appTable}]: ${err?.message || err}` });
      return false;
    }

    updateSyncStatus({ lastSyncedAt: Date.now(), syncError: null });
    return true;
  },

  /**
   * Item-level delete mutation with server rollback on failure.
   */
  deleteItem: async (appTable: string, id: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      updateSyncStatus({ syncError: 'Cannot delete: Supabase unconfigured.' });
      return false;
    }

    const tableMap = memoryStore.get(appTable);
    const previousItem = tableMap ? tableMap.get(id) : undefined;
    if (!previousItem && !tableMap?.has(id)) {
      return true;
    }

    const syncPayload: SyncPayload = {
      type: 'DELETE',
      table: appTable,
      id,
      timestamp: Date.now(),
    };

    // Optimistic memory deletion
    applyMemoryMutation(syncPayload);
    notifyGlobalListeners();
    if (broadcastChannel) broadcastChannel.postMessage(syncPayload);

    const dbTable = APP_TO_SUPABASE_TABLE_MAP[appTable] || appTable;
    try {
      const { error } = await supabase.from(dbTable).delete().eq('id', id);
      if (error) {
        console.error(`Supabase delete error [${appTable} -> ${dbTable}]:`, error.message, error);
        // ROLLBACK OPTIMISTIC DELETION ON SERVER REJECTION
        if (tableMap && previousItem !== undefined) {
          tableMap.set(id, previousItem);
          notifyGlobalListeners();
        }
        updateSyncStatus({ syncError: `Delete rejected by server [${appTable}]: ${error.message}` });
        return false;
      }
    } catch (err: any) {
      console.error(`Supabase delete exception [${appTable} -> ${dbTable}]:`, err);
      // ROLLBACK OPTIMISTIC DELETION ON EXCEPTION
      if (tableMap && previousItem !== undefined) {
        tableMap.set(id, previousItem);
        notifyGlobalListeners();
      }
      updateSyncStatus({ syncError: `Delete exception [${appTable}]: ${err?.message || err}` });
      return false;
    }

    updateSyncStatus({ lastSyncedAt: Date.now(), syncError: null });
    return true;
  },

  /**
   * Table-level clear mutation with server rollback on failure.
   */
  clearTable: async (appTable: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      updateSyncStatus({ syncError: 'Cannot clear: Supabase unconfigured.' });
      return false;
    }

    const tableMap = memoryStore.get(appTable);
    const previousSnapshot = tableMap ? new Map(tableMap) : new Map();

    const syncPayload: SyncPayload = {
      type: 'RESET',
      table: appTable,
      timestamp: Date.now(),
    };

    // Optimistic memory clear
    applyMemoryMutation(syncPayload);
    notifyGlobalListeners();
    if (broadcastChannel) broadcastChannel.postMessage(syncPayload);

    const dbTable = APP_TO_SUPABASE_TABLE_MAP[appTable] || appTable;
    try {
      const { error } = await supabase.from(dbTable).delete().neq('id', '___impossible_id___');
      if (error) {
        console.error(`Supabase clear table error [${appTable} -> ${dbTable}]:`, error.message, error);
        // ROLLBACK OPTIMISTIC CLEAR ON SERVER REJECTION
        if (tableMap) {
          previousSnapshot.forEach((val, key) => tableMap.set(key, val));
          notifyGlobalListeners();
        }
        updateSyncStatus({ syncError: `Clear table rejected [${appTable}]: ${error.message}` });
        return false;
      }
    } catch (err: any) {
      console.error(`Supabase clear table exception [${appTable} -> ${dbTable}]:`, err);
      // ROLLBACK OPTIMISTIC CLEAR ON EXCEPTION
      if (tableMap) {
        previousSnapshot.forEach((val, key) => tableMap.set(key, val));
        notifyGlobalListeners();
      }
      updateSyncStatus({ syncError: `Clear table exception [${appTable}]: ${err?.message || err}` });
      return false;
    }

    updateSyncStatus({ lastSyncedAt: Date.now(), syncError: null });
    return true;
  },
};
