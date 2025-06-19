import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const InvitationAcceptPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { acceptInvitation } = useProject();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAcceptInvitation = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invitasjonslenken er ugyldig eller mangler token.');
        return;
      }

      try {
        await acceptInvitation(token);
        setStatus('success');
        setMessage('Invitasjonen ble akseptert! Du blir omdirigert til dashbordet.');
        setTimeout(() => navigate('/'), 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(`Feil ved akseptering av invitasjon: ${error.message || 'Ukjent feil'}`);
      }
    };

    handleAcceptInvitation();
  }, [token, navigate, acceptInvitation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-900/10 flex items-center justify-center p-4">
      <div className="card p-8 text-center max-w-md w-full">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-primary-400 animate-spin mb-4" />
            <h1 className="text-xl font-semibold text-text-primary">Aksepterer invitasjon...</h1>
            <p className="text-text-muted mt-2">Vennligst vent mens vi behandler invitasjonen din.</p>
          </div>
        )}
        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
            <h1 className="text-xl font-semibold text-text-primary">Suksess!</h1>
            <p className="text-text-muted mt-2">{message}</p>
          </div>
        )}
        {status === 'error' && (
          <div className="flex flex-col items-center">
            <XCircle className="w-12 h-12 text-red-400 mb-4" />
            <h1 className="text-xl font-semibold text-text-primary">Feil</h1>
            <p className="text-text-muted mt-2">{message}</p>
            <button onClick={() => navigate('/login')} className="btn-primary mt-4">Gå til innlogging</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationAcceptPage;