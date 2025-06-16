import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, User, Mail, Shield, AlertTriangle } from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';

export interface OrganizationUser {
  id: string;
  organizationId: string;
  authUserId?: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'user';
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: OrganizationUser | null;
  mode: 'create' | 'edit' | 'invite';
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  user,
  mode
}) => {
  const { currentOrganization, addUser, updateUser, inviteUser } = useProject();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user' as 'admin' | 'manager' | 'user',
    isActive: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        isActive: user.isActive
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'user',
        isActive: true
      });
    }
    setError(null);
  }, [user, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentOrganization) {
      setError('Du må velge en organisasjon først');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'invite') {
        await inviteUser({
          organizationId: currentOrganization.id,
          email: formData.email,
          name: formData.name,
          role: formData.role
        });
      } else if (mode === 'edit' && user) {
        await updateUser({
          ...user,
          ...formData
        });
      } else if (mode === 'create') {
        await addUser({
          organizationId: currentOrganization.id,
          ...formData
        });
      }
      
      onClose();
    } catch (error: any) {
      console.error('Failed to save user:', error);
      setError(error.message || 'Feil ved lagring av bruker. Prøv igjen.');
    } finally {
      setIsLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'invite': return 'Inviter bruker';
      case 'edit': return 'Rediger bruker';
      case 'create': return 'Ny bruker';
      default: return 'Bruker';
    }
  };

  const getSubmitButtonText = () => {
    if (isLoading) {
      switch (mode) {
        case 'invite': return 'Sender invitasjon...';
        case 'edit': return 'Oppdaterer...';
        case 'create': return 'Oppretter...';
        default: return 'Lagrer...';
      }
    }
    
    switch (mode) {
      case 'invite': return 'Send invitasjon';
      case 'edit': return 'Oppdater';
      case 'create': return 'Opprett';
      default: return 'Lagre';
    }
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
                  <div className="flex items-center gap-2">
                    <User size={20} className="text-primary-400" />
                    <span>{getModalTitle()}</span>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-text-muted hover:text-text-primary transition-colors"
                  >
                    <X size={20} />
                  </button>
                </Dialog.Title>

                {!currentOrganization && (
                  <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-400 text-sm">
                      Du må velge en organisasjon før du kan administrere brukere.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {mode === 'invite' && (
                  <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-400 text-sm">
                      En invitasjon vil bli sendt til brukerens e-post. De kan deretter opprette en konto og bli med i organisasjonen.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="input-label">Navn *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full"
                      placeholder="Brukerens navn"
                      disabled={!currentOrganization || isLoading}
                    />
                  </div>

                  <div>
                    <label className="input-label">E-post *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={16} />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10"
                        placeholder="bruker@eksempel.no"
                        disabled={!currentOrganization || isLoading || (mode === 'edit' && user?.authUserId)}
                      />
                    </div>
                    {mode === 'edit' && user?.authUserId && (
                      <p className="text-xs text-text-muted mt-1">
                        E-post kan ikke endres for brukere som allerede har opprettet konto
                      </p>
                    )}
                  </div>

                  {mode !== 'invite' && (
                    <div>
                      <label className="input-label">Telefon</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full"
                        placeholder="+47 123 45 678"
                        disabled={!currentOrganization || isLoading}
                      />
                    </div>
                  )}

                  <div>
                    <label className="input-label">Rolle *</label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={16} />
                      <select
                        required
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                        className="w-full pl-10"
                        disabled={!currentOrganization || isLoading}
                      >
                        <option value="user">Bruker</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                    <div className="mt-2 text-xs text-text-muted space-y-1">
                      <div><strong>Bruker:</strong> Kan se og redigere egne data</div>
                      <div><strong>Manager:</strong> Kan administrere brukere og prosjekter</div>
                      <div><strong>Administrator:</strong> Full tilgang til organisasjonen</div>
                    </div>
                  </div>

                  {mode === 'edit' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="rounded border-border text-primary-500 focus:ring-primary-400"
                        disabled={!currentOrganization || isLoading}
                      />
                      <label htmlFor="isActive" className="text-sm text-text-primary">
                        Aktiv bruker
                      </label>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={onClose}
                      disabled={isLoading}
                    >
                      Avbryt
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={!currentOrganization || isLoading}
                    >
                      {getSubmitButtonText()}
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

export default UserModal;