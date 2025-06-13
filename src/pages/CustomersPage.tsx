import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, User, Mail, Phone, MapPin, Building } from 'lucide-react';
import { useProject, Customer } from '../contexts/ProjectContext';
import CustomerModal from '../components/modals/CustomerModal';

const CustomersPage: React.FC = () => {
  const { getCurrentOrganizationCustomers, deleteCustomer, getProjectsByCustomer, currentOrganization } = useProject();
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

  const getProjectCount = (customerId: string) => {
    return getProjectsByCustomer(customerId).length;
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer, index) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6 hover:shadow-hover transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{customer.name}</h3>
                  {customer.company && (
                    <p className="text-sm text-text-muted">{customer.company}</p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(customer)}
                  className="p-2 text-text-muted hover:text-primary-400 transition-colors"
                  title="Rediger kunde"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(customer)}
                  className="p-2 text-text-muted hover:text-red-400 transition-colors"
                  title="Slett kunde"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
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

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Prosjekter</span>
                <span className="font-semibold text-primary-400">{getProjectCount(customer.id)}</span>
              </div>
            </div>
          </motion.div>
        ))}
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