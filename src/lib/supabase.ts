import { createClient, SupabaseClient } from '@supabase/supabase-js';

const HARDCODED_URL = 'https://rfvhqhlfrpaswgexrjqz.supabase.co';
const HARDCODED_KEY = 'sb_publishable_gDiT6Wk52sGIpO0i2twPJA_JRIyRm_B';

const getEnvOrStorage = (key: string, storageKey: string, fallback: string): string => {
  const envVal = import.meta.env[key];
  if (envVal && typeof envVal === 'string' && envVal.length > 5 && !envVal.includes('your') && !envVal.includes('placeholder')) {
    return envVal;
  }
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved && typeof saved === 'string' && saved.length > 5 && !saved.includes('your') && !saved.includes('placeholder')) {
      return saved;
    }
  } catch (e) { }
  return fallback;
};

export const getSupabaseUrl = (): string => getEnvOrStorage('VITE_SUPABASE_URL', 'calender_supabase_url', HARDCODED_URL);
export const getSupabaseAnonKey = (): string => getEnvOrStorage('VITE_SUPABASE_ANON_KEY', 'calender_supabase_key', HARDCODED_KEY);

export const supabaseUrl = getSupabaseUrl();
export const supabaseAnonKey = getSupabaseAnonKey();

export const isSupabaseConfigured = (): boolean => true;

export const getSupabaseConfigStatus = () => {
  return {
    isConfigured: true,
    message: 'Connected to shared Supabase Cloud database.',
    url: getSupabaseUrl(),
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
