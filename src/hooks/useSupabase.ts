import { useEffect, useState } from 'react';
import { supabase, testSupabaseConnection } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Tables = Database['public']['Tables'];

export function useSupabase() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Test Supabase connection first
    const initializeAuth = async () => {
      try {
        console.log('Initializing Supabase auth...');
        
        // Test connection with timeout
        const connectionPromise = testSupabaseConnection();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 10000)
        );
        
        const isConnected = await Promise.race([connectionPromise, timeoutPromise]);
        
        if (!isConnected && mounted) {
          console.error('Supabase connection failed');
          setConnectionError('Kunne ikke koble til databasen. Sjekk nettverksforbindelsen.');
          setLoading(false);
          return;
        }

        console.log('Supabase connection successful, getting session...');

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setConnectionError('Feil ved henting av sesjon: ' + error.message);
          }
        }
        
        if (mounted) {
          console.log('Session retrieved:', session?.user?.id || 'No user');
          setUser(session?.user ?? null);
          setLoading(false);
          setConnectionError(null);
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        if (mounted) {
          setConnectionError('Uventet feil ved initialisering av autentisering');
          setUser(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
          setConnectionError(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Organizations
  const getOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }
  };

  const createOrganization = async (organization: Tables['organizations']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert(organization)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  };

  const updateOrganization = async (id: string, updates: Tables['organizations']['Update']) => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error;
    }
  };

  const deleteOrganization = async (id: string) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting organization:', error);
      throw error;
    }
  };

  // Auth methods with better error handling
  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      const result = await supabase.auth.signInWithPassword({ email, password });
      console.log('Sign in result:', result.error ? 'Error' : 'Success');
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Attempting sign up for:', email);
      const result = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      console.log('Sign up result:', result.error ? 'Error' : 'Success');
      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      const result = await supabase.auth.signOut();
      console.log('Sign out result:', result.error ? 'Error' : 'Success');
      return result;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const result = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return result;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    connectionError,
    // Organizations
    getOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    // Auth
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
  };
}