import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, Copy, Calculator } from 'lucide-react';
import { useProject, Project } from '../../contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';

interface DuplicateCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculatorId: string | null;
  currentProjectId: string;
  availableProjects: Project[];
}

const DuplicateCalculatorModal: React.FC<DuplicateCalculatorModalProps> = ({
  isOpen,
  onClose,
  calculatorId,
  currentProjectId,
  availableProjects,
}) => {
  const { getCalculatorById, getProjectById, getCustomerById, duplicateCalculator, updateCalculator } = useProject();
  const navigate = useNavigate();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(currentProjectId);
  const [customName, setCustomName] = useState<string>('');

  const calculator = calculatorId ? getCalculatorById(calculatorId) : null;
  const selectedProject = getProjectById(selectedProjectId);
  const selectedCustomer = selectedProject ? getCustomerById(selectedProject.customerId) : null;

  // Reset form when modal opens/closes or calculator changes
  useEffect(() => {
    if (isOpen && calculator) {
      setSelectedProjectId(currentProjectId);
      setCustomName(`${calculator.name} (Kopi)`);
    } else if (!isOpen) {
      setSelectedProjectId(currentProjectId);
      setCustomName('');
    }
  }, [isOpen, calculator, currentProjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!calculator || !customName.trim()) return;
    
    try {
      // First duplicate the calculator to the selected project
      const newCalculatorId = duplicateCalculator(calculator.id, selectedProjectId);
      
      // Then immediately update the name to the custom name
      const newCalculator = getCalculatorById(newCalculatorId);
      if (newCalculator) {
        updateCalculator({
          ...newCalculator,
          name: customName.trim()
        });
      }
      
      onClose();
      
      // Navigate to the new calculator
      navigate(`/projects/${selectedProjectId}/calculator/${newCalculatorId}`);
    } catch (error) {
      console.error('Failed to duplicate calculator:', error);
      alert('Feil ved duplisering av kalkyle. Prøv igjen.');
    }
  };

  const handleClose = () => {
    setSelectedProjectId(currentProjectId);
    setCustomName('');
    onClose();
  };

  if (!calculator) return null;

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-background-lighter border border-border p-6 shadow-xl transition-all">
                <Dialog.Title className="text-lg font-semibold mb-4 text-white flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Copy size={20} className="text-primary-400" />
                    <span>Dupliser kalkyle</span>
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
                  {calculator.description && (
                    <p className="text-sm text-text-muted">{calculator.description}</p>
                  )}
                  <div className="mt-2 text-xs text-text-muted">
                    {calculator.entries?.length || 0} poster • 
                    Verdi: {calculator.summary?.totalSum ? 
                      new Intl.NumberFormat('nb-NO').format(calculator.summary.totalSum) : '0'} kr
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="input-label">Nytt navn *</label>
                    <input
                      type="text"
                      required
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full"
                      placeholder={`${calculator.name} (Kopi)`}
                      autoFocus
                    />
                    <p className="text-xs text-text-muted mt-1">
                      Dette navnet vil bli brukt på den nye kalkylen
                    </p>
                  </div>

                  <div>
                    <label className="input-label">Målprosjekt *</label>
                    <select
                      required
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full"
                    >
                      <option value={currentProjectId}>
                        {getProjectById(currentProjectId)?.name} (Samme prosjekt)
                      </option>
                      {availableProjects.map((project) => {
                        const customer = getCustomerById(project.customerId);
                        return (
                          <option key={project.id} value={project.id}>
                            {project.name} - {customer?.name || 'Ukjent kunde'}
                          </option>
                        );
                      })}
                    </select>
                    {availableProjects.length === 0 && (
                      <p className="text-xs text-text-muted mt-1">
                        Ingen andre prosjekter tilgjengelig. Kalkylen vil bli duplisert til samme prosjekt.
                      </p>
                    )}
                  </div>

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

                  {/* Preview of what will happen */}
                  <div className="p-3 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                    <div className="text-sm">
                      <div className="font-medium text-primary-400 mb-1">Forhåndsvisning:</div>
                      <div className="text-text-muted">
                        Ny kalkyle: <span className="text-text-primary font-medium">"{customName || `${calculator.name} (Kopi)`}"</span>
                      </div>
                      <div className="text-text-muted">
                        I prosjekt: <span className="text-text-primary font-medium">{selectedProject?.name}</span>
                      </div>
                    </div>
                  </div>

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
                      disabled={!customName.trim()}
                    >
                      <Copy size={16} />
                      Dupliser
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

export default DuplicateCalculatorModal;