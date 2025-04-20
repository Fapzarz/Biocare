import React from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface VerificationStatusProps {
  status: 'unverified' | 'pending' | 'verified' | 'rejected';
  onRequestVerification?: () => void;
}

export function VerificationStatus({ status, onRequestVerification }: VerificationStatusProps) {
  const getStatusDisplay = () => {
    switch (status) {
      case 'verified':
        return {
          icon: CheckCircle,
          color: 'text-green-600 dark:text-green-500',
          bgColor: 'bg-green-100 dark:bg-green-900/50',
          text: 'Verified Doctor',
          description: 'Your medical credentials have been verified'
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600 dark:text-yellow-500',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/50',
          text: 'Verification Pending',
          description: 'Your verification request is being reviewed'
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-600 dark:text-red-500',
          bgColor: 'bg-red-100 dark:bg-red-900/50',
          text: 'Verification Rejected',
          description: 'Your verification request was not approved'
        };
      default:
        return {
          icon: CheckCircle,
          color: 'text-slate-600 dark:text-slate-400',
          bgColor: 'bg-slate-100 dark:bg-slate-800',
          text: 'Not Verified',
          description: 'Get verified to provide medical consultations'
        };
    }
  };

  const statusInfo = getStatusDisplay();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center gap-4">
        <div className={`h-12 w-12 rounded-full ${statusInfo.bgColor} flex items-center justify-center`}>
          <StatusIcon className={`h-6 w-6 ${statusInfo.color}`} />
        </div>
        <div>
          <h3 className={`font-medium ${statusInfo.color}`}>
            {statusInfo.text}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {statusInfo.description}
          </p>
        </div>
      </div>

      {status === 'unverified' && onRequestVerification && (
        <button
          onClick={onRequestVerification}
          className="mt-4 w-full bg-rose-600 text-white py-2 rounded-lg font-medium hover:bg-rose-700 transition-colors dark:bg-rose-600 dark:hover:bg-rose-700"
        >
          Request Verification
        </button>
      )}
    </div>
  );
}