import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dpqrzlxsfurcjrkuhcjo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not set in environment variables');
  throw new Error('Supabase anon key is required');
}

// Custom fetch function to handle refresh token errors
const customFetch = async (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  const response = await fetch(url, options);
  
  // Check if this is a Supabase auth token refresh request that failed
  if (
    response.status === 400 &&
    typeof url === 'string' &&
    url.includes('/auth/v1/token') &&
    url.includes('grant_type=refresh_token')
  ) {
    try {
      const body = await response.clone().text();
      const errorData = JSON.parse(body);
      
      if (errorData.code === 'refresh_token_not_found') {
        console.warn('🔄 Invalid refresh token detected, clearing localStorage and reloading...');
        localStorage.clear();
        window.location.reload();
        return response;
      }
    } catch (e) {
      // If we can't parse the response, just return the original response
    }
  }
  
  return response;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: customFetch,
  },
});

// Test connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase connection error:', error);
  } else {
    console.log('✅ Supabase connected successfully');
    console.log('👤 Current session:', data.session?.user?.email || 'No user logged in');
  }
});