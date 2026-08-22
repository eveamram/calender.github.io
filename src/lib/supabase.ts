import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
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
      message: 'VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables are missing or unconfigured.',
    };
  }
  return {
    isConfigured: true,
    message: 'Supabase configured.',
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

