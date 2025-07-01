import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';

import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import LoginForm from './components/auth/LoginForm';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import CustomersPage from './pages/CustomersPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import CalculatorPage from './pages/CalculatorPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import InvitationAcceptPage from './pages/InvitationAcceptPage';
import { ProjectProvider } from './contexts/ProjectContext';

console.log('📱 App component loading...');

const AppContent: React.FC = () => {
  console.log('🎨 AppContent component rendering...');
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  console.log('👤 Current user:', user?.email || 'No user');
  console.log('⏳ Loading state:', loading);

  // Load sidebar collapsed state from localStorage
  React.useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed !== null) {
      setSidebarCollapsed(JSON.parse(savedCollapsed));
    }
  }, []);

  // Save sidebar collapsed state when it changes
  React.useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-900/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Laster inn...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🔐 No user found, showing login form');
    return <LoginForm />;
  }

  console.log('✅ User authenticated, showing main app');

  return (
    <ProjectProvider>
      <div className="min-h-screen bg-background text-text-primary flex">
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
          isCollapsed={sidebarCollapsed}
          onCollapseToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        {/* Main content with responsive margin based on sidebar state */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72 xl:ml-80'
        }`}>
          {/* Content area with proper padding for mobile menu button */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto pt-16 lg:pt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="container mx-auto px-4 py-6 max-w-full"
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
                <Route path="/projects/:projectId/calculator/:calculatorId?" element={<CalculatorPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </motion.div>
          </main>
        </div>
      </div>
    </ProjectProvider>
  );
};

const App: React.FC = () => {
  console.log('🎨 App component rendering...');
  
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/invitation/:token" element={<InvitationAcceptPage />} />
          <Route path="*" element={<AppContent />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

console.log('✅ App component loaded');

export default App;