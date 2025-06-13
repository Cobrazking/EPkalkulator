import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Calculator,
  User,
  Building2,
  ArrowRight,
  Chrome,
  Loader2,
  Check
} from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useSupabase();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passordene stemmer ikke overens');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Passordet må være minst 6 tegn');
      setLoading(false);
      return;
    }

    if (!formData.acceptTerms) {
      setError('Du må akseptere vilkårene for å fortsette');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(formData.email, formData.password);
      if (error) {
        setError(error.message);
      } else {
        // Redirect to confirmation page or dashboard
        navigate('/login?message=Sjekk e-posten din for å bekrefte kontoen');
      }
    } catch (err) {
      setError('En uventet feil oppstod. Prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Google sign-up implementation will be added when Supabase is configured
      setError('Google-registrering er ikke konfigurert ennå.');
    } catch (err) {
      setError('Feil ved Google-registrering. Prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthTexts = ['Svakt', 'Middels', 'Sterkt', 'Meget sterkt'];

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
          
          <h2 className="text-2xl font-bold text-text-primary mb-2">Opprett konto</h2>
          <p className="text-text-muted">Kom i gang med EPKalk i dag</p>
        </motion.div>

        {/* Registration Form */}
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
            {/* Name Field */}
            <div>
              <label className="input-label">Fullt navn</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-background-lighter border border-border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                  placeholder="Ditt fulle navn"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Organization Name Field */}
            <div>
              <label className="input-label">Organisasjonsnavn</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type="text"
                  required
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-background-lighter border border-border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                  placeholder="Navn på din organisasjon"
                  disabled={loading}
                />
              </div>
            </div>

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
                  disabled={loading}
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
                  placeholder="Velg et sterkt passord"
                  disabled={loading}
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
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[0, 1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          index < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-text-muted">
                    Passordstyrke: {passwordStrength > 0 ? strengthTexts[passwordStrength - 1] : 'Ingen'}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="input-label">Bekreft passord</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-11 pr-11 py-3 bg-background-lighter border border-border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                  placeholder="Gjenta passordet"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-2 flex items-center gap-2">
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <Check size={16} className="text-green-400" />
                      <span className="text-xs text-green-400">Passordene stemmer overens</span>
                    </>
                  ) : (
                    <span className="text-xs text-red-400">Passordene stemmer ikke overens</span>
                  )}
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                className="mt-1 rounded border-border text-primary-500 focus:ring-primary-400"
                disabled={loading}
              />
              <label htmlFor="acceptTerms" className="text-sm text-text-muted">
                Jeg aksepterer{' '}
                <Link to="/terms" className="text-primary-400 hover:text-primary-300 transition-colors">
                  vilkårene for bruk
                </Link>{' '}
                og{' '}
                <Link to="/privacy" className="text-primary-400 hover:text-primary-300 transition-colors">
                  personvernreglene
                </Link>
              </label>
            </div>

            {/* Register Button */}
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
                  <span>Opprett konto</span>
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

          {/* Google Sign Up */}
          <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full btn-secondary flex items-center justify-center gap-3 py-3"
          >
            <Chrome size={20} className="text-text-muted" />
            <span>Registrer med Google</span>
          </motion.button>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-text-muted">
              Har du allerede en konto?{' '}
              <Link 
                to="/login" 
                className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                Logg inn
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 p-4 bg-background-lighter/50 rounded-lg border border-border"
        >
          <p className="text-xs text-text-muted text-center">
            🔒 Dine data er sikre hos oss. Vi bruker industri-standard kryptering og lagrer aldri sensitive opplysninger i klartekst.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;