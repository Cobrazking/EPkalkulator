import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, Upload, Edit, Building2, Save, AlertTriangle } from 'lucide-react';
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
  const { addOrganization, updateOrganization, setCurrentOrganization } = useProject();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo: ''
  });
  const [isLoading, setIsLoading] = useState(false);

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
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Bildet er for stort. Maksimal størrelse er 5MB.');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Kun bildefiler er tillatt.');
        return;
      }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (organization) {
        updateOrganization({
          ...organization,
          ...formData
        });
      } else {
        // When creating a new organization, automatically switch to it
        addOrganization(formData);
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save organization:', error);
      alert('Feil ved lagring av organisasjon. Prøv igjen.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-background-lighter border border-border shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-text-primary">
                        {organization ? 'Rediger organisasjon' : 'Ny organisasjon'}
                      </Dialog.Title>
                      <p className="text-sm text-text-muted">
                        {organization ? 'Oppdater organisasjonsinformasjon' : 'Opprett en ny organisasjon for dine prosjekter'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={isLoading}
                    className="text-text-muted hover:text-text-primary transition-colors disabled:opacity-50"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                      Grunnleggende informasjon
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="input-label">Organisasjonsnavn *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full"
                          placeholder="Navn på organisasjonen"
                          autoFocus
                          disabled={isLoading}
                        />
                        <p className="text-xs text-text-muted mt-1">
                          Dette navnet vises i organisasjonsvelgeren og på alle dokumenter
                        </p>
                      </div>

                      <div className="md:col-span-2">
                        <label className="input-label">Beskrivelse</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full h-20 resize-none"
                          placeholder="Kort beskrivelse av organisasjonen (valgfritt)"
                          disabled={isLoading}
                        />
                        <p className="text-xs text-text-muted mt-1">
                          Beskrivelsen vises under organisasjonsnavnet i velgeren
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Logo Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                      Logo
                    </h3>
                    
                    <div className="flex items-start gap-4">
                      {formData.logo ? (
                        <div className="relative group">
                          <img 
                            src={formData.logo} 
                            alt="Organisasjonslogo" 
                            className="h-20 w-20 object-contain rounded-lg border border-border bg-background-darker/50"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            disabled={isLoading}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                            title="Fjern logo"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary-400 transition-colors group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                            disabled={isLoading}
                          />
                          <Upload size={16} className="text-text-muted group-hover:text-primary-400 transition-colors mb-1" />
                          <span className="text-xs text-text-muted group-hover:text-primary-400 transition-colors">Last opp</span>
                        </label>
                      )}
                      
                      <div className="flex-1">
                        <p className="text-sm text-text-primary font-medium mb-1">Organisasjonslogo</p>
                        <p className="text-xs text-text-muted">
                          Logoen brukes på tilbud og andre dokumenter. Anbefalt størrelse: 200x200px eller større.
                          Maksimal filstørrelse: 5MB.
                        </p>
                        {!formData.logo && (
                          <label className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-background-darker/50 hover:bg-background-darker transition-colors rounded-lg cursor-pointer text-sm text-text-muted hover:text-text-primary">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                              disabled={isLoading}
                            />
                            <Upload size={14} />
                            Velg fil
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                      Kontaktinformasjon
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="input-label">E-post</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full"
                          placeholder="post@organisasjon.no"
                          disabled={isLoading}
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
                          disabled={isLoading}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="input-label">Adresse</label>
                        <textarea
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full h-20 resize-none"
                          placeholder="Organisasjonens adresse"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="input-label">Nettside</label>
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          className="w-full"
                          placeholder="https://www.organisasjon.no"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-6 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                      <AlertTriangle size={14} />
                      <span>Endringer lagres automatisk</span>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleClose}
                        disabled={isLoading}
                      >
                        Avbryt
                      </button>
                      <button
                        type="submit"
                        className="btn-primary flex items-center gap-2"
                        disabled={isLoading || !formData.name.trim()}
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Lagrer...
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            {organization ? 'Oppdater' : 'Opprett'}
                          </>
                        )}
                      </button>
                    </div>
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