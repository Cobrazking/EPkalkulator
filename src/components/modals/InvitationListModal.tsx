import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  X, 
  Mail, 
  User, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Trash2,
  RefreshCw,
  Calendar,
  Crown,
  Settings as SettingsIcon,
  Users
} from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';

interface Invitation {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invited_by: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
  updated_at: string;
}

interface InvitationListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InvitationListModal: React.FC<InvitationListModalProps> = ({ isOpen, onClose }) => {
  const { currentOrganization } = useProject();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentOrganization) {
      fetchInvitations();
    }
  }, [isOpen, currentOrganization]);

  const fetchInvitations = async () => {
    if (!currentOrganization) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // This would typically fetch from your API/Supabase
      // For now, we'll use mock data
      const mockInvitations: Invitation[] = [
        {
          id: '1',
          email: 'john@example.com',
          name: 'John Doe',
          role: 'user',
          status: 'pending',
          invited_by: 'current-user',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          email: 'jane@example.com',
          name: 'Jane Smith',
          role: 'manager',
          status: 'accepted',
          invited_by: 'current-user',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          accepted_at: new Date().toISOString(),
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];
      
      setInvitations(mockInvitations);
    } catch (err: any) {
      console.error('Failed to fetch invitations:', err);
      setError('Kunne ikke hente invitasjoner. Prøv igjen.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInvitation = async (invitationId: string) => {
    if (!window.confirm('Er du sikker på at du vil slette denne invitasjonen?')) {
      return;
    }

    try {
      // This would typically delete from your API/Supabase
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (err: any) {
      console.error('Failed to delete invitation:', err);
      setError('Kunne ikke slette invitasjonen. Prøv igjen.');
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      // This would typically resend via your API/Supabase
      console.log('Resending invitation:', invitationId);
      // Update the invitation status or expiry date
    } catch (err: any) {
      console.error('Failed to resend invitation:', err);
      setError('Kunne ikke sende invitasjonen på nytt. Prøv igjen.');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown size={16} className="text-yellow-400" />;
      case 'manager': return <SettingsIcon size={16} className="text-blue-400" />;
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
      case 'cancelled': return 'Kansellert';
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

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-xl bg-background-lighter border border-border shadow-xl transition-all">
                <div className="p-6">
                  <Dialog.Title className="text-lg font-semibold mb-4 text-white flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Users size={20} className="text-primary-400" />
                      <span>Invitasjoner</span>
                      {currentOrganization && (
                        <span className="text-sm text-text-muted">
                          - {currentOrganization.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={fetchInvitations}
                        disabled={isLoading}
                        className="p-2 text-text-muted hover:text-primary-400 transition-colors rounded-lg hover:bg-background-darker/50 disabled:opacity-50"
                        title="Oppdater"
                      >
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                      </button>
                      <button
                        onClick={onClose}
                        className="text-text-muted hover:text-text-primary transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </Dialog.Title>

                  {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="text-center py-8">
                        <RefreshCw className="w-8 h-8 mx-auto mb-4 text-primary-400 animate-spin" />
                        <p className="text-text-muted">Laster invitasjoner...</p>
                      </div>
                    ) : invitations.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-50" />
                        <h3 className="text-lg font-medium text-text-primary mb-2">
                          Ingen invitasjoner
                        </h3>
                        <p className="text-text-muted">
                          Det er ingen aktive invitasjoner for denne organisasjonen.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {invitations.map((invitation) => (
                          <div
                            key={invitation.id}
                            className="card p-4 hover:shadow-hover transition-all duration-300"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                  {invitation.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-text-primary">{invitation.name}</h4>
                                    <div className="flex items-center gap-1">
                                      {getRoleIcon(invitation.role)}
                                      <span className="text-sm text-text-muted">{getRoleText(invitation.role)}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-sm text-text-muted">
                                    <Mail size={14} />
                                    <span>{invitation.email}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(invitation.status)}`}>
                                    {getStatusIcon(invitation.status)}
                                    {getStatusText(invitation.status)}
                                  </div>
                                  
                                  <div className="mt-1 text-xs text-text-muted">
                                    {invitation.status === 'accepted' && invitation.accepted_at ? (
                                      <div className="flex items-center gap-1">
                                        <CheckCircle size={12} />
                                        <span>Akseptert {formatDate(invitation.accepted_at)}</span>
                                      </div>
                                    ) : invitation.status === 'pending' ? (
                                      <div className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        <span>
                                          Utløper {formatDate(invitation.expires_at)}
                                          {isExpired(invitation.expires_at) && (
                                            <span className="text-red-400 ml-1">(Utløpt)</span>
                                          )}
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        <span>Sendt {formatDate(invitation.created_at)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex gap-1">
                                  {invitation.status === 'pending' && !isExpired(invitation.expires_at) && (
                                    <button
                                      onClick={() => handleResendInvitation(invitation.id)}
                                      className="p-2 text-text-muted hover:text-primary-400 transition-colors rounded-lg hover:bg-background-darker/50"
                                      title="Send på nytt"
                                    >
                                      <RefreshCw size={16} />
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={() => handleDeleteInvitation(invitation.id)}
                                    className="p-2 text-text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-background-darker/50"
                                    title="Slett invitasjon"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-6 border-t border-border mt-6">
                    <button
                      onClick={onClose}
                      className="btn-secondary"
                    >
                      Lukk
                    </button>
                  </div>
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