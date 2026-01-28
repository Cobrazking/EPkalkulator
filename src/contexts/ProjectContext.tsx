import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/auth/AuthProvider';

console.log('🗂️ ProjectContext loading...');

export interface Organization {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  customerId: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  startDate: string;
  endDate?: string;
  budget?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Calculator {
  id: string;
  organizationId: string;
  projectId: string;
  name: string;
  description?: string;
  entries: any[];
  summary: any;
  settings?: {
    companyInfo?: any;
    customerInfo?: any;
    calculationSettings?: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationUser {
  id: string;
  organizationId: string;
  authUserId?: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'user';
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invitation {
  id: string;
  organizationId: string;
  organizationName: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  invitedByName: string;
  expiresAt: string;
  createdAt: string;
}

interface ProjectState {
  organizations: Organization[];
  customers: Customer[];
  projects: Project[];
  calculators: Calculator[];
  users: OrganizationUser[];
  invitations: Invitation[];
  currentOrganizationId: string | null;
  loading: boolean;
  error: string | null;
}

type ProjectAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ORGANIZATIONS'; payload: Organization[] }
  | { type: 'ADD_ORGANIZATION'; payload: Organization }
  | { type: 'UPDATE_ORGANIZATION'; payload: Organization }
  | { type: 'DELETE_ORGANIZATION'; payload: string }
  | { type: 'SET_CURRENT_ORGANIZATION'; payload: string }
  | { type: 'SET_CUSTOMERS'; payload: Customer[] }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_CALCULATORS'; payload: Calculator[] }
  | { type: 'ADD_CALCULATOR'; payload: Calculator }
  | { type: 'UPDATE_CALCULATOR'; payload: Calculator }
  | { type: 'DELETE_CALCULATOR'; payload: string }
  | { type: 'SET_USERS'; payload: OrganizationUser[] }
  | { type: 'ADD_USER'; payload: OrganizationUser }
  | { type: 'UPDATE_USER'; payload: OrganizationUser }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'SET_INVITATIONS'; payload: Invitation[] }
  | { type: 'ADD_INVITATION'; payload: Invitation }
  | { type: 'UPDATE_INVITATION'; payload: Invitation }
  | { type: 'DELETE_INVITATION'; payload: string }
  | { type: 'RESET_STATE' };

const initialState: ProjectState = {
  organizations: [],
  customers: [],
  projects: [],
  calculators: [],
  users: [],
  invitations: [],
  currentOrganizationId: null,
  loading: false,
  error: null
};

// Helper function to convert snake_case to camelCase
const toCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
};

// Helper function to convert camelCase to snake_case
const toSnakeCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = toSnakeCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
};

const projectReducer = (state: ProjectState, action: ProjectAction): ProjectState => {
  console.log('🔄 ProjectReducer action:', action.type);
  
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_ORGANIZATIONS':
      return { 
        ...state, 
        organizations: action.payload,
        currentOrganizationId: state.currentOrganizationId || action.payload[0]?.id || null
      };
    
    case 'ADD_ORGANIZATION':
      return { 
        ...state, 
        organizations: [...state.organizations, action.payload],
        currentOrganizationId: state.currentOrganizationId || action.payload.id
      };
    
    case 'UPDATE_ORGANIZATION':
      return {
        ...state,
        organizations: state.organizations.map(org =>
          org.id === action.payload.id ? action.payload : org
        )
      };
    
    case 'DELETE_ORGANIZATION':
      const newCurrentOrgId = state.currentOrganizationId === action.payload 
        ? state.organizations.find(org => org.id !== action.payload)?.id || null
        : state.currentOrganizationId;
      
      return {
        ...state,
        organizations: state.organizations.filter(org => org.id !== action.payload),
        customers: state.customers.filter(customer => customer.organizationId !== action.payload),
        projects: state.projects.filter(project => project.organizationId !== action.payload),
        calculators: state.calculators.filter(calculator => calculator.organizationId !== action.payload),
        users: state.users.filter(user => user.organizationId !== action.payload),
        invitations: state.invitations.filter(invitation => invitation.organizationId !== action.payload),
        currentOrganizationId: newCurrentOrgId
      };
    
    case 'SET_CURRENT_ORGANIZATION':
      return { ...state, currentOrganizationId: action.payload };
    
    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload };
    
    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] };
    
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map(customer =>
          customer.id === action.payload.id ? action.payload : customer
        )
      };
    
    case 'DELETE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.filter(customer => customer.id !== action.payload),
        projects: state.projects.filter(project => project.customerId !== action.payload)
      };
    
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    
    case 'UPDATE_PROJECT':
      console.log('🔄 Reducer UPDATE_PROJECT:', {
        payloadId: action.payload.id,
        payloadCreatedBy: action.payload.createdBy,
        payload: action.payload
      });
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id ? action.payload : project
        )
      };
    
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload),
        calculators: state.calculators.filter(calculator => calculator.projectId !== action.payload)
      };
    
    case 'SET_CALCULATORS':
      return { ...state, calculators: action.payload };
    
    case 'ADD_CALCULATOR':
      return { ...state, calculators: [...state.calculators, action.payload] };
    
    case 'UPDATE_CALCULATOR':
      return {
        ...state,
        calculators: state.calculators.map(calculator =>
          calculator.id === action.payload.id ? action.payload : calculator
        )
      };
    
    case 'DELETE_CALCULATOR':
      return {
        ...state,
        calculators: state.calculators.filter(calculator => calculator.id !== action.payload)
      };
    
    case 'SET_USERS':
      return { ...state, users: action.payload };
    
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        )
      };
    
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      };
    
    case 'SET_INVITATIONS':
      return { ...state, invitations: action.payload };
    
    case 'ADD_INVITATION':
      return { ...state, invitations: [...state.invitations, action.payload] };
    
    case 'UPDATE_INVITATION':
      return {
        ...state,
        invitations: state.invitations.map(invitation =>
          invitation.id === action.payload.id ? action.payload : invitation
        )
      };
    
    case 'DELETE_INVITATION':
      return {
        ...state,
        invitations: state.invitations.filter(invitation => invitation.id !== action.payload)
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
};

