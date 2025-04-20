import { useState, useEffect } from 'react';
import { 
  User, 
  Award, 
  MessageCircle, 
  CheckCircle, 
  ThumbsUp,
  Edit,
  Save,
  X,
  Phone,
  Mail,
  Building,
  Stethoscope,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types';
import { DoctorVerificationForm } from './DoctorVerificationForm';
import { VerificationStatus } from './VerificationStatus';
import { BadgeProgress } from './BadgeProgress';
import { BadgeNotification } from './BadgeNotification';
import { LoadingSpinner } from './LoadingSpinner';
import { DirectMessage } from './DirectMessage';

interface ProfilePageProps {
  userId: string;
  currentUserId: string;
  onBack?: () => void;
}

export function ProfilePage({ userId, currentUserId, onBack }: ProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [showDirectMessage, setShowDirectMessage] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phoneNumber: '',
    bio: '',
    specialization: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newBadge, setNewBadge] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, [userId]);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setNotFound(false);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          achievements:user_achievements(
            id,
            badge_id,
            level,
            awarded_at,
            badge:user_badges(
              name,
              description,
              icon_name,
              required_score
            )
          )
        `)
        .eq('id', userId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          setNotFound(true);
          return;
        }
        throw profileError;
      }

      // Get consultation statistics
      const { data: stats, error: statsError } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('id', userId)
        .single();
      
      // If user_statistics doesn't exist, create it
      if (statsError && statsError.code === 'PGRST116') {
        // Create default stats for the user
        await supabase.from('user_statistics').insert({
          id: userId,
          reputation_score: 0,
          total_consultations: 0,
          solutions_provided: 0,
          last_active: new Date().toISOString()
        });
        
        // Set default stats
        setProfile({
          ...profileData,
          badges: profileData.achievements || [],
          reputation: 0,
          total_posts: 0,
          total_solutions: 0
        });
      } else if (statsError) {
        throw statsError;
      } else {
        setProfile({
          ...profileData,
          badges: profileData.achievements || [],
          reputation: stats?.reputation_score || 0,
          total_posts: stats?.total_consultations || 0,
          total_solutions: stats?.solutions_provided || 0
        });
      }

      setEditForm({
        fullName: profileData.full_name || '',
        phoneNumber: profileData.phone_number || '',
        bio: profileData.bio || '',
        specialization: profileData.specialization || ''
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.fullName,
          phone_number: editForm.phoneNumber,
          bio: editForm.bio,
          specialization: profile?.isDoctor ? editForm.specialization : null
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      await loadProfileData();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Profile Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            The profile you're looking for doesn't exist or has been removed.
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        Profile not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors mb-4"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
      )}

      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-rose-500 to-purple-500 flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="block w-full rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2.5 text-lg font-semibold focus:border-rose-500 focus:ring-rose-500 dark:bg-slate-700 dark:text-slate-100"
                />
              ) : (
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {profile.fullName}
                </h1>
              )}
              <div className="flex items-center gap-2 mt-1">
                {profile.isDoctor && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    <Stethoscope className="w-3 h-3 mr-1" />
                    Doctor
                  </span>
                )}
                {profile.verificationStatus === 'verified' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {userId === currentUserId ? (
              isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center px-3 py-2 border border-slate-200 dark:border-slate-600 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-2 border border-slate-200 dark:border-slate-600 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Profile
                </button>
              )
            ) : (
              <button
                onClick={() => setShowDirectMessage(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Send Message
              </button>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Mail className="h-4 w-4" />
              <span>{profile.email}</span>
            </div>
            {isEditing ? (
              <div className="mt-2">
                <input
                  type="tel"
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                  placeholder="Phone number"
                  className="block w-full rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2.5 text-sm focus:border-rose-500 focus:ring-rose-500 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>
            ) : profile.phoneNumber && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-2">
                <Phone className="h-4 w-4" />
                <span>{profile.phoneNumber}</span>
              </div>
            )}
          </div>
          {profile.isDoctor && (
            <div>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editForm.specialization}
                    onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                    placeholder="Specialization"
                    className="block w-full rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2.5 text-sm focus:border-rose-500 focus:ring-rose-500 dark:bg-slate-700 dark:text-slate-100"
                  />
                </div>
              ) : profile.specialization && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Building className="h-4 w-4" />
                  <span>{profile.specialization}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            About
          </label>
          {isEditing ? (
            <textarea
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              rows={4}
              className="block w-full rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2.5 text-sm focus:border-rose-500 focus:ring-rose-500 dark:bg-slate-700 dark:text-slate-100"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {profile.bio || 'No bio provided'}
            </p>
          )}
        </div>
      </div>

      {/* Verification Status */}
      {(userId === currentUserId && !profile.isDoctor) && (
        <VerificationStatus
          status={profile.verificationStatus || 'unverified'}
          onRequestVerification={() => setShowVerificationForm(true)}
        />
      )}

      {/* Statistics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Reputation</p>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-500">{profile.reputation}</p>
            </div>
            <Award className="h-8 w-8 text-rose-200 dark:text-rose-800" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Consultations</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-500">{profile.total_posts}</p>
            </div>
            <MessageCircle className="h-8 w-8 text-purple-200 dark:text-purple-800" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Solutions</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-500">{profile.total_solutions}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-200 dark:text-green-800" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Likes Received</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                {profile.badges && Array.isArray(profile.badges) ? 
                  profile.badges.reduce((total, badge: any) => {
                    return total + (badge.level || 0);
                  }, 0) : 0}
              </p>
            </div>
            <ThumbsUp className="h-8 w-8 text-blue-200 dark:text-blue-800" />
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Achievements</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {profile.badges && Array.isArray(profile.badges) && profile.badges.map((achievement: any) => (
            <BadgeProgress
              key={achievement.id}
              badge={{
                name: achievement.badge?.name || '',
                description: achievement.badge?.description || '',
                icon_name: achievement.badge?.icon_name || '',
                required_score: achievement.badge?.required_score || 0,
                current_level: achievement.level || 0,
                progress: profile.reputation || 0
              }}
            />
          ))}
          {(!profile.badges || profile.badges.length === 0) && (
            <div className="col-span-2 text-center py-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400">No achievements yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Doctor Verification Form */}
      {showVerificationForm && (
        <DoctorVerificationForm
          userId={userId}
          onClose={() => setShowVerificationForm(false)}
          onSubmit={() => {
            loadProfileData();
            setShowVerificationForm(false);
          }}
        />
      )}

      {/* Badge Notification */}
      {newBadge && (
        <BadgeNotification
          badge={newBadge}
          onClose={() => setNewBadge(null)}
        />
      )}

      {/* Direct Message Modal */}
      {showDirectMessage && profile && (
        <DirectMessage
          currentUserId={currentUserId}
          recipientId={profile.id}
          recipientName={profile.fullName}
          onClose={() => setShowDirectMessage(false)}
        />
      )}
    </div>
  );
}