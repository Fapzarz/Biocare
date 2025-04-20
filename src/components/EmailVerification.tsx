import React, { useState, useEffect } from 'react';
import { Mail, AlertCircle, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EmailVerificationProps {
  email: string;
  onBack: () => void;
  onVerificationComplete?: () => void;
}

export function EmailVerification({ email, onBack, onVerificationComplete }: EmailVerificationProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: number;
    if (resendCooldown > 0) {
      timer = window.setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    checkVerificationStatus();
    const interval = setInterval(checkVerificationStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [email]);

  const checkVerificationStatus = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      if (user?.email_confirmed_at) {
        setVerificationStatus('success');
        onVerificationComplete?.();
      }
    } catch (err) {
      console.error('Error checking verification status:', err);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    
    setIsResending(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) throw error;
      
      setResendCooldown(60); // 1 minute cooldown
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md px-4">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className={`h-16 w-16 rounded-full flex items-center justify-center ${
              verificationStatus === 'success' 
                ? 'bg-green-100' 
                : verificationStatus === 'error'
                ? 'bg-red-100'
                : 'bg-blue-100'
            }`}>
              {verificationStatus === 'success' ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : verificationStatus === 'error' ? (
                <AlertCircle className="h-8 w-8 text-red-600" />
              ) : (
                <Mail className="h-8 w-8 text-blue-600" />
              )}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900">
            {verificationStatus === 'success' 
              ? 'Email Verified!' 
              : 'Verify Your Email'}
          </h2>

          <p className="text-slate-600">
            {verificationStatus === 'success' 
              ? 'Your email has been successfully verified. You can now sign in.'
              : `We've sent a verification link to ${email}. Please check your inbox and click the link to verify your account.`}
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {verificationStatus === 'pending' && (
            <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
              <p>Haven't received the email? Check your spam folder or click below to resend.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {verificationStatus === 'success' ? (
            <button
              onClick={onBack}
              className="w-full flex items-center justify-center gap-2 bg-rose-600 text-white py-2.5 rounded-lg font-medium hover:bg-rose-700 transition-colors"
            >
              Return to Login
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => window.open('https://mail.google.com')}
                className="w-full flex items-center justify-center gap-2 bg-rose-600 text-white py-2.5 rounded-lg font-medium hover:bg-rose-700 transition-colors"
              >
                Open Gmail
                <Mail className="h-4 w-4" />
              </button>

              <button
                onClick={handleResendVerification}
                disabled={isResending || resendCooldown > 0}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-2.5 rounded-lg font-medium hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </button>

              <button
                onClick={onBack}
                className="w-full bg-white text-slate-700 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition-colors border border-slate-200"
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}