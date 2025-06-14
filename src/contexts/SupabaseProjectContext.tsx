import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/auth/AuthProvider';
import type { 
  Organization, 
  Customer, 
  Project, 
  Calculator,
  ProjectState,
  ProjectAction 
} from './ProjectContext';

console.log('🗂️ SupabaseProjectContext loading...');

interface SupabaseProjectContextType {
  state: ProjectState;
  currentOrganization: Organization | null;
  loading: boolean;
  error: string | null;
  // Organization methods
  addOrganization: (organization: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateOrganization: (organization: Organization) => Promise<void>;
  deleteOrganization: (id: string) => Promise<void>;
  setCurrentOrganization: (id: string) => void;
  // Customer methods
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  // Project methods
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  duplicateProject: (projectId: string) => Promise<string>;
  // Calculator methods
  addCalculator: (calculator: Omit<Calculator, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCalculator: (calculator: Calculator) => Promise<void>;
  deleteCalculator: (id: string) => Promise<void>;
  duplicateCalculator: (calculatorId: string, targetProjectId?: string) => Promise<string>;
  moveCalculator: (calculatorId: string, newProjectId: string) => Promise<void>;
  // Getter methods
  getOrganizationById: (id: string) => Organization | undefined;
  getCustomerById: (id: string) => Customer | undefined;
  getProjectById: (id: string) => Project | undefined;
  getCalculatorById: (id: string) => Calculator | undefined;
  getCurrentOrganizationCustomers: () => Customer[];
  getCurrentOrganizationProjects: () => Project[];
  getCurrentOrganizationCalculators: () => Calculator[];
  getProjectsByCustomer: (customerId: string) => Project[];
  getCalculatorsByProject: (projectId: string) => Calculator[];
}

const initialState: ProjectState = {
  organizations: [],
  customers: [],
  projects: [],
  calculators: [],
  currentOrganizationId: null
};

const projectReducer = (state: ProjectState, action: ProjectAction): ProjectState => {
  console.log('🔄 SupabaseProjectReducer action:', action.type);
  
  switch (action.type) {
    case 'LOAD_DATA':
      console.log('📥 Loading data:', action.payload);
      return action.payload;
    
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
    
    case 'DUPLICATE_PROJECT':
      return {
        ...state,
        projects: [...state.projects, action.payload.project],
        calculators: [...state.calculators, ...action.payload.calculators]
      };
    
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
    
    case 'DUPLICATE_CALCULATOR':
      return {
        ...state,
        calculators: [...state.calculators, action.payload]
      };
    
    case 'MOVE_CALCULATOR':
      return {
        ...state,
        calculators: state.calculators.map(calculator =>
          calculator.id === action.payload.calculatorId 
            ? { ...calculator, projectId: action.payload.newProjectId, updatedAt: new Date().toISOString() }
            : calculator
        )
      };
    
    default:
      return state;
  }
};

const SupabaseProjectContext = createContext<SupabaseProjectContextType | undefined>(undefined);

export const SupabaseProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('🏗️ SupabaseProjectProvider initializing...');
  const { user } = useAuth();
  const [state, dispatch] = useReducer(projectReducer, initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('📊 SupabaseProjectProvider state:', state);
  console.log('👤 Current user:', !!user);

  // Load data from Supabase when user is authenticated
  useEffect(() => {
    if (!user) {
      console.log('❌ No user, skipping data load');
      setLoading(false);
      return;
    }

    console.log('💾 Loading data from Supabase...');
    loadAllData();
  }, [user]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📥 Fetching all data from Supabase...');

      // Load organizations
      const { data: organizations, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (orgError) throw orgError;

      // Load customers
      const { data: customers, error: custError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (custError) throw custError;

      // Load projects
      const { data: projects, error: projError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projError) throw projError;

      // Load calculators
      const { data: calculators, error: calcError } = await supabase
        .from('calculators')
        .select('*')
        .order('created_at', { ascending: false });

      if (calcError) throw calcError;

      const loadedData: ProjectState = {
        organizations: organizations || [],
        customers: customers || [],
        projects: projects || [],
        calculators: calculators || [],
        currentOrganizationId: organizations?.[0]?.id || null
      };

      console.log('✅ Data loaded from Supabase:', loadedData);
      dispatch({ type: 'LOAD_DATA', payload: loadedData });

    } catch (err) {
      console.error('❌ Failed to load data from Supabase:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const currentOrganization = state.currentOrganizationId 
    ? state.organizations.find(org => org.id === state.currentOrganizationId) || null
    : null;

  console.log('🏢 Current organization:', currentOrganization);

  // Organization methods
  const addOrganization = async (organizationData: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert([organizationData])
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'ADD_ORGANIZATION', payload: data });
    } catch (err) {
      console.error('❌ Failed to add organization:', err);
      throw err;
    }
  };

  const updateOrganization = async (organization: Organization) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: organization.name,
          description: organization.description,
          logo: organization.logo,
          address: organization.address,
          phone: organization.phone,
          email: organization.email,
          website: organization.website
        })
        .eq('id', organization.id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_ORGANIZATION', payload: organization });
    } catch (err) {
      console.error('❌ Failed to update organization:', err);
      throw err;
    }
  };

