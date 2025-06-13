import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallback values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dpqrzlxsfurcjrkuhcjo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcXJ6bHhzZnVyY2pya3VoY2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NDIzODUsImV4cCI6MjA2NTQxODM4NX0.tMeB3LxgTF7RwCmanUzXy9wWJfiVpH2QInlm52_ftgE';

// Validate that we have proper Supabase configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration is missing');
}

// Create Supabase client with better error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'epkalk-web'
    }
  }
});

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('organizations').select('count').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};

// Database types
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          logo: string | null;
          address: string | null;
          phone: string | null;
          email: string | null;
          website: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          logo?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          logo?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          organization_id: string;
          auth_user_id: string | null;
          name: string;
          email: string;
          phone: string | null;
          role: 'admin' | 'manager' | 'user';
          is_active: boolean;
          avatar: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          auth_user_id?: string | null;
          name: string;
          email: string;
          phone?: string | null;
          role?: 'admin' | 'manager' | 'user';
          is_active?: boolean;
          avatar?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          auth_user_id?: string | null;
          name?: string;
          email?: string;
          phone?: string | null;
          role?: 'admin' | 'manager' | 'user';
          is_active?: boolean;
          avatar?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          company: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          company?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          company?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          organization_id: string;
          customer_id: string;
          name: string;
          description: string;
          status: 'planning' | 'active' | 'on-hold' | 'completed';
          start_date: string;
          end_date: string | null;
          budget: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          customer_id: string;
          name: string;
          description?: string;
          status?: 'planning' | 'active' | 'on-hold' | 'completed';
          start_date: string;
          end_date?: string | null;
          budget?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          customer_id?: string;
          name?: string;
          description?: string;
          status?: 'planning' | 'active' | 'on-hold' | 'completed';
          start_date?: string;
          end_date?: string | null;
          budget?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      calculators: {
        Row: {
          id: string;
          organization_id: string;
          project_id: string;
          name: string;
          description: string;
          entries: any;
          summary: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          project_id: string;
          name: string;
          description?: string;
          entries?: any;
          summary?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          project_id?: string;
          name?: string;
          description?: string;
          entries?: any;
          summary?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          company_info: any;
          calculation_settings: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_info?: any;
          calculation_settings?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_info?: any;
          calculation_settings?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}