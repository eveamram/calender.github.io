import { supabase, isSupabaseConfigured } from './supabase';

export interface SyncPayload<T = any> {
  type: 'INSERT' | 'UPDATE' | 'DELETE' | 'RESET';
  table: string; // Logical app table key (e.g. habitCompletions)
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

// Master Single Source of Truth Table Mapping: Logical App Table Key -> PostgreSQL snake_case Table Name
export const TABLE_MAP: Record<AppTable, string> = {
  events: 'events',
  classes: 'classes',
  tasks: 'tasks',
  habits: 'habits',
  habitCompletions: 'habit_completions',
  groceryItems: 'grocery_items',
  mealItems: 'meal_items',
  bookItems: 'book_items',
  profileColors: 'profile_colors',
  dateColors: 'date_colors',
};

// Reverse Mapping: Supabase PostgreSQL Table Name -> Logical App Table Key
export const REVERSE_TABLE_MAP: Record<string, AppTable> = {
  events: 'events',
  classes: 'classes',
  tasks: 'tasks',
  habits: 'habits',
  habit_completions: 'habitCompletions',
  grocery_items: 'groceryItems',
  meal_items: 'mealItems',
  book_items: 'bookItems',
  profile_colors: 'profileColors',
  date_colors: 'dateColors',
  // Backward compatibility aliases if legacy camelCase tables exist
  habitCompletions: 'habitCompletions',
  groceryItems: 'groceryItems',
  mealItems: 'mealItems',
  bookItems: 'bookItems',
  profileColors: 'profileColors',
  dateColors: 'dateColors',
};

const SYNC_CHANNEL_NAME = 'calender_live_sync_v5';
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
    : 'Unable to connect to shared data. Supabase credentials missing or unconfigured.',
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

// Diagnostic Connection Test & Realtime Initialization
export const runConnectionDiagnostic = async () => {
  if (!isSupabaseConfigured()) {
    console.warn('SUPABASE TEST: Client unconfigured');
    updateSyncStatus({
      isConfigured: false,
      syncError: 'Unable to connect to shared data. Supabase credentials unconfigured.',
    });
    return;
  }

  try {
    const { data, error } = await supabase.from('events').select('*').limit(1);
    console.log('SUPABASE TEST', { data, error });
    if (error) {
      console.error('SUPABASE CONNECTION TEST FAILED:', error.message, error);
      updateSyncStatus({
        syncError: `Supabase diagnostic failed: ${error.message}`,
      });
    } else {
      updateSyncStatus({ isConfigured: true, syncError: null });
    }
  } catch (e: any) {
    console.error('SUPABASE TEST EXCEPTION:', e);
    updateSyncStatus({
      syncError: `Supabase diagnostic exception: ${e?.message || e}`,
    });
  }
};

// Initialize Realtime Listener
let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

export const initRealtimeSubscription = () => {
  if (!isSupabaseConfigured()) return;
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
  }

  try {
    realtimeChannel = supabase
      .channel('calender-realtime-global-v5')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          const rawTable = payload.table;
          const appTable = REVERSE_TABLE_MAP[rawTable] || rawTable;
          const eventType = payload.eventType;

          let syncType: SyncPayload['type'] = 'UPDATE';
          if (eventType === 'INSERT') syncType = 'INSERT';
          if (eventType === 'DELETE') syncType = 'DELETE';

          const oldRecord = payload.old as Record<string, any> | undefined;
          const newRecord = payload.new as Record<string, any> | undefined;
          const targetId = (newRecord?.id || oldRecord?.id) as string | undefined;

          console.log(`Supabase Realtime Event [${eventType}] on table '${rawTable}' -> app key '${appTable}'`, {
            id: targetId,
            newRecord,
            oldRecord,
          });

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
      .subscribe((status) => {
        console.log('Supabase realtime status:', status);
        if (status === 'SUBSCRIBED') {
          updateSyncStatus({ isSyncing: false, syncError: null });
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.warn('Supabase Realtime channel status alert:', status);
        }
      });
  } catch (err) {
    console.error('Supabase Realtime global subscription error:', err);
  }
};

