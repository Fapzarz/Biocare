import React, { useState, useEffect } from 'react';
import { User, Lock, Phone, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { User as UserType } from '../types';
import { auth } from '../lib/auth';
import { EmailVerification } from './EmailVerification';
import { PrivacyPolicy } from './PrivacyPolicy';
import { TermsAndConditions } from './TermsAndConditions';

interface LoginFormProps {
  onLogin: (user: UserType) => void;
  acceptedTerms: boolean;
  onAcceptTerms: () => void;
}

export function LoginForm({ onLogin, acceptedTerms, onAcceptTerms }: LoginFormProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('rememberMe') === 'true';
  });
  const [error, setError] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    localStorage.setItem('rememberMe', rememberMe.toString());
  }, [rememberMe]);

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return false;
    if (!/[A-Z]/.test(pass)) return false;
    if (!/[a-z]/.test(pass)) return false;
    if (!/[0-9]/.test(pass)) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      if (!acceptedTerms) {
        throw new Error('Anda harus menyetujui Syarat dan Ketentuan untuk melanjutkan');
      }

      if (isRegistering) {
        if (!validatePassword(password)) {
          throw new Error('Password must be at least 8 characters and contain uppercase, lowercase, and numbers');
        }

        const { needsVerification } = await auth.signUp(email, password, fullName, phoneNumber);
        
        if (needsVerification) {
          setRegisteredEmail(email);
          setShowVerificationMessage(true);
          return;
        }
      } else {
        try {
          const user = await auth.signIn(email, password, rememberMe);
          if (user) {
            onLogin(user);
          }
        } catch (err) {
          if (err instanceof Error) {
            if (err.message.includes('verify') || err.message.includes('verifikasi')) {
              setRegisteredEmail(email);
              setShowVerificationMessage(true);
              return;
            }
            throw err;
          }
          throw err;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await auth.resetPassword(resetEmail);
      setShowResetForm(false);
      alert('Password reset instructions have been sent to your email');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationComplete = async () => {
    try {
      const user = await auth.signIn(registeredEmail, password);
      if (user) {
        onLogin(user);
      } else {
        setShowVerificationMessage(false);
        setIsRegistering(false);
        setError('Please sign in with your verified email');
      }
    } catch (err) {
      setShowVerificationMessage(false);
      setIsRegistering(false);
      setError('Please sign in with your verified email');
    }
  };

  if (showVerificationMessage) {
    return (
      <div className="fixed inset-0 w-screen h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-900">
        <div 
          className="absolute inset-0 w-full h-full transition-all duration-300 ease-out"
          style={{
            backgroundImage: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
              rgba(244, 63, 94, 0.15) 0%, 
              rgba(168, 85, 247, 0.15) 30%, 
              rgba(59, 130, 246, 0.15) 60%,
              rgba(0, 0, 0, 0) 100%)`
          }}
        />
        <EmailVerification
          email={registeredEmail}
          onBack={() => {
            setShowVerificationMessage(false);
            setIsRegistering(false);
            setEmail('');
            setPassword('');
          }}
          onVerificationComplete={handleVerificationComplete}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-900">
      <div 
        className="absolute inset-0 w-full h-full transition-all duration-300 ease-out"
        style={{
          backgroundImage: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
            rgba(244, 63, 94, 0.15) 0%, 
            rgba(168, 85, 247, 0.15) 30%, 
            rgba(59, 130, 246, 0.15) 60%,
            rgba(0, 0, 0, 0) 100%)`
        }}
      >
        <div className="absolute inset-0 w-full h-full bg-[linear-gradient(40deg,rgba(244,63,94,0.05)_0%,rgba(168,85,247,0.05)_50%,rgba(59,130,246,0.05)_100%)] dark:bg-[linear-gradient(40deg,rgba(244,63,94,0.1)_0%,rgba(168,85,247,0.1)_50%,rgba(59,130,246,0.1)_100%)] animate-gradient"></div>
      </div>

      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-rose-500/10 dark:bg-rose-500/5 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-[40%] right-[20%] w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[10%] left-[30%] w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {isRegistering ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              {isRegistering ? 'Sign up to get started' : 'Sign in to continue'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegistering && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="h-5 w-5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 py-2.5 text-sm focus:border-rose-500 focus:ring-rose-500 dark:text-slate-100 dark:placeholder-slate-400"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">
                Email
              </label>
              <div className="relative">
                <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 py-2.5 text-sm focus:border-rose-500 focus:ring-rose-500 dark:text-slate-100 dark:placeholder-slate-400"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">
                Password
              </label>
              <div className="relative">
                <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-12 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 py-2.5 text-sm focus:border-rose-500 focus:ring-rose-500 dark:text-slate-100 dark:placeholder-slate-400"
                  placeholder={isRegistering ? 'Create a password' : 'Enter your password'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {isRegistering && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Password must be at least 8 characters with uppercase, lowercase, and numbers
                </p>
              )}
            </div>

            {isRegistering && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="h-5 w-5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50 py-2.5 text-sm focus:border-rose-500 focus:ring-rose-500 dark:text-slate-100 dark:placeholder-slate-400"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            )}

            {!isRegistering && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-5 w-5 rounded-md border-2 border-slate-300 dark:border-slate-600 text-rose-600 
                      focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800
                      dark:bg-slate-700 dark:checked:bg-rose-600 dark:checked:border-rose-600
                      checked:bg-rose-600 checked:border-rose-600 checked:hover:bg-rose-700
                      transition-colors duration-200 cursor-pointer
                      appearance-none relative
                      before:content-[''] before:block before:w-full before:h-full
                      before:checked:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDNMNC41IDguNUwyIDYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=')] 
                      before:bg-center before:bg-no-repeat before:transform before:opacity-0
                      checked:before:opacity-100"
                  />
                  <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowResetForm(true)}
                  className="text-sm text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={() => onAcceptTerms()}
                className="h-5 w-5 rounded-md border-2 border-slate-300 dark:border-slate-600 text-rose-600 
                  focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800
                  dark:bg-slate-700 dark:checked:bg-rose-600 dark:checked:border-rose-600
                  checked:bg-rose-600 checked:border-rose-600 checked:hover:bg-rose-700
                  transition-colors duration-200 cursor-pointer
                  appearance-none relative
                  before:content-[''] before:block before:w-full before:h-full
                  before:checked:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDNMNC41IDguNUwyIDYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=')] 
                  before:bg-center before:bg-no-repeat before:transform before:opacity-0
                  checked:before:opacity-100"
              />
              <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-400">
                Saya menyetujui{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300"
                >
                  Syarat dan Ketentuan
                </button>
                {' '}serta{' '}
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300"
                >
                  Kebijakan Privasi
                </button>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-rose-600 to-purple-600 text-white py-2.5 rounded-lg font-medium hover:from-rose-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading
                ? (isRegistering ? 'Creating Account...' : 'Signing in...')
                : (isRegistering ? 'Create Account' : 'Sign In')}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                }}
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              >
                {isRegistering
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <TermsAndConditions />
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <PrivacyPolicy />
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}