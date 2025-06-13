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
        // Test connection
        const isConnected = await testSupabaseConnection();
        if (!isConnected && mounted) {
          setConnectionError('Kunne ikke koble til databasen. Sjekk nettverksforbindelsen.');
          setLoading(false);
          return;
        }

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setConnectionError('Feil ved henting av sesjon: ' + error.message);
          }
        }
        
        if (mounted) {
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
      const result = await supabase.auth.signInWithPassword({ email, password });
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
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
      const result = await supabase.auth.signOut();
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