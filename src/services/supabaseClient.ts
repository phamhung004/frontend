import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

const getSupabaseConfig = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.');
    return null;
  }

  return { supabaseUrl, supabaseAnonKey };
};

export const getSupabaseClient = (): SupabaseClient | null => {
  if (client) {
    return client;
  }

  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
    },
  });

  return client;
};
