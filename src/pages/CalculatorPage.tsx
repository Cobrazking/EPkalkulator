import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, Save, Download, Upload, FileSpreadsheet, FileText, Settings, Copy, Edit, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';

import { useProject } from '../contexts/ProjectContext';
import SummaryCard from '../components/SummaryCard';
import CalculationTable from '../components/CalculationTable';
import SettingsModal from '../components/SettingsModal';
import DuplicateCalculatorModal from '../components/modals/DuplicateCalculatorModal';
import EditCalculatorModal from '../components/modals/EditCalculatorModal';
import PDFTemplateSelector from '../components/PDFTemplateSelector';
import { CalculationEntry, CalculationSummary, CompanyInfo, CustomerInfo, CalculationSettings } from '../types';
import { calculateRow, calculateSummary } from '../utils/calculations';
import { exportToExcel } from '../utils/excel';

const CalculatorPage: React.FC = () => {
  const { projectId, calculatorId } = useParams<{ projectId: string; calculatorId?: string }>();
  const navigate = useNavigate();
  const { 
    getProjectById, 
    getCustomerById, 
    getCalculatorById, 
    addCalculator, 
    updateCalculator,
    currentOrganization,
    duplicateCalculator,
    getCurrentOrganizationProjects,
    state
  } = useProject();

  const project = projectId ? getProjectById(projectId) : null;
  const customer = project ? getCustomerById(project.customerId) : null;
  const calculator = calculatorId ? getCalculatorById(calculatorId) : null;
  const availableProjects = getCurrentOrganizationProjects().filter(p => p.id !== projectId);

  // Debug logging
  useEffect(() => {
    if (calculator) {
      console.log('🔄 Calculator object from context:', {
        id: calculator.id,
        settingsExists: !!calculator.settings,
        companyInfoExists: !!calculator.settings?.companyInfo,
        companyInfo: calculator.settings?.companyInfo
      });
    }
  }, [calculator]);

  const initialSettings: CalculationSettings = {
    defaultKostpris: 700,
    defaultTimepris: 995,
    defaultPaslag: 20
  };

  // Remove initialEntries from here - we'll create them in useEffect instead
  
  const initialCompanyInfo: CompanyInfo = {
    firma: '',
    navn: '',
    epost: '',
    tlf: '',
    refNr: '',
    logo: undefined,
    tilbudstittel: ''
  };

  const initialCustomerInfo: CustomerInfo = {
    kunde: customer?.name || '',
    firma: customer?.company || '',
    adresse: customer?.address || '',
    epost: customer?.email || '',
    tlf: customer?.phone || ''
  };

  // Initialize entries as an empty array
  const [entries, setEntries] = useState<CalculationEntry[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(initialCompanyInfo);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>(initialCustomerInfo);
  const [calculationSettings, setCalculationSettings] = useState<CalculationSettings>(initialSettings);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPDFSelectorOpen, setIsPDFSelectorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true); // Default to enabled
  const dataInitializedRef = React.useRef({
    companyInfo: false
  });
  const [summary, setSummary] = useState<CalculationSummary>({
    totalSum: 0,
    fortjeneste: 0,
    timerTotalt: 0,
    bidrag: 0,
    totalKostprisTimer: 0
  });

  // Load auto-save preference from localStorage immediately on component mount
  useEffect(() => {
    console.log('🔄 Loading auto-save preference...');
    try {
      const savedAutoSave = localStorage.getItem('epkalk_autoSaveEnabled');
      console.log('📖 Raw value from localStorage:', savedAutoSave);
      
      if (savedAutoSave !== null) {
        const enabled = JSON.parse(savedAutoSave);
        console.log('✅ Auto-save preference loaded:', enabled);
        setAutoSaveEnabled(enabled);
      } else {
        // Default to auto-save enabled (På)
        console.log('🆕 No auto-save preference found, defaulting to enabled (På)');
        setAutoSaveEnabled(true);
        localStorage.setItem('epkalk_autoSaveEnabled', 'true');
      }
    } catch (error) {
      console.error('❌ Failed to load auto-save preference:', error);
      // Default to enabled even on error
      setAutoSaveEnabled(true);
      localStorage.setItem('epkalk_autoSaveEnabled', 'true');
    }
  }, []);

  // Save auto-save preference to localStorage whenever it changes
  useEffect(() => {
    console.log('💾 Auto-save preference changed to:', autoSaveEnabled);
    try {
      localStorage.setItem('epkalk_autoSaveEnabled', JSON.stringify(autoSaveEnabled));
      console.log('✅ Auto-save preference saved to localStorage');

      // Verify it was saved correctly
      const verification = localStorage.getItem('epkalk_autoSaveEnabled');
      console.log('🔍 Verification - value in localStorage:', verification);
    } catch (error) {
      console.error('❌ Failed to save auto-save preference:', error);
    }
  }, [autoSaveEnabled]);

  // Fetch current user info from users table
  useEffect(() => {
    if (currentOrganization) {
      supabase.auth.getUser().then(({ data: userData, error: userError }) => {
        if (userError) {
          console.error('Failed to get auth user:', userError);
          return;
        }

        supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', userData.user?.id)
          .eq('organization_id', currentOrganization.id)
          .single()
          .then(({ data: user, error }) => {
            if (error) {
              console.error('Failed to fetch current user:', error);
              return;
            }
            setCurrentUser(user);
          });
      });
    }
  }, [currentOrganization]);

  // Reset on component mount and when calculator ID changes
  useEffect(() => {
    console.log('🔄 RESET - Calculator ID changed, resetting state...', { calculatorId });
    // Reset state to ensure settings are reloaded from database
    dataInitializedRef.current.companyInfo = false;
    setSettingsLoaded(false);
    setInitialLoad(true);
    setHasUnsavedChanges(false);
  }, [calculatorId]);

  // Load user-specific global settings
  useEffect(() => {
    if (currentOrganization && !settingsLoaded) {
      try {
        // Get current user ID for the specific organization
        supabase.auth.getUser().then(({ data: userData, error: userError }) => {
          if (userError) throw userError;
          
          supabase
            .from('users')
            .select('id')
            .eq('auth_user_id', userData.user?.id)
            .eq('organization_id', currentOrganization.id)
            .single()
            .then(({ data: users, error: usersError }) => {
              if (usersError) {
                console.error('Failed to get user ID:', usersError);
                return;
              }
              
              // Load user settings
              supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', users.id)
                .then(({ data: settingsArray, error: settingsError }) => {
                  if (settingsError) {
                    console.error('Failed to load settings:', settingsError);
                    return;
                  }
                  
                  // Get the first settings record if it exists
                  const settings = settingsArray && settingsArray.length > 0 ? settingsArray[0] : null;
                  
                  if (settings && settings.company_info) {
                    // Store global settings for reference
                    const globalCompanyInfo = {
                      firma: settings.company_info.firma || currentOrganization.name || '',
                      logo: settings.company_info.logo,
                      navn: settings.company_info.navn || '',
                      epost: settings.company_info.epost || currentOrganization.email || '',
                      tlf: settings.company_info.tlf || currentOrganization.phone || ''
                    };

                    // Only set companyInfo if not already initialized (prevents overwriting user input)
                    if (!dataInitializedRef.current.companyInfo) {
                      console.log('📖 LOADING - dataInitialized is false, loading settings...');
                      // If we have a calculator, merge global settings with calculator-specific settings
                      if (calculatorId && calculator && calculator.settings?.companyInfo) {
                        const calcSettings = calculator.settings.companyInfo;
                        console.log('📖 LOADING - Calculator settings from DB:', calcSettings);
                        const loadedCompanyInfo = {
                          // Use calculator-specific firma if available, otherwise use global
                          firma: calcSettings.firma || globalCompanyInfo.firma,
                          // For logo, refNr, and tilbudstittel: check if property exists in calculator settings
                          // If it exists (even as undefined/null/empty), use it to override global
                          logo: 'logo' in calcSettings ? calcSettings.logo : globalCompanyInfo.logo,
                          // Calculator-specific settings or fallback to global user settings
                          navn: calcSettings.navn || globalCompanyInfo.navn,
                          epost: calcSettings.epost || globalCompanyInfo.epost,
                          tlf: calcSettings.tlf || globalCompanyInfo.tlf,
                          refNr: 'refNr' in calcSettings ? (calcSettings.refNr || '') : '',
                          tilbudstittel: 'tilbudstittel' in calcSettings ? (calcSettings.tilbudstittel || '') : ''
                        };
                        console.log('📖 LOADING - Setting companyInfo to:', loadedCompanyInfo);
                        setCompanyInfo(loadedCompanyInfo);
                      } else {
                        // For new calculators, use global settings from user_settings
                        setCompanyInfo({
                          firma: globalCompanyInfo.firma, // Default to global, but can be overridden
                          logo: globalCompanyInfo.logo, // For new calculators, start with global logo
                          navn: globalCompanyInfo.navn,
                          epost: globalCompanyInfo.epost,
                          tlf: globalCompanyInfo.tlf,
                          refNr: '',
                          tilbudstittel: ''
                        });
                      }
                      dataInitializedRef.current.companyInfo = true;
                      console.log('📖 LOADING - dataInitializedRef.companyInfo set to true');
                    } else {
                      console.log('⏭️  LOADING - dataInitializedRef.companyInfo already true, skipping load');
                    }

                    // Load calculation settings
                    if (calculatorId && calculator && calculator.settings?.calculationSettings) {
                      setCalculationSettings(calculator.settings.calculationSettings);
                    } else if (settings.calculation_settings) {
                      setCalculationSettings({
                        defaultKostpris: settings.calculation_settings.defaultKostpris || 700,
                        defaultTimepris: settings.calculation_settings.defaultTimepris || 995,
                        defaultPaslag: settings.calculation_settings.defaultPaslag || 20
                      });
                    }
                  } else {
                    // No global settings found, use organization defaults
                    const defaultCompanyInfo = {
                      firma: currentOrganization.name || '',
                      logo: currentOrganization.logo,
                      navn: '',
                      epost: currentOrganization.email || '',
                      tlf: currentOrganization.phone || ''
                    };

                    // Only set companyInfo if not already initialized (prevents overwriting user input)
                    if (!dataInitializedRef.current.companyInfo) {
                      if (calculatorId && calculator && calculator.settings?.companyInfo) {
                        const calcSettings = calculator.settings.companyInfo;
                        setCompanyInfo({
                          // Global defaults
                          firma: calcSettings.firma || defaultCompanyInfo.firma,
                          // For logo, refNr, and tilbudstittel: check if property exists in calculator settings
                          logo: 'logo' in calcSettings ? calcSettings.logo : defaultCompanyInfo.logo,
                          // Calculator-specific settings or use organization defaults
                          navn: calcSettings.navn || defaultCompanyInfo.navn,
                          epost: calcSettings.epost || defaultCompanyInfo.epost,
                          tlf: calcSettings.tlf || defaultCompanyInfo.tlf,
                          refNr: 'refNr' in calcSettings ? (calcSettings.refNr || '') : '',
                          tilbudstittel: 'tilbudstittel' in calcSettings ? (calcSettings.tilbudstittel || '') : ''
                        });

                        if (calculator.settings?.calculationSettings) {
                        setCalculationSettings(calculator.settings.calculationSettings);
                      }
                      } else {
                        // For new calculators with no global settings
                        setCompanyInfo({
                          firma: defaultCompanyInfo.firma, // Default to organization name, but can be overridden
                          logo: defaultCompanyInfo.logo,
                          navn: defaultCompanyInfo.navn,
                          epost: defaultCompanyInfo.epost,
                          tlf: defaultCompanyInfo.tlf,
                          refNr: '',
                          tilbudstittel: ''
                        });
                      }
                      dataInitializedRef.current.companyInfo = true;
                    }
                  }

                  // Customer info is always loaded from the customer object via the useEffect below
                  
                  setSettingsLoaded(true);
                });
            });
        });
      } catch (error) {
        console.error('Failed to load global settings:', error);
        setSettingsLoaded(true); // Continue with defaults
      }
    }
  }, [currentOrganization, calculatorId, calculator, customer, currentUser, settingsLoaded]);


  // Initialize entries after settings are loaded and calculator is determined
  useEffect(() => {
    if (settingsLoaded) {
      setHasUnsavedChanges(false);
      if (calculatorId && calculator) {
        // For existing calculators, use the saved entries and settings
        setEntries(calculator.entries || []);

        // Customer info is always loaded from the customer object via the useEffect below
        // No need to load it from calculator.settings
        setInitialLoad(false);
      } else {
        // For new calculators, create entries with current user settings
        const newEntries = [
          {
            id: uuidv4(),
            post: '',
            beskrivelse: '',
            antall: 1,
            kostMateriell: 1000,
            timer: 1,
            kostpris: calculationSettings.defaultKostpris,
            timepris: calculationSettings.defaultTimepris,
            paslagMateriell: calculationSettings.defaultPaslag,
            enhetspris: 0,
            sum: 0,
            kommentar: ''
          },
          {
            id: uuidv4(),
            post: '',
            beskrivelse: '',
            antall: 1,
            kostMateriell: 0,
            timer: 0,
            kostpris: calculationSettings.defaultKostpris,
            timepris: calculationSettings.defaultTimepris,
            paslagMateriell: calculationSettings.defaultPaslag,
            enhetspris: 0,
            sum: 0,
            kommentar: ''
          }
        ];
        
        // Calculate the initial values for enhetspris and sum
        const calculatedEntries = newEntries.map(entry => calculateRow(entry));
        setEntries(calculatedEntries);
        setInitialLoad(false);
      }
    }
  }, [settingsLoaded, calculatorId, calculator, calculationSettings]);

  // Always update customer info when customer changes (not stored in calculator settings)
  useEffect(() => {
    if (customer) {
      setCustomerInfo({
        kunde: customer.name || '',
        firma: customer.company || '',
        adresse: customer.address || '',
        epost: customer.email || '',
        tlf: customer.phone || ''
      });
    }
  }, [customer]);

  useEffect(() => {
    const newSummary = calculateSummary(entries);
    
    // Only update summary and set hasUnsavedChanges if the summary actually changed
    const summaryChanged = JSON.stringify(newSummary) !== JSON.stringify(summary);
    if (summaryChanged) {
      setSummary(newSummary);
      setHasUnsavedChanges(true);
    }
  }, [entries]);

  // Add warning when navigating away with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        const message = 'Du har ulagrede endringer. Er du sikker på at du vil forlate siden?';
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges && !isSaving && settingsLoaded && !initialLoad) {
      const autoSaveTimer = setTimeout(() => {
        handleSave();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(autoSaveTimer);
    }
  }, [autoSaveEnabled, hasUnsavedChanges, isSaving, settingsLoaded, initialLoad]);

  // Manual save function
  const handleSave = async () => {
    if (!projectId || !currentOrganization || !settingsLoaded) return;
    
    try {
      setIsSaving(true);
      
      // Save company info with the calculator (customer info is always loaded from customer object)
      console.log('💾 SAVING - Current companyInfo state:', companyInfo);
      const calculatorData = {
        organizationId: currentOrganization.id,
        projectId,
        name: calculator?.name || `Kalkyle ${new Date().toLocaleDateString('nb-NO')}`,
        description: calculator?.description,
        entries: entries,
        summary: summary,
        settings: {
          companyInfo: companyInfo,
          calculationSettings: calculationSettings
        }
      };
      console.log('💾 SAVING - Data to save:', calculatorData.settings);

      if (calculatorId && calculator) {
        // Update existing calculator
        await updateCalculator({
          ...calculator,
          ...calculatorData
        });
      } else if (!calculatorId) {
        // Create new calculator and redirect
        const newCalculatorId = await addCalculator(calculatorData);
        navigate(`/projects/${projectId}/calculator/${newCalculatorId}`, { replace: true });
      }
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save calculator:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (state.loading || !settingsLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Laster kalkyle...</p>
        </div>
      </div>
    );
  }

  if (!currentOrganization) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-text-primary mb-2">Ingen organisasjon valgt</h2>
        <p className="text-text-muted mb-4">Du må velge en organisasjon for å bruke kalkylatoren.</p>
        <Link to="/projects" className="btn-primary">
          Tilbake til prosjekter
        </Link>
      </div>
    );
  }

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

  const handleUpdateEntry = (id: string, field: keyof CalculationEntry, value: any) => {
    setEntries(prevEntries => {
      const updated = prevEntries.map(entry => {
        if (entry.id === id) {
          const updatedEntry = { ...entry, [field]: value };
          return calculateRow(updatedEntry);
        }
        return entry;
      });
      // Only set hasUnsavedChanges if the entries actually changed
      const entriesChanged = JSON.stringify(updated) !== JSON.stringify(prevEntries);
      if (entriesChanged) {
        setHasUnsavedChanges(true);
      }
      return updated;
    });
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    setHasUnsavedChanges(true);
  };

  const handleAddEntry = () => {
    const newEntry: CalculationEntry = {
      id: uuidv4(),
      post: '',
      beskrivelse: '',
      antall: 1,
      kostMateriell: 0,
      timer: 0,
      kostpris: calculationSettings.defaultKostpris,
      timepris: calculationSettings.defaultTimepris,
      paslagMateriell: calculationSettings.defaultPaslag,
      enhetspris: 0,
      sum: 0,
      kommentar: ''
    };
    
    const calculatedEntry = calculateRow(newEntry);
    setEntries(prevEntries => [...prevEntries, calculatedEntry]);
    setHasUnsavedChanges(true);
  };

  const handleDuplicateEntry = (entry: CalculationEntry) => {
    const duplicatedEntry: CalculationEntry = {
      ...entry,
      id: uuidv4(),
      post: `${entry.post}-kopi`,
      beskrivelse: `${entry.beskrivelse} (Kopi)`
    };
    
    setEntries(prevEntries => {
      const newEntries = [...prevEntries];
      const index = prevEntries.findIndex(e => e.id === entry.id);
      newEntries.splice(index + 1, 0, duplicatedEntry);
      return newEntries;
    });
    setHasUnsavedChanges(true);
  };

  const handleReorderEntries = (startIndex: number, endIndex: number) => {
    setEntries(prevEntries => {
      if (
        startIndex < 0 || 
        endIndex < 0 || 
        startIndex >= prevEntries.length || 
        endIndex >= prevEntries.length || 
        startIndex === endIndex
      ) {
        return prevEntries;
      }

      const newEntries = [...prevEntries];
      const [entryToMove] = newEntries.splice(startIndex, 1);
      newEntries.splice(endIndex, 0, entryToMove);
      
      return newEntries;
    });
    setHasUnsavedChanges(true);
  };

  const handleDuplicateCalculator = () => {
    if (!calculatorId) {
      alert('Du må lagre kalkylen først før du kan duplisere den.');
      return;
    }
    setIsDuplicateModalOpen(true);
  };

  const handleEditCalculator = () => {
    if (!calculatorId) {
      alert('Du må lagre kalkylen først før du kan redigere den.');
      return;
    }
    setIsEditModalOpen(true);
  };

  const handleExport = () => {
    const exportData = {
      entries,
      summary,
      companyInfo,
      customerInfo,
      calculationSettings
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `kalkyle-${project.name}-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.xlsx,.xls';
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target.files?.length) return;
      
      const file = target.files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const reader = new FileReader();
      
      if (fileExtension === 'json') {
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            if (data.entries && Array.isArray(data.entries)) {
              setEntries(data.entries);
            }
            if (data.customerInfo) {
              setCustomerInfo(data.customerInfo);
            }
            if (data.calculationSettings) {
              setCalculationSettings(data.calculationSettings);
            }
          } catch (error) {
            console.error('Failed to import JSON data:', error);
            alert('Feil ved import av JSON-data. Kontroller at filen er i gyldig JSON-format.');
          }
        };
        reader.readAsText(file);
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        reader.onload = (event) => {
          try {
            const data = new Uint8Array(event.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const excelData = XLSX.utils.sheet_to_json(worksheet);
            
            const importedEntries: CalculationEntry[] = excelData.map((row: any) => ({
              id: uuidv4(),
              post: row.post || '',
              beskrivelse: row.beskrivelse || '',
              antall: Number(row.antall) || 1,
              kostMateriell: Number(row.kostMateriell) || 0,
              timer: Number(row.timer) || 0,
              kostpris: Number(row.kostpris) || calculationSettings.defaultKostpris,
              timepris: Number(row.timepris) || calculationSettings.defaultTimepris,
              paslagMateriell: Number(row.paslagMateriell) || calculationSettings.defaultPaslag,
              enhetspris: Number(row.enhetspris) || 0,
              sum: Number(row.sum) || 0,
              kommentar: row.kommentar || ''
            }));
            
            setEntries(importedEntries.map(entry => calculateRow(entry)));
          } catch (error) {
            console.error('Failed to import Excel data:', error);
            alert('Feil ved import av Excel-data. Kontroller at filen er i gyldig Excel-format.');
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        alert('Ugyldig filformat. Vennligst velg en .json eller .xlsx/.xls fil.');
      }
    };
    
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to={`/projects/${project.id}`}
          className="p-2 rounded-lg bg-background-lighter border border-border hover:bg-background transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-text-primary">
              {calculator?.name || 'Ny kalkyle'}
              {hasUnsavedChanges && (
                <span className="ml-2 text-sm text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full border border-yellow-400/30 inline-flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {autoSaveEnabled ? 'Lagrer automatisk...' : 'Ulagrede endringer'}
                </span>
              )}
            </h1>
            {isSaving && (
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <div className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                <span>{autoSaveEnabled ? 'Auto-lagrer...' : 'Lagrer...'}</span>
              </div>
            )}
            {lastSaved && !isSaving && !hasUnsavedChanges && (
              <div className="text-sm text-text-muted">
                {autoSaveEnabled ? 'Auto-lagret' : 'Sist lagret'}: {lastSaved.toLocaleTimeString('nb-NO')}
              </div>
            )}
          </div>
          <p className="text-text-muted mt-1">{project.name} - {customer?.name}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-3"
      >
        {/* Primary actions - always visible */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Auto-save toggle */}
          <div className="flex items-center gap-2 px-3 py-2 bg-background-lighter/50 rounded-lg border border-border">
            <input
              type="checkbox"
              id="autoSave"
              checked={autoSaveEnabled}
              onChange={(e) => {
                const newValue = e.target.checked;
                console.log('🔄 User toggled auto-save to:', newValue);
                setAutoSaveEnabled(newValue);
              }}
              className="rounded border-border text-primary-500 focus:ring-primary-400"
            />
            <label htmlFor="autoSave" className="text-sm text-text-primary cursor-pointer whitespace-nowrap">
              Autolagring
            </label>
            {autoSaveEnabled && (
              <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-400/30">
                På
              </span>
            )}
            {!autoSaveEnabled && (
              <span className="text-xs text-text-muted bg-background-darker/50 px-2 py-1 rounded-full border border-border">
                Av
              </span>
            )}
          </div>

          <button
            onClick={handleSave}
            className={`${autoSaveEnabled ? 'btn-secondary' : 'btn-primary'} flex items-center gap-2 whitespace-nowrap`}
            title="Lagre kalkyle"
            disabled={isSaving || (!hasUnsavedChanges && !autoSaveEnabled)}
          >
            <Save size={16} />
            <span className="hidden sm:inline">
              {isSaving
                ? (autoSaveEnabled ? 'Auto-lagrer...' : 'Lagrer...')
                : (autoSaveEnabled ? 'Lagre nå' : 'Lagre')
              }
            </span>
            <span className="sm:hidden">Lagre</span>
          </button>

          <button
            onClick={() => setIsPDFSelectorOpen(true)}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <FileText size={16} />
            <span className="hidden sm:inline">Last ned tilbud</span>
            <span className="sm:hidden">PDF</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="btn-secondary flex items-center gap-2 lg:hidden"
            title="Rediger firma- og kundeopplysninger"
          >
            <Settings size={16} />
          </button>
        </div>

        {/* Secondary actions - collapsible on mobile, always visible on desktop */}
        <div className="hidden lg:flex flex-wrap gap-2 items-center">
          <button
            onClick={handleImport}
            className="btn-secondary flex items-center gap-2"
            title="Importer data"
          >
            <Upload size={16} />
            <span>Importer</span>
          </button>

          <button
            onClick={handleExport}
            className="btn-secondary flex items-center gap-2"
            title="Eksporter data"
          >
            <Download size={16} />
            <span>Eksporter</span>
          </button>

          <button
            onClick={() => exportToExcel(entries, summary)}
            className="btn-secondary flex items-center gap-2"
            title="Eksporter til Excel"
          >
            <FileSpreadsheet size={16} />
            <span>Excel</span>
          </button>

          <button
            onClick={handleEditCalculator}
            className="btn-secondary flex items-center gap-2"
            disabled={!calculatorId}
            title={!calculatorId ? "Lagre kalkylen først for å redigere" : "Rediger kalkyle"}
          >
            <Edit size={16} />
            <span>Rediger</span>
          </button>

          <button
            onClick={handleDuplicateCalculator}
            className="btn-secondary flex items-center gap-2"
            disabled={!calculatorId}
            title={!calculatorId ? "Lagre kalkylen først for å duplisere" : "Dupliser kalkyle"}
          >
            <Copy size={16} />
            <span>Dupliser</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="btn-secondary flex items-center gap-2"
            title="Rediger firma- og kundeopplysninger"
          >
            <Settings size={16} />
            <span>Innstillinger</span>
          </button>
        </div>

        {/* Mobile secondary actions - in a grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 lg:hidden">
          <button
            onClick={handleImport}
            className="btn-secondary flex items-center justify-center gap-2"
            title="Importer data"
          >
            <Upload size={16} />
            <span>Importer</span>
          </button>

          <button
            onClick={handleExport}
            className="btn-secondary flex items-center justify-center gap-2"
            title="Eksporter data"
          >
            <Download size={16} />
            <span>Eksporter</span>
          </button>

          <button
            onClick={() => exportToExcel(entries, summary)}
            className="btn-secondary flex items-center justify-center gap-2"
            title="Eksporter til Excel"
          >
            <FileSpreadsheet size={16} />
            <span>Excel</span>
          </button>

          <button
            onClick={handleEditCalculator}
            className="btn-secondary flex items-center justify-center gap-2"
            disabled={!calculatorId}
            title={!calculatorId ? "Lagre kalkylen først for å redigere" : "Rediger kalkyle"}
          >
            <Edit size={16} />
            <span>Rediger</span>
          </button>

          <button
            onClick={handleDuplicateCalculator}
            className="btn-secondary flex items-center justify-center gap-2"
            disabled={!calculatorId}
            title={!calculatorId ? "Lagre kalkylen først for å duplisere" : "Dupliser kalkyle"}
          >
            <Copy size={16} />
            <span>Dupliser</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="btn-secondary flex items-center justify-center gap-2"
            title="Rediger firma- og kundeopplysninger"
          >
            <Settings size={16} />
            <span>Innstillinger</span>
          </button>
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <SummaryCard summary={summary} />
      </motion.div>

      {/* Calculation Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <CalculationTable 
          entries={entries}
          onUpdateEntry={handleUpdateEntry}
          onDeleteEntry={handleDeleteEntry}
          onAddEntry={handleAddEntry}
          onReorderEntries={handleReorderEntries}
          onDuplicateEntry={handleDuplicateEntry}
        />
      </motion.div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isSaving={isSaving}
        companyInfo={companyInfo}
        customerInfo={customerInfo}
        calculationSettings={calculationSettings}
        onSave={() => {
          setHasUnsavedChanges(true);
          handleSave();
        }}
        onUpdateCompanyInfo={(info) => {
          setCompanyInfo(info);
          setHasUnsavedChanges(true);
        }}
        onUpdateCustomerInfo={(info) => {
          setCustomerInfo(info);
          setHasUnsavedChanges(true);
        }}
        onUpdateCalculationSettings={(settings) => {
          setCalculationSettings(settings);
          setHasUnsavedChanges(true);
        }}
      />

      <DuplicateCalculatorModal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        calculatorId={calculatorId}
        currentProjectId={project.id}
        availableProjects={availableProjects}
      />

      <EditCalculatorModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        calculator={calculator}
      />

      <PDFTemplateSelector
        isOpen={isPDFSelectorOpen}
        onClose={() => setIsPDFSelectorOpen(false)}
        entries={entries}
        companyInfo={companyInfo}
        customerInfo={customerInfo}
        projectName={project.name}
      />
    </div>
  );
};

export default CalculatorPage;