// Run diagnostic, initialize subscription & set up mobile resume listeners on boot
if (typeof window !== 'undefined') {
  runConnectionDiagnostic();
  initRealtimeSubscription();

  const handleMobileResume = () => {
    if (document.visibilityState === 'visible') {
      console.log('Mobile/Tab resumed: re-verifying connection diagnostic and pulling latest state...');
      runConnectionDiagnostic();
      initRealtimeSubscription();
      syncEngine.fetchAll();
    }
  };

  window.addEventListener('visibilitychange', handleMobileResume);
  window.addEventListener('online', handleMobileResume);
  window.addEventListener('focus', handleMobileResume);
  window.addEventListener('pageshow', handleMobileResume);
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
  runConnectionDiagnostic,
  initRealtimeSubscription,

  /**
   * SERVER-AUTHORITATIVE FETCH ALL
   * Uses TABLE_MAP for every single query
   */
  fetchAll: async (): Promise<Record<string, any[]>> => {
    if (!isSupabaseConfigured()) {
      updateSyncStatus({
        isConfigured: false,
        isSyncing: false,
        syncError: 'Unable to connect to shared data. Supabase unconfigured.',
      });
      notifyGlobalListeners();
      return getStoreSnapshot();
    }

    updateSyncStatus({ isSyncing: true, syncError: null });
    let fetchErrors: string[] = [];

    await Promise.all(
      APP_TABLES.map(async (appTable) => {
        const dbTable = TABLE_MAP[appTable];
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
   * Uses TABLE_MAP[appTable] strictly.
   */
  upsertItem: async <T extends { id: string }>(appTable: AppTable, item: T): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      updateSyncStatus({ syncError: 'Unable to connect to shared data. Cannot write to server.' });
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

    const dbTable = TABLE_MAP[appTable];
    try {
      const { data, error } = await supabase.from(dbTable).upsert([item]).select();
      if (error) {
        console.error(`Supabase upsert ERROR [${appTable} -> ${dbTable}]:`, error.message, error);
        // ROLLBACK OPTIMISTIC UPDATE ON SERVER REJECTION
        if (tableMap) {
          if (isNewItem) {
            tableMap.delete(item.id);
          } else {
            tableMap.set(item.id, previousItem);
          }
          notifyGlobalListeners();
        }
        updateSyncStatus({ syncError: `Write failed [${appTable}]: ${error.message}` });
        return false; // MUST RETURN FALSE ON ERROR
      }
      console.log(`Supabase upsert SUCCESS [${appTable} -> ${dbTable}]:`, data);
    } catch (err: any) {
      console.error(`Supabase upsert EXCEPTION [${appTable} -> ${dbTable}]:`, err);
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
      return false; // MUST RETURN FALSE ON ERROR
    }

    updateSyncStatus({ lastSyncedAt: Date.now(), syncError: null });
    return true;
  },

  /**
   * Item-level delete mutation with server rollback on failure.
   * Uses TABLE_MAP[appTable] strictly.
   */
  deleteItem: async (appTable: AppTable, id: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      updateSyncStatus({ syncError: 'Unable to connect to shared data. Cannot delete from server.' });
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

    const dbTable = TABLE_MAP[appTable];
    try {
      const { data, error } = await supabase.from(dbTable).delete().eq('id', id).select();
      if (error) {
        console.error(`Supabase delete ERROR [${appTable} -> ${dbTable}]:`, error.message, error);
        // ROLLBACK OPTIMISTIC DELETION ON SERVER REJECTION
        if (tableMap && previousItem !== undefined) {
          tableMap.set(id, previousItem);
          notifyGlobalListeners();
        }
        updateSyncStatus({ syncError: `Delete failed [${appTable}]: ${error.message}` });
        return false; // MUST RETURN FALSE ON ERROR
      }
      console.log(`Supabase delete SUCCESS [${appTable} -> ${dbTable}]:`, data);
    } catch (err: any) {
      console.error(`Supabase delete EXCEPTION [${appTable} -> ${dbTable}]:`, err);
      // ROLLBACK OPTIMISTIC DELETION ON EXCEPTION
      if (tableMap && previousItem !== undefined) {
        tableMap.set(id, previousItem);
        notifyGlobalListeners();
      }
      updateSyncStatus({ syncError: `Delete exception [${appTable}]: ${err?.message || err}` });
      return false; // MUST RETURN FALSE ON ERROR
    }

    updateSyncStatus({ lastSyncedAt: Date.now(), syncError: null });
    return true;
  },

  /**
   * Table-level clear mutation with server rollback on failure.
   * Uses TABLE_MAP[appTable] strictly.
   */
  clearTable: async (appTable: AppTable): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      updateSyncStatus({ syncError: 'Unable to connect to shared data. Cannot clear server table.' });
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

    const dbTable = TABLE_MAP[appTable];
    try {
      const { error } = await supabase.from(dbTable).delete().neq('id', '___impossible_id___');
      if (error) {
        console.error(`Supabase clear table ERROR [${appTable} -> ${dbTable}]:`, error.message, error);
        // ROLLBACK OPTIMISTIC CLEAR ON SERVER REJECTION
        if (tableMap) {
          previousSnapshot.forEach((val, key) => tableMap.set(key, val));
          notifyGlobalListeners();
        }
        updateSyncStatus({ syncError: `Clear table failed [${appTable}]: ${error.message}` });
        return false; // MUST RETURN FALSE ON ERROR
      }
      console.log(`Supabase clear table SUCCESS [${appTable} -> ${dbTable}]`);
    } catch (err: any) {
      console.error(`Supabase clear table EXCEPTION [${appTable} -> ${dbTable}]:`, err);
      // ROLLBACK OPTIMISTIC CLEAR ON EXCEPTION
      if (tableMap) {
        previousSnapshot.forEach((val, key) => tableMap.set(key, val));
        notifyGlobalListeners();
      }
      updateSyncStatus({ syncError: `Clear table exception [${appTable}]: ${err?.message || err}` });
      return false; // MUST RETURN FALSE ON ERROR
    }

    updateSyncStatus({ lastSyncedAt: Date.now(), syncError: null });
    return true;
  },
};
