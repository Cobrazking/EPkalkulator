import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Tables = Database['public']['Tables'];

export function useSupabase() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
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
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  };

  const createOrganization = async (organization: Tables['organizations']['Insert']) => {
    const { data, error } = await supabase
      .from('organizations')
      .insert(organization)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const updateOrganization = async (id: string, updates: Tables['organizations']['Update']) => {
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const deleteOrganization = async (id: string) => {
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  };

  // Users
  const getUsers = async (organizationId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  };

  const createUser = async (user: Tables['users']['Insert']) => {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const updateUser = async (id: string, updates: Tables['users']['Update']) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const deleteUser = async (id: string) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  };

  // Customers
  const getCustomers = async (organizationId: string) => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  };

  const createCustomer = async (customer: Tables['customers']['Insert']) => {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const updateCustomer = async (id: string, updates: Tables['customers']['Update']) => {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const deleteCustomer = async (id: string) => {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  };

  // Projects
  const getProjects = async (organizationId: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  };

  const createProject = async (project: Tables['projects']['Insert']) => {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const updateProject = async (id: string, updates: Tables['projects']['Update']) => {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  };

  // Calculators
  const getCalculators = async (organizationId: string) => {
    const { data, error } = await supabase
      .from('calculators')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  };

  const createCalculator = async (calculator: Tables['calculators']['Insert']) => {
    const { data, error } = await supabase
      .from('calculators')
      .insert(calculator)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const updateCalculator = async (id: string, updates: Tables['calculators']['Update']) => {
    const { data, error } = await supabase
      .from('calculators')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const deleteCalculator = async (id: string) => {
    const { error } = await supabase
      .from('calculators')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  };

  // User Settings
  const getUserSettings = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  };

  const upsertUserSettings = async (userId: string, settings: Partial<Tables['user_settings']['Insert']>) => {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({ user_id: userId, ...settings })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  // Auth methods
  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password });
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    return await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email);
  };

  return {
    user,
    loading,
    // Organizations
    getOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    // Users
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    // Customers
    getCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    // Projects
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    // Calculators
    getCalculators,
    createCalculator,
    updateCalculator,
    deleteCalculator,
    // User Settings
    getUserSettings,
    upsertUserSettings,
    // Auth
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
  };
}