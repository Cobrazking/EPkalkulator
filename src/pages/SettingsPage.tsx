import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  User, 
  Calculator, 
  Building2, 
  Palette, 
  Edit, 
  Trash2, 
  Plus,
  Upload,
  X
} from 'lucide-react';
import useLocalStorage from '../hooks/useLocalStorage';
import { CompanyInfo, CalculationSettings } from '../types';
import { useProject } from '../contexts/ProjectContext';
import OrganizationModal from '../components/modals/OrganizationModal';

const SettingsPage: React.FC = () => {
  const { 
    state, 
    currentOrganization, 
    updateOrganization, 
    deleteOrganization, 
    setCurrentOrganization 
  } = useProject();
  
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState(null);

  const initialCompanyInfo: CompanyInfo = {
    firma: '',
    navn: '',
    epost: '',
    tlf: '',
    refNr: ''
  };

  const initialSettings: CalculationSettings = {
    defaultKostpris: 700,
    defaultTimepris: 995,
    defaultPaslag: 20
  };

  const [companyInfo, setCompanyInfo] = useLocalStorage<CompanyInfo>('company-info', initialCompanyInfo);
  const [calculationSettings, setCalculationSettings] = useLocalStorage<CalculationSettings>('calculation-settings', initialSettings);

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
        setCompanyInfo({
          ...companyInfo,
          logo: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setCompanyInfo({
      ...companyInfo,
      logo: undefined
    });
  };

  const handleEditOrganization = (org: any) => {
    setEditingOrganization(org);
    setIsOrgModalOpen(true);
  };

  const handleDeleteOrganization = (org: any) => {
    if (state.organizations.length <= 1) {
      alert('Du kan ikke slette den siste organisasjonen.');
      return;
    }

    const confirmMessage = `Er du sikker på at du vil slette organisasjonen "${org.name}"?\n\nDette vil også slette alle tilhørende kunder, prosjekter og kalkyler. Denne handlingen kan ikke angres.`;
    
    if (window.confirm(confirmMessage)) {
      deleteOrganization(org.id);
    }
  };

  const handleNewOrganization = () => {
    setEditingOrganization(null);
    setIsOrgModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsOrgModalOpen(false);
    setEditingOrganization(null);
  };

  const handleReset = () => {
    if (window.confirm('Er du sikker på at du vil tilbakestille alle innstillinger? Dette kan ikke angres.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Innstillinger</h1>
        <p className="text-text-muted mt-1">Administrer dine globale innstillinger og organisasjoner</p>
      </div>

      {/* Organization Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-primary-400" />
            <h2 className="text-xl font-semibold text-text-primary">Organisasjoner</h2>
          </div>
          <button
            onClick={handleNewOrganization}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Ny organisasjon
          </button>
        </div>

        <div className="space-y-4">
          {state.organizations.map((org) => (
            <div 
              key={org.id} 
              className={`p-4 rounded-lg border transition-all duration-200 ${
                currentOrganization?.id === org.id
                  ? 'border-primary-500/50 bg-gradient-to-r from-primary-500/10 to-purple-600/10'
                  : 'border-border bg-background-darker/30 hover:bg-background-darker/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {org.logo ? (
                    <img 
                      src={org.logo} 
                      alt={`${org.name} logo`}
                      className="w-10 h-10 object-contain rounded-lg border border-border bg-background-darker/50"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Building2 size={20} className="text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-text-primary truncate">{org.name}</h3>
                      {currentOrganization?.id === org.id && (
                        <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full border border-primary-500/30">
                          Aktiv
                        </span>
                      )}
                    </div>
                    {org.description && (
                      <p className="text-sm text-text-muted truncate">{org.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-1 text-xs text-text-muted">
                      {org.email && <span>{org.email}</span>}
                      {org.phone && <span>{org.phone}</span>}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {currentOrganization?.id !== org.id && (
                    <button
                      onClick={() => setCurrentOrganization(org.id)}
                      className="px-3 py-1.5 text-sm bg-background-darker/50 hover:bg-background-darker text-text-muted hover:text-text-primary rounded-lg transition-colors"
                    >
                      Velg
                    </button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEditOrganization(org)}
                    className="p-2 text-text-muted hover:text-primary-400 transition-colors rounded-lg hover:bg-background-darker/50"
                    title="Rediger organisasjon"
                  >
                    <Edit size={16} />
                  </motion.button>
                  
                  {state.organizations.length > 1 && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteOrganization(org)}
                      className="p-2 text-text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-background-darker/50"
                      title="Slett organisasjon"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-primary-400" />
            <h2 className="text-xl font-semibold text-text-primary">Firmaopplysninger</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="input-label">Tilbudstittel</label>
              <input
                type="text"
                value={companyInfo.tilbudstittel || ''}
                onChange={(e) => setCompanyInfo({ ...companyInfo, tilbudstittel: e.target.value })}
                className="w-full"
                placeholder="F.eks. Tilbud på elektrisk arbeid"
              />
            </div>

            <div>
              <label className="input-label">Firmalogo</label>
              <div className="mt-2 flex items-center gap-4">
                {companyInfo.logo ? (
                  <div className="relative">
                    <img 
                      src={companyInfo.logo} 
                      alt="Firmalogo" 
                      className="h-16 w-auto object-contain rounded border border-border"
                    />
                    <button
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 p-1 bg-background-lighter rounded-full border border-border hover:bg-background text-red-400"
                      title="Fjern logo"
                    >
                      <X size={12} />
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
                    <div className="text-center">
                      <Upload size={16} className="mx-auto mb-1 text-text-muted" />
                      <span className="text-text-muted text-xs">Last opp logo</span>
                    </div>
                  </label>
                )}
              </div>
              <p className="text-xs text-text-muted mt-1">
                Maksimal filstørrelse: 5MB. Kun bildefiler er tillatt.
              </p>
            </div>

            <div>
              <label className="input-label">Firma</label>
              <input
                type="text"
                value={companyInfo.firma}
                onChange={(e) => setCompanyInfo({ ...companyInfo, firma: e.target.value })}
                className="w-full"
                placeholder="Firmanavn"
              />
            </div>

            <div>
              <label className="input-label">Kontaktperson</label>
              <input
                type="text"
                value={companyInfo.navn}
                onChange={(e) => setCompanyInfo({ ...companyInfo, navn: e.target.value })}
                className="w-full"
                placeholder="Navn på kontaktperson"
              />
            </div>

            <div>
              <label className="input-label">E-post</label>
              <input
                type="email"
                value={companyInfo.epost}
                onChange={(e) => setCompanyInfo({ ...companyInfo, epost: e.target.value })}
                className="w-full"
                placeholder="firma@eksempel.no"
              />
            </div>

            <div>
              <label className="input-label">Telefon</label>
              <input
                type="tel"
                value={companyInfo.tlf}
                onChange={(e) => setCompanyInfo({ ...companyInfo, tlf: e.target.value })}
                className="w-full"
                placeholder="+47 123 45 678"
              />
            </div>

            <div>
              <label className="input-label">Referansenummer</label>
              <input
                type="text"
                value={companyInfo.refNr}
                onChange={(e) => setCompanyInfo({ ...companyInfo, refNr: e.target.value })}
                className="w-full"
                placeholder="Ref.nr eller org.nr"
              />
            </div>
          </div>
        </motion.div>

        {/* Calculation Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Calculator className="w-6 h-6 text-primary-400" />
            <h2 className="text-xl font-semibold text-text-primary">Kalkyle-innstillinger</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="input-label">Standard kostpris ressurs (kr/time)</label>
              <input
                type="number"
                value={calculationSettings.defaultKostpris}
                onChange={(e) => setCalculationSettings({
                  ...calculationSettings,
                  defaultKostpris: Number(e.target.value)
                })}
                className="w-full text-right"
                min="0"
                step="10"
              />
              <p className="text-xs text-text-muted mt-1">
                Dette er kostprisen for arbeidstimer som brukes i nye kalkyler
              </p>
            </div>

            <div>
              <label className="input-label">Standard salgspris ressurs (kr/time)</label>
              <input
                type="number"
                value={calculationSettings.defaultTimepris}
                onChange={(e) => setCalculationSettings({
                  ...calculationSettings,
                  defaultTimepris: Number(e.target.value)
                })}
                className="w-full text-right"
                min="0"
                step="10"
              />
              <p className="text-xs text-text-muted mt-1">
                Dette er salgsprisen for arbeidstimer som brukes i nye kalkyler
              </p>
            </div>

            <div>
              <label className="input-label">Standard påslag materiell (%)</label>
              <input
                type="number"
                value={calculationSettings.defaultPaslag}
                onChange={(e) => setCalculationSettings({
                  ...calculationSettings,
                  defaultPaslag: Number(e.target.value)
                })}
                className="w-full text-right"
                min="0"
                max="100"
                step="1"
              />
              <p className="text-xs text-text-muted mt-1">
                Standard påslag på materiellkostnader i nye kalkyler
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-lg font-medium text-text-primary mb-4">Farvel til data</h3>
            <p className="text-sm text-text-muted mb-4">
              Dette vil slette alle dine data inkludert kunder, prosjekter, kalkyler og innstillinger.
            </p>
            <button
              onClick={handleReset}
              className="btn-danger"
            >
              Tilbakestill alt
            </button>
          </div>
        </motion.div>
      </div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-6 h-6 text-primary-400" />
          <h2 className="text-xl font-semibold text-text-primary">Om EPKalk</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium text-text-primary mb-2">Versjon</h3>
            <p className="text-text-muted">1.0.0</p>
          </div>
          
          <div>
            <h3 className="font-medium text-text-primary mb-2">Datalagring</h3>
            <p className="text-text-muted">Alle data lagres lokalt i din nettleser</p>
          </div>
          
          <div>
            <h3 className="font-medium text-text-primary mb-2">Sikkerhet</h3>
            <p className="text-text-muted">Ingen data sendes til eksterne servere</p>
          </div>
        </div>
      </motion.div>

      <OrganizationModal
        isOpen={isOrgModalOpen}
        onClose={handleCloseModal}
        organization={editingOrganization}
      />
    </div>
  );
};

export default SettingsPage;