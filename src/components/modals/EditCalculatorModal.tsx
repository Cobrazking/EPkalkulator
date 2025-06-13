import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, Edit, Calculator, ArrowRight } from 'lucide-react';
import { useProject, Calculator as CalculatorType, Project } from '../../contexts/ProjectContext';

interface EditCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculator: CalculatorType | null;
}

const EditCalculatorModal: React.FC<EditCalculatorModalProps> = ({
  isOpen,
  onClose,
  calculator,
}) => {
  const { 
    updateCalculator, 
    moveCalculator,
    getCurrentOrganizationProjects, 
    getProjectById, 
    getCustomerById 
  } = useProject();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectId: ''
  });

  const availableProjects = getCurrentOrganizationProjects();
  const currentProject = calculator ? getProjectById(calculator.projectId) : null;
  const selectedProject = getProjectById(formData.projectId);
  const selectedCustomer = selectedProject ? getCustomerById(selectedProject.customerId) : null;

  useEffect(() => {
    if (calculator) {
      setFormData({
        name: calculator.name,
        description: calculator.description || '',
        projectId: calculator.projectId
      });
    } else {
      setFormData({
        name: '',
        description: '',
        projectId: ''
      });
    }
  }, [calculator, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!calculator) return;
    
    // Check if project is being changed
    const isMoving = formData.projectId !== calculator.projectId;
    
    if (isMoving) {
      // Move calculator to new project
      moveCalculator(calculator.id, formData.projectId);
    }
    
    // Update calculator details
    updateCalculator({
      ...calculator,
      name: formData.name,
      description: formData.description,
      projectId: formData.projectId
    });
    
    onClose();
  };

  const handleClose = () => {
    if (calculator) {
      setFormData({
        name: calculator.name,
        description: calculator.description || '',
        projectId: calculator.projectId
      });
    }
    onClose();
  };

  if (!calculator) return null;

  const isMoving = formData.projectId !== calculator.projectId;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-background-lighter border border-border p-6 shadow-xl transition-all">
                <Dialog.Title className="text-lg font-semibold mb-4 text-white flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Edit size={20} className="text-primary-400" />
                    <span>Rediger kalkyle</span>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-text-muted hover:text-text-primary transition-colors"
                  >
                    <X size={20} />
                  </button>
                </Dialog.Title>

                {/* Calculator Info */}
                <div className="mb-6 p-4 bg-background-darker/50 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator size={16} className="text-primary-400" />
                    <h3 className="font-medium text-text-primary">{calculator.name}</h3>
                  </div>
                  <div className="text-xs text-text-muted">
                    {calculator.entries?.length || 0} poster • 
                    Verdi: {calculator.summary?.totalSum ? 
                      new Intl.NumberFormat('nb-NO').format(calculator.summary.totalSum) : '0'} kr
                  </div>
                  <div className="text-xs text-text-muted mt-1">
                    Opprettet: {new Date(calculator.createdAt).toLocaleDateString('nb-NO')}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="input-label">Navn *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full"
                      placeholder="Navn på kalkylen"
                    />
                  </div>

                  <div>
                    <label className="input-label">Beskrivelse</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full h-20 resize-none"
                      placeholder="Kort beskrivelse av kalkylen (valgfritt)"
                    />
                  </div>

                  <div>
                    <label className="input-label">Prosjekt *</label>
                    <select
                      required
                      value={formData.projectId}
                      onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                      className="w-full"
                    >
                      {availableProjects.map((project) => {
                        const customer = getCustomerById(project.customerId);
                        return (
                          <option key={project.id} value={project.id}>
                            {project.name} - {customer?.name || 'Ukjent kunde'}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Movement Warning */}
                  {isMoving && (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowRight size={16} className="text-yellow-400" />
                        <span className="text-yellow-400 font-medium">Flytter kalkyle</span>
                      </div>
                      <div className="text-sm text-text-muted">
                        <div className="mb-2">
                          <span className="font-medium">Fra:</span> {currentProject?.name}
                        </div>
                        <div>
                          <span className="font-medium">Til:</span> {selectedProject?.name}
                          {selectedCustomer && ` (${selectedCustomer.name})`}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Target Project Info */}
                  {selectedProject && (
                    <div className="p-3 bg-background-darker/30 rounded-lg border border-border">
                      <div className="text-sm">
                        <div className="font-medium text-text-primary">{selectedProject.name}</div>
                        <div className="text-text-muted">
                          Kunde: {selectedCustomer?.name || 'Ukjent kunde'}
                        </div>
                        <div className="text-text-muted">
                          Status: {selectedProject.status === 'active' ? 'Aktiv' : 
                                  selectedProject.status === 'completed' ? 'Fullført' :
                                  selectedProject.status === 'on-hold' ? 'På vent' : 'Planlegging'}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleClose}
                    >
                      Avbryt
                    </button>
                    <button
                      type="submit"
                      className="btn-primary flex items-center gap-2"
                    >
                      <Edit size={16} />
                      {isMoving ? 'Flytt og oppdater' : 'Oppdater'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EditCalculatorModal;