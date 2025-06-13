import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, Upload } from 'lucide-react';
import { useProject, Organization } from '../../contexts/ProjectContext';

interface OrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization?: Organization | null;
}

const OrganizationModal: React.FC<OrganizationModalProps> = ({
  isOpen,
  onClose,
  organization,
}) => {
  const { addOrganization, updateOrganization } = useProject();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo: ''
  });

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name,
        description: organization.description || '',
        address: organization.address || '',
        phone: organization.phone || '',
        email: organization.email || '',
        website: organization.website || '',
        logo: organization.logo || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        logo: ''
      });
    }
  }, [organization, isOpen]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          logo: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setFormData({
      ...formData,
      logo: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (organization) {
      updateOrganization({
        ...organization,
        ...formData
      });
    } else {
      addOrganization(formData);
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
                  <span>{organization ? 'Rediger organisasjon' : 'Ny organisasjon'}</span>
                  <button
                    onClick={onClose}
                    className="text-text-muted hover:text-text-primary transition-colors"
                  >
                    <X size={20} />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="input-label">Navn *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full"
                      placeholder="Organisasjonsnavn"
                    />
                  </div>

                  <div>
                    <label className="input-label">Beskrivelse</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full h-20 resize-none"
                      placeholder="Kort beskrivelse av organisasjonen"
                    />
                  </div>

                  <div>
                    <label className="input-label">Logo</label>
                    <div className="mt-2 flex items-center gap-4">
                      {formData.logo ? (
                        <div className="relative">
                          <img 
                            src={formData.logo} 
                            alt="Organisasjonslogo" 
                            className="h-16 w-auto object-contain rounded border border-border"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="absolute -top-2 -right-2 p-1 bg-background-lighter rounded-full border border-border hover:bg-background text-red-400"
                            title="Fjern logo"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center w-32 h-16 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary-400 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <Upload size={20} className="text-text-muted" />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">E-post</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full"
                        placeholder="post@organisasjon.no"
                      />
                    </div>

                    <div>
                      <label className="input-label">Telefon</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full"
                        placeholder="+47 123 45 678"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Adresse</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full h-20 resize-none"
                      placeholder="Organisasjonens adresse"
                    />
                  </div>

                  <div>
                    <label className="input-label">Nettside</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full"
                      placeholder="https://www.organisasjon.no"
                    />
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
                    >
                      {organization ? 'Oppdater' : 'Opprett'}
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

export default OrganizationModal;