import React, { useState } from 'react';
import { 
  Ban, 
  CheckCircle,
  Edit,
  Search,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { UserManagementModal } from './UserManagementModal';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  full_name: string;
  email: string;
  reputation_score: number;
  is_banned?: boolean;
  ban_expires_at?: string | null;
  total_posts: number;
  total_solutions: number;
}

interface UserManagementTableProps {
  users: User[];
  onRefresh: () => void;
}

export function UserManagementTable({ users, onRefresh }: UserManagementTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof User>('full_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showBannedOnly, setShowBannedOnly] = useState(false);

  const handleSort = (field: keyof User) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = 
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (showBannedOnly) {
        return matchesSearch && user.is_banned;
      }
      return matchesSearch;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
      
      return 0;
    });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="search"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-rose-500 focus:ring-rose-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBannedOnly(!showBannedOnly)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
              showBannedOnly
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Ban className="h-5 w-5" />
            {showBannedOnly ? 'Show All' : 'Show Banned'}
          </button>
          <button
            onClick={() => handleSort('reputation_score')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <ArrowUpDown className="h-5 w-5" />
            Sort by Points
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-slate-900">
                        {user.full_name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {user.reputation_score || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.is_banned ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <Ban className="w-3 h-3 mr-1" />
                        Banned
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-500">
                      Posts: {user.total_posts || 0}
                      <br />
                      Solutions: {user.total_solutions || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="flex items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Management Modal */}
      {selectedUser && (
        <UserManagementModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={() => {
            onRefresh();
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}