import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://rfvhqhlfrpaswgexrjqz.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_gDiT6Wk52sGIpO0i2twPJA_JRIyRm_B';

export const getSupabaseUrl = (): string =>
  import.meta.env.VITE_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL;
export const getSupabaseAnonKey = (): string =>
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || DEFAULT_SUPABASE_ANON_KEY;

export const supabaseUrl = getSupabaseUrl();
export const supabaseAnonKey = getSupabaseAnonKey();

export const isSupabaseConfigured = (): boolean => {
  try {
    return Boolean(new URL(getSupabaseUrl()).protocol === 'https:' && getSupabaseAnonKey());
  } catch {
    return false;
  }
};

export const getSupabaseConfigStatus = () => {
  const isConfigured = isSupabaseConfigured();
  return {
    isConfigured,
    message: isConfigured
      ? 'Connected to shared Supabase Cloud database.'
      : 'Supabase configuration is missing or invalid.',
    url: getSupabaseUrl(),
  };
};

let currentClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (currentClient) {
    return currentClient;
  }

  currentClient = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return currentClient;
};

// Proxied export ensuring calls to supabase methods always use the initialized client
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const instance = getSupabaseClient();
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
