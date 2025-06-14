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
  | { type: 'ADD_ORGANIZATION'; payload: Organization }
  | { type: 'UPDATE_ORGANIZATION'; payload: Organization }
  | { type: 'DELETE_ORGANIZATION'; payload: string }
  | { type: 'SET_CURRENT_ORGANIZATION'; payload: string }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'DUPLICATE_PROJECT'; payload: { project: Project; calculators: Calculator[] } }
  | { type: 'ADD_CALCULATOR'; payload: Calculator }
  | { type: 'UPDATE_CALCULATOR'; payload: Calculator }
  | { type: 'DELETE_CALCULATOR'; payload: string }
  | { type: 'DUPLICATE_CALCULATOR'; payload: Calculator }
  | { type: 'MOVE_CALCULATOR'; payload: { calculatorId: string; newProjectId: string } }
  | { type: 'LOAD_DATA'; payload: Omit<ProjectState, 'loading' | 'error'> };

const initialState: ProjectState = {
  organizations: [],
  customers: [],
  projects: [],
  calculators: [],
  currentOrganizationId: null,
  loading: true,
  error: null
};

const projectReducer = (state: ProjectState, action: ProjectAction): ProjectState => {
  console.log('🔄 ProjectReducer action:', action.type);
  
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'LOAD_DATA':
      console.log('📥 Loading data:', action.payload);
      return { 
        ...state, 
        ...action.payload, 
        loading: false, 
        error: null 
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
  addCalculator: (calculator: Omit<Calculator, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
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
  const loadDataFromSupabase = async () => {
    if (!user) {
      console.log('👤 No user, clearing data');
      dispatch({ 
        type: 'LOAD_DATA', 
        payload: {
          organizations: [],
          customers: [],
          projects: [],
          calculators: [],
          currentOrganizationId: null
        }
      });
      return;
    }

    console.log('📥 Loading data from Supabase for user:', user.email);
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      console.log('🔍 Checking for existing user record...');
      
      // First, get or create user record
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      let currentUser = userData;

      if (userError && userError.code === 'PGRST116') {
        // User doesn't exist, create default organization and user
        console.log('🆕 Creating new user and default organization');
        
        const defaultOrg = {
          name: 'Min organisasjon',
          description: 'Standard organisasjon',
        };

        console.log('🏢 Creating default organization...');
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert([defaultOrg])
          .select()
          .single();

        if (orgError) {
          console.error('❌ Failed to create organization:', orgError);
          throw orgError;
        }

        console.log('✅ Organization created:', orgData.id);

        const newUser = {
          organization_id: orgData.id,
          auth_user_id: user.id,
          name: user.email?.split('@')[0] || 'Bruker',
          email: user.email || '',
          role: 'admin' as const
        };

        console.log('👤 Creating user record...');
        const { data: newUserData, error: newUserError } = await supabase
          .from('users')
          .insert([newUser])
          .select()
          .single();

        if (newUserError) {
          console.error('❌ Failed to create user:', newUserError);
          throw newUserError;
        }

        console.log('✅ User created:', newUserData.id);
        currentUser = newUserData;
      } else if (userError) {
        console.error('❌ Error fetching user:', userError);
        throw userError;
      }

      if (!currentUser) {
        throw new Error('Failed to get or create user');
      }

      console.log('👤 Current user:', currentUser.id, 'Org:', currentUser.organization_id);

      // Load all data for user's organization
      console.log('📊 Loading organization data...');
      const [orgsResult, customersResult, projectsResult, calculatorsResult] = await Promise.all([
        supabase.from('organizations').select('*'),
        supabase.from('customers').select('*').eq('organization_id', currentUser.organization_id),
        supabase.from('projects').select('*').eq('organization_id', currentUser.organization_id),
        supabase.from('calculators').select('*').eq('organization_id', currentUser.organization_id)
      ]);

      if (orgsResult.error) {
        console.error('❌ Error loading organizations:', orgsResult.error);
        throw orgsResult.error;
      }
      if (customersResult.error) {
        console.error('❌ Error loading customers:', customersResult.error);
        throw customersResult.error;
      }
      if (projectsResult.error) {
        console.error('❌ Error loading projects:', projectsResult.error);
        throw projectsResult.error;
      }
      if (calculatorsResult.error) {
        console.error('❌ Error loading calculators:', calculatorsResult.error);
        throw calculatorsResult.error;
      }

      // Transform data to match our interfaces
      const organizations: Organization[] = orgsResult.data.map(org => ({
        id: org.id,
        name: org.name,
        description: org.description,
        logo: org.logo,
        address: org.address,
        phone: org.phone,
        email: org.email,
        website: org.website,
        createdAt: org.created_at,
        updatedAt: org.updated_at
      }));

      const customers: Customer[] = customersResult.data.map(customer => ({
        id: customer.id,
        organizationId: customer.organization_id,
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        company: customer.company,
        createdAt: customer.created_at,
        updatedAt: customer.updated_at
      }));

      const projects: Project[] = projectsResult.data.map(project => ({
        id: project.id,
        organizationId: project.organization_id,
        name: project.name,
        description: project.description,
        customerId: project.customer_id,
        status: project.status,
        startDate: project.start_date,
        endDate: project.end_date,
        budget: project.budget,
        createdAt: project.created_at,
        updatedAt: project.updated_at
      }));

      const calculators: Calculator[] = calculatorsResult.data.map(calc => ({
        id: calc.id,
        organizationId: calc.organization_id,
        projectId: calc.project_id,
        name: calc.name,
        description: calc.description,
        entries: calc.entries || [],
        summary: calc.summary || {},
        createdAt: calc.created_at,
        updatedAt: calc.updated_at
      }));

      console.log('✅ Data loaded from Supabase:', {
        organizations: organizations.length,
        customers: customers.length,
        projects: projects.length,
        calculators: calculators.length
      });

      dispatch({
        type: 'LOAD_DATA',
        payload: {
          organizations,
          customers,
          projects,
          calculators,
          currentOrganizationId: currentUser.organization_id
        }
      });

    } catch (error) {
      console.error('❌ Failed to load data from Supabase:', error);
      let errorMessage = 'Kunne ikke laste data fra serveren';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  // Load data when user changes
  useEffect(() => {
    console.log('🔄 User changed, loading data...');
    loadDataFromSupabase();
  }, [user]);

  // Save current organization to localStorage for persistence
  useEffect(() => {
    if (state.currentOrganizationId) {
      localStorage.setItem('epkalk-current-org', state.currentOrganizationId);
    }
  }, [state.currentOrganizationId]);

  const currentOrganization = state.currentOrganizationId 
    ? state.organizations.find(org => org.id === state.currentOrganizationId) || null
    : null;

  console.log('🏢 Current organization:', currentOrganization);

  const addOrganization = async (organizationData: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('User must be logged in');

    const { data, error } = await supabase
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

    if (error) throw error;

    const organization: Organization = {
      id: data.id,
      name: data.name,
      description: data.description,
      logo: data.logo,
      address: data.address,
      phone: data.phone,
      email: data.email,
      website: data.website,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    dispatch({ type: 'ADD_ORGANIZATION', payload: organization });
  };

  const updateOrganization = async (organization: Organization) => {
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

    const updatedOrganization = { ...organization, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_ORGANIZATION', payload: updatedOrganization });
  };

  const deleteOrganization = async (id: string) => {
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id);

    if (error) throw error;

    dispatch({ type: 'DELETE_ORGANIZATION', payload: id });
  };

  const setCurrentOrganization = (id: string) => {
    dispatch({ type: 'SET_CURRENT_ORGANIZATION', payload: id });
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!customerData.organizationId) {
      throw new Error('organizationId is required when adding a customer');
    }

    const { data, error } = await supabase
      .from('customers')
      .insert([{
        organization_id: customerData.organizationId,
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        company: customerData.company
      }])
      .select()
      .single();

    if (error) throw error;

    const customer: Customer = {
      id: data.id,
      organizationId: data.organization_id,
      name: data.name,
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      company: data.company,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    dispatch({ type: 'ADD_CUSTOMER', payload: customer });
  };

  const updateCustomer = async (customer: Customer) => {
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

    const updatedCustomer = { ...customer, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_CUSTOMER', payload: updatedCustomer });
  };

  const deleteCustomer = async (id: string) => {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    dispatch({ type: 'DELETE_CUSTOMER', payload: id });
  };

  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!projectData.organizationId) {
      throw new Error('organizationId is required when adding a project');
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        organization_id: projectData.organizationId,
        customer_id: projectData.customerId,
        name: projectData.name,
        description: projectData.description,
        status: projectData.status,
        start_date: projectData.startDate,
        end_date: projectData.endDate,
        budget: projectData.budget
      }])
      .select()
      .single();

    if (error) throw error;

    const project: Project = {
      id: data.id,
      organizationId: data.organization_id,
      name: data.name,
      description: data.description,
      customerId: data.customer_id,
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date,
      budget: data.budget,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    dispatch({ type: 'ADD_PROJECT', payload: project });
  };

  const updateProject = async (project: Project) => {
    const { error } = await supabase
      .from('projects')
      .update({
        customer_id: project.customerId,
        name: project.name,
        description: project.description,
        status: project.status,
        start_date: project.startDate,
        end_date: project.endDate,
        budget: project.budget
      })
      .eq('id', project.id);

    if (error) throw error;

    const updatedProject = { ...project, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;

    dispatch({ type: 'DELETE_PROJECT', payload: id });
  };

  const duplicateProject = async (projectId: string): Promise<string> => {
    const originalProject = state.projects.find(p => p.id === projectId);
    if (!originalProject) {
      throw new Error('Project not found');
    }

    const originalCalculators = state.calculators.filter(c => c.projectId === projectId);
    
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

    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert([newProjectData])
      .select()
      .single();

    if (projectError) throw projectError;

    const duplicatedProject: Project = {
      id: projectData.id,
      organizationId: projectData.organization_id,
      name: projectData.name,
      description: projectData.description,
      customerId: projectData.customer_id,
      status: projectData.status,
      startDate: projectData.start_date,
      endDate: projectData.end_date,
      budget: projectData.budget,
      createdAt: projectData.created_at,
      updatedAt: projectData.updated_at
    };

    // Duplicate calculators
    const duplicatedCalculators: Calculator[] = [];
    
    for (const calc of originalCalculators) {
      const newCalcData = {
        organization_id: calc.organizationId,
        project_id: projectData.id,
        name: `${calc.name} (Kopi)`,
        description: calc.description,
        entries: calc.entries,
        summary: calc.summary
      };

      const { data: calcData, error: calcError } = await supabase
        .from('calculators')
        .insert([newCalcData])
        .select()
        .single();

      if (calcError) throw calcError;

      duplicatedCalculators.push({
        id: calcData.id,
        organizationId: calcData.organization_id,
        projectId: calcData.project_id,
        name: calcData.name,
        description: calcData.description,
        entries: calcData.entries || [],
        summary: calcData.summary || {},
        createdAt: calcData.created_at,
        updatedAt: calcData.updated_at
      });
    }

    dispatch({ 
      type: 'DUPLICATE_PROJECT', 
      payload: { 
        project: duplicatedProject, 
        calculators: duplicatedCalculators 
      } 
    });

    return projectData.id;
  };

  const addCalculator = async (calculatorData: Omit<Calculator, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!calculatorData.organizationId) {
      throw new Error('organizationId is required when adding a calculator');
    }

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

    const calculator: Calculator = {
      id: data.id,
      organizationId: data.organization_id,
      projectId: data.project_id,
      name: data.name,
      description: data.description,
      entries: data.entries || [],
      summary: data.summary || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    dispatch({ type: 'ADD_CALCULATOR', payload: calculator });
  };

  const updateCalculator = async (calculator: Calculator) => {
    const { error } = await supabase
      .from('calculators')
      .update({
        project_id: calculator.projectId,
        name: calculator.name,
        description: calculator.description,
        entries: calculator.entries,
        summary: calculator.summary
      })
      .eq('id', calculator.id);

    if (error) throw error;

    const updatedCalculator = { ...calculator, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_CALCULATOR', payload: updatedCalculator });
  };

  const deleteCalculator = async (id: string) => {
    const { error } = await supabase
      .from('calculators')
      .delete()
      .eq('id', id);

    if (error) throw error;

    dispatch({ type: 'DELETE_CALCULATOR', payload: id });
  };

  const duplicateCalculator = async (calculatorId: string, targetProjectId?: string): Promise<string> => {
    const originalCalculator = state.calculators.find(c => c.id === calculatorId);
    if (!originalCalculator) {
      throw new Error('Calculator not found');
    }

    const newCalcData = {
      organization_id: originalCalculator.organizationId,
      project_id: targetProjectId || originalCalculator.projectId,
      name: `${originalCalculator.name} (Kopi)`,
      description: originalCalculator.description,
      entries: originalCalculator.entries,
      summary: originalCalculator.summary
    };

    const { data, error } = await supabase
      .from('calculators')
      .insert([newCalcData])
      .select()
      .single();

    if (error) throw error;

    const duplicatedCalculator: Calculator = {
      id: data.id,
      organizationId: data.organization_id,
      projectId: data.project_id,
      name: data.name,
      description: data.description,
      entries: data.entries || [],
      summary: data.summary || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    dispatch({ type: 'DUPLICATE_CALCULATOR', payload: duplicatedCalculator });
    return data.id;
  };

  const moveCalculator = async (calculatorId: string, newProjectId: string) => {
    const { error } = await supabase
      .from('calculators')
      .update({ project_id: newProjectId })
      .eq('id', calculatorId);

    if (error) throw error;

    dispatch({ type: 'MOVE_CALCULATOR', payload: { calculatorId, newProjectId } });
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

  const refreshData = async () => {
    console.log('🔄 Refreshing data...');
    await loadDataFromSupabase();
  };

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