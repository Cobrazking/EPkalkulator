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
import SettingsPage from './pages/SettingsPage';
import { ProjectProvider } from './contexts/ProjectContext';

console.log('📱 App component loading...');

const AppContent: React.FC = () => {
  console.log('🎨 AppContent component rendering...');
  const { user, loading, error } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log('👤 Current user:', user?.email || 'No user');
  console.log('⏳ Loading state:', loading);
  console.log('❌ Error state:', error);

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-900/10 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Tilkoblingsfeil</h2>
          <p className="text-text-muted mb-4">Kunne ikke koble til serveren</p>
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4 max-w-md">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Last inn på nytt
          </button>
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
      <Router>
        <div className="min-h-screen bg-background text-text-primary flex">
          <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
          
          {/* Main content with responsive margin */}
          <div className="flex-1 flex flex-col overflow-hidden lg:ml-72 xl:ml-80">
            {/* Content area with proper padding for mobile menu button */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto pt-16 lg:pt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="container mx-auto px-4 py-6"
              >
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
                  <Route path="/projects/:projectId/calculator/:calculatorId?" element={<CalculatorPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </motion.div>
            </main>
          </div>
        </div>
      </Router>
    </ProjectProvider>
  );
};

const App: React.FC = () => {
  console.log('🎨 App component rendering...');
  
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

console.log('✅ App component loaded');

export default App;