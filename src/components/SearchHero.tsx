import React, { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';

interface SearchHeroProps {
  onSearch: (query: string) => void;
}

export function SearchHero({ onSearch }: SearchHeroProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-3xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(40deg,rgba(244,63,94,0.05)_0%,rgba(168,85,247,0.05)_50%,rgba(59,130,246,0.05)_100%)] dark:bg-[linear-gradient(40deg,rgba(244,63,94,0.1)_0%,rgba(168,85,247,0.1)_50%,rgba(59,130,246,0.1)_100%)]" />
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(244,63,94,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(168,85,247,0.1) 0%, transparent 50%)',
            animation: 'pulse 8s infinite'
          }} 
        />
      </div>

      <div className="relative max-w-3xl w-full px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-rose-600 via-purple-600 to-blue-600 text-transparent bg-clip-text">
            Find Your Health Solution
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Search through our comprehensive database of diseases, treatments, and medical information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search diseases, symptoms, or treatments..."
              className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-slate-200 dark:border-slate-600 focus:border-rose-500 dark:focus:border-rose-500 focus:ring focus:ring-rose-200 dark:focus:ring-rose-500/20 text-lg transition-shadow bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-rose-600 text-white p-2 rounded-full hover:bg-rose-700 transition-colors group touch-feedback"
            >
              <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </form>

        <div className="flex flex-wrap justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <span>Popular searches:</span>
          {['Diabetes', 'Hypertension', 'Anxiety', 'Depression'].map((term) => (
            <button
              key={term}
              onClick={() => {
                setSearchQuery(term);
                onSearch(term);
              }}
              className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}