import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X } from 'lucide-react';
import { useProject, Project } from '../../contexts/ProjectContext';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
}

const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const { addProject, updateProject, getCurrentOrganizationCustomers, getCurrentOrganizationUsers, currentOrganization } = useProject();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    customerId: '',
    createdBy: '',
    status: 'planning' as const,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    budget: ''
  });

  const customers = getCurrentOrganizationCustomers();
  const users = getCurrentOrganizationUsers();

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        customerId: project.customerId,
        createdBy: project.createdBy || '',
        status: project.status,
        startDate: project.startDate.split('T')[0],
        endDate: project.endDate ? project.endDate.split('T')[0] : '',
        budget: project.budget ? project.budget.toString() : ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        customerId: '',
        createdBy: '',
        status: 'planning',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        budget: ''
      });
    }
  }, [project, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentOrganization) {
      alert('Du må velge en organisasjon først');
      return;
    }

    const projectData = {
      name: formData.name,
      description: formData.description,
      customerId: formData.customerId,
      createdBy: formData.createdBy === '' ? undefined : formData.createdBy,
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      budget: formData.budget ? Number(formData.budget) : undefined
    };

    console.log('📝 Submitting project:', {
      isUpdate: !!project,
      formDataCreatedBy: formData.createdBy,
      projectDataCreatedBy: projectData.createdBy
    });

    if (project) {
      const updatedProject = {
        ...project,
        ...projectData
      };
      console.log('🔄 Calling updateProject with:', updatedProject);
      updateProject(updatedProject);
    } else {
      console.log('➕ Calling addProject with:', projectData);
      addProject({
        ...projectData,
        organizationId: currentOrganization.id
      });
    }

    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                  <span>{project ? 'Rediger prosjekt' : 'Nytt prosjekt'}</span>
                  <button
                    onClick={onClose}
                    className="text-text-muted hover:text-text-primary transition-colors"
                  >
                    <X size={20} />
                  </button>
                </Dialog.Title>

                {!currentOrganization && (
                  <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-400 text-sm">
                      Du må velge en organisasjon før du kan legge til prosjekter.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="input-label">Prosjektnavn *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full"
                      placeholder="Navn på prosjektet"
                      disabled={!currentOrganization}
                    />
                  </div>

                  <div>
                    <label className="input-label">Beskrivelse</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full h-20 resize-none"
                      placeholder="Kort beskrivelse av prosjektet"
                      disabled={!currentOrganization}
                    />
                  </div>

                  <div>
                    <label className="input-label">Kunde *</label>
                    <select
                      required
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      className="w-full"
                      disabled={!currentOrganization}
                    >
                      <option value="">Velg kunde</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} {customer.company && `(${customer.company})`}
                        </option>
                      ))}
                    </select>
                    {customers.length === 0 && currentOrganization && (
                      <p className="text-xs text-text-muted mt-1">
                        Du må legge til kunder først før du kan opprette prosjekter.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="input-label">Prosjekteier</label>
                    <select
                      value={formData.createdBy}
                      onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                      className="w-full"
                      disabled={!currentOrganization}
                    >
                      <option value="">Ingen spesifikk eier</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} {user.email && `(${user.email})`}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-text-muted mt-1">
                      Velg hvem som er ansvarlig for dette prosjektet
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full"
                        disabled={!currentOrganization}
                      >
                        <option value="planning">Planlegging</option>
                        <option value="active">Aktiv</option>
                        <option value="on-hold">På vent</option>
                        <option value="completed">Fullført</option>
                      </select>
                    </div>

                    <div>
                      <label className="input-label">Budsjett</label>
                      <input
                        type="number"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full text-right"
                        placeholder="0"
                        min="0"
                        step="1000"
                        disabled={!currentOrganization}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Startdato *</label>
                      <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full"
                        disabled={!currentOrganization}
                      />
                    </div>

                    <div>
                      <label className="input-label">Sluttdato</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full"
                        min={formData.startDate}
                        disabled={!currentOrganization}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={onClose}
                    >
                      Avbryt
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={!currentOrganization || customers.length === 0}
                    >
                      {project ? 'Oppdater' : 'Opprett'}
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

export default ProjectModal;