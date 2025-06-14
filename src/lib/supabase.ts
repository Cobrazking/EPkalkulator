import { createClient } from '@supabase/supabase-js';

console.log('🔧 Initializing Supabase client...');

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🌐 Supabase URL:', supabaseUrl);
console.log('🔑 Anon key available:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('📋 Available env vars:', Object.keys(import.meta.env));
  throw new Error('Supabase URL and anon key are required');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

console.log('✅ Supabase client created successfully');