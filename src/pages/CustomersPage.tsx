import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building,
  FolderOpen,
  Calculator,
  TrendingUp,
  Clock,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Target,
  Filter,
  ArrowDownAZ,
  ArrowUpZA,
  ArrowDownUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useProject, Customer } from '../contexts/ProjectContext';
import CustomerModal from '../components/modals/CustomerModal';
import { formatNumber, formatPercent } from '../utils/calculations';

const CustomersPage: React.FC = () => {
  const { 
    getCurrentOrganizationCustomers, 
    deleteCustomer, 
    getProjectsByCustomer, 
    getCalculatorsByProject,
    currentOrganization 
  } = useProject();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('name-asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const customers = getCurrentOrganizationCustomers();
  
  // Filter customers based on search term and status filter
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort customers based on selected sort option
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch (sortOption) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'created-desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'created-asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'updated-desc':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'updated-asc':
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      case 'projects-desc': {
        const projectsA = getProjectsByCustomer(a.id).length;
        const projectsB = getProjectsByCustomer(b.id).length;
        return projectsB - projectsA;
      }
      case 'projects-asc': {
        const projectsA = getProjectsByCustomer(a.id).length;
        const projectsB = getProjectsByCustomer(b.id).length;
        return projectsA - projectsB;
      }
      case 'value-desc': {
        const valueA = getCustomerStats(a.id).statusValues.total;
        const valueB = getCustomerStats(b.id).statusValues.total;
        return valueB - valueA;
      }
      case 'value-asc': {
        const valueA = getCustomerStats(a.id).statusValues.total;
        const valueB = getCustomerStats(b.id).statusValues.total;
        return valueA - valueB;
      }
      default:
        return 0;
    }
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = itemsPerPage === 0 
    ? sortedCustomers 
    : sortedCustomers.slice(indexOfFirstItem, indexOfLastItem);
  
  const totalPages = itemsPerPage === 0 ? 1 : Math.ceil(sortedCustomers.length / itemsPerPage);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortOption, itemsPerPage]);

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    if (window.confirm(`Er du sikker på at du vil slette kunden "${customer.name}"?`)) {
      deleteCustomer(customer.id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const getCustomerStats = (customerId: string) => {
    const allProjects = getProjectsByCustomer(customerId);
    
    // Filter projects by status if a filter is applied
    const projects = statusFilter === 'all' 
      ? allProjects 
      : allProjects.filter(project => project.status === statusFilter);
    
    const statusCounts = {
      planning: allProjects.filter(p => p.status === 'planning').length,
      active: allProjects.filter(p => p.status === 'active').length,
      'on-hold': allProjects.filter(p => p.status === 'on-hold').length,
      completed: allProjects.filter(p => p.status === 'completed').length
    };

    const statusValues = {
      planning: 0,
      active: 0,
      'on-hold': 0,
      completed: 0,
      total: 0
    };

    let totalCalculators = 0;
    let totalHours = 0;
    let totalProfit = 0;
    let lastActivity = '';

    // Calculate advanced statistics - use filtered projects for calculations
    const calculatorsWithMargin: any[] = [];

    projects.forEach(project => {
      const calculators = getCalculatorsByProject(project.id);
      totalCalculators += calculators.length;
      
      const projectValue = calculators.reduce((acc, calc) => acc + (calc.summary?.totalSum || 0), 0);
      const projectHours = calculators.reduce((acc, calc) => acc + (calc.summary?.timerTotalt || 0), 0);
      const projectProfit = calculators.reduce((acc, calc) => acc + (calc.summary?.fortjeneste || 0), 0);
      
      statusValues[project.status as keyof typeof statusValues] += projectValue;
      statusValues.total += projectValue;
      totalHours += projectHours;
      totalProfit += projectProfit;

      // Collect calculators for margin calculation
      calculators.forEach(calc => {
        if (calc.summary?.totalSum > 0) {
          calculatorsWithMargin.push(calc);
        }
      });

      // Find latest activity from all projects (not just filtered ones)
      const latestCalc = calculators.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      
      if (latestCalc && (!lastActivity || new Date(latestCalc.updatedAt) > new Date(lastActivity))) {
        lastActivity = latestCalc.updatedAt;
      }
    });

    // Calculate average margin (dekningsgrad)
    const averageMargin = calculatorsWithMargin.length > 0 
      ? calculatorsWithMargin.reduce((acc, calc) => {
          const margin = calc.summary?.totalSum > 0 ? (calc.summary.fortjeneste / calc.summary.totalSum) * 100 : 0;
          return acc + margin;
        }, 0) / calculatorsWithMargin.length
      : 0;

    return {
      totalProjects: projects.length, // Use filtered projects count
      allProjectsCount: allProjects.length, // Keep track of all projects for display
      statusCounts,
      statusValues,
      totalCalculators,
      totalHours,
      totalProfit,
      averageMargin,
      lastActivity: lastActivity ? new Date(lastActivity).toLocaleDateString('nb-NO') : 'Ingen aktivitet',
      averageProjectValue: projects.length > 0 ? statusValues.total / projects.length : 0,
      calculatorsPerProject: projects.length > 0 ? totalCalculators / projects.length : 0,
      hoursPerProject: projects.length > 0 ? totalHours / projects.length : 0
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'completed': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'on-hold': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'planning': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      default: return 'text-text-muted bg-background-darker border-border';
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
    return customers.reduce((count, customer) => {
      const projects = getProjectsByCustomer(customer.id);
      return count + projects.filter(project => project.status === status).length;
    }, 0);
  };

  if (!currentOrganization) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-text-primary mb-2">Ingen organisasjon valgt</h2>
        <p className="text-text-muted mb-4">Du må velge en organisasjon for å administrere kunder.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Kunder</h1>
          <p className="text-text-muted mt-1">
            Administrer kunder for {currentOrganization.name}
            {statusFilter !== 'all' && (
              <span className="ml-2 px-2 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs">
                Filtrert: {getStatusText(statusFilter)}
              </span>
            )}
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Ny kunde
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
          <input
            type="text"
            placeholder="Søk etter kunder..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-background-lighter border border-border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2 text-sm text-text-muted whitespace-nowrap">
            <Filter size={16} />
            <span>Prosjektstatus:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'bg-background-darker/50 text-text-muted hover:text-text-primary border border-border'
              }`}
            >
              Alle ({customers.reduce((count, customer) => count + getProjectsByCustomer(customer.id).length, 0)})
            </button>
            <button
              onClick={() => setStatusFilter('planning')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === 'planning'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-background-darker/50 text-text-muted hover:text-text-primary border border-border'
              }`}
            >
              Planlegging ({getStatusCount('planning')})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === 'active'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-background-darker/50 text-text-muted hover:text-text-primary border border-border'
              }`}
            >
              Aktiv ({getStatusCount('active')})
            </button>
            <button
              onClick={() => setStatusFilter('on-hold')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === 'on-hold'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-background-darker/50 text-text-muted hover:text-text-primary border border-border'
              }`}
            >
              På vent ({getStatusCount('on-hold')})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === 'completed'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-background-darker/50 text-text-muted hover:text-text-primary border border-border'
              }`}
            >
              Fullført ({getStatusCount('completed')})
            </button>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-text-muted whitespace-nowrap">
            <ArrowDownUp size={16} />
            <span>Sorter etter:</span>
          </div>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-3 py-2 bg-background-lighter border border-border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent text-sm"
          >
            <option value="name-asc">Navn (A-Å)</option>
            <option value="name-desc">Navn (Å-A)</option>
            <option value="created-desc">Nyeste først</option>
            <option value="created-asc">Eldste først</option>
            <option value="updated-desc">Sist oppdatert</option>
            <option value="projects-desc">Flest prosjekter</option>
            <option value="projects-asc">Færrest prosjekter</option>
            <option value="value-desc">Høyeste verdi</option>
            <option value="value-asc">Laveste verdi</option>
          </select>
        </div>
      </div>

      {/* Pagination Controls - Top */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-background-lighter/50 p-3 rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">Viser</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-background-darker border border-border rounded px-2 py-1 text-sm"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="0">Alle</option>
          </select>
          <span className="text-sm text-text-muted">av {sortedCustomers.length} kunder</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || itemsPerPage === 0}
            className="p-1 rounded-md bg-background-darker/50 border border-border text-text-muted hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          
          <span className="text-sm text-text-muted">
            {itemsPerPage === 0 
              ? `Viser alle ${sortedCustomers.length} kunder` 
              : `Side ${currentPage} av ${totalPages}`
            }
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || itemsPerPage === 0}
            className="p-1 rounded-md bg-background-darker/50 border border-border text-text-muted hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {currentCustomers.map((customer, index) => {
          const stats = getCustomerStats(customer.id);
          
          return (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6 hover:shadow-hover transition-all duration-300"
            >
              {/* Customer Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{customer.name}</h3>
                    {customer.company && (
                      <p className="text-sm text-text-muted flex items-center gap-1">
                        <Building size={14} />
                        {customer.company}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="p-2 text-text-muted hover:text-primary-400 transition-colors rounded-lg hover:bg-background-darker/50"
                    title="Rediger kunde"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(customer)}
                    className="p-2 text-text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-background-darker/50"
                    title="Slett kunde"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2 mb-6">
                {customer.email && (
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Mail size={14} />
                    <span className="break-all">{customer.email}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Phone size={14} />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <MapPin size={14} />
                    <span>{customer.address}</span>
                  </div>
                )}
              </div>

              {/* Main Statistics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 rounded-lg border border-emerald-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign size={16} className="text-emerald-400" />
                    <span className="text-xs text-emerald-200/80">Total verdi</span>
                  </div>
                  <p className="text-lg font-bold text-text-primary">{formatNumber(stats.statusValues.total)}</p>
                  {statusFilter !== 'all' && (
                    <p className="text-xs text-emerald-200/60">({getStatusText(statusFilter)})</p>
                  )}
                </div>

                <div className="p-3 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-lg border border-green-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={16} className="text-green-400" />
                    <span className="text-xs text-green-200/80">Fortjeneste</span>
                  </div>
                  <p className="text-lg font-bold text-text-primary">{formatNumber(stats.totalProfit)}</p>
                  {statusFilter !== 'all' && (
                    <p className="text-xs text-green-200/60">({getStatusText(statusFilter)})</p>
                  )}
                </div>

                <div className="p-3 bg-gradient-to-br from-violet-600/20 to-purple-600/20 rounded-lg border border-violet-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <FolderOpen size={16} className="text-violet-400" />
                    <span className="text-xs text-violet-200/80">Prosjekter</span>
                  </div>
                  <p className="text-lg font-bold text-text-primary">
                    {statusFilter === 'all' ? stats.allProjectsCount : stats.totalProjects}
                  </p>
                  {statusFilter !== 'all' && stats.totalProjects !== stats.allProjectsCount && (
                    <p className="text-xs text-violet-200/60">av {stats.allProjectsCount} totalt</p>
                  )}
                </div>

                <div className="p-3 bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-lg border border-amber-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={16} className="text-amber-400" />
                    <span className="text-xs text-amber-200/80">Timer</span>
                  </div>
                  <p className="text-lg font-bold text-text-primary">{formatNumber(stats.totalHours)}</p>
                  {statusFilter !== 'all' && (
                    <p className="text-xs text-amber-200/60">({getStatusText(statusFilter)})</p>
                  )}
                </div>
              </div>

              {/* Advanced Statistics */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-lg border border-cyan-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <PieChart size={16} className="text-cyan-400" />
                    <span className="text-xs text-cyan-200/80">Snitt margin</span>
                  </div>
                  <p className="text-lg font-bold text-text-primary">{formatPercent(stats.averageMargin)}</p>
                </div>

                <div className="p-3 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Target size={16} className="text-purple-400" />
                    <span className="text-xs text-purple-200/80">Snitt prosjekt</span>
                  </div>
                  <p className="text-lg font-bold text-text-primary">{formatNumber(stats.averageProjectValue)}</p>
                </div>

                <div className="p-3 bg-gradient-to-br from-indigo-600/20 to-blue-600/20 rounded-lg border border-indigo-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Calculator size={16} className="text-indigo-400" />
                    <span className="text-xs text-indigo-200/80">Kalkyler/prosjekt</span>
                  </div>
                  <p className="text-lg font-bold text-text-primary">{formatNumber(stats.calculatorsPerProject)}</p>
                </div>

                <div className="p-3 bg-gradient-to-br from-teal-600/20 to-green-600/20 rounded-lg border border-teal-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={16} className="text-teal-400" />
                    <span className="text-xs text-teal-200/80">Timer/prosjekt</span>
                  </div>
                  <p className="text-lg font-bold text-text-primary">{formatNumber(stats.hoursPerProject)}</p>
                </div>
              </div>

              {/* Project Status Overview - Only show if customer has projects */}
              {stats.allProjectsCount > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 size={16} className="text-text-muted" />
                    <h4 className="text-sm font-medium text-text-primary">Prosjektstatus</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(stats.statusCounts).map(([status, count]) => (
                      count > 0 && (
                        <div key={status} className="flex items-center justify-between p-2 bg-background-darker/50 rounded-lg">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                            {getStatusText(status)}
                          </span>
                          <div className="text-right">
                            <div className="text-xs text-text-muted">{count} prosjekt{count !== 1 ? 'er' : ''}</div>
                            <div className="text-sm font-semibold text-primary-400">
                              {formatNumber(stats.statusValues[status as keyof typeof stats.statusValues])}
                            </div>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Footer with last activity */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-text-muted">
                    <Calendar size={14} />
                    <span>Siste aktivitet</span>
                  </div>
                  <span className="font-semibold text-text-primary">{stats.lastActivity}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination Controls - Bottom */}
      {sortedCustomers.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-background-lighter/50 p-3 rounded-lg border border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">Viser</span>
            <span className="font-medium text-text-primary">
              {itemsPerPage === 0 
                ? sortedCustomers.length 
                : `${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, sortedCustomers.length)}`
              }
            </span>
            <span className="text-sm text-text-muted">av {sortedCustomers.length} kunder</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1 || itemsPerPage === 0}
              className="p-1 rounded-md bg-background-darker/50 border border-border text-text-muted hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              title="Første side"
            >
              <div className="flex">
                <ChevronLeft size={14} />
                <ChevronLeft size={14} className="-ml-2" />
              </div>
            </button>
            
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || itemsPerPage === 0}
              className="p-1 rounded-md bg-background-darker/50 border border-border text-text-muted hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              title="Forrige side"
            >
              <ChevronLeft size={16} />
            </button>
            
            {/* Page numbers */}
            {itemsPerPage > 0 && totalPages <= 7 ? (
              // Show all page numbers if there are 7 or fewer
              [...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-md text-sm ${
                    currentPage === i + 1
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                      : 'bg-background-darker/50 text-text-muted hover:text-text-primary border border-border'
                  }`}
                >
                  {i + 1}
                </button>
              ))
            ) : itemsPerPage > 0 ? (
              // Show limited page numbers with ellipsis for many pages
              <>
                {/* Always show first page */}
                {currentPage > 3 && (
                  <button
                    onClick={() => setCurrentPage(1)}
                    className="w-8 h-8 rounded-md text-sm bg-background-darker/50 text-text-muted hover:text-text-primary border border-border"
                  >
                    1
                  </button>
                )}
                
                {/* Show ellipsis if not showing first pages */}
                {currentPage > 4 && (
                  <span className="w-8 h-8 flex items-center justify-center text-text-muted">...</span>
                )}
                
                {/* Show current page and surrounding pages */}
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Show current page and 1 page before and after
                  if (
                    pageNum === currentPage ||
                    pageNum === currentPage - 1 ||
                    pageNum === currentPage + 1
                  ) {
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-md text-sm ${
                          currentPage === pageNum
                            ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                            : 'bg-background-darker/50 text-text-muted hover:text-text-primary border border-border'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}
                
                {/* Show ellipsis if not showing last pages */}
                {currentPage < totalPages - 3 && (
                  <span className="w-8 h-8 flex items-center justify-center text-text-muted">...</span>
                )}
                
                {/* Always show last page */}
                {currentPage < totalPages - 2 && (
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="w-8 h-8 rounded-md text-sm bg-background-darker/50 text-text-muted hover:text-text-primary border border-border"
                  >
                    {totalPages}
                  </button>
                )}
              </>
            ) : null}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || itemsPerPage === 0}
              className="p-1 rounded-md bg-background-darker/50 border border-border text-text-muted hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              title="Neste side"
            >
              <ChevronRight size={16} />
            </button>
            
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || itemsPerPage === 0}
              className="p-1 rounded-md bg-background-darker/50 border border-border text-text-muted hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              title="Siste side"
            >
              <div className="flex">
                <ChevronRight size={14} />
                <ChevronRight size={14} className="-ml-2" />
              </div>
            </button>
          </div>
        </div>
      )}

      {sortedCustomers.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-50" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            {searchTerm || statusFilter !== 'all' ? 'Ingen kunder funnet' : 'Ingen kunder ennå'}
          </h3>
          <p className="text-text-muted mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'Prøv å endre søkekriteriene dine'
              : 'Kom i gang ved å legge til din første kunde'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <Plus size={16} />
              Legg til kunde
            </button>
          )}
        </div>
      )}

      <CustomerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        customer={editingCustomer}
      />
    </div>
  );
};

export default CustomersPage;