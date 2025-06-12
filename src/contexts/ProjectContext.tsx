import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Customer {
  id: string;
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
  projectId: string;
  name: string;
  description?: string;
  entries: any[];
  summary: any;
  createdAt: string;
  updatedAt: string;
}

interface ProjectState {
  customers: Customer[];
  projects: Project[];
  calculators: Calculator[];
}

type ProjectAction =
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'ADD_CALCULATOR'; payload: Calculator }
  | { type: 'UPDATE_CALCULATOR'; payload: Calculator }
  | { type: 'DELETE_CALCULATOR'; payload: string }
  | { type: 'LOAD_DATA'; payload: ProjectState };

const initialState: ProjectState = {
  customers: [],
  projects: [],
  calculators: []
};

const projectReducer = (state: ProjectState, action: ProjectAction): ProjectState => {
  switch (action.type) {
    case 'LOAD_DATA':
      return action.payload;
    
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
    
    default:
      return state;
  }
};

interface ProjectContextType {
  state: ProjectState;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  addCalculator: (calculator: Omit<Calculator, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCalculator: (calculator: Calculator) => void;
  deleteCalculator: (id: string) => void;
  getCustomerById: (id: string) => Customer | undefined;
  getProjectById: (id: string) => Project | undefined;
  getCalculatorById: (id: string) => Calculator | undefined;
  getProjectsByCustomer: (customerId: string) => Project[];
  getCalculatorsByProject: (projectId: string) => Calculator[];
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('project-management-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'LOAD_DATA', payload: parsedData });
      } catch (error) {
        console.error('Failed to load data from localStorage:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('project-management-data', JSON.stringify(state));
  }, [state]);

  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
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

  const addCalculator = (calculatorData: Omit<Calculator, 'id' | 'createdAt' | 'updatedAt'>) => {
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

  const getCustomerById = (id: string) => state.customers.find(customer => customer.id === id);
  const getProjectById = (id: string) => state.projects.find(project => project.id === id);
  const getCalculatorById = (id: string) => state.calculators.find(calculator => calculator.id === id);
  const getProjectsByCustomer = (customerId: string) => state.projects.filter(project => project.customerId === customerId);
  const getCalculatorsByProject = (projectId: string) => state.calculators.filter(calculator => calculator.projectId === projectId);

  return (
    <ProjectContext.Provider value={{
      state,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addProject,
      updateProject,
      deleteProject,
      addCalculator,
      updateCalculator,
      deleteCalculator,
      getCustomerById,
      getProjectById,
      getCalculatorById,
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