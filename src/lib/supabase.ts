import { createClient } from '@supabase/supabase-js';

console.log('🔧 Initializing Supabase client...');

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dpqrzlxsfurcjrkuhcjo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcXJ6bHhzZnVyY2pya3VoY2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NDIzODUsImV4cCI6MjA2NTQxODM4NX0.tMeB3LxgTF7RwCmanUzXy9wWJfiVpH2QInlm52_ftgE';

console.log('🌐 Supabase URL:', supabaseUrl);
console.log('🔑 Anon key available:', !!supabaseAnonKey);
console.log('🔑 Anon key length:', supabaseAnonKey?.length);

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not set');
  console.error('📋 Available env vars:', Object.keys(import.meta.env));
  throw new Error('Supabase anon key is required');
}

try {
  export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });

  console.log('✅ Supabase client created successfully');

  // Test connection immediately
  supabase.auth.getSession()
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Supabase connection error:', error);
      } else {
        console.log('✅ Supabase connected successfully');
        console.log('👤 Current session:', data.session?.user?.email || 'No user logged in');
      }
    })
    .catch(err => {
      console.error('❌ Failed to get session:', err);
    });

} catch (error) {
  console.error('❌ Failed to create Supabase client:', error);
  throw error;
}