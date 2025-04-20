import React, { useState } from 'react';
import { Send, Tag as TagIcon, Lock, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Post } from '../types';

interface ConsultationFormProps {
  onSubmit: (post: Post) => void;
  onCancel: () => void;
  currentUser: {
    id: string;
    fullName: string;
    isDoctor?: boolean;
  };
}

export function ConsultationForm({ onSubmit, onCancel, currentUser }: ConsultationFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [isPrivate, setIsPrivate] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: 'general', label: 'General Health' },
    { id: 'mental', label: 'Mental Health' },
    { id: 'chronic', label: 'Chronic Conditions' },
    { id: 'emergency', label: 'Emergency' },
    { id: 'lifestyle', label: 'Lifestyle & Wellness' }
  ];

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      if (!title.trim()) throw new Error('Title is required');
      if (!content.trim()) throw new Error('Content is required');
      if (!category) throw new Error('Category is required');

      const post: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'likes'> = {
        title: title.trim(),
        content: content.trim(),
        author_id: currentUser.id,
        author_name: currentUser.fullName,
        author_type: currentUser.isDoctor ? 'doctor' : 'user',
        category,
        status: 'open',
        is_private: isPrivate,
        tags
      };

      const { data, error: submitError } = await supabase
        .from('posts')
        .insert([post])
        .select()
        .single();

      if (submitError) throw submitError;

      onSubmit(data as Post);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create consultation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-slate-900">
              Ask for Health Consultation
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="text-slate-500 hover:text-slate-700"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your health concern?"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-rose-500 focus:ring-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-rose-500 focus:ring-rose-500"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                placeholder="Describe your symptoms or health concerns in detail..."
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-rose-500 focus:ring-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-rose-100 text-rose-700"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1.5 text-rose-600 hover:text-rose-800"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add relevant tags"
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 focus:border-rose-500 focus:ring-rose-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <TagIcon className="h-5 w-5 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsPrivate(!isPrivate)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isPrivate 
                    ? 'bg-rose-100 text-rose-700' 
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {isPrivate ? (
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
              </button>
              <span className="text-sm text-slate-500">
                {isPrivate 
                  ? 'Only you and doctors can see this consultation'
                  : 'Anyone can see and respond to this consultation'
                }
              </span>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 bg-rose-600 text-white py-2.5 rounded-lg font-medium hover:bg-rose-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  Submit Question
                  <Send className="h-4 w-4" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-lg font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}