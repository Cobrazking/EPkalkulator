import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, Upload, User as UserIcon } from 'lucide-react';
import { useProject, User } from '../../contexts/ProjectContext';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const { addUser, updateUser, currentOrganization } = useProject();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user' as 'admin' | 'manager' | 'user',
    isActive: true,
    avatar: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        isActive: user.isActive,
        avatar: user.avatar || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'user',
        isActive: true,
        avatar: ''
      });
    }
  }, [user, isOpen]);

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Bildet er for stort. Maksimal størrelse er 2MB.');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Kun bildefiler er tillatt.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          avatar: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setFormData({
      ...formData,
      avatar: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentOrganization) {
      alert('Du må velge en organisasjon først');
      return;
    }
    
    if (user) {
      updateUser({
        ...user,
        ...formData
      });
    } else {
      addUser({
        ...formData,
        organizationId: currentOrganization.id
      });
    }
    
    onClose();
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Leder';
      case 'user': return 'Bruker';
      default: return role;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin': return 'Full tilgang til alle funksjoner og innstillinger';
      case 'manager': return 'Kan administrere prosjekter og kalkyler';
      case 'user': return 'Kan opprette og redigere kalkyler';
      default: return '';
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
                  <span>{user ? 'Rediger bruker' : 'Ny bruker'}</span>
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
                      Du må velge en organisasjon før du kan legge til brukere.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Avatar Upload */}
                  <div>
                    <label className="input-label">Profilbilde</label>
                    <div className="mt-2 flex items-center gap-4">
                      {formData.avatar ? (
                        <div className="relative">
                          <img 
                            src={formData.avatar} 
                            alt="Profilbilde" 
                            className="h-16 w-16 object-cover rounded-full border border-border"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveAvatar}
                            className="absolute -top-2 -right-2 p-1 bg-background-lighter rounded-full border border-border hover:bg-background text-red-400"
                            title="Fjern profilbilde"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center w-16 h-16 border-2 border-dashed border-border rounded-full cursor-pointer hover:border-primary-400 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                            disabled={!currentOrganization}
                          />
                          <UserIcon size={20} className="text-text-muted" />
                        </label>
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-text-muted">
                          Last opp et profilbilde (valgfritt)
                        </p>
                        <p className="text-xs text-text-muted">
                          Maksimal størrelse: 2MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Navn *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full"
                      placeholder="Fullt navn"
                      disabled={!currentOrganization}
                    />
                  </div>

                  <div>
                    <label className="input-label">E-post *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full"
                      placeholder="bruker@eksempel.no"
                      disabled={!currentOrganization}
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
                      disabled={!currentOrganization}
                    />
                  </div>

                  <div>
                    <label className="input-label">Rolle *</label>
                    <select
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="w-full"
                      disabled={!currentOrganization}
                    >
                      <option value="user">Bruker</option>
                      <option value="manager">Leder</option>
                      <option value="admin">Administrator</option>
                    </select>
                    <p className="text-xs text-text-muted mt-1">
                      {getRoleDescription(formData.role)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-border text-primary-500 focus:ring-primary-400"
                      disabled={!currentOrganization}
                    />
                    <label htmlFor="isActive" className="text-sm text-text-primary">
                      Aktiv bruker
                    </label>
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
                      disabled={!currentOrganization}
                    >
                      {user ? 'Oppdater' : 'Opprett'}
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