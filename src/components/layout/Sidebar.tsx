import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Edit,
  Trash2
} from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import OrganizationModal from '../modals/OrganizationModal';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { state, currentOrganization, setCurrentOrganization, deleteOrganization } = useProject();
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState(null);

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

  const handleEditOrganization = (org: any, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingOrganization(org);
    setIsOrgModalOpen(true);
    setIsOrgDropdownOpen(false);
  };

  const handleDeleteOrganization = (org: any, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (state.organizations.length <= 1) {
      alert('Du kan ikke slette den siste organisasjonen.');
      return;
    }

    const confirmMessage = `Er du sikker på at du vil slette organisasjonen "${org.name}"?\n\nDette vil også slette alle tilhørende kunder, prosjekter og kalkyler. Denne handlingen kan ikke angres.`;
    
    if (window.confirm(confirmMessage)) {
      deleteOrganization(org.id);
      setIsOrgDropdownOpen(false);
    }
  };

  const handleNewOrganization = () => {
    setEditingOrganization(null);
    setIsOrgModalOpen(true);
    setIsOrgDropdownOpen(false);
  };

  const handleCloseModal = () => {
    setIsOrgModalOpen(false);
    setEditingOrganization(null);
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
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-md bg-background-lighter border border-border text-text-primary hover:bg-background transition-colors"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:fixed
          top-0 left-0 z-40 h-full w-64
          bg-background-lighter/95 backdrop-blur-xl border-r border-border
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-text-primary">EPKalk</h1>
              <p className="text-xs text-text-muted">Kalkyleverktøy</p>
            </div>
          </div>

          {/* Organization Selector */}
          <div className="relative org-dropdown-container">
            <button
              onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              className="w-full flex items-center justify-between p-3 bg-background-darker/50 rounded-lg border border-border hover:border-border-light transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Building2 size={16} className="text-primary-400 flex-shrink-0" />
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-sm font-medium text-text-primary truncate">
                    {currentOrganization?.name || 'Velg organisasjon'}
                  </div>
                  {currentOrganization?.description && (
                    <div className="text-xs text-text-muted truncate">
                      {currentOrganization.description}
                    </div>
                  )}
                </div>
              </div>
              <ChevronDown 
                size={16} 
                className={`text-text-muted transition-transform flex-shrink-0 group-hover:text-text-primary ${
                  isOrgDropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {isOrgDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-background-lighter border border-border rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto"
              >
                <div className="p-2">
                  {state.organizations.length > 0 ? (
                    state.organizations.map((org) => (
                      <div key={org.id} className="group mb-1">
                        <div className="flex items-stretch rounded-lg overflow-hidden border border-transparent hover:border-border-light transition-colors">
                          <button
                            onClick={() => handleOrganizationChange(org.id)}
                            className={`flex-1 text-left p-3 transition-colors min-w-0 rounded-l-lg ${
                              currentOrganization?.id === org.id
                                ? 'bg-primary-500/20 text-primary-400'
                                : 'hover:bg-background-darker/50 text-text-primary'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Building2 size={14} className="flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <div className="font-medium truncate">{org.name}</div>
                                {org.description && (
                                  <div className="text-xs text-text-muted truncate mt-0.5">
                                    {org.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                          
                          <div className="flex">
                            <button
                              onClick={(e) => handleEditOrganization(org, e)}
                              className={`flex-shrink-0 w-8 flex items-center justify-center transition-colors ${
                                currentOrganization?.id === org.id
                                  ? 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30'
                                  : 'bg-background-darker/30 text-text-muted hover:text-primary-400 hover:bg-background-darker/50'
                              }`}
                              title="Rediger organisasjon"
                            >
                              <Edit size={12} />
                            </button>
                            
                            {state.organizations.length > 1 && (
                              <button
                                onClick={(e) => handleDeleteOrganization(org, e)}
                                className={`flex-shrink-0 w-8 flex items-center justify-center transition-colors rounded-r-lg ${
                                  currentOrganization?.id === org.id
                                    ? 'bg-primary-500/20 text-red-400 hover:bg-red-500/20'
                                    : 'bg-background-darker/30 text-text-muted hover:text-red-400 hover:bg-red-500/10'
                                }`}
                                title="Slett organisasjon"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-text-muted">
                      <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Ingen organisasjoner</p>
                    </div>
                  )}
                  
                  <div className="border-t border-border mt-2 pt-2">
                    <button
                      onClick={handleNewOrganization}
                      className="w-full text-left p-3 rounded-lg hover:bg-background-darker/50 text-primary-400 flex items-center gap-2 transition-colors"
                    >
                      <Plus size={14} />
                      <span className="text-sm font-medium">Ny organisasjon</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
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
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                      ${active 
                        ? 'bg-gradient-to-r from-primary-500/20 to-purple-600/20 text-primary-400 border border-primary-500/30' 
                        : 'text-text-secondary hover:text-text-primary hover:bg-background/50'
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="text-xs text-text-muted text-center">
            <p>© 2025 EPKalk</p>
            <p>Versjon 1.0.0</p>
          </div>
        </div>
      </aside>

      <OrganizationModal
        isOpen={isOrgModalOpen}
        onClose={handleCloseModal}
        organization={editingOrganization}
      />
    </>
  );
};

export default Sidebar;