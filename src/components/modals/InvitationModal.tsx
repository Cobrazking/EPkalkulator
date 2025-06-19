import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, Mail, User, Shield, Send, AlertTriangle, CheckCircle, Copy } from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';

interface InvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InvitationModal: React.FC<InvitationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentOrganization, sendInvitation } = useProject();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'user' as 'admin' | 'manager' | 'user'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [invitationUrl, setInvitationUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentOrganization) {
      setError('Du må velge en organisasjon først');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setInvitationUrl(null);

    try {
      await sendInvitation({
        organizationId: currentOrganization.id,
        email: formData.email.trim(),
        name: formData.name.trim(),
        role: formData.role
      });
      
      setSuccess(`Invitasjon opprettet for ${formData.email}!`);
      setFormData({ email: '', name: '', role: 'user' });
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
        setSuccess(null);
        setInvitationUrl(null);
      }, 5000);
    } catch (error: any) {
      console.error('Failed to send invitation:', error);
      setError(error.message || 'Feil ved sending av invitasjon. Prøv igjen.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ email: '', name: '', role: 'user' });
      setError(null);
      setSuccess(null);
      setInvitationUrl(null);
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
                    <Send size={20} className="text-primary-400" />
                    <span>Send invitasjon</span>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={isLoading}
                    className="text-text-muted hover:text-text-primary transition-colors disabled:opacity-50"
                  >
                    <X size={20} />
                  </button>
                </Dialog.Title>

                {!currentOrganization && (
                  <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-400 text-sm">
                      Du må velge en organisasjon før du kan sende invitasjoner.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-green-400 text-sm">{success}</p>
                      <p className="text-green-300 text-xs mt-1">
                        Invitasjonen er klar til å deles med personen.
                      </p>
                    </div>
                  </div>
                )}

                {invitationUrl && (
                  <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-400 text-sm mb-2">Invitasjonslenke:</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={invitationUrl}
                        readOnly
                        className="flex-1 text-xs bg-background-darker border border-border rounded px-2 py-1"
                      />
                      <button
                        onClick={() => copyToClipboard(invitationUrl)}
                        className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                        title="Kopier lenke"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-400 text-sm">
                    Personen vil motta en invitasjonslenke som de kan bruke for å bli med i organisasjonen.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="input-label">E-postadresse *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={16} />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10"
                        placeholder="bruker@eksempel.no"
                        disabled={!currentOrganization || isLoading}
                      />
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      E-postadressen som invitasjonen skal sendes til
                    </p>
                  </div>

                  <div>
                    <label className="input-label">Navn *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={16} />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-10"
                        placeholder="Fullt navn"
                        disabled={!currentOrganization || isLoading}
                      />
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      Navnet på personen som inviteres
                    </p>
                  </div>

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

                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleClose}
                      disabled={isLoading}
                    >
                      Avbryt
                    </button>
                    <button
                      type="submit"
                      className="btn-primary flex items-center gap-2"
                      disabled={!currentOrganization || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sender...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Send invitasjon
                        </>
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

export default InvitationModal;