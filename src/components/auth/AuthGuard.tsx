import React from 'react';
import { useAuth } from './AuthProvider';
import LoginForm from './LoginForm';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('🛡️ AuthGuard - user:', !!user, 'loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Laster autentisering...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🚫 No user, showing login form');
    return <LoginForm />;
  }

  console.log('✅ User authenticated, showing app');
  return <>{children}</>;
};

export default AuthGuard;