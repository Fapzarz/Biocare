import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 max-w-sm w-full mx-4 space-y-4">
        <LoadingSpinner size="large" className="mx-auto" />
        <p className="text-center text-slate-600 dark:text-slate-400">{message}</p>
      </div>
    </div>
  );
}