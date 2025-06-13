import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, 
  ArrowLeft, 
  Calculator,
  Send,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('En uventet feil oppstod. Prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-900/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="card p-8 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto mb-6 flex items-center justify-center">
              <CheckCircle size={32} className="text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-text-primary mb-4">E-post sendt!</h2>
            <p className="text-text-muted mb-6">
              Vi har sendt en lenke for å tilbakestille passordet til <strong>{email}</strong>. 
              Sjekk innboksen din og følg instruksjonene.
            </p>
            
            <div className="space-y-3">
              <Link to="/login" className="btn-primary w-full flex items-center justify-center gap-2">
                <ArrowLeft size={20} />
                Tilbake til pålogging
              </Link>
              
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                className="btn-secondary w-full"
              >
                Send ny e-post
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

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
          
          <h2 className="text-2xl font-bold text-text-primary mb-2">Glemt passord?</h2>
          <p className="text-text-muted">Ingen problem! Skriv inn e-postadressen din så sender vi deg en lenke for å tilbakestille passordet.</p>
        </motion.div>

        {/* Reset Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="card p-8"
        >
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-background-lighter border border-border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                  placeholder="din@epost.no"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Send Reset Link Button */}
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <Send size={20} />
                  <span>Send tilbakestillingslenke</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Tilbake til pålogging
            </Link>
          </div>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 p-4 bg-background-lighter/50 rounded-lg border border-border"
        >
          <p className="text-xs text-text-muted text-center">
            💡 Sjekk også spam-mappen din hvis du ikke finner e-posten. Lenken er gyldig i 24 timer.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;