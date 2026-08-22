import { createClient } from '@supabase/supabase-js';

// Retrieve Supabase environment configuration
const getEnvOrStorage = (key: string, storageKey: string): string => {
  const envVal = import.meta.env[key];
  if (envVal && typeof envVal === 'string' && envVal.length > 5 && !envVal.includes('your_')) {
    return envVal;
  }
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved && typeof saved === 'string' && saved.length > 5) return saved;
  } catch (e) {}
  return '';
};

export const supabaseUrl = getEnvOrStorage('VITE_SUPABASE_URL', 'calender_supabase_url');
export const supabaseAnonKey = getEnvOrStorage('VITE_SUPABASE_ANON_KEY', 'calender_supabase_key');

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    supabaseUrl.startsWith('http') &&
    supabaseUrl !== 'https://your-supabase-project-url.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key'
  );
};

export const getSupabaseConfigStatus = () => {
  if (!isSupabaseConfigured()) {
    return {
      isConfigured: false,
      message: 'Supabase Cloud database connection missing or unconfigured. Please verify environment credentials.',
      url: supabaseUrl || 'Unset',
    };
  }
  return {
    isConfigured: true,
    message: 'Connected to shared Supabase Cloud database.',
    url: supabaseUrl,
  };
};

export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
