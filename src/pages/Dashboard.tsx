import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  FolderOpen, 
  Calculator, 
  TrendingUp, 
  Clock,
  DollarSign,
  Plus,
  ArrowRight
} from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';
import { formatNumber } from '../utils/calculations';

const Dashboard: React.FC = () => {
  const { state } = useProject();

  const stats = {
    totalCustomers: state.customers.length,
    totalProjects: state.projects.length,
    activeProjects: state.projects.filter(p => p.status === 'active').length,
    totalCalculators: state.calculators.length,
    totalValue: state.calculators.reduce((acc, calc) => acc + (calc.summary?.totalSum || 0), 0)
  };

  const recentProjects = state.projects
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const recentCalculators = state.calculators
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const getCustomerName = (customerId: string) => {
    const customer = state.customers.find(c => c.id === customerId);
    return customer?.name || 'Ukjent kunde';
  };

  const getProjectName = (projectId: string) => {
    const project = state.projects.find(p => p.id === projectId);
    return project?.name || 'Ukjent prosjekt';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'completed': return 'text-blue-400 bg-blue-400/10';
      case 'on-hold': return 'text-yellow-400 bg-yellow-400/10';
      case 'planning': return 'text-purple-400 bg-purple-400/10';
      default: return 'text-text-muted bg-background-darker';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'completed': return 'Fullført';
      case 'on-hold': return 'På vent';
      case 'planning': return 'Planlegging';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-muted mt-1">Oversikt over dine prosjekter og kalkyler</p>
        </div>
        
        <div className="flex gap-2">
          <Link to="/customers" className="btn-secondary flex items-center gap-2">
            <Plus size={16} />
            Ny kunde
          </Link>
          <Link to="/projects" className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            Nytt prosjekt
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 bg-gradient-to-br from-blue-600/20 via-indigo-600/15 to-purple-600/20 border-blue-500/30"
        >
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats.totalCustomers}</p>
              <p className="text-sm text-blue-200/80">Kunder</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6 bg-gradient-to-br from-emerald-600/20 via-teal-600/15 to-cyan-600/20 border-emerald-500/30"
        >
          <div className="flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-emerald-400" />
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats.totalProjects}</p>
              <p className="text-sm text-emerald-200/80">Prosjekter</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6 bg-gradient-to-br from-green-600/20 via-emerald-600/15 to-teal-600/20 border-green-500/30"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats.activeProjects}</p>
              <p className="text-sm text-green-200/80">Aktive</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6 bg-gradient-to-br from-violet-600/20 via-purple-600/15 to-fuchsia-600/20 border-violet-500/30"
        >
          <div className="flex items-center gap-3">
            <Calculator className="w-8 h-8 text-violet-400" />
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats.totalCalculators}</p>
              <p className="text-sm text-violet-200/80">Kalkyler</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6 bg-gradient-to-br from-amber-600/20 via-orange-600/15 to-yellow-600/20 border-amber-500/30"
        >
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-amber-400" />
            <div>
              <p className="text-2xl font-bold text-text-primary">{formatNumber(stats.totalValue)}</p>
              <p className="text-sm text-amber-200/80">Total verdi</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary">Siste prosjekter</h2>
            <Link to="/projects" className="text-primary-400 hover:text-primary-300 flex items-center gap-1 text-sm">
              Se alle <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="block p-3 rounded-lg bg-background-darker/50 hover:bg-background-darker transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-text-primary">{project.name}</h3>
                      <p className="text-sm text-text-muted">{getCustomerName(project.customerId)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-text-muted">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Ingen prosjekter ennå</p>
                <Link to="/projects" className="text-primary-400 hover:text-primary-300 text-sm">
                  Opprett ditt første prosjekt
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Calculators */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary">Siste kalkyler</h2>
            <Link to="/projects" className="text-primary-400 hover:text-primary-300 flex items-center gap-1 text-sm">
              Se alle <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentCalculators.length > 0 ? (
              recentCalculators.map((calculator) => (
                <Link
                  key={calculator.id}
                  to={`/projects/${calculator.projectId}/calculator/${calculator.id}`}
                  className="block p-3 rounded-lg bg-background-darker/50 hover:bg-background-darker transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-text-primary">{calculator.name}</h3>
                      <p className="text-sm text-text-muted">{getProjectName(calculator.projectId)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary-400">
                        {formatNumber(calculator.summary?.totalSum || 0)}
                      </p>
                      <p className="text-xs text-text-muted">
                        {new Date(calculator.updatedAt).toLocaleDateString('nb-NO')}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-text-muted">
                <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Ingen kalkyler ennå</p>
                <Link to="/projects" className="text-primary-400 hover:text-primary-300 text-sm">
                  Opprett din første kalkyle
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;