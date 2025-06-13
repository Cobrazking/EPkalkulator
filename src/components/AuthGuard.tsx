import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calculator, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading, connectionError } = useSupabase();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Show fallback after 5 seconds if still loading
    const fallbackTimer = setTimeout(() => {
      if (loading || isChecking) {
        setShowFallback(true);
      }
    }, 5000);

    return () => clearTimeout(fallbackTimer);
  }, [loading, isChecking]);

  useEffect(() => {
    if (!loading) {
      if (connectionError) {
        // Don't redirect on connection error, show error message instead
        setIsChecking(false);
      } else if (!user) {
        // Redirect to login if not authenticated
        navigate('/login', { 
          state: { from: location.pathname },
          replace: true 
        });
      } else {
        setIsChecking(false);
      }
    }
  }, [user, loading, connectionError, navigate, location]);

  // Show connection error
  if (connectionError && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-900/10 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">EPKalk</h1>
              <p className="text-sm text-text-muted">Tilkoblingsfeil</p>
            </div>
          </div>
          
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Kan ikke koble til tjenesten</h2>
            <p className="text-text-muted mb-6">{connectionError}</p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <RefreshCw size={20} />
                Prøv igjen
              </button>
              
              <button
                onClick={() => navigate('/login')}
                className="btn-secondary w-full"
              >
                Gå til pålogging
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show loading screen while checking authentication
  if (loading || isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-900/10 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-4 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl shadow-lg">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">EPKalk</h1>
              <p className="text-sm text-text-muted">Profesjonelt kalkyleverktøy</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <Loader2 size={24} className="animate-spin text-primary-400" />
            <span className="text-text-muted">Laster autentisering...</span>
          </div>

          {showFallback && (
            <div className="mt-6 p-4 bg-background-lighter/50 rounded-lg border border-border">
              <p className="text-xs text-text-muted mb-3">
                Tar det lang tid? Prøv å laste siden på nytt.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary text-sm px-4 py-2"
              >
                Last inn på nytt
              </button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default AuthGuard;