interface ProjectContextType {
  state: ProjectState;
  currentOrganization: Organization | null;
  addOrganization: (organization: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateOrganization: (organization: Organization) => Promise<void>;
  deleteOrganization: (id: string) => Promise<void>;
  leaveOrganization: (organizationId: string) => Promise<void>;
  canLeaveOrganization: (organizationId: string) => Promise<boolean>;
  setCurrentOrganization: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  duplicateProject: (projectId: string) => Promise<string>;
  addCalculator: (calculator: Omit<Calculator, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCalculator: (calculator: Calculator) => Promise<void>;
  deleteCalculator: (id: string) => Promise<void>;
  duplicateCalculator: (calculatorId: string, targetProjectId?: string) => Promise<string>;
  moveCalculator: (calculatorId: string, newProjectId: string) => Promise<void>;
  addUser: (user: Omit<OrganizationUser, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateUser: (user: OrganizationUser) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  inviteUser: (invitation: { organizationId: string; email: string; name: string; role: 'admin' | 'manager' | 'user' }) => Promise<void>;
  sendInvitation: (invitation: { organizationId: string; email: string; name: string; role: 'admin' | 'manager' | 'user' }) => Promise<void>;
  getPendingInvitations: () => Promise<Invitation[]>;
  acceptInvitation: (invitationId: string) => Promise<void>;
  declineInvitation: (invitationId: string) => Promise<void>;
  getInvitations: (organizationId: string) => Promise<Invitation[]>;
  cancelInvitation: (invitationId: string) => Promise<void>;
  resendInvitation: (invitationId: string) => Promise<void>;
  getOrganizationById: (id: string) => Organization | undefined;
  getCustomerById: (id: string) => Customer | undefined;
  getProjectById: (id: string) => Project | undefined;
  getCalculatorById: (id: string) => Calculator | undefined;
  getUserById: (id: string) => OrganizationUser | undefined;
  getCurrentOrganizationCustomers: () => Customer[];
  getCurrentOrganizationProjects: () => Project[];
  getCurrentOrganizationCalculators: () => Calculator[];
  getCurrentOrganizationUsers: () => OrganizationUser[];
  getProjectsByCustomer: (customerId: string) => Project[];
  getCalculatorsByProject: (projectId: string) => Calculator[];
  refreshData: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('🏗️ ProjectProvider initializing...');
  const [state, dispatch] = useReducer(projectReducer, initialState);
  const { user } = useAuth();

  console.log('📊 ProjectProvider state:', state);

  // Load data from Supabase when user changes
  useEffect(() => {
    if (user) {
      console.log('👤 User logged in, loading data from Supabase...');
      loadDataFromSupabase();
    } else {
      console.log('👤 User logged out, resetting state...');
      dispatch({ type: 'RESET_STATE' });
    }
  }, [user]);

  // Load current organization from localStorage
  useEffect(() => {
    if (user && state.organizations.length > 0) {
      const savedOrgId = localStorage.getItem(`currentOrganizationId_${user.id}`);
      if (savedOrgId && state.organizations.find(org => org.id === savedOrgId)) {
        dispatch({ type: 'SET_CURRENT_ORGANIZATION', payload: savedOrgId });
      } else if (!state.currentOrganizationId) {
        dispatch({ type: 'SET_CURRENT_ORGANIZATION', payload: state.organizations[0].id });
      }
    }
  }, [user, state.organizations]);

  // Save current organization to localStorage
  useEffect(() => {
    if (user && state.currentOrganizationId) {
      localStorage.setItem(`currentOrganizationId_${user.id}`, state.currentOrganizationId);
    }
  }, [user, state.currentOrganizationId]);

  const loadDataFromSupabase = async () => {
    if (!user) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      console.log('📥 Loading organizations from Supabase...');
      
      // Load organizations where user has access
      const { data: organizations, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (orgError) {
        console.error('❌ Error loading organizations:', orgError);
        throw orgError;
      }

      console.log('✅ Organizations loaded:', organizations?.length || 0);
      const camelCaseOrganizations = toCamelCase(organizations || []);
      dispatch({ type: 'SET_ORGANIZATIONS', payload: camelCaseOrganizations });

      if (organizations && organizations.length > 0) {
        // Load customers
        const { data: customers, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .in('organization_id', organizations.map(org => org.id))
          .order('created_at', { ascending: false });

        if (customerError) {
          console.error('❌ Error loading customers:', customerError);
          throw customerError;
        }

        console.log('✅ Customers loaded:', customers?.length || 0);
        const camelCaseCustomers = toCamelCase(customers || []);
        dispatch({ type: 'SET_CUSTOMERS', payload: camelCaseCustomers });

        // Load projects
        const { data: projects, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .in('organization_id', organizations.map(org => org.id))
          .order('created_at', { ascending: false });

        if (projectError) {
          console.error('❌ Error loading projects:', projectError);
          throw projectError;
        }

        console.log('✅ Projects loaded:', projects?.length || 0);
        const camelCaseProjects = toCamelCase(projects || []);
        dispatch({ type: 'SET_PROJECTS', payload: camelCaseProjects });

        // Load calculators (explicitly select columns to avoid errors with missing optional columns)
        let { data: calculators, error: calculatorError } = await supabase
          .from('calculators')
          .select('*')
          .in('organization_id', organizations.map(org => org.id))
          .order('created_at', { ascending: false });

        // If error about missing columns, retry without optional columns
        if (calculatorError && (calculatorError.code === 'PGRST204' || calculatorError.message?.includes('column'))) {
          console.log('⚠️ Optional columns not found, retrying with basic columns only');
          const retry = await supabase
            .from('calculators')
            .select('id, organization_id, project_id, name, description, entries, summary, created_at, updated_at')
            .in('organization_id', organizations.map(org => org.id))
            .order('created_at', { ascending: false });
          calculators = retry.data;
          calculatorError = retry.error;
        }

        if (calculatorError) {
          console.error('❌ Error loading calculators:', calculatorError);
          throw calculatorError;
        }

        console.log('✅ Calculators loaded:', calculators?.length || 0);
        const camelCaseCalculators = toCamelCase(calculators || []);
        dispatch({ type: 'SET_CALCULATORS', payload: camelCaseCalculators });

        // Load users
        const { data: users, error: userError } = await supabase
          .from('users')
          .select('*')
          .in('organization_id', organizations.map(org => org.id))
          .order('created_at', { ascending: false });

        if (userError) {
          console.error('❌ Error loading users:', userError);
          throw userError;
        }

        console.log('✅ Users loaded:', users?.length || 0);
        const camelCaseUsers = toCamelCase(users || []);
        dispatch({ type: 'SET_USERS', payload: camelCaseUsers });
      }

      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('❌ Failed to load data from Supabase:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load data. Please try again.' });
    }
  };

  const refreshData = async () => {
    await loadDataFromSupabase();
  };

  const currentOrganization = state.currentOrganizationId 
    ? state.organizations.find(org => org.id === state.currentOrganizationId) || null
    : null;

  console.log('🏢 Current organization:', currentOrganization);

  const addOrganization = async (organizationData: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('User must be logged in');

    try {
      console.log('🏗️ Creating organization:', organizationData);
      
      // Use a transaction-like approach with the service role to bypass RLS temporarily
      // First, create the organization using the service role client
      const { data: newOrg, error: orgError } = await supabase.rpc('create_organization_with_user', {
        org_name: organizationData.name,
        user_name: user.email?.split('@')[0] || 'User',
        user_email: user.email || '',
        org_description: organizationData.description || null,
        org_logo: organizationData.logo || null,
        org_address: organizationData.address || null,
        org_phone: organizationData.phone || null,
        org_email: organizationData.email || null,
        org_website: organizationData.website || null
      });

      if (orgError) {
        console.error('❌ Error creating organization:', orgError);
        
        // Fallback: Try the original approach if the RPC function doesn't exist
        if (orgError.code === '42883' || orgError.code === 'PGRST202') { // function does not exist
          console.log('🔄 RPC function not found, trying direct insert...');
          
          const { data: directOrg, error: directError } = await supabase
            .from('organizations')
            .insert([{
              name: organizationData.name,
              description: organizationData.description,
              logo: organizationData.logo,
              address: organizationData.address,
              phone: organizationData.phone,
              email: organizationData.email,
              website: organizationData.website
            }])
            .select()
            .single();

          if (directError) {
            console.error('❌ Direct insert also failed:', directError);
            throw new Error(`Failed to create organization: ${directError.message}`);
          }

          // Create user record
          const { error: userError } = await supabase
            .from('users')
            .insert([{
              organization_id: directOrg.id,
              auth_user_id: user.id,
              name: user.email?.split('@')[0] || 'User',
              email: user.email || '',
              role: 'admin'
            }]);

          if (userError) {
            console.error('❌ Error creating user record:', userError);
            console.warn('⚠️ Organization created but user record creation failed. This might affect permissions.');
          }

          console.log('✅ Organization created via direct insert:', directOrg);
          const camelCaseOrg = toCamelCase(directOrg);
          dispatch({ type: 'ADD_ORGANIZATION', payload: camelCaseOrg });
          
          if (state.organizations.length === 0) {
            dispatch({ type: 'SET_CURRENT_ORGANIZATION', payload: camelCaseOrg.id });
          }
          
          return;
        }
        
        throw new Error(`Failed to create organization: ${orgError.message}`);
      }

      console.log('✅ Organization created via RPC:', newOrg);
      
      // The RPC should return the organization data
      if (newOrg && typeof newOrg === 'object' && 'id' in newOrg) {
        const camelCaseOrg = toCamelCase(newOrg);
        dispatch({ type: 'ADD_ORGANIZATION', payload: camelCaseOrg });
        
        if (state.organizations.length === 0) {
          dispatch({ type: 'SET_CURRENT_ORGANIZATION', payload: camelCaseOrg.id });
        }
      } else {
        // If RPC doesn't return the org data, refresh the data
        await refreshData();
      }

    } catch (error) {
      console.error('❌ Failed to add organization:', error);
      throw error;
    }
  };

  const updateOrganization = async (organization: Organization) => {
    try {
      const snakeCaseData = toSnakeCase({
        name: organization.name,
        description: organization.description,
        logo: organization.logo,
        address: organization.address,
        phone: organization.phone,
        email: organization.email,
        website: organization.website,
        updatedAt: new Date().toISOString()
      });

      const { data, error } = await supabase
        .from('organizations')
        .update(snakeCaseData)
        .eq('id', organization.id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Organization updated:', data);
      const camelCaseOrg = toCamelCase(data);
      dispatch({ type: 'UPDATE_ORGANIZATION', payload: camelCaseOrg });
    } catch (error) {
      console.error('❌ Failed to update organization:', error);
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

      console.log('✅ Organization deleted:', id);
      dispatch({ type: 'DELETE_ORGANIZATION', payload: id });
    } catch (error) {
      console.error('❌ Failed to delete organization:', error);
      throw error;
    }
  };

  const canLeaveOrganization = async (organizationId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('can_user_leave_organization', {
        p_auth_user_id: user.id,
        p_organization_id: organizationId
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('❌ Failed to check if user can leave organization:', error);
      return false;
    }
  };

  const leaveOrganization = async (organizationId: string) => {
    if (!user) throw new Error('User must be logged in');

    try {
      console.log('🚪 Leaving organization:', organizationId);

      const { data, error } = await supabase.rpc('leave_organization', {
        p_auth_user_id: user.id,
        p_organization_id: organizationId
      });

      if (error) throw error;

      console.log('✅ Successfully left organization:', organizationId);
      
      // Remove organization from local state
      dispatch({ type: 'DELETE_ORGANIZATION', payload: organizationId });
      
      // Refresh data to get updated state
      await refreshData();
    } catch (error) {
      console.error('❌ Failed to leave organization:', error);
      throw error;
    }
  };

  const setCurrentOrganization = (id: string) => {
    dispatch({ type: 'SET_CURRENT_ORGANIZATION', payload: id });
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!customerData.organizationId) {
      throw new Error('organizationId is required when adding a customer');
    }
    
    try {
      console.log('👤 Adding customer:', customerData);
      
      const snakeCaseData = {
        organization_id: customerData.organizationId,
        name: customerData.name,
        email: customerData.email || '',
        phone: customerData.phone || '',
        address: customerData.address || '',
        company: customerData.company || null
      };

      console.log('📤 Sending to Supabase:', snakeCaseData);

      const { data, error } = await supabase
        .from('customers')
        .insert([snakeCaseData])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('✅ Customer added:', data);
      const camelCaseCustomer = toCamelCase(data);
      dispatch({ type: 'ADD_CUSTOMER', payload: camelCaseCustomer });
    } catch (error) {
      console.error('❌ Failed to add customer:', error);
      throw error;
    }
  };

  const updateCustomer = async (customer: Customer) => {
    try {
      const snakeCaseData = {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        company: customer.company,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('customers')
        .update(snakeCaseData)
        .eq('id', customer.id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Customer updated:', data);
      const camelCaseCustomer = toCamelCase(data);
      dispatch({ type: 'UPDATE_CUSTOMER', payload: camelCaseCustomer });
    } catch (error) {
      console.error('❌ Failed to update customer:', error);
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Customer deleted:', id);
      dispatch({ type: 'DELETE_CUSTOMER', payload: id });
    } catch (error) {
      console.error('❌ Failed to delete customer:', error);
      throw error;
    }
  };

  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!projectData.organizationId) {
      throw new Error('organizationId is required when adding a project');
    }

    try {
      const currentUserId = getCurrentUserId();
      const snakeCaseData: any = {
        organization_id: projectData.organizationId,
        customer_id: projectData.customerId,
        name: projectData.name,
        description: projectData.description,
        status: projectData.status,
        start_date: projectData.startDate,
        end_date: projectData.endDate,
        budget: projectData.budget
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([snakeCaseData])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Project added:', data);
      const camelCaseProject = toCamelCase(data);
      dispatch({ type: 'ADD_PROJECT', payload: camelCaseProject });
    } catch (error) {
      console.error('❌ Failed to add project:', error);
      throw error;
    }
  };

  const updateProject = async (project: Project) => {
    try {
      const snakeCaseData: any = {
        name: project.name,
        description: project.description,
        customer_id: project.customerId,
        status: project.status,
        start_date: project.startDate,
        end_date: project.endDate,
        budget: project.budget,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('projects')
        .update(snakeCaseData)
        .eq('id', project.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Update error:', error);
        throw error;
      }

      console.log('✅ Project updated successfully');
      const camelCaseProject = toCamelCase(data);
      dispatch({ type: 'UPDATE_PROJECT', payload: camelCaseProject });
    } catch (error) {
      console.error('❌ Failed to update project:', error);
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Project deleted:', id);
      dispatch({ type: 'DELETE_PROJECT', payload: id });
    } catch (error) {
      console.error('❌ Failed to delete project:', error);
      throw error;
    }
  };

  const duplicateProject = async (projectId: string): Promise<string> => {
    const originalProject = state.projects.find(p => p.id === projectId);
    if (!originalProject) {
      throw new Error('Project not found');
    }

    const originalCalculators = state.calculators.filter(c => c.projectId === projectId);

    try {
      // Create new project
      const newProjectData: any = {
        organization_id: originalProject.organizationId,
        customer_id: originalProject.customerId,
        name: `${originalProject.name} (Kopi)`,
        description: originalProject.description,
        status: 'planning' as const,
        start_date: new Date().toISOString().split('T')[0],
        end_date: null,
        budget: originalProject.budget
      };

      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert([newProjectData])
        .select()
        .single();

      if (projectError) throw projectError;

      console.log('✅ Project duplicated:', newProject);
      const camelCaseProject = toCamelCase(newProject);
      dispatch({ type: 'ADD_PROJECT', payload: camelCaseProject });

      // Duplicate calculators
      if (originalCalculators.length > 0) {
        const newCalculators = originalCalculators.map(calc => ({
          organization_id: calc.organizationId,
          project_id: newProject.id,
          name: `${calc.name} (Kopi)`,
          description: calc.description,
          entries: calc.entries,
          summary: calc.summary
        }));

        const { data: duplicatedCalculators, error: calculatorError } = await supabase
          .from('calculators')
          .insert(newCalculators)
          .select();

        if (calculatorError) throw calculatorError;

        console.log('✅ Calculators duplicated:', duplicatedCalculators?.length || 0);
        duplicatedCalculators?.forEach(calc => {
          const camelCaseCalc = toCamelCase(calc);
          dispatch({ type: 'ADD_CALCULATOR', payload: camelCaseCalc });
        });
      }

      return newProject.id;
    } catch (error) {
      console.error('❌ Failed to duplicate project:', error);
      throw error;
    }
  };

  const addCalculator = async (calculatorData: Omit<Calculator, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!calculatorData.organizationId) {
      throw new Error('organizationId is required when adding a calculator');
    }

    try {
      const snakeCaseData: any = {
        organization_id: calculatorData.organizationId,
        project_id: calculatorData.projectId,
        name: calculatorData.name,
        description: calculatorData.description,
        entries: calculatorData.entries,
        summary: calculatorData.summary
      };

      // Add optional fields if they exist
      if (calculatorData.settings) {
        snakeCaseData.settings = calculatorData.settings;
      }

      const { data, error } = await supabase
        .from('calculators')
        .insert([snakeCaseData])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error details:', error);
        throw error;
      }

      console.log('✅ Calculator added:', data);
      const camelCaseCalculator = toCamelCase(data);
      dispatch({ type: 'ADD_CALCULATOR', payload: camelCaseCalculator });
      return data.id;
    } catch (error) {
      console.error('❌ Failed to add calculator:', error);
      throw error;
    }
  };

  const updateCalculator = async (calculator: Calculator) => {
    try {
      // First, try to update with settings
      let snakeCaseData: any = {
        name: calculator.name,
        description: calculator.description,
        entries: calculator.entries,
        summary: calculator.summary,
        updated_at: new Date().toISOString()
      };

      // Try to include settings if the column exists
      if (calculator.settings) {
        snakeCaseData.settings = calculator.settings;
      }

      let { data, error } = await supabase
        .from('calculators')
        .update(snakeCaseData)
        .eq('id', calculator.id)
        .select()
        .single();

      // If error is about missing column, try without settings
      if (error && error.message?.includes('column') && error.message?.includes('settings')) {
        console.log('⚠️ settings column does not exist in database, using localStorage fallback');
        delete snakeCaseData.settings;
        const retry = await supabase
          .from('calculators')
          .update(snakeCaseData)
          .eq('id', calculator.id)
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (error) throw error;

      // Preserve settings in memory even if not in DB
      const camelCaseCalculator = toCamelCase(data);
      if (calculator.settings && !camelCaseCalculator.settings) {
        camelCaseCalculator.settings = calculator.settings;
      }

      dispatch({ type: 'UPDATE_CALCULATOR', payload: camelCaseCalculator });
    } catch (error) {
      console.error('❌ Failed to update calculator:', error);
      throw error;
    }
  };

  const deleteCalculator = async (id: string) => {
    try {
      const { error } = await supabase
        .from('calculators')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Calculator deleted:', id);
      dispatch({ type: 'DELETE_CALCULATOR', payload: id });
    } catch (error) {
      console.error('❌ Failed to delete calculator:', error);
      throw error;
    }
  };

  const duplicateCalculator = async (calculatorId: string, targetProjectId?: string): Promise<string> => {
    const originalCalculator = state.calculators.find(c => c.id === calculatorId);
    if (!originalCalculator) {
      throw new Error('Calculator not found');
    }

    try {
      const newCalculatorData = {
        organization_id: originalCalculator.organizationId,
        project_id: targetProjectId || originalCalculator.projectId,
        name: `${originalCalculator.name} (Kopi)`,
        description: originalCalculator.description,
        entries: originalCalculator.entries,
        summary: originalCalculator.summary
      };

      const { data, error } = await supabase
        .from('calculators')
        .insert([newCalculatorData])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Calculator duplicated:', data);
      const camelCaseCalculator = toCamelCase(data);
      dispatch({ type: 'ADD_CALCULATOR', payload: camelCaseCalculator });
      return data.id;
    } catch (error) {
      console.error('❌ Failed to duplicate calculator:', error);
      throw error;
    }
  };

  const moveCalculator = async (calculatorId: string, newProjectId: string) => {
    try {
      const { data, error } = await supabase
        .from('calculators')
        .update({
          project_id: newProjectId,
          updated_at: new Date().toISOString()
        })
        .eq('id', calculatorId)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Calculator moved:', data);
      const camelCaseCalculator = toCamelCase(data);
      dispatch({ type: 'UPDATE_CALCULATOR', payload: camelCaseCalculator });
    } catch (error) {
      console.error('❌ Failed to move calculator:', error);
      throw error;
    }
  };

  const addUser = async (userData: Omit<OrganizationUser, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!userData.organizationId) {
      throw new Error('organizationId is required when adding a user');
    }
    
    try {
      console.log('👤 Adding user:', userData);
      
      const snakeCaseData = {
        organization_id: userData.organizationId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || null,
        role: userData.role,
        is_active: userData.isActive,
        avatar: userData.avatar || null
      };

      const { data, error } = await supabase
        .from('users')
        .insert([snakeCaseData])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('✅ User added:', data);
      const camelCaseUser = toCamelCase(data);
      dispatch({ type: 'ADD_USER', payload: camelCaseUser });
    } catch (error) {
      console.error('❌ Failed to add user:', error);
      throw error;
    }
  };

  const updateUser = async (user: OrganizationUser) => {
    try {
      const snakeCaseData = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_active: user.isActive,
        avatar: user.avatar,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('users')
        .update(snakeCaseData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ User updated:', data);
      const camelCaseUser = toCamelCase(data);
      dispatch({ type: 'UPDATE_USER', payload: camelCaseUser });
    } catch (error) {
      console.error('❌ Failed to update user:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ User deleted:', id);
      dispatch({ type: 'DELETE_USER', payload: id });
    } catch (error) {
      console.error('❌ Failed to delete user:', error);
      throw error;
    }
  };

  const inviteUser = async (invitation: { organizationId: string; email: string; name: string; role: 'admin' | 'manager' | 'user' }) => {
    try {
      console.log('📧 Inviting user:', invitation);
      
      // For now, we'll create a user record without auth_user_id
      // In a real implementation, you would send an email invitation
      const userData = {
        organizationId: invitation.organizationId,
        name: invitation.name,
        email: invitation.email,
        role: invitation.role,
        isActive: true
      };

      await addUser(userData);
      
      // TODO: Implement actual email invitation system
      console.log('✅ User invitation created (email sending not implemented)');
    } catch (error) {
      console.error('❌ Failed to invite user:', error);
      throw error;
    }
  };

  const sendInvitation = async (invitation: { organizationId: string; email: string; name: string; role: 'admin' | 'manager' | 'user' }) => {
    if (!user) throw new Error('User must be logged in');

    try {
      console.log('📧 Creating in-app invitation:', invitation);

      // Create invitation in database
      const { data, error } = await supabase.rpc('create_in_app_invitation', {
        p_organization_id: invitation.organizationId,
        p_email: invitation.email,
        p_name: invitation.name,
        p_role: invitation.role,
        p_invited_by_auth_id: user.id
      });

      if (error) throw error;

      console.log('✅ In-app invitation created:', data);
      
    } catch (error) {
      console.error('❌ Failed to send invitation:', error);
      throw error;
    }
  };

  const getPendingInvitations = async (): Promise<Invitation[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase.rpc('get_user_pending_invitations', {
        p_user_email: user.email
      });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Failed to get pending invitations:', error);
      return [];
    }
  };

  const acceptInvitation = async (invitationId: string) => {
    if (!user) throw new Error('User must be logged in');

    try {
      const { data, error } = await supabase.rpc('accept_in_app_invitation', {
        p_invitation_id: invitationId,
        p_auth_user_id: user.id
      });

      if (error) throw error;

      console.log('✅ Invitation accepted:', data);
      
      // Refresh data to get the new organization
      await refreshData();
    } catch (error) {
      console.error('❌ Failed to accept invitation:', error);
      throw error;
    }
  };

  const declineInvitation = async (invitationId: string) => {
    if (!user) throw new Error('User must be logged in');

    try {
      const { data, error } = await supabase.rpc('decline_in_app_invitation', {
        p_invitation_id: invitationId
      });

      if (error) throw error;

      console.log('✅ Invitation declined:', data);
    } catch (error) {
      console.error('❌ Failed to decline invitation:', error);
      throw error;
    }
  };

  const getInvitations = async (organizationId: string): Promise<Invitation[]> => {
    try {
      const { data, error } = await supabase
        .from('organization_invitations')
        .select(`
          id,
          email,
          name,
          role,
          status,
          expires_at,
          created_at,
          accepted_at,
          invited_by:users!organization_invitations_invited_by_fkey(name)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(invitation => ({
        id: invitation.id,
        organizationId,
        organizationName: '', // Will be filled by caller if needed
        email: invitation.email,
        name: invitation.name,
        role: invitation.role,
        invitedByName: invitation.invited_by?.name || 'Unknown',
        expiresAt: invitation.expires_at,
        createdAt: invitation.created_at
      }));
    } catch (error) {
      console.error('❌ Failed to get invitations:', error);
      throw error;
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    if (!user) throw new Error('User must be logged in');

    try {
      const { data, error } = await supabase.rpc('cancel_invitation', {
        p_invitation_id: invitationId,
        p_auth_user_id: user.id
      });

      if (error) throw error;

      console.log('✅ Invitation cancelled:', invitationId);
    } catch (error) {
      console.error('❌ Failed to cancel invitation:', error);
      throw error;
    }
  };

  const resendInvitation = async (invitationId: string) => {
    if (!user) throw new Error('User must be logged in');

    try {
      // For in-app invitations, we just update the expiry date
      const { data, error } = await supabase
        .from('organization_invitations')
        .update({
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Invitation resent (expiry extended):', data);
      
    } catch (error) {
      console.error('❌ Failed to resend invitation:', error);
      throw error;
    }
  };

  const getOrganizationById = (id: string) => state.organizations.find(org => org.id === id);
  const getCustomerById = (id: string) => state.customers.find(customer => customer.id === id);
  const getProjectById = (id: string) => state.projects.find(project => project.id === id);
  const getCalculatorById = (id: string) => state.calculators.find(calculator => calculator.id === id);
  const getUserById = (id: string) => state.users.find(user => user.id === id);

  // Get current user's database ID from auth user ID
  const getCurrentUserId = (): string | undefined => {
    if (!user) return undefined;
    const dbUser = state.users.find(u => u.authUserId === user.id);
    return dbUser?.id;
  };

  const getCurrentOrganizationCustomers = () =>
    state.customers.filter(customer => customer.organizationId === state.currentOrganizationId);
  
  const getCurrentOrganizationProjects = () => 
    state.projects.filter(project => project.organizationId === state.currentOrganizationId);
  
  const getCurrentOrganizationCalculators = () => 
    state.calculators.filter(calculator => calculator.organizationId === state.currentOrganizationId);
  
  const getCurrentOrganizationUsers = () => 
    state.users.filter(user => user.organizationId === state.currentOrganizationId);
  
  const getProjectsByCustomer = (customerId: string) => 
    state.projects.filter(project => project.customerId === customerId);
  
  const getCalculatorsByProject = (projectId: string) => 
    state.calculators.filter(calculator => calculator.projectId === projectId);

  console.log('✅ ProjectProvider context value ready');

  return (
    <ProjectContext.Provider value={{
      state,
      currentOrganization,
      addOrganization,
      updateOrganization,
      deleteOrganization,
      leaveOrganization,
      canLeaveOrganization,
      setCurrentOrganization,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addProject,
      updateProject,
      deleteProject,
      duplicateProject,
      addCalculator,
      updateCalculator,
      deleteCalculator,
      duplicateCalculator,
      moveCalculator,
      addUser,
      updateUser,
      deleteUser,
      inviteUser,
      sendInvitation,
      getPendingInvitations,
      acceptInvitation,
      declineInvitation,
      getInvitations,
      cancelInvitation,
      resendInvitation,
      getOrganizationById,
      getCustomerById,
      getProjectById,
      getCalculatorById,
      getUserById,
      getCurrentOrganizationCustomers,
      getCurrentOrganizationProjects,
      getCurrentOrganizationCalculators,
      getCurrentOrganizationUsers,
      getProjectsByCustomer,
      getCalculatorsByProject,
      refreshData
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

console.log('✅ ProjectContext loaded');