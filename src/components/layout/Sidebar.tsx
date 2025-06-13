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
  Check
} from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import OrganizationModal from '../modals/OrganizationModal';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { state, currentOrganization, setCurrentOrganization } = useProject();
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.org-dropdown-container')) {
        setIsOrgDropdownOpen(false);
      }
    };

    if (isOrgDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOrgDropdownOpen]);

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
          top-0 left-0 z-40 h-full w-80
          bg-background-lighter/95 backdrop-blur-xl border-r border-border
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">EPKalk</h1>
              <p className="text-xs text-text-muted">Kalkyleverktøy</p>
            </div>
          </div>

          {/* Organization Selector */}
          <div className="relative org-dropdown-container">
            <button
              onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-background-darker/80 to-background-darker/60 rounded-xl border border-border hover:border-primary-500/50 transition-all duration-200 group shadow-md hover:shadow-lg"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="p-2 bg-primary-500/20 rounded-lg border border-primary-500/30">
                  <Building2 size={16} className="text-primary-400" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-sm font-semibold text-text-primary truncate">
                    {currentOrganization?.name || 'Velg organisasjon'}
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
                size={16} 
                className={`text-text-muted transition-all duration-200 flex-shrink-0 group-hover:text-primary-400 ${
                  isOrgDropdownOpen ? 'rotate-180 text-primary-400' : ''
                }`} 
              />
            </button>

            <AnimatePresence>
              {isOrgDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-background-lighter/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl z-50 max-h-80 overflow-hidden"
                >
                  <div className="p-3">
                    {/* Header */}
                    <div className="px-3 py-2 border-b border-border mb-2">
                      <h3 className="text-sm font-semibold text-text-primary">Organisasjoner</h3>
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
                              className={`w-full text-left p-3 rounded-lg transition-all duration-200 border ${
                                currentOrganization?.id === org.id
                                  ? 'border-primary-500/50 bg-gradient-to-r from-primary-500/20 to-purple-600/20 shadow-md'
                                  : 'border-transparent hover:border-border-light hover:bg-background-darker/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-lg ${
                                  currentOrganization?.id === org.id
                                    ? 'bg-primary-500/30 border border-primary-500/50'
                                    : 'bg-background-darker/50'
                                }`}>
                                  <Building2 size={14} className={
                                    currentOrganization?.id === org.id ? 'text-primary-400' : 'text-text-muted'
                                  } />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className={`font-medium truncate flex items-center gap-2 ${
                                    currentOrganization?.id === org.id ? 'text-primary-400' : 'text-text-primary'
                                  }`}>
                                    {org.name}
                                    {currentOrganization?.id === org.id && (
                                      <Check size={12} className="text-primary-400 flex-shrink-0" />
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
                        <div className="p-6 text-center text-text-muted">
                          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p className="text-sm font-medium mb-1">Ingen organisasjoner</p>
                          <p className="text-xs">Opprett din første organisasjon</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Add New Organization Button */}
                    <div className="border-t border-border mt-3 pt-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNewOrganization}
                        className="w-full text-left p-3 rounded-lg bg-gradient-to-r from-primary-500/10 to-purple-600/10 border border-primary-500/30 hover:from-primary-500/20 hover:to-purple-600/20 text-primary-400 flex items-center gap-3 transition-all duration-200 group"
                      >
                        <div className="p-1.5 bg-primary-500/20 rounded-lg border border-primary-500/30 group-hover:bg-primary-500/30">
                          <Plus size={14} className="text-primary-400" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">Ny organisasjon</div>
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
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => window.innerWidth < 1024 && onToggle()}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                      ${active 
                        ? 'bg-gradient-to-r from-primary-500/20 to-purple-600/20 text-primary-400 border border-primary-500/30 shadow-md' 
                        : 'text-text-secondary hover:text-text-primary hover:bg-background-darker/50 hover:shadow-md'
                      }
                    `}
                  >
                    <Icon size={20} className={active ? 'text-primary-400' : 'group-hover:text-primary-400 transition-colors'} />
                    <span className="font-semibold">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
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