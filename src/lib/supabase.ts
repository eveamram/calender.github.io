import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getEnvOrStorage = (key: string, storageKey: string): string => {
  const envVal = import.meta.env[key];
  if (envVal && typeof envVal === 'string' && envVal.length > 5 && !envVal.includes('your_')) {
    return envVal;
  }
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved && typeof saved === 'string' && saved.length > 5) return saved;
  } catch (e) { }
  return '';
};

export const getSupabaseUrl = (): string => {
  const val = getEnvOrStorage('VITE_SUPABASE_URL', 'calender_supabase_url');
  return val || 'https://rfvhqhlfrpaswgexrjqz.supabase.co';
};

export const getSupabaseAnonKey = (): string => {
  const val = getEnvOrStorage('VITE_SUPABASE_ANON_KEY', 'calender_supabase_key');
  return val || 'sb_publishable_gDiT6Wk52sGIpO0i2twPJA_JRIyRm_B';
};

export const supabaseUrl = getSupabaseUrl();
export const supabaseAnonKey = getSupabaseAnonKey();

export const isSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return (
    Boolean(url) &&
    Boolean(key) &&
    url.startsWith('http') &&
    url !== 'https://your-supabase-project-url.supabase.co' &&
    key !== 'your-anon-key'
  );
};

export const getSupabaseConfigStatus = () => {
  const configured = isSupabaseConfigured();
  const url = getSupabaseUrl();
  if (!configured) {
    return {
      isConfigured: false,
      message: 'Unable to connect to shared data. Supabase Cloud database connection missing or unconfigured.',
      url: url || 'Unset',
    };
  }
  return {
    isConfigured: true,
    message: 'Connected to shared Supabase Cloud database.',
    url,
  };
};

let currentClient: SupabaseClient | null = null;
let currentClientUrl = '';
let currentClientKey = '';

export const getSupabaseClient = (): SupabaseClient => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  if (currentClient && currentClientUrl === url && currentClientKey === key) {
    return currentClient;
  }

  currentClientUrl = url;
  currentClientKey = key;

  const validUrl = isSupabaseConfigured() ? url : 'https://placeholder.supabase.co';
  const validKey = isSupabaseConfigured() ? key : 'placeholder-key';

  currentClient = createClient(validUrl, validKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return currentClient;
};

// Proxied export ensuring calls to supabase methods always use the latest initialized client
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const instance = getSupabaseClient();
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
