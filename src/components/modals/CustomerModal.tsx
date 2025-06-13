import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useProject, Customer } from '../../contexts/ProjectContext';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
}

const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  const { addCustomer, updateCustomer, currentOrganization } = useProject();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    // Clear errors when modal opens/closes or customer changes
    setErrors({});
  }, [customer, isOpen]);

  const validateForm = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    // Name validation (required)
    if (!formData.name.trim()) {
      newErrors.name = 'Navn er påkrevd';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Navn må være minst 2 tegn';
    }

    // Email validation (optional but must be valid if provided)
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Ugyldig e-postformat';
      }
    }

    // Phone validation (optional but must be valid if provided)
    if (formData.phone.trim()) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Ugyldig telefonnummer';
      }
    }

    // Company name validation (optional but reasonable length if provided)
    if (formData.company.trim() && formData.company.trim().length > 100) {
      newErrors.company = 'Firmanavn kan ikke være lengre enn 100 tegn';
    }

    // Address validation (optional but reasonable length if provided)
    if (formData.address.trim() && formData.address.trim().length > 200) {
      newErrors.address = 'Adresse kan ikke være lengre enn 200 tegn';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentOrganization) {
      alert('Du må velge en organisasjon først');
      return;
    }

    setIsSubmitting(true);
    
    // Validate form
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    // Clear errors if validation passes
    setErrors({});

    try {
      if (customer) {
        updateCustomer({
          ...customer,
          ...formData,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          company: formData.company.trim()
        });
      } else {
        addCustomer({
          ...formData,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          company: formData.company.trim(),
          organizationId: currentOrganization.id
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Det oppstod en feil ved lagring av kunde. Prøv igjen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear error for this field when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const isFormValid = () => {
    return formData.name.trim().length >= 2 && 
           Object.keys(errors).length === 0 && 
           currentOrganization;
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
                    disabled={isSubmitting}
                    className="text-text-muted hover:text-text-primary transition-colors disabled:opacity-50"
                  >
                    <X size={20} />
                  </button>
                </Dialog.Title>

                {!currentOrganization && (
                  <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2">
                    <AlertCircle size={16} className="text-yellow-400 flex-shrink-0" />
                    <p className="text-yellow-400 text-sm">
                      Du må velge en organisasjon før du kan legge til kunder.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="input-label">
                      Navn <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full ${
                        errors.name 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : ''
                      }`}
                      placeholder="Kundens navn"
                      disabled={!currentOrganization || isSubmitting}
                    />
                    {errors.name && (
                      <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="input-label">Firma</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className={`w-full ${
                        errors.company 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : ''
                      }`}
                      placeholder="Firmanavn (valgfritt)"
                      disabled={!currentOrganization || isSubmitting}
                    />
                    {errors.company && (
                      <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.company}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="input-label">E-post</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full ${
                        errors.email 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : ''
                      }`}
                      placeholder="kunde@eksempel.no"
                      disabled={!currentOrganization || isSubmitting}
                    />
                    {errors.email && (
                      <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="input-label">Telefon</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full ${
                        errors.phone 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : ''
                      }`}
                      placeholder="+47 123 45 678"
                      disabled={!currentOrganization || isSubmitting}
                    />
                    {errors.phone && (
                      <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="input-label">Adresse</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={`w-full h-20 resize-none ${
                        errors.address 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : ''
                      }`}
                      placeholder="Kundens adresse"
                      disabled={!currentOrganization || isSubmitting}
                    />
                    {errors.address && (
                      <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={onClose}
                      disabled={isSubmitting}
                    >
                      Avbryt
                    </button>
                    <button
                      type="submit"
                      className="btn-primary flex items-center gap-2"
                      disabled={!isFormValid() || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {customer ? 'Oppdaterer...' : 'Oppretter...'}
                        </>
                      ) : (
                        customer ? 'Oppdater' : 'Opprett'
                      )}
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