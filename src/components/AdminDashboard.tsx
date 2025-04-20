import { 
  LayoutGrid, 
  Database, 
  UserCheck,
  BarChart2, 
  Settings,
  Plus,
  Users,
  CheckCircle,
  XCircle,
  FileText,
  Stethoscope,
  Award,
  MessageCircle,
  ThumbsUp,
  Clock,
  Menu,
  X,
  ArrowLeft
} from 'lucide-react';
import { Layout } from './Layout';
import { DiseaseList } from './DiseaseList';
import { DiseaseForm } from './DiseaseForm';
import { StatsDisplay } from './StatsDisplay';
import { UserManagementTable } from './UserManagementTable';
import { ConsultationManagement } from './ConsultationManagement';
import { Disease, Stats, User as UserType } from '../types';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';

interface AdminDashboardProps {
  user: UserType;
  diseases: Disease[];
  stats: Stats;
  onAddDisease: (disease: Disease) => Promise<void>;
  onEditDisease: (disease: Disease) => Promise<void>;
  onDeleteDisease: (disease: Disease) => Promise<void>;
  onLogout: () => void;
  onBack?: () => void;
}

type AdminSection = 'overview' | 'diseases' | 'verifications' | 'stats' | 'settings' | 'users' | 'consultations';

interface VerificationRequest {
  id: string;
  doctor_id: string;
  doctor_name: string;
  license_number: string;
  license_document_url: string;
  specialization: string;
  hospital_name: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  admin_notes?: string;
}

const sections = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'diseases', label: 'Diseases', icon: Database },
  { id: 'verifications', label: 'Doctor Verifications', icon: UserCheck },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'consultations', label: 'Consultations', icon: MessageCircle },
  { id: 'stats', label: 'Statistics', icon: BarChart2 },
  { id: 'settings', label: 'Settings', icon: Settings }
] as const;

