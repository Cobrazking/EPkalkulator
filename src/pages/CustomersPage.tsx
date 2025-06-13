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
  BarChart3
} from 'lucide-react';
import { useProject, Customer } from '../contexts/ProjectContext';
import CustomerModal from '../components/modals/CustomerModal';
import { formatNumber } from '../utils/calculations';

const CustomersPage: React.FC = () => {
  const { 
    getCurrentOrganizationCustomers, 
    deleteCustomer, 
    getProjectsByCustomer, 
    getCalculatorsByProject,
    currentOrganization 
  } = useProject();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const customers = getCurrentOrganizationCustomers();
  
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    const projects = getProjectsByCustomer(customerId);
    
    const statusCounts = {
      planning: projects.filter(p => p.status === 'planning').length,
      active: projects.filter(p => p.status === 'active').length,
      'on-hold': projects.filter(p => p.status === 'on-hold').length,
      completed: projects.filter(p => p.status === 'completed').length
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
    let lastActivity = '';

    projects.forEach(project => {
      const calculators = getCalculatorsByProject(project.id);
      totalCalculators += calculators.length;
      
      const projectValue = calculators.reduce((acc, calc) => acc + (calc.summary?.totalSum || 0), 0);
      const projectHours = calculators.reduce((acc, calc) => acc + (calc.summary?.timerTotalt || 0), 0);
      
      statusValues[project.status as keyof typeof statusValues] += projectValue;
      statusValues.total += projectValue;
      totalHours += projectHours;

      // Find latest activity
      const latestCalc = calculators.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      
      if (latestCalc && (!lastActivity || new Date(latestCalc.updatedAt) > new Date(lastActivity))) {
        lastActivity = latestCalc.updatedAt;
      }
    });

    return {
      totalProjects: projects.length,
      statusCounts,
      statusValues,
      totalCalculators,
      totalHours,
      lastActivity: lastActivity ? new Date(lastActivity).toLocaleDateString('nb-NO') : 'Ingen aktivitet',
      averageProjectValue: projects.length > 0 ? statusValues.total / projects.length : 0
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
          <p className="text-text-muted mt-1">Administrer kunder for {currentOrganization.name}</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Ny kunde
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
        <input
          type="text"
          placeholder="Søk etter kunder..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-background-lighter border border-border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
        />
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredCustomers.map((customer, index) => {
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
                    <span>{customer.email}</span>
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

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 rounded-lg border border-emerald-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign size={16} className="text-emerald-400" />
                    <span className="text-xs text-emerald-200/80">Total verdi</span>
                  </div>
                  <p className="text-lg font-bold text-text-primary">{formatNumber(stats.statusValues.total)}</p>
                </div>

                <div className="p-3 bg-gradient-to-br from-violet-600/20 to-purple-600/20 rounded-lg border border-violet-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <FolderOpen size={16} className="text-violet-400" />
                    <span className="text-xs text-violet-200/80">Prosjekter</span>
                  </div>
                  <p className="text-lg font-bold text-text-primary">{stats.totalProjects}</p>
                </div>

                <div className="p-3 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-lg border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Calculator size={16} className="text-blue-400" />
                    <span className="text-xs text-blue-200/80">Kalkyler</span>
                  </div>
                  <p className="text-lg font-bold text-text-primary">{stats.totalCalculators}</p>
                </div>

                <div className="p-3 bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-lg border border-amber-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={16} className="text-amber-400" />
                    <span className="text-xs text-amber-200/80">Timer</span>
                  </div>
                  <p className="text-lg font-bold text-text-primary">{formatNumber(stats.totalHours)}</p>
                </div>
              </div>

              {/* Project Status Overview */}
              {stats.totalProjects > 0 && (
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

              {/* Additional Insights */}
              <div className="pt-4 border-t border-border">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-text-muted">Snitt per prosjekt</span>
                    <p className="font-semibold text-text-primary">
                      {formatNumber(stats.averageProjectValue)}
                    </p>
                  </div>
                  <div>
                    <span className="text-text-muted">Siste aktivitet</span>
                    <p className="font-semibold text-text-primary">{stats.lastActivity}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-50" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            {searchTerm ? 'Ingen kunder funnet' : 'Ingen kunder ennå'}
          </h3>
          <p className="text-text-muted mb-4">
            {searchTerm 
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