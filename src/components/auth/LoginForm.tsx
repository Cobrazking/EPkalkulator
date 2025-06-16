import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, Building2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from './AuthProvider';

const LoginForm: React.FC = () => {
  const { signIn, signUp, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        // Provide more user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          if (isSignUp) {
            setError('Det oppstod en feil ved opprettelse av kontoen. Prøv igjen.');
          } else {
            setError('Ugyldig e-post eller passord. Kontroller at du har skrevet riktig, eller opprett en ny konto hvis du ikke har en.');
          }
        } else if (error.message.includes('Email not confirmed')) {
          setError('E-posten din er ikke bekreftet. Sjekk innboksen din for bekreftelseslenke.');
        } else if (error.message.includes('User already registered')) {
          setError('En bruker med denne e-posten eksisterer allerede. Prøv å logge inn i stedet.');
        } else if (error.message.includes('Password should be at least')) {
          setError('Passordet må være minst 6 tegn langt.');
        } else if (error.message.includes('Unable to validate email address')) {
          setError('Ugyldig e-postadresse. Kontroller at du har skrevet riktig.');
        } else {
          setError(error.message);
        }
      } else if (isSignUp) {
        setSuccess('Kontoen ble opprettet! Du kan nå logge inn.');
        setIsSignUp(false);
        setPassword('');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('En uventet feil oppstod. Prøv igjen senere.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-900/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Laster inn...</p>
        </div>
      </div>
    );
  }

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
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-green-400 text-sm">{success}</p>
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
                setSuccess('');
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

          {/* Help text for new users */}
          {!isSignUp && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-400 text-xs text-center">
                Første gang her? Opprett en konto for å komme i gang.
              </p>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-text-muted">
          <p>© 2025 EPKalk - Kalkyleverktøy for profesjonelle</p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginForm;