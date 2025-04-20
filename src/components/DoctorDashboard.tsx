import { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Calendar, 
  CheckCircle, 
  Clock,
  Award,
  FileText,
  UserCheck,
  ArrowLeft
} from 'lucide-react';
import { Layout } from './Layout';
import { ConsultationList } from './ConsultationList';
import { ConsultationDetail } from './ConsultationDetail';
import { AchievementDisplay } from './AchievementDisplay';
import { ScrollMenu } from './ScrollMenu';
import { supabase } from '../lib/supabase';
import type { Post, Comment, User } from '../types';

interface DoctorDashboardProps {
  user: User;
  onLogout: () => void;
  onBack?: () => void;
}

type DashboardSection = 'consultations' | 'schedule' | 'stats' | 'verification' | 'achievements';

export function DoctorDashboard({ user, onLogout, onBack }: DoctorDashboardProps) {
  const [currentSection, setCurrentSection] = useState<DashboardSection>('consultations');
  const [consultations, setConsultations] = useState<Post[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState({
    totalConsultations: 0,
    openConsultations: 0,
    resolvedConsultations: 0,
    averageResponseTime: '0',
    responseRate: '0%'
  });
  const [verificationHistory, setVerificationHistory] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user.id]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load consultations
      const { data: consultationsData, error: consultationsError } = await supabase
        .from('consultations')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (consultationsError) throw consultationsError;
      setConsultations(consultationsData);

      // Load doctor stats
      const { data: statsData } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('id', user.id)
        .single();

      if (statsData) {
        setStats({
          totalConsultations: statsData.total_consultations || 0,
          openConsultations: statsData.open_consultations || 0,
          resolvedConsultations: statsData.resolved_consultations || 0,
          averageResponseTime: calculateAverageResponseTime(statsData.total_responses, statsData.total_consultations),
          responseRate: calculateResponseRate(statsData.total_responses, statsData.total_consultations)
        });
      }

      // Load verification history
      const { data: verificationData } = await supabase
        .from('doctor_verification_requests')
        .select('*')
        .eq('doctor_id', user.id)
        .order('submitted_at', { ascending: false });

      setVerificationHistory(verificationData || []);

      // Load achievements with levels
      const { data: achievementsData } = await supabase
        .from('user_achievements')
        .select(`
          *,
          badge:badge_id (
            name,
            description,
            icon_name,
            required_score
          )
        `)
        .eq('user_id', user.id);

      setAchievements(achievementsData || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAverageResponseTime = (responses: number, consultations: number): string => {
    if (!responses || !consultations) return '0';
    return '24h';
  };

  const calculateResponseRate = (responses: number, consultations: number): string => {
    if (!responses || !consultations) return '0%';
    return `${Math.round((responses / consultations) * 100)}%`;
  };

  const handleConsultationClick = async (post: Post) => {
    setSelectedConsultation(post);
    
    const { data, error } = await supabase
      .from('consultation_responses')
      .select('*')
      .eq('consultation_id', post.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading comments:', error);
      return;
    }

    setComments(data);
  };

  const sections = [
    { id: 'consultations', label: 'Consultations', icon: MessageCircle },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'stats', label: 'Statistics', icon: CheckCircle },
    { id: 'verification', label: 'Verification', icon: UserCheck },
    { id: 'achievements', label: 'Achievements', icon: Award }
  ];

  const renderSection = () => {
    switch (currentSection) {
      case 'consultations':
        return (
          <div className="space-y-6">
            <ConsultationList
              posts={consultations}
              onPostClick={handleConsultationClick}
              currentUserId={user.id}
            />
            {selectedConsultation && (
              <ConsultationDetail
                post={selectedConsultation}
                comments={comments}
                currentUser={{
                  id: user.id,
                  fullName: user.fullName,
                  isDoctor: true
                }}
                onClose={() => setSelectedConsultation(null)}
                onCommentAdded={(comment) => setComments([...comments, comment])}
              />
            )}
          </div>
        );

      case 'schedule':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">Consultation Schedule</h2>
            <div className="text-center text-slate-500 dark:text-slate-400 py-8">
              Schedule management coming soon
            </div>
          </div>
        );

      case 'stats':
        return (
          <div className="space-y-6">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Consultations</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalConsultations}</p>
                  </div>
                  <MessageCircle className="h-8 w-8 text-blue-200 dark:text-blue-800" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Open Consultations</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.openConsultations}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-200 dark:text-green-800" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Resolved Consultations</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.resolvedConsultations}</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-200 dark:text-purple-800" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg. Response Time</p>
                    <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.averageResponseTime}</p>
                  </div>
                  <FileText className="h-8 w-8 text-rose-200 dark:text-rose-800" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'verification':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Verification History</h2>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {verificationHistory.map((record) => (
                <div key={record.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        License Number: {record.license_number}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Submitted: {new Date(record.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.status === 'approved'
                        ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                        : record.status === 'rejected'
                        ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </div>
                  {record.admin_notes && (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      Notes: {record.admin_notes}
                    </p>
                  )}
                </div>
              ))}
              {verificationHistory.length === 0 && (
                <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                  No verification history found
                </div>
              )}
            </div>
          </div>
        );

      case 'achievements':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Your Achievements</h2>
            <AchievementDisplay
              achievements={achievements}
              reputation={0}
              totalPosts={stats.totalConsultations}
              totalSolutions={stats.resolvedConsultations}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout user={{ username: user.fullName, isAdmin: false, isDoctor: true }} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Main Menu</span>
          </button>
        )}

        {/* Navigation */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <ScrollMenu
            items={sections.map(section => ({
              id: section.id,
              label: section.label
            }))}
            activeId={currentSection}
            onChange={(id) => setCurrentSection(id as DashboardSection)}
          />
        </div>

        {/* Main Content */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 dark:border-rose-500"></div>
          </div>
        ) : (
          renderSection()
        )}
      </div>
    </Layout>
  );
}