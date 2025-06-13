import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calculator, Loader2 } from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useSupabase();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login if not authenticated
        navigate('/login', { 
          state: { from: location.pathname },
          replace: true 
        });
      } else {
        setIsChecking(false);
      }
    }
  }, [user, loading, navigate, location]);

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
          
          <div className="flex items-center justify-center gap-3">
            <Loader2 size={24} className="animate-spin text-primary-400" />
            <span className="text-text-muted">Laster...</span>
          </div>
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