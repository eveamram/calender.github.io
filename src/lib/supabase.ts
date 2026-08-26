import { createClient, SupabaseClient } from '@supabase/supabase-js';

const FALLBACK_SUPABASE_URL = 'https://rfvhqhlfrpaswgexrjqz.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'sb_publishable_gDiT6Wk52sGIpO0i2twPJA_JRIyRm_B';

const readEnv = (value: unknown): string => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }
  return '';
};

export const getSupabaseUrl = (): string => {
  return readEnv(import.meta.env.VITE_SUPABASE_URL) || FALLBACK_SUPABASE_URL;
};

export const getSupabaseAnonKey = (): string => {
  return readEnv(import.meta.env.VITE_SUPABASE_ANON_KEY) || FALLBACK_SUPABASE_ANON_KEY;
};

export const supabaseUrl = getSupabaseUrl();
export const supabaseAnonKey = getSupabaseAnonKey();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
};

export const getSupabaseConfigStatus = () => {
  const configured = isSupabaseConfigured();
  return {
    isConfigured: configured,
    message: configured
      ? 'Connected to shared Supabase Cloud database.'
      : 'Supabase is not configured.',
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
