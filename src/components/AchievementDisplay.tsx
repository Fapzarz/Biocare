import React from 'react';
import { Trophy, Award, Star, Heart, CheckCircle } from 'lucide-react';

interface Achievement {
  name: string;
  description: string;
  icon_name: string;
  awarded_at: string;
}

interface AchievementDisplayProps {
  achievements: Achievement[];
  reputation: number;
  totalPosts: number;
  totalSolutions: number;
}

const iconMap = {
  Trophy: Trophy,
  Award: Award,
  Star: Star,
  Heart: Heart,
  CheckCircle: CheckCircle
};

export function AchievementDisplay({ 
  achievements, 
  reputation, 
  totalPosts, 
  totalSolutions 
}: AchievementDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Reputation Score */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Reputation</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Your community standing</p>
          </div>
          <div className="text-3xl font-bold text-rose-600 dark:text-rose-500">{reputation}</div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-500 dark:text-slate-400">Total Posts</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalPosts}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-500 dark:text-slate-400">Solutions Provided</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalSolutions}</div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Achievements</h3>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {achievements.map((achievement, index) => {
            const Icon = iconMap[achievement.icon_name as keyof typeof iconMap] || Trophy;
            return (
              <div key={`${achievement.name}-${index}`} className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-rose-600 dark:text-rose-500" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">{achievement.name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{achievement.description}</p>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    Earned on {new Date(achievement.awarded_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
          {achievements.length === 0 && (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
              No achievements yet. Keep participating to earn badges!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}