import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  X, 
  Mail, 
  User, 
  Shield, 
  CheckCircle, 
  XCircle,
  Building2,
  Calendar,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import { motion } from 'framer-motion';

interface Invitation {
  id: string;
  organizationId: string;
  organizationName: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  invitedByName: string;
  expiresAt: string;
  createdAt: string;
}

interface InvitationNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitations: Invitation[];
}

const InvitationNotificationModal: React.FC<InvitationNotificationModalProps> = ({
  isOpen,
  onClose,
  invitations,
}) => {
  const { acceptInvitation, declineInvitation } = useProject();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processedInvitations, setProcessedInvitations] = useState<Set<string>>(new Set());

  const handleAccept = async (invitation: Invitation) => {
    setActionLoading(invitation.id);
    setError(null);

    try {
      await acceptInvitation(invitation.id);
      setProcessedInvitations(prev => new Set([...prev, invitation.id]));
      
      // Show success message briefly then close if all invitations are processed
      setTimeout(() => {
        if (processedInvitations.size + 1 >= invitations.length) {
          onClose();
        }
      }, 2000);
    } catch (error: any) {
      console.error('Failed to accept invitation:', error);
      setError(error.message || 'Feil ved akseptering av invitasjon. Prøv igjen.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (invitation: Invitation) => {
    if (!window.confirm(`Er du sikker på at du vil avslå invitasjonen til ${invitation.organizationName}?`)) {
      return;
    }

    setActionLoading(invitation.id);
    setError(null);

    try {
      await declineInvitation(invitation.id);
      setProcessedInvitations(prev => new Set([...prev, invitation.id]));
      
      // Close if all invitations are processed
      setTimeout(() => {
        if (processedInvitations.size + 1 >= invitations.length) {
          onClose();
        }
      }, 1000);
    } catch (error: any) {
      console.error('Failed to decline invitation:', error);
      setError(error.message || 'Feil ved avslåing av invitasjon. Prøv igjen.');
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield size={16} className="text-yellow-400" />;
      case 'manager': return <User size={16} className="text-blue-400" />;
      case 'user': return <User size={16} className="text-green-400" />;
      default: return <User size={16} className="text-text-muted" />;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Manager';
      case 'user': return 'Bruker';
      default: return role;
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const activeInvitations = invitations.filter(inv => 
    !processedInvitations.has(inv.id) && !isExpired(inv.expiresAt)
  );

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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-background-lighter border border-border shadow-xl transition-all">
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <Dialog.Title className="text-lg font-semibold text-white flex items-center gap-2">
                    <Mail size={20} className="text-primary-400" />
                    <span>Invitasjoner</span>
                    <span className="bg-primary-500/20 text-primary-400 px-2 py-1 rounded-full text-sm">
                      {activeInvitations.length}
                    </span>
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-text-muted hover:text-text-primary transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6">
                  {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  {activeInvitations.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
                      <h3 className="text-lg font-medium text-text-primary mb-2">Alle invitasjoner behandlet</h3>
                      <p className="text-text-muted">
                        Du har behandlet alle ventende invitasjoner.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-medium text-text-primary mb-2">
                          Du har {activeInvitations.length} ventende invitasjon{activeInvitations.length !== 1 ? 'er' : ''}
                        </h3>
                        <p className="text-text-muted text-sm">
                          Velg om du vil akseptere eller avslå hver invitasjon
                        </p>
                      </div>

                      {activeInvitations.map((invitation, index) => (
                        <motion.div
                          key={invitation.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 bg-background-darker/50 rounded-lg border border-border"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg">
                                <Building2 className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-text-primary text-lg">
                                  {invitation.organizationName}
                                </h4>
                                <p className="text-sm text-text-muted">
                                  Invitert av {invitation.invitedByName}
                                </p>
                              </div>
                            </div>
                            
                            {isExpired(invitation.expiresAt) && (
                              <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
                                Utløpt
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail size={14} className="text-text-muted" />
                              <span className="text-text-muted">E-post:</span>
                              <span className="font-medium text-text-primary">{invitation.email}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {getRoleIcon(invitation.role)}
                              <span className="text-text-muted">Rolle:</span>
                              <span className="font-medium text-text-primary">{getRoleText(invitation.role)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-text-muted" />
                              <span className="text-text-muted">Utløper:</span>
                              <span className="font-medium text-text-primary">
                                {new Date(invitation.expiresAt).toLocaleDateString('nb-NO')}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleAccept(invitation)}
                              disabled={actionLoading === invitation.id || isExpired(invitation.expiresAt)}
                              className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {actionLoading === invitation.id ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" />
                                  Aksepterer...
                                </>
                              ) : (
                                <>
                                  <CheckCircle size={16} />
                                  Aksepter
                                </>
                              )}
                            </button>
                            
                            <button
                              onClick={() => handleDecline(invitation)}
                              disabled={actionLoading === invitation.id || isExpired(invitation.expiresAt)}
                              className="flex-1 btn-secondary flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {actionLoading === invitation.id ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" />
                                  Avslår...
                                </>
                              ) : (
                                <>
                                  <XCircle size={16} />
                                  Avslå
                                </>
                              )}
                            </button>
                          </div>

                          {isExpired(invitation.expiresAt) && (
                            <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                              <p className="text-red-400 text-xs">
                                Denne invitasjonen er utløpt. Kontakt administratoren for å få en ny invitasjon.
                              </p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end p-6 border-t border-border">
                  <button
                    onClick={onClose}
                    className="btn-secondary"
                  >
                    {activeInvitations.length === 0 ? 'Lukk' : 'Behandle senere'}
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

export default InvitationNotificationModal;