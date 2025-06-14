import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthProvider';

const LoginForm: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('En uventet feil oppstod');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-900/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">EPKalk</h1>
              <p className="text-sm text-text-muted">Kalkyleverktøy</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="card p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              {isSignUp ? 'Opprett konto' : 'Logg inn'}
            </h2>
            <p className="text-text-muted">
              {isSignUp 
                ? 'Opprett din konto for å komme i gang'
                : 'Logg inn på din konto'
              }
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">E-post</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10"
                  placeholder="din@epost.no"
                  disabled={loading}
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
                  className="w-full pl-10 pr-10"
                  placeholder="Ditt passord"
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  disabled={loading}
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
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isSignUp ? 'Oppretter konto...' : 'Logger inn...'}
                </>
              ) : (
                isSignUp ? 'Opprett konto' : 'Logg inn'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
              disabled={loading}
            >
              {isSignUp 
                ? 'Har du allerede en konto? Logg inn'
                : 'Har du ikke en konto? Opprett en'
              }
            </button>
          </div>
        </div>

        {/* Demo info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-text-muted">
            Demo: Opprett en konto med hvilken som helst e-post og passord
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginForm;