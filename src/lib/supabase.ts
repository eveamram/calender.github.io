import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const getSupabaseUrl = (): string => 'https://rfvhqhlfrpaswgexrjqz.supabase.co';
export const getSupabaseAnonKey = (): string => 'sb_publishable_gDiT6Wk52sGIpO0i2twPJA_JRIyRm_B';

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
