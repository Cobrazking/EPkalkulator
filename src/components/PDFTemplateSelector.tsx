import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, FileText, Download, Eye } from 'lucide-react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import QuotePDF from './QuotePDF';
import QuotePDFModern from './QuotePDFModern';
import { CalculationEntry, CompanyInfo, CustomerInfo } from '../types';

interface PDFTemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  entries: CalculationEntry[];
  companyInfo: CompanyInfo;
  customerInfo: CustomerInfo;
  projectName: string;
}

const PDFTemplateSelector: React.FC<PDFTemplateSelectorProps> = ({
  isOpen,
  onClose,
  entries,
  companyInfo,
  customerInfo,
  projectName
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<'standard' | 'modern'>('standard');
  const [showPreview, setShowPreview] = useState(false);

  const templates = [
    {
      id: 'standard' as const,
      name: 'Standard tilbudsbrev',
      description: 'Klassisk og enkel layout med fokus på innhold',
      preview: '/api/placeholder/300/400', // Placeholder for preview image
      component: QuotePDF
    },
    {
      id: 'modern' as const,
      name: 'Tilbudsbrev MAL2',
      description: 'Moderne design med farger og profesjonell layout',
      preview: '/api/placeholder/300/400', // Placeholder for preview image
      component: QuotePDFModern
    }
  ];

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
  const SelectedComponent = selectedTemplateData?.component || QuotePDF;

  const getFileName = () => {
    const templateSuffix = selectedTemplate === 'modern' ? '-mal2' : '';
    return `tilbud-${projectName}${templateSuffix}-${new Date().toISOString().slice(0, 10)}.pdf`;
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-xl bg-background-lighter border border-border shadow-xl transition-all">
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <Dialog.Title className="text-lg font-semibold text-white flex items-center gap-2">
                    <FileText size={20} className="text-primary-400" />
                    <span>Velg tilbudsmal</span>
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-text-muted hover:text-text-primary transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6">
                  {!showPreview ? (
                    <>
                      {/* Template Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {templates.map((template) => (
                          <div
                            key={template.id}
                            onClick={() => setSelectedTemplate(template.id)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                              selectedTemplate === template.id
                                ? 'border-primary-500 bg-primary-500/10'
                                : 'border-border hover:border-border-light bg-background-darker/50'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-20 h-24 bg-background-darker rounded border border-border flex items-center justify-center">
                                <FileText size={24} className="text-text-muted" />
                              </div>
                              <div className="flex-1">
                                <h3 className={`font-semibold mb-2 ${
                                  selectedTemplate === template.id ? 'text-primary-400' : 'text-text-primary'
                                }`}>
                                  {template.name}
                                </h3>
                                <p className="text-sm text-text-muted mb-3">
                                  {template.description}
                                </p>
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full border-2 ${
                                    selectedTemplate === template.id
                                      ? 'border-primary-500 bg-primary-500'
                                      : 'border-border'
                                  }`} />
                                  <span className="text-xs text-text-muted">
                                    {selectedTemplate === template.id ? 'Valgt' : 'Velg denne malen'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Preview Section */}
                      <div className="bg-background-darker/50 rounded-lg p-4 mb-6">
                        <h4 className="font-medium text-text-primary mb-2">Valgt mal: {selectedTemplateData?.name}</h4>
                        <p className="text-sm text-text-muted">{selectedTemplateData?.description}</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-between">
                        <button
                          onClick={() => setShowPreview(true)}
                          className="btn-secondary flex items-center gap-2"
                        >
                          <Eye size={16} />
                          Forhåndsvis
                        </button>

                        <div className="flex gap-2">
                          <button
                            onClick={onClose}
                            className="btn-secondary"
                          >
                            Avbryt
                          </button>
                          
                          <PDFDownloadLink
                            document={
                              <SelectedComponent 
                                entries={entries} 
                                companyInfo={companyInfo} 
                                customerInfo={customerInfo}
                              />
                            }
                            fileName={getFileName()}
                          >
                            {({ loading }) => (
                              <button 
                                className="btn-primary flex items-center gap-2"
                                disabled={loading}
                              >
                                <Download size={16} />
                                <span>{loading ? 'Genererer...' : 'Last ned tilbud'}</span>
                              </button>
                            )}
                          </PDFDownloadLink>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* PDF Preview */}
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="font-medium text-text-primary">
                          Forhåndsvisning: {selectedTemplateData?.name}
                        </h4>
                        <button
                          onClick={() => setShowPreview(false)}
                          className="btn-secondary"
                        >
                          Tilbake til valg
                        </button>
                      </div>

                      <div className="border border-border rounded-lg overflow-hidden" style={{ height: '600px' }}>
                        <PDFViewer width="100%" height="100%">
                          <SelectedComponent 
                            entries={entries} 
                            companyInfo={companyInfo}
                            customerInfo={customerInfo}
                          />
                        </PDFViewer>
                      </div>

                      <div className="flex justify-between mt-4">
                        <button
                          onClick={() => setShowPreview(false)}
                          className="btn-secondary"
                        >
                          Endre mal
                        </button>

                        <PDFDownloadLink
                          document={
                            <SelectedComponent 
                              entries={entries}
                              companyInfo={companyInfo} 
                              customerInfo={customerInfo}
                            />
                          }
                          fileName={getFileName()}
                        >
                          {({ loading }) => (
                            <button 
                              className="btn-primary flex items-center gap-2"
                              disabled={loading}
                            >
                              <Download size={16} />
                              <span>{loading ? 'Genererer...' : 'Last ned tilbud'}</span>
                            </button>
                          )}
                        </PDFDownloadLink>
                      </div>
                    </>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PDFTemplateSelector;