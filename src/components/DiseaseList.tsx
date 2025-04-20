import React from 'react';
import { Disease } from '../types';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';

interface DiseaseListProps {
  diseases: Disease[];
  onEdit?: (disease: Disease) => void;
  onDelete?: (disease: Disease) => void;
  isAdmin?: boolean;
  onAdd?: () => void;
}

export function DiseaseList({ diseases, onEdit, onDelete, isAdmin, onAdd }: DiseaseListProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Disease List</h2>
        {isAdmin && onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors touch-feedback w-full sm:w-auto"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Add Disease</span>
          </button>
        )}
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {diseases.map((disease, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1.5">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 leading-tight">{disease.name}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  disease.type === 'physical' 
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400' 
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400'
                }`}>
                  {disease.type}
                </span>
              </div>
              {isAdmin && (
                <div className="flex space-x-1">
                  <button
                    onClick={() => onEdit?.(disease)}
                    className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors touch-feedback"
                    aria-label="Edit disease"
                  >
                    <Pencil className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </button>
                  <button
                    onClick={() => onDelete?.(disease)}
                    className="p-2.5 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors touch-feedback"
                    aria-label="Delete disease"
                  >
                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Medication</label>
                <p className="text-sm text-slate-600 dark:text-slate-400">{disease.medication}</p>
              </div>
              {disease.type === 'mental' && disease.therapy !== '-' && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Therapy</label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{disease.therapy}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}