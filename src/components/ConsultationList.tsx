import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle, 
  FilterIcon, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle, 
  Clock, 
  User, 
  Plus, 
  Calendar, 
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { LoadingSpinner } from './LoadingSpinner';
import { SkeletonLoader } from './SkeletonLoader';
import type { Post } from '../types';

interface ConsultationListProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
  currentUserId?: string;
  onAuthorClick?: (authorId: string) => void;
}

export function ConsultationList({ 
  posts, 
  onPostClick, 
  currentUserId,
  onAuthorClick 
}: ConsultationListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [localPosts, setLocalPosts] = useState<Post[]>(posts);
  const [isLiking, setIsLiking] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    try {
      const lastPost = localPosts[localPosts.length - 1];
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .gt('created_at', lastPost.created_at)
        .order('created_at')
        .limit(PAGE_SIZE);

      if (error) throw error;
      
      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      }
      
      setLocalPosts(prev => [...prev, ...data]);
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const { triggerRef } = useInfiniteScroll({
    loadMore,
    hasMore,
    loading: isLoadingMore
  });

  useEffect(() => {
    if (posts.length === 0) return;

    const loadCommentCounts = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('consultation_responses')
          .select('consultation_id')
          .in('consultation_id', posts.map(p => p.id));

        if (error) throw error;

        const counts: Record<string, number> = {};
        data.forEach(response => {
          counts[response.consultation_id] = (counts[response.consultation_id] || 0) + 1;
        });
        setCommentCounts(counts);
      } catch (err) {
        console.error('Error loading comment counts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCommentCounts();
  }, [posts]);

  useEffect(() => {
    if (!currentUserId) return;

    const loadLikedPosts = async () => {
      try {
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', currentUserId);

        if (likes) {
          setLikedPosts(new Set(likes.map(like => like.post_id)));
        }
      } catch (err) {
        console.error('Error loading liked posts:', err);
      }
    };

    loadLikedPosts();
  }, [currentUserId]);

  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  const handleLike = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    if (!currentUserId || isLiking[postId]) return;

    try {
      setIsLiking(prev => ({ ...prev, [postId]: true }));
      const isLiked = likedPosts.has(postId);

      if (isLiked) {
        const { error: deleteError } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUserId);

        if (deleteError) throw deleteError;

        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });

        setLocalPosts(prev =>
          prev.map(post =>
            post.id === postId
              ? { ...post, likes: Math.max(0, (post.likes || 0) - 1) }
              : post
          )
        );
      } else {
        const { error: insertError } = await supabase
          .from('post_likes')
          .insert([{
            post_id: postId,
            user_id: currentUserId
          }]);

        if (insertError) throw insertError;

        setLikedPosts(prev => new Set([...prev, postId]));
        setLocalPosts(prev =>
          prev.map(post =>
            post.id === postId
              ? { ...post, likes: (post.likes || 0) + 1 }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error updating like:', error);
      if (likedPosts.has(postId)) {
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        setLikedPosts(prev => new Set([...prev, postId]));
      }
    } finally {
      setIsLiking(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleAuthorClick = (e: React.MouseEvent, authorId: string) => {
    e.stopPropagation();
    if (onAuthorClick) {
      onAuthorClick(authorId);
    }
  };

  const filteredPosts = localPosts
    .filter(post => {
      if (selectedCategory === null) return true;
      return post.category === selectedCategory;
    })
    .filter(post => {
      if (selectedStatus === null) return true;
      return post.status === selectedStatus;
    })
    .filter(post => {
      return !post.is_private || post.author_id === currentUserId;
    })
    .filter(post => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower) ||
        post.author_name.toLowerCase().includes(searchLower) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const hasActiveFilters = selectedCategory !== null || selectedStatus !== null;

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="search"
              placeholder="Search consultations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-rose-500 focus:ring-rose-500"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <FilterIcon className="h-4 w-4" />
              <span>Filters</span>
              {showFilters ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedStatus(null);
                }}
                className="text-sm text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Filter Controls */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Category Filter */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <FilterIcon className="h-4 w-4" />
                        Category
                      </label>
                      <select
                        value={selectedCategory || ''}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-rose-500 focus:ring-rose-500"
                      >
                        <option value="">All Categories</option>
                        <option value="general">General Health</option>
                        <option value="mental">Mental Health</option>
                        <option value="chronic">Chronic Conditions</option>
                        <option value="emergency">Emergency</option>
                        <option value="lifestyle">Lifestyle</option>
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Status
                      </label>
                      <select
                        value={selectedStatus || ''}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-rose-500 focus:ring-rose-500"
                      >
                        <option value="">All Status</option>
                        <option value="open">Open</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>

                  {/* Active Filters Display */}
                  {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {selectedCategory !== null && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400">
                          Category: {selectedCategory}
                        </span>
                      )}
                      {selectedStatus !== null && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400">
                          Status: {selectedStatus}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonLoader key={i} type="card" />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">No consultations found</p>
          </div>
        ) : (
          <>
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 cursor-pointer" onClick={() => onPostClick(post)}>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <button
                          onClick={(e) => handleAuthorClick(e, post.author_id)}
                          className="flex items-center gap-2 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        >
                          <User className="h-4 w-4" />
                          <span>{post.author_name}</span>
                          {post.author_type === 'doctor' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                              Doctor
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                    {post.is_private && (
                      <MoreVertical className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 line-clamp-2 cursor-pointer" onClick={() => onPostClick(post)}>
                    {post.content}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                        <MessageCircle className="h-4 w-4" />
                        {commentCounts[post.id] || 0}
                      </span>
                      <button
                        onClick={(e) => handleLike(e, post.id)}
                        disabled={isLiking[post.id]}
                        className={`flex items-center gap-1 text-sm transition-colors ${
                          likedPosts.has(post.id)
                            ? 'text-rose-600 hover:text-rose-700 dark:text-rose-500 dark:hover:text-rose-400'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                        } ${isLiking[post.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Calendar className="h-4 w-4" />
                        {post.likes || 0}
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                      <Clock className="h-4 w-4" />
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </article>
            ))}
            
            {/* Infinite Scroll Trigger */}
            <div ref={triggerRef} className="infinite-scroll-trigger">
              {isLoadingMore && (
                <div className="flex justify-center">
                  <LoadingSpinner size="small" />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}