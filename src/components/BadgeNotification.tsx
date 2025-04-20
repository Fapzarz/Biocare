import React, { useState, useEffect } from 'react';
import { Award, X } from 'lucide-react';

interface BadgeNotificationProps {
  badge: {
    name: string;
    description: string;
    level: number;
  };
  onClose: () => void;
}

export function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`fixed bottom-4 right-4 transition-all duration-500 transform ${
      show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
    }`}>
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 p-4 max-w-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center animate-bounce">
              <Award className="h-6 w-6 text-rose-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  New Badge Earned!
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {badge.name} - Level {badge.level}
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 ml-4 p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              {badge.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}