import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, Building2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from './AuthProvider';

console.log('📝 LoginForm component loading...');

const LoginForm: React.FC = () => {
  console.log('🎨 LoginForm component rendering...');
  
  const { signIn, signUp, loading, error: authError } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log('🔐 LoginForm state:', { loading, authError, isSubmitting });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📤 Form submitted:', { isSignUp, email });
    
    setError('');
    setIsSubmitting(true);

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        console.error('❌ Auth error:', error);
        setError(error.message || 'En feil oppstod');
      } else {
        console.log('✅ Auth successful');
      }
    } catch (err) {
      console.error('❌ Submit exception:', err);
      setError('En uventet feil oppstod');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    console.log('🔄 Retrying connection...');
    window.location.reload();
  };

  if (loading) {
    console.log('⏳ Showing loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-900/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Laster inn...</p>
        </div>
      </div>
    );
  }

  // Show connection error if there's an auth error
  if (authError) {
    console.log('❌ Showing auth error:', authError);
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-900/10 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="card p-8">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">Tilkoblingsfeil</h2>
            <p className="text-text-muted mb-4">
              Kunne ikke koble til serveren. Sjekk internettforbindelsen din.
            </p>
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
              <p className="text-red-400 text-sm">{authError}</p>
            </div>
            <button
              onClick={handleRetry}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={16} />
              Prøv igjen
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  console.log('✅ Showing login form');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-900/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">EPKalk</h1>
              <p className="text-sm text-text-muted">Kalkyleverktøy</p>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            {isSignUp ? 'Opprett konto' : 'Logg inn'}
          </h2>
          <p className="text-text-muted">
            {isSignUp 
              ? 'Opprett din konto for å komme i gang'
              : 'Logg inn for å administrere dine prosjekter'
            }
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="card p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
              >
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            <div>
              <label className="input-label">E-post</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3"
                  placeholder="din@epost.no"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="input-label">Passord</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3"
                  placeholder="Ditt passord"
                  disabled={isSubmitting}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {isSignUp && (
                <p className="text-xs text-text-muted mt-1">
                  Passordet må være minst 6 tegn langt
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {isSignUp ? 'Oppretter konto...' : 'Logger inn...'}
                </>
              ) : (
                <>
                  {isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}
                  {isSignUp ? 'Opprett konto' : 'Logg inn'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
              disabled={isSubmitting}
            >
              {isSignUp 
                ? 'Har du allerede en konto? Logg inn'
                : 'Har du ikke en konto? Opprett en'
              }
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-text-muted">
          <p>© 2025 EPKalk - Kalkyleverktøy for profesjonelle</p>
        </div>
      </motion.div>
    </div>
  );
};

console.log('✅ LoginForm component loaded');

export default LoginForm;