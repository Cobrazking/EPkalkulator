import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  Building2,
  Filter,
  RefreshCw,
  PieChart,
  Target
} from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';
import { formatNumber, formatPercent } from '../utils/calculations';

console.log('📊 Dashboard component loading...');

const Dashboard: React.FC = () => {
  console.log('🎨 Dashboard component rendering...');
  
  const { 
    getCurrentOrganizationCustomers, 
    getCurrentOrganizationProjects, 
    getCurrentOrganizationCalculators,
    currentOrganization,
    getCustomerById,
    getProjectById,
    state,
    refreshData
  } = useProject();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  console.log('🏢 Dashboard - currentOrganization:', currentOrganization);

  const customers = getCurrentOrganizationCustomers();
  const allProjects = getCurrentOrganizationProjects();
  const calculators = getCurrentOrganizationCalculators();

  console.log('📈 Dashboard - customers:', customers.length);
  console.log('📈 Dashboard - projects:', allProjects.length);
  console.log('📈 Dashboard - calculators:', calculators.length);

  // Filter projects by status
  const filteredProjects = statusFilter === 'all' 
    ? allProjects 
    : allProjects.filter(project => project.status === statusFilter);

  // Get calculators for filtered projects only
  const filteredCalculators = calculators.filter(calc => 
    filteredProjects.some(project => project.id === calc.projectId)
  );

  // Calculate advanced statistics
  const calculateAdvancedStats = () => {
    const totalValue = filteredCalculators.reduce((acc, calc) => acc + (calc.summary?.totalSum || 0), 0);
    const totalHours = filteredCalculators.reduce((acc, calc) => acc + (calc.summary?.timerTotalt || 0), 0);
    const totalProfit = filteredCalculators.reduce((acc, calc) => acc + (calc.summary?.fortjeneste || 0), 0);
    
    // Calculate average project value
    const averageProjectValue = filteredProjects.length > 0 ? totalValue / filteredProjects.length : 0;
    
    // Calculate average margin (dekningsgrad) across all calculators
    const calculatorsWithMargin = filteredCalculators.filter(calc => calc.summary?.totalSum > 0);
    const averageMargin = calculatorsWithMargin.length > 0 
      ? calculatorsWithMargin.reduce((acc, calc) => {
          const margin = calc.summary?.totalSum > 0 ? (calc.summary.fortjeneste / calc.summary.totalSum) * 100 : 0;
          return acc + margin;
        }, 0) / calculatorsWithMargin.length
      : 0;

    return {
      totalValue,
      totalHours,
      totalProfit,
      averageProjectValue,
      averageMargin
    };
  };

  const advancedStats = calculateAdvancedStats();

  const stats = {
    totalCustomers: customers.length,
    totalProjects: allProjects.length,
    activeProjects: allProjects.filter(p => p.status === 'active').length,
    totalCalculators: calculators.length,
    ...advancedStats
  };

  const recentProjects = filteredProjects
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const recentCalculators = filteredCalculators
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const getCustomerName = (customerId: string) => {
    const customer = getCustomerById(customerId);
    return customer?.name || 'Ukjent kunde';
  };

  const getProjectName = (projectId: string) => {
    const project = getProjectById(projectId);
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

  const getStatusCount = (status: string) => {
    return allProjects.filter(project => project.status === status).length;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  console.log('🎯 Dashboard rendering with currentOrganization:', currentOrganization);

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Laster dashboard...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Feil ved lasting av data</h2>
          <p className="text-text-muted mb-4">{state.error}</p>
          <button onClick={handleRefresh} className="btn-primary flex items-center gap-2 mx-auto">
            <RefreshCw size={16} />
            Prøv igjen
          </button>
        </div>
      </div>
    );
  }

  if (!currentOrganization) {
    console.log('⚠️ Dashboard - No current organization, showing fallback');
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-50" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Ingen organisasjon valgt</h2>
          <p className="text-text-muted mb-4">
            Du må velge eller opprette en organisasjon for å komme i gang.
          </p>
          <p className="text-sm text-text-muted">
            Bruk organisasjonsvelgeren i sidemenyen for å velge eller opprette en organisasjon.
          </p>
        </div>
      </div>
    );
  }

  console.log('✅ Dashboard - Rendering main content');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-muted mt-1 text-sm sm:text-base">
            Oversikt for {currentOrganization.name}
            {statusFilter !== 'all' && (
              <span className="ml-2 px-2 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs">
                Filtrert: {getStatusText(statusFilter)}
              </span>
            )}
          </p>
        </div>
        
        {/* Action buttons - responsive layout */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto"
            title="Oppdater data"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="sm:inline">{isRefreshing ? 'Oppdaterer...' : 'Oppdater'}</span>
          </button>
          <Link to="/customers" className="btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto">
            <Users size={16} />
            <span>Ny kunde</span>
          </Link>
          <Link to="/projects" className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
            <Plus size={16} />
            <span>Nytt prosjekt</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards - Improved mobile layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-blue-600/20 via-indigo-600/15 to-purple-600/20 border-blue-500/30 col-span-1"
        >
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-400 flex-shrink-0" />
            <div className="text-center sm:text-left">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary">{stats.totalCustomers}</p>
              <p className="text-xs sm:text-sm text-blue-200/80">Kunder</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-emerald-600/20 via-teal-600/15 to-cyan-600/20 border-emerald-500/30 col-span-1"
        >
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-emerald-400 flex-shrink-0" />
            <div className="text-center sm:text-left">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary">{stats.totalProjects}</p>
              <p className="text-xs sm:text-sm text-emerald-200/80">Prosjekter</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-green-600/20 via-emerald-600/15 to-teal-600/20 border-green-500/30 col-span-1"
        >
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-400 flex-shrink-0" />
            <div className="text-center sm:text-left">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary">{stats.activeProjects}</p>
              <p className="text-xs sm:text-sm text-green-200/80">Aktive</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-violet-600/20 via-purple-600/15 to-fuchsia-600/20 border-violet-500/30 col-span-1"
        >
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <Calculator className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-violet-400 flex-shrink-0" />
            <div className="text-center sm:text-left">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary">{stats.totalCalculators}</p>
              <p className="text-xs sm:text-sm text-violet-200/80">Kalkyler</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-orange-600/20 via-amber-600/15 to-yellow-600/20 border-orange-500/30 col-span-1"
        >
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-orange-400 flex-shrink-0" />
            <div className="text-center sm:text-left">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary">{formatNumber(stats.totalHours)}</p>
              <p className="text-xs sm:text-sm text-orange-200/80">
                Timer
                {statusFilter !== 'all' && (
                  <span className="block text-xs opacity-75">
                    ({getStatusText(statusFilter)})
                  </span>
                )}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-amber-600/20 via-orange-600/15 to-yellow-600/20 border-amber-500/30 col-span-1"
        >
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-amber-400 flex-shrink-0" />
            <div className="text-center sm:text-left">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary">{formatNumber(stats.totalValue)}</p>
              <p className="text-xs sm:text-sm text-amber-200/80">
                Total verdi
                {statusFilter !== 'all' && (
                  <span className="block text-xs opacity-75">
                    ({getStatusText(statusFilter)})
                  </span>
                )}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-green-600/20 via-emerald-600/15 to-teal-600/20 border-green-500/30 col-span-1"
        >
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-400 flex-shrink-0" />
            <div className="text-center sm:text-left">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary">{formatNumber(stats.totalProfit)}</p>
              <p className="text-xs sm:text-sm text-green-200/80">
                Fortjeneste
                {statusFilter !== 'all' && (
                  <span className="block text-xs opacity-75">
                    ({getStatusText(statusFilter)})
                  </span>
                )}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-cyan-600/20 via-blue-600/15 to-indigo-600/20 border-cyan-500/30 col-span-1"
        >
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <PieChart className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-cyan-400 flex-shrink-0" />
            <div className="text-center sm:text-left">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary">{formatPercent(stats.averageMargin)}</p>
              <p className="text-xs sm:text-sm text-cyan-200/80">
                Snitt margin
                {statusFilter !== 'all' && (
                  <span className="block text-xs opacity-75">
                    ({getStatusText(statusFilter)})
                  </span>
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Secondary Stats Row - Better mobile layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="card p-4 sm:p-6 bg-gradient-to-br from-purple-600/20 via-pink-600/15 to-rose-600/20 border-purple-500/30"
        >
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 flex-shrink-0" />
            <div>
              <p className="text-xl sm:text-2xl font-bold text-text-primary">{formatNumber(stats.averageProjectValue)}</p>
              <p className="text-xs sm:text-sm text-purple-200/80">
                Snitt prosjektverdi
                {statusFilter !== 'all' && (
                  <span className="block text-xs opacity-75">
                    ({getStatusText(statusFilter)})
                  </span>
                )}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="card p-4 sm:p-6 bg-gradient-to-br from-indigo-600/20 via-blue-600/15 to-cyan-600/20 border-indigo-500/30"
        >
          <div className="flex items-center gap-3">
            <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400 flex-shrink-0" />
            <div>
              <p className="text-xl sm:text-2xl font-bold text-text-primary">
                {stats.totalProjects > 0 ? formatNumber(stats.totalCalculators / stats.totalProjects) : '0'}
              </p>
              <p className="text-xs sm:text-sm text-indigo-200/80">
                Kalkyler per prosjekt
                {statusFilter !== 'all' && (
                  <span className="block text-xs opacity-75">
                    ({getStatusText(statusFilter)})
                  </span>
                )}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="card p-4 sm:p-6 bg-gradient-to-br from-teal-600/20 via-green-600/15 to-emerald-600/20 border-teal-500/30"
        >
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-teal-400 flex-shrink-0" />
            <div>
              <p className="text-xl sm:text-2xl font-bold text-text-primary">
                {stats.totalProjects > 0 ? formatNumber(stats.totalHours / stats.totalProjects) : '0'}
              </p>
              <p className="text-xs sm:text-sm text-teal-200/80">
                Timer per prosjekt
                {statusFilter !== 'all' && (
                  <span className="block text-xs opacity-75">
                    ({getStatusText(statusFilter)})
                  </span>
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects with Status Filter */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2 }}
          className="card p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-text-primary">Siste prosjekter</h2>
            <Link to="/projects" className="text-primary-400 hover:text-primary-300 flex items-center gap-1 text-sm">
              Se alle <ArrowRight size={14} />
            </Link>
          </div>

          {/* Status Filter - Better mobile layout */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={16} className="text-text-muted" />
              <span className="text-sm text-text-muted">Filtrer etter status:</span>
            </div>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'bg-background-darker/50 text-text-muted hover:text-text-primary border border-border'
                }`}
              >
                Alle ({allProjects.length})
              </button>
              <button
                onClick={() => setStatusFilter('planning')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === 'planning'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-background-darker/50 text-text-muted hover:text-text-primary border border-border'
                }`}
              >
                Planlegging ({getStatusCount('planning')})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === 'active'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-background-darker/50 text-text-muted hover:text-text-primary border border-border'
                }`}
              >
                Aktiv ({getStatusCount('active')})
              </button>
              <button
                onClick={() => setStatusFilter('on-hold')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === 'on-hold'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-background-darker/50 text-text-muted hover:text-text-primary border border-border'
                }`}
              >
                På vent ({getStatusCount('on-hold')})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors col-span-2 sm:col-span-1 ${
                  statusFilter === 'completed'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-background-darker/50 text-text-muted hover:text-text-primary border border-border'
                }`}
              >
                Fullført ({getStatusCount('completed')})
              </button>
            </div>
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
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-text-primary truncate">{project.name}</h3>
                      <p className="text-sm text-text-muted truncate">{getCustomerName(project.customerId)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-text-muted">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>
                  {statusFilter === 'all' 
                    ? 'Ingen prosjekter ennå' 
                    : `Ingen prosjekter med status "${getStatusText(statusFilter)}"`
                  }
                </p>
                {statusFilter === 'all' ? (
                  <Link to="/projects" className="text-primary-400 hover:text-primary-300 text-sm">
                    Opprett ditt første prosjekt
                  </Link>
                ) : (
                  <button 
                    onClick={() => setStatusFilter('all')}
                    className="text-primary-400 hover:text-primary-300 text-sm"
                  >
                    Vis alle prosjekter
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Calculators */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.3 }}
          className="card p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-text-primary">
              Siste kalkyler
              {statusFilter !== 'all' && (
                <span className="block text-sm text-text-muted font-normal">
                  Fra {getStatusText(statusFilter).toLowerCase()} prosjekter
                </span>
              )}
            </h2>
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
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-text-primary truncate">{calculator.name}</h3>
                      <p className="text-sm text-text-muted truncate">{getProjectName(calculator.projectId)}</p>
                    </div>
                    <div className="text-right ml-2 flex-shrink-0">
                      <p className="font-semibold text-primary-400 text-sm">
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
                <p>
                  {statusFilter === 'all' 
                    ? 'Ingen kalkyler ennå' 
                    : `Ingen kalkyler for ${getStatusText(statusFilter).toLowerCase()} prosjekter`
                  }
                </p>
                {statusFilter === 'all' ? (
                  <Link to="/projects" className="text-primary-400 hover:text-primary-300 text-sm">
                    Opprett din første kalkyle
                  </Link>
                ) : (
                  <button 
                    onClick={() => setStatusFilter('all')}
                    className="text-primary-400 hover:text-primary-300 text-sm"
                  >
                    Vis alle kalkyler
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

console.log('✅ Dashboard component loaded');

export default Dashboard;