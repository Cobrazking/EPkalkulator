import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import Sidebar from './components/layout/Sidebar';
import AuthGuard from './components/AuthGuard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import CustomersPage from './pages/CustomersPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import CalculatorPage from './pages/CalculatorPage';
import SettingsPage from './pages/SettingsPage';
import { ProjectProvider } from './contexts/ProjectContext';

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add a small delay to ensure everything is loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show loading screen while app initializes
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-900/10 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-4 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">EPKalk</h1>
              <p className="text-sm text-text-muted">Profesjonelt kalkyleverktøy</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-text-muted">Starter app...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Protected routes */}
        <Route path="/*" element={
          <AuthGuard>
            <ProjectProvider>
              <div className="min-h-screen bg-background text-text-primary flex">
                <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
                
                <div className="flex-1 flex flex-col overflow-hidden lg:ml-80">
                  <main className="flex-1 overflow-x-hidden overflow-y-auto">
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
            </ProjectProvider>
          </AuthGuard>
        } />
      </Routes>
    </Router>
  );
};

export default App;