  const deleteOrganization = async (id: string) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      dispatch({ type: 'DELETE_ORGANIZATION', payload: id });
    } catch (err) {
      console.error('❌ Failed to delete organization:', err);
      throw err;
    }
  };

  const setCurrentOrganization = (id: string) => {
    dispatch({ type: 'SET_CURRENT_ORGANIZATION', payload: id });
  };

  // Customer methods
  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'ADD_CUSTOMER', payload: data });
    } catch (err) {
      console.error('❌ Failed to add customer:', err);
      throw err;
    }
  };

  const updateCustomer = async (customer: Customer) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          company: customer.company
        })
        .eq('id', customer.id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_CUSTOMER', payload: customer });
    } catch (err) {
      console.error('❌ Failed to update customer:', err);
      throw err;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      dispatch({ type: 'DELETE_CUSTOMER', payload: id });
    } catch (err) {
      console.error('❌ Failed to delete customer:', err);
      throw err;
    }
  };

  // Project methods
  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'ADD_PROJECT', payload: data });
    } catch (err) {
      console.error('❌ Failed to add project:', err);
      throw err;
    }
  };

  const updateProject = async (project: Project) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: project.name,
          description: project.description,
          customer_id: project.customerId,
          status: project.status,
          start_date: project.startDate,
          end_date: project.endDate,
          budget: project.budget
        })
        .eq('id', project.id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_PROJECT', payload: project });
    } catch (err) {
      console.error('❌ Failed to update project:', err);
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      dispatch({ type: 'DELETE_PROJECT', payload: id });
    } catch (err) {
      console.error('❌ Failed to delete project:', err);
      throw err;
    }
  };

  const duplicateProject = async (projectId: string): Promise<string> => {
    try {
      const originalProject = state.projects.find(p => p.id === projectId);
      if (!originalProject) {
        throw new Error('Project not found');
      }

      const originalCalculators = state.calculators.filter(c => c.projectId === projectId);
      
      // Create new project
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert([{
          organization_id: originalProject.organizationId,
          customer_id: originalProject.customerId,
          name: `${originalProject.name} (Kopi)`,
          description: originalProject.description,
          status: 'planning',
          start_date: new Date().toISOString().split('T')[0],
          end_date: null,
          budget: originalProject.budget
        }])
        .select()
        .single();

      if (projectError) throw projectError;

      // Create new calculators
      const calculatorInserts = originalCalculators.map(calc => ({
        organization_id: calc.organizationId,
        project_id: newProject.id,
        name: `${calc.name} (Kopi)`,
        description: calc.description,
        entries: calc.entries,
        summary: calc.summary
      }));

      if (calculatorInserts.length > 0) {
        const { data: newCalculators, error: calcError } = await supabase
          .from('calculators')
          .insert(calculatorInserts)
          .select();

        if (calcError) throw calcError;

        dispatch({ 
          type: 'DUPLICATE_PROJECT', 
          payload: { 
            project: newProject, 
            calculators: newCalculators || []
          } 
        });
      } else {
        dispatch({ 
          type: 'DUPLICATE_PROJECT', 
          payload: { 
            project: newProject, 
            calculators: []
          } 
        });
      }

      return newProject.id;
    } catch (err) {
      console.error('❌ Failed to duplicate project:', err);
      throw err;
    }
  };

  // Calculator methods
  const addCalculator = async (calculatorData: Omit<Calculator, 'id' | 'createdAt' | 'updatedAt'>) => {
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

      dispatch({ type: 'ADD_CALCULATOR', payload: data });
    } catch (err) {
      console.error('❌ Failed to add calculator:', err);
      throw err;
    }
  };

  const updateCalculator = async (calculator: Calculator) => {
    try {
      const { error } = await supabase
        .from('calculators')
        .update({
          name: calculator.name,
          description: calculator.description,
          entries: calculator.entries,
          summary: calculator.summary
        })
        .eq('id', calculator.id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_CALCULATOR', payload: calculator });
    } catch (err) {
      console.error('❌ Failed to update calculator:', err);
      throw err;
    }
  };

  const deleteCalculator = async (id: string) => {
    try {
      const { error } = await supabase
        .from('calculators')
        .delete()
        .eq('id', id);

      if (error) throw error;

      dispatch({ type: 'DELETE_CALCULATOR', payload: id });
    } catch (err) {
      console.error('❌ Failed to delete calculator:', err);
      throw err;
    }
  };

  const duplicateCalculator = async (calculatorId: string, targetProjectId?: string): Promise<string> => {
    try {
      const originalCalculator = state.calculators.find(c => c.id === calculatorId);
      if (!originalCalculator) {
        throw new Error('Calculator not found');
      }

      const { data, error } = await supabase
        .from('calculators')
        .insert([{
          organization_id: originalCalculator.organizationId,
          project_id: targetProjectId || originalCalculator.projectId,
          name: `${originalCalculator.name} (Kopi)`,
          description: originalCalculator.description,
          entries: originalCalculator.entries,
          summary: originalCalculator.summary
        }])
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'DUPLICATE_CALCULATOR', payload: data });
      return data.id;
    } catch (err) {
      console.error('❌ Failed to duplicate calculator:', err);
      throw err;
    }
  };

  const moveCalculator = async (calculatorId: string, newProjectId: string) => {
    try {
      const { error } = await supabase
        .from('calculators')
        .update({ project_id: newProjectId })
        .eq('id', calculatorId);

      if (error) throw error;

      dispatch({ type: 'MOVE_CALCULATOR', payload: { calculatorId, newProjectId } });
    } catch (err) {
      console.error('❌ Failed to move calculator:', err);
      throw err;
    }
  };

  // Getter methods
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

  console.log('✅ SupabaseProjectProvider context value ready');

  return (
    <SupabaseProjectContext.Provider value={{
      state,
      currentOrganization,
      loading,
      error,
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
      getCalculatorsByProject
    }}>
      {children}
    </SupabaseProjectContext.Provider>
  );
};

export const useSupabaseProject = () => {
  const context = useContext(SupabaseProjectContext);
  if (context === undefined) {
    throw new Error('useSupabaseProject must be used within a SupabaseProjectProvider');
  }
  return context;
};

console.log('✅ SupabaseProjectContext loaded');