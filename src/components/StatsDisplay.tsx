import { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  MessageCircle, 
  CheckCircle, 
  Award,
  ThumbsUp,
  UserCheck,
  Clock
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UserStatistics {
  total_consultations: number;
  resolved_consultations: number;
  total_responses: number;
  solutions_provided: number;
  total_likes: number;
  total_users: number;
  verified_doctors: number;
  active_consultations: number;
}

export function StatsDisplay() {
  const [stats, setStats] = useState<UserStatistics>({
    total_consultations: 0,
    resolved_consultations: 0,
    total_responses: 0,
    solutions_provided: 0,
    total_likes: 0,
    total_users: 0,
    verified_doctors: 0,
    active_consultations: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('stats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_statistics'
        },
        () => {
          loadStatistics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadStatistics = async () => {
    try {
      // Get user statistics
      const { data: userStats } = await supabase
        .from('user_statistics')
        .select('*');

      // Get total users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get verified doctors count
      const { count: verifiedDoctors } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_doctor', true)
        .eq('verification_status', 'verified');

      // Get active consultations count
      const { count: activeConsultations } = await supabase
        .from('consultations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      if (userStats) {
        const aggregatedStats = userStats.reduce((acc, curr) => ({
          total_consultations: acc.total_consultations + (curr.total_consultations || 0),
          resolved_consultations: acc.resolved_consultations + (curr.resolved_consultations || 0),
          total_responses: acc.total_responses + (curr.total_responses || 0),
          solutions_provided: acc.solutions_provided + (curr.solutions_provided || 0),
          total_likes: acc.total_likes + (curr.total_likes || 0),
          total_users: totalUsers || 0,
          verified_doctors: verifiedDoctors || 0,
          active_consultations: activeConsultations || 0
        }), {
          total_consultations: 0,
          resolved_consultations: 0,
          total_responses: 0,
          solutions_provided: 0,
          total_likes: 0,
          total_users: 0,
          verified_doctors: 0,
          active_consultations: 0
        });

        setStats(aggregatedStats);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statItems = [
    {
      title: 'Total Users',
      value: stats.total_users,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Verified Doctors',
      value: stats.verified_doctors,
      icon: UserCheck,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      title: 'Total Consultations',
      value: stats.total_consultations,
      icon: MessageCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Active Consultations',
      value: stats.active_consultations,
      icon: Activity,
      color: 'text-rose-600',
      bgColor: 'bg-rose-100'
    },
    {
      title: 'Resolved Consultations',
      value: stats.resolved_consultations,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Responses',
      value: stats.total_responses,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Solutions Provided',
      value: stats.solutions_provided,
      icon: Award,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      title: 'Total Likes',
      value: stats.total_likes,
      icon: ThumbsUp,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">System Statistics</h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">{item.title}</p>
                  <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}