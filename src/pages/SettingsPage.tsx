import React from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Calculator, Building2, Palette } from 'lucide-react';
import useLocalStorage from '../hooks/useLocalStorage';
import { CompanyInfo, CalculationSettings } from '../types';

const SettingsPage: React.FC = () => {
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
        <p className="text-text-muted mt-1">Administrer dine globale innstillinger</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-6 h-6 text-primary-400" />
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
                      ×
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
                    <span className="text-text-muted text-sm">Last opp logo</span>
                  </label>
                )}
              </div>
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
          transition={{ delay: 0.2 }}
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
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-6 h-6 text-primary-400" />
          <h2 className="text-xl font-semibold text-text-primary">Om ProsjektHub</h2>
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
    </div>
  );
};

export default SettingsPage;