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

// Columns that exist (or will exist) on each Postgres table.
// Client-only fields like is_habit_item must never be sent.
const DB_COLUMNS: Record<AppTable, readonly string[]> = {
  events: ['id', 'title', 'event_type', 'event_date', 'start_time', 'end_time', 'location', 'color', 'task_id', 'is_completed', 'profile', 'created_at', 'updated_at'],
  classes: ['id', 'name', 'instructor', 'room', 'start_time', 'end_time', 'days_of_week', 'color', 'profile', 'office_hours', 'office_hours_location', 'created_at', 'updated_at'],
  tasks: ['id', 'title', 'is_completed', 'due_date', 'due_time', 'priority', 'profile', 'created_at', 'updated_at'],
  habits: ['id', 'title', 'emoji', 'target_quantity', 'target_unit', 'active_days', 'color', 'profile', 'show_in_daily_schedule', 'created_at', 'updated_at'],
  habitCompletions: ['id', 'habit_id', 'date', 'completed', 'current_quantity', 'created_at'],
  groceryItems: ['id', 'name', 'quantity', 'category', 'is_completed', 'profile', 'created_at', 'updated_at'],
  mealItems: ['id', 'title', 'day_of_week', 'meal_date', 'meal_type', 'notes', 'profile', 'created_at', 'updated_at'],
  bookItems: ['id', 'title', 'author', 'status', 'current_page', 'total_pages', 'eve_page', 'abbie_page', 'rating', 'genre', 'profile', 'created_at', 'updated_at'],
  profileColors: ['id', 'color'],
  dateColors: ['id', 'color'],
};

function toDbPayload(appTable: AppTable, item: Record<string, any>): Record<string, any> {
  const allowed = new Set(DB_COLUMNS[appTable]);
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(item)) {
    if (!allowed.has(key) || value === undefined) continue;
    out[key] = value;
  }
  return out;
}

function unknownColumnFromError(message?: string): string | null {
  const match = message?.match(/Could not find the '([^']+)' column/);
  return match?.[1] ?? null;
}

async function upsertToSupabase(
  appTable: AppTable,
  item: Record<string, any>
): Promise<{ ok: boolean; errorMessage?: string }> {
  const dbTable = TABLE_MAP[appTable];
  const dbPayload = toDbPayload(appTable, item);
  for (let attempt = 0; attempt < 6; attempt++) {
    const { error } = await supabase.from(dbTable).upsert([dbPayload]).select();
    if (!error) return { ok: true };
    const unknownCol = unknownColumnFromError(error.message);
    if (error.code === 'PGRST204' && unknownCol && unknownCol in dbPayload) {
      delete dbPayload[unknownCol];
      continue;
    }
    return { ok: false, errorMessage: error.message };
  }
  return { ok: false, errorMessage: 'Too many schema retries' };
}

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

const SYNC_CHANNEL_NAME = 'calender_live_sync_v6';
const LOCAL_TABLE_PREFIX = 'calender_app_table_v6_';

// Leftover sample items that kept coming back from old device cache.
const RETIRED_ITEM_IDS = new Set([
  'hbt-1787432450370-wtikf', // "water"
  'tsk-1787439097233-tgyqw', // "Buy milk"
  'tsk-1787440158272-6ko41', // "Buy bread"
  'tsk-1787587530334-wn7mk', // "Homework 1"
  'tsk-1787616192331-htk1c', // "Task 1"
]);

function isRetiredItemId(id?: string): boolean {
  return Boolean(id && RETIRED_ITEM_IDS.has(id));
}
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

// Memory + LocalStorage Persistent Store: Map<appTable, Map<itemId, itemObject>>
const memoryStore = new Map<string, Map<string, any>>();

