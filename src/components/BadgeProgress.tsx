import React from 'react';
import { Award } from 'lucide-react';

interface BadgeProgressProps {
  badge: {
    name: string;
    description: string;
    icon_name: string;
    required_score: number;
    current_level?: number;
    progress?: number;
  };
}

export function BadgeProgress({ badge }: BadgeProgressProps) {
  const level = badge.current_level || 0;
  const maxLevel = 3;

  // Calculate thresholds based on badge name
  const getThresholds = () => {
    switch (badge.name) {
      case 'Newcomer':
        return {
          level1: 0,
          level2: 50,
          level3: 100
        };
      case 'Helper':
        return {
          level1: 10,
          level2: 50,
          level3: 100
        };
      case 'Problem Solver':
        return {
          level1: 5,
          level2: 25,
          level3: 50
        };
      case 'Expert':
        return {
          level1: 1000,
          level2: 5000,
          level3: 10000
        };
      default:
        return {
          level1: 0,
          level2: 0,
          level3: 0
        };
    }
  };

  const thresholds = getThresholds();
  
  // Calculate next threshold based on current level
  const getNextThreshold = () => {
    if (level === 0) return thresholds.level1;
    if (level === 1) return thresholds.level2;
    if (level === 2) return thresholds.level3;
    return thresholds.level3;
  };

  // Calculate current threshold based on level
  const getCurrentThreshold = () => {
    if (level === 1) return thresholds.level1;
    if (level === 2) return thresholds.level2;
    if (level === 3) return thresholds.level3;
    return 0;
  };

  const nextThreshold = getNextThreshold();
  const currentThreshold = getCurrentThreshold();
  const progress = badge.progress || 0;

  // Calculate progress percentage
  const progressPercentage = Math.min(100, ((progress - currentThreshold) / (nextThreshold - currentThreshold)) * 100);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
          <Award className="h-6 w-6 text-rose-600 dark:text-rose-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-slate-900 dark:text-slate-100">
            {badge.name}
            {level > 0 && (
              <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
                Level {level}
              </span>
            )}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{badge.description}</p>
          
          <div className="mt-2">
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-rose-500 dark:bg-rose-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{progress} / {nextThreshold} points</span>
              <span>Level {level} / {maxLevel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}