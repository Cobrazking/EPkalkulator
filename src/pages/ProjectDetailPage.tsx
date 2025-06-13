import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Plus, 
  Calculator, 
  User, 
  Calendar,
  FileText,
  Settings,
  Copy
} from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';
import ProjectModal from '../components/modals/ProjectModal';
import CalculatorModal from '../components/modals/CalculatorModal';
import { formatNumber } from '../utils/calculations';

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { 
    getProjectById, 
    getCustomerById, 
    getCalculatorsByProject, 
    deleteProject, 
    deleteCalculator,
    duplicateProject
  } = useProject();
  
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);

  const project = projectId ? getProjectById(projectId) : null;
  const customer = project ? getCustomerById(project.customerId) : null;
  const calculators = projectId ? getCalculatorsByProject(projectId) : [];

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-text-primary mb-2">Prosjekt ikke funnet</h2>
        <p className="text-text-muted mb-4">Det forespurte prosjektet eksisterer ikke.</p>
        <Link to="/projects" className="btn-primary">
          Tilbake til prosjekter
        </Link>
      </div>
    );
  }

  const handleDeleteProject = () => {
    if (window.confirm(`Er du sikker på at du vil slette prosjektet "${project.name}"?`)) {
      deleteProject(project.id);
      navigate('/projects');
    }
  };

  const handleDuplicateProject = () => {
    const confirmMessage = calculators.length > 0 
      ? `Vil du duplisere prosjektet "${project.name}" med ${calculators.length} kalkyle${calculators.length !== 1 ? 'r' : ''}?`
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

  const handleDeleteCalculator = (calculatorId: string, calculatorName: string) => {
    if (window.confirm(`Er du sikker på at du vil slette kalkylen "${calculatorName}"?`)) {
      deleteCalculator(calculatorId);
    }
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

  const totalValue = calculators.reduce((acc, calc) => acc + (calc.summary?.totalSum || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/projects"
          className="p-2 rounded-lg bg-background-lighter border border-border hover:bg-background transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-text-primary">{project.name}</h1>
          <p className="text-text-muted mt-1">{project.description}</p>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDuplicateProject}
            className="btn-secondary flex items-center gap-2"
          >
            <Copy size={16} />
            Dupliser
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsProjectModalOpen(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Edit size={16} />
            Rediger
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDeleteProject}
            className="btn-danger flex items-center gap-2"
          >
            <Trash2 size={16} />
            Slett
          </motion.button>
        </div>
      </div>

      {/* Project Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-primary-400" />
            <h3 className="font-semibold text-text-primary">Kunde</h3>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-text-primary">{customer?.name || 'Ukjent kunde'}</p>
            {customer?.company && (
              <p className="text-sm text-text-muted">{customer.company}</p>
            )}
            {customer?.email && (
              <p className="text-sm text-text-muted">{customer.email}</p>
            )}
            {customer?.phone && (
              <p className="text-sm text-text-muted">{customer.phone}</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-primary-400" />
            <h3 className="font-semibold text-text-primary">Tidsplan</h3>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-text-muted">Startdato</p>
              <p className="font-medium text-text-primary">
                {new Date(project.startDate).toLocaleDateString('nb-NO')}
              </p>
            </div>
            {project.endDate && (
              <div>
                <p className="text-sm text-text-muted">Sluttdato</p>
                <p className="font-medium text-text-primary">
                  {new Date(project.endDate).toLocaleDateString('nb-NO')}
                </p>
              </div>
            )}
            <div className="pt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                {getStatusText(project.status)}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="w-5 h-5 text-primary-400" />
            <h3 className="font-semibold text-text-primary">Oversikt</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-text-muted">Kalkyler</span>
              <span className="font-medium text-text-primary">{calculators.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Total verdi</span>
              <span className="font-medium text-primary-400">{formatNumber(totalValue)}</span>
            </div>
            {project.budget && (
              <div className="flex justify-between">
                <span className="text-text-muted">Budsjett</span>
                <span className="font-medium text-text-primary">{formatNumber(project.budget)}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Calculators */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-primary">Kalkyler</h2>
          <button
            onClick={() => setIsCalculatorModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Ny kalkyle
          </button>
        </div>

        {calculators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {calculators.map((calculator, index) => (
              <motion.div
                key={calculator.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="p-4 bg-background-darker/50 rounded-lg border border-border hover:border-border-light transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-primary-400" />
                    <h3 className="font-medium text-text-primary">{calculator.name}</h3>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteCalculator(calculator.id, calculator.name)}
                    className="p-1 text-text-muted hover:text-red-400 transition-colors"
                    title="Slett kalkyle"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {calculator.description && (
                  <p className="text-sm text-text-muted mb-3">{calculator.description}</p>
                )}

                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-text-muted">Total sum</span>
                  <span className="font-semibold text-primary-400">
                    {formatNumber(calculator.summary?.totalSum || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-text-muted mb-4">
                  <span>Sist oppdatert</span>
                  <span>{new Date(calculator.updatedAt).toLocaleDateString('nb-NO')}</span>
                </div>

                <Link
                  to={`/projects/${project.id}/calculator/${calculator.id}`}
                  className="block w-full text-center py-2 px-4 bg-primary-500/20 text-primary-400 rounded-md hover:bg-primary-500/30 transition-colors"
                >
                  Åpne kalkyle
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calculator className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-50" />
            <h3 className="text-lg font-medium text-text-primary mb-2">Ingen kalkyler ennå</h3>
            <p className="text-text-muted mb-4">Kom i gang ved å opprette din første kalkyle for dette prosjektet</p>
            <button
              onClick={() => setIsCalculatorModalOpen(true)}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <Plus size={16} />
              Opprett kalkyle
            </button>
          </div>
        )}
      </div>

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        project={project}
      />

      <CalculatorModal
        isOpen={isCalculatorModalOpen}
        onClose={() => setIsCalculatorModalOpen(false)}
        projectId={project.id}
      />
    </div>
  );
};

export default ProjectDetailPage;