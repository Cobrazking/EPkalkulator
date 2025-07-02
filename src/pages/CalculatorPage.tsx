import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, Save, Download, Upload, FileSpreadsheet, FileText, Settings, Copy, Edit } from 'lucide-react';
import * as XLSX from 'xlsx';

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
import { supabase } from '../lib/supabase';

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
    refNr: ''
  };

  const initialCustomerInfo: CustomerInfo = {
    kunde: customer?.name || '',
    adresse: customer?.address || '',
    epost: customer?.email || '',
    tlf: customer?.phone || ''
  };

  // Initialize entries as an empty array
  const [entries, setEntries] = useState<CalculationEntry[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(initialCompanyInfo);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>(initialCustomerInfo);
  const [calculationSettings, setCalculationSettings] = useState<CalculationSettings>(initialSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPDFSelectorOpen, setIsPDFSelectorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [summary, setSummary] = useState<CalculationSummary>({
    totalSum: 0,
    fortjeneste: 0,
    timerTotalt: 0,
    bidrag: 0,
    totalKostprisTimer: 0
  });

  // Load user-specific settings
  useEffect(() => {
    if (currentOrganization && !settingsLoaded) {
      loadUserSettings();
    }
  }, [currentOrganization, settingsLoaded]);

  // Initialize entries after settings are loaded and calculator is determined
  useEffect(() => {
    if (settingsLoaded) {
      if (calculatorId && calculator) {
        // For existing calculators, use the saved entries
        setEntries(calculator.entries || []);
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
      }
    }
  }, [settingsLoaded, calculatorId, calculator, calculationSettings]);

  const loadUserSettings = async () => {
    if (!currentOrganization) return;

    try {
      // Get current user ID for the specific organization
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.error('User not authenticated');
        setSettingsLoaded(true);
        return;
      }

      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', userData.user.id)
        .eq('organization_id', currentOrganization.id)
        .single();

      if (userError) {
        console.error('Failed to get user ID:', userError);
        setSettingsLoaded(true);
        return;
      }

      // Load user settings - remove .single() to avoid PGRST116 error
      const { data: settingsArray, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', users.id);

      if (settingsError) {
        console.error('Failed to load settings:', settingsError);
        setSettingsLoaded(true);
        return;
      }

      // Get the first settings record if it exists
      const settings = settingsArray && settingsArray.length > 0 ? settingsArray[0] : null;

      if (settings) {
        // Load company info from settings
        if (settings.company_info) {
          setCompanyInfo({
            firma: settings.company_info.firma || currentOrganization.name || '',
            navn: settings.company_info.navn || '',
            epost: settings.company_info.epost || currentOrganization.email || '',
            tlf: settings.company_info.tlf || currentOrganization.phone || '',
            refNr: settings.company_info.refNr || '',
            tilbudstittel: settings.company_info.tilbudstittel || '',
            logo: settings.company_info.logo
          });
        } else {
          // Use organization data as fallback
          setCompanyInfo({
            firma: currentOrganization.name || '',
            navn: '',
            epost: currentOrganization.email || '',
            tlf: currentOrganization.phone || '',
            refNr: '',
            tilbudstittel: '',
            logo: currentOrganization.logo
          });
        }

        // Load calculation settings
        if (settings.calculation_settings) {
          const newSettings = {
            defaultKostpris: settings.calculation_settings.defaultKostpris || 700,
            defaultTimepris: settings.calculation_settings.defaultTimepris || 995,
            defaultPaslag: settings.calculation_settings.defaultPaslag || 20
          };
          
          setCalculationSettings(newSettings);
          
          // We don't update entries here anymore - that's handled by the useEffect above
        }
      } else {
        // No settings found, use organization data as defaults
        setCompanyInfo({
          firma: currentOrganization.name || '',
          navn: '',
          epost: currentOrganization.email || '',
          tlf: currentOrganization.phone || '',
          refNr: '',
          tilbudstittel: '',
          logo: currentOrganization.logo
        });
      }

      setSettingsLoaded(true);
    } catch (error) {
      console.error('Failed to load user settings:', error);
      setSettingsLoaded(true);
    }
  };

  // Update customer info when customer changes
  useEffect(() => {
    if (customer) {
      setCustomerInfo({
        kunde: customer.name,
        adresse: customer.address,
        epost: customer.email,
        tlf: customer.phone
      });
    }
  }, [customer]);

  useEffect(() => {
    setSummary(calculateSummary(entries));
  }, [entries]);

  // Auto-save calculator with debouncing
  useEffect(() => {
    if (projectId && entries.length > 0 && currentOrganization && !state.loading && settingsLoaded) {
      const saveTimer = setTimeout(async () => {
        try {
          setIsSaving(true);
          
          const calculatorData = {
            organizationId: currentOrganization.id,
            projectId,
            name: calculator?.name || `Kalkyle ${new Date().toLocaleDateString('nb-NO')}`,
            description: calculator?.description,
            entries,
            summary
          };

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
        } catch (error) {
          console.error('Failed to save calculator:', error);
        } finally {
          setIsSaving(false);
        }
      }, 2000);

      return () => clearTimeout(saveTimer);
    }
  }, [entries, summary, projectId, calculatorId, calculator, addCalculator, updateCalculator, currentOrganization, state.loading, navigate, settingsLoaded]);

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
      return updated;
    });
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
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
            </h1>
            {isSaving && (
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <div className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                <span>Lagrer...</span>
              </div>
            )}
            {lastSaved && !isSaving && (
              <div className="text-sm text-text-muted">
                Sist lagret: {lastSaved.toLocaleTimeString('nb-NO')}
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
        className="flex flex-wrap gap-2"
      >
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
        >
          <Settings size={16} />
          <span>Innstillinger</span>
        </button>

        <button
          onClick={() => setIsPDFSelectorOpen(true)}
          className="btn-secondary flex items-center gap-2"
        >
          <FileText size={16} />
          <span>Last ned tilbud</span>
        </button>
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
        companyInfo={companyInfo}
        customerInfo={customerInfo}
        calculationSettings={calculationSettings}
        onUpdateCompanyInfo={setCompanyInfo}
        onUpdateCustomerInfo={setCustomerInfo}
        onUpdateCalculationSettings={setCalculationSettings}
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