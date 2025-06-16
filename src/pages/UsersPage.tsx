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
  Shield,
  UserPlus,
  Crown,
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';
import UserModal, { OrganizationUser } from '../components/modals/UserModal';

const UsersPage: React.FC = () => {
  const { 
    getCurrentOrganizationUsers, 
    deleteUser, 
    currentOrganization 
  } = useProject();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'invite'>('create');
  const [editingUser, setEditingUser] = useState<OrganizationUser | null>(null);

  const users = getCurrentOrganizationUsers();
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive) ||
                         (statusFilter === 'registered' && user.authUserId) ||
                         (statusFilter === 'pending' && !user.authUserId);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEdit = (user: OrganizationUser) => {
    setEditingUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = (user: OrganizationUser) => {
    if (window.confirm(`Er du sikker på at du vil slette brukeren "${user.name}"?`)) {
      deleteUser(user.id);
    }
  };

  const handleInvite = () => {
    setEditingUser(null);
    setModalMode('invite');
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown size={16} className="text-yellow-400" />;
      case 'manager': return <SettingsIcon size={16} className="text-blue-400" />;
      case 'user': return <User size={16} className="text-green-400" />;
      default: return <User size={16} className="text-text-muted" />;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Manager';
      case 'user': return 'Bruker';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'manager': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'user': return 'text-green-400 bg-green-400/10 border-green-400/30';
      default: return 'text-text-muted bg-background-darker border-border';
    }
  };

  const getStatusIcon = (user: OrganizationUser) => {
    if (!user.isActive) {
      return <XCircle size={16} className="text-red-400" />;
    }
    if (user.authUserId) {
      return <CheckCircle size={16} className="text-green-400" />;
    }
    return <Clock size={16} className="text-yellow-400" />;
  };

  const getStatusText = (user: OrganizationUser) => {
    if (!user.isActive) return 'Inaktiv';
    if (user.authUserId) return 'Registrert';
    return 'Venter på registrering';
  };

  const getStatusColor = (user: OrganizationUser) => {
    if (!user.isActive) {
      return 'text-red-400 bg-red-400/10 border-red-400/30';
    }
    if (user.authUserId) {
      return 'text-green-400 bg-green-400/10 border-green-400/30';
    }
    return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (!currentOrganization) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-text-primary mb-2">Ingen organisasjon valgt</h2>
        <p className="text-text-muted mb-4">Du må velge en organisasjon for å administrere brukere.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Brukere</h1>
          <p className="text-text-muted mt-1">Administrer brukere for {currentOrganization.name}</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleInvite}
            className="btn-secondary flex items-center gap-2"
          >
            <UserPlus size={16} />
            Inviter bruker
          </button>
          <button
            onClick={handleCreate}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Ny bruker
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
          <input
            type="text"
            placeholder="Søk etter brukere..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-background-lighter border border-border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 bg-background-lighter border border-border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          >
            <option value="all">Alle roller</option>
            <option value="admin">Administrator</option>
            <option value="manager">Manager</option>
            <option value="user">Bruker</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-background-lighter border border-border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          >
            <option value="all">Alle statuser</option>
            <option value="active">Aktive</option>
            <option value="inactive">Inaktive</option>
            <option value="registered">Registrerte</option>
            <option value="pending">Venter på registrering</option>
          </select>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6 hover:shadow-hover transition-all duration-300"
          >
            {/* User Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    getUserInitials(user.name)
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">{user.name}</h3>
                  <div className="flex items-center gap-2">
                    {getRoleIcon(user.role)}
                    <span className="text-sm text-text-muted">{getRoleText(user.role)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(user)}
                  className="p-2 text-text-muted hover:text-primary-400 transition-colors rounded-lg hover:bg-background-darker/50"
                  title="Rediger bruker"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(user)}
                  className="p-2 text-text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-background-darker/50"
                  title="Slett bruker"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Mail size={14} />
                <span className="break-all">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <Phone size={14} />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>

            {/* Status and Role Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                {getRoleText(user.role)}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(user)}`}>
                {getStatusIcon(user)}
                {getStatusText(user)}
              </span>
            </div>

            {/* Footer with creation date */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-text-muted">
                  <Calendar size={14} />
                  <span>Lagt til</span>
                </div>
                <span className="font-semibold text-text-primary">
                  {new Date(user.createdAt).toLocaleDateString('nb-NO')}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-50" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? 'Ingen brukere funnet' : 'Ingen brukere ennå'}
          </h3>
          <p className="text-text-muted mb-4">
            {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
              ? 'Prøv å endre søkekriteriene dine'
              : 'Kom i gang ved å invitere eller legge til din første bruker'
            }
          </p>
          {!searchTerm && roleFilter === 'all' && statusFilter === 'all' && (
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleInvite}
                className="btn-secondary flex items-center gap-2"
              >
                <UserPlus size={16} />
                Inviter bruker
              </button>
              <button
                onClick={handleCreate}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={16} />
                Legg til bruker
              </button>
            </div>
          )}
        </div>
      )}

      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={editingUser}
        mode={modalMode}
      />
    </div>
  );
};

export default UsersPage;