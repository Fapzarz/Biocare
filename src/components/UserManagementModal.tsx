import React, { useState } from 'react';
import { 
  Ban, 
  Clock, 
  Plus, 
  Minus, 
  History,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UserManagementModalProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    reputation_score: number;
    is_banned?: boolean;
    ban_expires_at?: string | null;
  };
  onClose: () => void;
  onUpdate: () => void;
}

export function UserManagementModal({ user, onClose, onUpdate }: UserManagementModalProps) {
  const [points, setPoints] = useState(user.reputation_score);
  const [isBanned, setIsBanned] = useState(user.is_banned || false);
  const [banDuration, setBanDuration] = useState<'temporary' | 'permanent'>('temporary');
  const [banEndDate, setBanEndDate] = useState<string>(
    user.ban_expires_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionHistory, setActionHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const loadActionHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_actions')
        .select('*')
        .eq('target_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActionHistory(data || []);
    } catch (err) {
      console.error('Error loading action history:', err);
    }
  };

  const handlePointsChange = (amount: number) => {
    const newPoints = Math.max(0, points + amount);
    setPoints(newPoints);
  };

  const handleBanToggle = () => {
    if (!isBanned) {
      setShowConfirmation(true);
    } else {
      setIsBanned(false);
    }
  };

  const handleConfirmBan = () => {
    setIsBanned(true);
    setShowConfirmation(false);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Start a transaction
      const { data: { user: admin } } = await supabase.auth.getUser();
      if (!admin) throw new Error('Admin not found');

      // Update user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          reputation_score: points,
          is_banned: isBanned,
          ban_expires_at: isBanned && banDuration === 'temporary' ? banEndDate : null,
          ban_reason: isBanned ? 'Administrative action' : null
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Log admin action
      const { error: logError } = await supabase
        .from('admin_actions')
        .insert([{
          target_user_id: user.id,
          admin_id: admin.id,
          action_type: isBanned ? 'ban' : points !== user.reputation_score ? 'points_update' : 'unban',
          points_changed: points - user.reputation_score,
          details: isBanned 
            ? `Banned user ${banDuration === 'permanent' ? 'permanently' : `until ${banEndDate}`}`
            : points !== user.reputation_score 
              ? `Updated points from ${user.reputation_score} to ${points}`
              : 'Removed ban',
          previous_points: user.reputation_score,
          new_points: points
        }]);

      if (logError) throw logError;

      onUpdate();
      onClose();
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Manage User
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {user.fullName} ({user.email})
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Points Management */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Reputation Points
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handlePointsChange(-10)}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              >
                <Minus className="h-5 w-5 text-red-600" />
              </button>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(Math.max(0, parseInt(e.target.value) || 0))}
                className="block w-24 rounded-lg border border-slate-200 px-4 py-2.5 text-center focus:border-rose-500 focus:ring-rose-500"
              />
              <button
                onClick={() => handlePointsChange(10)}
                className="p-2 hover:bg-green-100 rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5 text-green-600" />
              </button>
            </div>
          </div>

          {/* Ban Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">
                Account Status
              </label>
              <button
                onClick={handleBanToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isBanned
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Ban className="h-4 w-4" />
                {isBanned ? 'Remove Ban' : 'Ban User'}
              </button>
            </div>

            {isBanned && (
              <div className="space-y-4 bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={banDuration === 'temporary'}
                      onChange={() => setBanDuration('temporary')}
                      className="rounded-full border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span className="ml-2 text-sm text-slate-600">
                      Temporary Ban
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={banDuration === 'permanent'}
                      onChange={() => setBanDuration('permanent')}
                      className="rounded-full border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span className="ml-2 text-sm text-slate-600">
                      Permanent Ban
                    </span>
                  </label>
                </div>

                {banDuration === 'temporary' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Ban End Date
                    </label>
                    <input
                      type="date"
                      value={banEndDate}
                      onChange={(e) => setBanEndDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="block w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-rose-500 focus:ring-rose-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action History */}
          <div>
            <button
              onClick={() => {
                setShowHistory(!showHistory);
                if (!showHistory) {
                  loadActionHistory();
                }
              }}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
            >
              <History className="h-4 w-4" />
              {showHistory ? 'Hide History' : 'Show History'}
            </button>

            {showHistory && (
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                {actionHistory.map((action) => (
                  <div
                    key={action.id}
                    className="text-sm p-2 rounded-lg bg-slate-50"
                  >
                    <div className="flex justify-between text-slate-600">
                      <span>{action.action_type}</span>
                      <span>{new Date(action.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-700">{action.details}</p>
                    {action.points_changed !== 0 && (
                      <p className="text-sm text-slate-500">
                        Points: {action.previous_points} → {action.new_points}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 bg-rose-600 text-white py-2.5 rounded-lg font-medium hover:bg-rose-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-lg font-medium hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Confirm Ban</h3>
            </div>
            
            <p className="text-slate-600">
              Are you sure you want to ban this user? This will prevent them from accessing most features of the platform.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={handleConfirmBan}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Yes, Ban User
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}