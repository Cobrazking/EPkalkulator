import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

console.log('🔐 AuthProvider module loading...');

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('🏗️ AuthProvider component initializing...');
  
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 AuthProvider useEffect running...');
    
    const initializeAuth = async () => {
      try {
        console.log('📋 Getting initial session...');
        
        // Get initial session with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 10000)
        );
        
        const { data: { session }, error: sessionError } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          setError(`Session error: ${sessionError.message}`);
        } else {
          console.log('📋 Initial session:', session?.user?.email || 'No session');
          setSession(session);
          setUser(session?.user ?? null);
          setError(null);
        }
      } catch (err) {
        console.error('❌ Failed to initialize auth:', err);
        setError(`Failed to initialize: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    console.log('👂 Setting up auth state listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email || 'No user');
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        setError(null);
      }
    );

    return () => {
      console.log('🧹 Cleaning up auth listener...');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Signing in user:', email);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ Sign in error:', error);
        setError(error.message);
      } else {
        console.log('✅ Sign in successful');
      }
      
      return { error };
    } catch (err) {
      console.error('❌ Sign in exception:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log('📝 Signing up user:', email);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ Sign up error:', error);
        setError(error.message);
      } else {
        console.log('✅ Sign up successful');
      }
      
      return { error };
    } catch (err) {
      console.error('❌ Sign up exception:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  const signOut = async () => {
    console.log('🚪 Signing out user');
    setError(null);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Sign out error:', error);
        setError(error.message);
      } else {
        console.log('✅ Sign out successful');
      }
    } catch (err) {
      console.error('❌ Sign out exception:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  };

  console.log('🎯 AuthProvider rendering with state:', {
    user: user?.email || 'No user',
    loading,
    error
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

console.log('✅ AuthProvider module loaded');