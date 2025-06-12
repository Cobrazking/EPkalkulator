import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';

import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import CustomersPage from './pages/CustomersPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import CalculatorPage from './pages/CalculatorPage';
import SettingsPage from './pages/SettingsPage';
import { ProjectProvider } from './contexts/ProjectContext';

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProjectProvider>
      <Router>
        <div className="min-h-screen bg-background text-text-primary flex">
          <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
          
          <div className="flex-1 flex flex-col overflow-hidden">
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
      </Router>
    </ProjectProvider>
  );
};

export default App;