import React from 'react';

interface SkeletonProps {
  type: 'text' | 'title' | 'avatar' | 'button' | 'card';
  lines?: number;
  className?: string;
}

export function SkeletonLoader({ type, lines = 1, className = '' }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer';

  switch (type) {
    case 'text':
      return (
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={`${baseClasses} h-4 rounded ${i === lines - 1 ? 'w-4/5' : 'w-full'} ${className}`}
            />
          ))}
        </div>
      );

    case 'title':
      return (
        <div className={`${baseClasses} h-8 w-3/4 rounded ${className}`} />
      );

    case 'avatar':
      return (
        <div className={`${baseClasses} w-12 h-12 rounded-full ${className}`} />
      );

    case 'button':
      return (
        <div className={`${baseClasses} h-10 w-32 rounded-lg ${className}`} />
      );

    case 'card':
      return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <div className="space-y-3">
            <div className={`${baseClasses} h-7 w-3/4 rounded`} />
            <div className="flex items-center gap-2">
              <div className={`${baseClasses} h-8 w-8 rounded-full`} />
              <div className={`${baseClasses} h-4 w-32 rounded`} />
            </div>
          </div>
          <div className={`${baseClasses} h-20 w-full rounded`} />
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`${baseClasses} h-6 w-20 rounded-full`} />
            ))}
          </div>
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <div className={`${baseClasses} h-4 w-16 rounded`} />
              <div className={`${baseClasses} h-4 w-16 rounded`} />
            </div>
            <div className={`${baseClasses} h-4 w-24 rounded`} />
          </div>
        </div>
      );

    default:
      return null;
  }
}