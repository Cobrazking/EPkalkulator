import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building2, 
  User, 
  Mail, 
  Shield,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../components/auth/AuthProvider';
import { supabase } from '../lib/supabase';

interface InvitationDetails {
  invitationId: string;
  organizationId: string;
  organizationName: string;
  email: string;
  name: string;
  role: string;
  invitedByName: string;
  expiresAt: string;
  isValid: boolean;
}

const InvitationAcceptPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authData, setAuthData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    if (token) {
      verifyInvitation();
    }
  }, [token]);

  useEffect(() => {
    if (user && invitation && invitation.isValid) {
      // User is logged in and invitation is valid, try to accept
      acceptInvitation();
    }
  }, [user, invitation]);

  const verifyInvitation = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('verify_invitation_token', {
        p_token: token
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const invitationData = data[0];
        setInvitation(invitationData);
        setAuthData(prev => ({ ...prev, email: invitationData.email }));
      } else {
        setError('Invitasjonslenken er ugyldig eller utløpt.');
      }
    } catch (error: any) {
      console.error('Failed to verify invitation:', error);
      setError('Feil ved verifisering av invitasjon. Prøv igjen.');
    } finally {
      setIsLoading(false);
    }
  };

  const acceptInvitation = async () => {
    if (!user || !invitation || !token) return;

    try {
      setIsAccepting(true);
      setError(null);

      const { data, error } = await supabase.rpc('accept_invitation', {
        p_token: token,
        p_auth_user_id: user.id
      });

      if (error) throw error;

      setSuccess(`Velkommen til ${invitation.organizationName}! Du er nå medlem av organisasjonen.`);
      
      // Redirect to dashboard after success
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error: any) {
      console.error('Failed to accept invitation:', error);
      setError(error.message || 'Feil ved akseptering av invitasjon. Prøv igjen.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitation) return;

    try {
      setIsLoading(true);
      setError(null);

      const { error } = authMode === 'signin' 
        ? await signIn(authData.email, authData.password)
        : await signUp(authData.email, authData.password);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          if (authMode === 'signin') {
            setError('Ugyldig e-post eller passord. Hvis du ikke har en konto, prøv å registrere deg.');
          } else {
            setError('Feil ved opprettelse av konto. Prøv igjen.');
          }
        } else {
          setError(error.message);
        }
      }
      // If successful, the useEffect will handle accepting the invitation
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError('En uventet feil oppstod. Prøv igjen senere.');
    } finally {
      setIsLoading(false);
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield size={16} className="text-yellow-400" />;
      case 'manager': return <User size={16} className="text-blue-400" />;
      case 'user': return <User size={16} className="text-green-400" />;
      default: return <User size={16} className="text-text-muted" />;
    }
  };

  if (isLoading && !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-900/10 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Verifiserer invitasjon...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-900/10 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="card p-8">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h1 className="text-2xl font-bold text-text-primary mb-4">Ugyldig invitasjon</h1>
            <p className="text-text-muted mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Gå til forsiden
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!invitation?.isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-900/10 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="card p-8">
            <Clock className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <h1 className="text-2xl font-bold text-text-primary mb-4">Invitasjon utløpt</h1>
            <p className="text-text-muted mb-6">
              Denne invitasjonen er utløpt eller har allerede blitt brukt. 
              Kontakt administratoren for å få en ny invitasjon.
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Gå til forsiden
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-900/10 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="card p-8">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
            <h1 className="text-2xl font-bold text-text-primary mb-4">Velkommen!</h1>
            <p className="text-text-muted mb-6">{success}</p>
            <div className="text-sm text-text-muted">
              Du blir automatisk videresendt til dashboardet...
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (user && isAccepting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-900/10 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="card p-8">
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary-400 animate-spin" />
            <h1 className="text-2xl font-bold text-text-primary mb-4">Aksepterer invitasjon...</h1>
            <p className="text-text-muted">Vennligst vent mens vi legger deg til i organisasjonen.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-900/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Invitation Details */}
        <div className="card p-6 mb-6">
          <div className="text-center mb-6">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-primary-400" />
            <h1 className="text-2xl font-bold text-text-primary mb-2">Du er invitert!</h1>
            <p className="text-text-muted">
              Du har blitt invitert til å bli med i en organisasjon
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-background-darker/50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Building2 size={20} className="text-primary-400" />
                <div>
                  <h3 className="font-semibold text-text-primary">{invitation.organizationName}</h3>
                  <p className="text-sm text-text-muted">Organisasjon</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-text-muted" />
                  <span className="text-text-muted">Invitert som:</span>
                  <div className="flex items-center gap-1">
                    {getRoleIcon(invitation.role)}
                    <span className="font-medium text-text-primary">{getRoleText(invitation.role)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-text-muted" />
                  <span className="text-text-muted">E-post:</span>
                  <span className="font-medium text-text-primary">{invitation.email}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User size={16} className="text-text-muted" />
                  <span className="text-text-muted">Invitert av:</span>
                  <span className="font-medium text-text-primary">{invitation.invitedByName}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-text-muted" />
                  <span className="text-text-muted">Utløper:</span>
                  <span className="font-medium text-text-primary">
                    {new Date(invitation.expiresAt).toLocaleDateString('nb-NO')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Authentication Form */}
        {!user && (
          <div className="card p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                {authMode === 'signin' ? 'Logg inn for å akseptere' : 'Opprett konto for å akseptere'}
              </h2>
              <p className="text-text-muted text-sm">
                {authMode === 'signin' 
                  ? 'Logg inn med din eksisterende konto for å akseptere invitasjonen'
                  : 'Opprett en ny konto for å akseptere invitasjonen'
                }
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="input-label">E-post</label>
                <input
                  type="email"
                  required
                  value={authData.email}
                  onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                  className="w-full"
                  disabled={true} // Email is pre-filled from invitation
                />
                <p className="text-xs text-text-muted mt-1">
                  E-postadressen fra invitasjonen
                </p>
              </div>

              <div>
                <label className="input-label">Passord</label>
                <input
                  type="password"
                  required
                  value={authData.password}
                  onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                  className="w-full"
                  placeholder={authMode === 'signin' ? 'Ditt passord' : 'Velg et passord (min 6 tegn)'}
                  minLength={6}
                />
                {authMode === 'signup' && (
                  <p className="text-xs text-text-muted mt-1">
                    Passordet må være minst 6 tegn langt
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {authMode === 'signin' ? 'Logger inn...' : 'Oppretter konto...'}
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    {authMode === 'signin' ? 'Logg inn og aksepter' : 'Opprett konto og aksepter'}
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                  setError(null);
                }}
                className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
                disabled={isLoading}
              >
                {authMode === 'signin' 
                  ? 'Har du ikke en konto? Opprett en'
                  : 'Har du allerede en konto? Logg inn'
                }
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default InvitationAcceptPage;