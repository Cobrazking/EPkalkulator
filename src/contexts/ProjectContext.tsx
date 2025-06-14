import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

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
}

type ProjectAction =
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
  | { type: 'LOAD_DATA'; payload: ProjectState };

const initialState: ProjectState = {
  organizations: [],
  customers: [],
  projects: [],
  calculators: [],
  currentOrganizationId: null
};

const projectReducer = (state: ProjectState, action: ProjectAction): ProjectState => {
  console.log('🔄 ProjectReducer action:', action.type);
  
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

interface ProjectContextType {
  state: ProjectState;
  currentOrganization: Organization | null;
  addOrganization: (organization: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrganization: (organization: Organization) => void;
  deleteOrganization: (id: string) => void;
  setCurrentOrganization: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (projectId: string) => string;
  addCalculator: (calculator: Omit<Calculator, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCalculator: (calculator: Calculator) => void;
  deleteCalculator: (id: string) => void;
  duplicateCalculator: (calculatorId: string, targetProjectId?: string) => string;
  moveCalculator: (calculatorId: string, newProjectId: string) => void;
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

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('🏗️ ProjectProvider initializing...');
  const [state, dispatch] = useReducer(projectReducer, initialState);

  console.log('📊 ProjectProvider state:', state);

  // Load data from localStorage on mount
  useEffect(() => {
    console.log('💾 Loading data from localStorage...');
    
    try {
      const savedData = localStorage.getItem('epkalk-data');
      console.log('📄 Saved data found:', !!savedData);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log('📋 Parsed data:', parsedData);
        
        // Migrate old data if needed
        if (!parsedData.organizations) {
          console.log('🔄 Migrating old data format...');
          const defaultOrg: Organization = {
            id: uuidv4(),
            name: 'Min organisasjon',
            description: 'Standard organisasjon',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          const migratedData = {
            organizations: [defaultOrg],
            customers: (parsedData.customers || []).map((customer: any) => ({
              ...customer,
              organizationId: defaultOrg.id
            })),
            projects: (parsedData.projects || []).map((project: any) => ({
              ...project,
              organizationId: defaultOrg.id
            })),
            calculators: (parsedData.calculators || []).map((calculator: any) => ({
              ...calculator,
              organizationId: defaultOrg.id
            })),
            currentOrganizationId: defaultOrg.id
          };
          
          console.log('✅ Migrated data:', migratedData);
          dispatch({ type: 'LOAD_DATA', payload: migratedData });
        } else {
          console.log('✅ Loading existing data structure...');
          dispatch({ type: 'LOAD_DATA', payload: parsedData });
        }
      } else {
        console.log('🆕 No saved data, creating default organization...');
        const defaultOrg: Organization = {
          id: uuidv4(),
          name: 'Min organisasjon',
          description: 'Standard organisasjon',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const defaultData = {
          organizations: [defaultOrg],
          customers: [],
          projects: [],
          calculators: [],
          currentOrganizationId: defaultOrg.id
        };
        
        console.log('✅ Default data created:', defaultData);
        dispatch({ type: 'LOAD_DATA', payload: defaultData });
      }
    } catch (error) {
      console.error('❌ Failed to load data from localStorage:', error);
      // Create default organization if loading fails
      const defaultOrg: Organization = {
        id: uuidv4(),
        name: 'Min organisasjon',
        description: 'Standard organisasjon',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const defaultData = {
        organizations: [defaultOrg],
        customers: [],
        projects: [],
        calculators: [],
        currentOrganizationId: defaultOrg.id
      };
      
      console.log('🔧 Error fallback data:', defaultData);
      dispatch({ type: 'LOAD_DATA', payload: defaultData });
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    console.log('💾 Saving state to localStorage...');
    localStorage.setItem('epkalk-data', JSON.stringify(state));
  }, [state]);

  const currentOrganization = state.currentOrganizationId 
    ? state.organizations.find(org => org.id === state.currentOrganizationId) || null
    : null;

  console.log('🏢 Current organization:', currentOrganization);

  const addOrganization = (organizationData: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => {
    const organization: Organization = {
      ...organizationData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_ORGANIZATION', payload: organization });
  };

  const updateOrganization = (organization: Organization) => {
    const updatedOrganization = { ...organization, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_ORGANIZATION', payload: updatedOrganization });
  };

  const deleteOrganization = (id: string) => {
    dispatch({ type: 'DELETE_ORGANIZATION', payload: id });
  };

  const setCurrentOrganization = (id: string) => {
    dispatch({ type: 'SET_CURRENT_ORGANIZATION', payload: id });
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!customerData.organizationId) {
      throw new Error('organizationId is required when adding a customer');
    }
    
    const customer: Customer = {
      ...customerData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_CUSTOMER', payload: customer });
  };

  const updateCustomer = (customer: Customer) => {
    const updatedCustomer = { ...customer, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_CUSTOMER', payload: updatedCustomer });
  };

  const deleteCustomer = (id: string) => {
    dispatch({ type: 'DELETE_CUSTOMER', payload: id });
  };

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!projectData.organizationId) {
      throw new Error('organizationId is required when adding a project');
    }
    
    const project: Project = {
      ...projectData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_PROJECT', payload: project });
  };

  const updateProject = (project: Project) => {
    const updatedProject = { ...project, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
  };

  const deleteProject = (id: string) => {
    dispatch({ type: 'DELETE_PROJECT', payload: id });
  };

  const duplicateProject = (projectId: string) => {
    const originalProject = state.projects.find(p => p.id === projectId);
    if (!originalProject) {
      throw new Error('Project not found');
    }

    const originalCalculators = state.calculators.filter(c => c.projectId === projectId);
    
    const newProjectId = uuidv4();
    const duplicatedProject: Project = {
      ...originalProject,
      id: newProjectId,
      name: `${originalProject.name} (Kopi)`,
      status: 'planning',
      startDate: new Date().toISOString().split('T')[0],
      endDate: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const duplicatedCalculators: Calculator[] = originalCalculators.map(calc => ({
      ...calc,
      id: uuidv4(),
      projectId: newProjectId,
      name: `${calc.name} (Kopi)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    dispatch({ 
      type: 'DUPLICATE_PROJECT', 
      payload: { 
        project: duplicatedProject, 
        calculators: duplicatedCalculators 
      } 
    });

    return newProjectId;
  };

  const addCalculator = (calculatorData: Omit<Calculator, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!calculatorData.organizationId) {
      throw new Error('organizationId is required when adding a calculator');
    }
    
    const calculator: Calculator = {
      ...calculatorData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_CALCULATOR', payload: calculator });
  };

  const updateCalculator = (calculator: Calculator) => {
    const updatedCalculator = { ...calculator, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_CALCULATOR', payload: updatedCalculator });
  };

  const deleteCalculator = (id: string) => {
    dispatch({ type: 'DELETE_CALCULATOR', payload: id });
  };

  const duplicateCalculator = (calculatorId: string, targetProjectId?: string) => {
    const originalCalculator = state.calculators.find(c => c.id === calculatorId);
    if (!originalCalculator) {
      throw new Error('Calculator not found');
    }

    const newCalculatorId = uuidv4();
    const duplicatedCalculator: Calculator = {
      ...originalCalculator,
      id: newCalculatorId,
      projectId: targetProjectId || originalCalculator.projectId,
      name: `${originalCalculator.name} (Kopi)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dispatch({ type: 'DUPLICATE_CALCULATOR', payload: duplicatedCalculator });
    return newCalculatorId;
  };

  const moveCalculator = (calculatorId: string, newProjectId: string) => {
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
      getCalculatorsByProject
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