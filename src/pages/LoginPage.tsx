import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Calculator,
  Building2,
  ArrowRight,
  Chrome,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, connectionError } = useSupabase();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get any message from URL params or location state
  const urlParams = new URLSearchParams(location.search);
  const message = urlParams.get('message') || (location.state as any)?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Ugyldig e-post eller passord. Sjekk opplysningene og prøv igjen.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('E-posten din er ikke bekreftet. Sjekk innboksen din og klikk på bekreftelseslenken.');
        } else {
          setError(error.message);
        }
      } else {
        // Redirect to the page they were trying to access, or dashboard
        const from = (location.state as any)?.from || '/';
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('En uventet feil oppstod. Prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Google sign-in implementation will be added when Supabase is configured
      setError('Google-pålogging er ikke konfigurert ennå.');
    } catch (err) {
      setError('Feil ved Google-pålogging. Prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-900/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
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
          
          <h2 className="text-2xl font-bold text-text-primary mb-2">Velkommen tilbake</h2>
          <p className="text-text-muted">Logg inn for å fortsette til din konto</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="card p-8"
        >
          {/* Success message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
            >
              <p className="text-green-400 text-sm">{message}</p>
            </motion.div>
          )}

          {/* Connection error */}
          {connectionError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3"
            >
              <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
              <div>
                <p className="text-red-400 text-sm font-medium">Tilkoblingsfeil</p>
                <p className="text-red-400 text-xs">{connectionError}</p>
              </div>
            </motion.div>
          )}

          {/* Form error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
            >
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="input-label">E-post</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-background-lighter border border-border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                  placeholder="din@epost.no"
                  disabled={loading || !!connectionError}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="input-label">Passord</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-11 pr-11 py-3 bg-background-lighter border border-border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                  placeholder="Ditt passord"
                  disabled={loading || !!connectionError}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  disabled={loading || !!connectionError}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                Glemt passord?
              </Link>
            </div>

            {/* Login Button */}
            <motion.button
              whileHover={{ scale: loading || connectionError ? 1 : 1.02 }}
              whileTap={{ scale: loading || connectionError ? 1 : 0.98 }}
              type="submit"
              disabled={loading || !!connectionError}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <span>Logg inn</span>
                  <ArrowRight size={20} />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-border"></div>
            <span className="px-4 text-sm text-text-muted">eller</span>
            <div className="flex-1 border-t border-border"></div>
          </div>

          {/* Google Sign In */}
          <motion.button
            whileHover={{ scale: loading || connectionError ? 1 : 1.02 }}
            whileTap={{ scale: loading || connectionError ? 1 : 0.98 }}
            onClick={handleGoogleSignIn}
            disabled={loading || !!connectionError}
            className="w-full btn-secondary flex items-center justify-center gap-3 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Chrome size={20} className="text-text-muted" />
            <span>Fortsett med Google</span>
          </motion.button>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-text-muted">
              Har du ikke en konto?{' '}
              <Link 
                to="/register" 
                className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                Registrer deg
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
              <Calculator size={24} className="text-white" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">Profesjonelle kalkyler</h3>
            <p className="text-xs text-text-muted">Lag detaljerte kalkyler for dine prosjekter</p>
          </div>

          <div className="text-center p-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
              <Building2 size={24} className="text-white" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">Organisasjoner</h3>
            <p className="text-xs text-text-muted">Administrer flere organisasjoner enkelt</p>
          </div>

          <div className="text-center p-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
              <ArrowRight size={24} className="text-white" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">Eksporter</h3>
            <p className="text-xs text-text-muted">Eksporter til PDF og Excel</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;