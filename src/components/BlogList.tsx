import { BlogPost } from '../types';
import { Calendar, User, Tag } from 'lucide-react';

interface BlogListProps {
  posts: BlogPost[];
  onPostClick?: (post: BlogPost) => void;
}

export function BlogList({ posts, onPostClick }: BlogListProps) {
  return (
    <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <article
          key={post.id}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
          onClick={() => onPostClick?.(post)}
        >
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>

            <h2 className="text-xl font-semibold text-slate-900 line-clamp-2">
              {post.title}
            </h2>
            
            <p className="text-slate-600 line-clamp-3">
              {post.excerpt}
            </p>

            <div className="flex items-center justify-between text-sm text-slate-500">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{post.date}</span>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}