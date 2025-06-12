import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X } from 'lucide-react';
import { useProject, Customer } from '../../contexts/ProjectContext';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
}

const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  const { addCustomer, updateCustomer } = useProject();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: ''
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        company: customer.company || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        company: ''
      });
    }
  }, [customer, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (customer) {
      updateCustomer({
        ...customer,
        ...formData
      });
    } else {
      addCustomer(formData);
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-background-lighter border border-border p-6 shadow-xl transition-all">
                <Dialog.Title className="text-lg font-semibold mb-4 text-white flex justify-between items-center">
                  <span>{customer ? 'Rediger kunde' : 'Ny kunde'}</span>
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
                      placeholder="Kundens navn"
                    />
                  </div>

                  <div>
                    <label className="input-label">Firma</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full"
                      placeholder="Firmanavn (valgfritt)"
                    />
                  </div>

                  <div>
                    <label className="input-label">E-post</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full"
                      placeholder="kunde@eksempel.no"
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

                  <div>
                    <label className="input-label">Adresse</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full h-20 resize-none"
                      placeholder="Kundens adresse"
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
                      {customer ? 'Oppdater' : 'Opprett'}
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

export default CustomerModal;