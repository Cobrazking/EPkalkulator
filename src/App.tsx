import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import { Download, Upload, Save, Database, FileSpreadsheet, FileText, Settings } from 'lucide-react';
import * as XLSX from 'xlsx';
import { PDFDownloadLink } from '@react-pdf/renderer';

import SummaryCard from './components/SummaryCard';
import CalculationTable from './components/CalculationTable';
import QuotePDF from './components/QuotePDF';
import SettingsModal from './components/SettingsModal';
import { CalculationEntry, CalculationSummary, CompanyInfo, CustomerInfo, CalculationSettings } from './types';
import { calculateRow, calculateSummary } from './utils/calculations';
import { exportToExcel } from './utils/excel';
import useLocalStorage from './hooks/useLocalStorage';

const App: React.FC = () => {
  const initialSettings: CalculationSettings = {
    defaultKostpris: 700,
    defaultTimepris: 995,
    defaultPaslag: 20
  };

  const initialEntries: CalculationEntry[] = [
    {
      id: uuidv4(),
      post: '',
      beskrivelse: '',
      antall: 1,
      kostMateriell: 1000,
      timer: 1,
      kostpris: initialSettings.defaultKostpris,
      timepris: initialSettings.defaultTimepris,
      paslagMateriell: initialSettings.defaultPaslag,
      enhetspris: 2195,
      sum: 2195,
      kommentar: ''
    },
    {
      id: uuidv4(),
      post: '',
      beskrivelse: '',
      antall: 1,
      kostMateriell: 0,
      timer: 0,
      kostpris: initialSettings.defaultKostpris,
      timepris: initialSettings.defaultTimepris,
      paslagMateriell: initialSettings.defaultPaslag,
      enhetspris: 0,
      sum: 0,
      kommentar: ''
    }
  ];

  const initialCompanyInfo: CompanyInfo = {
    firma: '',
    navn: '',
    epost: '',
    tlf: '',
    refNr: ''
  };

  const initialCustomerInfo: CustomerInfo = {
    kunde: '',
    adresse: '',
    epost: '',
    tlf: ''
  };

  const [entries, setEntries] = useLocalStorage<CalculationEntry[]>('calculator-entries', initialEntries);
  const [companyInfo, setCompanyInfo] = useLocalStorage<CompanyInfo>('company-info', initialCompanyInfo);
  const [customerInfo, setCustomerInfo] = useLocalStorage<CustomerInfo>('customer-info', initialCustomerInfo);
  const [calculationSettings, setCalculationSettings] = useLocalStorage<CalculationSettings>('calculation-settings', initialSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [summary, setSummary] = useState<CalculationSummary>({
    totalSum: 0,
    fortjeneste: 0,
    timerTotalt: 0,
    bidrag: 0,
    totalKostprisTimer: 0
  });

  useEffect(() => {
    setSummary(calculateSummary(entries));
  }, [entries]);

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
      // Validate indices first
      if (
        startIndex < 0 || 
        endIndex < 0 || 
        startIndex >= prevEntries.length || 
        endIndex >= prevEntries.length || 
        startIndex === endIndex
      ) {
        return prevEntries;
      }

      // Create a new array to maintain immutability
      const newEntries = [...prevEntries];
      
      // Remove the entry from the start position
      const [entryToMove] = newEntries.splice(startIndex, 1);
      
      // Insert the entry at the end position
      newEntries.splice(endIndex, 0, entryToMove);
      
      return newEntries;
    });
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
    
    const exportFileDefaultName = `kalkyle-${new Date().toISOString().slice(0, 10)}.json`;
    
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
            if (data.companyInfo) {
              setCompanyInfo(data.companyInfo);
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
    <div className="min-h-screen bg-background text-text-primary">
      <div className="w-full px-4 py-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div className="flex flex-wrap gap-2">
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
            </div>

            <div className="flex gap-2 mt-2 md:mt-0">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <Settings size={16} />
                <span>Innstillinger</span>
              </button>

              <PDFDownloadLink
                document={<QuotePDF entries={entries} companyInfo={companyInfo} customerInfo={customerInfo} />}
                fileName={`tilbud-${new Date().toISOString().slice(0, 10)}.pdf`}
              >
                {({ loading }) => (
                  <button
                    className="btn-secondary flex items-center gap-2"
                  >
                    <FileText size={16} />
                    <span>{loading ? 'Laster...' : 'Last ned tilbud'}</span>
                  </button>
                )}
              </PDFDownloadLink>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-4"
        >
          <SummaryCard summary={summary} />
        </motion.div>
        
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
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-4 flex justify-center text-text-muted text-sm"
        >
          <div className="flex items-center">
            <Database size={14} className="mr-2" />
            Data lagres automatisk i din nettleser
          </div>
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
      </div>
    </div>
  );
};

export default App;