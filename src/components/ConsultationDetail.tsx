import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  ThumbsUp, 
  Tag as TagIcon, 
  Lock, 
  User, 
  Clock, 
  CheckCircle,
  X,
  Send,
  Award,
  ChevronLeft
} from 'lucide-react';
import type { Post, Comment } from '../types';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface ConsultationDetailProps {
  post: Post;
  comments: Comment[];
  currentUser: {
    id: string;
    fullName: string;
    isDoctor?: boolean;
  };
  onClose: () => void;
  onCommentAdded: (comment: Comment) => void;
  onAuthorClick?: (authorId: string) => void;
}

export function ConsultationDetail({ 
  post, 
  comments: initialComments, 
  currentUser,
  onClose,
  onCommentAdded,
  onAuthorClick
}: ConsultationDetailProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLiking, setIsLiking] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isMobile] = useState(() => window.innerWidth < 768);

  const handleAuthorClick = (authorId: string) => {
    if (onAuthorClick) {
      onAuthorClick(authorId);
    }
  };

  // Load user profile and badges
  useEffect(() => {
    loadUserData();
  }, [currentUser.id, post.author_id]);

  // Load liked comments and subscribe to changes
  useEffect(() => {
    if (!currentUser.id) return;
    
    loadLikedComments();
    
    const channel = supabase
      .channel('likes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comment_likes',
          filter: `user_id=eq.${currentUser.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLikedComments(prev => new Set([...prev, payload.new.comment_id]));
          } else if (payload.eventType === 'DELETE') {
            setLikedComments(prev => {
              const newSet = new Set(prev);
              newSet.delete(payload.old.comment_id);
              return newSet;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser.id]);

  const loadUserData = async () => {
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profile) {
        setUserProfile(profile);
      }

      // Get user badges
      const { data: achievements } = await supabase
        .from('user_achievements')
        .select(`
          badge_id,
          level,
          user_badges (
            name,
            description,
            icon_name
          )
        `)
        .eq('user_id', post.author_id);

      if (achievements) {
        setUserBadges(achievements);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadLikedComments = async () => {
    try {
      const { data: likes, error } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', currentUser.id);

      if (error) throw error;

      if (likes) {
        setLikedComments(new Set(likes.map(like => like.comment_id)));
      }
    } catch (err) {
      console.error('Error loading liked comments:', err);
    }
  };

  const handleLike = async (e: React.MouseEvent, commentId: string) => {
    e.stopPropagation();
    if (!currentUser.id || isLiking[commentId]) return;

    try {
      setIsLiking(prev => ({ ...prev, [commentId]: true }));
      const isLiked = likedComments.has(commentId);

      if (isLiked) {
        // Unlike: Delete the like
        const { error: deleteError } = await supabase
          .from('comment_likes')
          .delete()
          .match({ 
            comment_id: commentId, 
            user_id: currentUser.id 
          });

        if (deleteError) throw deleteError;

        // Update local state
        setLikedComments(prev => {
          const newSet = new Set(prev);
          newSet.delete(commentId);
          return newSet;
        });

        // Update comment likes count
        setComments(prev =>
          prev.map(comment =>
            comment.id === commentId
              ? { ...comment, likes: Math.max(0, (comment.likes || 0) - 1) }
              : comment
          )
        );
      } else {
        // Check if user already liked this comment
        const { data: existingLikes, error: checkError } = await supabase
          .from('comment_likes')
          .select('id')
          .match({ 
            comment_id: commentId, 
            user_id: currentUser.id 
          });

        if (checkError) throw checkError;

        // If like already exists, don't add another
        if (existingLikes && existingLikes.length > 0) {
          setLikedComments(prev => new Set([...prev, commentId]));
          return;
        }

        // Like: Insert new like
        const { error: insertError } = await supabase
          .from('comment_likes')
          .insert([{
            comment_id: commentId,
            user_id: currentUser.id
          }]);

        if (insertError) throw insertError;

        // Update local state
        setLikedComments(prev => new Set([...prev, commentId]));
        setComments(prev =>
          prev.map(comment =>
            comment.id === commentId
              ? { ...comment, likes: (comment.likes || 0) + 1 }
              : comment
          )
        );
      }
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert any optimistic updates
      await loadLikedComments(); // Reload actual like state
    } finally {
      setIsLiking(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      if (!newComment.trim()) {
        throw new Error('Comment cannot be empty');
      }

      const comment = {
        consultation_id: post.id,
        author_id: currentUser.id,
        author_name: currentUser.fullName,
        author_type: userProfile?.is_doctor ? 'doctor' : 'user',
        content: newComment.trim(),
        is_solution: false,
        likes: 0
      };

      const { data, error: submitError } = await supabase
        .from('consultation_responses')
        .insert([comment])
        .select()
        .single();

      if (submitError) throw submitError;

      onCommentAdded(data as Comment);
      setComments(prev => [...prev, data as Comment]);
      setNewComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: isMobile ? 1 : 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: isMobile ? 1 : 0.95 }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start md:items-center justify-center p-0 md:p-4 z-50 overflow-y-auto"
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white dark:bg-slate-800 w-full md:w-auto md:max-w-4xl md:rounded-2xl shadow-xl min-h-screen md:min-h-0 md:max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
            <button
              onClick={onClose}
              className="md:hidden flex items-center gap-2 text-slate-600 dark:text-slate-400"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <button
              onClick={onClose}
              className="hidden md:flex p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          <div className="p-4 md:p-6 space-y-6">
            {/* Post Content */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {post.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <button
                    onClick={() => handleAuthorClick(post.author_id)}
                    className="flex items-center gap-2 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span>{post.author_name}</span>
                    {post.author_type === 'doctor' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400">
                        Doctor
                      </span>
                    )}
                  </button>
                  {userBadges.map((badge, index) => (
                    <span
                      key={`badge-${badge.badge_id}-${badge.level}-${index}`}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400"
                      title={`${badge.user_badges.name} - Level ${badge.level}`}
                    >
                      <Award className="h-3 w-3 mr-1" />
                      {badge.user_badges.name}
                    </span>
                  ))}
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                  {post.is_private && (
                    <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                      <Lock className="h-4 w-4" />
                      Private
                    </span>
                  )}
                </div>
              </div>

              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300">{post.content}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={`tag-${index}`}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400"
                  >
                    <TagIcon className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {comments.length} comments
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  {post.likes} likes
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  post.status === 'resolved'
                    ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                    : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400'
                }`}>
                  {post.status === 'resolved' ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Resolved
                    </>
                  ) : (
                    'Open'
                  )}
                </span>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Comments
              </h3>

              <div className="space-y-4">
                {comments.map((comment, index) => {
                  const isLiked = likedComments.has(comment.id);
                  return (
                    <div
                      key={`comment-${comment.id}-${index}`}
                      className={`p-4 rounded-lg ${
                        comment.is_solution
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50'
                          : 'bg-slate-50 dark:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm">
                          <button
                            onClick={() => handleAuthorClick(comment.author_id)}
                            className="flex items-center gap-2 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                          >
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {comment.author_name}
                            </span>
                            {comment.author_type === 'doctor' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400">
                                Doctor
                              </span>
                            )}
                          </button>
                          {comment.is_solution && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Solution
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <button 
                          onClick={(e) => handleLike(e, comment.id)}
                          disabled={isLiking[comment.id]}
                          className={`flex items-center gap-1 transition-colors ${
                            isLiked 
                              ? 'text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300' 
                              : 'hover:text-slate-700 dark:hover:text-slate-300'
                          } ${isLiking[comment.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          {comment.likes || 0}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {comments.length === 0 && (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                    No comments yet
                  </p>
                )}
              </div>

              {/* Add Comment */}
              <form onSubmit={handleSubmitComment} className="space-y-4">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="sr-only">Add a comment</label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    placeholder="Add your response..."
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-rose-500 focus:ring-rose-500"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      'Posting...'
                    ) : (
                      <>
                        Post Response
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}