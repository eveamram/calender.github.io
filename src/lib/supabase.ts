import { createClient } from '@supabase/supabase-js';

// Read from Environment Variables or LocalStorage Override
const getEnvOrStorage = (key: string, storageKey: string): string => {
  const envVal = import.meta.env[key];
  if (envVal && typeof envVal === 'string' && envVal.length > 5 && !envVal.includes('your_')) {
    return envVal;
  }
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) return saved;
  } catch (e) {}
  return '';
};

export let supabaseUrl = getEnvOrStorage('VITE_SUPABASE_URL', 'calender_supabase_url');
export let supabaseAnonKey = getEnvOrStorage('VITE_SUPABASE_ANON_KEY', 'calender_supabase_key');

export const setSupabaseCredentials = (url: string, key: string) => {
  supabaseUrl = url;
  supabaseAnonKey = key;
  try {
    localStorage.setItem('calender_supabase_url', url);
    localStorage.setItem('calender_supabase_key', key);
  } catch (e) {}
};

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
      message: 'Supabase credentials missing. Data is currently saved to local storage.',
    };
  }
  return {
    isConfigured: true,
    message: 'Connected to Supabase Cloud Database.',
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
