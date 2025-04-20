import React, { useState } from 'react';
import { BlogPost } from '../types';
import { Image as ImageIcon, Plus, X } from 'lucide-react';

interface BlogEditorProps {
  onSave: (post: BlogPost) => void;
  onCancel: () => void;
  initialPost?: BlogPost;
}

export function BlogEditor({ onSave, onCancel, initialPost }: BlogEditorProps) {
  const [post, setPost] = useState<BlogPost>(
    initialPost || {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      excerpt: '',
      imageUrl: '',
      author: '',
      date: new Date().toISOString().split('T')[0],
      tags: []
    }
  );
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePost = () => {
    if (!post.title.trim()) throw new Error('Title is required');
    if (!post.content.trim()) throw new Error('Content is required');
    if (!post.excerpt.trim()) throw new Error('Excerpt is required');
    if (!post.imageUrl.trim()) throw new Error('Image URL is required');
    if (!post.author.trim()) throw new Error('Author is required');
    if (!post.date) throw new Error('Date is required');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      validatePost();
      
      // Format the post data
      const formattedPost: BlogPost = {
        ...post,
        date: new Date(post.date).toISOString(),
        tags: post.tags.filter(tag => tag.trim() !== '') // Remove empty tags
      };
      
      await onSave(formattedPost);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save blog post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag && !post.tags.includes(newTag)) {
      setPost({ ...post, tags: [...post.tags, newTag] });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPost({ ...post, tags: post.tags.filter(tag => tag !== tagToRemove) });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-slate-900">
              {initialPost ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
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
                value={post.title}
                onChange={(e) => setPost({ ...post, title: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-rose-500 focus:ring-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Image URL
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={post.imageUrl}
                  onChange={(e) => setPost({ ...post, imageUrl: e.target.value })}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 focus:border-rose-500 focus:ring-rose-500"
                  required
                />
                <button
                  type="button"
                  className="px-4 py-2.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <ImageIcon className="h-5 w-5 text-slate-600" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Excerpt
              </label>
              <input
                type="text"
                value={post.excerpt}
                onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-rose-500 focus:ring-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Content
              </label>
              <textarea
                value={post.content}
                onChange={(e) => setPost({ ...post, content: e.target.value })}
                rows={8}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-rose-500 focus:ring-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-rose-100 text-rose-700"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-rose-900"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 focus:border-rose-500 focus:ring-rose-500"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <Plus className="h-5 w-5 text-slate-600" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Author
              </label>
              <input
                type="text"
                value={post.author}
                onChange={(e) => setPost({ ...post, author: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-rose-500 focus:ring-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={post.date.split('T')[0]}
                onChange={(e) => setPost({ ...post, date: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 focus:border-rose-500 focus:ring-rose-500"
                required
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-rose-600 text-white py-2.5 rounded-lg font-medium hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Post'}
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