import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Upload, X, Save } from 'lucide-react';
import { CompanyInfo, CustomerInfo, CalculationSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyInfo: CompanyInfo;
  customerInfo: CustomerInfo;
  calculationSettings: CalculationSettings;
  onUpdateCompanyInfo: (info: CompanyInfo) => void;
  onUpdateCustomerInfo: (info: CustomerInfo) => void;
  onUpdateCalculationSettings: (settings: CalculationSettings) => void;
  onSave?: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  companyInfo,
  customerInfo,
  calculationSettings,
  onUpdateCompanyInfo,
  onUpdateCustomerInfo,
  onUpdateCalculationSettings,
  onSave,
}) => {
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateCompanyInfo({
          ...companyInfo,
          logo: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    onUpdateCompanyInfo({
      ...companyInfo,
      logo: undefined
    });
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-background-lighter border border-border p-6 shadow-xl transition-all">
                <Dialog.Title className="text-lg font-semibold mb-4 text-white">
                  Innstillinger
                </Dialog.Title>

                <div className="grid grid-cols-1 gap-6">
                  {/* Calculation Settings */}
                  <div>
                    <h3 className="text-sm font-medium text-text-secondary mb-4">Kalkyle innstillinger</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="input-label">Kostpris ressurs</label>
                        <input
                          type="number"
                          value={calculationSettings.defaultKostpris}
                          onChange={(e) => onUpdateCalculationSettings({
                            ...calculationSettings,
                            defaultKostpris: Number(e.target.value)
                          })}
                          className="w-full text-right"
                        />
                      </div>
                      <div>
                        <label className="input-label">Salgspris ressurs</label>
                        <input
                          type="number"
                          value={calculationSettings.defaultTimepris}
                          onChange={(e) => onUpdateCalculationSettings({
                            ...calculationSettings,
                            defaultTimepris: Number(e.target.value)
                          })}
                          className="w-full text-right"
                        />
                      </div>
                      <div>
                        <label className="input-label">Påslag (%)</label>
                        <input
                          type="number"
                          value={calculationSettings.defaultPaslag}
                          onChange={(e) => onUpdateCalculationSettings({
                            ...calculationSettings,
                            defaultPaslag: Number(e.target.value)
                          })}
                          className="w-full text-right"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Company Information */}
                  <div>
                    <h3 className="text-sm font-medium text-text-secondary mb-4">Firmaopplysninger</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="input-label">Tilbudstittel</label>
                        <input
                          type="text"
                          value={companyInfo.tilbudstittel || ''}
                          onChange={(e) => onUpdateCompanyInfo({ ...companyInfo, tilbudstittel: e.target.value })}
                          className="w-full"
                          placeholder="F.eks. Tilbud på elektrisk arbeid"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="input-label">Firmalogo</label>
                        <div className="mt-2 flex items-center gap-4">
                          {companyInfo.logo ? (
                            <div className="relative">
                              <img 
                                src={companyInfo.logo} 
                                alt="Firmalogo" 
                                className="h-16 w-auto object-contain rounded"
                              />
                              <button
                                onClick={handleRemoveLogo}
                                className="absolute -top-2 -right-2 p-1 bg-background-lighter rounded-full border border-border hover:bg-background"
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
                      <div>
                        <label className="input-label">Firma</label>
                        <input
                          type="text"
                          value={companyInfo.firma}
                          onChange={(e) => onUpdateCompanyInfo({ ...companyInfo, firma: e.target.value })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="input-label">Navn</label>
                        <input
                          type="text"
                          value={companyInfo.navn}
                          onChange={(e) => onUpdateCompanyInfo({ ...companyInfo, navn: e.target.value })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="input-label">E-post</label>
                        <input
                          type="email"
                          value={companyInfo.epost}
                          onChange={(e) => onUpdateCompanyInfo({ ...companyInfo, epost: e.target.value })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="input-label">Telefon</label>
                        <input
                          type="tel"
                          value={companyInfo.tlf}
                          onChange={(e) => onUpdateCompanyInfo({ ...companyInfo, tlf: e.target.value })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="input-label">Ref. nr</label>
                        <input
                          type="text"
                          value={companyInfo.refNr}
                          onChange={(e) => onUpdateCompanyInfo({ ...companyInfo, refNr: e.target.value })}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div>
                    <h3 className="text-sm font-medium text-text-secondary mb-4">Kundeopplysninger</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="input-label">Kunde</label>
                        <input
                          type="text"
                          value={customerInfo.kunde}
                          onChange={(e) => onUpdateCustomerInfo({ ...customerInfo, kunde: e.target.value })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="input-label">Adresse</label>
                        <input
                          type="text"
                          value={customerInfo.adresse}
                          onChange={(e) => onUpdateCustomerInfo({ ...customerInfo, adresse: e.target.value })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="input-label">E-post</label>
                        <input
                          type="email"
                          value={customerInfo.epost}
                          onChange={(e) => onUpdateCustomerInfo({ ...customerInfo, epost: e.target.value })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="input-label">Telefon</label>
                        <input
                          type="tel"
                          value={customerInfo.tlf}
                          onChange={(e) => onUpdateCustomerInfo({ ...customerInfo, tlf: e.target.value })}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  {onSave && (
                    <button
                      type="button"
                      className="btn-primary flex items-center gap-2"
                      onClick={() => {
                        onSave();
                        onClose();
                      }}
                    >
                      <Save size={16} />
                      Lagre
                    </button>
                  )}
                  <button
                    type="button"
                    className={onSave ? "btn-secondary" : "btn-primary"}
                    onClick={onClose}
                  >
                    Lukk
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SettingsModal;