import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  Calculator, 
  Settings, 
  Menu,
  X,
  Building2,
  ChevronDown,
  Plus,
  Check,
  User,
  LogOut,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import { useAuth } from '../auth/AuthProvider';
import OrganizationModal from '../modals/OrganizationModal';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { state, currentOrganization, setCurrentOrganization } = useProject();
  const { user, signOut } = useAuth();
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/customers', icon: Users, label: 'Kunder' },
    { path: '/projects', icon: FolderOpen, label: 'Prosjekter' },
    { path: '/settings', icon: Settings, label: 'Innstillinger' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.org-dropdown-container')) {
        setIsOrgDropdownOpen(false);
      }
      if (!target.closest('.user-dropdown-container')) {
        setIsUserDropdownOpen(false);
      }
    };

    if (isOrgDropdownOpen || isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOrgDropdownOpen, isUserDropdownOpen]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      onToggle();
    }
  }, [location.pathname, isOpen, onToggle]);

  const handleOrganizationChange = (orgId: string) => {
    setCurrentOrganization(orgId);
    setIsOrgDropdownOpen(false);
  };

  const handleNewOrganization = () => {
    setIsOrgModalOpen(true);
    setIsOrgDropdownOpen(false);
  };

  const handleCloseModal = () => {
    setIsOrgModalOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserDropdownOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Get user's initials for avatar
  const getUserInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  // Get user display name (part before @)
  const getUserDisplayName = (email: string) => {
    return email.split('@')[0];
  };

  // Handle menu item click - close sidebar on mobile
  const handleMenuItemClick = () => {
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl bg-background-lighter border border-border text-text-primary hover:bg-background transition-colors shadow-lg"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:fixed
          top-0 left-0 z-40 h-full w-72 lg:w-80
          bg-background-lighter/95 backdrop-blur-xl border-r border-border
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-4 lg:mb-6">
            <div className="p-2 lg:p-3 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl shadow-lg">
              <Building2 className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg lg:text-xl font-bold text-text-primary">EPKalk</h1>
              <p className="text-xs text-text-muted">Kalkyleverktøy</p>
            </div>
          </div>

          {/* Organization Selector */}
          <div className="relative org-dropdown-container">
            <button
              onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              disabled={state.loading}
              className="w-full flex items-center justify-between p-3 lg:p-4 bg-gradient-to-r from-background-darker/80 to-background-darker/60 rounded-xl border border-border hover:border-primary-500/50 transition-all duration-200 group shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
                <div className="p-1.5 lg:p-2 bg-primary-500/20 rounded-lg border border-primary-500/30">
                  {state.loading ? (
                    <Loader2 size={14} className="lg:w-4 lg:h-4 text-primary-400 animate-spin" />
                  ) : (
                    <Building2 size={14} className="lg:w-4 lg:h-4 text-primary-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-xs lg:text-sm font-semibold text-text-primary truncate">
                    {state.loading ? 'Laster...' : (currentOrganization?.name || 'Velg organisasjon')}
                  </div>
                  {currentOrganization?.description ? (
                    <div className="text-xs text-text-muted truncate mt-0.5">
                      {currentOrganization.description}
                    </div>
                  ) : (
                    <div className="text-xs text-text-muted">
                      {currentOrganization ? 'Ingen beskrivelse' : 'Klikk for å velge'}
                    </div>
                  )}
                </div>
              </div>
              <ChevronDown 
                size={14} 
                className={`text-text-muted transition-all duration-200 flex-shrink-0 group-hover:text-primary-400 ${
                  isOrgDropdownOpen ? 'rotate-180 text-primary-400' : ''
                }`} 
              />
            </button>

            <AnimatePresence>
              {isOrgDropdownOpen && !state.loading && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-background-lighter/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl z-50 max-h-80 overflow-hidden"
                >
                  <div className="p-2 lg:p-3">
                    {/* Header */}
                    <div className="px-2 lg:px-3 py-2 border-b border-border mb-2">
                      <h3 className="text-xs lg:text-sm font-semibold text-text-primary">Organisasjoner</h3>
                      <p className="text-xs text-text-muted">Velg organisasjon</p>
                    </div>

                    {/* Organizations List */}
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {state.organizations.length > 0 ? (
                        state.organizations.map((org) => (
                          <motion.div 
                            key={org.id} 
                            className="group"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.1 }}
                          >
                            <button
                              onClick={() => handleOrganizationChange(org.id)}
                              className={`w-full text-left p-2 lg:p-3 rounded-lg transition-all duration-200 border ${
                                currentOrganization?.id === org.id
                                  ? 'border-primary-500/50 bg-gradient-to-r from-primary-500/20 to-purple-600/20 shadow-md'
                                  : 'border-transparent hover:border-border-light hover:bg-background-darker/50'
                              }`}
                            >
                              <div className="flex items-center gap-2 lg:gap-3">
                                <div className={`p-1 lg:p-1.5 rounded-lg ${
                                  currentOrganization?.id === org.id
                                    ? 'bg-primary-500/30 border border-primary-500/50'
                                    : 'bg-background-darker/50'
                                }`}>
                                  <Building2 size={12} className={`lg:w-3.5 lg:h-3.5 ${
                                    currentOrganization?.id === org.id ? 'text-primary-400' : 'text-text-muted'
                                  }`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className={`text-xs lg:text-sm font-medium truncate flex items-center gap-2 ${
                                    currentOrganization?.id === org.id ? 'text-primary-400' : 'text-text-primary'
                                  }`}>
                                    {org.name}
                                    {currentOrganization?.id === org.id && (
                                      <Check size={10} className="lg:w-3 lg:h-3 text-primary-400 flex-shrink-0" />
                                    )}
                                  </div>
                                  {org.description && (
                                    <div className="text-xs text-text-muted truncate mt-0.5">
                                      {org.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          </motion.div>
                        ))
                      ) : (
                        <div className="p-4 lg:p-6 text-center text-text-muted">
                          <Building2 className="w-8 h-8 lg:w-12 lg:h-12 mx-auto mb-3 opacity-50" />
                          <p className="text-xs lg:text-sm font-medium mb-1">Ingen organisasjoner</p>
                          <p className="text-xs">Opprett din første organisasjon</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Add New Organization Button */}
                    <div className="border-t border-border mt-2 lg:mt-3 pt-2 lg:pt-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNewOrganization}
                        className="w-full text-left p-2 lg:p-3 rounded-lg bg-gradient-to-r from-primary-500/10 to-purple-600/10 border border-primary-500/30 hover:from-primary-500/20 hover:to-purple-600/20 text-primary-400 flex items-center gap-2 lg:gap-3 transition-all duration-200 group"
                      >
                        <div className="p-1 lg:p-1.5 bg-primary-500/20 rounded-lg border border-primary-500/30 group-hover:bg-primary-500/30">
                          <Plus size={12} className="lg:w-3.5 lg:h-3.5 text-primary-400" />
                        </div>
                        <div>
                          <div className="text-xs lg:text-sm font-semibold">Ny organisasjon</div>
                          <div className="text-xs text-primary-400/70">Opprett en ny organisasjon</div>
                        </div>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 lg:p-4">
          <ul className="space-y-1 lg:space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={handleMenuItemClick}
                    className={`
                      flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl transition-all duration-200 group
                      ${active 
                        ? 'bg-gradient-to-r from-primary-500/20 to-purple-600/20 text-primary-400 border border-primary-500/30 shadow-md' 
                        : 'text-text-secondary hover:text-text-primary hover:bg-background-darker/50 hover:shadow-md'
                      }
                    `}
                  >
                    <Icon size={18} className={`lg:w-5 lg:h-5 ${active ? 'text-primary-400' : 'group-hover:text-primary-400 transition-colors'}`} />
                    <span className="text-sm lg:text-base font-semibold">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-3 lg:p-4 border-t border-border">
          <div className="relative user-dropdown-container">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="w-full flex items-center gap-2 lg:gap-3 p-2.5 lg:p-3 rounded-xl bg-background-darker/50 hover:bg-background-darker transition-all duration-200 group"
            >
              {/* User Avatar */}
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs lg:text-sm shadow-md">
                {user?.email ? getUserInitials(user.email) : <User size={14} className="lg:w-4 lg:h-4" />}
              </div>
              
              {/* User Info */}
              <div className="flex-1 text-left min-w-0">
                <div className="text-xs lg:text-sm font-medium text-text-primary truncate">
                  {user?.email ? getUserDisplayName(user.email) : 'Bruker'}
                </div>
                <div className="text-xs text-text-muted truncate">
                  {user?.email || 'Ikke innlogget'}
                </div>
              </div>
              
              {/* Dropdown Arrow */}
              <ChevronUp 
                size={14} 
                className={`text-text-muted transition-all duration-200 group-hover:text-primary-400 ${
                  isUserDropdownOpen ? 'rotate-180 text-primary-400' : ''
                }`} 
              />
            </button>

            {/* User Dropdown */}
            <AnimatePresence>
              {isUserDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full left-0 right-0 mb-2 bg-background-lighter/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-2">
                    {/* User Info Header */}
                    <div className="px-2 lg:px-3 py-2 border-b border-border mb-2">
                      <div className="flex items-center gap-2 lg:gap-3">
                        <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                          {user?.email ? getUserInitials(user.email) : <User size={10} className="lg:w-3 lg:h-3" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs lg:text-sm font-medium text-text-primary truncate">
                            {user?.email ? getUserDisplayName(user.email) : 'Bruker'}
                          </div>
                          <div className="text-xs text-text-muted truncate">
                            {user?.email || 'Ikke innlogget'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sign Out Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSignOut}
                      className="w-full text-left p-2.5 lg:p-3 rounded-lg hover:bg-red-500/10 text-red-400 flex items-center gap-2 lg:gap-3 transition-all duration-200 group"
                    >
                      <LogOut size={14} className="lg:w-4 lg:h-4 text-red-400" />
                      <span className="text-xs lg:text-sm font-medium">Logg ut</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 lg:p-4 border-t border-border">
          <div className="text-xs text-text-muted text-center space-y-1">
            <p className="font-semibold">© 2025 EPKalk</p>
            <p>Versjon 1.0.0</p>
          </div>
        </div>
      </aside>

      <OrganizationModal
        isOpen={isOrgModalOpen}
        onClose={handleCloseModal}
        organization={null}
      />
    </>
  );
};

export default Sidebar;