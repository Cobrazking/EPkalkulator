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
  createdAt: string;
  updatedAt: string;
}

interface ProjectState {
  organizations: Organization[];
  customers: Customer[];
  projects: Project[];
  calculators: Calculator[];
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
  | { type: 'RESET_STATE' };

const initialState: ProjectState = {
  organizations: [],
  customers: [],
  projects: [],
  calculators: [],
  currentOrganizationId: null,
  loading: false,
  error: null
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
  getOrganizationById: (id: string) => Organization | undefined;
  getCustomerById: (id: string) => Customer | undefined;
  getProjectById: (id: string) => Project | undefined;
  getCalculatorById: (id: string) => Calculator | undefined;
  getCurrentOrganizationCustomers: () => Customer[];
  getCurrentOrganizationProjects: () => Project[];
  getCurrentOrganizationCalculators: () => Calculator[];
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
      dispatch({ type: 'SET_ORGANIZATIONS', payload: organizations || [] });

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
        dispatch({ type: 'SET_CUSTOMERS', payload: customers || [] });

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
        dispatch({ type: 'SET_PROJECTS', payload: projects || [] });

        // Load calculators
        const { data: calculators, error: calculatorError } = await supabase
          .from('calculators')
          .select('*')
          .in('organization_id', organizations.map(org => org.id))
          .order('created_at', { ascending: false });

        if (calculatorError) {
          console.error('❌ Error loading calculators:', calculatorError);
          throw calculatorError;
        }

        console.log('✅ Calculators loaded:', calculators?.length || 0);
        dispatch({ type: 'SET_CALCULATORS', payload: calculators || [] });
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
        org_description: organizationData.description || null,
        org_logo: organizationData.logo || null,
        org_address: organizationData.address || null,
        org_phone: organizationData.phone || null,
        org_email: organizationData.email || null,
        org_website: organizationData.website || null,
        user_name: user.email?.split('@')[0] || 'User',
        user_email: user.email || ''
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
          dispatch({ type: 'ADD_ORGANIZATION', payload: directOrg });
          
          if (state.organizations.length === 0) {
            dispatch({ type: 'SET_CURRENT_ORGANIZATION', payload: directOrg.id });
          }
          
          return;
        }
        
        throw new Error(`Failed to create organization: ${orgError.message}`);
      }

      console.log('✅ Organization created via RPC:', newOrg);
      
      // The RPC should return the organization data
      if (newOrg && typeof newOrg === 'object' && 'id' in newOrg) {
        dispatch({ type: 'ADD_ORGANIZATION', payload: newOrg as Organization });
        
        if (state.organizations.length === 0) {
          dispatch({ type: 'SET_CURRENT_ORGANIZATION', payload: newOrg.id });
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
      const { data, error } = await supabase
        .from('organizations')
        .update({
          name: organization.name,
          description: organization.description,
          logo: organization.logo,
          address: organization.address,
          phone: organization.phone,
          email: organization.email,
          website: organization.website,
          updated_at: new Date().toISOString()
        })
        .eq('id', organization.id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Organization updated:', data);
      dispatch({ type: 'UPDATE_ORGANIZATION', payload: data });
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

  const setCurrentOrganization = (id: string) => {
    dispatch({ type: 'SET_CURRENT_ORGANIZATION', payload: id });
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!customerData.organizationId) {
      throw new Error('organizationId is required when adding a customer');
    }
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Customer added:', data);
      dispatch({ type: 'ADD_CUSTOMER', payload: data });
    } catch (error) {
      console.error('❌ Failed to add customer:', error);
      throw error;
    }
  };

  const updateCustomer = async (customer: Customer) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          company: customer.company,
          updated_at: new Date().toISOString()
        })
        .eq('id', customer.id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Customer updated:', data);
      dispatch({ type: 'UPDATE_CUSTOMER', payload: data });
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
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Project added:', data);
      dispatch({ type: 'ADD_PROJECT', payload: data });
    } catch (error) {
      console.error('❌ Failed to add project:', error);
      throw error;
    }
  };

  const updateProject = async (project: Project) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          name: project.name,
          description: project.description,
          customer_id: project.customerId,
          status: project.status,
          start_date: project.startDate,
          end_date: project.endDate,
          budget: project.budget,
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Project updated:', data);
      dispatch({ type: 'UPDATE_PROJECT', payload: data });
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
      const newProjectData = {
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
      dispatch({ type: 'ADD_PROJECT', payload: newProject });

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
          dispatch({ type: 'ADD_CALCULATOR', payload: calc });
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
      const { data, error } = await supabase
        .from('calculators')
        .insert([{
          organization_id: calculatorData.organizationId,
          project_id: calculatorData.projectId,
          name: calculatorData.name,
          description: calculatorData.description,
          entries: calculatorData.entries,
          summary: calculatorData.summary
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Calculator added:', data);
      dispatch({ type: 'ADD_CALCULATOR', payload: data });
      return data.id;
    } catch (error) {
      console.error('❌ Failed to add calculator:', error);
      throw error;
    }
  };

  const updateCalculator = async (calculator: Calculator) => {
    try {
      const { data, error } = await supabase
        .from('calculators')
        .update({
          name: calculator.name,
          description: calculator.description,
          entries: calculator.entries,
          summary: calculator.summary,
          updated_at: new Date().toISOString()
        })
        .eq('id', calculator.id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Calculator updated:', data);
      dispatch({ type: 'UPDATE_CALCULATOR', payload: data });
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
      dispatch({ type: 'ADD_CALCULATOR', payload: data });
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
      dispatch({ type: 'UPDATE_CALCULATOR', payload: data });
    } catch (error) {
      console.error('❌ Failed to move calculator:', error);
      throw error;
    }
  };

  const getOrganizationById = (id: string) => state.organizations.find(org => org.id === id);
  const getCustomerById = (id: string) => state.customers.find(customer => customer.id === id);
  const getProjectById = (id: string) => state.projects.find(project => project.id === id);
  const getCalculatorById = (id: string) => state.calculators.find(calculator => calculator.id === id);
  
  const getCurrentOrganizationCustomers = () => 
    state.customers.filter(customer => customer.organizationId === state.currentOrganizationId);
  
  const getCurrentOrganizationProjects = () => 
    state.projects.filter(project => project.organizationId === state.currentOrganizationId);
  
  const getCurrentOrganizationCalculators = () => 
    state.calculators.filter(calculator => calculator.organizationId === state.currentOrganizationId);
  
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
      getOrganizationById,
      getCustomerById,
      getProjectById,
      getCalculatorById,
      getCurrentOrganizationCustomers,
      getCurrentOrganizationProjects,
      getCurrentOrganizationCalculators,
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