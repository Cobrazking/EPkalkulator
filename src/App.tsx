import React, { useState } from 'react';
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
import { useSupabase } from './hooks/useSupabase';

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useSupabase();

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-900/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Laster EPKalk...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route path="/forgot-password" element={user ? <Navigate to="/" replace /> : <ForgotPasswordPage />} />
        <Route path="/reset-password" element={user ? <Navigate to="/" replace /> : <ResetPasswordPage />} />
        
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