import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dpqrzlxsfurcjrkuhcjo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not set in environment variables');
  throw new Error('Supabase anon key is required');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase connection error:', error);
  } else {
    console.log('✅ Supabase connected successfully');
    console.log('👤 Current session:', data.session?.user?.email || 'No user logged in');
  }
});