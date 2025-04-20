import React, { useState, useEffect } from 'react';
import { Disease } from '../types';
import { X } from 'lucide-react';

interface DiseaseFormProps {
  onSubmit: (disease: Disease) => void;
  onCancel: () => void;
  initialDisease?: Disease;
  title: string;
}

export function DiseaseForm({ onSubmit, onCancel, initialDisease, title }: DiseaseFormProps) {
  const [disease, setDisease] = useState<Disease>({
    name: '',
    type: 'physical',
    medication: '',
    therapy: '-'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialDisease) {
      setDisease(initialDisease);
    }
  }, [initialDisease]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Validasi field yang required
      if (!disease.name.trim()) throw new Error('Disease name is required');
      if (!disease.medication.trim()) throw new Error('Medication is required');
      if (disease.type === 'mental' && (!disease.therapy || disease.therapy === '-')) {
        throw new Error('Therapy is required for mental diseases');
      }

      await onSubmit(disease);
      onCancel(); // Tutup form setelah berhasil
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save disease');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Disease Name
            </label>
            <input
              type="text"
              value={disease.name}
              onChange={(e) => setDisease({ ...disease, name: e.target.value })}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2.5 text-sm focus:border-rose-500 focus:ring-rose-500 dark:text-slate-100 dark:placeholder-slate-400"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Type
            </label>
            <select
              value={disease.type}
              onChange={(e) => setDisease({ 
                ...disease, 
                type: e.target.value as 'physical' | 'mental',
                therapy: e.target.value === 'physical' ? '-' : disease.therapy 
              })}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2.5 text-sm focus:border-rose-500 focus:ring-rose-500 dark:text-slate-100"
            >
              <option value="physical">Physical</option>
              <option value="mental">Mental</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Medication
            </label>
            <input
              type="text"
              value={disease.medication}
              onChange={(e) => setDisease({ ...disease, medication: e.target.value })}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2.5 text-sm focus:border-rose-500 focus:ring-rose-500 dark:text-slate-100 dark:placeholder-slate-400"
              required
            />
          </div>

          {disease.type === 'mental' && (
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Therapy
              </label>
              <input
                type="text"
                value={disease.therapy}
                onChange={(e) => setDisease({ ...disease, therapy: e.target.value })}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2.5 text-sm focus:border-rose-500 focus:ring-rose-500 dark:text-slate-100 dark:placeholder-slate-400"
                required
              />
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-rose-600 text-white py-2.5 rounded-lg font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-2.5 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}