export function AdminDashboard({ 
  user,
  diseases,
  stats,
  onAddDisease,
  onEditDisease,
  onDeleteDisease,
  onLogout,
  onBack
}: AdminDashboardProps) {
  const [currentSection, setCurrentSection] = useState<AdminSection>('overview');
  const [showDiseaseForm, setShowDiseaseForm] = useState(false);
  const [editingDisease, setEditingDisease] = useState<Disease | undefined>(undefined);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);
  const [consultationStats, setConsultationStats] = useState<any>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadVerificationRequests();
    loadUserStats();
    loadConsultationStats();
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_management_data');
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadVerificationRequests = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('doctor_verification_requests')
        .select(`
          *,
          profiles:doctor_id (
            full_name
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      setVerificationRequests(data.map(req => ({
        ...req,
        doctor_name: req.profiles.full_name
      })));
    } catch (error) {
      console.error('Error loading verification requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const { data, error } = await supabase
        .from('user_statistics')
        .select('*');

      if (error) throw error;
      setUserStats(data);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const loadConsultationStats = async () => {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*');

      if (error) throw error;
      setConsultationStats(data);
    } catch (error) {
      console.error('Error loading consultation stats:', error);
    }
  };

  const handleVerificationAction = async (requestId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      const { error: submitError } = await supabase
        .from('doctor_verification_requests')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          admin_notes: notes,
          processed_at: new Date().toISOString(),
          processed_by: user.id
        })
        .eq('id', requestId);

      if (submitError) throw submitError;

      if (action === 'approve') {
        const request = verificationRequests.find(r => r.id === requestId);
        if (request) {
          await supabase
            .from('profiles')
            .update({
              is_doctor: true,
              verification_status: 'verified',
              specialization: request.specialization,
              license_number: request.license_number
            })
            .eq('id', request.doctor_id);
        }
      }

      await loadVerificationRequests();
    } catch (error) {
      console.error('Error processing verification request:', error);
    }
  };

  const handleEditDisease = (disease: Disease) => {
    setEditingDisease(disease);
    setShowDiseaseForm(true);
  };

  const handleAddDisease = async (disease: Disease) => {
    try {
      await onAddDisease(disease);
      setShowDiseaseForm(false);
      setEditingDisease(undefined);
    } catch (error) {
      console.error('Error adding disease:', error);
      throw error;
    }
  };

  const handleUpdateDisease = async (disease: Disease) => {
    try {
      await onEditDisease(disease);
      setShowDiseaseForm(false);
      setEditingDisease(undefined);
    } catch (error) {
      console.error('Error updating disease:', error);
      throw error;
    }
  };

  const handleDeleteDisease = async (disease: Disease) => {
    if (window.confirm(`Are you sure you want to delete ${disease.name}?`)) {
      try {
        await onDeleteDisease(disease);
      } catch (error) {
        console.error('Error deleting disease:', error);
      }
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'overview':
        return (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Total Users</span>
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {userStats?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Pending Verifications</span>
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {verificationRequests.filter(r => r.status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Active Consultations</span>
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {consultationStats?.filter((c: any) => c.status === 'open').length || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-slate-600 dark:text-slate-400">New user registrations: {stats.userAccess}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Database className="h-4 w-4 text-green-500" />
                  <span className="text-slate-600 dark:text-slate-400">Diseases added: {stats.diseasesAdded}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <UserCheck className="h-4 w-4 text-purple-500" />
                  <span className="text-slate-600 dark:text-slate-400">Verified doctors: {verificationRequests.filter(r => r.status === 'approved').length}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">System Health</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-slate-600 dark:text-slate-400">System uptime: 99.9%</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <ThumbsUp className="h-4 w-4 text-emerald-500" />
                  <span className="text-slate-600 dark:text-slate-400">User satisfaction: 98%</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Award className="h-4 w-4 text-rose-500" />
                  <span className="text-slate-600 dark:text-slate-400">Service quality: Excellent</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'diseases':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Disease Management</h2>
              <button
                onClick={() => {
                  setEditingDisease(undefined);
                  setShowDiseaseForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Disease
              </button>
            </div>

            <DiseaseList
              diseases={diseases}
              onEdit={handleEditDisease}
              onDelete={handleDeleteDisease}
              isAdmin={true}
            />

            {showDiseaseForm && (
              <DiseaseForm
                onSubmit={editingDisease ? handleUpdateDisease : handleAddDisease}
                onCancel={() => {
                  setShowDiseaseForm(false);
                  setEditingDisease(undefined);
                }}
                initialDisease={editingDisease}
                title={editingDisease ? 'Edit Disease' : 'Add New Disease'}
              />
            )}
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">User Management</h2>
            <UserManagementTable 
              users={users}
              onRefresh={loadUsers}
            />
          </div>
        );

      case 'consultations':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Consultation Management</h2>
            <ConsultationManagement />
          </div>
        );

      case 'verifications':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Doctor Verification Requests</h2>
            
            {isLoading ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">Loading...</div>
            ) : verificationRequests.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">No verification requests found</div>
            ) : (
              <div className="grid gap-4">
                {verificationRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          Dr. {request.doctor_name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <Stethoscope className="h-4 w-4" />
                          <span>{request.specialization}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400'
                          : request.status === 'approved'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="block text-slate-500 dark:text-slate-400">License Number</label>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{request.license_number}</span>
                      </div>
                      <div>
                        <label className="block text-slate-500 dark:text-slate-400">Hospital</label>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{request.hospital_name || 'Not specified'}</span>
                      </div>
                    </div>

                    <div className="text-sm">
                      <label className="block text-slate-500 dark:text-slate-400">License Document</label>
                      <a
                        href={request.license_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                      >
                        <FileText className="h-4 w-4 inline mr-1" />
                        View Document
                      </a>
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => handleVerificationAction(request.id, 'approve')}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleVerificationAction(request.id, 'reject')}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    )}

                    {request.admin_notes && (
                      <div className="text-sm">
                        <label className="block text-slate-500 dark:text-slate-400">Admin Notes</label>
                        <p className="text-slate-700 dark:text-slate-300">{request.admin_notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'stats':
        return <StatsDisplay />;

      case 'settings':
        return (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">Admin Settings</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 dark:border-slate-600 dark:bg-slate-700"
                        defaultChecked
                      />
                      <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                        Enable email notifications
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 dark:border-slate-600 dark:bg-slate-700"
                        defaultChecked
                      />
                      <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                        Auto-approve verified doctors
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 dark:border-slate-600 dark:bg-slate-700"
                        defaultChecked
                      />
                      <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                        Enable two-factor authentication
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 dark:border-slate-600 dark:bg-slate-700"
                        defaultChecked
                      />
                      <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                        Require strong passwords
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout user={{ username: user.fullName, isAdmin: true }} onLogout={onLogout}>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors lg:absolute lg:top-4 lg:left-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Main Menu</span>
          </button>
        )}

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors w-full flex items-center justify-between"
          >
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {sections.find(s => s.id === currentSection)?.label || 'Menu'}
            </span>
            {showMobileMenu ? (
              <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            ) : (
              <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            )}
          </button>
        </div>

        {/* Sidebar - Desktop & Mobile */}
        <div className={`
          lg:w-64 lg:shrink-0
          ${showMobileMenu ? 'block' : 'hidden lg:block'}
        `}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden sticky top-4">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Admin Dashboard</h2>
            </div>
            <nav className="p-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setCurrentSection(section.id);
                      setShowMobileMenu(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                      transition-colors
                      ${currentSection === section.id
                        ? 'bg-rose-50 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {renderSection()}
        </div>
      </div>
    </Layout>
  );
}