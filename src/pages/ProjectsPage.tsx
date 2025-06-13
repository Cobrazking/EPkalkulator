import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FolderOpen, 
  User, 
  Calendar,
  Calculator,
  ArrowRight,
  Copy
} from 'lucide-react';
import { useProject, Project } from '../contexts/ProjectContext';
import ProjectModal from '../components/modals/ProjectModal';

const ProjectsPage: React.FC = () => {
  const { 
    getCurrentOrganizationProjects, 
    deleteProject, 
    duplicateProject,
    getCustomerById, 
    getCalculatorsByProject,
    currentOrganization
  } = useProject();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const projects = getCurrentOrganizationProjects();
  
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDelete = (project: Project) => {
    if (window.confirm(`Er du sikker på at du vil slette prosjektet "${project.name}"?`)) {
      deleteProject(project.id);
    }
  };

  const handleDuplicate = (project: Project) => {
    const calculatorCount = getCalculatorsByProject(project.id).length;
    const confirmMessage = calculatorCount > 0 
      ? `Vil du duplisere prosjektet "${project.name}" med ${calculatorCount} kalkyle${calculatorCount !== 1 ? 'r' : ''}?`
      : `Vil du duplisere prosjektet "${project.name}"?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        const newProjectId = duplicateProject(project.id);
        navigate(`/projects/${newProjectId}`);
      } catch (error) {
        console.error('Failed to duplicate project:', error);
        alert('Feil ved duplisering av prosjekt. Prøv igjen.');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const getCustomerName = (customerId: string) => {
    const customer = getCustomerById(customerId);
    return customer?.name || 'Ukjent kunde';
  };

  const getCalculatorCount = (projectId: string) => {
    return getCalculatorsByProject(projectId).length;
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
        <p className="text-text-muted mb-4">Du må velge en organisasjon for å administrere prosjekter.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Prosjekter</h1>
          <p className="text-text-muted mt-1">Administrer prosjekter for {currentOrganization.name}</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Nytt prosjekt
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
          <input
            type="text"
            placeholder="Søk etter prosjekter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-background-lighter border border-border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-background-lighter border border-border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
        >
          <option value="all">Alle statuser</option>
          <option value="planning">Planlegging</option>
          <option value="active">Aktiv</option>
          <option value="on-hold">På vent</option>
          <option value="completed">Fullført</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6 hover:shadow-hover transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                  <FolderOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary">{project.name}</h3>
                  <p className="text-sm text-text-muted">{getCustomerName(project.customerId)}</p>
                </div>
              </div>
              
              <div className="flex gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDuplicate(project)}
                  className="p-2 text-text-muted hover:text-blue-400 transition-colors rounded-lg hover:bg-background-darker/50"
                  title="Dupliser prosjekt"
                >
                  <Copy size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEdit(project)}
                  className="p-2 text-text-muted hover:text-primary-400 transition-colors rounded-lg hover:bg-background-darker/50"
                  title="Rediger prosjekt"
                >
                  <Edit size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(project)}
                  className="p-2 text-text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-background-darker/50"
                  title="Slett prosjekt"
                >
                  <Trash2 size={16} />
                </motion.button>
              </div>
            </div>

            <p className="text-sm text-text-muted mb-4 line-clamp-2">{project.description}</p>

            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                {getStatusText(project.status)}
              </span>
              
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Calendar size={14} />
                <span>{new Date(project.startDate).toLocaleDateString('nb-NO')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Calculator size={14} />
                <span>{getCalculatorCount(project.id)} kalkyler</span>
              </div>
              
              <Link
                to={`/projects/${project.id}`}
                className="flex items-center gap-1 text-primary-400 hover:text-primary-300 text-sm font-medium"
              >
                Åpne <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-50" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            {searchTerm || statusFilter !== 'all' ? 'Ingen prosjekter funnet' : 'Ingen prosjekter ennå'}
          </h3>
          <p className="text-text-muted mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'Prøv å endre søkekriteriene dine'
              : 'Kom i gang ved å opprette ditt første prosjekt'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <Plus size={16} />
              Opprett prosjekt
            </button>
          )}
        </div>
      )}

      <ProjectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        project={editingProject}
      />
    </div>
  );
};

export default ProjectsPage;