APP_TABLES.forEach((tbl) => {
  const map = new Map<string, any>();
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(`${LOCAL_TABLE_PREFIX}${tbl}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((item) => {
            if (item && item.id && !isRetiredItemId(item.id)) map.set(item.id, item);
          });
        }
      }
    } catch (e) {
      console.error(`Error reading local storage cache for ${tbl}:`, e);
    }
  }
  memoryStore.set(tbl, map);
});

function saveLocalSnapshot(table: string) {
  if (typeof window !== 'undefined') {
    try {
      const tableMap = memoryStore.get(table);
      if (tableMap) {
        const arr = Array.from(tableMap.values());
        localStorage.setItem(`${LOCAL_TABLE_PREFIX}${table}`, JSON.stringify(arr));
      }
    } catch (e) {
      console.error(`Error writing local storage cache for ${table}:`, e);
    }
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

function applyMemoryMutation(event: SyncPayload) {
  const table = event.table;
  if (!memoryStore.has(table)) {
    memoryStore.set(table, new Map());
  }
  const tableMap = memoryStore.get(table)!;

  if (event.type === 'INSERT' || event.type === 'UPDATE') {
    if (event.id && isRetiredItemId(event.id)) {
      tableMap.delete(event.id);
    } else if (event.id && event.payload) {
      tableMap.set(event.id, { ...tableMap.get(event.id), ...event.payload });
    }
  } else if (event.type === 'DELETE') {
    if (event.id) {
      tableMap.delete(event.id);
    }
  } else if (event.type === 'RESET') {
    tableMap.clear();
  }
  saveLocalSnapshot(table);
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
        syncError: `Supabase database notice: ${error.message}`,
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
   * SERVER-AUTHORITATIVE FETCH ALL WITH LOCAL CACHE FALLBACK
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
            const remoteIds = new Set(data.map((d) => d.id));

            data.forEach((item) => {
              if (item && item.id && !isRetiredItemId(item.id)) {
                const localItem = tableMap.get(item.id);
                tableMap.set(item.id, { ...localItem, ...item });
              }
            });

            for (const retiredId of RETIRED_ITEM_IDS) {
              if (tableMap.has(retiredId) || remoteIds.has(retiredId)) {
                tableMap.delete(retiredId);
                remoteIds.delete(retiredId);
                supabase.from(dbTable).delete().eq('id', retiredId).then(({ error }) => {
                  if (error) {
                    console.warn(`Could not remove leftover item ${retiredId} from ${dbTable}:`, error.message);
                  }
                });
              }
            }

            // Cloud is the source of truth. Only keep (and upload) rows created in
            // the last 5 minutes that have not reached the server yet. Older
            // local-only rows are leftover cache and must not be resurrected.
            const keepLocalOnly = new Set<string>();
            for (const [localId, localItem] of Array.from(tableMap.entries())) {
              if (isRetiredItemId(localId)) {
                tableMap.delete(localId);
                continue;
              }
              if (remoteIds.has(localId)) continue;
              const timestamp = Number(String(localId).split('-')[1]);
              const isNewLocal = Number.isFinite(timestamp) && Date.now() - timestamp < 300000;
              if (!isNewLocal) continue;
              keepLocalOnly.add(localId);
              const uploaded = await upsertToSupabase(appTable, localItem);
              if (uploaded.ok) {
                remoteIds.add(localId);
                keepLocalOnly.delete(localId);
              } else if (uploaded.errorMessage) {
                console.warn(`Supabase pending-upload warning [${appTable}]:`, uploaded.errorMessage);
              }
            }

            Array.from(tableMap.keys()).forEach((localId) => {
              if (!remoteIds.has(localId) && !keepLocalOnly.has(localId)) {
                tableMap.delete(localId);
              }
            });
            saveLocalSnapshot(appTable);
          } else if (error) {
            const errMsg = `Cloud table '${dbTable}' sync notice: ${error.message}`;
            console.warn(errMsg, error);
            fetchErrors.push(errMsg);
          }
        } catch (e: any) {
          const errMsg = `Exception fetching ${appTable}: ${e?.message || e}`;
          console.warn(errMsg, e);
          fetchErrors.push(errMsg);
        }
      })
    );

    if (fetchErrors.length > 0) {
      updateSyncStatus({
        isSyncing: false,
        syncError: fetchErrors[0], // Display primary notice without blocking UI
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
   * Item-level upsert mutation: Always saves locally instantly; pushes to Supabase Cloud if available.
   */
  upsertItem: async <T extends { id: string }>(appTable: AppTable, item: T): Promise<boolean> => {
    if (isRetiredItemId(item.id)) {
      return true;
    }
    const syncPayload: SyncPayload<T> = {
      type: 'UPDATE',
      table: appTable,
      id: item.id,
      payload: item,
      timestamp: Date.now(),
    };

    // Instant local memory & localStorage mutation
    applyMemoryMutation(syncPayload);
    notifyGlobalListeners();
    if (broadcastChannel) broadcastChannel.postMessage(syncPayload);

    if (!isSupabaseConfigured()) {
      return true;
    }

    const dbTable = TABLE_MAP[appTable];
    try {
      const uploaded = await upsertToSupabase(appTable, item as Record<string, any>);
      if (!uploaded.ok) {
        console.warn(`Supabase upsert warning [${appTable} -> ${dbTable}]:`, uploaded.errorMessage);
        updateSyncStatus({ syncError: `Saved locally. Cloud sync notice: ${uploaded.errorMessage}` });
        return true; // Return true so UI operation completes without throwing away user edits!
      }
      console.log(`Supabase upsert SUCCESS [${appTable} -> ${dbTable}]`);
    } catch (err: any) {
      console.warn(`Supabase upsert exception [${appTable} -> ${dbTable}]:`, err);
      updateSyncStatus({ syncError: `Saved locally. Cloud sync exception: ${err?.message || err}` });
      return true;
    }

    updateSyncStatus({ lastSyncedAt: Date.now(), syncError: null });
    return true;
  },

  /**
   * Item-level delete mutation: Always deletes locally instantly; pushes deletion to Supabase Cloud if available.
   */
  deleteItem: async (appTable: AppTable, id: string): Promise<boolean> => {
    const syncPayload: SyncPayload = {
      type: 'DELETE',
      table: appTable,
      id,
      timestamp: Date.now(),
    };

    // Instant local memory & localStorage deletion
    applyMemoryMutation(syncPayload);
    notifyGlobalListeners();
    if (broadcastChannel) broadcastChannel.postMessage(syncPayload);

    if (!isSupabaseConfigured()) {
      return true;
    }

    const dbTable = TABLE_MAP[appTable];
    try {
      const { data, error } = await supabase.from(dbTable).delete().eq('id', id).select();
      if (error) {
        console.warn(`Supabase delete warning [${appTable} -> ${dbTable}]:`, error.message);
        updateSyncStatus({ syncError: `Deleted locally. Cloud sync notice: ${error.message}` });
        return true;
      }
      console.log(`Supabase delete SUCCESS [${appTable} -> ${dbTable}]:`, data);
    } catch (err: any) {
      console.warn(`Supabase delete exception [${appTable} -> ${dbTable}]:`, err);
      updateSyncStatus({ syncError: `Deleted locally. Cloud sync exception: ${err?.message || err}` });
      return true;
    }

    updateSyncStatus({ lastSyncedAt: Date.now(), syncError: null });
    return true;
  },

  /**
   * Table-level clear mutation: Always clears locally instantly; clears Supabase table if available.
   */
  clearTable: async (appTable: AppTable): Promise<boolean> => {
    const syncPayload: SyncPayload = {
      type: 'RESET',
      table: appTable,
      timestamp: Date.now(),
    };

    // Instant local memory & localStorage clear
    applyMemoryMutation(syncPayload);
    notifyGlobalListeners();
    if (broadcastChannel) broadcastChannel.postMessage(syncPayload);

    if (!isSupabaseConfigured()) {
      return true;
    }

    const dbTable = TABLE_MAP[appTable];
    try {
      const { error } = await supabase.from(dbTable).delete().neq('id', '___impossible_id___');
      if (error) {
        console.warn(`Supabase clear table warning [${appTable} -> ${dbTable}]:`, error.message);
        updateSyncStatus({ syncError: `Cleared locally. Cloud sync notice: ${error.message}` });
        return true;
      }
      console.log(`Supabase clear table SUCCESS [${appTable} -> ${dbTable}]`);
    } catch (err: any) {
      console.warn(`Supabase clear table exception [${appTable} -> ${dbTable}]:`, err);
      updateSyncStatus({ syncError: `Cleared locally. Cloud sync exception: ${err?.message || err}` });
      return true;
    }

    updateSyncStatus({ lastSyncedAt: Date.now(), syncError: null });
    return true;
  },
};
