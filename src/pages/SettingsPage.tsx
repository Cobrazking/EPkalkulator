import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  User, 
  Calculator, 
  Building2, 
  Upload,
  X,
  Save,
  AlertTriangle,
  LogOut,
  Shield,
  Users
} from 'lucide-react';
import { CompanyInfo, CalculationSettings } from '../types';
import { useProject } from '../contexts/ProjectContext';
import { supabase } from '../lib/supabase';

const SettingsPage: React.FC = () => {
  const { 
    currentOrganization,
    updateOrganization,
    leaveOrganization,
    canLeaveOrganization,
    getCurrentOrganizationUsers
  } = useProject();

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    firma: '',
    navn: '',
    epost: '',
    tlf: '',
    refNr: '',
    tilbudstittel: ''
  });

  const [calculationSettings, setCalculationSettings] = useState<CalculationSettings>({
    defaultKostpris: 700,
    defaultTimepris: 995,
    defaultPaslag: 20
  });

  const [userSettings, setUserSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [canLeave, setCanLeave] = useState(false);
  const [isLeavingOrg, setIsLeavingOrg] = useState(false);

  const users = getCurrentOrganizationUsers();
  const currentUser = users.find(u => u.authUserId === (supabase.auth.getUser().then(({ data }) => data.user?.id)));

  // Load settings when organization changes
  useEffect(() => {
    if (currentOrganization) {
      loadOrganizationSettings();
      checkCanLeaveOrganization();
    }
  }, [currentOrganization]);

  const checkCanLeaveOrganization = async () => {
    if (!currentOrganization) return;
    
    try {
      const canLeaveResult = await canLeaveOrganization(currentOrganization.id);
      setCanLeave(canLeaveResult);
    } catch (error) {
      console.error('Failed to check if user can leave organization:', error);
      setCanLeave(false);
    }
  };

  const loadOrganizationSettings = async () => {
    if (!currentOrganization) return;

    try {
      setIsLoading(true);
      setError(null);

      // Load user settings for this organization
      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', (await getCurrentUserId()))
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') { // PGRST116 = no rows found
        throw settingsError;
      }

      if (settings) {
        setUserSettings(settings);
        
        // Load company info from settings
        if (settings.company_info) {
          setCompanyInfo({
            firma: settings.company_info.firma || '',
            navn: settings.company_info.navn || '',
            epost: settings.company_info.epost || '',
            tlf: settings.company_info.tlf || '',
            refNr: settings.company_info.refNr || '',
            tilbudstittel: settings.company_info.tilbudstittel || '',
            logo: settings.company_info.logo
          });
        }

        // Load calculation settings
        if (settings.calculation_settings) {
          setCalculationSettings({
            defaultKostpris: settings.calculation_settings.defaultKostpris || 700,
            defaultTimepris: settings.calculation_settings.defaultTimepris || 995,
            defaultPaslag: settings.calculation_settings.defaultPaslag || 20
          });
        }
      } else {
        // No settings found, use defaults
        setCompanyInfo({
          firma: currentOrganization.name || '',
          navn: '',
          epost: currentOrganization.email || '',
          tlf: currentOrganization.phone || '',
          refNr: '',
          tilbudstittel: '',
          logo: currentOrganization.logo
        });
        
        setCalculationSettings({
          defaultKostpris: 700,
          defaultTimepris: 995,
          defaultPaslag: 20
        });
      }
    } catch (error: any) {
      console.error('Failed to load organization settings:', error);
      setError('Feil ved lasting av innstillinger. Prøv igjen.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentUserId = async () => {
    if (!currentOrganization) {
      throw new Error('No organization selected');
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
      .eq('organization_id', currentOrganization.id)
      .single();

    if (error) throw error;
    return users.id;
  };

  const saveSettings = async () => {
    if (!currentOrganization) return;

    try {
      setIsSaving(true);
      setError(null);

      const userId = await getCurrentUserId();
      
      const settingsData = {
        user_id: userId,
        company_info: companyInfo,
        calculation_settings: calculationSettings
      };

      if (userSettings) {
        // Update existing settings
        const { error: updateError } = await supabase
          .from('user_settings')
          .update(settingsData)
          .eq('id', userSettings.id);

        if (updateError) throw updateError;
      } else {
        // Create new settings
        const { data: newSettings, error: insertError } = await supabase
          .from('user_settings')
          .insert([settingsData])
          .select()
          .single();

        if (insertError) throw insertError;
        setUserSettings(newSettings);
      }

      setLastSaved(new Date());
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      setError('Feil ved lagring av innstillinger. Prøv igjen.');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save with debouncing
  useEffect(() => {
    if (!isLoading && currentOrganization) {
      const saveTimer = setTimeout(() => {
        saveSettings();
      }, 2000);

      return () => clearTimeout(saveTimer);
    }
  }, [companyInfo, calculationSettings, isLoading, currentOrganization]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Bildet er for stort. Maksimal størrelse er 5MB.');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Kun bildefiler er tillatt.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyInfo({
          ...companyInfo,
          logo: reader.result as string
        });
        setError(null);
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
    if (window.confirm('Er du sikker på at du vil tilbakestille alle innstillinger for denne organisasjonen? Dette kan ikke angres.')) {
      if (userSettings) {
        // Delete settings from database
        supabase
          .from('user_settings')
          .delete()
          .eq('id', userSettings.id)
          .then(() => {
            setUserSettings(null);
            loadOrganizationSettings();
          });
      }
    }
  };

  const handleLeaveOrganization = async () => {
    if (!currentOrganization) return;

    const adminCount = users.filter(u => u.role === 'admin' && u.isActive).length;
    const isLastAdmin = currentUser?.role === 'admin' && adminCount === 1;

    let confirmMessage = `Er du sikker på at du vil forlate organisasjonen "${currentOrganization.name}"?`;
    
    if (isLastAdmin) {
      confirmMessage += '\n\nDu er den siste administratoren. Du må utnevne en annen administrator før du kan forlate organisasjonen.';
      alert(confirmMessage);
      return;
    }

    if (!window.confirm(confirmMessage + '\n\nDette kan ikke angres.')) {
      return;
    }

    try {
      setIsLeavingOrg(true);
      setError(null);

      await leaveOrganization(currentOrganization.id);
      
      // The leaveOrganization function will handle state updates and navigation
    } catch (error: any) {
      console.error('Failed to leave organization:', error);
      setError(error.message || 'Feil ved forlating av organisasjon. Prøv igjen.');
    } finally {
      setIsLeavingOrg(false);
    }
  };

  if (!currentOrganization) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-50" />
        <h2 className="text-xl font-semibold text-text-primary mb-2">Ingen organisasjon valgt</h2>
        <p className="text-text-muted mb-4">
          Du må velge en organisasjon for å administrere innstillinger.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Laster innstillinger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Innstillinger</h1>
          <p className="text-text-muted mt-1">
            Administrer innstillinger for {currentOrganization.name}
            {isSaving && (
              <span className="ml-2 text-primary-400 text-sm">
                • Lagrer...
              </span>
            )}
            {lastSaved && !isSaving && (
              <span className="ml-2 text-green-400 text-sm">
                • Sist lagret: {lastSaved.toLocaleTimeString('nb-NO')}
              </span>
            )}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
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
                disabled={isSaving}
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
                      disabled={isSaving}
                      className="absolute -top-2 -right-2 p-1 bg-background-lighter rounded-full border border-border hover:bg-background text-red-400 disabled:opacity-50"
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
                      disabled={isSaving}
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
                disabled={isSaving}
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
                disabled={isSaving}
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
                disabled={isSaving}
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
                disabled={isSaving}
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
                disabled={isSaving}
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
                disabled={isSaving}
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
                disabled={isSaving}
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
                disabled={isSaving}
              />
              <p className="text-xs text-text-muted mt-1">
                Standard påslag på materiellkostnader i nye kalkyler
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-lg font-medium text-text-primary mb-4">Tilbakestill innstillinger</h3>
            <p className="text-sm text-text-muted mb-4">
              Dette vil tilbakestille alle innstillinger for denne organisasjonen til standardverdier.
            </p>
            <button
              onClick={handleReset}
              disabled={isSaving}
              className="btn-danger disabled:opacity-50"
            >
              Tilbakestill innstillinger
            </button>
          </div>
        </motion.div>
      </div>

      {/* Organization Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-6 h-6 text-primary-400" />
          <h2 className="text-xl font-semibold text-text-primary">Organisasjonsadministrasjon</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organization Info */}
          <div>
            <h3 className="font-medium text-text-primary mb-4">Aktiv organisasjon</h3>
            <div className="flex items-center gap-3 p-4 bg-background-darker/50 rounded-lg border border-border">
              <Building2 className="w-8 h-8 text-primary-400" />
              <div>
                <p className="font-medium text-text-primary">{currentOrganization.name}</p>
                {currentOrganization.description && (
                  <p className="text-sm text-text-muted">{currentOrganization.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                  <div className="flex items-center gap-1">
                    <Users size={12} />
                    <span>{users.length} medlem{users.length !== 1 ? 'mer' : ''}</span>
                  </div>
                  {currentUser && (
                    <div className="flex items-center gap-1">
                      <Shield size={12} />
                      <span>
                        {currentUser.role === 'admin' ? 'Administrator' : 
                         currentUser.role === 'manager' ? 'Manager' : 'Bruker'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Leave Organization */}
          <div>
            <h3 className="font-medium text-text-primary mb-4">Forlat organisasjon</h3>
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-400 font-medium text-sm mb-2">Advarsel</p>
                  <p className="text-red-400 text-sm">
                    Hvis du forlater denne organisasjonen vil du miste tilgang til alle prosjekter, 
                    kalkyler og data tilknyttet organisasjonen.
                  </p>
                  {!canLeave && currentUser?.role === 'admin' && (
                    <p className="text-red-400 text-sm mt-2">
                      Du kan ikke forlate organisasjonen fordi du er den siste administratoren. 
                      Utnevn en annen administrator først.
                    </p>
                  )}
                </div>
              </div>
              
              <button
                onClick={handleLeaveOrganization}
                disabled={!canLeave || isLeavingOrg || isSaving}
                className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLeavingOrg ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Forlater...
                  </>
                ) : (
                  <>
                    <LogOut size={16} />
                    Forlat organisasjon
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* About Section */}
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
            <p className="text-text-muted">Data lagres sikkert i Supabase</p>
          </div>
          
          <div>
            <h3 className="font-medium text-text-primary mb-2">Organisasjon</h3>
            <p className="text-text-muted">Innstillinger er knyttet til organisasjon</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-text-muted">
            Alle innstillinger på denne siden gjelder kun for den aktive organisasjonen. 
            Hvis du bytter organisasjon vil du se innstillingene for den organisasjonen.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;