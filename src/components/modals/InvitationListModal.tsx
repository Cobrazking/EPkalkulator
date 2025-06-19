import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  X, 
  Mail, 
  User, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Trash2,
  Calendar,
  Send
} from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';

interface Invitation {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invitedBy: string;
  expiresAt: string;
  createdAt: string;
  acceptedAt?: string;
}

interface InvitationListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InvitationListModal: React.FC<InvitationListModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentOrganization, getInvitations, cancelInvitation, resendInvitation } = useProject();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentOrganization) {
      loadInvitations();
    }
  }, [isOpen, currentOrganization]);

  const loadInvitations = async () => {
    if (!currentOrganization) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getInvitations(currentOrganization.id);
      setInvitations(data);
    } catch (error: any) {
      console.error('Failed to load invitations:', error);
      setError('Feil ved lasting av invitasjoner. Prøv igjen.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (invitationId: string) => {
    if (!window.confirm('Er du sikker på at du vil avbryte denne invitasjonen?')) {
      return;
    }

    setActionLoading(invitationId);
    try {
      await cancelInvitation(invitationId);
      await loadInvitations(); // Refresh list
    } catch (error: any) {
      console.error('Failed to cancel invitation:', error);
      setError('Feil ved avbrytelse av invitasjon. Prøv igjen.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResend = async (invitationId: string) => {
    setActionLoading(invitationId);
    try {
      await resendInvitation(invitationId);
      await loadInvitations(); // Refresh list
    } catch (error: any) {
      console.error('Failed to resend invitation:', error);
      setError('Feil ved gjensendig av invitasjon. Prøv igjen.');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} className="text-yellow-400" />;
      case 'accepted': return <CheckCircle size={16} className="text-green-400" />;
      case 'expired': return <XCircle size={16} className="text-red-400" />;
      case 'cancelled': return <XCircle size={16} className="text-gray-400" />;
      default: return <Clock size={16} className="text-text-muted" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Venter';
      case 'accepted': return 'Akseptert';
      case 'expired': return 'Utløpt';
      case 'cancelled': return 'Avbrutt';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'accepted': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'expired': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'cancelled': return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
      default: return 'text-text-muted bg-background-darker border-border';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield size={14} className="text-yellow-400" />;
      case 'manager': return <User size={14} className="text-blue-400" />;
      case 'user': return <User size={14} className="text-green-400" />;
      default: return <User size={14} className="text-text-muted" />;
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

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
  const otherInvitations = invitations.filter(inv => inv.status !== 'pending');

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
                    <Mail size={20} className="text-primary-400" />
                    <span>Invitasjoner</span>
                    {currentOrganization && (
                      <span className="text-sm text-text-muted font-normal">
                        - {currentOrganization.name}
                      </span>
                    )}
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
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-text-muted">Laster invitasjoner...</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Pending Invitations */}
                      {pendingInvitations.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
                            <Clock size={18} className="text-yellow-400" />
                            Ventende invitasjoner ({pendingInvitations.length})
                          </h3>
                          <div className="space-y-3">
                            {pendingInvitations.map((invitation) => (
                              <div
                                key={invitation.id}
                                className="p-4 bg-background-darker/50 rounded-lg border border-border"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className="flex items-center gap-2">
                                        <User size={16} className="text-text-muted" />
                                        <span className="font-medium text-text-primary">{invitation.name}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Mail size={14} className="text-text-muted" />
                                        <span className="text-sm text-text-muted">{invitation.email}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-sm text-text-muted">
                                      <div className="flex items-center gap-1">
                                        {getRoleIcon(invitation.role)}
                                        <span>{getRoleText(invitation.role)}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        <span>
                                          Utløper: {new Date(invitation.expiresAt).toLocaleDateString('nb-NO')}
                                          {isExpired(invitation.expiresAt) && (
                                            <span className="text-red-400 ml-1">(Utløpt)</span>
                                          )}
                                        </span>
                                      </div>
                                      <div>
                                        Invitert av: {invitation.invitedBy}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 ml-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(invitation.status)}`}>
                                      {getStatusIcon(invitation.status)}
                                      {getStatusText(invitation.status)}
                                    </span>
                                    
                                    <button
                                      onClick={() => handleResend(invitation.id)}
                                      disabled={actionLoading === invitation.id}
                                      className="p-2 text-text-muted hover:text-blue-400 transition-colors rounded-lg hover:bg-background-darker/50 disabled:opacity-50"
                                      title="Send på nytt"
                                    >
                                      {actionLoading === invitation.id ? (
                                        <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                                      ) : (
                                        <RotateCcw size={16} />
                                      )}
                                    </button>
                                    
                                    <button
                                      onClick={() => handleCancel(invitation.id)}
                                      disabled={actionLoading === invitation.id}
                                      className="p-2 text-text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-background-darker/50 disabled:opacity-50"
                                      title="Avbryt invitasjon"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Other Invitations */}
                      {otherInvitations.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium text-text-primary mb-4">
                            Tidligere invitasjoner ({otherInvitations.length})
                          </h3>
                          <div className="space-y-3">
                            {otherInvitations.map((invitation) => (
                              <div
                                key={invitation.id}
                                className="p-4 bg-background-darker/30 rounded-lg border border-border opacity-75"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className="flex items-center gap-2">
                                        <User size={16} className="text-text-muted" />
                                        <span className="font-medium text-text-primary">{invitation.name}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Mail size={14} className="text-text-muted" />
                                        <span className="text-sm text-text-muted">{invitation.email}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-sm text-text-muted">
                                      <div className="flex items-center gap-1">
                                        {getRoleIcon(invitation.role)}
                                        <span>{getRoleText(invitation.role)}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        <span>
                                          {invitation.status === 'accepted' && invitation.acceptedAt
                                            ? `Akseptert: ${new Date(invitation.acceptedAt).toLocaleDateString('nb-NO')}`
                                            : `Opprettet: ${new Date(invitation.createdAt).toLocaleDateString('nb-NO')}`
                                          }
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(invitation.status)}`}>
                                    {getStatusIcon(invitation.status)}
                                    {getStatusText(invitation.status)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {invitations.length === 0 && (
                        <div className="text-center py-12">
                          <Mail className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-50" />
                          <h3 className="text-lg font-medium text-text-primary mb-2">Ingen invitasjoner</h3>
                          <p className="text-text-muted">
                            Det er ikke sendt noen invitasjoner for denne organisasjonen ennå.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end p-6 border-t border-border">
                  <button
                    onClick={onClose}
                    className="btn-secondary"
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

export default InvitationListModal;