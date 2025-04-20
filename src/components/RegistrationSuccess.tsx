import React from 'react';
import { CheckCircle, Mail, ArrowRight } from 'lucide-react';

interface RegistrationSuccessProps {
  email: string;
  onClose: () => void;
}

export function RegistrationSuccess({ email, onClose }: RegistrationSuccessProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900">
            Registration Successful!
          </h2>
          
          <p className="text-slate-600">
            We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
          </p>

          <div className="bg-slate-50 rounded-lg p-4 flex items-center gap-3">
            <Mail className="h-5 w-5 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">{email}</span>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-slate-500 text-center">
            Didn't receive the email? Check your spam folder or request a new verification link.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.open(`https://mail.google.com`)}
              className="w-full flex items-center justify-center gap-2 bg-rose-600 text-white py-2.5 rounded-lg font-medium hover:bg-rose-700 transition-colors"
            >
              Open Gmail
              <ArrowRight className="h-4 w-4" />
            </button>
            
            <button
              onClick={onClose}
              className="w-full bg-slate-100 text-slate-700 py-2.5 rounded-lg font-medium hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}