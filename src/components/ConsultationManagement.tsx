import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  MessageCircle,
  User,
  Clock,
  Tag as TagIcon,
  AlertTriangle,
  Lock,
  Globe,
  Trash2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ConsultationDetail } from './ConsultationDetail';

interface Consultation {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  author_type: string;
  category: string;
  status: 'open' | 'resolved';
  is_private: boolean;
  created_at: string;
  tags: string[];
  response_count?: number;
}

export function ConsultationManagement() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'resolved'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [adminUser, setAdminUser] = useState<{ id: string; email: string } | null>(null);

  useEffect(() => {
    loadConsultations();
    loadAdminUser();
  }, []);

  const loadAdminUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAdminUser(user);
      }
    } catch (err) {
      console.error('Error loading admin user:', err);
    }
  };

  const loadConsultations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: consultationsData, error: consultationsError } = await supabase
        .from('consultations')
        .select(`
          *,
          responses:consultation_responses(count)
        `)
        .order('created_at', { ascending: false });

      if (consultationsError) throw consultationsError;

      const consultationsWithCounts = consultationsData.map(consultation => ({
        ...consultation,
        response_count: consultation.responses?.[0]?.count || 0
      }));

      setConsultations(consultationsWithCounts);
    } catch (err) {
      console.error('Error loading consultations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load consultations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (consultationId: string, newStatus: 'open' | 'resolved') => {
    try {
      const { error: updateError } = await supabase
        .from('consultations')
        .update({ status: newStatus })
        .eq('id', consultationId);

      if (updateError) throw updateError;

      setConsultations(prev =>
        prev.map(c =>
          c.id === consultationId ? { ...c, status: newStatus } : c
        )
      );
    } catch (err) {
      console.error('Error updating consultation status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handlePrivacyChange = async (consultationId: string, isPrivate: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('consultations')
        .update({ is_private: isPrivate })
        .eq('id', consultationId);

      if (updateError) throw updateError;

      setConsultations(prev =>
        prev.map(c =>
          c.id === consultationId ? { ...c, is_private: isPrivate } : c
        )
      );
    } catch (err) {
      console.error('Error updating consultation privacy:', err);
      setError(err instanceof Error ? err.message : 'Failed to update privacy');
    }
  };

  const handleDeleteConsultation = async (consultationId: string) => {
    if (!window.confirm('Are you sure you want to delete this consultation? This action cannot be undone.')) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('consultations')
        .delete()
        .eq('id', consultationId);

      if (deleteError) throw deleteError;

      setConsultations(prev => prev.filter(c => c.id !== consultationId));
    } catch (err) {
      console.error('Error deleting consultation:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete consultation');
    }
  };

  const handleConsultationClick = async (consultation: Consultation) => {
    try {
      setSelectedConsultation(consultation);

      // Load comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('consultation_responses')
        .select('*')
        .eq('consultation_id', consultation.id)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;
      setComments(commentsData);
    } catch (err) {
      console.error('Error loading comments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load comments');
    }
  };

  const handleCommentAdded = (comment: any) => {
    setComments(prev => [...prev, comment]);
  };

  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = 
      consultation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultation.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultation.author_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || consultation.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || consultation.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="search"
                placeholder="Search consultations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full rounded-lg border border-slate-200 py-2.5 focus:border-rose-500 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-slate-200 py-2.5 px-4 focus:border-rose-500 focus:ring-rose-500"
            >
              <option value="all">All Categories</option>
              <option value="general">General Health</option>
              <option value="mental">Mental Health</option>
              <option value="chronic">Chronic Conditions</option>
              <option value="emergency">Emergency</option>
              <option value="lifestyle">Lifestyle</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'open' | 'resolved')}
              className="rounded-lg border border-slate-200 py-2.5 px-4 focus:border-rose-500 focus:ring-rose-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Consultations List */}
      <div className="space-y-4">
        {filteredConsultations.map((consultation) => (
          <div
            key={consultation.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-slate-900">
                  {consultation.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <User className="h-4 w-4" />
                  <span>{consultation.author_name}</span>
                  {consultation.author_type === 'doctor' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      Doctor
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(consultation.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrivacyChange(consultation.id, !consultation.is_private)}
                  className={`p-2 rounded-lg transition-colors ${
                    consultation.is_private
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }`}
                  title={consultation.is_private ? 'Make Public' : 'Make Private'}
                >
                  {consultation.is_private ? (
                    <Lock className="h-5 w-5" />
                  ) : (
                    <Globe className="h-5 w-5" />
                  )}
                </button>

                <button
                  onClick={() => handleStatusChange(
                    consultation.id,
                    consultation.status === 'open' ? 'resolved' : 'open'
                  )}
                  className={`p-2 rounded-lg transition-colors ${
                    consultation.status === 'resolved'
                      ? 'bg-green-100 text-green-600 hover:bg-green-200'
                      : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                  }`}
                  title={consultation.status === 'resolved' ? 'Mark as Open' : 'Mark as Resolved'}
                >
                  {consultation.status === 'resolved' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                </button>

                <button
                  onClick={() => handleDeleteConsultation(consultation.id)}
                  className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                  title="Delete Consultation"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div 
              className="text-slate-600 line-clamp-2 cursor-pointer hover:text-slate-900"
              onClick={() => handleConsultationClick(consultation)}
            >
              {consultation.content}
            </div>

            <div className="flex flex-wrap gap-2">
              {consultation.tags.map((tag, index) => (
                <span
                  key={`${consultation.id}-tag-${index}`}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700"
                >
                  <TagIcon className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {consultation.response_count} responses
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  consultation.status === 'resolved'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {consultation.status === 'resolved' ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Resolved
                    </>
                  ) : (
                    'Open'
                  )}
                </span>
              </div>

              <span className="flex items-center gap-1 text-sm text-slate-500">
                {consultation.is_private ? (
                  <>
                    <Lock className="h-4 w-4" />
                    Private
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4" />
                    Public
                  </>
                )}
              </span>
            </div>
          </div>
        ))}

        {filteredConsultations.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
            <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No consultations found</p>
          </div>
        )}
      </div>

      {/* Consultation Detail Modal */}
      {selectedConsultation && adminUser && (
        <ConsultationDetail
          post={selectedConsultation}
          comments={comments}
          currentUser={{
            id: adminUser.id,
            fullName: 'Admin',
            isDoctor: true
          }}
          onClose={() => setSelectedConsultation(null)}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </div>
  );
}